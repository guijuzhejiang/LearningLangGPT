'use server'
import {createHmac} from 'crypto';
import {signIn} from '@/auth'
import {User} from '@/lib/types'
import {AuthError} from 'next-auth'
import {z} from 'zod'
import {kv} from '@vercel/kv'
import {getStringFromBuffer, ResultCode} from '@/lib/utils'
import * as process from "node:process";
import {createUser} from "@/app/signup/actions";
import * as $OpenApi from "@alicloud/openapi-client";
import Dysmsapi20170525 from "@alicloud/dysmsapi20170525";
import * as Util from "@alicloud/tea-util";
import * as $Dysmsapi20170525 from "@alicloud/dysmsapi20170525";

export async function getUser(email: string) {
    const user = await kv.hgetall<User>(`user:${email}`)
    return user
}

interface Result {
    type: string
    resultCode: ResultCode
}

export async function authenticate(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    try {
        const email = formData.get('email')
        const password = formData.get('password')

        const parsedCredentials = z
            .object({
                email: z.string().email(),
                password: z.string().min(6)
            })
            .safeParse({
                email,
                password
            })

        if (parsedCredentials.success) {
            await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            return {
                type: 'success',
                resultCode: ResultCode.UserLoggedIn
            }
        } else {
            return {
                type: 'error',
                resultCode: ResultCode.InvalidCredentials
            }
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        type: 'error',
                        resultCode: ResultCode.InvalidCredentials
                    }
                default:
                    return {
                        type: 'error',
                        resultCode: ResultCode.UnknownError
                    }
            }
        }
    }
}


export async function wechatLogin(code: string, state: string) {
    'use server'
    let userNickName = '';
    const response = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_LOGIN_APPID}&secret=${process.env.WECHAT_LOGIN_SECRET}&code=${code}&grant_type=authorization_code`);
    if (response.status === 200) {
        const wechat_data = await response.json()
        if (wechat_data.hasOwnProperty('errcode') || !wechat_data.hasOwnProperty('openid')) {
            return {
                type: 'error',
                resultCode: ResultCode.InvalidCredentials
            }
        }
        // get user info
        try {
            const uInfoResponse = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${wechat_data["access_token"]}&openid=${wechat_data["openid"]}`);
            if (uInfoResponse.status == 200) {
                const wechatUserInfo = await uInfoResponse.json();
                userNickName = wechatUserInfo['nickname']
            }
        } catch (e) {
        }

        const email = `${wechat_data['openid']}@wechat.com`;
        const password = createHmac('sha256', process.env.WECHAT_LOGIN_SECRET_KEY)
            .update(email)
            .digest('hex');

        const salt = crypto.randomUUID()

        const encoder = new TextEncoder()
        const saltedPassword = encoder.encode(password + salt)
        const hashedPasswordBuffer = await crypto.subtle.digest(
            'SHA-256',
            saltedPassword
        )
        const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

        try {
            const result = await createUser(email, hashedPassword, salt, userNickName)

            if (result.resultCode === ResultCode.UserCreated || result.resultCode === ResultCode.UserAlreadyExists) {
                await signIn('credentials', {
                    email,
                    password,
                    redirect: false
                })
            }
            if (result.resultCode === ResultCode.UserAlreadyExists) {
                result.resultCode = ResultCode.UserLoggedIn;
                result.type = "success";
            }
            return result;
        } catch (error) {
            if (error instanceof AuthError) {
                switch (error.type) {
                    case 'CredentialsSignin':
                        return {
                            type: 'error',
                            resultCode: ResultCode.InvalidCredentials
                        }
                    default:
                        return {
                            type: 'error',
                            resultCode: ResultCode.UnknownError
                        }
                }
            } else {
                return {
                    type: 'error',
                    resultCode: ResultCode.UnknownError
                }
            }
        }
    } else {
        return {
            type: 'error',
            resultCode: ResultCode.UnknownError
        }
    }
}


function generateCaptcha(length: number) {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

export const sendCaptcha = async (phoneNo: string, captchaLen: number) => {
    'use server'
    try {
        const captcha = generateCaptcha(captchaLen)
        console.log(captcha)
        const alicloudConfig = new $OpenApi.Config({
            // 必填，您的 AccessKey ID
            accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
            // 必填，您的 AccessKey Secret
            accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
            endpoint: `dysmsapi.aliyuncs.com`,
        });
        // 特化请求客户端
        const dysmsapiClient = new Dysmsapi20170525(alicloudConfig);
        // 创建RuntimeObject实例并设置运行参数。
        const runtime = new Util.RuntimeOptions({});
        // 构造请求对象
        const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
            phoneNumbers: phoneNo,
            signName: "幻景AI",
            templateCode: process.env.ALIBABA_TEMPLATE_CODE,
            templateParam: JSON.stringify({"code": captcha})
        })
        try {
            // 复制代码运行请自行打印 API 的返回值
            const res = await dysmsapiClient.sendSmsWithOptions(sendSmsRequest, runtime);
            console.log(res);

            if (res.body.code === "OK") {
                try {
                    await kv.set(phoneNo, captcha, {ex: 300});

                } catch (kvErr) {
                    console.log(kvErr)
                    // Handle errors
                }
                return {success: true}
            } else {
                return {success: false}
            }
        } catch (error) {
            // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
            // 错误 message
            console.log(error.message);
            return {success: false}
        }

    } catch (e) {
        console.log(e);
        return {success: false}
    }
}

export const verifyCaptcha = async (phoneNo: string, code: string) => {
    'use server'
    try {
        try {
            const res = await kv.get(phoneNo);

            if (res) {
                const email = `${phoneNo}@sms.com`
                const password = createHmac('sha256', process.env.WECHAT_LOGIN_SECRET_KEY)
                    .update(phoneNo)
                    .digest('hex');

                const salt = crypto.randomUUID()
                const encoder = new TextEncoder()
                const saltedPassword = encoder.encode(password + salt)
                const hashedPasswordBuffer = await crypto.subtle.digest(
                    'SHA-256',
                    saltedPassword
                )
                const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

                try {
                    const result = await createUser(email, hashedPassword, salt, phoneNo.replace("+86", ""))

                    if (result.resultCode === ResultCode.UserCreated || result.resultCode === ResultCode.UserAlreadyExists) {
                        await signIn('credentials', {
                            email,
                            password,
                            redirect: false
                        })
                    }
                    if (result.resultCode === ResultCode.UserAlreadyExists) {
                        result.resultCode = ResultCode.UserLoggedIn;
                        result.type = "success";
                    }

                    try {
                        kv.del(phoneNo)
                    } catch (e) {

                    }
                    return result;
                } catch (error) {
                    if (error instanceof AuthError) {
                        switch (error.type) {
                            case 'CredentialsSignin':
                                return {
                                    type: 'error',
                                    resultCode: ResultCode.InvalidCredentials
                                }
                            default:
                                return {
                                    type: 'error',
                                    resultCode: ResultCode.UnknownError
                                }
                        }
                    } else {
                        return {
                            type: 'error',
                            resultCode: ResultCode.UnknownError
                        }
                    }
                }
            } else {
                return {
                    type: 'error',
                    resultCode: ResultCode.UnknownError
                }
            }
        } catch (error) {
            return {
                type: 'error',
                resultCode: ResultCode.UnknownError
            }
        }
    } catch (e) {
        return {
            type: 'error',
            resultCode: ResultCode.UnknownError
        }
    }
}
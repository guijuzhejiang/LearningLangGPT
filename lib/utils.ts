import {clsx, type ClassValue} from 'clsx'
import {customAlphabet} from 'nanoid'
import {twMerge} from 'tailwind-merge'
import Cookies from "js-cookie";
import {ChatParams} from "@/lib/chat/actions";
import {promises as fs} from "fs";
import { exec } from 'promisify-child-process';
// import { promisify } from 'util';
// const execAsync = promisify(exec);

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    7
) // 7-character random string

export async function fetcher<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
): Promise<JSON> {
    const res = await fetch(input, init)

    if (!res.ok) {
        const json = await res.json()
        if (json.error) {
            const error = new Error(json.error) as Error & {
                status: number
            }
            error.status = res.status
            throw error
        } else {
            throw new Error('An unexpected error occurred')
        }
    }

    return res.json()
}

export function formatDate(input: string | number | Date): string {
    const date = new Date(input)
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
}

export const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value)

export const runAsyncFnWithoutBlocking = (
    fn: (...args: any) => Promise<any>
) => {
    fn()
}

export const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

export const getStringFromBuffer = (buffer: ArrayBuffer) =>
    Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

export enum ResultCode {
    InvalidCredentials = 'INVALID_CREDENTIALS',
    InvalidSubmission = 'INVALID_SUBMISSION',
    UserAlreadyExists = 'USER_ALREADY_EXISTS',
    UnknownError = 'UNKNOWN_ERROR',
    UserCreated = 'USER_CREATED',
    UserLoggedIn = 'USER_LOGGED_IN'
}

export const getMessageFromCode = (resultCode: string) => {
    switch (resultCode) {
        case ResultCode.InvalidCredentials:
            return '密码错误!'
        case ResultCode.InvalidSubmission:
            return 'Invalid submission, please try again!'
        case ResultCode.UserAlreadyExists:
            return '用户已存在,请登录'
        case ResultCode.UserCreated:
            return '注册成功!'
        case ResultCode.UnknownError:
            return '遇到了错误, 请重试!'
        case ResultCode.UserLoggedIn:
            return '登录成功!'
    }
}


export function checkUserMediaAudio() {
    try {
        if (navigator.mediaDevices.getUserMedia) {
            // 请求获取音频流
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(function (stream) {
                    return stream;
                })
                .catch(function (err) {
                    console.log('Error:', err);
                    return false;
                });
        } else {
            console.log('getUserMedia not supported on your browser!');
            return false;
        }
    } catch (error) {
        // 如果出现错误，可能是用户拒绝了权限请求或者设备不可用
        console.error('Error accessing microphone:', error);
        return false;
    }
}

export function pauseAllAudio() {
    try {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => audio.pause());
    } catch (error) {
        // 如果出现错误，可能是用户拒绝了权限请求或者设备不可用
        console.error('Error pauseAllAudio:', error);
    }
}

export function stopAllAudio() {
    try {
        const audioElements = document.querySelectorAll('.tts-btn-stop');
        audioElements.forEach(audio => {
            // audio.pause();
            // audio.currentTime = 0;
            // audio.removeEventListener("canplay", ()=>{});
            audio.click()
        });
    } catch (error) {
        // 如果出现错误，可能是用户拒绝了权限请求或者设备不可用
        console.error('Error pauseAllAudio:', error);
    }
}

export function arrayBufferToAudioBuffer(arrayBuffer, context) {
    return new Promise((resolve, reject) => {
        if (context) {
            if (Object.prototype.toString.call(context) !==
                '[object AudioContext]') {
                throw new TypeError('`context` must be an AudioContext')
            }
        } else {
            if (typeof window !== 'undefined') {
                context = new (window.AudioContext ||
                    window.webkitAudioContext)
            }
        }

        context.decodeAudioData(arrayBuffer, function (data) {
            resolve(data)
        }, reject)
    })
}

export function cacheUserCookies(uid:string, cid:string, userData: ChatParams) {
    Cookies.set(uid==="default"? "chat_default":`chat_${uid}_${cid}`, JSON.stringify(userData), { expires: 365 });
}

export function loadCacheUserCookies(uid:string, cid:string) {
    const userSession = Cookies.get(uid==="default"? "chat_default":`chat_${uid}_${cid}`)
    // console.log("asdasdxcaedfgeqg");
    // console.log(uid);
    // console.log(cid);
    if (userSession) {
        console.log(JSON.parse(userSession));

    }
    return userSession ? JSON.parse(userSession) : {
        teacherName: "Mary",
        teacherGender: "female",
        scene: 0,
        lang: "English",
        level: 0,
    };
}

const defaultConfig = {
    teacherName: 'Mary',
    teacherGender: 'female',
    scene: 0,
    lang: 'English',
    level: 0
}

export function updateUserCookies(uid:string, key:string, value:string) {
    const userSession = Cookies.get("chatsession")
    let userData = {}
    if (userSession) {
        userData = JSON.parse(userSession)
        if (userData.hasOwnProperty(uid)) {
            userData[uid][key] = value;
        } else {
            userData[uid] = defaultConfig;
            userData[uid][key] = value;
        }

    } else {
        userData[uid] = defaultConfig;
        userData[uid][key] = value;
    }
    Cookies.set("chatsession", JSON.stringify(userData), { expires: 365 });
}

export function loadUserCookies(uid:string) {
    let userData = {
        "teacherName": "Mary",
        "teacherGender": "female",
    }
    const userSession = Cookies.get('chatsession');
    if (userSession) {
        userData = JSON.parse(userSession);
        if (userData.hasOwnProperty(uid)) {
            userData = userData[uid];
        }
    }

    return userData;
}

export function toHalfWidth(str: string) {
    return str.replace(/[\uFF01-\uFF5E]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    }).replace(/\u3000/g, ' ');
}

export async function reloadGroqProxy(model, fallbacksModels) {

    try {
        const servers = ["103.45.78.170", "120.233.27.129", "58.32.13.22", "103.45.78.164"]
        const jsonFilePath = "/usr/local/share/shadowsocksr/config.json"
        // console.log("reloadGroqProxy qqqqqqqqqqqqqqqqqqqq");

        for (let i=0;i<servers.length;i++) {
            // console.log("reloadGroqProxy 000000000000000000");

            try {

                const jsonData = JSON.parse(await fs.readFile(jsonFilePath, 'utf8'));
                // console.log("reloadGroqProxy xxxxxxxxxxxxxxxxxxx");

                jsonData.server = servers[i];
                await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2));

                await exec(`ssr stop`);
                await exec(`ssr start`);

                const modelWithFallback = model.withFallbacks({
                    fallbacks: fallbacksModels,
                });
                const result = await modelWithFallback.invoke("test");
                break;
            } catch (e) {
                // console.log("reloadGroqProxy 1111111111111111111111");
                console.log(e);
            }

        }
    } catch (e) {
        // console.log("reloadGroqProxy 22222222222222222222");
        console.log(e);

    }
}

export function isChinese(str:string) {
    const chinesePattern = /[\u4e00-\u9fa5]/;
    return chinesePattern.test(str);
}
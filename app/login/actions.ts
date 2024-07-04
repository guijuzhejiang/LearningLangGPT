'use server'
import { createHmac } from 'crypto';
import { signIn } from '@/auth'
import { User } from '@/lib/types'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { kv } from '@vercel/kv'
import {getStringFromBuffer, ResultCode} from '@/lib/utils'
import * as process from "node:process";
import {createUser} from "@/app/signup/actions";

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


export async function wechatLogin(code:string, state:string) {
  const response = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_LOGIN_APPID}&secret=${process.env.WECHAT_LOGIN_SECRET}&code=123&grant_type=authorization_code`);
  if (response.status === 200) {
    const wechat_data = await response.json()
    console.log("wechat_data!!!!!!!!!!!!!!!!");
    console.log(wechat_data);
    if (wechat_data.hasOwnProperty('errcode') || !wechat_data.hasOwnProperty('openid')) {
      return {
        type: 'error',
        resultCode: ResultCode.InvalidCredentials
      }
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
      const result = await createUser(email, hashedPassword, salt)

      if (result.resultCode === ResultCode.UserCreated || result.resultCode === ResultCode.UserAlreadyExists) {
        await signIn('credentials', {
          email,
          password,
          redirect: false
        })
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
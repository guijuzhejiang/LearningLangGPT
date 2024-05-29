import {clsx, type ClassValue} from 'clsx'
import {customAlphabet} from 'nanoid'
import {twMerge} from 'tailwind-merge'

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
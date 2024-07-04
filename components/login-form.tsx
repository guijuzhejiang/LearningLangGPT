'use client'

import {useFormState, useFormStatus} from 'react-dom'
import {authenticate, wechatLogin} from '@/app/login/actions'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'
import {toast} from 'sonner'
import {IconSpinner} from './ui/icons'
import {getMessageFromCode} from '@/lib/utils'
import {useRouter} from 'next/navigation'
import queryString from 'query-string'
import * as Tabs from '@radix-ui/react-tabs';


export default function LoginForm() {
    const router = useRouter()
    const [result, dispatch] = useFormState(authenticate, undefined)
    const [curLoginMethod, setCurLoginMethod] = useState('wechat')
    const iframeRef = useRef(null)
    const wechatReqUrl = `https://www.guijutech.com/service/wechat/login`;
    const wechatLoginContainerID = "wechatLoginContainer";

    const generateRandomName = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let randomFileName = ''

        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length)
          randomFileName += characters.charAt(randomIndex)
        }

        return randomFileName
      }

    useEffect(() => {
        if (result) {
            if (result.type === 'error') {
                toast.error(getMessageFromCode(result.resultCode))
            } else {
                toast.success(getMessageFromCode(result.resultCode))
                router.refresh()
            }
        }
    }, [result, router])

    useEffect(() => {
        new window.WxLogin({
            self_redirect: true,
            id: wechatLoginContainerID,
            appid: "wx8b7f856da1e0485c",
            scope: 'snsapi_login', // 写死，网页应用暂时只支持这个值
            redirect_uri: `https://zs.guijutech.com/learninglang/login/wechat`, // 扫码成功后重定向地址
            state: generateRandomName(8)// 随机字符串
            // href: initialState?.isLandscape ? '': location.origin + '/WechatWebLogin.css', // 随机字符串
        });

        const iframe = document.getElementById(wechatLoginContainerID).querySelectorAll('iframe')[0]
        iframe.addEventListener('load', async function (event) {
            try {
                const parsed = queryString.parse(iframe + "")
                console.log(parsed);
                const res = await wechatLogin(parsed.code, parsed.state);
                console.log(res);
                if (res.type==='error') {
                    toast.error("登录失败")
                }
            } catch (e) {
                console.log(e);
            }
        })

    }, [])

    return (
        <div className={"w-full flex items-center justify-center"}>
            <Tabs.Root
                className="flex flex-col w-[26.5rem] items-center"
                defaultValue="wechat"
                onValueChange={(value)=>{
                    setCurLoginMethod(value)
                }}
            >
                <Tabs.List className="shrink-0 w-full flex rounded-b-md border-b shadow-md border-mauve6" aria-label="Manage your account">
                    <Tabs.Trigger
                        className="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative outline-none cursor-pointer"
                        value="wechat"
                    >
                        微信
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        className="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative outline-none cursor-pointer"
                        value="account"
                    >
                        账号密码
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content
                    forceMount
                    className={`${curLoginMethod!=='wechat' && 'hidden'} grow outline-none bg-white rounded-b-md flex justify-center w-full pt-4`}
                    value="wechat"
                >
                    <div className={" bg-white"} id={"wechatLoginContainer"} ref={iframeRef}>
                    </div>
                </Tabs.Content>
                <Tabs.Content
                    className={`${curLoginMethod!=='account' && 'hidden'} grow outline-none bg-white flex justify-center w-full border shadow-md pt-4`}
                    value="account"
                >
                    <form
                        action={dispatch}
                    >
                        <div
                            className="w-full flex-1  bg-white px-6 md:w-96 dark:bg-zinc-950">
                            <h1 className="mb-3 text-2xl font-bold">登录</h1>
                            <div className="w-full">
                                <div>
                                    <label
                                        className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                                        htmlFor="email"
                                    >
                                        邮箱地址
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                                            id="email"
                                            type="email"
                                            name="email"
                                            placeholder="输入你的邮箱地址"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label
                                        className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                                        htmlFor="password"
                                    >
                                        密码
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="输入密码"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>
                            <LoginButton/>
                        </div>

                        <Link
                            href="/signup"
                            className="flex flex-row gap-1 text-sm text-zinc-400 justify-center pb-2"
                        >
                            还没有账号? <div className="font-semibold underline">注册</div>
                        </Link>
                    </form>
                </Tabs.Content>
            </Tabs.Root>

        </div>
    )
}

function LoginButton() {
    const {pending} = useFormStatus()

    return (
        <button
            className="my-4 flex h-10 w-full flex-row items-center justify-center rounded-md bg-zinc-900 p-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            aria-disabled={pending}
        >
            {pending ? <IconSpinner/> : '登录'}
        </button>
    )
}

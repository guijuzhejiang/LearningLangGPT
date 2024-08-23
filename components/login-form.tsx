'use client'

import {useFormState, useFormStatus} from 'react-dom'
import {authenticate, verifyCaptcha, wechatLogin} from '@/app/login/actions'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'
import {toast} from 'sonner'
import {IconSpinner} from './ui/icons'
import {cn, getMessageFromCode} from '@/lib/utils'
import {useRouter} from 'next/navigation'
import queryString from 'query-string'
import * as Tabs from '@radix-ui/react-tabs';
import {isValidPhoneNumber} from 'react-phone-number-input'
import {defaultCountries, PhoneInput} from 'react-international-phone'
import 'react-international-phone/style.css'
import {sendCaptcha} from "@/app/login/actions";
import {spinner} from "@/components/stocks";
import {Button} from "@/components/ui/button";
import {useLocale, useTranslations} from "next-intl";

export default function LoginForm() {
    const router = useRouter()
    const [result, dispatch] = useFormState(authenticate, undefined)
    const [curLoginMethod, setCurLoginMethod] = useState('wechat')
    const [code, setCode] = useState('')
    const [state, setState] = useState('')
    const [isPC, setIsPC] = useState(false)
    const iframeRef = useRef(null)

    const t = useTranslations('LoginForm');
    // const l = await getLocale();
    const locale = useLocale();
    // const wechatReqUrl = `https://www.guijutech.com/service/wechat/login`;
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
        if (code) {
            ;(async ()=>{
                const res = await wechatLogin(code, state);
                console.log(code);
                console.log(res);
                if (res.type==='error') {
                    toast.error(t('loginFailedToast'))
                } else {
                    toast.success(t('loginSucceedToast'));
                    router.refresh()
                }
            })()
        }
    }, [code])

    useEffect(() => {
        let ua = navigator.userAgent,
            isWindowsPhone = /(?:Windows Phone)/.test(ua),
            isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
            isAndroid = /(?:Android)/.test(ua),
            isFireFox = /(?:Firefox)/.test(ua),
            isChrome = /(?:Chrome|CriOS)/.test(ua),
            isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
            isPhone = /(?:iPhone)/.test(ua) && !isTablet,
            isPc = !isPhone && !isAndroid && !isSymbian;
        // alert(isPc);
            setIsPC(isPc);
        setCurLoginMethod(isPc ?  'wechat':'phone')

        if (isPc) {
            const wxState = generateRandomName(8);
            setState(wxState)
            new window.WxLogin({
                lang: locale.includes("zh-") ? "cn":"en",
                self_redirect: true,
                id: wechatLoginContainerID,
                appid: process.env.WECHAT_LOGIN_APPID,
                scope: 'snsapi_login', // 写死，网页应用暂时只支持这个值
                redirect_uri: `https://zs.guijutech.com/learninglang/login/wechat`, // 扫码成功后重定向地址
                state: wxState// 随机字符串
                // href: initialState?.isLandscape ? '': location.origin + '/WechatWebLogin.css', // 随机字符串
            });

            const iframe = document.getElementById(wechatLoginContainerID).querySelectorAll('iframe')[0]
            iframe.addEventListener('load', async function (event) {
                try {
                    const parsed = queryString.parse(iframe.contentWindow.location.search)
                    console.log(parsed);
                    setCode(parsed.code)

                } catch (e) {
                    console.log(e);
                }
            })
        }

    }, [])

    return (
        <div className={"w-full flex items-center justify-center"}>

                <Tabs.Root
                    className="flex flex-col w-[26.5rem] items-center"
                    value={curLoginMethod}
                    onValueChange={(value)=>{
                        setCurLoginMethod(value)
                    }}
                >
                    <Tabs.List className="shrink-0 w-full flex rounded-b-md border-b shadow-md border-mauve6" aria-label="Manage your account">
                        <Tabs.Trigger
                            className={`${!isPC && 'hidden'} bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative outline-none cursor-pointer`}
                            value="wechat"
                        >
                            {t('wechatText')}
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            className={`bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative outline-none cursor-pointer`}
                            value="phone"
                        >
                            {t('phoneText')}
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            className="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-[15px] leading-none text-mauve11 select-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative outline-none cursor-pointer"
                            value="account"
                        >
                            {t('passwordText')}
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content
                        forceMount
                        className={`${curLoginMethod!=='wechat' && 'hidden'} grow outline-none bg-white rounded-b-md flex justify-center w-full pt-4 shadow-md`}
                        value="wechat"
                    >
                        <div className={" bg-white"} id={wechatLoginContainerID} ref={iframeRef}>
                        </div>
                    </Tabs.Content>

                    <Tabs.Content
                        forceMount
                        className={`${curLoginMethod !== 'phone' && 'hidden'} grow outline-none bg-white rounded-b-md flex justify-center w-full shadow-md`}
                        value="phone"
                    >
                        <PhoneLogin/>
                    </Tabs.Content>

                    <Tabs.Content
                        className={`${curLoginMethod !== 'account' && 'hidden'} grow outline-none bg-white flex justify-center w-full border shadow-md pt-4`}
                        value="account"
                    >
                        <form
                            action={dispatch}
                        >
                            <div
                                className="w-full flex-1  bg-white px-6 md:w-96 dark:bg-zinc-950 pb-2">
                                <div className="w-full">
                                    <div>
                                        <label
                                            className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                                            htmlFor="email"
                                        >
                                            {t('emailLabel')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                                                id="email"
                                                type="email"
                                                name="email"
                                                placeholder={t('emailPlaceholder')}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label
                                            className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                                            htmlFor="password"
                                        >
                                            {t('emailLabel')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                                                id="password"
                                                type="password"
                                                name="password"
                                                placeholder={t('passwordPlaceholder')}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <LoginButton btnText={t('text')}/>
                            </div>

                            <Link
                                href="/signup"
                                className="flex flex-row gap-1 text-sm text-zinc-400 justify-center pb-2"
                            >
                                {t('registerHint0')} <div className="font-semibold underline">{t('registerHint1')}</div>
                            </Link>
                        </form>
                    </Tabs.Content>
                </Tabs.Root>
        </div>
    )
}

function LoginButton({btnText}) {
    const {pending} = useFormStatus()
    // useEffect(() => {
    //     console.log(btnText);
    // }, []);

    return (
        <Button
            className="my-4 flex h-10 w-full flex-row items-center justify-center rounded-md bg-zinc-900 p-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            aria-disabled={pending}
        >
            {pending ? <IconSpinner/> : <>{btnText+""}</>}
        </Button>
    )
}

function PhoneLogin() {
    const captchaLength = 5;
    const captchaCountdown = 60;
    const phoneLength = 11;
    const [captcha, setCaptcha] = useState(Array.from({length: captchaLength}, (_, index) => ('')))
    const [phoneNo, setPhoneNo] = useState('')
    const [phoneNoValied, setPhoneNoValied] = useState(false)
    const [step, setStep] = useState('phone-input');
    const [requestingCaptcha, setRequestingCaptcha] = useState(false);
    const [requestingCaptchaCountdown, setRequestingCaptchaCountdown] = useState(captchaCountdown);
    const [requestingCaptchaCounting, setRequestingCaptchaCounting] = useState(false);
    const t = useTranslations('LoginForm');
    const locale = useLocale();
    const router = useRouter()

    const handleKeyDown = (e) => {
        if (
            !/^[0-9]{1}$/.test(e.key)
            && e.key !== 'Backspace'
            && e.key !== 'Delete'
            && e.key !== 'Tab'
            && !e.metaKey
        ) {
            e.preventDefault()
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const curIndex = parseInt(e.target.id.split('_').pop());
            if (e.target.value) {
                e.target.value = '';
                captcha[curIndex] = e.target.value
                setCaptcha(captcha);
            } else {
                const curIndex = parseInt(e.target.id.split('_').pop());
                if (curIndex > 0) {
                    const prevCaptcha = document.getElementById(`captcha_${curIndex-1}`)
                    prevCaptcha.value = '';
                    prevCaptcha?.focus();
                    captcha[curIndex-1] = e.target.value
                    setCaptcha(captcha);
                }
            }
        }

        // if (e.key === 'Delete' || e.key === 'Backspace') {
        //     const index = inputs.indexOf(e.target);
        //     if (index > 0) {
        //         inputs[index - 1].value = '';
        //         inputs[index - 1].focus();
        //     }
        // }
    }
    const handleInput = async (e) => {
        const curIndex = parseInt(e.target.id.split('_').pop());
        captcha[curIndex] = e.target.value
        setCaptcha(captcha);
        if (curIndex + 1 < captchaLength) {
            document.getElementById(`captcha_${curIndex + 1}`)?.focus();
        } else {
            try {
                setRequestingCaptcha(true);
                const res = await verifyCaptcha(phoneNo, captcha.join(''))
                setRequestingCaptcha(false);

                if (res.type === 'error') {
                    toast.error(t('captchaWrongToast'));
                    setCaptcha(Array.from({length: captchaLength}, (_, index) => ('')));
                    captcha.map((item,idx)=>{
                        const targetInput = document.getElementById(`captcha_${idx}`);
                        targetInput.value = '';
                        if (idx === 0) {
                            targetInput?.focus();
                        }
                    })
                } else {
                    toast.success(t('loginSucceedToast'));
                    router.refresh()
                }
            } catch (e) {
                console.log(e);
                toast.error(t('loginFailedToast'));
                setRequestingCaptcha(false);
            }

        }
    }

    const handleReqCaptcha = async ()=> {
        if (phoneNoValied && phoneNo.length===14) {
            setRequestingCaptcha(true);
            const res = await sendCaptcha(phoneNo, captchaLength)
            setRequestingCaptcha(false);
            if (res.success) {
                toast.success(t('captchaSendSucceedToast'));
                setStep('captcha-input')

                setRequestingCaptchaCounting(true);
                let targetCount = captchaCountdown;
                const intervalId = setInterval(() => {
                    targetCount--;
                    console.log(targetCount);
                    if (targetCount > 0) {
                        setRequestingCaptchaCountdown(targetCount);
                    } else {
                        setRequestingCaptchaCounting(false);
                        clearInterval(intervalId);
                    }
                }, 1000);
            } else {
                toast.error(t('captchaSendFailedToast'));

            }
        } else {

        }

    }

    const handleProceed = async (e) => {
        e.preventDefault();
        if (step==='phone-input') {
            document.getElementById(`captcha_0`)?.focus();

        }
        await handleReqCaptcha();

    }

    useEffect(() => {
        document.getElementById(`captcha_0`)?.focus();

    }, []);

    return (
        <div
            onKeyDown={() => {
                // const form = document.getElementById('otp-form')
                // const inputs = [...form.querySelectorAll('input[type=text]')]
                // const submit = form.querySelector('button[type=submit]')
                //
                // const handleKeyDown = (e) => {
                //     if (
                //         !/^[0-9]{1}$/.test(e.key)
                //         && e.key !== 'Backspace'
                //         && e.key !== 'Delete'
                //         && e.key !== 'Tab'
                //         && !e.metaKey
                //     ) {
                //         e.preventDefault()
                //     }
                //
                //     if (e.key === 'Delete' || e.key === 'Backspace') {
                //         const index = inputs.indexOf(e.target);
                //         if (index > 0) {
                //             inputs[index].value = '';
                //         }
                //     }
                //
                //     // if (e.key === 'Delete' || e.key === 'Backspace') {
                //     //     const index = inputs.indexOf(e.target);
                //     //     if (index > 0) {
                //     //         inputs[index - 1].value = '';
                //     //         inputs[index - 1].focus();
                //     //     }
                //     // }
                // }
                //

                //
                // const handleFocus = (e) => {
                //     e.target.select()
                // }
                //
                // const handlePaste = (e) => {
                //     e.preventDefault()
                //     const text = e.clipboardData.getData('text')
                //     if (!new RegExp(`^[0-9]{${inputs.length}}$`).test(text)) {
                //         return
                //     }
                //     const digits = text.split('')
                //     inputs.forEach((input, index) => input.value = digits[index])
                //     submit.focus()
                // }
                //
                // inputs.forEach((input) => {
                //     input.addEventListener('input', handleInput)
                //     input.addEventListener('keydown', handleKeyDown)
                //     input.addEventListener('focus', handleFocus)
                //     input.addEventListener('paste', handlePaste)
                // })
            }}
            className="w-full max-w-6xl mx-auto px-4 md:px-6 py-2">
            <div className="flex justify-center">
                <div
                    className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-4">
                    {step === 'phone-input' && (
                        <div onKeyDown={(e)=>{if(e.key==='Enter'){handleProceed(e)}}}>
                            <PhoneInput
                                countries={defaultCountries.filter(country =>
                                    ['cn'].includes(country[1])
                                )}
                                disableCountryGuess={false}
                                disableDialCodeAndPrefix={false}
                                className={phoneNoValied ? "shadow border-2 border-primary" : "w-full shadow border-2 border-red-500"}
                                inputClassName={"w-full"}
                                // countrySelectorStyleProps={{
                                //     buttonClassName: styles.phoneInputDropDownBtn,
                                //     dropdownStyleProps: {listItemClassName: styles.phoneInputDropDownContent}
                                // }}
                                defaultCountry={'cn'}
                                inputProps={{
                                    placeholder: t('phonePlaceholder')
                                }}
                                onChange={(p, {country, inputValue}) => {
                                    const curP = inputValue.replace(/\s/g, '');
                                    setPhoneNo(curP)
                                    const pValied = isValidPhoneNumber(p)
                                    // captchaButtonRef.current.disabled = !pValied
                                    console.log(phoneNo);
                                    setPhoneNoValied(pValied && curP.length===14);
                                }}
                            />
                        </div>
                    )}

                    {step === 'captcha-input' && (
                        <>
                            <header className="mb-8">
                                <h1 className="text-2xl font-bold mb-1">{t('phoneHeader')}</h1>
                                <p className="text-[15px] text-slate-500">{t('phoneHint0')}{captchaLength}{t('phoneHint1')}.</p>
                            </header>
                            <form id="otp-form">
                                <div className="flex items-center justify-center gap-3">
                                    {captcha.map((item, idx) => (
                                        <input
                                            type="text"
                                            key={`captcha_${idx}`}
                                            id={`captcha_${idx}`}
                                            onKeyDown={handleKeyDown}
                                            onFocus={(e) => {
                                                e.target.select()
                                            }}
                                            onInput={handleInput}
                                            className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                            pattern="\d*" maxLength={1}/>
                                    ))}
                                </div>

                            </form>
                        </>
                    )}
                    <div className="mx-auto mt-4">
                        {requestingCaptcha ? (
                            <div className={"my-4 flex h-10 w-full flex-row items-center justify-center rounded-md p-2 text-sm font-semibold"}>
                                {spinner}
                            </div>
                            ):(
                            <Button type="submit"
                                    disabled={requestingCaptchaCounting}
                                    onClick={handleProceed}
                                    className={`my-4 flex h-10 w-full flex-row items-center justify-center rounded-md p-2 text-sm font-semibold ${!requestingCaptchaCounting && phoneNoValied ? 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200' : 'bg-gray-400 text-zinc-100 dark:bg-zinc-100 dark:text-gray-300 dark:hover:bg-zinc-200'}`}
                            >
                                {requestingCaptchaCounting ? (
                                    <>
                                        {requestingCaptchaCountdown}{t('phoneHint2')}
                                    </>
                                    ):(
                                    <>
                                        {`${step==='captcha-input'? t('phoneResend'):t('phoneSend')}`}
                                    </>
                                )}
                            </Button>
                        )}

                    </div>

                    {step === 'captcha-input' && (
                        <div className="text-sm text-slate-500 mt-4"><a
                            onClick={() => setStep('phone-input')}
                            className="cursor-pointer font-medium text-indigo-500 hover:text-indigo-600"
                        >{t('phoneChange0')}</a>&nbsp;{t('phoneChange1')}</div>
                    )}

                </div>
            </div>
        </div>
    );
}

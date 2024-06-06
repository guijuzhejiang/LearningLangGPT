'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import {useActions, useUIState} from 'ai/rsc'
import {UserMessage} from './stocks/message'
import {type AI} from '@/lib/chat/actions'
import {Button} from '@/components/ui/button'
import {
    IconArrowElbow,
    IconPlus,
    IconMicroPhone,
    IconVoiceContinuation,
    IconSpinner, IconClose, IconRefresh, IconHint
} from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import {useEnterSubmit} from '@/lib/hooks/use-enter-submit'
import {nanoid} from 'nanoid'
import {usePathname, useRouter} from 'next/navigation'
import {toast} from "sonner";
import {useEffect} from "react";
import {readStreamableValue} from "ai/rsc";
import {spinner} from "@/components/stocks";


export interface PromptFormProps {
    input: string
    setInput: (value: string) => void
    micOn: boolean
    setMicOn: (value: boolean) => void
    STTIng: boolean
    voiceContinuationEnable: boolean
    setVoiceContinuationEnable: (value: boolean) => void
    userSpeakLately: Date | boolean
    setUserSpeakLately: (value: Date | boolean) => void
    vad: object
}

export function PromptForm({
                               input,
                               setInput,
                               micOn,
                               setMicOn,
                               STTIng,
                               voiceContinuationEnable,
                               setVoiceContinuationEnable,
                               userSpeakLately,
                               setUserSpeakLately,
                               vad
                           }: PromptFormProps) {

    const router = useRouter()
    const {formRef, onKeyDown} = useEnterSubmit()
    const inputRef = React.useRef<HTMLTextAreaElement>(null)
    const {submitUserMessage, getHint} = useActions()
    const [messages, setMessages] = useUIState<typeof AI>()
    const timerRef = React.useRef(null);
    const lastMsgRef = React.useRef(null);
    const [timerInterval, setTimerInterval] = React.useState<any>(null);
    const [lastMessage, setLastMessage] = React.useState<any>(null);
    const [hintContent, setHintContent] = React.useState<any>('');
    const [showHint, setShowHint] = React.useState<boolean>(false);
    // const [_, completed] = useStreamableText(content)
    const [lastMsgCompleted, setLastMsgCompleted] = React.useState<boolean>(false);
    const vadTimeoutMS = 120 * 1000;
    const path = usePathname();


    const handleToggleMic = async (e: any) => {
        e.preventDefault();
        let micAvailable = false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            stream.getTracks().forEach(track => track.stop());
            micAvailable = true;
        } catch (err) {
            // setMicOn(false);
            // vad.stop()
        }
        try {
            if (micAvailable) {
                if (micOn) {
                    vad.stop()
                    // vad.pause();
                    setMicOn(false);
                    setVoiceContinuationEnable(false);

                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        setUserSpeakLately(false);
                    }
                } else {
                    setMicOn(true);
                    vad.start();

                    timerRef.current = setInterval(() => {
                        setTimerInterval(true);

                    }, vadTimeoutMS);
                }
            } else {
                toast.error("麦克风不可用")
            }

        } catch (e) {
            console.log(e);
            toast.error('麦克风开启失败')
        }
    }

    const handleUpdateHint = async (msg) => {
        const lastMsg = "";
        const hintText = await getHint(msg);
        //
        if (typeof hintText === 'object') {
            let value = ''
            for await (const delta of readStreamableValue(hintText)) {
                if (typeof delta === 'string') {
                    setHintContent((value = value + delta))
                }
            }
        }
    }

    useEffect(() => {
        if (timerInterval) {
            setTimerInterval(false);
            const curDate = new Date();
            if (userSpeakLately) {
                const diffInMilliseconds = Math.abs(userSpeakLately.getTime() - curDate.getTime());
                if (diffInMilliseconds > vadTimeoutMS) {
                    vad.stop()
                    setMicOn(false);
                    setVoiceContinuationEnable(false);
                    clearInterval(timerRef.current);
                }
            }
        }
    }, [userSpeakLately, timerInterval])

    React.useEffect(() => {
        console.log("!!!!!!!!")
        if (inputRef.current) {
            inputRef.current.focus()
        }
        timerRef.current = setInterval(() => {
            setTimerInterval(true);
            // if (!userSpeakLately) {
            //     vad.pause()
            //     setMicOn(false);
            //     setVoiceContinuationEnable(false);
            //     clearInterval(timerRef.current);
            // }

            // setUserSpeakLately(false);

        }, vadTimeoutMS);

        if (messages.length > 1 && showHint) {
            ;(async () => {
                setLastMsgCompleted(true);
                await handleUpdateHint(messages[messages.length - 1].display.props.content);
            })()
        }
    }, []);
    //
    useEffect(() => {
        if (lastMessage && showHint) {
            console.log(lastMessage)
            console.log(lastMessage.display.ref?.current?.completed);
            if (lastMessage.display.ref?.current?.completed) {
                setLastMsgCompleted(true);
                ;(async () => {
                    // const finxedMsgs = [];
                    // for (let i = 0; i < messages.length; i++) {
                    //     if (i % 2 === 0) {
                    //         finxedMsgs[i] = {role:'user', content: messages[i]?.display?.props?.children}
                    //     } else {
                    //         finxedMsgs[i] = {role:'assistant', content: messages[i]?.display?.props?.content}
                    //     }
                    // }
                    // console.log("finxedMsgs");
                    // console.log(finxedMsgs);
                    // console.log("lastMessage.display.ref?.current?.text")
                    // console.log(typeof lastMessage.display.ref?.current?.text)
                    await handleUpdateHint(lastMessage.display.ref?.current?.text);
                })()
            } else {
                setLastMsgCompleted(false);
            }
        }
    }, [lastMessage?.display.ref?.current?.completed])

    return (
        <form
            ref={formRef}
            onSubmit={async (e: any) => {
                e.preventDefault()
                setLastMsgCompleted(false);
                // Blur focus on mobile
                if (window.innerWidth < 600) {
                    e.target['message']?.blur()
                }

                const value = input.trim()
                setInput('')
                if (!value) return

                // Optimistically add user message UI
                setMessages(currentMessages => [
                    ...currentMessages,
                    {
                        id: nanoid(),
                        display: <UserMessage>{value}</UserMessage>
                    }
                ])

                // Submit and get response message
                const responseMessage = await submitUserMessage(value)
                responseMessage.display.ref = lastMsgRef;
                // console.log("responseMessage.display.ref?.current.completed");
                // console.log(responseMessage.display.ref?.current?.completed);
                setMessages(currentMessages => [...currentMessages, responseMessage])
                setLastMessage(responseMessage);
            }}
        >
            {/*// className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]"*/}
            <div className={`${(showHint && lastMsgCompleted) ? '':'hidden'} relative duration-300 ease-in-out mb-4 grid gap-2 px-4 sm:px-0`}>
                {/*新建聊天*/}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-1 top-0 size-6 rounded-full bg-background p-0 sm:right-2"
                            onClick={async () => {
                                setShowHint(false);
                            }}
                        >
                            <IconClose/>
                            <span className="sr-only">关闭提示</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>关闭提示</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-9 top-0 size-6 rounded-full bg-background p-0 sm:right-10"
                            onClick={async (e) => {
                                e.preventDefault()

                                console.log(showHint && lastMsgCompleted);
                                console.log(showHint);
                                console.log(lastMsgCompleted);
                                setHintContent('');
                                await handleUpdateHint(messages[messages.length - 1].display.props.content);
                            }}
                        >
                            <IconRefresh/>
                            <span className="sr-only">刷新</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>刷新</TooltipContent>
                </Tooltip>

                {/*<h5>不知道回复什么?</h5>*/}

                <div
                    key={"example.heading"}
                    className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 'hidden md:block'`}
                    onClick={async (e) => {
                        e.preventDefault();
                        // setLastMsgCompleted(false);
                        if (voiceContinuationEnable) {
                            setHintContent('');
                            setMessages(currentMessages => [
                                ...currentMessages,
                                {
                                    id: nanoid(),
                                    display: <UserMessage>{hintContent}</UserMessage>
                                }
                            ])

                            const responseMessage = await submitUserMessage(
                                hintContent
                            )
                            responseMessage.display.ref = lastMsgRef;
                            setMessages(currentMessages => [...currentMessages, responseMessage])
                            setLastMessage(responseMessage);
                        } else {
                            setInput(hintContent);
                        }
                    }}
                >
                    <div className="text-sm text-zinc-600">
                        {hintContent.length > 0 ? (
                            hintContent
                        ) : (
                            spinner
                        )}
                    </div>
                </div>
            </div>

            <div
                className="relative flex max-h-60 w-full grow flex-col bg-background px-8 sm:rounded-md sm:border sm:px-12">

                {/*新建聊天*/}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
                            onClick={() => {
                                router.push('/new')
                            }}
                        >
                            <IconPlus/>
                            <span className="sr-only">新建对话</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>新建对话</TooltipContent>
                </Tooltip>

                {/*输入内容*/}
                <Textarea
                    ref={inputRef}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    disabled={micOn ? STTIng : false}
                    placeholder={voiceContinuationEnable ? "正在听..." : "发送消息."}
                    className={`min-h-[60px] w-full resize-none bg-transparent pl-2 ${(micOn && !voiceContinuationEnable) ? 'pr-[5.59rem]' : 'pr-12'} py-[1.3rem] focus-within:outline-none sm:text-sm`}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    name="message"
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />

                {/* 右边div */}
                <div className="absolute right-0 top-[13px] sm:right-4 z-50">
                    {/*提示*/}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`${showHint && 'hidden'} bg-yellow-100 hover:bg-yellow-200 z-50 absolute -right-1 -top-14 size-6 rounded-full p-0 sm:-right-0`}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    setShowHint(true);
                                    setLastMsgCompleted(true);
                                    if (hintContent.length === 0) {
                                        await handleUpdateHint(messages[messages.length - 1].display.props.content);
                                    }
                                }}
                            >
                                <IconHint/>
                                <span className="sr-only">不知道回复什么?点击打开提示</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>不知道回复什么?点击打开提示</TooltipContent>
                    </Tooltip>

                    {/*提交按钮*/}
                    <Tooltip>
                        <TooltipTrigger asChild className={`${voiceContinuationEnable && ('hidden')}`}>
                            <Button type="submit" size="icon" disabled={input === ''}>
                                <IconArrowElbow/>
                                <span className="sr-only">发送</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>发送</TooltipContent>
                    </Tooltip>

                    {/*语音*/}
                    <Tooltip>
                        <TooltipTrigger asChild className="ml-1">
                            {
                                vad.loading ? (
                                    <Button size="icon">
                                        <IconSpinner/>
                                        <span className="sr-only">语音转文字</span>
                                    </Button>
                                ) : (
                                    <Button className={micOn ? "" : "bg-gray-400 opti"} size="icon"
                                            onClick={handleToggleMic}>
                                        <IconMicroPhone
                                            className={vad.userSpeaking && micOn ? "text-blue-400" : ""}/>
                                        <span className="sr-only">语音转文字</span>
                                    </Button>
                                )
                            }

                        </TooltipTrigger>
                        <TooltipContent>语音转文字</TooltipContent>
                    </Tooltip>

                    {/*只有语音*/}
                    <Tooltip>
                        <TooltipTrigger asChild className={`ml-1 ${!micOn && ('hidden')}`}>
                            <Button className={voiceContinuationEnable ? "" : "bg-gray-400 opti"}
                                    size="icon"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (!path.includes('chat')) {
                                            sessionStorage.setItem("fromRoot", "true")
                                        }
                                        setVoiceContinuationEnable(!voiceContinuationEnable);
                                    }}
                            >
                                <IconVoiceContinuation/>
                                <span className="sr-only">自动语音</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>自动语音</TooltipContent>
                    </Tooltip>
                </div>

                <div
                    className={`absolute left-0 top-0 w-full h-full bg-yellow-600 bg-opacity-10 ${voiceContinuationEnable ? ('block') : ((!STTIng || !micOn) && ('hidden'))}`}>
                </div>
            </div>
        </form>
    )
}

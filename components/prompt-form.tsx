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
    IconSpinner
} from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import {useEnterSubmit} from '@/lib/hooks/use-enter-submit'
import {nanoid} from 'nanoid'
import {useRouter} from 'next/navigation'
import {toast} from "sonner";
import {useEffect} from "react";


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
    const {submitUserMessage} = useActions()
    const [_, setMessages] = useUIState<typeof AI>()
    const timerRef = React.useRef(null);
    const [timerInterval, setTimerInterval] = React.useState<any>(null);
    const vadTimeoutMS = 120 * 1000;

    const handleToggleMic = async (e: any) => {
        e.preventDefault();

        let micAvailable = false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            micAvailable = true;
            setMicOn(true);
            vad.start()
        } catch (err) {
            setMicOn(false);
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

                    timerRef.current =setInterval(() => {
                        setTimerInterval(true);
                        // if (!userSpeakLately) {
                        //     vad.pause()
                        //     setMicOn(false);
                        //     setVoiceContinuationEnable(false);
                        //     clearInterval(timerRef.current);
                        // }

                        // setUserSpeakLately(false);

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


    useEffect(() => {
        if (timerInterval) {
            setTimerInterval(false);
            const curDate = new Date();
            if (userSpeakLately) {
                const diffInMilliseconds = Math.abs(userSpeakLately.getTime() - curDate.getTime());
                if (diffInMilliseconds>vadTimeoutMS) {
                    vad.stop()
                    setMicOn(false);
                    setVoiceContinuationEnable(false);
                    clearInterval(timerRef.current);
                }
            }
        }
    },[userSpeakLately, timerInterval])

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
        timerRef.current =setInterval(() => {
            setTimerInterval(true);
            // if (!userSpeakLately) {
            //     vad.pause()
            //     setMicOn(false);
            //     setVoiceContinuationEnable(false);
            //     clearInterval(timerRef.current);
            // }

            // setUserSpeakLately(false);

        }, vadTimeoutMS);
    }, [])

    return (
        <form
            ref={formRef}
            onSubmit={async (e: any) => {
                e.preventDefault()

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
                setMessages(currentMessages => [...currentMessages, responseMessage])
            }}
        >
            <div
                className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">

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
                    disabled={micOn ? STTIng:false}
                    placeholder={voiceContinuationEnable ? "正在听...":"发送消息."}
                    className={`min-h-[60px] w-full resize-none bg-transparent pl-2 pr-${micOn && !voiceContinuationEnable ? '16':'14'} py-[1.3rem] focus-within:outline-none sm:text-sm`}
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
                    {/*提交按钮*/}
                    <Tooltip>
                        <TooltipTrigger asChild className={`${voiceContinuationEnable && ('hidden')}`}>
                            <Button type="submit" size="icon" disabled={input === ''}>
                                <IconArrowElbow />
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
                                ):(
                                    <Button className={micOn ? "":"bg-gray-400 opti"} size="icon" onClick={handleToggleMic}>
                                        <IconMicroPhone className={vad.userSpeaking && micOn ? "text-blue-400":""}/>
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
                            <Button className={voiceContinuationEnable ? "":"bg-gray-400 opti"} size="icon" onClick={(e)=>{e.preventDefault();setVoiceContinuationEnable(!voiceContinuationEnable);}} >
                                <IconVoiceContinuation/>
                                <span className="sr-only">自动语音</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>自动语音</TooltipContent>
                    </Tooltip>
                </div>

                <div
                    className={`absolute left-0 top-0 w-full h-full bg-yellow-600 bg-opacity-10 ${voiceContinuationEnable ? ('block'):((!STTIng || !micOn) && ('hidden'))}`}>
                </div>
            </div>
        </form>
    )
}

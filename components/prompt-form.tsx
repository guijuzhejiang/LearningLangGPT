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
    IconSpinner, IconClose, IconRefresh, IconHint, IconPlayMedia, IconTranslate, IconStop
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
import {stopAllAudio} from "@/lib/utils";


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
    voiceText: string
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
                               voiceText,
                               vad
                           }: PromptFormProps) {

    const router = useRouter()
    const {formRef, onKeyDown} = useEnterSubmit()
    const inputRef = React.useRef<HTMLTextAreaElement>(null)
    const {submitUserMessage, getHint, translate} = useActions()
    const [messages, setMessages] = useUIState<typeof AI>()
    const timerRef = React.useRef(null);
    const lastMsgRef = React.useRef(null);
    const [timerInterval, setTimerInterval] = React.useState<any>(null);
    const [lastMessage, setLastMessage] = React.useState<any>(null);
    const [hintContent, setHintContent] = React.useState<any>('');
    const [showHint, setShowHint] = React.useState<boolean>(false);
    const [gettingHint, setGettingHint] = React.useState<boolean>(false);
    const [readingLoud, setReadingLoud] = React.useState<boolean>(false)
    const [canPlayThrough, setCanPlayThrough] = React.useState(false)
    const [canPlay, setCanPlay] = React.useState(false)
    const [transTexts, setTransTexts] = React.useState('')
    const [showTranslate, setShowTranslate] = React.useState(false);

    const audioRef = React.useRef(null);
    const vadTimeoutMS = 120 * 1000;
    const path = usePathname();


    const handleCanPlay = (e) => {
        console.log(e);
        if (e.target) {
            const element = e.target as HTMLMediaElement;
            element.play();
            element.removeEventListener('canplay', handleCanPlay);
        }
    }


    const handleTTS = () => {
        if (canPlay) {
            // console.log(audioRef.current);
            if (!readingLoud) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } else {
            const formData = new FormData();
            formData.append('text', hintContent);
            const startTime = performance.now();
            fetch(process.env.TTS_URL, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    } else {
                        toast.error('Failed to generate voice');
                    }
                })
                .then(wavBuffer => {
                    setCanPlay(true);
                    audioRef.current = new Audio("data:audio/wav;base64,"+wavBuffer);
                    audioRef.current.addEventListener('canplay', handleCanPlay);
                    audioRef.current.addEventListener('pause', ()=> setReadingLoud(false));
                    audioRef.current.addEventListener('ended', ()=> setReadingLoud(false));
                    audioRef.current.addEventListener('canplaythrough', ()=> setCanPlayThrough(true));
                    console.log("tts elapsed " + (performance.now() - startTime) + 'ms')
                })
                .catch(error => {
                    toast.error('Failed to generate voice');
                });
        }
    }

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
        setGettingHint(true);
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
        setGettingHint(false);
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
        // console.log("!!!!!!!!")
        if (inputRef.current) {
            inputRef.current.focus()
        }
        timerRef.current = setInterval(() => {
            setTimerInterval(true);
        }, vadTimeoutMS);

        if (messages.length > 1 && showHint) {
            ;(async () => {
                await handleUpdateHint(messages[messages.length - 1].display.props.content);
            })()
        }
    }, []);
    //
    useEffect(() => {
        console.log("!xxxxxxxxxxx!!!!!!!!!!!!")
        console.log(messages[messages.length-1])
        if (showHint) {
            if (lastMessage?.display?.ref?.current?.completed) {
                ;(async () => {
                    await handleUpdateHint(lastMessage.display.ref?.current?.text);
                })()
            }

            if (voiceContinuationEnable) {
                ;(async () => {
                    await handleUpdateHint(voiceText);
                })()
            }
        }
    }, [voiceText, lastMessage?.display.ref?.current?.completed])

    return (
        <form
            ref={formRef}
            onSubmit={async (e: any) => {
                e.preventDefault()
                setHintContent('');
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
                setMessages(currentMessages => [...currentMessages, responseMessage])
                setLastMessage(responseMessage);
            }}
        >
            {/*// className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]"*/}
            <div className={`${(showHint && messages.length > 1) ? '':'hidden'} relative duration-300 ease-in-out mb-4 grid gap-2 px-4 sm:px-0`}>
                <div className={"absolute right-1 -top-3 sm:right-2"}>
                    {/* 播放 tts */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={hintContent.length===0 || gettingHint}
                                className={`${readingLoud && canPlayThrough && ('tts-btn-stop')} bg-blue-50 hover:bg-blue-200 size-6 rounded-full p-0 mr-1`}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    stopAllAudio();
                                    setReadingLoud(!readingLoud);
                                    handleTTS();
                                }}
                            >
                                {readingLoud ? (
                                    canPlayThrough ? (<IconStop className="size-4"/>) : (spinner)
                                ) : (
                                    <IconPlayMedia className="size-4"/>
                                )}
                                <span className="sr-only">{readingLoud ? ("停止") : ("朗读")}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>朗读</TooltipContent>
                    </Tooltip>

                    {/* 翻译 */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={hintContent.length===0 || gettingHint}
                                className="bg-blue-50 hover:bg-blue-200 size-6 rounded-full p-0 mr-1"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    setShowTranslate(true);
                                    const translatedText = await translate(hintContent);
                                    if (typeof translatedText === 'object') {
                                        let value = ''
                                        for await (const delta of readStreamableValue(translatedText)) {
                                            if (typeof delta === 'string') {
                                                setTransTexts((value = value + delta))
                                            }
                                        }
                                    } else {
                                        setTransTexts(translatedText)
                                    }
                                }}
                            >
                                <IconTranslate/>
                                <span className="sr-only">翻译</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>翻译</TooltipContent>
                    </Tooltip>

                    {/* 刷新 */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-green-50 hover:bg-green-200 size-6 rounded-full p-0 mr-1"
                                onClick={async (e) => {
                                    e.preventDefault()

                                    if (audioRef.current) {
                                        audioRef.current.pause();
                                        audioRef.current.currentTime = 0;
                                    }

                                    setTransTexts('');
                                    setShowTranslate(false);
                                    setCanPlay(false);
                                    setCanPlayThrough(false);
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

                    {/* 关闭提示 */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-red-50 hover:bg-red-200 size-6 rounded-full p-0 mr-1"
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

                </div>

                {/*<h5>不知道回复什么?</h5>*/}

                <div
                    key={"example.heading"}
                    className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 'hidden md:block'`}
                    onClick={async (e) => {
                        e.preventDefault();
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

                    <div className={`${showTranslate ? '':'hidden'} text-sm text-zinc-600 bg-yellow-50 bg-opacity-40`}>
                        {transTexts.length > 0 ? (
                            transTexts
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
                                className={`${messages.length<2 && 'hidden'} ${showHint && 'hidden'} bg-yellow-100 hover:bg-yellow-200 z-50 absolute -right-1 -top-14 size-6 rounded-full p-0 sm:-right-0`}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    setShowHint(true);
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

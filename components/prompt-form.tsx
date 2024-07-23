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
    IconSpinner,
    IconClose,
    IconRefresh,
    IconHint,
    IconPlayMedia,
    IconTranslate,
    IconStop,
    IconExit,
    IconBackground, IconScoreSheet
} from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import {useEnterSubmit} from '@/lib/hooks/use-enter-submit'
import {nanoid} from 'nanoid'
import {usePathname, useRouter} from 'next/navigation'
import {toast} from "sonner";
import {useEffect, useState} from "react";
import {readStreamableValue} from "ai/rsc";
import {spinner} from "@/components/stocks";
import {loadCacheUserCookies, loadUserCookies, pauseAllAudio, stopAllAudio} from "@/lib/utils";
import {useMicVAD, utils} from "@ray8716397/vad-react";
import {getChat, saveCountDown} from "@/app/actions";
import {BackgroundDialog} from "@/components/background-style-dialog";
import {ScoreSheetDialog} from "@/components/score-sheet-dialog";
import {Chat} from "@/lib/types";


export interface PromptFormProps {
    chatId?: string,
    userId?: string,
    backgroundStyleRef?: React.Ref<any>,
    chatOpacity?: number,
    setChatOpacity?: (value: number) => void,
    remainingSecs?: number,
    setChatRemainingTime: (value: number) => void,
    handleBg?: ()=>void,
    chat?: Chat
}

export function PromptForm({
                               chatId,
                               userId,
                               backgroundStyleRef,
                               chatOpacity,
                               setChatOpacity,
                               remainingSecs,
                               setChatRemainingTime,
                               handleBg,
                               chat
                           }: PromptFormProps) {

    const router = useRouter()
    const {formRef, onKeyDown} = useEnterSubmit()
    const inputRef = React.useRef<HTMLTextAreaElement>(null)
    const {submitUserMessage, abortStreaming, getHint, translate} = useActions()
    const [messages, setMessages] = useUIState<typeof AI>()
    const timerRef = React.useRef(null);
    const lastMsgRef = React.useRef(null);
    const [timerInterval, setTimerInterval] = React.useState<any>(null);
    const [lastMessage, setLastMessage] = React.useState<any>(null);
    const [hintContent, setHintContent] = React.useState<any>('');
    const [showHint, setShowHint] = React.useState<boolean>(true);
    const [gettingHint, setGettingHint] = React.useState<boolean>(false);
    const [readingLoud, setReadingLoud] = React.useState<boolean>(false)
    const [canPlayThrough, setCanPlayThrough] = React.useState(false)
    const [canPlay, setCanPlay] = React.useState(false)
    const [transTexts, setTransTexts] = React.useState('')
    const [showTranslate, setShowTranslate] = React.useState(false);
    const [finished, setFinished] = React.useState(remainingSecs===0);

    const audioRef = React.useRef(null);
    const vadTimeoutMS = 120 * 1000;
    const path = usePathname();

    const [input, setInput] = React.useState('');

    /* PART VAD */
    // mic 是否可用
    // const [micAvailable, setMicAvailable] = React.useState(false)
    // mic 是否打开
    const [micOn, setMicOn] = React.useState(true)
    // 是否正在处理STT
    const [STTIng, setSTTIng] = React.useState(false)
    // 持续讲话模式
    const [voiceContinuationEnable, setVoiceContinuationEnable] = React.useState(false)
    // stt文本
    const [voiceText, setVoiceText] = React.useState('');
    // wav float32数组缓存
    const [audioBuffer, setAudioBuffer] = React.useState([]);
    // 1min有没有讲话
    const [userSpeakLately, setUserSpeakLately] = React.useState<Date>(new Date());
    const [userAudioMedia, setUserAudioMedia] = React.useState(null);

    const handleKeyDown = async (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ): void => {
        if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault()
            await handleUseHint(event)
        }
    }

    const handleUseHint = async (e) => {
        try {
            e.preventDefault();

        } catch (e) {

        }

        if (voiceContinuationEnable) {
            setHintContent('');
            setShowTranslate(false);
            setMessages(currentMessages => [
                ...currentMessages,
                {
                    id: nanoid(),
                    display: <UserMessage>{hintContent}</UserMessage>
                }
            ])

            const responseMessage = await submitUserMessage(
                hintContent,
                null,
                remainingSecs
            )
            responseMessage.display.ref = lastMsgRef;
            setMessages(currentMessages => [...currentMessages, responseMessage])
            setLastMessage(responseMessage);
        } else {
            setInput(hintContent);
            inputRef?.current?.focus();
        }
    }

    useEffect(() => {
        // 在状态变化后打印最新的值
        // console.log('input updated:', voiceText);
        if (voiceContinuationEnable) {
            // console.log("voiceContinuationEnable:" + voiceContinuationEnable)
            const asyncSubmit = async () => {
                const value = (input + voiceText).trim()
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
                const responseMessage = await submitUserMessage(value, null, remainingSecs)
                setMessages(currentMessages => [...currentMessages, responseMessage])
            }
            asyncSubmit();
        } else {
            setInput(input + voiceText);
        }
        setSTTIng(false)
    }, [voiceText]);

    useEffect(() => {
        console.log(remainingSecs)
        if (remainingSecs === 0) {
            setMicOn(false);
            setShowHint(false);
            setVoiceContinuationEnable(false);
            setHintContent('');
            setInput('');
            setFinished(true);
            toast.info("本次学习已结束")
            saveCountDown(chatId, 0);
            document.getElementById(`score-btn-${chatId}`)?.click();
            vad.stop();
        }
    }, [remainingSecs]);

    useEffect(() => {
        const checkMicrophone = async () => {
            // (await getChat(chatId, userId))?.chatParams
            try {
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                stream.getTracks().forEach(track => track.stop());
                // setMicAvailable(true);
                setMicOn(true);
                // vad.start();
            } catch (err) {
                // setMicAvailable(false);
                setMicOn(false);
                // vad.stop()
            }
        };

        if (remainingSecs !== 0) {
            checkMicrophone();
        }


        if (sessionStorage.getItem("fromRoot")) {
            sessionStorage.removeItem("fromRoot");
            setVoiceContinuationEnable(true);
        }

    }, []);

    useEffect(() => {
        if (audioBuffer.length > 0) {
            const formData = new FormData();
            audioBuffer.map((wavBuf, i) => {
                const wavBlob = new Blob([wavBuf], {type: 'audio/wav'});
                formData.append('wavFiles', wavBlob, 'audio.wav');
            });

            const startTime = performance.now();
            fetch(process.env.STT_URL, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    setAudioBuffer([])
                    if (response.ok) {
                        return response.json();
                    } else {
                        toast.error('Failed to upload');
                    }
                })
                .then(data => {
                    if (data.success) {
                        // console.log(data.result.text);
                        setVoiceText(data.result.text);
                        // if (voiceContinuationEnable) {
                        //     console.log("voiceContinuationEnable:" + voiceContinuationEnable)
                        //     formRef.current.dispatchEvent(new Event('submit', { bubbles: true }));
                        // }
                    } else {
                        toast.error('failed');
                    }

                    console.log("stt elapsed " + (performance.now() - startTime) + 'ms')
                })
                .catch(error => {
                    toast.error('Failed to upload');
                    setAudioBuffer([])
                    console.error('上传错误:', error);
                });
        } else {
            // console.log('State changed in silenceDurationMS seconds!!!!!!!!!!!!!!!!!');
        }

    }, [audioBuffer]);

    const vad = useMicVAD({
        workletURL: '/learninglang/vad/vad.worklet.bundle.min.js',
        modelURL: '/learninglang/vad/silero_vad.onnx',
        startOnLoad: remainingSecs!==0,
        positiveSpeechThreshold: 0.8,
        negativeSpeechThreshold: 0.8 - 0.15,
        minSpeechFrames: 3,
        preSpeechPadFrames: 1,
        redemptionFrames: parseInt(String(8)),
        // onS
        onVADMisfire: () => {
            console.log('onVADMisfire')
        },
        // onFrameProcessed:(probabilities)=>{
        //   alert("asd");
        //   console.log(probabilities)
        // },
        onSpeechStart: () => {
            try {
                console.log("onSpeechStart");
                setUserSpeakLately(new Date());
                pauseAllAudio();

                if (messages.length > 0) {
                    setSTTIng(true);

                    // setSpeakTimer(true);
                    // clearTimeout(timerRef.current);
                    if (typeof messages[messages.length - 1].display.content === 'object') {
                        abortStreaming(messages[messages.length - 1].display.msgID, "no")
                        // setMessages(currentMessages => {
                        //     console.log(currentMessages.filter(item => item.id !== msgID));
                        //     return [...currentMessages.map(item => {
                        //         if (item.id === messages[messages.length - 1].display.msgID) {
                        //             return { ...item, msg: text }; // 返回更新后的字典
                        //         }
                        //         return item; // 其他字典保持不变
                        //     })]
                        // })
                    }
                }

            } catch (e) {
                console.error("onSpeechStart error:" + e)
            }
        },
        onSpeechEnd: (float32Audio) => {
            try {
                console.log("onSpeechEnd");
                setAudioBuffer((prevItems) => [...prevItems, utils.encodeWAV(float32Audio)]);
                // setSpeakTimer(false);
            } catch (e) {
                console.error("onSpeechEnd error:" + e)
            }
        },
    });

    // PART TTS
    const handleCanPlay = (e) => {
        console.log(e);
        if (e.target) {
            const element = e.target as HTMLMediaElement;
            element.play();
            element.removeEventListener('canplay', handleCanPlay);
        }
    }

    const handleTTS = async () => {
        let userData = {
            teacherGender: 'female',
            teacherName: 'Mary',
            scene: 0,
            level: 0,
            lang: 'English',
        }

        // alert(userId);
        // console.log(chatParams);

        if (userId === 'default') {
            userData = loadUserCookies(userId);
            if (userData) {
                if (userData.hasOwnProperty("teacherName")) {
                    userData['teacherName'] = userData["teacherName"];
                }
                if (userData.hasOwnProperty("teacherGender")) {
                    userData['teacherGender'] = userData["teacherGender"];
                }
                if (userData.hasOwnProperty("scene")) {
                    userData['scene'] = userData["scene"];
                }
                if (userData.hasOwnProperty("level")) {
                    userData['level'] = userData["level"];
                }
                if (userData.hasOwnProperty("lang")) {
                    userData['lang'] = userData["lang"];
                }
            }
        } else {
            userData = chat?.chatParams;
        }

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
            formData.append('teacher_name', userData['teacherName']);
            formData.append('teacher_gender', userData['teacherGender']);
            formData.append('lang', userData['teacherGender']);
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

    const handleUpdateHint = async (msg:string) => {
        setTransTexts('');
        setShowTranslate(false);
        setCanPlay(false);
        setCanPlayThrough(false);
        setHintContent('');
        const cacheCookie = loadCacheUserCookies(userId, chatId);

        const hintText = await getHint(msg, cacheCookie ? cacheCookie : loadUserCookies(userId));
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
                handleUpdateHint(messages[messages.length - 1].display.props.content);
            })()
        }
    }, []);

    //
    useEffect(() => {
        console.log("!xxxxxxxxxxx!!!!!!!!!!!!")
        // console.log(messages[messages.length-1])
        if (showHint) {
            if (lastMessage?.display?.ref?.current?.completed) {
                ;(async () => {
                    handleUpdateHint(lastMessage.display.ref?.current?.text);
                })()
            }
        }
        ;(async () => {
            await handleBg();
        })()
    }, [lastMessage?.display.ref?.current?.completed])

    useEffect(() => {
        if (showHint) {
            if (voiceContinuationEnable) {
                ;(async () => {
                    handleUpdateHint(voiceText);
                })()
            }
        }
    }, [voiceText])

    return (
        <form
            ref={formRef}
            onSubmit={async (e: any) => {
                e.preventDefault()
                setChatOpacity(1);
                setHintContent('');
                setShowTranslate(false);
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
                const responseMessage = await submitUserMessage(value, loadCacheUserCookies(userId, chatId), remainingSecs)
                responseMessage.display.ref = lastMsgRef;
                setMessages(currentMessages => [...currentMessages, responseMessage])
                setLastMessage(responseMessage);

                inputRef.current.focus();
            }}
        >
            {/*// className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]"*/}
            <div onKeyDown={handleKeyDown} className={`${(showHint && messages.length > 1) ? '':'hidden'} relative duration-300 ease-in-out mb-4 grid gap-2 px-4 sm:px-0`}>
                <div  className={"z-40 absolute right-2 -top-3 sm:right-3"}>
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
                                    await handleTTS();
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
                                    console.log(messages);
                                    handleUpdateHint(messages[messages.length - 1].display.ref ? messages[messages.length - 1].display.ref?.current?.text : messages[messages.length - 1].display.props.content);
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
                                onClick={async (e) => {
                                    e.preventDefault();

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
                    onClick={handleUseHint}
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
                            className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4 z-50"
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
                    onFocus={()=>{setChatOpacity(1)}}
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
                <div className="absolute right-0 top-[13px] sm:right-4 z-40">
                    <div className={"z-50 absolute -right-1 -top-12 sm:-right-0 flex gap-1"}>
                        {/*提示*/}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    disabled={finished}
                                    variant="outline"
                                    size="icon"
                                    className={`${messages.length < 2 && 'hidden'} ${showHint && 'hidden'} bg-yellow-50 hover:bg-yellow-200 size-6 rounded-full p-0`}
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        setShowHint(true);
                                        if (hintContent.length === 0) {
                                            const lastMsg = messages[messages.length - 1].display.ref?.current?.text;
                                            if (lastMsg) {
                                                handleUpdateHint(lastMsg);
                                            } else {
                                                handleUpdateHint(messages[messages.length - 1].display.props?.content);
                                            }
                                            // alert();
                                        }
                                    }}
                                >
                                    <IconHint/>
                                    <span className="sr-only">不知道回复什么?点击打开提示</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>不知道回复什么?点击打开提示</TooltipContent>
                        </Tooltip>

                        {/*改变背景风格*/}
                        <BackgroundDialog
                            userId={userId}
                            chatOpacity={chatOpacity}
                            setChatOpacity={setChatOpacity}
                            hide={messages.length < 2}
                            ref={backgroundStyleRef}/>

                        {/*总结*/}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`${(messages.length < 2 || userId === 'default') && 'hidden'} bg-gray-200 hover:bg-gray-50 size-6 rounded-full p-0`}
                                    onClick={async (e) => {
                                        if (remainingSecs === 0) {
                                            document.getElementById(`score-btn-${chatId}`)?.click();
                                        } else {
                                            setChatRemainingTime(0);
                                            setFinished(true);
                                            stopAllAudio();
                                            vad.stop();
                                            setMicOn(false);
                                            setVoiceContinuationEnable(false);
                                            saveCountDown(chatId, 0);
                                        }
                                    }}
                                >
                                    {remainingSecs===0 ? (
                                        <IconScoreSheet/>
                                        ):(
                                        <IconExit/>
                                    )}
                                    <span className="sr-only">结束学习,查看评分</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>结束学习,查看评分</TooltipContent>
                        </Tooltip>

                        <button id={"continue-btn"}
                                className={"hidden"}
                                onClick={()=>{
                                    setChatRemainingTime(60*6);
                                    setFinished(false);
                                    setShowHint(true);
                                    handleUpdateHint(messages[messages.length - 1].display.ref ? messages[messages.length - 1].display.ref?.current?.text : messages[messages.length - 1].display.props.content);

                                    setMicOn(true);
                                    setVoiceContinuationEnable(false);
                                }}
                        />

                    </div>

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

                <div
                    className={`absolute z-40 left-0 top-0 w-full h-full bg-gray-300 bg-opacity-40 ${finished ? ('block') : ('hidden')}`}>
                </div>
            </div>
        </form>
    )
}

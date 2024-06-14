'use client'

import {IconOpenAI, IconPlayMedia, IconStop, IconTranslate, IconUser} from '@/components/ui/icons'
import {cacheUserCookies, cn, loadCacheUserCookies, loadUserCookies, stopAllAudio} from '@/lib/utils'
import {spinner} from './spinner'
import {CodeBlock} from '../ui/codeblock'
import {MemoizedReactMarkdown} from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {StreamableValue, useStreamableValue, readStreamableValue} from 'ai/rsc'
import {useStreamableText} from '@/lib/hooks/use-streamable-text'
import '@/components/auioPlayer/audioPlayer.scss';
import * as React from "react";
import {forwardRef, useEffect, useImperativeHandle} from "react";
import {toast} from 'sonner'
import {AI, ChatParams} from "@/lib/chat/actions";
import {useUIState, useActions} from 'ai/rsc';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {usePathname} from "next/navigation";
import Image from 'next/image'

// Different types of message bubbles.

export function UserMessage({children}: { children: React.ReactNode }) {
    return (
        <div className="group relative flex items-start md:-ml-12">
            <div
                className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
                <IconUser/>
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
                {children}
            </div>
        </div>
    )
}

// function myComponentShouldRerender(prevProps, nextProps) {
//     // 返回 true 表示不重新渲染,返回 false 表示重新渲染
//     // 这里你可以自定义比较逻辑
//     console.log("prevProps.data");
//     console.log(prevProps.data);
//     console.log(nextProps.data);
//
//
//     return prevProps.data === nextProps.data;
// }

export const BotMessage = React.memo(forwardRef(({
                                          content,
                                          chatParams,
                                          userId,
                                          chatId,
                                          className,
                                      }: {
    content: string | StreamableValue<string>
    userId?: string
    chatId?: string
    chatParams?: ChatParams | null | undefined
    className?: string
}, ref) => {
    useImperativeHandle(ref, () => ({
        text,
        completed,
    }))

    const [text, completed] = useStreamableText(content)
    // const transText = useStreamableText(content)a
    const [messages, setMessages] = useUIState<typeof AI>()
    const [canPlayThrough, setCanPlayThrough] = React.useState(false)
    const [showTranslate, setShowTranslate] = React.useState(false)
    const [wavB64, setWavB64] = React.useState<string | undefined>('')
    const [wavVoice, setWavVoice] = React.useState<string | undefined>('Mary')
    const [transTexts, setTransTexts] = React.useState<string | undefined>('')
    const [readingLoud, setReadingLoud] = React.useState<boolean>(false)
    const audioRef = React.useRef(null);
    const {translate} = useActions()
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
        // if(session)
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
            userData = chatParams;

        }
        if (wavB64 && userData['teacherName'] === wavVoice) {
            // console.log(audioRef.current);
            if (!readingLoud) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } else {
            const formData = new FormData();
            formData.append('text', text);
            const startTime = performance.now();

            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
            // const session = (await auth()) as Session
            setCanPlayThrough(false);

            setWavVoice(userData['teacherName']);
            // alert(teacherName)
            // alert(teacherGender)
            formData.append('teacher_name', userData['teacherName']);
            formData.append('teacher_gender', userData['teacherGender']);
            formData.append('lang', userData['teacherGender']);
            fetch(`${process.env.TTS_URL}`, {
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
                    // const wavData = new Uint8Array(wavBuffer);
                    // const wavUrl = URL.createObjectURL(new Blob([wavData], { type: 'audio/wav' }));
                    setWavB64(wavBuffer);
                    audioRef.current = new Audio("data:audio/wav;base64,"+wavBuffer);
                    // onCanPlayThrough={e => {*/}
                    //     {/*                    setCanPlayThrough(true);*/}
                    //     {/*                }}*/}
                    //     {/*                onPause={e => setReadingLoud(false)}*/}
                    //     {/*                onEnded={e => setReadingLoud(false)}*/}
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

    useEffect(() => {
        if (completed && messages.length>2) {
            stopAllAudio();
            setReadingLoud(!readingLoud);
            handleTTS();
        }
    }, [completed])

    useEffect(() => {
        console.log("chatParamschatParamschatParamschatParams");
        console.log(chatParams);

        if (userId!=='default') {
            if (!loadCacheUserCookies(userId, chatId) && chatParams) {
                cacheUserCookies(userId, chatId, chatParams)
            }
        }

        if (sessionStorage.getItem('tts') === content) {
            sessionStorage.removeItem('tts');
            stopAllAudio();
            setReadingLoud(!readingLoud);
            handleTTS();

        }

        return () => {
            if (audioRef.current) {
                // 停止音频
                audioRef.current.pause();
                // 将播放位置重置为开始
                audioRef.current.currentTime = 0;
                // 清除音频对象
                audioRef.current = null;
                console.log('Cleanup: Audio stopped and cleaned up');
            }
        };
    }, [])
    return (
        <div className={cn('group relative flex items-start md:-ml-12', className)}>
            <div
                className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
                {/*<IconOpenAI/>*/}
                <Image className={"size-5"}
                       alt={chatParams?.teacherName}
                     src={`/learninglang/images/teacher/${chatParams?.teacherGender}/${chatParams?.teacherName}.webp`}/>
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
                {text.length > 0 ? (
                    <MemoizedReactMarkdown
                        className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                        remarkPlugins={[remarkGfm, remarkMath]}
                        components={{
                            p({children}) {
                                return <p className="mb-2 last:mb-0">{children}</p>
                            },
                            code({node, inline, className, children, ...props}) {
                                if (children.length) {
                                    if (children[0] == '▍') {
                                        return (
                                            <span className="mt-1 animate-pulse cursor-default">▍</span>
                                        )
                                    }

                                    children[0] = (children[0] as string).replace('`▍`', '▍')
                                }

                                const match = /language-(\w+)/.exec(className || '')

                                if (inline) {
                                    return (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    )
                                }

                                return (
                                    <CodeBlock
                                        key={Math.random()}
                                        language={(match && match[1]) || ''}
                                        value={String(children).replace(/\n$/, '')}
                                        {...props}
                                    />
                                )
                            }
                        }}
                    >
                        {text}
                    </MemoizedReactMarkdown>
                ) : (
                    spinner
                )}

                <div className={`${showTranslate ? '' : 'hidden'}`}>{transTexts?.length === 0 ? (
                    <>{spinner}</>
                ) : (
                    <span className={`bg-yellow-50 bg-opacity-40`}>
                            {transTexts}
                        </span>
                )}</div>

                <div className={"items-center flex"}>
                    {((typeof content === 'string' && content.length > 0) || completed) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`${readingLoud && canPlayThrough && ('tts-btn-stop')} bg-blue-50 hover:bg-blue-200 size-6 rounded-full p-0 mr-1`}
                                    onClick={() => {
                                        stopAllAudio();
                                        setReadingLoud(!readingLoud);
                                        handleTTS();
                                    }}
                                >
                                    {readingLoud ? (
                                        canPlayThrough ? (<IconStop className="size-6"/>) : (spinner)
                                    ) : (
                                        <IconPlayMedia className="size-6"/>
                                    )}
                                    <span className="sr-only">{readingLoud ? ("停止") : ("朗读")}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{readingLoud ? ("停止") : ("朗读")}</TooltipContent>
                        </Tooltip>
                    )}


                    {(typeof content === 'string' || completed) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`bg-blue-50 hover:bg-blue-200 size-6 rounded-full p-0 mr-1`}
                                    onClick={async () => {
                                        setShowTranslate(true);
                                        const translatedText = await translate(text);
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
                                    <IconTranslate className="size-6"/>
                                    <span className="sr-only">翻译</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>翻译</TooltipContent>
                        </Tooltip>
                        // <button className={"btn rounded-full hover:bg-gray-200"} onClick={async () => {
                        //     setShowTranslate(true);
                        //     const translatedText = await translate(text);
                        //     if (typeof translatedText === 'object') {
                        //         let value = ''
                        //         for await (const delta of readStreamableValue(translatedText)) {
                        //             if (typeof delta === 'string') {
                        //                 setTransTexts((value = value + delta))
                        //             }
                        //         }
                        //     } else {
                        //         setTransTexts(translatedText)
                        //     }
                        // }}>
                        //     <IconTranslate className="size-6"/>
                        // </button>
                    )}
                </div>

                {/*<audio style={{display:'block'}} className={"w-8 absolute"} src={`data:audio/wav;base64,${wavUrl}`} autoPlay={true}></audio>*/}

            </div>
            {/*<audio src={wavUrl} autoPlay={true}></audio>*/}
        </div>
    )
}));

BotMessage.displayName = "BotMessage";


export function BotCard({
                            children,
                            showAvatar = true
                        }: {
    children: React.ReactNode
    showAvatar?: boolean
}) {
    return (
        <div className="group relative flex items-start md:-ml-12">
            <div
                className={cn(
                    'flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm',
                    !showAvatar && 'invisible'
                )}
            >
                <IconOpenAI/>
            </div>
            <div className="ml-4 flex-1 pl-2">{children}</div>
        </div>
    )
}

export function SystemMessage({children}: { children: React.ReactNode }) {
    return (
        <div
            className={
                'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
            }
        >
            <div className={'max-w-[600px] flex-initial p-2'}>{children}</div>
        </div>
    )
}

export function SpinnerMessage() {
    return (
        <div className="group relative flex items-start md:-ml-12">
            <div
                className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
                <IconOpenAI/>
            </div>
            <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
                {spinner}
            </div>
        </div>
    )
}


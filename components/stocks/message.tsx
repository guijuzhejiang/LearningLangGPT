'use client'

import {IconOpenAI, IconPlayMedia, IconStop, IconTranslate, IconUser} from '@/components/ui/icons'
import {cn, pauseAllAudio} from '@/lib/utils'
import {spinner} from './spinner'
import {CodeBlock} from '../ui/codeblock'
import {MemoizedReactMarkdown} from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {StreamableValue, useStreamableValue, readStreamableValue} from 'ai/rsc'
import {useStreamableText} from '@/lib/hooks/use-streamable-text'
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import '@/components/auioPlayer/audioPlayer.scss';
import * as React from "react";
import {forwardRef, useEffect, useImperativeHandle} from "react";
import {toast} from 'sonner'
import {AI} from "@/lib/chat/actions";
import {useAIState, useUIState, useActions} from 'ai/rsc';

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
                                          className,
                                          msgID,
                                      }: {
    content: string | StreamableValue<string>
    className?: string
    msgID?: string
}, ref) => {
    useImperativeHandle(ref, () => ({
        completed
    }))

    const [text, completed] = useStreamableText(content)
    // const transText = useStreamableText(content)
    const [aiState, setAIState] = useAIState<typeof AI>()
    const [_, setMessages] = useUIState<typeof AI>()
    const [canPlayThrough, setCanPlayThrough] = React.useState(false)
    const [showTranslate, setShowTranslate] = React.useState(false)
    const [showPlayTTS, setShowPlayTTS] = React.useState(true)
    const [wavB64, setWavB64] = React.useState<string | undefined>('')
    const [transTexts, setTransTexts] = React.useState<string | undefined>('')
    const {abortStreaming, translate} = useActions()

    const handleTTS = () => {
        setShowPlayTTS(false);
        const formData = new FormData();
        formData.append('text', text);
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
                // const wavData = new Uint8Array(wavBuffer);
                // const wavUrl = URL.createObjectURL(new Blob([wavData], { type: 'audio/wav' }));
                setWavB64(wavBuffer);
                console.log("tts elapsed " + (performance.now() - startTime) + 'ms')
            })
            .catch(error => {
                toast.error('Failed to generate voice');
                setShowPlayTTS(true);
            });
    }

    useEffect(() => {
        if (completed) {
            handleTTS();
        }
    }, [completed])

    useEffect(() => {
        // console.log(typeof content);
        // console.log(content);
        // const intervalId = setInterval(() => {
        // if (typeof content === 'string') {
        //     // clearInterval(intervalId);
        //     handleTTS();
        // }
        if (localStorage.getItem('tts') === content) {
            localStorage.removeItem('tts')
            handleTTS();

        }
    }, [])
    return (
        <div className={cn('group relative flex items-start md:-ml-12', className)}>
            <div
                className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
                <IconOpenAI/>
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
                {/*{typeof content === 'object' && (*/}
                {/*    <div className={"absolute right-1 top-0"}>*/}
                {/*        <button className={"btn rounded-full hover:bg-gray-200"} onClick={() => {*/}
                {/*            // const filterMsgs = aiState.messages.filter(item => item.id !== msgID)*/}
                {/*            // console.log(tts);*/}
                {/*            // console.log(msgID);*/}
                {/*            // console.log(filterMsgs);*/}
                {/*            // setMessages(currentMessages => {*/}
                {/*            //     console.log(currentMessages.filter(item => item.id !== msgID));*/}
                {/*            //     return [...currentMessages.map(item => {*/}
                {/*            //         if (item.id === msgID) {*/}
                {/*            //             return { ...item, msg: text }; // 返回更新后的字典*/}
                {/*            //         }*/}
                {/*            //         return item; // 其他字典保持不变*/}
                {/*            //     })]*/}
                {/*            // })*/}
                {/*            abortStreaming(msgID);*/}
                {/*        }}>*/}
                {/*            <IconStop className={"size-8"}/>*/}
                {/*        </button>*/}
                {/*    </div>*/}
                {/*)}*/}

                <div className={"items-center flex"}>
                    {typeof content === 'string' && content.length > 0 && (
                        <button className={`btn rounded-full hover:bg-gray-200 ${!showPlayTTS ? 'hidden':''}`} onClick={() => {
                            handleTTS();
                        }}>
                            <IconPlayMedia/>
                        </button>
                    )}


                    {(typeof content === 'string' || completed) && (
                        <button className={"btn rounded-full hover:bg-gray-200"} onClick={async () => {
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
                        }}>
                            <IconTranslate/>
                        </button>
                    )}

                    <div className={`${showTranslate ? '' : 'hidden'}`}>{transTexts?.length === 0 ? (
                        <>{spinner}</>
                    ) : (
                        <span className={`bg-yellow-50 bg-opacity-40`}>
                            {transTexts}
                        </span>
                    )}</div>
                </div>

                <div>
                    {/*{typeof content.curr === 'string' ? (<div>123123123</div>): (<div>{typeof content.curr}</div>)}*/}
                    {(!showPlayTTS || completed) && (
                        <>
                            <AudioPlayer
                                layout="horizontal"
                                autoPlay={false}
                                style={{display: canPlayThrough ? '' : 'none'}}
                                src={`data:audio/wav;base64,${wavB64}`}
                                customProgressBarSection={
                                    [
                                        RHAP_UI.CURRENT_TIME,
                                        RHAP_UI.PROGRESS_BAR,
                                        RHAP_UI.DURATION,
                                    ]
                                }
                                customControlsSection={
                                    [
                                        <div key={'empty'}></div>,
                                        RHAP_UI.MAIN_CONTROLS,
                                    ]
                                }
                                // // progressJumpSteps={{ backward: 1000, forward: 1000 }}
                                onCanPlay={(e) => {
                                    pauseAllAudio();
                                    if (e.target) {
                                        const element = e.target as HTMLMediaElement;
                                        element.play();
                                    }
                                }}
                                // onCanPlayThrough={e=>setCanPlayThrough(true)}
                                // showDownloadProgress={true}
                                onCanPlayThrough={e => {
                                    setCanPlayThrough(true);
                                }}
                                // onPause={e => setIsPlaying(false)}
                                // onEnded={e => setIsPlaying(false)}
                                // onAbort={e => setIsPlaying(false)}
                            />
                            {!canPlayThrough && (<SpinnerMessage/>)}
                        </>


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


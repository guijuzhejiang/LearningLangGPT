'use client'

import {ChatList} from '@/components/chat-list'
import {ChatPanel} from '@/components/chat-panel'
import {EmptyScreen} from '@/components/empty-screen'
import {useLocalStorage} from '@/lib/hooks/use-local-storage'
import {useEffect, useState} from 'react'
import {useUIState, useAIState, useActions} from 'ai/rsc'
import {Session} from '@/lib/types'
import {usePathname, useRouter} from 'next/navigation'
import {ChatParams, Message} from '@/lib/chat/actions'
import {useScrollAnchor} from '@/lib/hooks/use-scroll-anchor'
import * as React from "react";
import {readStreamableValue} from "ai/rsc";
import {CountdownCircleTimer} from "react-countdown-circle-timer";

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    session?: Session
    chatParams: ChatParams
    remainingSecs: number
}

export function Chat({id, className, session, chatParams, remainingSecs}: ChatProps) {
    const router = useRouter();
    const path = usePathname();
    const [messages, setMessages] = useUIState();
    const [aiState] = useAIState();
    const [_, setNewChatId] = useLocalStorage('newChatId', id)
    const [bgUrl, setBgUrl] = React.useState('')
    const {getBgUrl} = useActions();
    const backgroundStyleRef = React.useRef(null);
    const childDivRef = React.useRef(null);
    const [chatOpacity, setChatOpacity] = React.useState(1)
    const [remainingTime, setRemainingTime] = React.useState(remainingSecs)

    const handleCheckBg = async () => {
        try {
            const response = await fetch(`${process.env.SD_URL}/learninglang/image/fetch?&uid=${session.user.id}&cid=${id}&check=true&mlen=${messages.length}`,
                {
                    method: 'GET',
                });

            // 如果响应状态是404，返回true
            if (response.status === 404) {
                return false;
            } else {
                try {
                    return await response.text()
                } catch (e) {

                }
            }
        } catch (e) {
            return false
        }

    }

    const handleBg = async () => {
        try {
            if (session?.user) {
                if (messages.length === 2 && session?.user) {
                    // alert('refresh');
                    window.sessionStorage.setItem('tts', messages[1].content);
                    router.refresh()
                }

                console.log(messages[messages.length-1]?.display?.ref?.current?.completed);

                if (((messages.length > 4 && messages.length % 8 === 0) || messages.length === 4) && messages[messages.length-1]?.display?.ref?.current?.completed) {

                    const checkRes = await handleCheckBg()
                    // alert("checkRes");

                    if (checkRes) {
                        setBgUrl(`${process.env.SD_URL}${checkRes.replace('/service','')}`);
                    } else {
                        let bgRes = null;
                        const bgStream = await getBgUrl(backgroundStyleRef?.current?.backgroundStyle);
                        // console.log("bgStream");
                        for await (const delta of readStreamableValue(bgStream)) {
                            if (typeof delta === 'string' && delta.length >0) {
                                bgRes = JSON.parse(delta)
                            }
                        }
                        // console.log(bgRes);
                        if (bgRes.success) {
                            const url = process.env.SD_URL + bgRes.result[0].replace('/service', '');
                            // console.log("url");
                            // console.log(url);
                            setBgUrl(url+'&msmy=%23sfn%');
                        }
                    }

                }
            }
        } catch (e) {
        }

    }

    useEffect(() => {
        if (session?.user) {
            if (!path.includes('chat') && messages.length === 2) {
                window.history.replaceState({}, '', `/learninglang/chat/${id}`)
            }
        }

        if (!session?.user && path === '/') {
            window.history.replaceState({}, '', `/learninglang`)

        }


    }, [id, path, session?.user, messages]);

    useEffect(() => {
        console.log("messages count " + messages.length);
        console.log(messages)

        // ;(async () => {
        //     if (session?.user) {
        //         if (messages.length === 2 && session?.user) {
        //             // alert('refresh');
        //             window.sessionStorage.setItem('tts', messages[1].content);
        //             router.refresh()
        //         }
        //
        //         console.log(messages[messages.length-1]?.display?.ref?.current?.completed);
        //
        //         if (((messages.length > 4 && messages.length % 8 === 0) || messages.length === 4) && messages[messages.length-1]?.display?.ref?.current?.completed) {
        //
        //             const checkRes = await handleCheckBg()
        //             alert("checkRes");
        //
        //             if (checkRes) {
        //                 setBgUrl(`${process.env.SD_URL}${checkRes.replace('/service','')}`);
        //             } else {
        //                 let bgRes = null;
        //                 const bgStream = await getBgUrl(backgroundStyleRef?.current?.backgroundStyle);
        //                 // console.log("bgStream");
        //                 for await (const delta of readStreamableValue(bgStream)) {
        //                     if (typeof delta === 'string' && delta.length >0) {
        //                         bgRes = JSON.parse(delta)
        //                     }
        //                 }
        //                 // console.log(bgRes);
        //                 if (bgRes.success) {
        //                     const url = process.env.SD_URL + bgRes.result[0].replace('/service', '');
        //                     // console.log("url");
        //                     // console.log(url);
        //                     setBgUrl(url+'&msmy=%23sfn%');
        //                 }
        //             }
        //
        //         }
        //     }
        // })();

    }, [messages[messages.length-1]?.display?.ref, messages[messages.length-1]?.display?.ref?.current?.completed]);

    useEffect(() => {
        const messagesLength = aiState.messages?.length
        if (messagesLength === 2 && session?.user) {
            // alert('refresh');
            window.sessionStorage.setItem('tts', aiState.messages[1].content);
            router.refresh()
        }
    }, [aiState.messages, router])

    useEffect(() => {
        setNewChatId(id);
    })

    useEffect(() => {
        ;(async () => {
            if (session?.user) {
                setBgUrl(`${process.env.SD_URL}/learninglang/image/fetch?&uid=${session.user.id}&cid=${id}&mlen=${messages.length<8?4:messages.length%8===0?messages.length:(messages.length-(messages.length%8))}`);
            }
        })();
    }, [])

    const renderTime = ({ remainingTime }) => {
        setRemainingTime(remainingTime);
        return (
            <div className={`${messages.length===0 && 'hidden'} timer flex`}>
                {/*<div className="text">剩下</div>*/}
                <div style={{fontFamily:"Montserrat"}} className="value text-xl font-bold">{remainingTime}</div>
                {/*<div className="text">秒</div>*/}
            </div>
        );
    };

    const {messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom} =
        useScrollAnchor()

    return (
        <div
            // key={`chatbg_${refreshBg}}`}
            style={
                {
                    backgroundImage: `url(${bgUrl})`,
                    // backgroundPosition: 'calc(50% + 10rem) center'
                }
            }
            className={`bg-fixed bg-center bg-contain bg-no-repeat overflow-y-scroll relative group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:lg:bg-[center_left_32.8vw] peer-[[data-state=open]]:xl:pl-[300px] peer-[[data-state=open]]:xl:[center_34.8vw]`}
            ref={scrollRef}
        >
            <div
                style={{opacity:chatOpacity}}
                className={`min-h-100vh pb-[210px]`}
                // onClick={handleClickOutside}
                ref={messagesRef}
            >
                {messages.length ? (
                    <ChatList messages={messages} isShared={false} session={session}/>
                ) : (
                    <EmptyScreen/>
                )}

                <div className="h-px w-full" ref={visibilityRef}/>
            </div>
{/*<button onClick={()=>{*/}
{/*    alert(backgroundStyleRef?.current?.backgroundStyle);}}>{backgroundStyleRef?.current?.backgroundStyle}</button>*/}
            <ChatPanel
                id={id}
                session={session}
                backgroundStyleRef={backgroundStyleRef}
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
                chatOpacity={chatOpacity}
                setChatOpacity={setChatOpacity}
                remainingSecs={remainingTime}
                handleBg={handleBg}
                // voiceContinuationEnable={voiceContinuationEnable}
                // setVoiceContinuationEnable={setVoiceContinuationEnable}
                // userSpeakLately={userSpeakLately}
                // setUserSpeakLately={setUserSpeakLately}
                // voiceText={voiceText}
                // vad={vad}
            />

            {/*  count down clock  */}
            <div className={`${messages.length===0 && 'hidden'} fixed right-4 top-16`}>
                <CountdownCircleTimer
                    isPlaying
                    size={72}
                    strokeWidth={6}
                    duration={remainingSecs}
                    colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                    colorsTime={[10, 6, 3, 0]}
                    onComplete={() => ({shouldRepeat: false, delay: 1})}
                >
                    {renderTime}
                </CountdownCircleTimer>
            </div>
        </div>
    )
}

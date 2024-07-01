'use client'

import {cn, loadUserCookies} from '@/lib/utils'
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

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    session?: Session
    chatParams: ChatParams
}

export function Chat({id, className, session, chatParams}: ChatProps) {
    const router = useRouter();
    const path = usePathname();
    const [messages, setMessages] = useUIState();
    const [aiState] = useAIState();
    const [_, setNewChatId] = useLocalStorage('newChatId', id)
    const [bgUrl, setBgUrl] = React.useState('')
    const {getBgUrl} = useActions();

    const handleCheckBg = async () => {
        try {
            const response = await fetch(`${process.env.SD_URL}/learninglang/image/fetch?&uid=${session.user.id}&cid=${id}&check=true&mlen=${messages.length-2}`,
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

        ;(async () => {
            if (session?.user) {
                if (messages.length === 2 && session?.user) {
                    // alert('refresh');
                    window.sessionStorage.setItem('tts', messages[1].content);
                    router.refresh()
                }
                if ((messages.length > 4 && messages.length % 8 === 0) || messages.length === 4) {

                    const checkRes = await handleCheckBg()
                    // console.log(checkRes);
                    // alert(checkRes);

                    if (checkRes) {
                        setBgUrl(`${process.env.SD_URL}${checkRes.replace('/service','')}`);
                    } else {
                        const bgRes = await getBgUrl();
                        // console.log(bgRes);
                        if (bgRes.success) {
                            const url = process.env.SD_URL + bgRes.result[0].replace('/service', '');
                            // console.log(url);
                            setBgUrl(url);
                        }
                    }

                }
            }
        })();

    }, [messages]);

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
            setBgUrl(`${process.env.SD_URL}/learninglang/image/fetch?&uid=${session.user.id}&cid=${id}&mlen=${messages.length<8?2:messages.length%8===0?messages.length-2:(messages.length-(messages.length%8)-2)}`);
        })();

    }, [])

    const {messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom} =
        useScrollAnchor()

    return (
        <div
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
                className={cn("pb-[210px]", className)}
                ref={messagesRef}
            >
                {messages.length ? (
                    <ChatList chatParams={chatParams} messages={messages} isShared={false} session={session}/>
                ) : (
                    <EmptyScreen/>
                )}

                <div className="h-px w-full" ref={visibilityRef}/>
            </div>

            <ChatPanel
                id={id}
                session={session}
                // setInput={setInput}
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
                // micOn={micOn}
                // setMicOn={setMicOn}
                // STTIng={STTIng}
                // voiceContinuationEnable={voiceContinuationEnable}
                // setVoiceContinuationEnable={setVoiceContinuationEnable}
                // userSpeakLately={userSpeakLately}
                // setUserSpeakLately={setUserSpeakLately}
                // voiceText={voiceText}
                // vad={vad}
            />
        </div>
    )
}

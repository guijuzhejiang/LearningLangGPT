'use client'

import {cn} from '@/lib/utils'
import {ChatList} from '@/components/chat-list'
import {ChatPanel} from '@/components/chat-panel'
import {EmptyScreen} from '@/components/empty-screen'
import {useLocalStorage} from '@/lib/hooks/use-local-storage'
import {useEffect, useState} from 'react'
import {useUIState, useAIState} from 'ai/rsc'
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
        const messagesLength = aiState.messages?.length
        if (messagesLength === 2 && session?.user) {
            // alert('refresh');
            window.sessionStorage.setItem('tts', aiState.messages[1].content);
            router.refresh()
        }
    }, [aiState.messages, router])

    useEffect(() => {
        setNewChatId(id);
        console.log("!!!!!!!!!chatParamschatParamschatParams!!!!!!!!!")
        console.log(chatParams)
    })

    const {messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom} =
        useScrollAnchor()

    return (
        <div
            className="relative group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
            ref={scrollRef}
        >
            <div
                className={cn('pb-[13rem] pt-4 md:pt-10', className)}
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

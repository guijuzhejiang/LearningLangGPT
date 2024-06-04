import * as React from 'react'

import {shareChat} from '@/app/actions'
import {Button} from '@/components/ui/button'
import {PromptForm} from '@/components/prompt-form'
import {ButtonScrollToBottom} from '@/components/button-scroll-to-bottom'
import {IconShare} from '@/components/ui/icons'
import {FooterText} from '@/components/footer'
import {ChatShareDialog} from '@/components/chat-share-dialog'
import {useAIState, useActions, useUIState} from 'ai/rsc'
import type {AI} from '@/lib/chat/actions'
import {nanoid} from 'nanoid'
import {UserMessage} from './stocks/message'

export interface ChatPanelProps {
    id?: string,
    title?: string,
    input: string,
    setInput: (value: string) => void,
    isAtBottom: boolean,
    scrollToBottom: () => void,
    micOn: boolean,
    setMicOn: (value: boolean) => void,
    STTIng: boolean,
    voiceContinuationEnable: boolean,
    setVoiceContinuationEnable: (value: boolean) => void,
    userSpeakLately: Date | boolean
    setUserSpeakLately: (value: Date | boolean) => void
    vad: object,
}

export function ChatPanel({
                              id,
                              title,
                              input,
                              setInput,
                              isAtBottom,
                              scrollToBottom,
                              micOn,
                              setMicOn,
                              STTIng,
                              voiceContinuationEnable,
                              setVoiceContinuationEnable,
                              userSpeakLately,
                              setUserSpeakLately,
                              vad,
                          }: ChatPanelProps) {
    const [aiState] = useAIState()
    const [messages, setMessages] = useUIState<typeof AI>()
    const {submitUserMessage} = useActions()
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false)

    const exampleMessages = [
        {
            heading: '旅游相关英语',
            subheading: '旅游',
            message: `我喜欢旅游，请教我旅游相关的英语`
        },
        {
            heading: '英语学习方法',
            subheading: '学习',
            message: '请教我如何有效的学习英语'
        },
        {
          heading: '英语自我介绍',
          subheading: '介绍',
          message: `请教我如何使用英语自我介绍`
        },
        {
            heading: '参加英语面试',
            subheading: '面试',
            message: `请教我如何使用英语参加面试，并回答考官的英语问题`
        },
        {
            heading: '参加英语会议',
            subheading: '会议',
            message: `请教我如何使用英语参加会议，并在会议中用英语发言`
        },
        {
            heading: '英语购物',
            subheading: '购物',
            message: `请教我在国外如何使用英语咨询产品并购买`
        },
        {
            heading: '英语邀约女孩',
            subheading: '约会',
            message: `请教我如何使用英语约喜欢的女孩吃饭或者看电影等活动`
        },
        {
            heading: '英语邀约男孩',
            subheading: '约会',
            message: `请教我如何使用英语约喜欢的男孩吃饭或者看电影等活动`
        },
    ]

    return (
        <div
            className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="mx-auto sm:max-w-2xl sm:px-4">
                <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
                    {messages.length === 0 &&
                        exampleMessages.map((example, index) => (
                            <div
                                key={example.heading}
                                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                                    index > 1 && 'hidden md:block'
                                }`}
                                onClick={async () => {
                                    setMessages(currentMessages => [
                                        ...currentMessages,
                                        {
                                            id: nanoid(),
                                            display: <UserMessage>{example.message}</UserMessage>
                                        }
                                    ])

                                    const responseMessage = await submitUserMessage(
                                        example.message
                                    )

                                    setMessages(currentMessages => [
                                        ...currentMessages,
                                        responseMessage
                                    ])
                                }}
                            >
                                <div className="text-sm font-semibold">{example.heading}</div>
                                <div className="text-sm text-zinc-600">
                                    {example.subheading}
                                </div>
                            </div>
                        ))}
                </div>

                {messages?.length >= 2 ? (
                    <div className="flex h-12 items-center justify-center">
                        <div className="flex space-x-2">
                            {id && title ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShareDialogOpen(true)}
                                    >
                                        <IconShare className="mr-2"/>
                                        Share
                                    </Button>
                                    <ChatShareDialog
                                        open={shareDialogOpen}
                                        onOpenChange={setShareDialogOpen}
                                        onCopy={() => setShareDialogOpen(false)}
                                        shareChat={shareChat}
                                        chat={{
                                            id,
                                            title,
                                            messages: aiState.messages
                                        }}
                                    />
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
                    <PromptForm input={input}
                                setInput={setInput}
                                micOn={micOn}
                                setMicOn={setMicOn}
                                STTIng={STTIng}
                                voiceContinuationEnable={voiceContinuationEnable}
                                setVoiceContinuationEnable={setVoiceContinuationEnable}
                                userSpeakLately={userSpeakLately}
                                setUserSpeakLately={setUserSpeakLately}
                                vad={vad}
                    />
                    {/*<FooterText className="hidden sm:block" />*/}
                </div>
            </div>
        </div>
    )
}

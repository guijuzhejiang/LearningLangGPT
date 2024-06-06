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
            heading: '旅行和住宿（Travel and Accommodation）',
            subheading: '旅游',
            message: `请教我旅游相关的英语,通过角色扮演旅行和住宿场景来帮助学生练习英语。你将扮演酒店前台，而学生将扮演客人。引导学生经历办理入住、询问酒店服务和处理常见旅行情况。`
        },
        {
            heading: '英语学习方法（English Learning Methods）',
            subheading: '学习',
            message: '请教我如何有效的学习英语,通过讨论英语学习方法来帮助学生练习英语。与学生讨论他们使用的学习方法、遇到的困难和成功的经验。提供一些有效的学习建议和技巧。'
        },
        {
          heading: '英语自我介绍（English Self-Introduction）',
          subheading: '介绍',
          message: `请教我如何使用英语自我介绍,通过练习自我介绍来帮助学生练习英语。引导学生介绍自己的姓名、年龄、兴趣爱好、家庭和职业等信息。提供反馈和改进建议。`
        },
        {
            heading: '工作面试（Job Interview）',
            subheading: '面试',
            message: `请教我如何使用英语参加面试，通过角色扮演工作面试场景来帮助学生练习英语。你将扮演面试官，而学生将扮演求职者。引导学生回答典型的面试问题，提供反馈和改进建议。`
        },
        {
            heading: '安排会议（Scheduling a Meeting）',
            subheading: '安排会议',
            message: `通过角色扮演安排会议的场景来帮助学生练习英语。引导学生讨论会议时间、地点和议程。`
        },
        {
            heading: '参加英语会议（Attending an English Meeting）',
            subheading: '会议',
            message: `请教我如何使用英语参加会议，通过角色扮演参加英语会议来帮助学生练习英语。你将扮演会议主持人或参与者，而学生将扮演另一个参与者。引导学生进行会议中的讨论、表达意见和提出问题。`
        },
        // {
        //     heading: '英语购物（Shopping）',
        //     subheading: '购物',
        //     message: `请教我在国外如何使用英语购物,通过角色扮演购物场景来帮助学生练习英语。你将扮演店员，而学生将扮演顾客。引导学生经历典型的购物体验，包括问候、寻找商品、做决定和付款。`
        // },
        // {
        //     heading: '英语邀约（Inviting a Friend Out in English）',
        //     subheading: '约会',
        //     message: `请教我如何使用英语约对方外出,通过角色扮演邀约对方外出场景来帮助学生练习英语。你将扮演被邀约的人，而学生将扮演邀约者。引导学生用礼貌和自信的方式进行邀请，并处理可能的回应。`
        // },
        // {
        //     heading: '餐馆点餐（Ordering at a Restaurant）',
        //     subheading: '点餐',
        //     message: `通过角色扮演餐馆场景来帮助学生练习英语。你将扮演服务员，而学生将扮演顾客。引导学生经历典型的用餐体验，包括问候、点餐、询问菜单和付款。`
        // },
        // {
        //     heading: '医院就诊（Visiting a Doctor）',
        //     subheading: '就诊',
        //     message: `通过角色扮演医院就诊场景来帮助学生练习英语。你将扮演医生，而学生将扮演病人。引导学生解释症状、询问问题和理解医疗建议。`
        // },
        // {
        //     heading: '兴趣爱好（Hobbies and Interests）',
        //     subheading: '兴趣',
        //     message: `通过讨论兴趣爱好来帮助学生练习英语。与学生进行关于他们喜欢的兴趣爱好、喜欢的活动及其原因的对话。鼓励学生也询问你的兴趣爱好。`
        // },
        // {
        //     heading: '朋友聚会（Socializing with Friends）',
        //     subheading: '聚会',
        //     message: `通过角色扮演朋友聚会场景来帮助学生练习英语。与学生进行关于最近的活动、共同兴趣和制定计划等常见话题的对话。`
        // },
        // {
        //     heading: '预订（Booking）',
        //     subheading: '预订',
        //     message: `通过角色扮演预订场景来帮助学生练习英语。你将扮演酒店或餐馆的接待员，而学生将扮演预订者。引导学生进行房间或餐桌预订的对话，包括确认日期、时间和人数。`
        // },
        // {
        //     heading: '打电话（Making a Phone Call）',
        //     subheading: '打电话',
        //     message: `通过角色扮演打电话场景来帮助学生练习英语。你将扮演接电话的人，而学生将扮演打电话的人。引导学生进行问候、表达需求和解决问题。`
        // },
        // {
        //     heading: '交通问路（Asking for Directions）',
        //     subheading: '问路',
        //     message: `通过角色扮演问路场景来帮助学生练习英语。你将扮演路人，而学生将扮演问路者。引导学生询问和理解方向。`
        // },
        // {
        //     heading: '职场沟通（Workplace Communication）',
        //     subheading: '职场沟通',
        //     message: `通过角色扮演职场沟通的场景来帮助学生练习英语。引导学生进行与同事、上司或客户的对话，包括讨论项目、反馈意见和处理问题。`
        // },
        // {
        //     heading: '休闲娱乐（Leisure Activities）',
        //     subheading: '休闲娱乐',
        //     message: `通过讨论休闲娱乐活动来帮助学生练习英语。引导学生谈论他们喜欢的休闲活动、计划和过去的经历。`
        // },
        // {
        //     heading: '结交新朋友（Making New Friends）',
        //     subheading: '新朋友',
        //     message: `通过角色扮演结交新朋友的场景来帮助学生练习英语。引导学生进行自我介绍、询问对方的兴趣爱好和分享一些个人信息。`
        // },
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

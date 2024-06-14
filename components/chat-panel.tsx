import * as React from 'react'

import {PromptForm} from '@/components/prompt-form'
import {ButtonScrollToBottom} from '@/components/button-scroll-to-bottom'
import {useActions, useUIState} from 'ai/rsc'
import type {AI} from '@/lib/chat/actions'
import {usePathname} from "next/navigation";
import {TeacherVoiceDialog} from "@/components/teacher-voice-dialog";
import {Session} from "@/lib/types";
import {cn} from "@/lib/utils";
import {IconArrowDown} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import {nanoid} from "nanoid";
import {UserMessage} from "@/components/stocks/message";
import {SceneMenu} from "@/components/scene-menu";
import {SceneDialog} from "@/components/scene-dialog";
import {LevelDialog} from "@/components/level-dialog";

export interface ChatPanelProps {
    id?: string,
    session?: Session
    isAtBottom: boolean,
    scrollToBottom: () => void,
}

export function ChatPanel({
                              id,
                              session,
                              isAtBottom,
                              scrollToBottom,
                          }: ChatPanelProps) {
    const [messages, setMessages] = useUIState<typeof AI>();
    const {submitUserMessage} = useActions();
    const path = usePathname();
    const teacherTriggerRef = React.useRef(null);
    const sceneDialogRef = React.useRef(null);

    return (
        <div
            className="z-1 fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="mx-auto sm:max-w-2xl sm:px-4">
                {messages.length === 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-4 px-4 sm:px-0">
                        {/* 选择laoshi  */}
                        <TeacherVoiceDialog userId={session ? session.user.id : 'default'}/>

                        <div
                            key={"choosingTeacher"}
                            className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
                            // onClick={async () => {
                            // }}
                        >
                            <div className="text-sm font-semibold mb-2">选择语言</div>
                            <div className="text-sm text-zinc-600 items-center flex flex-col">
                                英语
                            </div>
                        </div>

                        {/*<div*/}
                        {/*    key={"choosingTeacher"}*/}
                        {/*    className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}*/}
                        {/*    // onClick={async () => {*/}
                        {/*    // }}*/}
                        {/*>*/}
                        {/*    <div className="text-sm font-semibold mb-2">选择难度</div>*/}
                        {/*    <div className="text-sm text-zinc-600 items-center flex flex-col">*/}
                        {/*        简单*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <LevelDialog userId={session ? session.user.id : 'default'}/>

                        {/* 选择scene */}
                        <SceneDialog ref={sceneDialogRef} userId={session ? session.user.id : 'default'}/>
                    </div>
                )}


                <div
                    className="mb-8 space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
                    {path.includes('chat') ? (
                        <PromptForm chatId={id}/>
                    ) : (
                        <Button
                            variant="default"
                            className={"w-full"}
                            onClick={async () => {
                                // console.log("sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene]")
                                // console.log(sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene].message)
                                alert("asd")
                                setMessages(currentMessages => [
                                    ...currentMessages,
                                    {
                                        id: nanoid(),
                                        display: <UserMessage>{""+sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene].message}</UserMessage>
                                    }
                                ])

                                const responseMessage = await submitUserMessage(
                                    sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene].message
                                )

                                setMessages(currentMessages => [
                                    ...currentMessages,
                                    responseMessage
                                ])
                            }}
                        >
                            <span>开始</span>
                        </Button>
                    )}
                    {/*<FooterText className="hidden sm:block" />*/}
                </div>


            </div>
        </div>
    )
}

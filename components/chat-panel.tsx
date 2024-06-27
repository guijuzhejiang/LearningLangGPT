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
import {LangDialog} from "@/components/lang-dialog";

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
    const teacherDialogRef = React.useRef(null);
    const langDialogRef = React.useRef(null);
    const levelDialogRef = React.useRef(null);
    const sceneDialogRef = React.useRef(null);

    return (
        <div
            className="z-1 fixed inset-x-0 bottom-0 w-full duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="chatContainer mx-auto sm:max-w-2xl sm:px-4">
                {messages.length === 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-4 px-4 sm:px-0">
                        {/* 选择laoshi  */}
                        <TeacherVoiceDialog ref={teacherDialogRef} userId={session ? session.user.id : 'default'}/>

                        {/*<div*/}
                        {/*    key={"choosingTeacher"}*/}
                        {/*    className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}*/}
                        {/*    // onClick={async () => {*/}
                        {/*    // }}*/}
                        {/*>*/}
                        {/*    <div className="text-sm font-semibold mb-2">选择语言</div>*/}
                        {/*    <div className="text-sm text-zinc-600 items-center flex flex-col">*/}
                        {/*        英语*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <LangDialog ref={langDialogRef} userId={session ? session.user.id : 'default'}/>

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
                        <LevelDialog ref={levelDialogRef} userId={session ? session.user.id : 'default'}/>

                        {/* 选择scene */}
                        <SceneDialog ref={sceneDialogRef} lang={langDialogRef?.current?.lang ? langDialogRef?.current.lang:"English"} userId={session ? session.user.id : 'default'}/>
                    </div>
                )}


                <div
                    className="mb-4 space-y-4 border-t bg-background px-4 py-1 shadow-lg sm:rounded-t-xl sm:border md:py-2">
                    {messages.length > 0 ? (
                        <PromptForm chatId={id} userId={session ? session.user.id : 'default'}/>
                    ) : (
                        <Button
                            variant="default"
                            className={"w-full"}
                            onClick={async () => {
                                // console.log("sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene]")
                                // console.log(sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene].message)
                                // console.log(sceneDialogRef?.current.ChineseLangs);
                                // console.log(sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene].message.replaceAll('{lang}', sceneDialogRef?.current.ChineseLangs[langDialogRef?.current?.lang ? langDialogRef?.current.lang:"English"])
                                // );
                                // alert(langDialogRef?.current.lang);
                                setMessages(currentMessages => [
                                    ...currentMessages,
                                    {
                                        id: nanoid(),
                                        display: <UserMessage>{""+sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene].message.replaceAll('{lang}', sceneDialogRef?.current.ChineseLangs[langDialogRef?.current?.lang ? langDialogRef?.current.lang:"English"])}</UserMessage>
                                    }
                                ])

                                const chatParams = {
                                    teacherName: teacherDialogRef?.current.teacherName,
                                    teacherGender: teacherDialogRef?.current.teacherGender,
                                    scene: sceneDialogRef?.current.scene,
                                    lang: langDialogRef?.current.lang,
                                    level: levelDialogRef?.current.level,
                                }
                                const responseMessage = await submitUserMessage(
                                    sceneDialogRef?.current.exampleMessages[sceneDialogRef?.current.scene].message.replaceAll('{lang}', sceneDialogRef?.current.ChineseLangs[langDialogRef?.current?.lang ? langDialogRef?.current.lang:"English"]),
                                    chatParams,
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

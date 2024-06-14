'use client'

import * as React from 'react'
import {type DialogProps} from '@radix-ui/react-dialog'
import {IconTeacher, IconPlayMedia, IconStop} from '@/components/ui/icons'
import * as Dialog from '@radix-ui/react-dialog';
import {Cross2Icon} from '@radix-ui/react-icons';
import Cookies from 'js-cookie';
import {usePathname} from "next/navigation";
import {updateUserCookies, loadUserCookies, stopAllAudio} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {spinner} from "@/components/stocks";
import {toast} from "sonner";
interface ChatShareDialogProps extends DialogProps {
    userId: string
}

export function LevelDialog({userId,
                                       ...props
                                   }: ChatShareDialogProps) {


    const path = usePathname();
    const [level, setLevel] = React.useState(0)
    const levelDisplay = [
        "初级",
        "中级",
        "高级",
    ]


    React.useEffect(() => {
        ;(async () => {
            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
            const userData = loadUserCookies(userId);
            console.log("llllllllllllllllllllllll");
            console.log(userData);
            if (userData) {
                if (userData.hasOwnProperty("level")) {
                    setLevel(userData["level"]);
                }
            }
        })()
    }, [])

    return (
        <>
            <Dialog.Root {...props}>
                <Dialog.Trigger asChild>
                    <div
                        key={"choosingTeacher"}
                        className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
                        // onClick={async () => {
                        // }}
                    >
                        <div className="text-sm font-semibold mb-2">选择等级</div>
                        <div className="text-sm text-zinc-600 items-center flex flex-col">
                            {levelDisplay[level]}
                        </div>
                    </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 min-w-[60vw] max-w-[80vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            选择等级
                        </Dialog.Title>
                        <Dialog.Description className="text-mauve11 mt-[10px] mb-1 text-[15px] leading-normal">
                            <span className={"flex items-center"}>
                                {"请选择等级。"}
                            </span>
                        </Dialog.Description>

                        <div className="grid grid-cols-3 gap-2">
                            {
                                levelDisplay.map((ld, index) => (
                                    <Dialog.Close asChild>
                                        <div
                                            key={"l"+index}
                                            className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                                                index > 1 && 'hidden md:block'
                                            }`}
                                            onClick={async () => {
                                                setLevel(index);
                                                updateUserCookies(userId, "level", index)
                                            }}
                                        >
                                            <div className="text-sm font-semibold">{ld}</div>
                                            {/*<div className="text-sm text-zinc-600">*/}
                                            {/*    {ld}*/}
                                            {/*</div>*/}
                                        </div>
                                    </Dialog.Close>
                                ))
                            }
                        </div>

                        {/*<div className="mt-16 flex justify-end">*/}
                        {/*    <Dialog.Close asChild>*/}
                        {/*        <button*/}
                        {/*            className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">*/}
                        {/*            Save changes*/}
                        {/*        </button>*/}
                        {/*    </Dialog.Close>*/}
                        {/*</div>*/}
                        <Dialog.Close asChild>
                            <button
                                className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                aria-label="Close"
                            >
                                <Cross2Icon/>
                            </button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    )
}

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
import {forwardRef, useImperativeHandle} from "react";
import {SceneDialog} from "@/components/scene-dialog";

interface ChatShareDialogProps extends DialogProps {
    userId: string
}

export const LangDialog = forwardRef(({
                               userId,
                               ...props
                           }: ChatShareDialogProps, ref) => {

    useImperativeHandle(ref, () => ({
        lang,
    }))

    const path = usePathname();
    const [lang, setLang] = React.useState('English')
    const langDisplay = {
        "English": {emoji: "🇺🇸", displayName: "英语"},
        "Français": {emoji: "🇫🇷", displayName: "法语"},
        "Deutsch": {emoji: "🇩🇪", displayName: "德语"},
    }


    React.useEffect(() => {
        ;(async () => {
            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
            const userData = loadUserCookies(userId);
            // console.log("llllllllllllllllllllllll");
            // console.log(userData);
            if (userData) {
                if (userData.hasOwnProperty("lang")) {
                    setLang(userData["lang"]);
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
                        <div className="text-sm font-semibold mb-2">语言</div>
                        <div className="text-sm text-zinc-600 items-center flex flex-col">
                            <div className={"text-8xl"}>{langDisplay[lang].emoji}</div>
                            <div>{langDisplay[lang].displayName}</div>
                        </div>
                    </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 max-md:w-[85vw] min-w-[60vw] max-w-[95vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            语言
                        </Dialog.Title>
                        <Dialog.Description className="text-mauve11 mt-[10px] mb-1 text-[15px] leading-normal">
                            <span className={"flex items-center"}>
                                {"请选择语言。"}
                            </span>
                        </Dialog.Description>

                        <div className="w-full grid grid-cols-3 gap-2">
                            {
                                Object.entries(langDisplay).map(([key, value], i) => {
                                        return (
                                            <Dialog.Close key={"l"+key} asChild>
                                                <div
                                                    className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                                                        i > 1 && 'md:block'
                                                    }`}
                                                    onClick={async () => {
                                                        setLang(key);
                                                        updateUserCookies(userId, "lang", key)
                                                    }}
                                                >
                                                    <div className="text-sm font-semibold text-center">
                                                        <div className={"text-6xl"}>{value.emoji}</div>
                                                        <div>{value.displayName}</div>

                                                    </div>
                                                    {/*<div className="text-sm font-semibold">{value.emoji}</div>*/}
                                                    {/*<div className="text-sm text-zinc-600">*/}
                                                    {/*    {ld}*/}
                                                    {/*</div>*/}
                                                </div>
                                            </Dialog.Close>
                                        )
                                    }
                                )
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
});


LangDialog.displayName = "LangDialog";

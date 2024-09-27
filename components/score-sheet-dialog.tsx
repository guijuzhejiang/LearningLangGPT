'use client'

import * as React from 'react'
import {type DialogProps} from '@radix-ui/react-dialog'
import {IconContinue, IconPlus, IconScoreSheet} from '@/components/ui/icons'
import * as Dialog from '@radix-ui/react-dialog';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {forwardRef, useImperativeHandle} from "react";
import type {Chat} from "@/lib/types";
import {getCountDown, getScore, saveCountDown} from "@/app/actions";
import {spinner} from "@/components/stocks";

interface ChatShareDialogProps extends DialogProps {
    chat: Chat
    isRemovePending: boolean,
    children: React.ReactNode
}

import {Scrollbars} from 'react-custom-scrollbars';
import {Separator} from "@/components/ui/separator";
import {Cross2Icon} from '@radix-ui/react-icons';
import {ScoreSheet} from "@/components/score-sheet";
import {useLocale, useTranslations} from "next-intl";

export const ScoreSheetDialog = forwardRef(({
                                                chat,
                                                isRemovePending,
                                                children,
                                                ...props
                                            }: ChatShareDialogProps, ref) => {

    const [summaryContent, setSummaryContent] = React.useState('')
    const [displayJSON, setDisplayJSON] = React.useState(false)
    const [remainingSecs, setRemainingSecs] = React.useState(0)
    const t = useTranslations('ScoreSheetDialog');
    const locale = useLocale();
    // useImperativeHandle(ref, () => ({
    //     childMethod() {
    //         console.log('Child method called');
    //         alert(`State:}`);
    //     }
    // }));

    React.useEffect(() => {
        ;(async () => {
            // console.log(chat);
            // alert("chat");
        })()
    }, [])

    return (
        <>
            <Dialog.Root
                {...props}
                onOpenChange={async (open) => {
                    if (open) {
                        setDisplayJSON(false);
                        setSummaryContent('');
                        const res = await getScore(chat, locale.includes('zh') ? 'cn':'en');
                        console.log("re!!!!!!!!!!!!!!!!!!!!!!s")
                        console.log(res)
                        setDisplayJSON(typeof res === 'string')
                        setSummaryContent(res);

                        setRemainingSecs(await getCountDown(chat.id))
                    }
                }}
            >
                <Dialog.Trigger asChild>
                    <span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {children}
                            </TooltipTrigger>
                            <TooltipContent>{t('title')}</TooltipContent>
                        </Tooltip>
                    </span>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 min-w-[60vw] max-w-[80vw] min-h-[60vh] max-h-[90vh] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            {t('title')}
                        </Dialog.Title>
                        <Dialog.Description>
                            <Scrollbars
                                // className={"pr-3"}
                                autoHeight
                                // autoHeightMin={'80vh'}
                                autoHeightMax={'70vh'}
                                autoHide={false}
                            >
                                <div className={"pr-3"}>
                                    <Separator className={"pt-0.5 mb-2"}/>

                                    {displayJSON ? (
                                        <p className="w-full whitespace-pre-line">
                                            {summaryContent ? JSON.stringify(summaryContent) : spinner}
                                        </p>
                                    ) : (
                                        <ScoreSheet summaryString={summaryContent} chat={chat}/>
                                    )}
                                </div>

                            </Scrollbars>
                        </Dialog.Description>

                        <div
                            className={`${remainingSecs>0 && "hidden"} mt-2 pr-3 float-right flex gap-2`}>
                            <Dialog.Close asChild>
                                <Button className={"w-full px-1 bg-amber-100 hover:bg-amber-200"} variant="outline"
                                        size="icon"
                                        onClick={async (e) => {
                                            await saveCountDown(chat.id, 60*6)
                                            // continueCB();
                                            document.getElementById(`continue-btn`)?.click();
                                        }}
                                >
                                    <IconContinue className={"size-8"}/>
                                    <span className={"text-xl"}>&nbsp;{t('continueBtn')}</span>
                                </Button>
                            </Dialog.Close>

                        </div>

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

ScoreSheetDialog.displayName = "ScoreSheetDialog";


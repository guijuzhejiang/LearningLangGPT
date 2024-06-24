'use client'

import * as React from 'react'
import {type DialogProps} from '@radix-ui/react-dialog'
import {IconScoreSheet} from '@/components/ui/icons'
import * as Dialog from '@radix-ui/react-dialog';
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {forwardRef, useImperativeHandle} from "react";
import type {Chat} from "@/lib/types";
import {getScore} from "@/app/actions";
import {useStreamableText} from "@/lib/hooks/use-streamable-text";
import {spinner} from "@/components/stocks";
interface ChatShareDialogProps extends DialogProps {
    chat: Chat
    isRemovePending: boolean
}
import {Scrollbars} from 'react-custom-scrollbars';
import {Separator} from "@/components/ui/separator";
import * as Collapsible from '@radix-ui/react-collapsible';
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons';
import {ScoreSheet} from "@/components/score-sheet";

export const ScoreSheetDialog = forwardRef(({
                                                chat,
                                                isRemovePending,
                                       ...props
                                   }: ChatShareDialogProps, ref) => {

    const [summaryContent, setSummaryContent] = React.useState('')
    const [displayJSON, setDisplayJSON] = React.useState(false)
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
                onOpenChange={async (open)=>{
                    if (open) {
                        setDisplayJSON(false);
                        setSummaryContent('');
                        const res = await getScore(chat);
                        setDisplayJSON(typeof res === 'string')
                        setSummaryContent(res);
                    }
                }}
            >
                <Dialog.Trigger asChild>
                    <span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-7 p-0 hover:bg-background"
                                    disabled={isRemovePending}
                                    // onClick={() => {}}
                                >
                                    <IconScoreSheet/>
                                    <span className="sr-only">评分总结</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>评分总结</TooltipContent>
                        </Tooltip>
                    </span>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 min-w-[60vw] max-w-[80vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            评分总结
                        </Dialog.Title>
                        <Dialog.Description className="text-mauve11 mt-[10px] mb-1 text-[15px] leading-normal">
                        </Dialog.Description>

                        <Scrollbars
                            // className={"pr-3"}
                            autoHeight
                            // autoHeightMin={'80vh'}
                            autoHeightMax={'85vh'}
                        >
                            <Separator className={"pt-0.5 mb-2"} />

                            {displayJSON ? (
                                <p className="w-full whitespace-pre-line">
                                    {summaryContent ? JSON.stringify(summaryContent) : spinner}
                                </p>
                            ):(
                                <ScoreSheet summaryString={summaryContent} chat={chat}/>
                            )}

                        </Scrollbars>

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


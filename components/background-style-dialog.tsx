'use client'

import * as React from 'react'
import {type DialogProps} from '@radix-ui/react-dialog'
import {IconBackground, IconPlayMedia, IconStop} from '@/components/ui/icons'
import * as Dialog from '@radix-ui/react-dialog';
import {Cross2Icon} from '@radix-ui/react-icons';
import {usePathname} from "next/navigation";
import {updateUserCookies, loadUserCookies, stopAllAudio} from "@/lib/utils";
import {Scrollbars} from 'react-custom-scrollbars';

import {forwardRef, useImperativeHandle} from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
interface ChatShareDialogProps extends DialogProps {
    userId: string
    hide: boolean
    chatOpacity?: number
    setChatOpacity?: (value: number) => void
}

export const BackgroundDialog = forwardRef(({userId,
                                                      hide,
                                                      chatOpacity,
                                                      setChatOpacity,
                                       ...props
                                   }: ChatShareDialogProps, ref) => {

    useImperativeHandle(ref, () => ({
        backgroundStyle,
    }))

    const t = useTranslations('BackgroundDialog');
    const [backgroundStyle, setBackgroundStyle] = React.useState(4)
    const [dialogOpen, setDialogOpen] = React.useState(false)

    const bgStyles = {
        0: t('style0'),
        1: t('style1'),
        2: t('style2'),
        3: t('style3'),
        4: t('style4'),
        5: t('style5'),
        6: t('style6'),
        7: t('style7'),
        8: t('style8'),
        9: t('style9'),
        10: t('style10'),
        11: t('style11'),
        12: t('style12'),
        13: t('style13'),
        14: t('style14'),
        15: t('style15'),
        16: t('style16'),
        17: t('style17'),
        18: t('style18'),
        19: t('style19'),
        20: t('style20'),
        21: t('style21'),
        22: t('style22'),
        23: t('style23'),
        24: t('style24'),
        25: t('style25'),
        26: t('style26'),
        27: t('style27'),
        28: t('style28'),
        29: t('style29'),
        30: t('style30'),
        31: t('style31'),
        32: t('style32'),
        33: t('style33'),
        34: t('style34'),
        35: t('style35'),
        36: t('style36'),
        37: t('style37'),
        38: t('style38'),
        39: t('style39'),
        40: t('style40'),
        41: t('style41'),
        42: t('style42'),
        43: t('style43'),
        44: t('style44'),
        45: t('style45'),
        46: t('style46'),
        47: t('style47'),
        48: t('style48'),
        49: t('style49'),
        50: t('style50'),
        51: t('style51'),
        52: t('style52'),
        53: t('style53'),
        54: t('style54'),
        55: t('style55'),
        56: t('style56'),
        57: t('style57'),
        58: t('style58'),
        59: t('style59'),
        60: t('style60'),
        61: t('style61'),
        62: t('style62'),
        63: t('style63'),
        64: t('style64'),
        65: t('style65'),
        66: t('style66'),
        67: t('style67'),
        68: t('style68'),
        69: t('style69')
    }


    React.useEffect(() => {
        ;(async () => {
            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
            const userData = loadUserCookies(userId);
            // if (userData) {
            //     if (userData.hasOwnProperty("teacherName")) {
            //         setTeacherName(userData["teacherName"]);
            //     }
            //     if (userData.hasOwnProperty("teacherGender")) {
            //         setTeacherGender(userData["teacherGender"]);
            //     }
            // }
        })()
    }, [])

    return (
        <>
            <Dialog.Root open={dialogOpen} {...props}>
                <Dialog.Trigger asChild>
                    <div>
                        <HoverCard.Root openDelay={300}>
                            <HoverCard.Trigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`${hide && 'hidden'} bg-yellow-50 hover:bg-yellow-200 size-6 rounded-full p-0`}
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        setChatOpacity(chatOpacity===0.1?1:0.1)
                                    }}
                                >
                                    <IconBackground/>
                                </Button>
                            </HoverCard.Trigger>
                            <HoverCard.Portal>
                                <HoverCard.Content asChild className="HoverCardContent" side="top">
                                    <div
                                        key={"choosingBackgroundStyle"}
                                        className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
                                        onClick={()=>setDialogOpen(!dialogOpen)}
                                    >
                                        <div className="text-sm font-semibold mb-2">{t('title')}</div>
                                        <div className="text-sm text-zinc-600 items-center flex flex-col">
                                            <img className={"size-24"}
                                                 alt={bgStyles[backgroundStyle]}
                                                 src={`/learninglang/images/background-style/${backgroundStyle.toString().padStart(3, '0')}.webp`}/>
                                            {bgStyles[backgroundStyle]}
                                        </div>
                                    </div>
                                </HoverCard.Content>
                            </HoverCard.Portal>

                        </HoverCard.Root>
                    </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        onClick={()=>setDialogOpen(false)}
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 min-w-[60vw] max-w-[80vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            {t('title')}
                        </Dialog.Title>
                        <Dialog.Description className="text-mauve11 mt-[10px] mb-1 text-[15px] leading-normal">
                        </Dialog.Description>
                        <Scrollbars
                            autoHeight
                            autoWidthMin={'50vw'}
                            autoHeightMax={'85vh'}
                        >
                            <div className="grid xs:grid-cols-3 md:grid-cols-5 gap-2 pr-2.5">
                                {
                                    Object.entries(bgStyles).map(([key, value], i) => {
                                        return (
                                            <div key={`bgs${key}`}>
                                                <Dialog.Close asChild>
                                                    <button
                                                        className={`${bgStyles[backgroundStyle] === value && ('border-4 border-green5')} hover:border-4 hover:border-green5 m-2 btn btn-secondary`}
                                                        onClick={(e) => {
                                                            setBackgroundStyle(key);

                                                            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
                                                            updateUserCookies(userId, "backgroundStyle", key)
                                                            setDialogOpen(false);
                                                        }}>
                                                        {/*<Image src={`/images/teacher/${teacherGender}/${value.name}.webp`} width={64} height={64}/>*/}
                                                        <img style={{width: '100%'}}
                                                             src={`/learninglang/images/background-style/${key.toString().padStart(3, '0')}.webp`}
                                                             alt={value}/>
                                                        {value}
                                                    </button>
                                                </Dialog.Close>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </Scrollbars>


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
                                onClick={()=>setDialogOpen(false)}
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

BackgroundDialog.displayName = "BackgroundDialog";


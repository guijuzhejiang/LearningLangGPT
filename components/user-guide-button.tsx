'use client'

import * as React from 'react'

import {cn} from '@/lib/utils'
import {Button, type ButtonProps} from '@/components/ui/button'
import {
    IconGuideBook,
    IconHint, IconMicroPhone,
    IconPlayMedia,
    IconTranslate,
    IconArrowElbow,
    IconVoiceContinuation, IconScoreSheet, IconBackground, IconEdit, IconExit
} from '@/components/ui/icons'
import {driver} from "driver.js";
import "driver.js/dist/driver.css";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import Cookies from "js-cookie";
import * as Dialog from "@radix-ui/react-dialog";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";


interface UserGuideButtonProps extends ButtonProps {
}

export function UserGuideButton({
                                    className,
                                    ...props
                                }: UserGuideButtonProps) {

    React.useEffect(() => {
        if (!Cookies.get('guideBefore')) {
            const intervalId = setInterval(() => {
                // alert('sdsd');
                if (Cookies.get('NEXT_LOCALE')) {
                    Cookies.set('guideBefore', 'true');
                    driverObj.drive();
                    clearInterval(intervalId);
                }
            }, 250);
        }

    }, [])

    const [displayBtnDesc, setDisplayBtnDesc] = React.useState(false)
    const path = usePathname();
    const t = useTranslations('UserGuide');
    // const locale = useLocale();

    const driverObj = driver({
        onDestroyed:()=>{
            setDisplayBtnDesc(false);
        },
        onNextClick: (element, step, options)=>{
            const activeIndex = driverObj.getActiveIndex();
            console.log(activeIndex);
            setDisplayBtnDesc(activeIndex == 2);
            driverObj.moveNext();
        },
        onPrevClick: (element, step, options)=>{
            setDisplayBtnDesc(false);
            driverObj.movePrevious();
        },
        showProgress: true,
        steps: [
            {popover: {title: t('dialogTitle'), description: t('content0')}},
            {element: 'div.chatContainer',
                popover: {
                    title: t('dialogTitle'),
                    description: t('content1'),
                    side: "top",
                    align: 'start'
                }
            },
            {element: 'div.UserOrLoginContainer',
                popover: {
                    title: t('dialogTitle'),
                    description: t('content2'),
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: 'div.btnDesContainer',
                popover: {
                    // title: t('dialogTitle'),
                    // description: '点击选择老师、想学习的语言、学习语言的等级、对话场景，最后点击开始即可开始学习。',
                    side: "bottom",
                    align: 'center'
                }
            },
            // { popover: { title: '欢迎', description: 'And that is all, go ahead and start adding tours to your applications.' } }
        ]
    });


    return (
        <>
            {path === '/' ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            onClick={() => {
                                driverObj.drive();
                            }}
                            className={cn(className)}
                            {...props}
                        >
                            <IconGuideBook/>

                            <div>
                                <Dialog.Root modal={false} open={true}>
                                    <Dialog.Portal>
                                        <Dialog.Content
                                            className={`${!displayBtnDesc && 'hidden'} btnDesContainer z-50 max-w-[80vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none`}>

                                            <div className={"text-primary"}>
                                                <p className={"flex mb-2"}>{t('content3p0')}：</p>
                                                <p className={"flex items-center"}>
                                                    <IconPlayMedia/>
                                                    <span>&nbsp;:{t('content3p1')}</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconTranslate/>
                                                    <span>&nbsp;:{t('content3p2')}</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconHint/>
                                                    <span>&nbsp;:{t('content3p3')}</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconBackground/>
                                                    <span>&nbsp;:{t('content3p4')}</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconExit/>
                                                    <span>&nbsp;:{t('content3p5')}</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconMicroPhone/>
                                                    <span>&nbsp;:{t('content3p6')}</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconVoiceContinuation/>
                                                    <span>&nbsp;:{t('content3p7')}</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconArrowElbow/>
                                                    <span>&nbsp;:{t('content3p8')}</span>
                                                </p>
                                            </div>
                                        </Dialog.Content>
                                    </Dialog.Portal>
                                </Dialog.Root>
                            </div>

                        </Button>
                    </TooltipTrigger>
                    {/*<TooltipContent>Delete chat</TooltipContent>*/}
                    <TooltipContent sideOffset={4} collisionPadding={16}>{t('btnTooltip')}</TooltipContent>
                </Tooltip>
            ):(
                <></>
            )}
        </>
    )
}

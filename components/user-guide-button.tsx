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
    IconVoiceContinuation
} from '@/components/ui/icons'
import {driver} from "driver.js";
import "driver.js/dist/driver.css";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import Cookies from "js-cookie";
import * as Dialog from "@radix-ui/react-dialog";
import {usePathname} from "next/navigation";


interface UserGuideButtonProps extends ButtonProps {
}

export function UserGuideButton({
                                    className,
                                    ...props
                                }: UserGuideButtonProps) {

    React.useEffect(() => {
        if (!Cookies.get('guideBefore')) {
            Cookies.set('guideBefore', 'true');
            driverObj.drive();
        }
    }, [])

    const [displayBtnDesc, setDisplayBtnDesc] = React.useState(false)
    const path = usePathname();

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
            {popover: {title: '引导', description: '欢迎来到AI外语通'}},
            {element: 'div.chatContainer',
                popover: {
                    title: '引导',
                    description: '选择老师、语言、等级和对话场景，点击开始即可开始学习。',
                    side: "top",
                    align: 'start'
                }
            },
            {element: 'div.UserOrLoginContainer',
                popover: {
                    title: '引导',
                    description: '注册并登录后，可保存聊天记录，选中对应记录可继续对话学习，点击评分总结按钮查看对话总结。',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: 'div.btnDesContainer',
                popover: {
                    // title: '引导',
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
            {path.includes('chat') ? (
                <></>
            ):(
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

                                            <div>
                                                <p className={"flex mb-2"}>开始对话练习后会出现下面按钮：</p>
                                                <p className={"flex items-center"}>
                                                    <IconPlayMedia/>
                                                    <span>&nbsp;:播放对应句子的语音</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconTranslate/>
                                                    <span>&nbsp;:显示对应句子的中文翻译</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconHint/>
                                                    <span>&nbsp;:点击可显示回复的提示</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconMicroPhone/>
                                                    <span>&nbsp;:开启麦克风</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconVoiceContinuation/>
                                                    <span>&nbsp;:开启自动语音模式</span>
                                                </p>
                                                <p className={"flex items-center"}>
                                                    <IconArrowElbow/>
                                                    <span>&nbsp;:发送消息</span>
                                                </p>
                                            </div>
                                        </Dialog.Content>
                                    </Dialog.Portal>
                                </Dialog.Root>
                            </div>

                        </Button>
                    </TooltipTrigger>
                    {/*<TooltipContent>Delete chat</TooltipContent>*/}
                    <TooltipContent sideOffset={4} collisionPadding={16}>如何使用</TooltipContent>
                </Tooltip>
            )}
        </>
    )
}

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
import {BotMessage, spinner} from "@/components/stocks";
import {toast} from "sonner";
import {forwardRef, useImperativeHandle} from "react";
interface ChatShareDialogProps extends DialogProps {
    userId: string
    lang: string
}

export const SceneDialog = forwardRef(({userId,
                                           lang,
                                       ...props
                                   }: ChatShareDialogProps,ref) => {

    useImperativeHandle(ref, () => ({
        scene,
        exampleMessages,
        ChineseLangs,
    }))

    const path = usePathname();
    const [scene, setScene] = React.useState(0)
    const ChineseLangs = {
        "English": "英语",
        "Français": "法语",
        "Deutsch": "德语",
    }

    const exampleMessages = [
        {
            heading: '无',
            subheading: '',
            message: ``
        },
        {
            heading: '旅行和住宿',
            subheading: '旅游',
            message: `请教我旅游相关的{lang},通过角色扮演旅行和住宿场景来帮助学生练习{lang}。你将扮演酒店前台，而学生将扮演客人。引导学生经历办理入住、询问酒店服务和处理常见旅行情况。`
        },
        {
            heading: '学习方法',
            subheading: '学习',
            message: '请教我如何有效的学习{lang},通过讨论{lang}学习方法来帮助学生练习{lang}。与学生讨论他们使用的学习方法、遇到的困难和成功的经验。提供一些有效的学习建议和技巧。'
        },
        {
            heading: '自我介绍',
            subheading: '介绍',
            message: `请教我如何使用{lang}自我介绍,通过练习自我介绍来帮助学生练习{lang}。引导学生介绍自己的姓名、年龄、兴趣爱好、家庭和职业等信息。提供反馈和改进建议。`
        },
        {
            heading: '工作面试',
            subheading: '面试',
            message: `请教我如何使用{lang}参加面试，通过角色扮演工作面试场景来帮助学生练习{lang}。你将扮演面试官，而学生将扮演求职者。引导学生回答典型的面试问题，提供反馈和改进建议。`
        },
        {
            heading: '安排会议',
            subheading: '安排会议',
            message: `通过角色扮演安排会议的场景来帮助学生练习{lang}。引导学生讨论会议时间、地点和议程。`
        },
        {
            heading: '参加会议',
            subheading: '会议',
            message: `请教我如何使用{lang}参加会议，通过角色扮演参加{lang}会议来帮助学生练习{lang}。你将扮演会议主持人或参与者，而学生将扮演另一个参与者。引导学生进行会议中的讨论、表达意见和提出问题。`
        },
        {
            heading: '购物',
            subheading: '购物',
            message: `请教我在国外如何使用{lang}购物,通过角色扮演购物场景来帮助学生练习{lang}。你将扮演店员，而学生将扮演顾客。引导学生经历典型的购物体验，包括问候、寻找商品、做决定和付款。`
        },
        {
            heading: '邀约',
            subheading: '约会',
            message: `请教我如何使用{lang}约对方外出,通过角色扮演邀约对方外出场景来帮助学生练习{lang}。你将扮演被邀约的人，而学生将扮演邀约者。引导学生用礼貌和自信的方式进行邀请，并处理可能的回应。`
        },
        {
            heading: '餐馆点餐',
            subheading: '点餐',
            message: `通过角色扮演餐馆场景来帮助学生练习{lang}。你将扮演服务员，而学生将扮演顾客。引导学生经历典型的用餐体验，包括问候、点餐、询问菜单和付款。`
        },
        {
            heading: '医院就诊',
            subheading: '就诊',
            message: `通过角色扮演医院就诊场景来帮助学生练习{lang}。你将扮演医生，而学生将扮演病人。引导学生解释症状、询问问题和理解医疗建议。`
        },
        {
            heading: '兴趣爱好',
            subheading: '兴趣',
            message: `通过讨论兴趣爱好来帮助学生练习{lang}。与学生进行关于他们喜欢的兴趣爱好、喜欢的活动及其原因的对话。鼓励学生也询问你的兴趣爱好。`
        },
        {
            heading: '朋友聚会',
            subheading: '聚会',
            message: `通过角色扮演朋友聚会场景来帮助学生练习{lang}。与学生进行关于最近的活动、共同兴趣和制定计划等常见话题的对话。`
        },
        {
            heading: '预订',
            subheading: '预订',
            message: `通过角色扮演预订场景来帮助学生练习{lang}。你将扮演酒店或餐馆的接待员，而学生将扮演预订者。引导学生进行房间或餐桌预订的对话，包括确认日期、时间和人数。`
        },
        {
            heading: '打电话',
            subheading: '打电话',
            message: `通过角色扮演打电话场景来帮助学生练习{lang}。你将扮演接电话的人，而学生将扮演打电话的人。引导学生进行问候、表达需求和解决问题。`
        },
        {
            heading: '交通问路',
            subheading: '问路',
            message: `通过角色扮演问路场景来帮助学生练习{lang}。你将扮演路人，而学生将扮演问路者。引导学生询问和理解方向。`
        },
        {
            heading: '职场沟通',
            subheading: '职场沟通',
            message: `通过角色扮演职场沟通的场景来帮助学生练习{lang}。引导学生进行与同事、上司或客户的对话，包括讨论项目、反馈意见和处理问题。`
        },
        {
            heading: '休闲娱乐',
            subheading: '休闲娱乐',
            message: `通过讨论休闲娱乐活动来帮助学生练习{lang}。引导学生谈论他们喜欢的休闲活动、计划和过去的经历。`
        },
        {
            heading: '结交新朋友',
            subheading: '新朋友',
            message: `通过角色扮演结交新朋友的场景来帮助学生练习{lang}。引导学生进行自我介绍、询问对方的兴趣爱好和分享一些个人信息。`
        },
    ]

    React.useEffect(() => {
        ;(async () => {
            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
            const userData = loadUserCookies(userId);
            console.log("sssssssssssss");
            console.log(userData);
            if (userData) {
                if (userData.hasOwnProperty("scene")) {
                    setScene(userData["scene"]);
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
                        <div className="text-sm font-semibold mb-2">选择场景</div>
                        <div className="text-sm text-zinc-600 items-center flex flex-col">
                            {exampleMessages[scene].heading.replaceAll('{lang}', ChineseLangs[lang])}
                        </div>
                    </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 min-w-[60vw] max-w-[80vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            选择场景
                        </Dialog.Title>
                        <Dialog.Description className="text-mauve11 mt-[10px] mb-1 text-[15px] leading-normal">
                            <span className={"flex items-center"}>
                                {"请选择场景。"}
                            </span>
                        </Dialog.Description>

                        <div className="grid grid-cols-5 gap-2">
                            {
                                exampleMessages.map((example, index) => (
                                    <Dialog.Close asChild key={example.heading}>
                                        <div
                                            className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                                                index > 1 && 'hidden md:block'
                                            }`}
                                            onClick={async () => {
                                                setScene(index);
                                                updateUserCookies(userId, "scene", index)
                                            }}
                                        >
                                            <div className="text-sm font-semibold">{example.heading.replaceAll('{lang}', ChineseLangs[lang])}</div>
                                            <div className="text-sm text-zinc-600">
                                                {/*{example.subheading}*/}
                                            </div>
                                        </div>
                                    </Dialog.Close>
                                ))
                            }
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

SceneDialog.displayName = "SceneDialog";

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
interface ChatShareDialogProps extends DialogProps {
    userId: string
    hide: boolean
    chatOpacity?: number
    setChatOpacity?: (value: number) => void
}

export const BackgroundDialogDialog = forwardRef(({userId,
                                                      hide,
                                                      chatOpacity,
                                                      setChatOpacity,
                                       ...props
                                   }: ChatShareDialogProps, ref) => {

    useImperativeHandle(ref, () => ({
        backgroundStyle,
    }))

    const path = usePathname();
    const [backgroundStyle, setBackgroundStyle] = React.useState(4)
    const [dialogOpen, setDialogOpen] = React.useState(false)

    const bgStyles = {
        0: '无',
        1: '胶片',
        2: '动画',
        3: '电影',
        4: '漫画',
        5: '橡皮泥',
        6: '梦幻',
        7: '等距',
        8: '线条',
        9: '多边形',
        10: '霓虹朋克',
        11: '折纸',
        12: '摄影',
        13: '像素风',
        14: '汽车',
        15: '时尚杂志',
        16: '食品',
        17: '奢侈品',
        18: '房屋',
        19: '包装',
        20: '抽象派',
        21: '装饰',
        22: '色块拼图',
        23: '涂鸦',
        24: '印象派',
        25: '点彩画',
        26: '流行艺术',
        27: '迷幻',
        28: '蒸汽朋克',
        29: '水彩画',
        30: '生物赛博',
        31: '赛博机器人',
        32: '赛博城市',
        33: '未来主义',
        34: '复古赛博',
        35: '复古科幻',
        36: '科幻',
        37: '泡泡龙',
        38: '赛博游戏',
        39: '格斗游戏',
        40: '侠盗飞车',
        41: '马里奥',
        42: '体素风',
        43: '宝可梦',
        44: '街头霸王',
        45: '迪斯科',
        46: '世界末日',
        47: '童话',
        48: '哥特式',
        49: '摇滚',
        50: '恐怖',
        51: '可爱',
        52: '魔幻',
        53: '阴森',
        54: '摩天高楼',
        55: '单色',
        56: '航海',
        57: '宇宙太空',
        58: '染色玻璃',
        59: '时尚赛博',
        60: '原始部落',
        61: '复杂单色',
        62: '平面剪纸',
        63: '立体剪纸',
        64: '纸浆',
        65: '剪纸拼图',
        66: '地外文明',
        67: '黑白电影',
        68: '高清',
        69: '宏大场景'
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
                                        setChatOpacity(chatOpacity===10?100:10)
                                    }}
                                >
                                    <IconBackground/>
                                    <span className="sr-only">背景风格</span>
                                </Button>
                            </HoverCard.Trigger>
                            <HoverCard.Portal>
                                <HoverCard.Content asChild className="HoverCardContent" side="top">
                                    <div
                                        key={"choosingBackgroundStyle"}
                                        className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
                                        onClick={()=>setDialogOpen(!dialogOpen)}
                                    >
                                        <div className="text-sm font-semibold mb-2">背景风格</div>
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
                            背景风格
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

BackgroundDialogDialog.displayName = "BackgroundDialogDialog";


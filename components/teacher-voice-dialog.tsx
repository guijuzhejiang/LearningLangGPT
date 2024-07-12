'use client'

import * as React from 'react'
import {type DialogProps} from '@radix-ui/react-dialog'
import {IconPlayMedia, IconStop} from '@/components/ui/icons'
import * as Dialog from '@radix-ui/react-dialog';
import {Cross2Icon} from '@radix-ui/react-icons';
import {usePathname} from "next/navigation";
import {updateUserCookies, loadUserCookies, stopAllAudio} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {spinner} from "@/components/stocks";
import {toast} from "sonner";
import Image from 'next/image'
import {forwardRef, useImperativeHandle} from "react";
interface ChatShareDialogProps extends DialogProps {
    userId: string
}

export const TeacherVoiceDialog = forwardRef(({userId,
                                       ...props
                                   }: ChatShareDialogProps, ref) => {

    useImperativeHandle(ref, () => ({
        teacherName,
        teacherGender,
    }))

    const path = usePathname();
    const [teacherGender, setTeacherGender] = React.useState('female')
    const [dialogTeacherGender, setDialogTeacherGender] = React.useState('female')
    const [teacherName, setTeacherName] = React.useState('Mary')

    const handleCanPlay = (e) => {
        console.log(e);
        if (e.target) {
            const element = e.target as HTMLMediaElement;
            element.play();
            element.removeEventListener('canplay', handleCanPlay);
        }
    }

    const teachers = {
        "male": {
            "Clark": {
                name: 'Clark',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Ken": {
                name: 'Ken',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Tom": {
                name: 'Tom',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Sam": {
                name: 'Sam',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Ryan": {
                name: 'Ryan',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
        },
        "female": {
            "Mary": {
                name: 'Mary',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Helen": {
                name: 'Helen',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Kate": {
                name: 'Kate',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Kristina": {
                name: 'Kristina',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
            "Lucy": {
                name: 'Lucy',
                audioRef:React.useRef(null),
                canPlayThrough:React.useState(false),
                readingLoud:React.useState(false)
            },
        },
    };

    React.useEffect(() => {
        ;(async () => {
            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
            const userData = loadUserCookies(userId);
            console.log("userDatauserDatauserDatauserDatauserData");
            console.log(userData);
            if (userData) {
                if (userData.hasOwnProperty("teacherName")) {
                    setTeacherName(userData["teacherName"]);
                }
                if (userData.hasOwnProperty("teacherGender")) {
                    setTeacherGender(userData["teacherGender"]);
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
                        <div className="text-sm font-semibold mb-2">老师</div>
                        <div className="text-sm text-zinc-600 items-center flex flex-col">
                            <img className={"size-24"}
                                   alt={teachers[teacherGender][teacherName].name}
                                 src={`/learninglang/images/teacher/${teacherGender}/${teachers[teacherGender][teacherName].name}.webp`}/>
                            {/*<IconTeacher/> */}
                            {teachers[teacherGender][teacherName].name}
                        </div>
                    </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 max-md:w-[85vw] min-w-[60vw] max-w-[95vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            老师
                        </Dialog.Title>
                        <Dialog.Description className="text-mauve11 mt-[10px] mb-1 text-[15px] leading-normal">
                            <span className={"flex items-center"}>
                                {"点击"}<IconPlayMedia/>{"可试听老师声音,点击头像选择老师。"}
                            </span>
                            <div className={"grid grid-cols-2 gap-1 mt-1"}>
                                <Button
                                    onClick={()=>setDialogTeacherGender('female')}
                                    className={`${dialogTeacherGender==="female"?('bg-mauve7'):('bg-white')} w-full text-violet11 shadow-blackA4 hover:bg-mauve5 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none shadow-[0_2px_10px]`}>
                                    female
                                </Button>
                                <Button
                                    onClick={()=>setDialogTeacherGender('male')}
                                    className={`${dialogTeacherGender==="male"?('bg-mauve7'):('bg-white')} w-full text-violet11 shadow-blackA4 hover:bg-mauve5 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none shadow-[0_2px_10px]`}>
                                    male
                                </Button>
                            </div>
                        </Dialog.Description>

                        <div className="grid grid-cols-5 gap-2 max-md:grid-cols-2">
                            {
                                Object.entries(teachers[dialogTeacherGender]).map(([key, value], i) => {
                                    return (
                                        <div key={`teacher${key}`}>
                                            <Dialog.Close asChild>
                                                <button
                                                    className={`${teachers[teacherGender][teacherName].name===value.name && ('border-4 border-green5')} hover:border-4 hover:border-green5 m-2 btn btn-secondary`}
                                                    onClick={(e) => {
                                                        setTeacherName(key);
                                                        setTeacherGender(dialogTeacherGender);

                                                        // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
                                                        updateUserCookies(userId, "teacherName", key)
                                                        updateUserCookies(userId, "teacherGender", dialogTeacherGender)
                                                    }}>
                                                    {/*<Image src={`/images/teacher/${teacherGender}/${value.name}.webp`} width={64} height={64}/>*/}
                                                    <img style={{width: '100%'}}
                                                         src={`/learninglang/images/teacher/${dialogTeacherGender}/${value.name}.webp`} alt={value.name}/>
                                                </button>
                                            </Dialog.Close>
                                            <div className={"flex items-center break-all w-full p-2"}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className={`${value["readingLoud"][0] && value['canPlayThrough'][0] && ('tts-btn-stop')} bg-blue-50 hover:bg-blue-200 size-6 rounded-full p-0 mr-1`}
                                                            onClick={() => {
                                                                stopAllAudio();
                                                                value["readingLoud"][1](!value["readingLoud"][0]);

                                                                if (value['canPlayThrough'][0]) {
                                                                    // console.log(audioRef.current);
                                                                    if (!value["readingLoud"][0]) {
                                                                        value["audioRef"].current.play();
                                                                    } else {
                                                                        value["audioRef"].current.pause();
                                                                        value["audioRef"].current.currentTime = 0;
                                                                    }
                                                                } else {
                                                                    const formData = new FormData();
                                                                    formData.append('text', `Hello!I'm ${key},your English teacher.`);
                                                                    const startTime = performance.now();

                                                                    // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
                                                                    // const session = (await auth()) as Session
                                                                    value['canPlayThrough'][1](false);

                                                                    formData.append('teacher_name', key);
                                                                    formData.append('teacher_gender', dialogTeacherGender);
                                                                    fetch(`${process.env.TTS_URL}`, {
                                                                        method: 'POST',
                                                                        body: formData
                                                                    })
                                                                        .then(response => {
                                                                            if (response.ok) {
                                                                                return response.text();
                                                                            } else {
                                                                                toast.error('Failed to generate voice');
                                                                            }
                                                                        })
                                                                        .then(wavBuffer => {
                                                                            // const wavData = new Uint8Array(wavBuffer);
                                                                            // const wavUrl = URL.createObjectURL(new Blob([wavData], { type: 'audio/wav' }));
                                                                            value["audioRef"].current = new Audio("data:audio/wav;base64,"+wavBuffer);
                                                                            // onCanPlayThrough={e => {*/}
                                                                            //     {/*                    setCanPlayThrough(true);*/}
                                                                            //     {/*                }}*/}
                                                                            //     {/*                onPause={e => setReadingLoud(false)}*/}
                                                                            //     {/*                onEnded={e => setReadingLoud(false)}*/}
                                                                            value["audioRef"].current.addEventListener('canplay', handleCanPlay);
                                                                            value["audioRef"].current.addEventListener('pause', ()=> value["readingLoud"][1](false));
                                                                            value["audioRef"].current.addEventListener('ended', ()=> value["readingLoud"][1](false));
                                                                            value["audioRef"].current.addEventListener('canplaythrough', ()=> value['canPlayThrough'][1](true));
                                                                            console.log("tts elapsed " + (performance.now() - startTime) + 'ms')
                                                                        })
                                                                        .catch(error => {
                                                                            toast.error('Failed to generate voice');
                                                                        });
                                                                }
                                                            }}
                                                        >
                                                            {value["readingLoud"][0] ? (
                                                                value["canPlayThrough"][0] ? (<IconStop className="size-6"/>) : (spinner)
                                                            ) : (
                                                                <IconPlayMedia className="size-6"/>
                                                            )}
                                                            <span className="sr-only">{value["readingLoud"][0] ? ("停止") : ("朗读")}</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{value["readingLoud"][0] ? ("停止") : ("朗读")}</TooltipContent>
                                                </Tooltip>
                                                &nbsp;{value.name}
                                            </div>

                                        </div>
                                    )
                                })
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

TeacherVoiceDialog.displayName = "TeacherVoiceDialog";


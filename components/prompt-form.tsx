'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import {useActions, useUIState} from 'ai/rsc'
import dynamic from "next/dynamic"
import {UserMessage} from './stocks/message'
import {type AI} from '@/lib/chat/actions'
import {Button} from '@/components/ui/button'
import {IconArrowElbow, IconPlus, IconMicroPhone, IconKeyboard, IconVoiceContinuation} from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import {useEnterSubmit} from '@/lib/hooks/use-enter-submit'
import {nanoid} from 'nanoid'
import {useRouter} from 'next/navigation'
import { useMicVAD, utils } from "@ricky0123/vad-react"
// import {MicVAD, utils} from "@ricky0123/vad-web"
import {tr} from "date-fns/locale";
import {toast} from "sonner";
import {checkMicrophoneAccess} from "@/lib/utils";

export function PromptForm({
                               input,
                               setInput
                           }: {
    input: string
    setInput: (value: string) => void
}) {
    // const vad = useMicVAD({
    //     startOnLoad: false,
    //     // workletURL: "/vad.worklet.bundle.min.js",
    //     // modelURL: "/silero_vad.onnx",
    //     onSpeechEnd: (float32Audio) => {
    //         const wavBuffer = utils.encodeWAV(float32Audio)
    //         const base64 = utils.arrayBufferToBase64(wavBuffer)
    //         const url = `data:audio/wav;base64,${base64}`
    //
    //     },
    // });

    const router = useRouter()
    const {formRef, onKeyDown} = useEnterSubmit()
    const inputRef = React.useRef<HTMLTextAreaElement>(null)
    const {submitUserMessage} = useActions()
    const [_, setMessages] = useUIState<typeof AI>()

    const [isTalking, setIsTalking] = React.useState(false)
    const [STTIng, setSTTIng] = React.useState(false)
    // const [keyboardEnable, setKeyboardEnable] = React.useState(true)
    const [micOn, setMicOn] = React.useState(true)
    const [micAvailable, setMicAvailable] = React.useState(false)
    const [voiceContinuationEnable, setVoiceContinuationEnable] = React.useState(false)
    const [voiceText, setVoiceText] = React.useState('')
    // const [vad, setVad] = React.useState<any>(null)
    const vad = useMicVAD({
        onSpeechStart: () => {
            try {
                console.log("onSpeechStart");
                // setKeyboardEnable(false);
                setIsTalking(true);
                setSTTIng(true);
            } catch (e) {
                console.error("onSpeechStart error:" + e)
            }
        },
        onSpeechEnd: (float32Audio) => {
            try {
                console.log("onSpeechEnd");

                // setKeyboardEnable(true);

                // vadObj.pause()

                // do something with `audio` (Float32Array of audio samples at sample rate 16000)...
                const wavBuffer = utils.encodeWAV(float32Audio)
                // const base64 = utils.arrayBufferToBase64(wavBuffer)
                // myvad.pause()
                setIsTalking(false);
                const wavBlob = new Blob([wavBuffer], {type: 'audio/wav'});
                const formData = new FormData();
                formData.append('wavFile', wavBlob, 'audio.wav');

                const startTime = performance.now();
                fetch(process.env.STT_URL, {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            toast.error('Failed to upload');
                        }
                    })
                    .then(data => {
                        if (data.success) {
                            console.log(input);
                            console.log(data.result.text);
                            setVoiceText(data.result.text);
                            // if (voiceContinuationEnable) {
                            //     console.log("voiceContinuationEnable:" + voiceContinuationEnable)
                            //     formRef.current.dispatchEvent(new Event('submit', { bubbles: true }));
                            // }
                        } else {
                            toast.error('failed');
                        }

                        console.log("stt elapsed "+(performance.now()-startTime) + 'ms')
                    })
                    .catch(error => {
                        toast.error('Failed to upload');

                        console.error('上传错误:', error);
                    });
            } catch (e) {
                console.error("onSpeechEnd error:" + e)
            }
        },
    })
    // const initVAD = async ()=>{
    //     return await MicVAD.new({
    //         onSpeechStart: () => {
    //             console.log("onSpeechStart");
    //             // setKeyboardEnable(false);
    //             setIsTalking(true);
    //             setSTTIng(true);
    //         },
    //         onSpeechEnd: (float32Audio) => {
    //             console.log("onSpeechEnd");
    //
    //             // setKeyboardEnable(true);
    //
    //             // vadObj.pause()
    //
    //             // do something with `audio` (Float32Array of audio samples at sample rate 16000)...
    //             const wavBuffer = utils.encodeWAV(float32Audio)
    //             // const base64 = utils.arrayBufferToBase64(wavBuffer)
    //             // myvad.pause()
    //             setIsTalking(false);
    //             const wavBlob = new Blob([wavBuffer], {type: 'audio/wav'});
    //             const formData = new FormData();
    //             formData.append('wavFile', wavBlob, 'audio.wav');
    //
    //             const startTime = performance.now();
    //             fetch('http://127.0.0.1:5004/stt', {
    //                 method: 'POST',
    //                 body: formData
    //             })
    //                 .then(response => {
    //                     if (response.ok) {
    //                         return response.json();
    //                     } else {
    //                         toast.error('Failed to upload');
    //                     }
    //                 })
    //                 .then(data => {
    //                     if (data.success) {
    //                         console.log(input);
    //                         console.log(data.result.text);
    //                         setVoiceText(data.result.text);
    //                         if (voiceContinuationEnable) {
    //                             formRef.current.submit();
    //                         }
    //                     } else {
    //                         toast.error('failed');
    //                     }
    //
    //                     console.log("stt elapsed "+(performance.now()-startTime) + 'ms')
    //                 })
    //                 .catch(error => {
    //                     toast.error('Failed to upload');
    //
    //                     console.error('上传错误:', error);
    //                 });
    //         },
    //     })
    // }

    const handleToggleSTT = async (e: any) => {
        e.preventDefault();

        try {
            if (micOn) {
                vad.pause()
                setMicOn(false);
            } else {
                setMicOn(true);
                vad.start();
            }
        } catch (e) {
            console.log(e);
            toast.error('Failed to open mic')
        }
    }

    React.useEffect(() => {
        // 在状态变化后打印最新的值
        console.log('input updated:', voiceText);
        if (voiceContinuationEnable) {
            console.log("voiceContinuationEnable:" + voiceContinuationEnable)
            const asyncSubmit = async ()=>{
                const value = (input + voiceText).trim()
                setInput('')
                if (!value) return

                // Optimistically add user message UI
                setMessages(currentMessages => [
                    ...currentMessages,
                    {
                        id: nanoid(),
                        display: <UserMessage>{value}</UserMessage>
                    }
                ])

                // Submit and get response message
                const responseMessage = await submitUserMessage(value)
                setMessages(currentMessages => [...currentMessages, responseMessage])
            }
            asyncSubmit();
        } else {
            setInput(input + voiceText);
        }
        setSTTIng(false)
    }, [voiceText]); // 仅在 count 发生变化时执行

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }

        const haveMic = checkMicrophoneAccess()
        setMicAvailable(haveMic);
        setMicOn(haveMic);
        // if (haveMic) {
        //     const asyncInit = async () => {
        //         try {
        //             const vadObj = await initVAD()
        //             setVad(vadObj)
        //
        //             vadObj.start()
        //         } catch (e) {
        //             setMicAvailable(false);
        //         } finally {
        //         }
        //     };
        //     asyncInit();
        // }
    }, [])

    return (
        <form
            ref={formRef}
            onSubmit={async (e: any) => {
                e.preventDefault()

                // Blur focus on mobile
                if (window.innerWidth < 600) {
                    e.target['message']?.blur()
                }

                const value = input.trim()
                setInput('')
                if (!value) return

                // Optimistically add user message UI
                setMessages(currentMessages => [
                    ...currentMessages,
                    {
                        id: nanoid(),
                        display: <UserMessage>{value}</UserMessage>
                    }
                ])

                // Submit and get response message
                const responseMessage = await submitUserMessage(value)
                setMessages(currentMessages => [...currentMessages, responseMessage])
            }}
        >
            <div
                className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">

                {/*新建聊天*/}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
                            onClick={() => {
                                router.push('/new')
                            }}
                        >
                            <IconPlus/>
                            <span className="sr-only">New Chat</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Chat</TooltipContent>
                </Tooltip>

                {/*输入内容*/}
                <Textarea
                    ref={inputRef}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    disabled={micOn ? STTIng:false}
                    placeholder={voiceContinuationEnable ? "Listening...":"Send a message."}
                    className={`min-h-[60px] w-full resize-none bg-transparent pl-2 pr-${micOn && !voiceContinuationEnable ? '16':'14'} py-[1.3rem] focus-within:outline-none sm:text-sm`}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    name="message"
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />

                {/* 右边div */}
                <div className="absolute right-0 top-[13px] sm:right-4 z-50">
                    {/*提交按钮*/}
                    <Tooltip>
                        <TooltipTrigger asChild className={`${voiceContinuationEnable && ('hidden')}`}>
                            <Button type="submit" size="icon" disabled={input === ''}>
                                <IconArrowElbow />
                                <span className="sr-only">Send message</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                    </Tooltip>

                    {/*语音*/}
                    <Tooltip>
                        <TooltipTrigger asChild className="ml-1">
                            <Button className={micOn ? "":"bg-gray-400 opti"} size="icon" onClick={handleToggleSTT} disabled={!micAvailable}>
                                <IconMicroPhone className={isTalking && micOn ? "text-blue-400":""}/>
                                <span className="sr-only">Voice</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice</TooltipContent>
                    </Tooltip>

                    {/*只有语音*/}
                    <Tooltip>
                        <TooltipTrigger asChild className={`ml-1 ${!micOn && ('hidden')}`}>
                            <Button className={voiceContinuationEnable ? "":"bg-gray-400 opti"} size="icon" onClick={(e)=>{e.preventDefault();setVoiceContinuationEnable(!voiceContinuationEnable);}} disabled={!micAvailable}>
                                <IconVoiceContinuation/>
                                <span className="sr-only">Voice Continuation</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice Continuation</TooltipContent>
                    </Tooltip>
                </div>

                <div
                    className={`absolute left-0 top-0 w-full h-full bg-yellow-600 bg-opacity-10 ${voiceContinuationEnable ? ('block'):((!STTIng || !micOn) && ('hidden'))}`}>
                </div>
            </div>
        </form>
    )
}

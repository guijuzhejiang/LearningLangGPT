'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import {useActions, useUIState} from 'ai/rsc'

import {UserMessage} from './stocks/message'
import {type AI} from '@/lib/chat/actions'
import {Button} from '@/components/ui/button'
import {IconArrowElbow, IconPlus, IconMicroPhone} from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import {useEnterSubmit} from '@/lib/hooks/use-enter-submit'
import {nanoid} from 'nanoid'
import {useRouter} from 'next/navigation'
// import { useMicVAD, utils } from "@ricky0123/vad-react"
import {MicVAD, utils} from "@ricky0123/vad-web"
import {tr} from "date-fns/locale";
import {toast} from "sonner";

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

    const [isRecording, setIsRecording] = React.useState(false)
    const [voiceText, setVoiceText] = React.useState('Listening...')
    const [vad, setVad] = React.useState(null)

    const handleToggleSTT = async (e) => {
        e.preventDefault();

        try {
            if (!vad) {
                const vadObj = await MicVAD.new({
                    // onSpeechStart: () => {
                    //     alert('start');
                    // },
                    onSpeechEnd: (float32Audio) => {
                        console.log(vadObj);
                        vadObj.pause()

                        // do something with `audio` (Float32Array of audio samples at sample rate 16000)...
                        const wavBuffer = utils.encodeWAV(float32Audio)
                        // const base64 = utils.arrayBufferToBase64(wavBuffer)
                        // myvad.pause()
                        setIsRecording(false);
                        const wavBlob = new Blob([wavBuffer], {type: 'audio/wav'});
                        const formData = new FormData();
                        formData.append('wavFile', wavBlob, 'audio.wav');

                        const startTime = performance.now();
                        fetch('http://127.0.0.1:5004/stt', {
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
                                    setInput(input + data.result.text);

                                } else {
                                    toast.error('failed');
                                }

                                console.log("stt elapsed "+(performance.now()-startTime) + 'ms')
                            })
                            .catch(error => {
                                toast.error('Failed to upload');

                                console.error('上传错误:', error);
                            });
                    },
                })
                setVad(vadObj)

                vadObj.start()
                setIsRecording(true);

            } else {
                vad.start()
                setIsRecording(true);
            }
        } catch (e) {
            console.log(e);
            toast.error('Failed to open mic')
            setIsRecording(false);
        }
    }

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }

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
                    <TooltipTrigger asChild className={`${isRecording && ('hidden')}`}>
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
                    placeholder="Send a message."
                    className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    name="message"
                    rows={1}
                    value={isRecording ? voiceText : input}
                    onChange={e => setInput(e.target.value)}
                />

                {/* 右边div */}
                <div className="absolute right-0 top-[13px] sm:right-4 z-50">
                    {/*提交按钮*/}
                    <Tooltip>
                        <TooltipTrigger asChild className={`${isRecording && ('hidden')}`}>
                            <Button type="submit" size="icon" disabled={input === ''}>
                                <IconArrowElbow/>
                                <span className="sr-only">Send message</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                    </Tooltip>

                    {/*语音*/}
                    <Tooltip>
                        <TooltipTrigger asChild className="ml-1">
                            <Button size="icon" onClick={handleToggleSTT}>
                                <IconMicroPhone className={`${isRecording && ('text-blue-500')}`}/>
                                <span className="sr-only">Voice</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice</TooltipContent>
                    </Tooltip>
                </div>

                <div
                    className={`absolute left-0 top-0 w-full h-full bg-yellow-600 bg-opacity-10 ${!isRecording && ('hidden')}`}>
                </div>
            </div>
        </form>
    )
}

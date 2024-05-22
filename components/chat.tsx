'use client'

import {checkMicrophoneAccess, cn, mergeFloat32Arrays, pauseAllAudio} from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import {AI, Message} from '@/lib/chat/actions'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { useMicVAD, utils } from "@ricky0123/vad-react"
import {nanoid} from 'nanoid'

import * as React from "react";
import {useActions} from "ai/rsc";
import {tr} from "date-fns/locale";
import {UserMessage} from "@/components/stocks/message";

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useUIState();
  const [aiState] = useAIState();
  const [_, setNewChatId] = useLocalStorage('newChatId', id)
  const {submitUserMessage, abortStreaming} = useActions()

  /* PART VAD */
  // mic 是否可用
  const [micAvailable, setMicAvailable] = React.useState(false)
  // mic 是否打开
  const [micOn, setMicOn] = React.useState(true)
  // 是否正在处理STT
  const [STTIng, setSTTIng] = React.useState(false)
  // 持续讲话模式
  const [voiceContinuationEnable, setVoiceContinuationEnable] = React.useState(false)
  // stt文本
  const [voiceText, setVoiceText] = React.useState('');
  // wav float32数组缓存
  const [audioBuffer, setAudioBuffer] = React.useState([]);
  const [speakTimer, setSpeakTimer] = React.useState(false);
  const timerRef = React.useRef(null);
  // 无声间隔ms
  const silenceDurationMS = 300;

  useEffect(() => {
    // 在状态变化后打印最新的值
    // console.log('input updated:', voiceText);
    if (voiceContinuationEnable) {
      // console.log("voiceContinuationEnable:" + voiceContinuationEnable)
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
  }, [voiceText]);

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 2) {
        window.history.replaceState({}, '', `/learninglang/chat/${id}`)
        // window.localStorage.setItem('tts', true);
        // router.refresh()
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2 && session?.user) {
      // alert('refresh');
      window.localStorage.setItem('tts', aiState.messages[1].content);
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id);
  })

  // useEffect(() => {
  //   console.log("timer change!!!!");
  // }, [speakTimer]);


  useEffect(() => {
    const haveMic = checkMicrophoneAccess()
    setMicAvailable(haveMic);
    setMicOn(haveMic);
  }, []);

  useEffect(() => {
    if (audioBuffer.length > 0) {
      timerRef.current = setTimeout(() => {
        if (!speakTimer) {
          // console.log('State not changed in silenceDurationMS seconds????????????');
          const formData = new FormData();
          audioBuffer.map((wavBuf, i)=>{
            const wavBlob = new Blob([wavBuf], {type: 'audio/wav'});
            formData.append('wavFiles', wavBlob, 'audio.wav');
          });

          const startTime = performance.now();
          fetch(process.env.STT_URL, {
            method: 'POST',
            body: formData
          })
              .then(response => {
                setAudioBuffer([])
                if (response.ok) {
                  return response.json();
                } else {
                  toast.error('Failed to upload');
                }
              })
              .then(data => {
                if (data.success) {
                  // console.log(data.result.text);
                  setVoiceText(data.result.text);
                  // if (voiceContinuationEnable) {
                  //     console.log("voiceContinuationEnable:" + voiceContinuationEnable)
                  //     formRef.current.dispatchEvent(new Event('submit', { bubbles: true }));
                  // }
                } else {
                  toast.error('failed');
                }

                console.log("stt elapsed " + (performance.now() - startTime) + 'ms')
              })
              .catch(error => {
                toast.error('Failed to upload');
                setAudioBuffer([])
                console.error('上传错误:', error);
              });
        } else {
          // console.log('State changed in silenceDurationMS seconds!!!!!!!!!!!!!!!!!');
        }
      }, silenceDurationMS);

      return () => {
        clearTimeout(timerRef.current);
      };
    }

    // Clean up the timeout if the component unmounts or the state changes before 3 seconds

  }, [audioBuffer]);

  const vad = useMicVAD({
    onSpeechStart: () => {
      try {
        console.log("onSpeechStart");
        pauseAllAudio();

        if (messages.length > 0) {
          setSTTIng(true);

          setSpeakTimer(true);
          clearTimeout(timerRef.current);
          if (typeof messages[messages.length - 1].display.content === 'object') {
            abortStreaming(messages[messages.length - 1].display.msgID, "no")
            // setMessages(currentMessages => {
            //     console.log(currentMessages.filter(item => item.id !== msgID));
            //     return [...currentMessages.map(item => {
            //         if (item.id === messages[messages.length - 1].display.msgID) {
            //             return { ...item, msg: text }; // 返回更新后的字典
            //         }
            //         return item; // 其他字典保持不变
            //     })]
            // })
          }
        }

      } catch (e) {
        console.error("onSpeechStart error:" + e)
      }
    },
    onSpeechEnd: (float32Audio) => {
      try {
        console.log("onSpeechEnd");
        setAudioBuffer((prevItems) => [...prevItems, utils.encodeWAV(float32Audio)]);
        setSpeakTimer(false);
      } catch (e) {
        console.error("onSpeechEnd error:" + e)
      }
    },
  });

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
      useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} isShared={false} session={session} />
        ) : (
          <EmptyScreen />
        )}
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        micOn={micOn}
        setMicOn={setMicOn}
        STTIng={STTIng}
        voiceContinuationEnable={voiceContinuationEnable}
        setVoiceContinuationEnable={setVoiceContinuationEnable}
        micAvailable={micAvailable}
        vad={vad}
      />
    </div>
  )
}

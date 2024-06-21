'use client'

import * as React from 'react'
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {cn, loadCacheUserCookies, loadUserCookies, stopAllAudio} from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import {IconGitHub, IconPlayMedia, IconSpinner, IconStop} from '@/components/ui/icons'
import {spinner} from "@/components/stocks";
import {toast} from "sonner";
import {Chat} from "@/lib/types";

interface TTSButtonProps extends ButtonProps {
  text?: string
    chat?: Chat
}

export function TTSButton({
  text = '',
                              chat,
  ...props
}: TTSButtonProps) {
    const [canPlayThrough, setCanPlayThrough] = React.useState(false)
    const [canPlay, setCanPlay] = React.useState(false)
    const [readingLoud, setReadingLoud] = React.useState<boolean>(false)
    const audioRef = React.useRef(null);

    const handleCanPlay = (e) => {
        if (e.target) {
            const element = e.target as HTMLMediaElement;
            element.play();
            element.removeEventListener('canplay', handleCanPlay);
        }
    }

    const handleTTS = () => {
        if (canPlay) {
            // console.log(audioRef.current);
            if (!readingLoud) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } else {
            const formData = new FormData();
            formData.append('text', text);
            formData.append('teacher_name', chat?.chatParams['teacherName']);
            formData.append('teacher_gender', chat?.chatParams['teacherGender']);
            formData.append('lang', chat?.chatParams['teacherGender']);
            const startTime = performance.now();
            fetch(process.env.TTS_URL, {
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
                    setCanPlay(true);
                    audioRef.current = new Audio("data:audio/wav;base64,"+wavBuffer);
                    audioRef.current.addEventListener('canplay', handleCanPlay);
                    audioRef.current.addEventListener('pause', ()=> setReadingLoud(false));
                    audioRef.current.addEventListener('ended', ()=> setReadingLoud(false));
                    audioRef.current.addEventListener('canplaythrough', ()=> setCanPlayThrough(true));
                    console.log("tts elapsed " + (performance.now() - startTime) + 'ms')
                })
                .catch(error => {
                    toast.error('Failed to generate voice');
                });
        }
    }

  return (
      <Tooltip>
          <TooltipTrigger asChild>
              <Button
                  variant="outline"
                  size="icon"
                  className={`${readingLoud && canPlayThrough && ('tts-btn-stop')} bg-blue-50 hover:bg-blue-200 size-6 rounded-full p-0 mr-1`}
                  onClick={async (e) => {
                      e.preventDefault();
                      stopAllAudio();
                      // console.log(chat);
                      setReadingLoud(!readingLoud);
                      handleTTS();
                  }}
              >
                  {readingLoud ? (
                      canPlayThrough ? (<IconStop className="size-4"/>) : (spinner)
                  ) : (
                      <IconPlayMedia className="size-4"/>
                  )}
                  <span className="sr-only">{readingLoud ? ("停止") : ("朗读")}</span>
              </Button>
          </TooltipTrigger>
          <TooltipContent>朗读</TooltipContent>
      </Tooltip>
  )
}

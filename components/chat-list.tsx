import { Separator } from '@/components/ui/separator'
import { UIState } from '@/lib/chat/actions'
import { Session } from '@/lib/types'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import * as React from "react";
import {useTranslations} from "next-intl";

export interface ChatList {
  messages: UIState
  session?: Session
  isShared: boolean
  // clickDiv: ()=>void
  // childDivRef: React.Ref<any>
}

export function ChatList({ messages, session, isShared }: ChatList) {

  if (!messages.length) {
    return null
  }

  const t = useTranslations('Common');

  return (

    <div
        // onClick={clickDiv}
        // ref={childDivRef}
        // onMouseMove={()=>{setChatOpacity(100)}}
        // onMouseOut={()=>{setChatOpacity(10)}}
        className={`pb-4 pt-2 md:pt-6 bg-gradient-to-b from-muted/60 from-0% to-muted/80 to-50% relative mx-auto max-w-2xl px-4`}>
      {!isShared && !session ? (
        <>
          <div className="group relative mb-4 flex items-start md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="text-muted-foreground leading-normal">
                {t('needLoginHint0')}{' '}
                <Link href="/login" className="underline">
                  {t('needLoginHint1')}
                </Link>{' '}
                {t('needLoginHint2')}{' '}
                <Link href="/signup" className="underline">
                  {t('needLoginHint3')}
                </Link>{' '}
                {t('needLoginHint4')}
              </p>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      ) : null}

      {messages.map((message, index) => {
        if (messages[0].display.props.children.length > 0 || index > 0) {
          return (
              <div key={message.id}>
                {message.display}
                {index < messages.length - 1 && <Separator className="my-4" />}
              </div>
          )
        }
      })}
    </div>
  )
}

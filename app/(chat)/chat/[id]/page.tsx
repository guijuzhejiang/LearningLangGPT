import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import {getChat, getCountDown, getMissingKeys} from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    return {}
  }

  const chat = await getChat(params.id, session.user.id)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  if (!session?.user) {
    redirect(`${process.env.NODE_ENV === "development"?'/':'/'}/login?next=/learninglang/chat/${params.id}`)
  }

  const userId = session.user.id as string
  const chat = await getChat(params.id, userId)
  const remainingSecs = await getCountDown(params.id)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== session?.user?.id) {
    // notFound()
    redirect(`${process.env.NODE_ENV === "development"?'/':'/'}/login?next=/learninglang/chat/${params.id}`)
  }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages, chatParams:chat.chatParams }}>
      <Chat
        id={chat.id}
        session={session}
        chatParams={chat.chatParams}
        initialMessages={chat.messages}
        remainingSecs={typeof remainingSecs === 'number'?remainingSecs:60*6}
        missingKeys={missingKeys}
      />
    </AI>
  )
}

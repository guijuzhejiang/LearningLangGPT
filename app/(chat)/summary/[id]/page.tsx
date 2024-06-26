import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Session } from '@/lib/types'
import * as React from "react";
import {Summary} from "@/components/summary";

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

export default async function SummaryPage({ params }: ChatPageProps) {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect(`${process.env.NODE_ENV === "development"?'/':'/'}/login?next=/learninglang/chat/${params.id}`)
  }

  const userId = session.user.id as string
  const chat = await getChat(params.id, userId)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== session?.user?.id) {
    // notFound()
    redirect(`${process.env.NODE_ENV === "development"?'/':'/'}/login?next=/learninglang/chat/${params.id}`)
  }

  return (
      <Summary
          id={chat.id}
          session={session}
          chat={chat}
      />
  )
}

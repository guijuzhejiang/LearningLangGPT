import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          欢迎来到AI外语通!{""+process.env.STT_URL}
        </h1>
        <p className="leading-normal text-muted-foreground">
          {/*This is an open source AI chatbot app template built with{' '}*/}
          {/*<ExternalLink href="https://nextjs.org">Next.js</ExternalLink>, the{' '}*/}
          {/*<ExternalLink href="https://sdk.vercel.ai">*/}
          {/*  Vercel AI SDK*/}
          {/*</ExternalLink>*/}
          {/*, and{' '}*/}
          {/*<ExternalLink href="https://vercel.com/storage/kv">*/}
          {/*  Vercel KV*/}
          {/*</ExternalLink>*/}
          {/*.*/}
          朋友们，准备好迎接语言学习新纪元了吗?

        </p>
        <p className="leading-normal text-muted-foreground">
          你可以随时随地与一位幽默风趣、耐心十足的外语老师对话。无论你说中文还是英文,它都能用纯正流利的外语来回应,循循善诱地帮你练习口语。
        </p>
        <p className="leading-normal text-muted-foreground">
          她可以聊人生，聊梦想，分享快乐和尴尬趣事。她可以是你的外语老师，也可以是你的红颜知己。
        </p>
        <p className="leading-normal text-muted-foreground">
          现在开始免费体验,让外语学习不再是枯燥乏味，让你在轻松愉快的互动中提升外语口语水平！
        </p>
      </div>
    </div>
  )
}

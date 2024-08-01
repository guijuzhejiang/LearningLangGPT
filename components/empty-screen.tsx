import { IconVoiceContinuation } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          欢迎来到AI外语通!
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
        <p className="leading-normal text-primary opacity-75">
          为了获得最佳的语音识别效果，请在使用语音输入功能时关闭扬声器并佩戴耳机，以确保语音输入的准确性。
        </p>
        {/*<p className="leading-normal text-muted-foreground flex ">*/}
        {/*  <span>点击按钮</span><span><IconVoiceContinuation /></span><span>后可自动发送语音。</span>*/}
        {/*</p>*/}
      </div>
    </div>
  )
}

import {useLocale, useTranslations} from 'next-intl';

export function EmptyScreen() {
  const t = useTranslations('EmptyScreen');
  const locale = useLocale();

  return (
    <div key={locale} className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          {t('title')}
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
          {t('p0')}

        </p>
        <p className="leading-normal text-muted-foreground">
          {t('p1')}
        </p>
        <p className="leading-normal text-primary opacity-75">
          {t('p2')}
        </p>
        <p className="leading-normal text-primary opacity-75">
          {t('p3')}
        </p>
        {/*<p className="leading-normal text-muted-foreground flex ">*/}
        {/*  <span>点击按钮</span><span><IconVoiceContinuation /></span><span>后可自动发送语音。</span>*/}
        {/*</p>*/}
      </div>
    </div>
  )
}

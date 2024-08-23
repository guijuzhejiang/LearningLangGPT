import {GeistSans} from 'geist/font/sans'
import {GeistMono} from 'geist/font/mono'

import '@/app/globals.css'
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import {cn} from '@/lib/utils'
import {TailwindIndicator} from '@/components/tailwind-indicator'
import {Providers} from '@/components/providers'
import {Header} from '@/components/header'
import {Toaster} from '@/components/ui/sonner'
import Script from "next/script";

export const metadata = {
    metadataBase: process.env.VERCEL_URL
        ? new URL(`https://${process.env.VERCEL_URL}`)
        : undefined,
    title: {
        default: 'AI外语通',
        template: `%s - AI外语通`
    },
    keywords: ['免费', '外语学习', '在线', 'AI', '口语'],
    description: '通过AI聊天方式轻松学外语，提升语言交流能力，提供真实的对话体验，适合各个水平的学习者。立即加入，享受智能互动学习的乐趣！',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png'
    }
}

export const viewport = {
    themeColor: [
        {media: '(prefers-color-scheme: light)', color: 'white'},
        {media: '(prefers-color-scheme: dark)', color: 'black'}
    ]
}

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({children}: RootLayoutProps) {
    const locale = await getLocale();
    const messages = await getMessages();
    return (
        <html lang={locale} suppressHydrationWarning>
          <head>
              <Script src="https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js" strategy="beforeInteractive"/>
              {/*<Script src="https://hm.baidu.com/hm.js?d16d39a1b531ab4a982a38f9852f79ea" strategy="lazyOnload"/>*/}
              <Script src="/learninglang/bdTrack.js" strategy="lazyOnload"/>
          </head>
          <body
              className={cn(
                  'font-sans antialiased',
                  GeistSans.variable,
                  GeistMono.variable
              )}
          >
            <Toaster position="top-center"/>
            <Providers
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <NextIntlClientProvider messages={messages}>
                  <div className="flex flex-col min-h-screen">
                      <Header/>
                      <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
                  </div>
                </NextIntlClientProvider>
                <TailwindIndicator/>
            </Providers>
          </body>
        </html>
    )
}

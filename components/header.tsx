import * as React from 'react'
import Link from 'next/link'

import {auth} from '@/auth'
import {Button, buttonVariants} from '@/components/ui/button'
import {
    IconNextChat,
    IconSeparator,
} from '@/components/ui/icons'
import {UserMenu} from '@/components/user-menu'
import {SidebarMobile} from './sidebar-mobile'
import {SidebarToggle} from './sidebar-toggle'
import {ChatHistory} from './chat-history'
import {Session} from '@/lib/types'
import {UserGuideButton} from "@/components/user-guide-button";

async function UserOrLogin() {
    const session = (await auth()) as Session
    return (
        <>
            {session?.user ? (
                <>
                    <SidebarMobile>
                        <ChatHistory userId={session.user.id}/>
                    </SidebarMobile>
                    <SidebarToggle/>
                </>
            ) : (
                <Link href="/new" rel="nofollow">
                    <IconNextChat className="size-6 mr-2 dark:hidden" inverted/>
                    <IconNextChat className="hidden size-6 mr-2 dark:block"/>
                </Link>
            )}
            <div className="flex items-center">
                <IconSeparator className="size-6 text-muted-foreground/50"/>
                {session?.user ? (
                    <UserMenu user={session.user}/>
                ) : (
                    <Button variant="link" asChild className="-ml-2">
                        <Link href="/login">登录</Link>
                    </Button>
                )}
            </div>
        </>
    )
}

async function UserGuide() {
    const session = (await auth()) as Session
    return (
        <Button
            // onClick={()=>{
            //
            // }}
        >
            How to use
        </Button>
    )
}

// export async function getServerSideProps(context) {
//     const { req } = context;
//     const host = req.headers.host; // 获取 host
//     const protocol = req.headers['x-forwarded-proto'] || 'http';
//     console.log("reqrxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxeq");
//     // 注意：在 Vercel 或其他云服务上部署时，使用 'x-forwarded-proto' 头来确定协议可能更为准确。
//     const fullUrl = `${protocol}://${host}${req.url}`; // 获取完整 URL
//
//     return {
//         props: {}, // 将所需数据作为 props 传递给页面
//     };
// }

export async function Header() {
    const session = (await auth()) as Session
    return (
        <>
            <header
                className="sticky top-0 z-6 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
                <div className="UserOrLoginContainer flex items-center">
                    <React.Suspense fallback={<div className="flex-1 overflow-auto"/>}>
                        <UserOrLogin/>
                    </React.Suspense>
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <React.Suspense>
                        <UserGuideButton/>
                    </React.Suspense>
                </div>
            </header>
        </>
    )
}

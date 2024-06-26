'use client'

import {Chat, Session} from '@/lib/types'
import {usePathname, useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import * as React from "react";
import {getScore} from "@/app/actions";
import {spinner} from "@/components/stocks";
import {ScoreSheet} from "@/components/score-sheet";
import {IconContinue, IconPlus} from "@/components/ui/icons";

export interface SummaryProps extends React.ComponentProps<'div'> {
    id?: string
    session?: Session
    chat: Chat
}

export function Summary({id, className, session, chat}: SummaryProps) {
    const router = useRouter();
    const path = usePathname();
    const [summaryContent, setSummaryContent] = React.useState('')
    const [displayJSON, setDisplayJSON] = React.useState(false)

    React.useEffect(() => {
        ;(async () => {
            setDisplayJSON(false);
            setSummaryContent('');
            const res = await getScore(chat);
            setDisplayJSON(typeof res === 'string')
            setSummaryContent(res);
        })()
    }, [])

    const handleContinueStudy = async (e) => {
        e.preventDefault();
        router.push(`/chat/${chat.id}`)
    }

    const handleCreateNewChat = async (e) => {
        e.preventDefault();
        router.push('/')
    }

    return (
        <div
            className="p-4 ml-4 relative group w-full overflow-auto peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
        >
            {displayJSON ? (
                <p className="w-full whitespace-pre-line">
                    {summaryContent ? JSON.stringify(summaryContent) : spinner}
                </p>
            ) : (
                <ScoreSheet summaryString={summaryContent} chat={chat}/>
            )}


            <div
                className="fixed bottom-6 right-6 flex gap-2">
                <Button className={"w-full px-1 bg-green-100 hover:bg-green-200"} variant="outline" size="icon" onClick={handleCreateNewChat}>
                    <IconPlus className={"size-8"}/>
                    <span className={"text-xl"}>&nbsp;新建对话</span>
                </Button>

                <Button className={"w-full px-1 bg-amber-100 hover:bg-amber-200"} variant="outline" size="icon" onClick={handleContinueStudy}>
                    <IconContinue className={"size-8"}/>
                    <span className={"text-xl"}>&nbsp;继续学习</span>
                </Button>
            </div>
        </div>
    )
}

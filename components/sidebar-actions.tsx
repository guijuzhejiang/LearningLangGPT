'use client'

import {useRouter} from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'
import { ServerActionResult, type Chat } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {IconSpinner, IconTrash} from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import Cookies from "js-cookie";
import {ScoreSheetDialog} from "@/components/score-sheet-dialog";

interface SidebarActionsProps {
  chat: Chat
  removeChat: (args: { id: string; path: string }) => ServerActionResult<void>
}

export function SidebarActions({
  chat,
  removeChat,
}: SidebarActionsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()

  return (
    <>
      <div className="">
        {/* score sheet */}
        <ScoreSheetDialog chat={chat} isRemovePending={isRemovePending}/>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`size-7 p-0 hover:bg-background`}
              disabled={isRemovePending}
              onClick={() => {
                setDeleteDialogOpen(true);
                // console.log(chat);
              }}
            >
              <IconTrash />
              <span className="sr-only">删除</span>
            </Button>
          </TooltipTrigger>
          {/*<TooltipContent>Delete chat</TooltipContent>*/}
          <TooltipContent>删除</TooltipContent>
        </Tooltip>
      </div>

      {/* delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>你确定吗?</AlertDialogTitle>
            <AlertDialogDescription>
              这将会永久删除你的聊天记录.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={event => {
                event.preventDefault()
                // @ts-ignore
                startRemoveTransition(async () => {
                  const result = await removeChat({
                    id: chat.id,
                    path: chat.path
                  })

                  if (result && 'error' in result) {
                    toast.error(result.error)
                    return
                  }

                  setDeleteDialogOpen(false)
                  router.refresh()
                  router.push('/')
                  toast.success('对话已删除')
                  Object.keys(Cookies.get()).forEach(function(cookieName) {
                    if (cookieName.includes(chat.id)) {
                      Cookies.remove(cookieName);
                    }
                  });
                })
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

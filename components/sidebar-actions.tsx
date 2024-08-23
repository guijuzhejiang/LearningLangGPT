'use client'

import {usePathname, useRouter} from 'next/navigation'
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
import {IconScoreSheet, IconSpinner, IconTrash} from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import Cookies from "js-cookie";
import {ScoreSheetDialog} from "@/components/score-sheet-dialog";
import {useLocale, useTranslations} from "next-intl";

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
  const path = usePathname();
  const t = useTranslations('SidebarActions');
  const chatHistoryL = useTranslations('ChatHistory');
  const locale = useLocale();

  return (
    <div key={locale}>
      <div className="">
        {/* score sheet */}
        <ScoreSheetDialog chat={chat} isRemovePending={isRemovePending}>
          <Button
              variant="ghost"
              className={`${chat.id === path.split('/').pop() ? 'curScoreSheetBtn':''} size-7 p-0 hover:bg-background`}
              disabled={isRemovePending}
              id={`score-btn-${chat.id}`}
              // onClick={() => {}}
          >
            <IconScoreSheet fill={"#ffffff"}/>
            <span className="sr-only">{t('scoreBtnTooltip')}</span>
          </Button>
        </ScoreSheetDialog>

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
            </Button>
          </TooltipTrigger>
          {/*<TooltipContent>Delete chat</TooltipContent>*/}
          <TooltipContent>{t('delBtnTooltip')}</TooltipContent>
        </Tooltip>
      </div>

      {/* delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{chatHistoryL('alertDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {chatHistoryL('alertDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              {chatHistoryL('alertDialogCancel')}
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
                  toast.success(chatHistoryL('chatDeleteToast'))
                  Object.keys(Cookies.get()).forEach(function(cookieName) {
                    if (cookieName.includes(chat.id)) {
                      Cookies.remove(cookieName);
                    }
                  });
                })
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              {t('delBtnTooltip')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

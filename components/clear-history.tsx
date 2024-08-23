'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ServerActionResult } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { IconSpinner } from '@/components/ui/icons'
import Cookies from "js-cookie";
import {useTranslations} from "next-intl";

interface ClearHistoryProps {
  isEnabled: boolean
  clearChats: () => ServerActionResult<void>
}

export function ClearHistory({
  isEnabled = false,
  clearChats
}: ClearHistoryProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const t = useTranslations('ChatHistory');
  // const locale = useLocale();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" disabled={!isEnabled || isPending}>
          {isPending && <IconSpinner className="mr-2" />}
          {t('clearHistoryBtn')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('clearHistoryBtn')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('alertDialogDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('alertDialogCancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={event => {
              event.preventDefault()
              startTransition(async () => {
                const result = await clearChats()
                if (result && 'error' in result) {
                  toast.error(result.error)
                  return
                }

                setOpen(false);
                Object.keys(Cookies.get()).forEach(function(cookieName) {
                  if (cookieName.startsWith('chat_')) {
                    Cookies.remove(cookieName);
                  }
                });
              })
            }}
          >
            {isPending && <IconSpinner className="mr-2 animate-spin" />}
            {t('alertDialogDelete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

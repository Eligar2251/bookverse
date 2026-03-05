'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { markAllNotificationsRead } from '@/app/actions/notifications'
import { Check, Loader2 } from 'lucide-react'

export function MarkAllReadButton() {
  const [pending, start] = useTransition()
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => start(async () => {
        await markAllNotificationsRead()
        router.refresh()
      })}
    >
      {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
      Прочитать все
    </Button>
  )
}
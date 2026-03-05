'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'

export function ReportActions({ reportId }: { reportId: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const handle = (status: 'resolved' | 'dismissed') => {
    start(async () => {
      const supabase = createClient()
      await supabase.from('reports').update({
        status, resolved_at: new Date().toISOString(),
      }).eq('id', reportId)
      toast.success(status === 'resolved' ? 'Решено' : 'Отклонено')
      router.refresh()
    })
  }

  return (
    <div className="flex gap-1">
      <Button variant="outline" size="sm" disabled={pending} onClick={() => handle('resolved')}>
        <Check className="h-3.5 w-3.5 mr-1" />Решить
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => handle('dismissed')}>
        <X className="h-3.5 w-3.5 mr-1" />Отклонить
      </Button>
    </div>
  )
}
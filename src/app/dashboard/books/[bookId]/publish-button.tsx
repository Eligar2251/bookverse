'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { publishBook } from '@/app/actions/books'
import { toast } from 'sonner'
import { Globe, Loader2 } from 'lucide-react'

export function PublishButton({ bookId, isPublished }: { bookId: string; isPublished: boolean }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  if (isPublished) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-600 h-9 px-3 flex items-center">
        <Globe className="h-3 w-3 mr-1" />Опубликована
      </Badge>
    )
  }

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => start(async () => {
        const res = await publishBook(bookId)
        if (res.error) { toast.error(res.error); return }
        toast.success('Книга опубликована!')
        router.refresh()
      })}
    >
      {pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
      Опубликовать
    </Button>
  )
}
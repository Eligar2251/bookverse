'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Bookmark, Bell } from 'lucide-react'

export function BookActions({ bookId }: { bookId: string }) {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBookmark = async () => {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: existing } = await supabase
      .from('library_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single()

    if (existing) {
      await supabase.from('library_items').delete().eq('id', existing.id)
      toast.success('Убрано из библиотеки')
    } else {
      await supabase.from('library_items').insert({ user_id: user.id, book_id: bookId, shelf: 'want_to_read' })
      toast.success('Добавлено в библиотеку')
    }
    setLoading(false)
  }

  const handleSubscribe = async () => {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', 'book')
      .eq('target_id', bookId)
      .single()

    if (existing) {
      await supabase.from('subscriptions').delete().eq('id', existing.id)
      toast.success('Подписка отменена')
    } else {
      await supabase.from('subscriptions').insert({ user_id: user.id, target_type: 'book', target_id: bookId })
      toast.success('Вы подписались на обновления')
    }
    setLoading(false)
  }

  return (
    <>
      <Button variant="outline" size="lg" onClick={handleBookmark} disabled={loading}>
        <Bookmark className="h-4 w-4 mr-2" />В библиотеку
      </Button>
      <Button variant="outline" size="lg" onClick={handleSubscribe} disabled={loading}>
        <Bell className="h-4 w-4 mr-2" />Подписаться
      </Button>
    </>
  )
}
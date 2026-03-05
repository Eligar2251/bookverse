'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PenTool, Loader2 } from 'lucide-react'

export function BecomeAuthorButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBecomeAuthor = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ role: 'author' })
        .eq('id', user.id)

      if (error) {
        toast.error('Ошибка: ' + error.message)
        return
      }

      toast.success('Вы теперь автор! 🎉')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleBecomeAuthor} disabled={loading} size="lg">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenTool className="mr-2 h-4 w-4" />}
      Стать автором
    </Button>
  )
}
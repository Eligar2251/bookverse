'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function AdminUserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const handleRoleChange = (newRole: string) => {
    start(async () => {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
      if (error) { toast.error(error.message); return }
      toast.success(`Роль изменена на ${newRole}`)
      router.refresh()
    })
  }

  return (
    <Select value={currentRole} onValueChange={handleRoleChange} disabled={pending}>
      <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="reader">Reader</SelectItem>
        <SelectItem value="author">Author</SelectItem>
        <SelectItem value="moderator">Moderator</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  display_name?: string; bio?: string; avatar_url?: string | null
  external_links?: Record<string, string>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('profiles').update(data).eq('id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}
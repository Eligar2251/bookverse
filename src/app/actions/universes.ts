'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUniverse(data: { title: string; description: string; cover_url: string | null; is_public: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: result, error } = await supabase
    .from('universes')
    .insert({ ...data, author_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/universes')
  return { data: result }
}

export async function updateUniverse(id: string, data: Record<string, any>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: result, error } = await supabase
    .from('universes')
    .update(data)
    .eq('id', id)
    .eq('author_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/universes')
  revalidatePath(`/dashboard/universes/${id}`)
  return { data: result }
}

export async function deleteUniverse(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('universes').delete().eq('id', id).eq('author_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/universes')
  return { success: true }
}
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEntity(universeId: string, data: {
  entity_type: string; name: string; avatar_url?: string | null
  data: Record<string, any>; custom_fields?: Record<string, any>
  is_public?: boolean; spoiler_level?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: result, error } = await supabase
    .from('entities')
    .insert({ universe_id: universeId, ...data })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/universes/${universeId}`)
  return { data: result }
}

export async function updateEntity(id: string, universeId: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { data: result, error } = await supabase
    .from('entities')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/universes/${universeId}`)
  return { data: result }
}

export async function deleteEntity(id: string, universeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('entities').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/universes/${universeId}`)
  return { success: true }
}

export async function createEntityRelation(data: {
  from_entity_id: string; to_entity_id: string; relation_type: string; label?: string; is_bidirectional?: boolean
}, universeId: string) {
  const supabase = await createClient()
  const { data: result, error } = await supabase.from('entity_relations').insert(data).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/universes/${universeId}`)
  return { data: result }
}

export async function deleteEntityRelation(id: string, universeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('entity_relations').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/universes/${universeId}`)
  return { success: true }
}
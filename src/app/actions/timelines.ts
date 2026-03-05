'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTimeline(universeId: string, title: string, description: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timelines')
    .insert({ universe_id: universeId, title, description })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/universes/${universeId}`)
  return { data }
}

export async function deleteTimeline(id: string, universeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('timelines').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/universes/${universeId}`)
  return { success: true }
}

export async function createTimelineEvent(timelineId: string, data: {
  title: string; description: string; date_label: string; era?: string
  sort_order: number; entity_ids?: string[]; chapter_id?: string | null
}) {
  const supabase = await createClient()
  const { data: result, error } = await supabase
    .from('timeline_events')
    .insert({ timeline_id: timelineId, ...data })
    .select()
    .single()
  if (error) return { error: error.message }
  return { data: result }
}

export async function updateTimelineEvent(id: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { error } = await supabase.from('timeline_events').update(updates).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteTimelineEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('timeline_events').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function reorderTimelineEvents(events: { id: string; sort_order: number }[]) {
  const supabase = await createClient()
  for (const e of events) {
    await supabase.from('timeline_events').update({ sort_order: e.sort_order }).eq('id', e.id)
  }
  return { success: true }
}
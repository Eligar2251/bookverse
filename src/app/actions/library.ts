'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setBookShelf(bookId: string, shelf: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: existing } = await supabase
    .from('library_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single()

  if (existing) {
    await supabase.from('library_items').update({ shelf }).eq('id', existing.id)
  } else {
    await supabase.from('library_items').insert({ user_id: user.id, book_id: bookId, shelf })
  }
  revalidatePath('/library')
  return { success: true }
}

export async function removeFromLibrary(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('library_items').delete().eq('user_id', user.id).eq('book_id', bookId)
  revalidatePath('/library')
  return { success: true }
}
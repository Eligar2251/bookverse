'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createReview(bookId: string, data: {
  rating_overall: number; rating_style: number; rating_story: number
  rating_characters: number; rating_grammar: number
  content: string; has_spoilers: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('reviews').insert({ ...data, user_id: user.id, book_id: bookId })
  if (error) {
    if (error.code === '23505') return { error: 'Вы уже оставили рецензию на эту книгу' }
    return { error: error.message }
  }
  revalidatePath(`/books`)
  return { success: true }
}

export async function updateReview(reviewId: string, data: Record<string, any>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('reviews').update(data).eq('id', reviewId).eq('user_id', user.id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function respondToReview(reviewId: string, response: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('reviews')
    .update({ author_response: response, author_response_at: new Date().toISOString() })
    .eq('id', reviewId)
  if (error) return { error: error.message }
  return { success: true }
}
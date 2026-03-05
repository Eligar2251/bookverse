'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createChapter(bookId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get next chapter number
  const { data: last } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('book_id', bookId)
    .order('chapter_number', { ascending: false })
    .limit(1)
    .single()

  const nextNum = (last?.chapter_number || 0) + 1

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      book_id: bookId,
      chapter_number: nextNum,
      title,
      status: 'draft',
      content: '',
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/books/${bookId}`)
  return { data }
}

export async function updateChapter(chapterId: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('chapters')
    .update(updates)
    .eq('id', chapterId)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function publishChapter(chapterId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chapters')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', chapterId)
    .select('*, book:books(slug)')
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/books/${(data as any).book?.slug}`)
  return { data }
}

export async function deleteChapter(chapterId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('chapters').delete().eq('id', chapterId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function reorderChapters(bookId: string, orderedIds: { id: string; chapter_number: number }[]) {
  const supabase = await createClient()
  for (const item of orderedIds) {
    await supabase.from('chapters').update({ chapter_number: item.chapter_number }).eq('id', item.id)
  }
  revalidatePath(`/dashboard/books/${bookId}`)
  return { success: true }
}

export async function saveChapterContent(chapterId: string, content: string, wordCount: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('chapters')
    .update({ content, word_count: wordCount, updated_at: new Date().toISOString() })
    .eq('id', chapterId)

  if (error) return { error: error.message }
  return { success: true }
}
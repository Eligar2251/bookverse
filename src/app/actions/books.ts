'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/utils'

export async function createBook(formData: {
  title: string
  description_short: string
  description_full: string
  cover_url: string | null
  status: string
  age_rating: string
  genres: string[]
  tags: string[]
  content_warnings: string[]
  comments_enabled: boolean
  universe_id: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  let slug = generateSlug(formData.title)
  const { data: existing } = await supabase.from('books').select('id').eq('slug', slug).single()
  if (existing) slug = slug + '-' + Date.now().toString(36)

  const { data, error } = await supabase
    .from('books')
    .insert({
      ...formData,
      author_id: user.id,
      slug,
      is_published: false,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/books')
  return { data }
}

export async function updateBook(bookId: string, formData: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('books')
    .update(formData)
    .eq('id', bookId)
    .eq('author_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/books')
  revalidatePath(`/books/${data.slug}`)
  return { data }
}

export async function deleteBook(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('books').delete().eq('id', bookId).eq('author_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/books')
  return { success: true }
}

export async function publishBook(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('books')
    .update({ is_published: true })
    .eq('id', bookId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/books')
  revalidatePath('/books')
  return { success: true }
}
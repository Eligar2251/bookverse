import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LibraryClient } from './library-client'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/library')

  const { data: items } = await supabase
    .from('library_items')
    .select('*, book:books(id, title, slug, cover_url, status, total_words, avg_rating, author:profiles!books_author_id_fkey(username, display_name))')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📚 Моя библиотека</h1>
      <LibraryClient items={items || []} />
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { WritePageClient } from './write-client'

export default async function WritePage({
  params, searchParams,
}: {
  params: Promise<{ bookId: string }>
  searchParams: Promise<{ chapter?: string }>
}) {
  const { bookId } = await params
  const { chapter: chapterId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: book } = await supabase
    .from('books')
    .select('id, title, author_id, universe_id')
    .eq('id', bookId).eq('author_id', user.id).single()
  if (!book) notFound()

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title, word_count, status')
    .eq('book_id', bookId).order('chapter_number')

  let activeChapter = null
  if (chapterId) {
    const { data } = await supabase.from('chapters').select('*').eq('id', chapterId).single()
    activeChapter = data
  } else if (chapters && chapters.length > 0) {
    const { data } = await supabase.from('chapters').select('*').eq('id', chapters[0].id).single()
    activeChapter = data
  }

  // Load entities from universe
  let entities: { id: string; name: string; entity_type: string }[] = []
  if (book.universe_id) {
    const { data } = await supabase
      .from('entities')
      .select('id, name, entity_type')
      .eq('universe_id', book.universe_id)
      .order('name')
    entities = data || []
  }

  return (
    <WritePageClient
      book={book}
      chapters={chapters || []}
      activeChapter={activeChapter}
      entities={entities}
    />
  )
}
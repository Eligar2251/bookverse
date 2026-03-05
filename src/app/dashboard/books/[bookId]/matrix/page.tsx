import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { MatrixView } from '@/components/matrix/matrix-view'

export default async function MatrixPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: book } = await supabase
    .from('books').select('id, title, universe_id')
    .eq('id', bookId).eq('author_id', user.id).single()
  if (!book) notFound()

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title')
    .eq('book_id', bookId)
    .order('chapter_number')

  const { data: tags } = await supabase
    .from('chapter_entity_tags')
    .select('chapter_id, entity_id')
    .in('chapter_id', chapters?.map(c => c.id) || [])

  let entities: any[] = []
  if (book.universe_id) {
    const { data } = await supabase
      .from('entities')
      .select('id, name, entity_type')
      .eq('universe_id', book.universe_id)
      .order('name')
    entities = data || []
  }

  // Build matrix data
  const tagSet = new Set((tags || []).map(t => `${t.chapter_id}:${t.entity_id}`))

  return (
    <div className="p-6 max-w-full space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/books/${bookId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">📊 Матрица — {book.title}</h1>
      </div>
      <MatrixView
        chapters={chapters || []}
        entities={entities}
        tagSet={tagSet}
      />
    </div>
  )
}
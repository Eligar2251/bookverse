import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReaderView } from './reader-view'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; chapterNum: string }> }): Promise<Metadata> {
  const { slug, chapterNum } = await params
  const supabase = await createClient()
  const { data: book } = await supabase.from('books').select('title').eq('slug', slug).single()
  return { title: book ? `Глава ${chapterNum} — ${book.title}` : 'Глава' }
}

export default async function ChapterReadPage({ params }: { params: Promise<{ slug: string; chapterNum: string }> }) {
  const { slug, chapterNum } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select('id, title, slug, author_id, comments_enabled, author:profiles!books_author_id_fkey(username, display_name)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!book) notFound()

  const num = parseInt(chapterNum)
  const { data: chapter } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', book.id)
    .eq('chapter_number', num)
    .eq('status', 'published')
    .single()

  if (!chapter) notFound()

  // Get prev/next
  const { data: allChapters } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('book_id', book.id)
    .eq('status', 'published')
    .order('chapter_number')

  const nums = allChapters?.map(c => c.chapter_number) || []
  const currentIdx = nums.indexOf(num)
  const prevNum = currentIdx > 0 ? nums[currentIdx - 1] : null
  const nextNum = currentIdx < nums.length - 1 ? nums[currentIdx + 1] : null

  // Increment views
  supabase.rpc('increment_chapter_views', { chapter_id: chapter.id }).then(() => {})

  return (
    <ReaderView
      book={{ id: book.id, title: book.title, slug: book.slug, author: (book as any).author }}
      chapter={chapter}
      prevNum={prevNum}
      nextNum={nextNum}
      totalChapters={nums.length}
    />
  )
}
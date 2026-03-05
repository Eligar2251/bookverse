import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookForm } from '@/components/books/book-form'
import { ChapterManager } from '@/components/chapters/chapter-manager'
import { formatNumber, getBookStatusLabel } from '@/lib/utils'
import { PenLine, Eye, ExternalLink, Globe } from 'lucide-react'
import { PublishButton } from './publish-button'

export default async function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .eq('author_id', user.id)
    .single()

  if (!book) notFound()

  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('chapter_number')

  const { data: genres } = await supabase.from('genres').select('*').order('sort_order')

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{getBookStatusLabel(book.status)}</Badge>
            <span className="text-sm text-muted-foreground">{formatNumber(book.total_words)} слов</span>
            {book.is_published && (
              <Link href={`/books/${book.slug}`} target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />Открыть
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {chapters && chapters.length > 0 && (
            <Link href={`/dashboard/books/${bookId}/write`}>
              <Button><PenLine className="h-4 w-4 mr-2" />Редактор</Button>
            </Link>
          )}
          <PublishButton bookId={bookId} isPublished={book.is_published} />
        </div>
      </div>

      <Tabs defaultValue="chapters">
        <TabsList>
          <TabsTrigger value="chapters">Главы ({chapters?.length || 0})</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="mt-4">
          <ChapterManager bookId={bookId} initialChapters={chapters || []} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <BookForm book={book} genres={genres || []} userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
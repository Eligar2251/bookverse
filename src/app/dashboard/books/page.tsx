import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, Eye, Star, MessageSquare } from 'lucide-react'
import { formatNumber, getBookStatusLabel, getBookStatusColor } from '@/lib/utils'

export default async function BooksListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои книги</h1>
        <Link href="/dashboard/books/new">
          <Button><Plus className="h-4 w-4 mr-2" />Создать книгу</Button>
        </Link>
      </div>

      {books && books.length > 0 ? (
        <div className="grid gap-4">
          {books.map(book => (
            <Link key={book.id} href={`/dashboard/books/${book.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-20 h-28 rounded-lg bg-muted overflow-hidden shrink-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                      <Badge variant="outline" className={`shrink-0 text-xs ${getBookStatusColor(book.status)} text-white border-0`}>
                        {getBookStatusLabel(book.status)}
                      </Badge>
                    </div>
                    {book.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {book.genres.map((g: string) => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{book.description_short || 'Нет описания'}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(book.total_views)}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{book.avg_rating > 0 ? book.avg_rating.toFixed(1) : '—'}</span>
                      <span>{formatNumber(book.total_words)} слов</span>
                      <span>{book.is_published ? '📤 Опубликована' : '📝 Не опубликована'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет книг</h3>
            <p className="text-muted-foreground mb-4">Начните с создания вашей первой книги</p>
            <Link href="/dashboard/books/new"><Button>Создать книгу</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
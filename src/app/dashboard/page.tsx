import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BecomeAuthorButton } from './become-author-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Eye, Users, MessageSquare, PenTool } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role === 'reader') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">✍️</div>
          <h1 className="text-3xl font-bold mb-4">Станьте автором</h1>
          <p className="text-muted-foreground mb-6">
            Активируйте режим автора, чтобы создавать книги и публиковать главы.
          </p>
          <BecomeAuthorButton />
        </div>
      </div>
    )
  }

  const { data: books } = await supabase
    .from('books')
    .select('id, title, slug, status, total_views, total_words, avg_rating, subscriber_count, cover_url, updated_at')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  const totalViews = books?.reduce((s, b) => s + b.total_views, 0) || 0
  const totalWords = books?.reduce((s, b) => s + b.total_words, 0) || 0
  const totalSubscribers = books?.reduce((s, b) => s + b.subscriber_count, 0) || 0

  const { count: commentsCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .in('chapter_id', (
      await supabase.from('chapters').select('id').in('book_id', books?.map(b => b.id) || [])
    ).data?.map(c => c.id) || [])

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Привет, {profile?.display_name || profile?.username}! 👋</h1>
          <p className="text-muted-foreground">Ваш авторский дашборд</p>
        </div>
        <Link href="/dashboard/books/new">
          <Button><PenTool className="h-4 w-4 mr-2" />Новая книга</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{books?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Книг</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Eye className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalViews)}</p>
                <p className="text-xs text-muted-foreground">Просмотров</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><Users className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalSubscribers)}</p>
                <p className="text-xs text-muted-foreground">Подписчиков</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10"><MessageSquare className="h-5 w-5 text-orange-500" /></div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(commentsCount || 0)}</p>
                <p className="text-xs text-muted-foreground">Комментариев</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {books && books.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-3">Последние книги</h2>
          <div className="grid gap-3">
            {books.slice(0, 5).map(book => (
              <Link key={book.id} href={`/dashboard/books/${book.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-16 rounded bg-muted overflow-hidden shrink-0">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{book.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(book.total_words)} слов · {formatNumber(book.total_views)} просм.
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      book.status === 'ongoing' ? 'bg-green-500/10 text-green-600' :
                      book.status === 'completed' ? 'bg-blue-500/10 text-blue-600' :
                      book.status === 'draft' ? 'bg-gray-500/10 text-gray-600' :
                      'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {book.status === 'ongoing' ? 'Пишется' : book.status === 'completed' ? 'Завершена' : book.status === 'draft' ? 'Черновик' : book.status}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold mb-2">У вас пока нет книг</h3>
            <p className="text-muted-foreground text-sm mb-4">Создайте свою первую книгу и начните писать</p>
            <Link href="/dashboard/books/new"><Button>Создать книгу</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
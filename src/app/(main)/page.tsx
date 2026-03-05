import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, TrendingUp, Star, Clock, CheckCircle } from 'lucide-react'
import { formatNumber, getBookStatusLabel, getBookStatusColor } from '@/lib/utils'
import { Book } from '@/lib/types/database'

async function getPopularBooks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('*, author:profiles!books_author_id_fkey(username, display_name, avatar_url)')
    .eq('is_published', true)
    .order('total_views', { ascending: false })
    .limit(10)
  return (data || []) as (Book & { author: { username: string; display_name: string | null; avatar_url: string | null } })[]
}

async function getRecentlyUpdated() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('*, author:profiles!books_author_id_fkey(username, display_name, avatar_url)')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(10)
  return (data || []) as (Book & { author: { username: string; display_name: string | null; avatar_url: string | null } })[]
}

async function getCompletedBooks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('*, author:profiles!books_author_id_fkey(username, display_name, avatar_url)')
    .eq('is_published', true)
    .eq('status', 'completed')
    .order('avg_rating', { ascending: false })
    .limit(10)
  return (data || []) as (Book & { author: { username: string; display_name: string | null; avatar_url: string | null } })[]
}

async function getGenres() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('genres')
    .select('*')
    .order('sort_order')
  return data || []
}

function BookCard({ book }: { book: Book & { author: { username: string; display_name: string | null; avatar_url: string | null } } }) {
  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full">
        <div className="aspect-[2/3] relative bg-muted overflow-hidden">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {book.age_rating}
            </Badge>
          </div>
          {book.status === 'completed' && (
            <div className="absolute top-2 left-2">
              <Badge className="text-xs bg-blue-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Завершена
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {book.author?.display_name || book.author?.username}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {book.avg_rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {book.avg_rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {formatNumber(book.total_views)}
            </span>
          </div>
          {book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.genres.slice(0, 2).map(g => (
                <Badge key={g} variant="outline" className="text-[10px] px-1.5 py-0">
                  {g}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function BookRow({ title, icon: Icon, books, href }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  books: (Book & { author: { username: string; display_name: string | null; avatar_url: string | null } })[]
  href: string
}) {
  if (books.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </h2>
        <Link href={href}>
          <Button variant="ghost" size="sm">Смотреть все →</Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.slice(0, 5).map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  )
}

export default async function HomePage() {
  const [popular, recent, completed, genres] = await Promise.all([
    getPopularBooks(),
    getRecentlyUpdated(),
    getCompletedBooks(),
    getGenres(),
  ])

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 p-8 md:p-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Создавайте миры.<br />
          <span className="text-primary">Рассказывайте истории.</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-6 max-w-2xl mx-auto">
          BookVerse — платформа для авторов и читателей. Пишите книги, стройте вселенные, находите свою аудиторию.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="text-base">Начать писать ✍️</Button>
          </Link>
          <Link href="/books">
            <Button size="lg" variant="outline" className="text-base">Читать книги 📖</Button>
          </Link>
        </div>
      </section>

      {/* Популярное */}
      <BookRow
        title="Популярное сейчас"
        icon={TrendingUp}
        books={popular}
        href="/rankings"
      />

      {/* Недавно обновлённые */}
      <BookRow
        title="Недавно обновлённые"
        icon={Clock}
        books={recent}
        href="/books?sort=updated"
      />

      {/* Завершённые */}
      <BookRow
        title="Завершённые книги"
        icon={CheckCircle}
        books={completed}
        href="/books?status=completed"
      />

      {/* Жанры */}
      {genres.length > 0 && (
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            📚 По жанрам
          </h2>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <Link key={genre.id} href={`/books?genre=${genre.slug}`}>
                <Badge
                  variant="outline"
                  className="text-sm px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {genre.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Призыв к действию для авторов */}
      <section className="rounded-2xl border bg-card p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Вы — автор?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Мощный редактор, инструменты миростроения, управление персонажами, таймлайны, и публикация для тысяч читателей — всё бесплатно.
        </p>
        <Link href="/register">
          <Button size="lg" variant="secondary">Создать аккаунт автора</Button>
        </Link>
      </section>
    </div>
  )
}
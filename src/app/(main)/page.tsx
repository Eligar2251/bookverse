import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, TrendingUp, Star, Clock, CheckCircle, Feather, Users, PenTool } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import type { Book } from '@/lib/types/database'

type BookWithAuthor = Book & {
  author: { username: string; display_name: string | null; avatar_url: string | null }
}

async function getPopularBooks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('*, author:profiles!books_author_id_fkey(username, display_name, avatar_url)')
    .eq('is_published', true)
    .order('total_views', { ascending: false })
    .limit(10)
  return (data || []) as BookWithAuthor[]
}

async function getRecentlyUpdated() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('*, author:profiles!books_author_id_fkey(username, display_name, avatar_url)')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(10)
  return (data || []) as BookWithAuthor[]
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
  return (data || []) as BookWithAuthor[]
}

async function getGenres() {
  const supabase = await createClient()
  const { data } = await supabase.from('genres').select('*').order('sort_order')
  return data || []
}

function BookCard({ book }: { book: BookWithAuthor }) {
  return (
    <Link href={`/books/${book.slug}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full border-transparent hover:border-primary/20">
        <div className="aspect-[2/3] relative bg-muted overflow-hidden">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
              <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-[10px] font-medium backdrop-blur-sm bg-background/80">
              {book.age_rating}
            </Badge>
          </div>
          {book.status === 'completed' && (
            <div className="absolute top-2 left-2">
              <Badge className="text-[10px] bg-primary/90 backdrop-blur-sm">
                <CheckCircle className="h-2.5 w-2.5 mr-0.5" />Завершена
              </Badge>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {book.author?.display_name || book.author?.username}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {book.avg_rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-secondary text-secondary" />
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
                <Badge key={g} variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
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
  books: BookWithAuthor[]
  href: string
}) {
  if (books.length === 0) return null
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2.5 tracking-tight">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          {title}
        </h2>
        <Link href={href}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary font-medium">
            Все →
          </Button>
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
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-14">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary/5 to-accent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative px-8 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Feather className="h-3.5 w-3.5" />
            Платформа для авторов и читателей
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Создавайте миры.
            <br />
            <span className="text-primary">Рассказывайте истории.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Мощный редактор, инструменты миростроения и сообщество читателей — всё в одном месте.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="text-base h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                <PenTool className="h-4 w-4 mr-2" />
                Начать писать
              </Button>
            </Link>
            <Link href="/books">
              <Button size="lg" variant="outline" className="text-base h-12 px-8 font-semibold">
                <BookOpen className="h-4 w-4 mr-2" />
                Читать книги
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{popular.length > 0 ? '∞' : '0'}</span> книг
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">Растём</span> вместе
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <BookRow title="Популярное сейчас" icon={TrendingUp} books={popular} href="/rankings" />
      <BookRow title="Недавно обновлённые" icon={Clock} books={recent} href="/books?sort=updated" />
      <BookRow title="Завершённые книги" icon={CheckCircle} books={completed} href="/books?status=completed" />

      {/* Genres */}
      {genres.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-5 tracking-tight">Жанры</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <Link key={genre.id} href={`/books?genre=${genre.slug}`}>
                <Badge
                  variant="outline"
                  className="text-sm px-4 py-2 cursor-pointer font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                >
                  {genre.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA for authors */}
      <section className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
        <div className="relative border rounded-2xl p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
              <Feather className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Инструменты для авторов
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Полноценный текстовый редактор, управление персонажами и мирами, таймлайны, карты связей — всё что нужно для создания великих историй. Бесплатно.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm text-muted-foreground">
              {['Редактор с автосохранением', 'Миростроение', 'Таймлайны', 'Комментарии', 'Статистика'].map(f => (
                <span key={f} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent">
                  <CheckCircle className="h-3 w-3 text-primary" />{f}
                </span>
              ))}
            </div>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="font-semibold h-11 px-8">
                Создать аккаунт автора
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
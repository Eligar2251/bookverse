'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Star, Eye, CheckCircle, Search } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

const ITEMS_PER_PAGE = 18

const SORT_OPTIONS = [
  { value: 'popular', label: 'Популярные' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'new', label: 'Новые' },
  { value: 'updated', label: 'Обновлённые' },
  { value: 'subscribers', label: 'По подписчикам' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'ongoing', label: 'Пишется' },
  { value: 'completed', label: 'Завершена' },
  { value: 'paused', label: 'На паузе' },
]

export function CatalogContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [books, setBooks] = useState<any[]>([])
  const [genres, setGenres] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const activeGenre = searchParams.get('genre') || ''
  const activeSort = searchParams.get('sort') || 'popular'
  const activeStatus = searchParams.get('status') || ''
  const activeQ = searchParams.get('q') || ''

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const updateParam = useCallback((name: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(name, value)
      else params.delete(name)
      params.delete('page')
      router.push(pathname + '?' + params.toString())
    })
  }, [searchParams, router, pathname])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('genres').select('*').order('sort_order').then(({ data }) => setGenres(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('books')
      .select(
        '*, author:profiles!books_author_id_fkey(username, display_name)',
        { count: 'exact' }
      )
      .eq('is_published', true)

    if (activeGenre) query = query.contains('genres', [activeGenre])
    if (activeStatus) query = query.eq('status', activeStatus)
    if (activeQ) query = query.ilike('title', `%${activeQ}%`)

    switch (activeSort) {
      case 'rating': query = query.order('avg_rating', { ascending: false }); break
      case 'new': query = query.order('created_at', { ascending: false }); break
      case 'updated': query = query.order('updated_at', { ascending: false }); break
      case 'subscribers': query = query.order('subscriber_count', { ascending: false }); break
      default: query = query.order('total_views', { ascending: false })
    }

    const from = (page - 1) * ITEMS_PER_PAGE
    query = query.range(from, from + ITEMS_PER_PAGE - 1)

    query.then(({ data, count }) => {
      setBooks(data || [])
      setTotal(count || 0)
      setLoading(false)
    })
  }, [page, activeGenre, activeSort, activeStatus, activeQ])

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Каталог книг</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="lg:w-56 shrink-0 space-y-5">
          <div>
            <Label className="text-xs mb-1.5 block">Поиск</Label>
            <form onSubmit={e => { e.preventDefault(); const v = (e.target as any).q.value; updateParam('q', v) }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input name="q" placeholder="Название..." defaultValue={activeQ} className="h-8 text-sm pl-8" />
              </div>
            </form>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Сортировка</Label>
            <Select value={activeSort} onValueChange={(v: string) => updateParam('sort', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Статус</Label>
            <Select value={activeStatus} onValueChange={(v: string) => updateParam('status', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Все" /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Жанры</Label>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g: any) => (
                <Badge
                  key={g.id}
                  variant={activeGenre === g.name ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => updateParam('genre', activeGenre === g.name ? '' : g.name)}
                >
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>
          {(activeGenre || activeStatus || activeQ) && (
            <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push('/books')}>
              Сбросить фильтры
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Найдено: {total} книг</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {books.map((book: any) => (
                <Link key={book.id} href={`/books/${book.slug}`} className="group">
                  <Card className="overflow-hidden h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    <div className="aspect-[2/3] bg-muted relative overflow-hidden">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {book.status === 'completed' && (
                        <Badge className="absolute top-1.5 left-1.5 text-[10px] bg-blue-500">
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />Завершена
                        </Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-1.5 right-1.5 text-[10px]">{book.age_rating}</Badge>
                    </div>
                    <CardContent className="p-2.5">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{book.author?.display_name || book.author?.username}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        {book.avg_rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {Number(book.avg_rating).toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />{formatNumber(book.total_views)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">Книги не найдены</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button variant="outline" size="sm" onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(page - 1))
                  router.push(pathname + '?' + params.toString())
                }}>
                  ← Назад
                </Button>
              )}
              <span className="flex items-center text-sm text-muted-foreground px-3">
                {page} из {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" size="sm" onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(page + 1))
                  router.push(pathname + '?' + params.toString())
                }}>
                  Далее →
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
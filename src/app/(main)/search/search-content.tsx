'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Star, Eye } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { SearchForm } from './search-form'

export function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('books')
      .select('id, title, slug, cover_url, avg_rating, total_views, genres, author:profiles!books_author_id_fkey(username, display_name)')
      .eq('is_published', true)
      .ilike('title', `%${q.trim()}%`)
      .order('total_views', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setResults(data || [])
        setLoading(false)
      })
  }, [q])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Поиск</h1>
      <SearchForm defaultValue={q} />

      {q && (
        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {results.length > 0 ? `Найдено: ${results.length} книг` : 'Ничего не найдено'}
              </p>
              <div className="grid gap-3">
                {results.map((book: any) => (
                  <Link key={book.id} href={`/books/${book.slug}`}>
                    <Card className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-3 flex items-center gap-4">
                        <div className="w-12 h-16 rounded bg-muted overflow-hidden shrink-0">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {book.author?.display_name || book.author?.username}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
                        </div>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {book.genres?.slice(0, 2).map((g: string) => (
                            <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
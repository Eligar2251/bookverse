import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Star, Eye, TrendingUp, Users } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

async function getTop(column: string, limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('id, title, slug, cover_url, avg_rating, total_views, subscriber_count, genres, status, author:profiles!books_author_id_fkey(username, display_name)')
    .eq('is_published', true)
    .order(column, { ascending: false })
    .limit(limit)
  return data || []
}

function RankingList({ books, valueKey, valueLabel, icon: Icon }: {
  books: any[]; valueKey: string; valueLabel: string; icon: any
}) {
  return (
    <div className="space-y-2">
      {books.map((book, i) => (
        <Link key={book.id} href={`/books/${book.slug}`}>
          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <span className={`text-lg font-bold w-8 text-center shrink-0 ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                {i + 1}
              </span>
              <div className="w-10 h-14 rounded bg-muted overflow-hidden shrink-0">
                {book.cover_url ? (
                  <img src={book.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-4 w-4 text-muted-foreground/30" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground">{book.author?.display_name || book.author?.username}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                <Icon className="h-4 w-4 text-primary" />
                {valueKey === 'avg_rating' ? Number(book[valueKey]).toFixed(1) : formatNumber(book[valueKey])}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default async function RankingsPage() {
  const [byViews, byRating, bySubs] = await Promise.all([
    getTop('total_views'),
    getTop('avg_rating'),
    getTop('subscriber_count'),
  ])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📊 Рейтинги</h1>

      <Tabs defaultValue="views">
        <TabsList>
          <TabsTrigger value="views" className="gap-1"><TrendingUp className="h-3.5 w-3.5" />По просмотрам</TabsTrigger>
          <TabsTrigger value="rating" className="gap-1"><Star className="h-3.5 w-3.5" />По рейтингу</TabsTrigger>
          <TabsTrigger value="subs" className="gap-1"><Users className="h-3.5 w-3.5" />По подписчикам</TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="mt-4">
          <RankingList books={byViews} valueKey="total_views" valueLabel="просмотров" icon={Eye} />
        </TabsContent>
        <TabsContent value="rating" className="mt-4">
          <RankingList books={byRating} valueKey="avg_rating" valueLabel="рейтинг" icon={Star} />
        </TabsContent>
        <TabsContent value="subs" className="mt-4">
          <RankingList books={bySubs} valueKey="subscriber_count" valueLabel="подписчиков" icon={Users} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
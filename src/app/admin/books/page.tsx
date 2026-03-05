import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Eye, Star } from 'lucide-react'
import { formatNumber, getBookStatusLabel } from '@/lib/utils'

export default async function AdminBooksPage() {
  const supabase = await createClient()
  const { data: books } = await supabase
    .from('books')
    .select('*, author:profiles!books_author_id_fkey(username, display_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Все книги ({books?.length || 0})</h1>
      <div className="space-y-2">
        {books?.map((book: any) => (
          <Link key={book.id} href={`/books/${book.slug}`} target="_blank">
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-11 rounded bg-muted overflow-hidden shrink-0">
                  {book.cover_url ? <img src={book.cover_url} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-full h-full p-1 text-muted-foreground/30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">@{book.author?.username} · {getBookStatusLabel(book.status)}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span><Eye className="h-3 w-3 inline mr-0.5" />{formatNumber(book.total_views)}</span>
                  <span><Star className="h-3 w-3 inline mr-0.5" />{book.avg_rating > 0 ? Number(book.avg_rating).toFixed(1) : '—'}</span>
                  <Badge variant="outline" className="text-[10px]">{book.is_published ? 'Опубл.' : 'Черновик'}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
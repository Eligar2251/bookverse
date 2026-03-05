'use client'

import { useState, useMemo, useCallback, useTransition, memo } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Star, Trash2, Eye } from 'lucide-react'
import { setBookShelf, removeFromLibrary } from '@/app/actions/library'
import { toast } from 'sonner'
import { formatNumber, getShelfLabel } from '@/lib/utils'

const SHELVES = [
  { value: 'reading', label: '📖 Читаю', emoji: '📖' },
  { value: 'want_to_read', label: '📋 Хочу прочитать', emoji: '📋' },
  { value: 'completed', label: '✅ Прочитано', emoji: '✅' },
  { value: 'paused', label: '⏸️ На паузе', emoji: '⏸️' },
  { value: 'dropped', label: '🗑️ Брошено', emoji: '🗑️' },
]

const LibraryCard = memo(function LibraryCard({ item, onShelfChange, onRemove }: {
  item: any; onShelfChange: (bookId: string, shelf: string) => void; onRemove: (bookId: string) => void
}) {
  const book = item.book
  if (!book) return null

  return (
    <Card className="group hover:shadow-sm transition-shadow">
      <CardContent className="p-3 flex gap-3">
        <Link href={`/books/${book.slug}`} className="shrink-0">
          <div className="w-14 h-20 rounded bg-muted overflow-hidden">
            {book.cover_url ? (
              <img src={book.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-muted-foreground/30" /></div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/books/${book.slug}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">{book.title}</Link>
          <p className="text-xs text-muted-foreground">{book.author?.display_name || book.author?.username}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {book.avg_rating > 0 && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{Number(book.avg_rating).toFixed(1)}</span>}
            <span>{formatNumber(book.total_words)} сл.</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Select value={item.shelf} onValueChange={v => onShelfChange(book.id, v)}>
              <SelectTrigger className="h-7 text-xs w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SHELVES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(book.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export function LibraryClient({ items: initial }: { items: any[] }) {
  const [items, setItems] = useState(initial)
  const [, startTransition] = useTransition()

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {}
    for (const shelf of SHELVES) groups[shelf.value] = []
    for (const item of items) {
      if (groups[item.shelf]) groups[item.shelf].push(item)
    }
    return groups
  }, [items])

  const handleShelfChange = useCallback((bookId: string, shelf: string) => {
    setItems(prev => prev.map(i => i.book?.id === bookId ? { ...i, shelf } : i))
    startTransition(async () => {
      const res = await setBookShelf(bookId, shelf)
      if (res.error) toast.error(res.error)
      else toast.success(`Перемещено: ${getShelfLabel(shelf)}`)
    })
  }, [])

  const handleRemove = useCallback((bookId: string) => {
    setItems(prev => prev.filter(i => i.book?.id !== bookId))
    startTransition(async () => {
      await removeFromLibrary(bookId)
      toast.success('Удалено из библиотеки')
    })
  }, [])

  return (
    <Tabs defaultValue="reading">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        {SHELVES.map(s => (
          <TabsTrigger key={s.value} value={s.value} className="text-xs gap-1">
            {s.emoji} {getShelfLabel(s.value)}
            <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-1">{grouped[s.value]?.length || 0}</Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {SHELVES.map(s => (
        <TabsContent key={s.value} value={s.value} className="mt-4">
          {grouped[s.value]?.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {grouped[s.value].map(item => (
                <LibraryCard key={item.id} item={item} onShelfChange={handleShelfChange} onRemove={handleRemove} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground">Полка пуста</p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
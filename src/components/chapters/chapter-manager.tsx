'use client'

import { useState, useTransition, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createChapter, deleteChapter, publishChapter, reorderChapters } from '@/app/actions/chapters'
import { toast } from 'sonner'
import { Plus, GripVertical, PenLine, Trash2, Send, Loader2, FileText } from 'lucide-react'
import type { Chapter } from '@/lib/types/database'
import { formatNumber, formatRelativeDate } from '@/lib/utils'

const statusMap: Record<string, { label: string; class: string }> = {
  draft: { label: 'Черновик', class: 'bg-gray-500/10 text-gray-600' },
  scheduled: { label: 'Запланирована', class: 'bg-yellow-500/10 text-yellow-600' },
  published: { label: 'Опубликована', class: 'bg-green-500/10 text-green-600' },
}

const SortableChapter = memo(function SortableChapter({
  chapter, bookId, onDelete, onPublish,
}: {
  chapter: Chapter; bookId: string
  onDelete: (id: string) => void; onPublish: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const st = statusMap[chapter.status] || statusMap.draft

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:bg-accent/30 transition-colors">
        <CardContent className="p-3 flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-mono text-muted-foreground w-8 shrink-0">
            {chapter.chapter_number}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{chapter.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatNumber(chapter.word_count)} слов
              {chapter.published_at && ` · ${formatRelativeDate(chapter.published_at)}`}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${st.class}`}>{st.label}</span>
          <div className="flex gap-1 shrink-0">
            <Link href={`/dashboard/books/${bookId}/write?chapter=${chapter.id}`}>
              <Button variant="ghost" size="icon" className="h-7 w-7"><PenLine className="h-3.5 w-3.5" /></Button>
            </Link>
            {chapter.status === 'draft' && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => onPublish(chapter.id)}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(chapter.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export function ChapterManager({ bookId, initialChapters }: { bookId: string; initialChapters: Chapter[] }) {
  const [chapters, setChapters] = useState(initialChapters)
  const [newTitle, setNewTitle] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleCreate = useCallback(() => {
    if (!newTitle.trim()) return
    startTransition(async () => {
      const res = await createChapter(bookId, newTitle.trim())
      if (res.error) { toast.error(res.error); return }
      setChapters(prev => [...prev, res.data!])
      setNewTitle('')
      setDialogOpen(false)
      toast.success('Глава создана')
    })
  }, [newTitle, bookId])

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Удалить главу?')) return
    startTransition(async () => {
      const res = await deleteChapter(id)
      if (res.error) { toast.error(res.error); return }
      setChapters(prev => prev.filter(c => c.id !== id))
      toast.success('Глава удалена')
    })
  }, [])

  const handlePublish = useCallback((id: string) => {
    startTransition(async () => {
      const res = await publishChapter(id)
      if (res.error) { toast.error(res.error); return }
      setChapters(prev => prev.map(c => c.id === id ? { ...c, status: 'published' as const, published_at: new Date().toISOString() } : c))
      toast.success('Глава опубликована!')
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setChapters(prev => {
      const oldIndex = prev.findIndex(c => c.id === active.id)
      const newIndex = prev.findIndex(c => c.id === over.id)
      const updated = [...prev]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, moved)
      const reordered = updated.map((c, i) => ({ ...c, chapter_number: i + 1 }))

      // fire-and-forget reorder
      reorderChapters(bookId, reordered.map(c => ({ id: c.id, chapter_number: c.chapter_number })))
      return reordered
    })
  }, [bookId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{chapters.length} глав</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Новая глава</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новая глава</DialogTitle></DialogHeader>
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Название главы"
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              autoFocus
            />
            <DialogFooter>
              <Button onClick={handleCreate} disabled={pending || !newTitle.trim()}>
                {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {chapters.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {chapters.map(chapter => (
                <SortableChapter
                  key={chapter.id}
                  chapter={chapter}
                  bookId={bookId}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Ещё нет глав. Создайте первую!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
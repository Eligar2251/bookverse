'use client'

import { useState, useCallback, useTransition, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2, Save, StickyNote, Loader2 } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

interface Note {
  id: string; content: string; tags: string[]; created_at: string; updated_at: string
  book_id: string | null; chapter_id: string | null; entity_id: string | null
}

const NoteCard = memo(function NoteCard({ note, onSave, onDelete }: {
  note: Note; onSave: (id: string, content: string) => void; onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(note.content)

  return (
    <Card>
      <CardContent className="p-4">
        {editing ? (
          <div className="space-y-2">
            <Textarea value={text} onChange={e => setText(e.target.value)} rows={4} autoFocus />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { onSave(note.id, text); setEditing(false) }}>
                <Save className="h-3.5 w-3.5 mr-1" />Сохранить
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setText(note.content); setEditing(false) }}>Отмена</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm whitespace-pre-wrap cursor-pointer" onClick={() => setEditing(true)}>
              {note.content || <span className="text-muted-foreground italic">Пустая заметка (нажмите для редактирования)</span>}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">{formatRelativeDate(note.updated_at)}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(note.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export function NotesClient({ initialNotes, userId }: { initialNotes: Note[]; userId: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [pending, start] = useTransition()

  const handleCreate = useCallback(() => {
    start(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('author_notes')
        .insert({ author_id: userId, content: '' })
        .select()
        .single()
      if (error) { toast.error(error.message); return }
      setNotes(prev => [data, ...prev])
    })
  }, [userId])

  const handleSave = useCallback((id: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updated_at: new Date().toISOString() } : n))
    start(async () => {
      const supabase = createClient()
      await supabase.from('author_notes').update({ content }).eq('id', id)
      toast.success('Сохранено')
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Удалить заметку?')) return
    setNotes(prev => prev.filter(n => n.id !== id))
    start(async () => {
      const supabase = createClient()
      await supabase.from('author_notes').delete().eq('id', id)
      toast.success('Удалено')
    })
  }, [])

  return (
    <div className="space-y-4">
      <Button onClick={handleCreate} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
        Новая заметка
      </Button>

      {notes.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <StickyNote className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Нет заметок. Создайте первую!</p>
        </div>
      )}
    </div>
  )
}
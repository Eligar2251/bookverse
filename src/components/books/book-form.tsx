'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/shared/image-upload'
import { createBook, updateBook } from '@/app/actions/books'
import { toast } from 'sonner'
import { Loader2, X, Plus } from 'lucide-react'
import type { Book, Genre } from '@/lib/types/database'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Черновик' },
  { value: 'ongoing', label: 'Пишется' },
  { value: 'paused', label: 'На паузе' },
  { value: 'completed', label: 'Завершена' },
  { value: 'abandoned', label: 'Заброшена' },
] as const

const AGE_OPTIONS = ['6+', '12+', '16+', '18+'] as const

interface BookFormProps {
  book?: Book | null
  genres: Genre[]
  userId: string
}

export function BookForm({ book, genres, userId }: BookFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [title, setTitle] = useState(book?.title || '')
  const [descShort, setDescShort] = useState(book?.description_short || '')
  const [descFull, setDescFull] = useState(book?.description_full || '')
  const [coverUrl, setCoverUrl] = useState<string | null>(book?.cover_url || null)
  const [status, setStatus] = useState<string>(book?.status || 'draft')
  const [ageRating, setAgeRating] = useState<string>(book?.age_rating || '16+')
  const [selectedGenres, setSelectedGenres] = useState<string[]>(book?.genres || [])
  const [tags, setTags] = useState<string[]>(book?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [commentsEnabled, setCommentsEnabled] = useState(book?.comments_enabled ?? true)

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Укажите название')
      return
    }

    startTransition(async () => {
      const formData = {
        title: title.trim(),
        description_short: descShort.trim(),
        description_full: descFull.trim(),
        cover_url: coverUrl,
        status,
        age_rating: ageRating,
        genres: selectedGenres,
        tags,
        content_warnings: [] as string[],
        comments_enabled: commentsEnabled,
        universe_id: null,
      }

      if (book) {
        const res = await updateBook(book.id, formData)
        if (res.error) {
          toast.error(res.error)
          return
        }
        toast.success('Книга обновлена')
        router.refresh()
      } else {
        const res = await createBook(formData)
        if (res.error) {
          toast.error(res.error)
          return
        }
        toast.success('Книга создана!')
        router.push(`/dashboard/books/${res.data!.id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <div>
          <Label className="mb-2 block">Обложка</Label>
          <ImageUpload
            value={coverUrl}
            onChange={setCoverUrl}
            bucket="covers"
            path={userId}
            className="w-full"
          />
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Название книги"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="descShort">Краткое описание (до 300 символов)</Label>
            <Textarea
              id="descShort"
              value={descShort}
              onChange={e => setDescShort(e.target.value)}
              maxLength={300}
              rows={2}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">{descShort.length}/300</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Статус</Label>
              <Select value={status} onValueChange={(val: string) => setStatus(val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Возрастной рейтинг</Label>
              <Select value={ageRating} onValueChange={(val: string) => setAgeRating(val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGE_OPTIONS.map(a => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="descFull">Полное описание</Label>
        <Textarea
          id="descFull"
          value={descFull}
          onChange={e => setDescFull(e.target.value)}
          rows={6}
          className="mt-1"
          placeholder="Расскажите о книге подробнее..."
        />
      </div>

      <div>
        <Label className="mb-2 block">Жанры</Label>
        <div className="flex flex-wrap gap-2">
          {genres.map(g => (
            <Badge
              key={g.id}
              variant={selectedGenres.includes(g.name) ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => toggleGenre(g.name)}
            >
              {g.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Теги (до 10)</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(t => (
            <Badge key={t} variant="secondary" className="gap-1">
              #{t}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setTags(tags.filter(x => x !== t))}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="Добавить тег..."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            className="max-w-xs"
          />
          <Button type="button" variant="outline" size="icon" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={commentsEnabled}
          onCheckedChange={setCommentsEnabled}
          id="comments"
        />
        <Label htmlFor="comments">Комментарии к главам</Label>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {book ? 'Сохранить' : 'Создать книгу'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  )
}
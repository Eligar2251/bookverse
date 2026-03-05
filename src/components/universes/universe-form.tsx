'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/shared/image-upload'
import { createUniverse, updateUniverse } from '@/app/actions/universes'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import type { Universe } from '@/lib/types/database'

export function UniverseForm({ universe }: { universe?: Universe }) {
  const router = useRouter()
  const { user } = useUser()
  const [pending, start] = useTransition()
  const [title, setTitle] = useState(universe?.title || '')
  const [description, setDescription] = useState(universe?.description || '')
  const [coverUrl, setCoverUrl] = useState<string | null>(universe?.cover_url || null)
  const [isPublic, setIsPublic] = useState(universe?.is_public ?? false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Укажите название'); return }

    start(async () => {
      const data = { title: title.trim(), description: description.trim(), cover_url: coverUrl, is_public: isPublic }
      const res = universe
        ? await updateUniverse(universe.id, data)
        : await createUniverse(data)

      if (res.error) { toast.error(res.error); return }
      toast.success(universe ? 'Обновлено' : 'Вселенная создана!')
      router.push(universe ? `/dashboard/universes/${universe.id}` : `/dashboard/universes/${(res as any).data.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-[180px_1fr] gap-5">
        <div>
          <Label className="mb-2 block">Обложка</Label>
          <ImageUpload value={coverUrl} onChange={setCoverUrl} bucket="covers" path={user?.id || 'anon'} aspectRatio="1/1" className="w-full" />
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Название *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Название вселенной" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="desc">Описание</Label>
            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isPublic} onCheckedChange={setIsPublic} id="pub" />
            <Label htmlFor="pub">Публичная (читатели смогут видеть энциклопедию)</Label>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {universe ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Отмена</Button>
      </div>
    </form>
  )
}
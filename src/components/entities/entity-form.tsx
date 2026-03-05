'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/shared/image-upload'
import { ENTITY_CONFIGS, getEntityConfig } from '@/lib/entities/config'
import { createEntity, updateEntity } from '@/app/actions/entities'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Entity, EntityType } from '@/lib/types/database'
import { cn } from '@/lib/utils'

interface EntityFormProps {
  universeId: string
  entity?: Entity
  userId: string
}

export function EntityForm({ universeId, entity, userId }: EntityFormProps) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const [entityType, setEntityType] = useState<EntityType>(entity?.entity_type || 'character')
  const [name, setName] = useState(entity?.name || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(entity?.avatar_url || null)
  const [isPublic, setIsPublic] = useState(entity?.is_public ?? false)
  const [spoilerLevel, setSpoilerLevel] = useState(entity?.spoiler_level || 0)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    (entity?.data as Record<string, string>) || {}
  )

  const cfg = getEntityConfig(entityType)

  const setField = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Укажите имя'); return }

    start(async () => {
      if (entity) {
        const res = await updateEntity(entity.id, universeId, {
          name: name.trim(), avatar_url: avatarUrl, entity_type: entityType,
          data: fieldValues, is_public: isPublic, spoiler_level: spoilerLevel,
        })
        if (res.error) { toast.error(res.error); return }
        toast.success('Обновлено')
        router.push(`/dashboard/universes/${universeId}`)
      } else {
        const res = await createEntity(universeId, {
          entity_type: entityType, name: name.trim(), avatar_url: avatarUrl,
          data: fieldValues, is_public: isPublic, spoiler_level: spoilerLevel,
        })
        if (res.error) { toast.error(res.error); return }
        toast.success('Создано!')
        router.push(`/dashboard/universes/${universeId}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type selector (only on create) */}
      {!entity && (
        <div>
          <Label className="mb-2 block">Тип сущности</Label>
          <div className="flex flex-wrap gap-2">
            {ENTITY_CONFIGS.map(c => (
              <Badge
                key={c.type}
                variant={entityType === c.type ? 'default' : 'outline'}
                className="cursor-pointer text-sm gap-1.5 px-3 py-1.5"
                onClick={() => { setEntityType(c.type); setFieldValues({}) }}
              >
                <c.icon className="h-3.5 w-3.5" />{c.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[140px_1fr] gap-5">
        <div>
          <Label className="mb-2 block">Изображение</Label>
          <ImageUpload value={avatarUrl} onChange={setAvatarUrl} bucket="content-images" path={userId} aspectRatio="1/1" className="w-full" />
        </div>
        <div className="space-y-4">
          <div>
            <Label>Имя / Название *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder={cfg.label} className="mt-1" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} id="entity-pub" />
              <Label htmlFor="entity-pub" className="text-sm">Публичная</Label>
            </div>
            <div>
              <Label className="text-sm mr-2">Спойлер:</Label>
              <Select value={String(spoilerLevel)} onValueChange={v => setSpoilerLevel(Number(v))}>
                <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Нет</SelectItem>
                  <SelectItem value="1">Лёгкий</SelectItem>
                  <SelectItem value="2">Тяжёлый</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic fields */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-medium flex items-center gap-2">
          <cfg.icon className={cn('h-4 w-4', cfg.color.split(' ')[0])} />
          Поля: {cfg.label}
        </h3>
        {cfg.fields.map(field => (
          <div key={field.key}>
            <Label className="text-sm">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={fieldValues[field.key] || ''}
                onChange={e => setField(field.key, e.target.value)}
                rows={3}
                className="mt-1"
                placeholder={field.placeholder}
              />
            ) : field.type === 'select' ? (
              <Select value={fieldValues[field.key] || ''} onValueChange={v => setField(field.key, v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                <SelectContent>
                  {field.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={fieldValues[field.key] || ''}
                onChange={e => setField(field.key, e.target.value)}
                className="mt-1"
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {entity ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Отмена</Button>
      </div>
    </form>
  )
}
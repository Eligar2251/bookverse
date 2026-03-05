'use client'

import { useState, useMemo, useCallback, useTransition, memo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ENTITY_CONFIGS, getEntityConfig } from '@/lib/entities/config'
import { deleteEntity } from '@/app/actions/entities'
import { toast } from 'sonner'
import { Search, Trash2, PenLine, Plus, Filter } from 'lucide-react'
import type { Entity, EntityType } from '@/lib/types/database'
import { cn } from '@/lib/utils'

const EntityCard = memo(function EntityCard({ entity, universeId, onDelete }: {
  entity: Entity; universeId: string; onDelete: (id: string) => void
}) {
  const cfg = getEntityConfig(entity.entity_type)
  return (
    <Card className="hover:shadow-sm transition-shadow group">
      <CardContent className="p-3 flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={entity.avatar_url || undefined} />
          <AvatarFallback className={cn('text-xs', cfg.color)}>{entity.name[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{entity.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
              <cfg.icon className="h-2.5 w-2.5" />{cfg.label}
            </Badge>
            {entity.is_public && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Публичная</Badge>}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Link href={`/dashboard/universes/${universeId}/entities/${entity.id}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7"><PenLine className="h-3.5 w-3.5" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(entity.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export function EntityList({ entities: initial, universeId }: { entities: Entity[]; universeId: string }) {
  const [entities, setEntities] = useState(initial)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all')
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    let result = entities
    if (typeFilter !== 'all') result = result.filter(e => e.entity_type === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(e => e.name.toLowerCase().includes(q))
    }
    return result
  }, [entities, search, typeFilter])

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Удалить сущность?')) return
    startTransition(async () => {
      const res = await deleteEntity(id, universeId)
      if (res.error) { toast.error(res.error); return }
      setEntities(prev => prev.filter(e => e.id !== id))
      toast.success('Удалено')
    })
  }, [universeId])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени..."
            className="pl-9 h-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setTypeFilter('all')}
          >
            Все
          </Badge>
          {ENTITY_CONFIGS.map(cfg => (
            <Badge
              key={cfg.type}
              variant={typeFilter === cfg.type ? 'default' : 'outline'}
              className="cursor-pointer text-xs gap-1"
              onClick={() => setTypeFilter(typeFilter === cfg.type ? 'all' : cfg.type)}
            >
              <cfg.icon className="h-3 w-3" />{cfg.labelPlural}
            </Badge>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-2">
          {filtered.map(entity => (
            <EntityCard key={entity.id} entity={entity} universeId={universeId} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-3">
            {entities.length === 0 ? 'Нет сущностей' : 'Ничего не найдено'}
          </p>
          {entities.length === 0 && (
            <Link href={`/dashboard/universes/${universeId}/entities/new`}>
              <Button variant="outline"><Plus className="h-4 w-4 mr-1" />Добавить первую</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
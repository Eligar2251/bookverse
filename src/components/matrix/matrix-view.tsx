'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getEntityConfig } from '@/lib/entities/config'
import type { EntityType } from '@/lib/types/database'
import { cn } from '@/lib/utils'

interface MatrixViewProps {
  chapters: { id: string; chapter_number: number; title: string }[]
  entities: { id: string; name: string; entity_type: EntityType }[]
  tagSet: Set<string>
}

export function MatrixView({ chapters, entities, tagSet }: MatrixViewProps) {
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all')

  const filteredEntities = useMemo(() => {
    if (typeFilter === 'all') return entities
    return entities.filter(e => e.entity_type === typeFilter)
  }, [entities, typeFilter])

  // Count appearances
  const entityCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of entities) {
      let c = 0
      for (const ch of chapters) {
        if (tagSet.has(`${ch.id}:${e.id}`)) c++
      }
      counts.set(e.id, c)
    }
    return counts
  }, [entities, chapters, tagSet])

  if (entities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Нет сущностей. Привяжите книгу к вселенной и используйте теги <code>@Имя</code> в тексте глав.
        </p>
      </div>
    )
  }

  if (chapters.length === 0) {
    return <p className="text-muted-foreground text-center py-12">Нет глав</p>
  }

  const types = [...new Set(entities.map(e => e.entity_type))]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        <Badge variant={typeFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setTypeFilter('all')}>Все</Badge>
        {types.map(t => {
          const cfg = getEntityConfig(t)
          return (
            <Badge
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              className="cursor-pointer text-xs gap-1"
              onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}
            >
              <cfg.icon className="h-3 w-3" />{cfg.labelPlural}
            </Badge>
          )
        })}
      </div>

      <ScrollArea className="w-full">
        <div className="min-w-[600px]">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b font-medium sticky left-0 bg-background z-10 min-w-[150px]">Сущность</th>
                {chapters.map(ch => (
                  <th key={ch.id} className="p-2 border-b text-center font-mono w-10" title={ch.title}>
                    {ch.chapter_number}
                  </th>
                ))}
                <th className="p-2 border-b text-center font-medium w-12">Σ</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map(entity => {
                const count = entityCounts.get(entity.id) || 0
                const cfg = getEntityConfig(entity.entity_type)
                return (
                  <tr key={entity.id} className="hover:bg-accent/30">
                    <td className="p-2 border-b sticky left-0 bg-background z-10">
                      <span className="flex items-center gap-1.5">
                        <cfg.icon className={cn('h-3 w-3', cfg.color.split(' ')[0])} />
                        <span className="truncate max-w-[130px]">{entity.name}</span>
                      </span>
                    </td>
                    {chapters.map(ch => {
                      const present = tagSet.has(`${ch.id}:${entity.id}`)
                      return (
                        <td key={ch.id} className="p-2 border-b text-center">
                          {present ? (
                            <span className="inline-block w-3 h-3 rounded-full bg-primary" />
                          ) : (
                            <span className="inline-block w-3 h-3 rounded-full bg-muted" />
                          )}
                        </td>
                      )
                    })}
                    <td className="p-2 border-b text-center font-medium">{count}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  )
}
'use client'

import { useState, useCallback, useTransition, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import {
  createTimeline, deleteTimeline, createTimelineEvent,
  updateTimelineEvent, deleteTimelineEvent,
} from '@/app/actions/timelines'
import { toast } from 'sonner'
import { Plus, Trash2, PenLine, Calendar, MapPin, Users, Loader2, GripVertical } from 'lucide-react'
import { getEntityConfig } from '@/lib/entities/config'

interface TimelineData {
  id: string; title: string; description: string
  events: EventData[]
}
interface EventData {
  id: string; title: string; description: string; date_label: string
  sort_order: number; era: string | null; entity_ids: string[]
  chapter_id: string | null
}
interface EntityRef {
  id: string; name: string; entity_type: string; avatar_url: string | null
}

const TimelineEvent = memo(function TimelineEvent({ event, entities, onEdit, onDelete }: {
  event: EventData; entities: EntityRef[]
  onEdit: (e: EventData) => void; onDelete: (id: string) => void
}) {
  const linked = entities.filter(e => event.entity_ids?.includes(e.id))
  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20 mt-1.5" />
        <div className="w-0.5 flex-1 bg-border" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-sm">{event.title}</p>
            {event.date_label && (
              <p className="text-xs text-primary font-mono mt-0.5">{event.date_label}</p>
            )}
            {event.era && <Badge variant="outline" className="text-[10px] mt-1">{event.era}</Badge>}
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(event)}>
              <PenLine className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(event.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
        {linked.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {linked.map(e => {
              const cfg = getEntityConfig(e.entity_type as any)
              return (
                <Badge key={e.id} variant="secondary" className="text-[10px] gap-1">
                  <cfg.icon className="h-2.5 w-2.5" />{e.name}
                </Badge>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})

export function TimelinesClient({ universeId, initialTimelines, entities }: {
  universeId: string; initialTimelines: TimelineData[]; entities: EntityRef[]
}) {
  const [timelines, setTimelines] = useState(initialTimelines)
  const [pending, start] = useTransition()

  // Create timeline dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  // Event dialog
  const [eventOpen, setEventOpen] = useState(false)
  const [eventTimelineId, setEventTimelineId] = useState('')
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)
  const [evTitle, setEvTitle] = useState('')
  const [evDesc, setEvDesc] = useState('')
  const [evDate, setEvDate] = useState('')
  const [evEra, setEvEra] = useState('')
  const [evEntityIds, setEvEntityIds] = useState<string[]>([])

  const handleCreateTimeline = useCallback(() => {
    if (!newTitle.trim()) return
    start(async () => {
      const res = await createTimeline(universeId, newTitle.trim(), newDesc.trim())
      if (res.error) { toast.error(res.error); return }
      setTimelines(prev => [...prev, { ...res.data!, events: [] }])
      setNewTitle(''); setNewDesc(''); setCreateOpen(false)
      toast.success('Таймлайн создан')
    })
  }, [universeId, newTitle, newDesc])

  const handleDeleteTimeline = useCallback((id: string) => {
    if (!confirm('Удалить таймлайн и все его события?')) return
    start(async () => {
      await deleteTimeline(id, universeId)
      setTimelines(prev => prev.filter(t => t.id !== id))
      toast.success('Удалено')
    })
  }, [universeId])

  const openEventDialog = (timelineId: string, event?: EventData) => {
    setEventTimelineId(timelineId)
    setEditingEvent(event || null)
    setEvTitle(event?.title || '')
    setEvDesc(event?.description || '')
    setEvDate(event?.date_label || '')
    setEvEra(event?.era || '')
    setEvEntityIds(event?.entity_ids || [])
    setEventOpen(true)
  }

  const handleSaveEvent = useCallback(() => {
    if (!evTitle.trim()) return
    start(async () => {
      if (editingEvent) {
        await updateTimelineEvent(editingEvent.id, {
          title: evTitle.trim(), description: evDesc.trim(),
          date_label: evDate.trim(), era: evEra.trim() || null,
          entity_ids: evEntityIds,
        })
        setTimelines(prev => prev.map(t => ({
          ...t,
          events: t.events.map(e => e.id === editingEvent.id
            ? { ...e, title: evTitle.trim(), description: evDesc.trim(), date_label: evDate.trim(), era: evEra.trim() || null, entity_ids: evEntityIds }
            : e
          ),
        })))
        toast.success('Событие обновлено')
      } else {
        const timeline = timelines.find(t => t.id === eventTimelineId)
        const nextOrder = (timeline?.events?.length || 0)
        const res = await createTimelineEvent(eventTimelineId, {
          title: evTitle.trim(), description: evDesc.trim(),
          date_label: evDate.trim(), era: evEra.trim() || undefined,
          sort_order: nextOrder, entity_ids: evEntityIds,
        })
        if (res.error) { toast.error(res.error); return }
        setTimelines(prev => prev.map(t =>
          t.id === eventTimelineId ? { ...t, events: [...t.events, res.data!] } : t
        ))
        toast.success('Событие добавлено')
      }
      setEventOpen(false)
    })
  }, [editingEvent, eventTimelineId, evTitle, evDesc, evDate, evEra, evEntityIds, timelines])

  const handleDeleteEvent = useCallback((id: string) => {
    start(async () => {
      await deleteTimelineEvent(id)
      setTimelines(prev => prev.map(t => ({ ...t, events: t.events.filter(e => e.id !== id) })))
      toast.success('Удалено')
    })
  }, [])

  const toggleEntity = (id: string) => {
    setEvEntityIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      {/* Create timeline */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="h-4 w-4 mr-2" />Новый таймлайн</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Создать таймлайн</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Название</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="mt-1" /></div>
            <div><Label>Описание</Label><Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTimeline} disabled={pending || !newTitle.trim()}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event dialog */}
      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingEvent ? 'Редактировать событие' : 'Новое событие'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Название *</Label><Input value={evTitle} onChange={e => setEvTitle(e.target.value)} className="mt-1" /></div>
            <div><Label>Дата (по календарю мира)</Label><Input value={evDate} onChange={e => setEvDate(e.target.value)} placeholder="Год 234" className="mt-1" /></div>
            <div><Label>Эпоха</Label><Input value={evEra} onChange={e => setEvEra(e.target.value)} placeholder="Эпоха Древних" className="mt-1" /></div>
            <div><Label>Описание</Label><Textarea value={evDesc} onChange={e => setEvDesc(e.target.value)} rows={3} className="mt-1" /></div>
            {entities.length > 0 && (
              <div>
                <Label>Связанные сущности</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-32 overflow-y-auto">
                  {entities.map(e => (
                    <Badge
                      key={e.id}
                      variant={evEntityIds.includes(e.id) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleEntity(e.id)}
                    >
                      {e.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEvent} disabled={pending || !evTitle.trim()}>
              {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingEvent ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timelines */}
      {timelines.length > 0 ? (
        timelines.map(timeline => (
          <Card key={timeline.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />{timeline.title}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEventDialog(timeline.id)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />Событие
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTimeline(timeline.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {timeline.description && <p className="text-sm text-muted-foreground">{timeline.description}</p>}
            </CardHeader>
            <CardContent>
              {timeline.events.length > 0 ? (
                <div className="ml-2">
                  {/* Group by era */}
                  {(() => {
                    const eras = new Map<string, EventData[]>()
                    for (const ev of timeline.events) {
                      const era = ev.era || '__none__'
                      if (!eras.has(era)) eras.set(era, [])
                      eras.get(era)!.push(ev)
                    }
                    return Array.from(eras.entries()).map(([era, events]) => (
                      <div key={era}>
                        {era !== '__none__' && (
                          <div className="flex items-center gap-2 mb-3 mt-4">
                            <div className="h-px flex-1 bg-primary/20" />
                            <span className="text-xs font-semibold text-primary px-2">{era}</span>
                            <div className="h-px flex-1 bg-primary/20" />
                          </div>
                        )}
                        {events.map(ev => (
                          <TimelineEvent
                            key={ev.id}
                            event={ev}
                            entities={entities}
                            onEdit={(e) => openEventDialog(timeline.id, e)}
                            onDelete={handleDeleteEvent}
                          />
                        ))}
                      </div>
                    ))
                  })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Нет событий</p>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Нет таймлайнов</p>
        </div>
      )}
    </div>
  )
}
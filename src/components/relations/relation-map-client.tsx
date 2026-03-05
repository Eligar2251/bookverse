'use client'

import { useState, useCallback, useMemo, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { createEntityRelation, deleteEntityRelation } from '@/app/actions/entities'
import { getEntityConfig } from '@/lib/entities/config'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, ArrowRight, ArrowLeftRight } from 'lucide-react'

const RELATION_TYPES = [
  { value: 'parent', label: '👨‍👦 Родитель', emoji: '👨‍👦' },
  { value: 'child', label: '👶 Ребёнок', emoji: '👶' },
  { value: 'sibling', label: '👫 Родственник', emoji: '👫' },
  { value: 'friend', label: '🤝 Друг', emoji: '🤝' },
  { value: 'enemy', label: '⚔️ Враг', emoji: '⚔️' },
  { value: 'ally', label: '🛡️ Союзник', emoji: '🛡️' },
  { value: 'mentor', label: '🎓 Наставник', emoji: '🎓' },
  { value: 'student', label: '📚 Ученик', emoji: '📚' },
  { value: 'lover', label: '❤️ Возлюбленный', emoji: '❤️' },
  { value: 'subordinate', label: '👑 Подчинённый', emoji: '👑' },
  { value: 'member', label: '🏛️ Участник', emoji: '🏛️' },
  { value: 'leader', label: '⭐ Лидер', emoji: '⭐' },
  { value: 'rival', label: '🔥 Соперник', emoji: '🔥' },
  { value: 'other', label: '🔗 Другое', emoji: '🔗' },
]

interface EntityRef { id: string; name: string; entity_type: string; avatar_url: string | null }
interface RelationData {
  id: string; from_entity_id: string; to_entity_id: string
  relation_type: string; label: string; is_bidirectional: boolean
}

export function RelationMapClient({ universeId, entities, relations: initial }: {
  universeId: string; entities: EntityRef[]; relations: RelationData[]
}) {
  const [relations, setRelations] = useState(initial)
  const [pending, start] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [relType, setRelType] = useState('friend')
  const [relLabel, setRelLabel] = useState('')
  const [isBidi, setIsBidi] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  const entityMap = useMemo(() => {
    const m = new Map<string, EntityRef>()
    entities.forEach(e => m.set(e.id, e))
    return m
  }, [entities])

  const filtered = useMemo(() => {
    if (filterType === 'all') return relations
    return relations.filter(r => r.relation_type === filterType)
  }, [relations, filterType])

  const handleCreate = useCallback(() => {
    if (!fromId || !toId || fromId === toId) { toast.error('Выберите две разные сущности'); return }
    start(async () => {
      const res = await createEntityRelation({
        from_entity_id: fromId, to_entity_id: toId,
        relation_type: relType, label: relLabel.trim(),
        is_bidirectional: isBidi,
      }, universeId)
      if (res.error) { toast.error(res.error); return }
      setRelations(prev => [...prev, res.data!])
      setDialogOpen(false); setRelLabel('')
      toast.success('Связь создана')
    })
  }, [fromId, toId, relType, relLabel, isBidi, universeId])

  const handleDelete = useCallback((id: string) => {
    start(async () => {
      await deleteEntityRelation(id, universeId)
      setRelations(prev => prev.filter(r => r.id !== id))
      toast.success('Связь удалена')
    })
  }, [universeId])

  const getRelLabel = (type: string) => RELATION_TYPES.find(r => r.value === type)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Новая связь</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Создать связь</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>От сущности</Label>
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>
                    {entities.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Тип связи</Label>
                <Select value={relType} onValueChange={setRelType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RELATION_TYPES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>К сущности</Label>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>
                    {entities.filter(e => e.id !== fromId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Подпись (необяз.)</Label>
                <Input value={relLabel} onChange={e => setRelLabel(e.target.value)} className="mt-1" placeholder="Опциональная подпись" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={isBidi} onChange={e => setIsBidi(e.target.checked)} id="bidi" className="rounded" />
                <Label htmlFor="bidi" className="text-sm">Двусторонняя связь</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={pending || !fromId || !toId}>
                {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filter */}
        <div className="flex flex-wrap gap-1">
          <Badge variant={filterType === 'all' ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setFilterType('all')}>Все</Badge>
          {RELATION_TYPES.slice(0, 8).map(r => (
            <Badge
              key={r.value}
              variant={filterType === r.value ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setFilterType(filterType === r.value ? 'all' : r.value)}
            >
              {r.emoji} {r.label.split(' ')[1]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Relations list */}
      {filtered.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-2">
          {filtered.map(rel => {
            const from = entityMap.get(rel.from_entity_id)
            const to = entityMap.get(rel.to_entity_id)
            const rt = getRelLabel(rel.relation_type)
            if (!from || !to) return null
            return (
              <Card key={rel.id} className="group">
                <CardContent className="p-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs shrink-0">{from.name}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    {rel.is_bidirectional ? <ArrowLeftRight className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                    <span>{rt?.emoji} {rel.label || rt?.label.split(' ')[1]}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{to.name}</Badge>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => handleDelete(rel.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">Нет связей</p>
      )}
    </div>
  )
}
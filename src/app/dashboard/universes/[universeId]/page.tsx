import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UniverseForm } from '@/components/universes/universe-form'
import { EntityList } from '@/components/entities/entity-list'
import { ENTITY_CONFIGS } from '@/lib/entities/config'
import { Plus, ArrowLeft, Calendar, Link2 } from 'lucide-react'

export default async function UniverseDetailPage({ params }: { params: Promise<{ universeId: string }> }) {
  const { universeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: universe } = await supabase
    .from('universes').select('*').eq('id', universeId).eq('author_id', user.id).single()
  if (!universe) notFound()

  const { data: entities } = await supabase
    .from('entities').select('*').eq('universe_id', universeId).order('name')

  const typeCounts: Record<string, number> = {}
  for (const e of entities || []) {
    typeCounts[e.entity_type] = (typeCounts[e.entity_type] || 0) + 1
  }

  const { count: timelineCount } = await supabase
    .from('timelines').select('id', { count: 'exact', head: true }).eq('universe_id', universeId)

  const { count: relCount } = await supabase
    .from('entity_relations').select('id', { count: 'exact', head: true })
    .in('from_entity_id', entities?.map(e => e.id) || ['00000000-0000-0000-0000-000000000000'])

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/universes">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{universe.title}</h1>
          <p className="text-sm text-muted-foreground">{entities?.length || 0} сущностей</p>
        </div>
        <Link href={`/dashboard/universes/${universeId}/entities/new`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Добавить</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {ENTITY_CONFIGS.map(cfg => {
          const count = typeCounts[cfg.type] || 0
          if (count === 0) return null
          return (
            <Badge key={cfg.type} variant="secondary" className="gap-1.5 px-3 py-1">
              <cfg.icon className={`h-3.5 w-3.5 ${cfg.color.split(' ')[0]}`} />
              {cfg.labelPlural}: {count}
            </Badge>
          )
        })}
      </div>

      <Tabs defaultValue="entities">
        <TabsList>
          <TabsTrigger value="entities">Сущности</TabsTrigger>
          <TabsTrigger value="timelines">Таймлайны ({timelineCount || 0})</TabsTrigger>
          <TabsTrigger value="relations">Связи ({relCount || 0})</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="mt-4">
          <EntityList entities={entities || []} universeId={universeId} />
        </TabsContent>

        <TabsContent value="timelines" className="mt-4">
          <Link href={`/dashboard/universes/${universeId}/timelines`}>
            <Button variant="outline"><Calendar className="h-4 w-4 mr-2" />Открыть таймлайны</Button>
          </Link>
        </TabsContent>

        <TabsContent value="relations" className="mt-4">
          <Link href={`/dashboard/universes/${universeId}/relations`}>
            <Button variant="outline"><Link2 className="h-4 w-4 mr-2" />Открыть карту связей</Button>
          </Link>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <UniverseForm universe={universe} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
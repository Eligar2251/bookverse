import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Globe, Lock, Users, MapPin, Sword } from 'lucide-react'

export default async function UniversesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: universes } = await supabase
    .from('universes')
    .select('*')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  // Get entity counts per universe
  const universeCounts: Record<string, Record<string, number>> = {}
  if (universes?.length) {
    const { data: entities } = await supabase
      .from('entities')
      .select('universe_id, entity_type')
      .in('universe_id', universes.map(u => u.id))

    for (const e of entities || []) {
      if (!universeCounts[e.universe_id]) universeCounts[e.universe_id] = {}
      universeCounts[e.universe_id][e.entity_type] = (universeCounts[e.universe_id][e.entity_type] || 0) + 1
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои вселенные</h1>
        <Link href="/dashboard/universes/new">
          <Button><Plus className="h-4 w-4 mr-2" />Создать вселенную</Button>
        </Link>
      </div>

      {universes && universes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {universes.map(u => {
            const counts = universeCounts[u.id] || {}
            const total = Object.values(counts).reduce((s, v) => s + v, 0)
            return (
              <Link key={u.id} href={`/dashboard/universes/${u.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{u.title}</h3>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {u.is_public ? <><Globe className="h-3 w-3 mr-1" />Публичная</> : <><Lock className="h-3 w-3 mr-1" />Приватная</>}
                      </Badge>
                    </div>
                    {u.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{u.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {(counts.character || 0) > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{counts.character} персон.</span>}
                      {(counts.location || 0) > 0 && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{counts.location} локаций</span>}
                      {(counts.item || 0) > 0 && <span className="flex items-center gap-1"><Sword className="h-3 w-3" />{counts.item} предм.</span>}
                      {total === 0 && <span>Пусто — добавьте сущности</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет вселенных</h3>
            <p className="text-muted-foreground mb-4">Создайте вселенную для персонажей, локаций и лора</p>
            <Link href="/dashboard/universes/new"><Button>Создать вселенную</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
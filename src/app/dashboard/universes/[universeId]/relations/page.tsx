import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { RelationMapClient } from '@/components/relations/relation-map-client'

export default async function RelationsPage({ params }: { params: Promise<{ universeId: string }> }) {
  const { universeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: universe } = await supabase
    .from('universes').select('id, title').eq('id', universeId).eq('author_id', user.id).single()
  if (!universe) notFound()

  const { data: entities } = await supabase
    .from('entities').select('id, name, entity_type, avatar_url')
    .eq('universe_id', universeId).order('name')

  const { data: relations } = await supabase
    .from('entity_relations').select('*')
    .or(
      entities?.map(e => `from_entity_id.eq.${e.id}`).join(',') || 'from_entity_id.eq.00000000-0000-0000-0000-000000000000'
    )

  return (
    <div className="p-6 max-w-6xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/universes/${universeId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">🔗 Карта связей — {universe.title}</h1>
      </div>
      <RelationMapClient
        universeId={universeId}
        entities={entities || []}
        relations={relations || []}
      />
    </div>
  )
}
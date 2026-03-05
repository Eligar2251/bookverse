import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { TimelinesClient } from '@/components/timelines/timelines-client'

export default async function TimelinesPage({ params }: { params: Promise<{ universeId: string }> }) {
  const { universeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: universe } = await supabase
    .from('universes').select('id, title').eq('id', universeId).eq('author_id', user.id).single()
  if (!universe) notFound()

  const { data: timelines } = await supabase
    .from('timelines')
    .select('*, events:timeline_events(*, entity_ids)')
    .eq('universe_id', universeId)
    .order('created_at')

  const { data: entities } = await supabase
    .from('entities')
    .select('id, name, entity_type, avatar_url')
    .eq('universe_id', universeId)
    .order('name')

  // Sort events within each timeline
  if (timelines) {
    for (const t of timelines) {
      (t as any).events?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/universes/${universeId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">📅 Таймлайны — {universe.title}</h1>
      </div>
      <TimelinesClient
        universeId={universeId}
        initialTimelines={timelines || []}
        entities={entities || []}
      />
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EntityForm } from '@/components/entities/entity-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function EditEntityPage({ params }: { params: Promise<{ universeId: string; entityId: string }> }) {
  const { universeId, entityId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entity } = await supabase.from('entities').select('*').eq('id', entityId).single()
  if (!entity) notFound()

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/universes/${universeId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Редактировать: {entity.name}</h1>
      </div>
      <EntityForm universeId={universeId} entity={entity} userId={user.id} />
    </div>
  )
}
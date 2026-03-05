import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EntityForm } from '@/components/entities/entity-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewEntityPage({ params }: { params: Promise<{ universeId: string }> }) {
  const { universeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/universes/${universeId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Новая сущность</h1>
      </div>
      <EntityForm universeId={universeId} userId={user.id} />
    </div>
  )
}
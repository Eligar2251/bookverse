import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UniverseForm } from '@/components/universes/universe-form'

export default async function NewUniversePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Создать вселенную</h1>
      <UniverseForm />
    </div>
  )
}
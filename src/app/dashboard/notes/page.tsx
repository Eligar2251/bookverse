import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotesClient } from './notes-client'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notes } = await supabase
    .from('author_notes')
    .select('*')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">📝 Заметки</h1>
      <NotesClient initialNotes={notes || []} userId={user.id} />
    </div>
  )
}
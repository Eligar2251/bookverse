import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookForm } from '@/components/books/book-form'

export default async function NewBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: genres } = await supabase.from('genres').select('*').order('sort_order')

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Создать книгу</h1>
      <BookForm genres={genres || []} userId={user.id} />
    </div>
  )
}
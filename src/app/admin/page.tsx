import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, FileText, MessageSquare, Flag, Eye } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: booksCount },
    { count: chaptersCount },
    { count: commentsCount },
    { count: reportsCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('chapters').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Пользователей', value: usersCount || 0, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Книг', value: booksCount || 0, icon: BookOpen, color: 'text-green-500 bg-green-500/10' },
    { label: 'Глав', value: chaptersCount || 0, icon: FileText, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Комментариев', value: commentsCount || 0, icon: MessageSquare, color: 'text-orange-500 bg-orange-500/10' },
    { label: 'Рецензий', value: reviewsCount || 0, icon: Eye, color: 'text-teal-500 bg-teal-500/10' },
    { label: 'Жалоб (ожидает)', value: reportsCount || 0, icon: Flag, color: 'text-red-500 bg-red-500/10' },
  ]

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">📊 Обзор платформы</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(s.value)}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
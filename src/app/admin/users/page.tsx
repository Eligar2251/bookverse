import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import { AdminUserActions } from './user-actions'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const roleBadge: Record<string, string> = {
    reader: 'bg-gray-500/10 text-gray-600',
    author: 'bg-blue-500/10 text-blue-600',
    moderator: 'bg-yellow-500/10 text-yellow-600',
    admin: 'bg-red-500/10 text-red-600',
  }

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">Пользователи ({users?.length || 0})</h1>
      <div className="space-y-2">
        {users?.map(user => (
          <Card key={user.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{(user.display_name || user.username)[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{user.display_name || user.username}</p>
                <p className="text-xs text-muted-foreground">@{user.username} · {user.email} · {formatDate(user.created_at)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge[user.role]}`}>{user.role}</span>
              <AdminUserActions userId={user.id} currentRole={user.role} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
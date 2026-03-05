import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { MarkAllReadButton } from './mark-all-read'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/notifications')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🔔 Уведомления</h1>
        <MarkAllReadButton />
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(n => (
            <Link key={n.id} href={n.link || '#'}>
              <Card className={`hover:bg-accent/50 transition-colors ${!n.is_read ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-medium ${!n.is_read ? 'text-primary' : ''}`}>{n.title}</p>
                      {n.message && <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-4">{formatRelativeDate(n.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bell className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Нет уведомлений</p>
        </div>
      )}
    </div>
  )
}
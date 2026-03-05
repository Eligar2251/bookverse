'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { markNotificationRead, markAllNotificationsRead } from '@/app/actions/notifications'

interface NotifData {
  id: string; type: string; title: string; message: string; link: string
  is_read: boolean; created_at: string
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<NotifData[]>([])
  const [open, setOpen] = useState(false)

  const fetchNotifs = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data || [])
  }, [userId])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('notifs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as NotifData, ...prev].slice(0, 20))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await markNotificationRead(id)
  }

  const handleReadAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await markAllNotificationsRead()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium text-sm">Уведомления</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleReadAll}>
              <Check className="h-3 w-3 mr-1" />Прочитать все
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(n => (
                <Link
                  key={n.id}
                  href={n.link || '#'}
                  className={`block p-3 text-sm hover:bg-accent transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                  onClick={() => { handleRead(n.id); setOpen(false) }}
                >
                  <p className={`font-medium text-xs ${!n.is_read ? 'text-primary' : ''}`}>{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeDate(n.created_at)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Нет уведомлений</p>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs">Показать все</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
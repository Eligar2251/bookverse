'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, Globe, StickyNote, Settings,
  ChevronLeft, ChevronRight, Feather,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const items = [
  { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
  { href: '/dashboard/books', label: 'Мои книги', icon: BookOpen },
  { href: '/dashboard/universes', label: 'Вселенные', icon: Globe },
  { href: '/dashboard/notes', label: 'Заметки', icon: StickyNote },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'hidden md:flex flex-col border-r bg-sidebar transition-all duration-200 shrink-0',
      collapsed ? 'w-[60px]' : 'w-56'
    )}>
      <div className="flex items-center justify-between p-3 border-b">
        {!collapsed && (
          <span className="text-sm font-semibold flex items-center gap-1.5 text-sidebar-foreground">
            <Feather className="h-4 w-4 text-primary" />Автор
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {items.map((item) => {
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
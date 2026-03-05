import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, BookOpen, Flag, Image, Settings } from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Обзор', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/books', label: 'Книги', icon: BookOpen },
  { href: '/admin/reports', label: 'Жалобы', icon: Flag },
  { href: '/admin/banners', label: 'Баннеры', icon: Image },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) redirect('/dashboard')

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 border-r bg-card shrink-0 hidden md:block">
          <div className="p-3 border-b">
            <h2 className="font-bold text-sm">👑 Админ-панель</h2>
          </div>
          <nav className="p-2 space-y-0.5">
            {adminNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-accent transition-colors"
              >
                <item.icon className="h-4 w-4" />{item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { NotificationBell } from '@/components/layout/notification-bell'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
    Search,
    Bell,
    Menu,
    BookOpen,
    LayoutDashboard,
    User,
    LogOut,
    Library,
    PenTool,
    TrendingUp,
    Star,
    BookMarked,
} from 'lucide-react'
import { toast } from 'sonner'

const mainNav = [
    { href: '/books', label: 'Каталог', icon: BookOpen },
    { href: '/collections', label: 'Подборки', icon: BookMarked },
    { href: '/rankings', label: 'Рейтинги', icon: TrendingUp },
]

export function Header() {
    const { user, profile, loading } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
        }
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        toast.success('Вы вышли из аккаунта')
        router.push('/')
        router.refresh()
    }

    const initials = profile?.display_name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || profile?.username?.[0]?.toUpperCase() || '?'

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center gap-4 px-4 mx-auto max-w-7xl">
                {/* Mobile menu */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72">
                        <div className="flex flex-col gap-4 mt-8">
                            <Link
                                href="/"
                                className="text-xl font-bold text-primary"
                                onClick={() => setMobileOpen(false)}
                            >
                                📚 BookVerse
                            </Link>
                            <nav className="flex flex-col gap-1">
                                {mainNav.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent ${pathname === item.href ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            {user && (
                                <>
                                    <div className="border-t pt-4">
                                        <nav className="flex flex-col gap-1">
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Панель автора
                                            </Link>
                                            <Link
                                                href="/library"
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                                            >
                                                <Library className="h-4 w-4" />
                                                Моя библиотека
                                            </Link>
                                        </nav>
                                    </div>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
                    <span className="text-primary">📚</span>
                    <span className="hidden sm:inline">BookVerse</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {mainNav.map(item => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? 'secondary' : 'ghost'}
                                size="sm"
                                className="text-sm"
                            >
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск книг, авторов..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                </form>

                {/* Right side */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* Mobile search */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="sm:hidden"
                        onClick={() => router.push('/search')}
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    <ThemeToggle />

                    {loading ? (
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    ) : user && profile ? (
                        <>
                            {/* Notifications */}
                            <NotificationBell userId={user.id} />

                            {/* User menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || ''} />
                                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center gap-2 p-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={profile.avatar_url || undefined} />
                                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium">{profile.display_name || profile.username}</p>
                                            <p className="text-xs text-muted-foreground">@{profile.username}</p>
                                        </div>
                                        {profile.role !== 'reader' && (
                                            <Badge variant="secondary" className="ml-auto text-[10px]">
                                                {profile.role === 'author' ? '✍️' : profile.role === 'admin' ? '👑' : '🛡️'}
                                            </Badge>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Панель автора
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/library" className="cursor-pointer">
                                            <Library className="mr-2 h-4 w-4" />
                                            Моя библиотека
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/${profile.username}`} className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            Мой профиль
                                        </Link>
                                    </DropdownMenuItem>
                                    {(profile.role === 'author' || profile.role === 'admin') && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/books" className="cursor-pointer">
                                                <PenTool className="mr-2 h-4 w-4" />
                                                Мои книги
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Выйти
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Войти</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Регистрация</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
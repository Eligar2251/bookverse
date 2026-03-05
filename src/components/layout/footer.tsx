import Link from 'next/link'
import { Feather } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Feather className="h-5 w-5 text-primary" />
              BookVerse
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Платформа для авторов и читателей. Пишите, публикуйте, создавайте миры.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Читателям</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/books" className="hover:text-primary transition-colors">Каталог</Link></li>
              <li><Link href="/rankings" className="hover:text-primary transition-colors">Рейтинги</Link></li>
              <li><Link href="/collections" className="hover:text-primary transition-colors">Подборки</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Авторам</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Панель автора</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Регистрация</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Платформа</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">О нас</Link></li>
              <li><Link href="/rules" className="hover:text-primary transition-colors">Правила</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BookVerse. Все права защищены.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Сделано с</span>
            <Feather className="h-3 w-3 text-primary" />
            <span>для авторов</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
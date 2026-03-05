import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">📚 BookVerse</h3>
            <p className="text-sm text-muted-foreground">
              Платформа для авторов и читателей. Пишите, публикуйте, создавайте миры.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">Читателям</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/books" className="hover:text-foreground transition-colors">Каталог</Link></li>
              <li><Link href="/rankings" className="hover:text-foreground transition-colors">Рейтинги</Link></li>
              <li><Link href="/collections" className="hover:text-foreground transition-colors">Подборки</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">Авторам</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Панель автора</Link></li>
              <li><Link href="/help/authors" className="hover:text-foreground transition-colors">Руководство</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-sm">Платформа</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">О нас</Link></li>
              <li><Link href="/rules" className="hover:text-foreground transition-colors">Правила</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Конфиденциальность</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BookVerse. Все права защищены.
        </div>
      </div>
    </footer>
  )
}
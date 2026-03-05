import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Страница не найдена</p>
        <Link href="/">
          <Button size="lg">На главную</Button>
        </Link>
      </div>
    </div>
  )
}
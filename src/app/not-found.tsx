// src/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Feather } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center">
        <Feather className="h-16 w-16 text-primary/30 mx-auto mb-6" />
        <h1 className="text-7xl font-bold text-primary/20 mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Страница не найдена</p>
        <Link href="/">
          <Button size="lg" className="font-semibold">На главную</Button>
        </Link>
      </div>
    </div>
  )
}
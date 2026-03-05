import Link from 'next/link'
import { Feather } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-bold">
        <Feather className="h-7 w-7 text-primary" />
        BookVerse
      </Link>
      {children}
    </div>
  )
}
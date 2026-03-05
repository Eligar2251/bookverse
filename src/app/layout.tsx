import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: {
    default: 'BookVerse — Платформа для авторов и читателей',
    template: '%s | BookVerse',
  },
  description: 'Пишите, публикуйте и читайте книги. Создавайте миры, персонажей и истории.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'BookVerse',
    title: 'BookVerse — Платформа для авторов и читателей',
    description: 'Пишите, публикуйте и читайте книги. Создавайте миры, персонажей и истории.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
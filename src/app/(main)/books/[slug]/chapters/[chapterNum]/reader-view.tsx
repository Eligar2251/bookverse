'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useReadingSettings } from '@/lib/stores/reading-settings'
import { ArrowLeft, ArrowRight, List, Settings, BookOpen } from 'lucide-react'
import { cn, estimateReadingTime, formatNumber } from '@/lib/utils'
import type { Chapter } from '@/lib/types/database'
import { CommentsSection } from './comments-section'

const widthMap = { narrow: 'max-w-lg', standard: 'max-w-2xl', wide: 'max-w-4xl' }
const fontMap = { sans: 'font-sans', serif: 'font-serif', mono: 'font-mono' }

interface ReaderViewProps {
  book: { id: string; title: string; slug: string; author: { username: string; display_name: string | null } }
  chapter: Chapter
  prevNum: number | null
  nextNum: number | null
  totalChapters: number
}

export function ReaderView({ book, chapter, prevNum, nextNum, totalChapters }: ReaderViewProps) {
  const settings = useReadingSettings()
  const [scrollProgress, setScrollProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement
      const scrollTop = el.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      if (scrollHeight > 0) setScrollProgress(Math.round((scrollTop / scrollHeight) * 100))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevNum) window.location.href = `/books/${book.slug}/chapters/${prevNum}`
      if (e.key === 'ArrowRight' && nextNum) window.location.href = `/books/${book.slug}/chapters/${nextNum}`
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [book.slug, prevNum, nextNum])

  const themeClass = settings.theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' : ''

  return (
    <div className={cn('min-h-screen', themeClass)}>
      {/* Top progress bar */}
      <div className="fixed top-[56px] left-0 right-0 z-40 h-0.5 bg-muted">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Top bar */}
      <div className="sticky top-[56px] z-30 border-b bg-background/95 backdrop-blur">
        <div className={cn('mx-auto px-4 flex items-center justify-between h-10', widthMap[settings.maxWidth])}>
          <Link href={`/books/${book.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors truncate">
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{book.title}</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">{scrollProgress}%</span>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3.5 w-3.5" /></Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Настройки чтения</SheetTitle></SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <Label className="text-sm">Размер шрифта: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([v]) => settings.setFontSize(v)}
                      min={14} max={24} step={1} className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Шрифт</Label>
                    <Select value={settings.fontFamily} onValueChange={(v: any) => settings.setFontFamily(v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans">Sans-serif</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="mono">Mono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Межстрочный: {settings.lineHeight}</Label>
                    <Slider
                      value={[settings.lineHeight]}
                      onValueChange={([v]) => settings.setLineHeight(v)}
                      min={1.4} max={2.2} step={0.2} className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Тема</Label>
                    <div className="flex gap-2 mt-2">
                      {(['light', 'dark', 'sepia'] as const).map(t => (
                        <Button
                          key={t}
                          size="sm"
                          variant={settings.theme === t ? 'default' : 'outline'}
                          onClick={() => settings.setTheme(t)}
                        >
                          {t === 'light' ? '☀️ Светлая' : t === 'dark' ? '🌙 Тёмная' : '📜 Сепия'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Ширина</Label>
                    <div className="flex gap-2 mt-2">
                      {(['narrow', 'standard', 'wide'] as const).map(w => (
                        <Button
                          key={w}
                          size="sm"
                          variant={settings.maxWidth === w ? 'default' : 'outline'}
                          onClick={() => settings.setMaxWidth(w)}
                        >
                          {w === 'narrow' ? 'Узкая' : w === 'standard' ? 'Стандарт' : 'Широкая'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content */}
      <article
        ref={contentRef}
        className={cn('mx-auto px-4 py-8', widthMap[settings.maxWidth], fontMap[settings.fontFamily])}
        style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ fontSize: `${settings.fontSize + 6}px` }}>
          Глава {chapter.chapter_number}: {chapter.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {formatNumber(chapter.word_count)} слов · {estimateReadingTime(chapter.word_count)}
        </p>

        <div
          className="prose dark:prose-invert max-w-none"
          style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />

        {chapter.author_note && (
          <div className="mt-8 p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-1">📌 Заметка автора</p>
            <p className="text-sm text-muted-foreground">{chapter.author_note}</p>
          </div>
        )}
      </article>

      {/* Navigation */}
      <div className={cn('mx-auto px-4 py-6 flex items-center justify-between border-t', widthMap[settings.maxWidth])}>
        {prevNum ? (
          <Link href={`/books/${book.slug}/chapters/${prevNum}`}>
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Глава {prevNum}</Button>
          </Link>
        ) : <div />}
        <Link href={`/books/${book.slug}`}>
          <Button variant="ghost" size="sm"><List className="h-4 w-4 mr-1" />Оглавление</Button>
        </Link>
        {nextNum ? (
          <Link href={`/books/${book.slug}/chapters/${nextNum}`}>
            <Button variant="outline">Глава {nextNum}<ArrowRight className="h-4 w-4 ml-2" /></Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>Конец</Button>
        )}
      </div>

      {/* Comments */}
      {chapter.comments_enabled && (
        <div className={cn('mx-auto px-4 pb-12', widthMap[settings.maxWidth])}>
          <CommentsSection chapterId={chapter.id} bookAuthorId={book.id} />
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatNumber } from '@/lib/utils'
import { ArrowLeft, ChevronRight, FileText, Maximize2, Minimize2 } from 'lucide-react'
import type { Chapter } from '@/lib/types/database'

// Dynamic import editor — no SSR, lazy load
const NovelEditor = dynamic(
    () => import('@/components/editor/novel-editor').then(m => ({ default: m.NovelEditor })),
    {
        ssr: false,
        loading: () => <div className="flex-1 flex items-center justify-center"><Skeleton className="w-full h-full" /></div>,
    }
)

interface WritePageClientProps {
    book: { id: string; title: string }
    chapters: Pick<Chapter, 'id' | 'chapter_number' | 'title' | 'word_count' | 'status'>[]
    activeChapter: Chapter | null
    entities?: { id: string; name: string; entity_type: string }[]
}



const ChapterListItem = memo(function ChapterListItem({
    ch, active, bookId,
}: {
    ch: Pick<Chapter, 'id' | 'chapter_number' | 'title' | 'status'>
    active: boolean
    bookId: string
}) {
    const statusIcon = ch.status === 'published' ? '✓' : ch.status === 'draft' ? '◻' : '⏳'
    return (
        <Link
            href={`/dashboard/books/${bookId}/write?chapter=${ch.id}`}
            className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent text-muted-foreground'
            )}
        >
            <span className="text-xs w-4">{statusIcon}</span>
            <span className="truncate flex-1">
                <span className="font-mono text-xs mr-1">{ch.chapter_number}.</span>
                {ch.title}
            </span>
        </Link>
    )
})

export function WritePageClient({ book, chapters, activeChapter, entities = [] }: WritePageClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [focusMode, setFocusMode] = useState(false)
    const [wordCount, setWordCount] = useState(activeChapter?.word_count || 0)

    if (!activeChapter) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Нет глав. Создайте первую главу в настройках книги.</p>
                    <Link href={`/dashboard/books/${book.id}`}>
                        <Button variant="outline" className="mt-4">К книге</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full">
            {/* Left sidebar — chapters */}
            {sidebarOpen && !focusMode && (
                <div className="w-56 border-r flex flex-col shrink-0 bg-card">
                    <div className="p-3 border-b">
                        <Link href={`/dashboard/books/${book.id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-3 w-3" />{book.title}
                        </Link>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-0.5">
                            {chapters.map(ch => (
                                <ChapterListItem
                                    key={ch.id}
                                    ch={ch}
                                    active={ch.id === activeChapter.id}
                                    bookId={book.id}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Main editor */}
            <div className="flex-1 flex flex-col min-w-0">
                {!focusMode && (
                    <div className="flex items-center gap-2 px-4 py-2 border-b bg-card">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <ChevronRight className={cn('h-4 w-4 transition-transform', sidebarOpen && 'rotate-180')} />
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-medium truncate">
                                Глава {activeChapter.chapter_number}: {activeChapter.title}
                            </h2>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatNumber(wordCount)} слов</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFocusMode(true)} title="Режим фокуса">
                            <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}

                {focusMode && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-20 h-7 w-7"
                        onClick={() => setFocusMode(false)}
                    >
                        <Minimize2 className="h-3.5 w-3.5" />
                    </Button>
                )}

                <div className="flex-1 overflow-hidden">
                    <NovelEditor
                        key={activeChapter.id}
                        chapterId={activeChapter.id}
                        initialContent={activeChapter.content}
                        onWordCountChange={setWordCount}
                        entities={entities}
                    />
                </div>
            </div>
        </div>
    )
}
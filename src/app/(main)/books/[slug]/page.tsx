import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Eye, BookOpen, Clock, Calendar, Users, ExternalLink, MessageSquare } from 'lucide-react'
import { formatNumber, formatDate, getBookStatusLabel, estimateReadingTime } from '@/lib/utils'
import { BookActions } from './book-actions'
import type { Metadata } from 'next'
import { ReviewSection } from '@/components/reviews/review-section'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data: book } = await supabase.from('books').select('title, description_short, cover_url').eq('slug', slug).eq('is_published', true).single()
    if (!book) return { title: 'Книга не найдена' }
    return {
        title: book.title,
        description: book.description_short,
        openGraph: { title: book.title, description: book.description_short || '', images: book.cover_url ? [book.cover_url] : [] },
    }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: book } = await supabase
        .from('books')
        .select('*, author:profiles!books_author_id_fkey(id, username, display_name, avatar_url)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (!book) notFound()

    const { data: chapters } = await supabase
        .from('chapters')
        .select('id, chapter_number, title, word_count, published_at')
        .eq('book_id', book.id)
        .eq('status', 'published')
        .order('chapter_number')

    // Increment views (fire-and-forget)
    supabase.rpc('increment_book_views', { book_id: book.id }).then(() => { })

    const statusColors: Record<string, string> = {
        ongoing: 'text-green-600', completed: 'text-blue-600', paused: 'text-yellow-600',
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Cover */}
                <div className="w-48 md:w-56 shrink-0 mx-auto md:mx-0">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-lg">
                        {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                                <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                    <h1 className="text-3xl font-bold">{book.title}</h1>

                    <Link href={`/authors/${(book as any).author?.username}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <div className="h-6 w-6 rounded-full bg-muted overflow-hidden">
                            {(book as any).author?.avatar_url ? (
                                <img src={(book as any).author.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                                    {((book as any).author?.display_name?.[0] || '?').toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className="font-medium">{(book as any).author?.display_name || (book as any).author?.username}</span>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        {book.avg_rating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                {Number(book.avg_rating).toFixed(1)}
                                <span className="text-muted-foreground font-normal">({book.rating_count})</span>
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground"><Eye className="h-4 w-4" />{formatNumber(book.total_views)}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><BookOpen className="h-4 w-4" />{chapters?.length || 0} глав</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{estimateReadingTime(book.total_words)}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" />{formatNumber(book.subscriber_count)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${statusColors[book.status] || ''}`}>
                            {getBookStatusLabel(book.status)}
                        </span>
                        <Badge variant="outline">{book.age_rating}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {book.genres?.map((g: string) => <Badge key={g} variant="secondary">{g}</Badge>)}
                        {book.tags?.map((t: string) => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {chapters && chapters.length > 0 && (
                            <Link href={`/books/${slug}/chapters/1`}>
                                <Button size="lg">▶ Начать читать</Button>
                            </Link>
                        )}
                        <BookActions bookId={book.id} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="mt-8">
                <TabsList>
                    <TabsTrigger value="about">Описание</TabsTrigger>
                    <TabsTrigger value="chapters">Оглавление ({chapters?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-4">
                    <div className="prose dark:prose-invert max-w-none">
                        {book.description_full ? (
                            <div dangerouslySetInnerHTML={{ __html: book.description_full.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <p className="text-muted-foreground">{book.description_short || 'Описание отсутствует'}</p>
                        )}
                    </div>
                    {book.content_warnings?.length > 0 && (
                        <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">⚠️ Предупреждения</p>
                            <p className="text-sm text-muted-foreground">{book.content_warnings.join(', ')}</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="chapters" className="mt-4">
                    {chapters && chapters.length > 0 ? (
                        <div className="space-y-1">
                            {chapters.map(ch => (
                                <Link
                                    key={ch.id}
                                    href={`/books/${slug}/chapters/${ch.chapter_number}`}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-sm font-mono text-muted-foreground w-8 shrink-0">{ch.chapter_number}</span>
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">{ch.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                                        <span>{formatNumber(ch.word_count)} сл.</span>
                                        {ch.published_at && <span>{formatDate(ch.published_at)}</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Главы ещё не опубликованы</p>
                    )}
                </TabsContent>

        // В секцию TabsList добавить:
                <TabsTrigger value="reviews">Рецензии</TabsTrigger>

// И добавить TabsContent после chapters:
                <TabsContent value="reviews" className="mt-4">
                    <ReviewSection bookId={book.id} bookAuthorId={book.author_id} />
                </TabsContent>

            </Tabs>
        </div>
    )
}
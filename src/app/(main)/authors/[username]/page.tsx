import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Eye, Users, Star, Calendar, Globe, ExternalLink } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('display_name, username, bio').eq('username', username).single()
  return {
    title: profile ? `${profile.display_name || profile.username} — Автор` : 'Автор не найден',
    description: profile?.bio || '',
  }
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('author_id', profile.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const totalViews = books?.reduce((s, b) => s + b.total_views, 0) || 0
  const totalSubs = books?.reduce((s, b) => s + b.subscriber_count, 0) || 0
  const totalChapters = books?.reduce((s, b) => s + 0, 0) || 0

  // Get chapter count
  const { count: chapterCount } = await supabase
    .from('chapters')
    .select('id', { count: 'exact', head: true })
    .in('book_id', books?.map(b => b.id) || [])
    .eq('status', 'published')

  const initials = (profile.display_name || profile.username)[0].toUpperCase()
  const links = profile.external_links || {}

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold flex items-center gap-2 justify-center sm:justify-start">
            {profile.display_name || profile.username}
            {profile.role === 'author' && <Badge variant="secondary" className="text-xs">✍️ Автор</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-3 max-w-xl">{profile.bio}</p>}

          <div className="flex flex-wrap items-center gap-4 mt-4 justify-center sm:justify-start text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{books?.length || 0} книг</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{chapterCount || 0} глав</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{formatNumber(totalViews)} просм.</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{formatNumber(totalSubs)} подписчиков</span>
          </div>

          {Object.keys(links).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {links.website && (
                <a href={links.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Globe className="h-3 w-3" />Сайт
                </a>
              )}
              {links.telegram && (
                <a href={`https://t.me/${links.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />Telegram
                </a>
              )}
              {links.patreon && (
                <a href={links.patreon} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />Patreon
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="books" className="mt-8">
        <TabsList>
          <TabsTrigger value="books">Книги ({books?.length || 0})</TabsTrigger>
          <TabsTrigger value="about">Об авторе</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-4">
          {books && books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {books.map(book => (
                <Link key={book.id} href={`/books/${book.slug}`} className="group">
                  <Card className="overflow-hidden h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    <div className="aspect-[2/3] bg-muted overflow-hidden">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2.5">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {book.avg_rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{Number(book.avg_rating).toFixed(1)}
                          </span>
                        )}
                        <span>{formatNumber(book.total_views)} просм.</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">У автора пока нет опубликованных книг</p>
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm">{profile.bio || 'Автор пока не добавил информацию о себе.'}</p>
              <p className="text-xs text-muted-foreground mt-4">На платформе с {formatDate(profile.created_at)}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookverse.app'

  const { data: books } = await supabase
    .from('books')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(1000)

  const { data: authors } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .eq('role', 'author')
    .limit(500)

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/books`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/rankings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const bookPages: MetadataRoute.Sitemap = (books || []).map(book => ({
    url: `${baseUrl}/books/${book.slug}`,
    lastModified: new Date(book.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const authorPages: MetadataRoute.Sitemap = (authors || []).map(a => ({
    url: `${baseUrl}/authors/${a.username}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...bookPages, ...authorPages]
}
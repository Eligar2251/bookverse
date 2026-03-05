import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookMarked, BookOpen } from 'lucide-react'

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from('collections')
    .select('*, creator:profiles!collections_creator_id_fkey(username, display_name), items:collection_items(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📚 Подборки</h1>

      {collections && collections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((col: any) => (
            <Link key={col.id} href={`/collections/${col.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <BookMarked className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold line-clamp-1">{col.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{col.creator?.display_name || col.creator?.username}</p>
                      {col.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{col.description}</p>}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">{col.items?.[0]?.count || 0} книг</Badge>
                        {col.is_editorial && <Badge className="text-xs bg-primary">Редакционная</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookMarked className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Подборки пока не созданы</p>
        </div>
      )}
    </div>
  )
}
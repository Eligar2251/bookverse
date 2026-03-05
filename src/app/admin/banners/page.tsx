import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Image } from 'lucide-react'

export default async function AdminBannersPage() {
  const supabase = await createClient()
  const { data: banners } = await supabase.from('banners').select('*').order('sort_order')

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">🖼️ Баннеры</h1>
      <p className="text-muted-foreground text-sm">Управление hero-баннером на главной странице.</p>
      {banners && banners.length > 0 ? (
        <div className="space-y-2">
          {banners.map(b => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <p className="font-medium">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Image className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Нет баннеров</p>
        </div>
      )}
    </div>
  )
}
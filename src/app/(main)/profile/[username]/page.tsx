import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, MessageSquare, Star, Calendar } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) notFound()

  // If author, redirect to author page
  if (profile.role === 'author' || profile.role === 'admin') {
    redirect(`/authors/${username}`)
  }

  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  const { count: commentCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  const initials = (profile.display_name || profile.username)[0].toUpperCase()

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold mt-4">{profile.display_name || profile.username}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-3 max-w-md mx-auto">{profile.bio}</p>}

          <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-4 w-4" />{reviewCount || 0} рецензий</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{commentCount || 0} комментариев</span>
          </div>

          <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3" />
            На платформе с {formatDate(profile.created_at)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
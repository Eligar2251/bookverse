'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createReview } from '@/app/actions/reviews'
import { toast } from 'sonner'
import { Star, ThumbsUp, ThumbsDown, Loader2, PenLine } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          disabled={!onChange}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star className={`${s} ${i <= value ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'} transition-colors`} />
        </button>
      ))}
    </div>
  )
}

const ReviewItem = memo(function ReviewItem({ review }: { review: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={review.user?.avatar_url} />
            <AvatarFallback className="text-xs">{(review.user?.display_name || review.user?.username || '?')[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{review.user?.display_name || review.user?.username}</span>
              <span className="text-xs text-muted-foreground">{formatRelativeDate(review.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <StarRating value={Math.round(review.rating_overall)} size="sm" />
              <span className="text-sm font-medium ml-1">{Number(review.rating_overall).toFixed(1)}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>Стиль: {review.rating_style}</span>
              <span>Сюжет: {review.rating_story}</span>
              <span>Персонажи: {review.rating_characters}</span>
              <span>Грамматика: {review.rating_grammar}</span>
            </div>
            {review.has_spoilers && (
              <span className="text-xs text-yellow-600 font-medium mt-1 block">⚠️ Содержит спойлеры</span>
            )}
            {review.content && <p className="text-sm mt-2 whitespace-pre-wrap">{review.content}</p>}
            {review.author_response && (
              <div className="mt-3 pl-3 border-l-2 border-primary/30">
                <p className="text-xs font-medium text-primary">Ответ автора:</p>
                <p className="text-sm mt-0.5">{review.author_response}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export function ReviewSection({ bookId, bookAuthorId }: { bookId: string; bookAuthorId: string }) {
  const { user } = useUser()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const [rOverall, setROverall] = useState(5)
  const [rStyle, setRStyle] = useState(5)
  const [rStory, setRStory] = useState(5)
  const [rChars, setRChars] = useState(5)
  const [rGrammar, setRGrammar] = useState(5)
  const [content, setContent] = useState('')
  const [hasSpoilers, setHasSpoilers] = useState(false)

  const fetchReviews = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*, user:profiles!reviews_user_id_fkey(username, display_name, avatar_url)')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }, [bookId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const avgRatings = reviews.length > 0 ? {
    style: (reviews.reduce((s, r) => s + Number(r.rating_style || 0), 0) / reviews.length).toFixed(1),
    story: (reviews.reduce((s, r) => s + Number(r.rating_story || 0), 0) / reviews.length).toFixed(1),
    chars: (reviews.reduce((s, r) => s + Number(r.rating_characters || 0), 0) / reviews.length).toFixed(1),
    grammar: (reviews.reduce((s, r) => s + Number(r.rating_grammar || 0), 0) / reviews.length).toFixed(1),
  } : null

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 50) {
      toast.error('Минимум 50 символов в рецензии')
      return
    }
    setSending(true)
    const res = await createReview(bookId, {
      rating_overall: rOverall,
      rating_style: rStyle,
      rating_story: rStory,
      rating_characters: rChars,
      rating_grammar: rGrammar,
      content: content.trim(),
      has_spoilers: hasSpoilers,
    })
    if (res.error) { toast.error(res.error); setSending(false); return }
    toast.success('Рецензия опубликована!')
    setSending(false)
    setDialogOpen(false)
    setContent('')
    fetchReviews()
  }

  const userHasReview = user && reviews.some(r => r.user_id === user.id)

  return (
    <div className="space-y-4">
      {/* Avg ratings bar */}
      {avgRatings && (
        <div className="flex flex-wrap gap-4 text-sm p-4 rounded-lg bg-muted/50">
          <span>Стиль: <strong>{avgRatings.style}</strong></span>
          <span>Сюжет: <strong>{avgRatings.story}</strong></span>
          <span>Персонажи: <strong>{avgRatings.chars}</strong></span>
          <span>Грамматика: <strong>{avgRatings.grammar}</strong></span>
        </div>
      )}

      {/* Write review button */}
      {user && !userHasReview && user.id !== bookAuthorId && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><PenLine className="h-4 w-4 mr-2" />Написать рецензию</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Новая рецензия</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Общая оценка</Label><StarRating value={rOverall} onChange={setROverall} /></div>
                <div><Label className="text-xs">Стиль</Label><StarRating value={rStyle} onChange={setRStyle} size="sm" /></div>
                <div><Label className="text-xs">Сюжет</Label><StarRating value={rStory} onChange={setRStory} size="sm" /></div>
                <div><Label className="text-xs">Персонажи</Label><StarRating value={rChars} onChange={setRChars} size="sm" /></div>
                <div><Label className="text-xs">Грамматика</Label><StarRating value={rGrammar} onChange={setRGrammar} size="sm" /></div>
              </div>
              <div>
                <Label>Текст рецензии (мин. 50 символов)</Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{content.length} символов</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={hasSpoilers} onCheckedChange={setHasSpoilers} id="spoiler" />
                <Label htmlFor="spoiler" className="text-sm">Содержит спойлеры</Label>
              </div>
              <Button onClick={handleSubmit} disabled={sending} className="w-full">
                {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Опубликовать рецензию
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map(r => <ReviewItem key={r.id} review={r} />)}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">Нет рецензий. Будьте первым!</p>
      )}
    </div>
  )
}
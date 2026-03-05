'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, ThumbsUp, MessageSquare, Send } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

interface CommentData {
  id: string
  content: string
  created_at: string
  likes_count: number
  parent_id: string | null
  user: { username: string; display_name: string | null; avatar_url: string | null }
  replies?: CommentData[]
}

const CommentItem = memo(function CommentItem({
  comment, onReply, onLike, userId,
}: {
  comment: CommentData; onReply: (id: string) => void; onLike: (id: string) => void; userId?: string
}) {
  const initials = (comment.user.display_name || comment.user.username)[0].toUpperCase()
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user.avatar_url || undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.user.display_name || comment.user.username}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
        </div>
        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <button onClick={() => onLike(comment.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ThumbsUp className="h-3 w-3" />{comment.likes_count > 0 ? comment.likes_count : ''}
          </button>
          {!comment.parent_id && (
            <button onClick={() => onReply(comment.id)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Ответить
            </button>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} onLike={onLike} userId={userId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export function CommentsSection({ chapterId }: { chapterId: string; bookAuthorId: string }) {
  const { user } = useUser()
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const fetchComments = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, likes_count, parent_id, user:profiles!comments_user_id_fkey(username, display_name, avatar_url)')
      .eq('chapter_id', chapterId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (data) {
      const top: CommentData[] = []
      const replies: CommentData[] = []
      for (const c of data as any[]) {
        const item: CommentData = { ...c, user: c.user, replies: [] }
        if (c.parent_id) replies.push(item)
        else top.push(item)
      }
      for (const r of replies) {
        const parent = top.find(t => t.id === r.parent_id)
        if (parent) parent.replies!.push(r)
      }
      // Sort replies chronologically
      top.forEach(t => t.replies?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()))
      setComments(top)
    }
    setLoading(false)
  }, [chapterId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const handleSubmit = async () => {
    if (!user || !text.trim()) return
    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      chapter_id: chapterId,
      parent_id: replyTo,
      content: text.trim(),
    })
    if (error) { toast.error(error.message); setSending(false); return }
    setText('')
    setReplyTo(null)
    setSending(false)
    fetchComments()
  }

  const handleLike = async (commentId: string) => {
    if (!user) return
    const supabase = createClient()
    const { data: existing } = await supabase
      .from('comment_likes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .single()

    if (existing) {
      await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId)
      await supabase.from('comments').update({ likes_count: Math.max(0, (comments.find(c => c.id === commentId)?.likes_count || 1) - 1) }).eq('id', commentId)
    } else {
      await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId })
      await supabase.from('comments').update({ likes_count: (comments.find(c => c.id === commentId)?.likes_count || 0) + 1 }).eq('id', commentId)
    }
    fetchComments()
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        Комментарии ({comments.length})
      </h3>

      {user ? (
        <div className="mb-6 space-y-2">
          {replyTo && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              Ответ на комментарий
              <button onClick={() => setReplyTo(null)} className="text-primary hover:underline">Отмена</button>
            </div>
          )}
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Написать комментарий..."
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={sending || !text.trim()} size="sm">
            {sending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
            Отправить
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          <a href="/login" className="text-primary hover:underline">Войдите</a>, чтобы оставить комментарий
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-5">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
              onLike={handleLike}
              userId={user?.id}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">Пока нет комментариев. Будьте первым!</p>
      )}
    </div>
  )
}
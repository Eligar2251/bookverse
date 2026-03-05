'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkAndAwardAchievements(userId: string) {
  const supabase = await createClient()

  // Get existing achievements
  const { data: existing } = await supabase
    .from('achievements')
    .select('achievement_type')
    .eq('user_id', userId)
  const has = new Set(existing?.map(a => a.achievement_type) || [])

  // Check: first_steps — published at least 1 chapter
  if (!has.has('first_steps')) {
    const { data: books } = await supabase.from('books').select('id').eq('author_id', userId)
    if (books?.length) {
      const { count } = await supabase
        .from('chapters')
        .select('id', { count: 'exact', head: true })
        .in('book_id', books.map(b => b.id))
        .eq('status', 'published')
      if (count && count > 0) {
        await supabase.from('achievements').insert({ user_id: userId, achievement_type: 'first_steps' })
        await supabase.from('notifications').insert({
          user_id: userId, type: 'achievement', title: '🏆 Достижение разблокировано!',
          message: '✍️ Первые шаги — вы опубликовали первую главу', link: '/dashboard',
        })
      }
    }
  }

  // Check: critic — 10 reviews
  if (!has.has('critic')) {
    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if (count && count >= 10) {
      await supabase.from('achievements').insert({ user_id: userId, achievement_type: 'critic' })
      await supabase.from('notifications').insert({
        user_id: userId, type: 'achievement', title: '🏆 Достижение!',
        message: '⭐ Критик — вы написали 10 рецензий', link: '/dashboard',
      })
    }
  }

  // Check: popular — 100 subscribers
  if (!has.has('popular')) {
    const { data: books } = await supabase.from('books').select('subscriber_count').eq('author_id', userId)
    const total = books?.reduce((s, b) => s + b.subscriber_count, 0) || 0
    if (total >= 100) {
      await supabase.from('achievements').insert({ user_id: userId, achievement_type: 'popular' })
      await supabase.from('notifications').insert({
        user_id: userId, type: 'achievement', title: '🏆 Достижение!',
        message: '👥 Популярный — у вас 100+ подписчиков', link: '/dashboard',
      })
    }
  }
}
export interface AchievementDef {
  type: string
  title: string
  description: string
  icon: string
  category: 'reader' | 'author'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Reader
  { type: 'bookworm', title: '📚 Книжный червь', description: 'Прочитать 10 книг', icon: '📚', category: 'reader' },
  { type: 'marathon', title: '🔥 Марафонец', description: 'Читать 7 дней подряд', icon: '🔥', category: 'reader' },
  { type: 'activist', title: '💬 Активист', description: 'Оставить 50 комментариев', icon: '💬', category: 'reader' },
  { type: 'critic', title: '⭐ Критик', description: 'Написать 10 рецензий', icon: '⭐', category: 'reader' },
  { type: 'curator', title: '📋 Куратор', description: 'Создать публичный список из 10+ книг', icon: '📋', category: 'reader' },
  // Author
  { type: 'first_steps', title: '✍️ Первые шаги', description: 'Опубликовать первую главу', icon: '✍️', category: 'author' },
  { type: 'prolific', title: '📖 Плодовитый', description: 'Опубликовать 100 глав', icon: '📖', category: 'author' },
  { type: 'regular', title: '🔥 Регулярный', description: 'Публиковать каждую неделю 3 месяца', icon: '🔥', category: 'author' },
  { type: 'popular', title: '👥 Популярный', description: 'Набрать 100 подписчиков', icon: '👥', category: 'author' },
  { type: 'recognized', title: '🏆 Признанный', description: 'Средний рейтинг 4.5+ при 50+ оценках', icon: '🏆', category: 'author' },
  { type: 'worldbuilder', title: '🌍 Миростроитель', description: 'Создать вселенную с 20+ сущностями', icon: '🌍', category: 'author' },
]

export function getAchievementDef(type: string) {
  return ACHIEVEMENTS.find(a => a.type === type)
}
export type UserRole = 'reader' | 'author' | 'moderator' | 'admin'
export type BookStatus = 'draft' | 'ongoing' | 'paused' | 'completed' | 'abandoned'
export type ChapterStatus = 'draft' | 'scheduled' | 'published'
export type AgeRating = '6+' | '12+' | '16+' | '18+'
export type ShelfType = 'reading' | 'want_to_read' | 'completed' | 'paused' | 'dropped'
export type EntityType = 'character' | 'location' | 'faction' | 'item' | 'race' | 'magic_system' | 'event' | 'article'

export interface Profile {
  id: string
  email: string | null
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string
  role: UserRole
  external_links: Record<string, string>
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  author_id: string
  universe_id: string | null
  title: string
  slug: string
  description_short: string
  description_full: string
  cover_url: string | null
  status: BookStatus
  age_rating: AgeRating
  genres: string[]
  tags: string[]
  content_warnings: string[]
  publication_schedule: Record<string, unknown>
  comments_enabled: boolean
  is_published: boolean
  total_views: number
  total_words: number
  avg_rating: number
  rating_count: number
  subscriber_count: number
  created_at: string
  updated_at: string
  // joined
  author?: Profile
}

export interface Chapter {
  id: string
  book_id: string
  volume_id: string | null
  chapter_number: number
  title: string
  content: string
  author_note: string
  word_count: number
  status: ChapterStatus
  scheduled_at: string | null
  published_at: string | null
  comments_enabled: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface Volume {
  id: string
  book_id: string
  title: string
  sort_order: number
  created_at: string
}

export interface Universe {
  id: string
  author_id: string
  title: string
  description: string
  cover_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Entity {
  id: string
  universe_id: string
  entity_type: EntityType
  name: string
  avatar_url: string | null
  data: Record<string, unknown>
  custom_fields: Record<string, unknown>
  is_public: boolean
  spoiler_level: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  user_id: string
  chapter_id: string
  parent_id: string | null
  content: string
  likes_count: number
  is_spoiler: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  user?: Profile
  replies?: Comment[]
}

export interface Review {
  id: string
  user_id: string
  book_id: string
  rating_overall: number
  rating_style: number | null
  rating_story: number | null
  rating_characters: number | null
  rating_grammar: number | null
  content: string
  has_spoilers: boolean
  likes_count: number
  dislikes_count: number
  author_response: string | null
  author_response_at: string | null
  created_at: string
  updated_at: string
  user?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string
  read_at: string | null
}

export interface LibraryItem {
  id: string
  user_id: string
  book_id: string
  shelf: ShelfType
  last_chapter_id: string | null
  scroll_position: number
  created_at: string
  updated_at: string
  book?: Book
}

export interface Subscription {
  id: string
  user_id: string
  target_type: 'book' | 'author'
  target_id: string
  notify_email: boolean
  notify_inapp: boolean
  created_at: string
}

export interface Genre {
  id: string
  name: string
  slug: string
  sort_order: number
}

export interface Collection {
  id: string
  creator_id: string
  title: string
  description: string
  is_public: boolean
  is_editorial: boolean
  cover_url: string | null
  created_at: string
  updated_at: string
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelativeDate(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин. назад`
  if (hours < 24) return `${hours} ч. назад`
  if (days < 7) return `${days} дн. назад`
  return formatDate(date)
}

export function estimateReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200)
  if (minutes < 60) return `~${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `~${hours} ч ${remainingMinutes} мин`
}

export function getBookStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Черновик',
    ongoing: 'Пишется',
    paused: 'На паузе',
    completed: 'Завершена',
    abandoned: 'Заброшена',
  }
  return map[status] || status
}

export function getBookStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-500',
    ongoing: 'bg-green-500',
    paused: 'bg-yellow-500',
    completed: 'bg-blue-500',
    abandoned: 'bg-red-500',
  }
  return map[status] || 'bg-gray-500'
}

export function getShelfLabel(shelf: string): string {
  const map: Record<string, string> = {
    reading: 'Читаю',
    want_to_read: 'Хочу прочитать',
    completed: 'Прочитано',
    paused: 'На паузе',
    dropped: 'Брошено',
  }
  return map[shelf] || shelf
}

import { transliterate } from 'transliteration'

export function generateSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  const words = stripped.trim().split(/\s+/).filter(Boolean)
  return words.length
}
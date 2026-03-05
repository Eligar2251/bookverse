import { Users, MapPin, Shield, Sword, Globe2, Zap, Calendar, FileText } from 'lucide-react'
import type { EntityType } from '@/lib/types/database'

export interface EntityFieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'entity-ref' | 'entity-ref-multi' | 'tags'
  placeholder?: string
  options?: { value: string; label: string }[]
  entityTypes?: EntityType[] // for entity-ref
}

export interface EntityTypeConfig {
  type: EntityType
  label: string
  labelPlural: string
  icon: any
  color: string
  fields: EntityFieldConfig[]
}

export const ENTITY_CONFIGS: EntityTypeConfig[] = [
  {
    type: 'character',
    label: 'Персонаж',
    labelPlural: 'Персонажи',
    icon: Users,
    color: 'text-blue-500 bg-blue-500/10',
    fields: [
      { key: 'titles', label: 'Прозвища/титулы', type: 'text', placeholder: 'Пример: Убийца Драконов' },
      { key: 'gender', label: 'Пол', type: 'select', options: [
        { value: 'male', label: 'Мужской' }, { value: 'female', label: 'Женский' }, { value: 'other', label: 'Другой' },
      ]},
      { key: 'age', label: 'Возраст', type: 'text', placeholder: '25 лет' },
      { key: 'race', label: 'Раса/народ', type: 'text' },
      { key: 'faction', label: 'Страна/фракция', type: 'text' },
      { key: 'appearance', label: 'Внешность', type: 'textarea' },
      { key: 'personality', label: 'Характер', type: 'textarea' },
      { key: 'biography', label: 'Биография', type: 'textarea' },
      { key: 'abilities', label: 'Способности/навыки', type: 'textarea' },
      { key: 'goals', label: 'Цели и мотивация', type: 'textarea' },
    ],
  },
  {
    type: 'location',
    label: 'Локация',
    labelPlural: 'Локации',
    icon: MapPin,
    color: 'text-green-500 bg-green-500/10',
    fields: [
      { key: 'location_type', label: 'Тип', type: 'select', options: [
        { value: 'world', label: 'Мир' }, { value: 'continent', label: 'Континент' },
        { value: 'country', label: 'Страна' }, { value: 'city', label: 'Город' },
        { value: 'village', label: 'Деревня' }, { value: 'castle', label: 'Замок' },
        { value: 'forest', label: 'Лес' }, { value: 'mountain', label: 'Горы' },
        { value: 'dungeon', label: 'Подземелье' }, { value: 'other', label: 'Другое' },
      ]},
      { key: 'parent_location', label: 'Родительская локация', type: 'text' },
      { key: 'population', label: 'Население', type: 'text' },
      { key: 'climate', label: 'Климат', type: 'text' },
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'features', label: 'Ключевые особенности', type: 'textarea' },
    ],
  },
  {
    type: 'faction',
    label: 'Организация',
    labelPlural: 'Организации',
    icon: Shield,
    color: 'text-purple-500 bg-purple-500/10',
    fields: [
      { key: 'faction_type', label: 'Тип', type: 'select', options: [
        { value: 'kingdom', label: 'Королевство' }, { value: 'republic', label: 'Республика' },
        { value: 'guild', label: 'Гильдия' }, { value: 'order', label: 'Орден' },
        { value: 'clan', label: 'Клан' }, { value: 'other', label: 'Другое' },
      ]},
      { key: 'leader', label: 'Лидер', type: 'text' },
      { key: 'government', label: 'Форма правления', type: 'text' },
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'territory', label: 'Территория', type: 'text' },
      { key: 'allies', label: 'Союзники', type: 'text' },
      { key: 'enemies', label: 'Враги', type: 'text' },
    ],
  },
  {
    type: 'item',
    label: 'Предмет',
    labelPlural: 'Предметы',
    icon: Sword,
    color: 'text-orange-500 bg-orange-500/10',
    fields: [
      { key: 'item_type', label: 'Тип', type: 'select', options: [
        { value: 'weapon', label: 'Оружие' }, { value: 'armor', label: 'Доспех' },
        { value: 'artifact', label: 'Артефакт' }, { value: 'potion', label: 'Зелье' },
        { value: 'tool', label: 'Инструмент' }, { value: 'other', label: 'Другое' },
      ]},
      { key: 'creator', label: 'Создатель', type: 'text' },
      { key: 'owner', label: 'Владелец', type: 'text' },
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'properties', label: 'Свойства/магические эффекты', type: 'textarea' },
      { key: 'history', label: 'История', type: 'textarea' },
    ],
  },
  {
    type: 'race',
    label: 'Раса/Народ',
    labelPlural: 'Расы и Народы',
    icon: Globe2,
    color: 'text-teal-500 bg-teal-500/10',
    fields: [
      { key: 'lifespan', label: 'Продолжительность жизни', type: 'text' },
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'physical', label: 'Физические особенности', type: 'textarea' },
      { key: 'culture', label: 'Культура и обычаи', type: 'textarea' },
      { key: 'homeland', label: 'Родина', type: 'text' },
    ],
  },
  {
    type: 'magic_system',
    label: 'Система магии',
    labelPlural: 'Системы магии',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-500/10',
    fields: [
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'rules', label: 'Правила и ограничения', type: 'textarea' },
      { key: 'source', label: 'Источник силы', type: 'text' },
      { key: 'levels', label: 'Уровни/классификации', type: 'textarea' },
      { key: 'users', label: 'Пользователи', type: 'text' },
    ],
  },
  {
    type: 'event',
    label: 'Событие',
    labelPlural: 'События',
    icon: Calendar,
    color: 'text-red-500 bg-red-500/10',
    fields: [
      { key: 'date_label', label: 'Дата (по календарю мира)', type: 'text', placeholder: 'Год 234, 3-я эпоха' },
      { key: 'description', label: 'Описание', type: 'textarea' },
      { key: 'participants', label: 'Участники', type: 'text' },
      { key: 'location', label: 'Локация', type: 'text' },
      { key: 'consequences', label: 'Последствия', type: 'textarea' },
    ],
  },
  {
    type: 'article',
    label: 'Статья',
    labelPlural: 'Статьи',
    icon: FileText,
    color: 'text-indigo-500 bg-indigo-500/10',
    fields: [
      { key: 'content', label: 'Содержание', type: 'textarea' },
      { key: 'category', label: 'Категория', type: 'text' },
    ],
  },
]

export function getEntityConfig(type: EntityType) {
  return ENTITY_CONFIGS.find(c => c.type === type)!
}
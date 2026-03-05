import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Mention from '@tiptap/extension-mention'

export interface EntityMentionOptions {
  entities: { id: string; name: string; entity_type: string }[]
  onSelect?: (entity: { id: string; name: string; entity_type: string }) => void
}

export function createMentionSuggestion(
  entities: { id: string; name: string; entity_type: string }[]
) {
  return {
    items: ({ query }: { query: string }) => {
      return entities
        .filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    },
    render: () => {
      let popup: HTMLDivElement | null = null
      let selectedIndex = 0
      let items: any[] = []
      let command: any = null

      return {
        onStart: (props: any) => {
          command = props.command
          items = props.items

          popup = document.createElement('div')
          popup.className = 'mention-popup bg-popover border rounded-lg shadow-lg p-1 z-50 max-h-52 overflow-y-auto'
          popup.style.position = 'absolute'

          renderItems()

          const rect = props.clientRect?.()
          if (rect && popup) {
            popup.style.left = `${rect.left}px`
            popup.style.top = `${rect.bottom + 4}px`
            document.body.appendChild(popup)
          }
        },
        onUpdate: (props: any) => {
          items = props.items
          command = props.command
          selectedIndex = 0
          renderItems()

          const rect = props.clientRect?.()
          if (rect && popup) {
            popup.style.left = `${rect.left}px`
            popup.style.top = `${rect.bottom + 4}px`
          }
        },
        onKeyDown: (props: any) => {
          if (props.event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % items.length
            renderItems()
            return true
          }
          if (props.event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length
            renderItems()
            return true
          }
          if (props.event.key === 'Enter') {
            if (items[selectedIndex]) {
              command({ id: items[selectedIndex].id, label: items[selectedIndex].name })
            }
            return true
          }
          return false
        },
        onExit: () => {
          popup?.remove()
          popup = null
        },
      }

      function renderItems() {
        if (!popup) return
        popup.innerHTML = items.length === 0
          ? '<div class="px-3 py-2 text-sm text-muted-foreground">Не найдено</div>'
          : items.map((item: any, i: number) =>
            `<button class="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2 ${i === selectedIndex ? 'bg-accent' : ''}" data-index="${i}">
              <span class="font-medium">${item.name}</span>
              <span class="text-xs text-muted-foreground">${item.entity_type}</span>
            </button>`
          ).join('')

        popup.querySelectorAll('button').forEach((btn, i) => {
          btn.addEventListener('click', () => {
            if (items[i]) command({ id: items[i].id, label: items[i].name })
          })
        })
      }
    },
  }
}
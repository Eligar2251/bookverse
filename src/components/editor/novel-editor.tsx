'use client'

import { useEditor, EditorContent, type Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Mention from '@tiptap/extension-mention'
import { EditorToolbar } from './toolbar'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { saveChapterContent } from '@/app/actions/chapters'
import { countWords } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import { createMentionSuggestion } from './mention-extension'
import type { AnyExtension } from '@tiptap/core'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface NovelEditorProps {
  chapterId: string
  initialContent: string
  onWordCountChange?: (count: number) => void
  entities?: { id: string; name: string; entity_type: string }[]
}

export function NovelEditor({ chapterId, initialContent, onWordCountChange, entities = [] }: NovelEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [wordCount, setWordCount] = useState(0)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef(initialContent)

  const doSave = useCallback(async (html: string) => {
    if (html === lastSavedRef.current) { setSaveStatus('saved'); return }
    setSaveStatus('saving')
    const wc = countWords(html)
    const res = await saveChapterContent(chapterId, html, wc)
    if (!res.error) {
      lastSavedRef.current = html
      setSaveStatus('saved')
    } else {
      setSaveStatus('unsaved')
    }
  }, [chapterId])

  const extensions = useMemo<AnyExtension[]>(() => {
    const exts: AnyExtension[] = [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: 'Начните писать... (@ для упоминания сущности)' }),
      CharacterCount,
    ]

    if (entities.length > 0) {
      exts.push(
        Mention.configure({
          HTMLAttributes: {
            class: 'mention bg-primary/10 text-primary rounded px-1 py-0.5 font-medium',
          },
          suggestion: createMentionSuggestion(entities),
        })
      )
    }

    return exts
  }, [entities])

  const editor = useEditor({
    extensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose dark:prose-invert max-w-none px-6 py-4 min-h-[60vh] focus:outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => {
      setSaveStatus('unsaved')
      const html = ed.getHTML()
      const wc = countWords(html)
      setWordCount(wc)
      onWordCountChange?.(wc)

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => doSave(html), 2000)
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (initialContent) {
      const wc = countWords(initialContent)
      setWordCount(wc)
      onWordCountChange?.(wc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (editor) {
        const html = editor.getHTML()
        if (html !== lastSavedRef.current) {
          saveChapterContent(chapterId, html, countWords(html))
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, chapterId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (editor) {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          doSave(editor.getHTML())
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editor, doSave])

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground bg-card">
        <div className="flex items-center gap-4">
          <span>{wordCount.toLocaleString()} слов</span>
          <span>{editor?.storage.characterCount?.characters() || 0} символов</span>
        </div>
        <div className="flex items-center gap-1">
          {saveStatus === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> Сохранение...</>}
          {saveStatus === 'saved' && <><Check className="h-3 w-3 text-green-500" /> Сохранено</>}
          {saveStatus === 'unsaved' && <span className="text-yellow-500">● Не сохранено</span>}
        </div>
      </div>
    </div>
  )
}
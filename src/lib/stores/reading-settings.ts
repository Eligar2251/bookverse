import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReadingSettings {
  fontSize: number
  fontFamily: 'sans' | 'serif' | 'mono'
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
  maxWidth: 'narrow' | 'standard' | 'wide'
  setFontSize: (v: number) => void
  setFontFamily: (v: 'sans' | 'serif' | 'mono') => void
  setLineHeight: (v: number) => void
  setTheme: (v: 'light' | 'dark' | 'sepia') => void
  setMaxWidth: (v: 'narrow' | 'standard' | 'wide') => void
}

export const useReadingSettings = create<ReadingSettings>()(
  persist(
    (set) => ({
      fontSize: 18,
      fontFamily: 'serif',
      lineHeight: 1.8,
      theme: 'light',
      maxWidth: 'standard',
      setFontSize: (v) => set({ fontSize: v }),
      setFontFamily: (v) => set({ fontFamily: v }),
      setLineHeight: (v) => set({ lineHeight: v }),
      setTheme: (v) => set({ theme: v }),
      setMaxWidth: (v) => set({ maxWidth: v }),
    }),
    { name: 'reading-settings' }
  )
)
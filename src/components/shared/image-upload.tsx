'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  bucket: 'avatars' | 'covers' | 'content-images'
  path: string
  aspectRatio?: string
  className?: string
}

export function ImageUpload({ value, onChange, bucket, path, aspectRatio = '2/3', className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 5MB)')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const filePath = `${path}/${Date.now()}.${ext}`

      const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
      onChange(publicUrl)
      toast.success('Изображение загружено')
    } catch (err: any) {
      toast.error(err.message || 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }, [bucket, path, onChange])

  return (
    <div className={cn('relative group', className)} style={{ aspectRatio }}>
      {value ? (
        <>
          <img src={value} alt="" className="w-full h-full object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <label className="cursor-pointer">
              <Button size="sm" variant="secondary" asChild>
                <span><ImagePlus className="h-4 w-4 mr-1" />Заменить</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <Button size="sm" variant="destructive" onClick={() => onChange(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <label className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors text-muted-foreground">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Загрузить</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  )
}
'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react'
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

export function ImageUpload({
  value,
  onChange,
  bucket,
  path,
  aspectRatio = '2/3',
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Reset input so same file can be selected again
      e.target.value = ''

      // Validate size
      const maxSize = bucket === 'avatars' ? 2 : 5
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`Файл слишком большой (макс. ${maxSize}MB)`)
        return
      }

      // Validate type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Допустимые форматы: JPG, PNG, WebP, GIF')
        return
      }

      setUploading(true)
      setError(null)

      try {
        const supabase = createClient()

        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('Необходимо войти в аккаунт')
          setUploading(false)
          return
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
        const filePath = `${user.id}/${fileName}`

        console.log('Uploading to:', bucket, filePath)

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError(uploadError.message)
          toast.error(`Ошибка загрузки: ${uploadError.message}`)
          setUploading(false)
          return
        }

        console.log('Upload success:', data)

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path)

        console.log('Public URL:', urlData.publicUrl)

        onChange(urlData.publicUrl)
        toast.success('Изображение загружено')
      } catch (err: any) {
        console.error('Unexpected error:', err)
        setError(err.message || 'Неизвестная ошибка')
        toast.error(err.message || 'Ошибка загрузки')
      } finally {
        setUploading(false)
      }
    },
    [bucket, onChange]
  )

  return (
    <div className={cn('relative group', className)} style={{ aspectRatio }}>
      {value ? (
        <>
          <img
            src={value}
            alt=""
            className="w-full h-full object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <label className="cursor-pointer">
              <Button size="sm" variant="secondary" asChild>
                <span>
                  <ImagePlus className="h-4 w-4 mr-1" />
                  Заменить
                </span>
              </Button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <label
          className={cn(
            'w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
            uploading
              ? 'border-primary/50 bg-primary/5'
              : error
                ? 'border-destructive/50 bg-destructive/5'
                : 'hover:border-primary/50 hover:bg-accent text-muted-foreground'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-primary">Загрузка...</span>
            </>
          ) : error ? (
            <>
              <AlertCircle className="h-8 w-8 text-destructive" />
              <span className="text-xs text-destructive text-center px-2">
                {error}
              </span>
              <span className="text-xs text-muted-foreground">
                Нажмите, чтобы попробовать снова
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Загрузить</span>
              <span className="text-[10px] text-muted-foreground">
                JPG, PNG, WebP · макс. {bucket === 'avatars' ? '2' : '5'}MB
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  )
}
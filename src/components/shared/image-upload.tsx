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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      e.target.value = ''

      console.log('[ImageUpload] File selected:', file.name, file.type, file.size)

      const maxSize = bucket === 'avatars' ? 2 : 5
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`Макс. ${maxSize}MB`)
        return
      }

      setUploading(true)
      setErrorMsg(null)

      const supabase = createClient()

      try {
        // 1. Проверяем авторизацию
        console.log('[ImageUpload] Checking auth...')
        const { data: authData, error: authError } = await supabase.auth.getUser()
        console.log('[ImageUpload] Auth result:', { user: authData?.user?.id, error: authError })

        if (authError || !authData.user) {
          const msg = authError?.message || 'Не авторизован'
          console.error('[ImageUpload] Auth failed:', msg)
          setErrorMsg(msg)
          toast.error('Войдите в аккаунт')
          setUploading(false)
          return
        }

        const userId = authData.user.id

        // 2. Проверяем что бакет существует
        console.log('[ImageUpload] Listing buckets...')
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
        console.log('[ImageUpload] Buckets:', buckets?.map(b => b.id), 'Error:', bucketsError)

        // 3. Формируем путь
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${Date.now()}.${ext}`
        const filePath = `${userId}/${fileName}`
        console.log('[ImageUpload] Upload path:', bucket, filePath)

        // 4. Загружаем
        console.log('[ImageUpload] Starting upload...')
        const startTime = Date.now()

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          })

        const elapsed = Date.now() - startTime
        console.log('[ImageUpload] Upload completed in', elapsed, 'ms')
        console.log('[ImageUpload] Upload data:', uploadData)
        console.log('[ImageUpload] Upload error:', uploadError)

        if (uploadError) {
          const msg = uploadError.message || 'Ошибка загрузки'
          console.error('[ImageUpload] Upload failed:', msg)
          setErrorMsg(msg)
          toast.error(msg)
          setUploading(false)
          return
        }

        // 5. Получаем публичный URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(uploadData.path)

        console.log('[ImageUpload] Public URL:', urlData.publicUrl)

        onChange(urlData.publicUrl)
        toast.success('Загружено!')
      } catch (err: any) {
        console.error('[ImageUpload] Unexpected error:', err)
        setErrorMsg(err?.message || 'Ошибка')
        toast.error(err?.message || 'Ошибка загрузки')
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
          <img src={value} alt="" className="w-full h-full object-cover rounded-lg border" />
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
        <label className={cn(
          'w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
          uploading ? 'border-primary/50 bg-primary/5' : errorMsg ? 'border-destructive/50' : 'hover:border-primary/50 hover:bg-accent text-muted-foreground'
        )}>
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-primary">Загрузка...</span>
            </>
          ) : errorMsg ? (
            <>
              <AlertCircle className="h-8 w-8 text-destructive" />
              <span className="text-xs text-destructive text-center px-2">{errorMsg}</span>
              <span className="text-xs text-muted-foreground">Нажмите снова</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Загрузить</span>
              <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  )
}
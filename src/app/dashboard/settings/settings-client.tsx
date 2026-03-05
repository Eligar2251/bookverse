'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/shared/image-upload'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

export function ProfileSettingsClient({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [website, setWebsite] = useState(profile.external_links?.website || '')
  const [telegram, setTelegram] = useState(profile.external_links?.telegram || '')
  const [patreon, setPatreon] = useState(profile.external_links?.patreon || '')

  const handleSave = () => {
    start(async () => {
      const links: Record<string, string> = {}
      if (website.trim()) links.website = website.trim()
      if (telegram.trim()) links.telegram = telegram.trim()
      if (patreon.trim()) links.patreon = patreon.trim()

      const res = await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        external_links: links,
      })
      if (res.error) { toast.error(res.error); return }
      toast.success('Профиль обновлён')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Основная информация</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-[120px_1fr] gap-5">
            <div>
              <Label className="mb-2 block text-sm">Аватар</Label>
              <ImageUpload value={avatarUrl} onChange={setAvatarUrl} bucket="avatars" path={profile.id} aspectRatio="1/1" className="w-full" />
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Имя пользователя</Label>
                <Input value={profile.username} disabled className="mt-1 bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Имя пользователя нельзя изменить</p>
              </div>
              <div>
                <Label className="text-sm">Отображаемое имя</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1" maxLength={50} />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm">О себе</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="mt-1" maxLength={500} />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ссылки</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Веб-сайт</Label>
            <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Telegram</Label>
            <Input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Patreon / Boosty</Label>
            <Input value={patreon} onChange={e => setPatreon(e.target.value)} placeholder="https://" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={pending} size="lg">
        {pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Сохранить
      </Button>
    </div>
  )
}
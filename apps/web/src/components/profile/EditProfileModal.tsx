'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@dish/types'

export function EditProfileModal({ profile, onClose, onSave }: {
  profile: User
  onClose: () => void
  onSave: (updated: Partial<User>) => void
}) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAvatarUpload = useCallback(async (file: File) => {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `avatars/${profile.id}.${ext}`
    const { data, error } = await supabase.storage.from('recipe-images').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('recipe-images').getPublicUrl(data.path)
      setAvatarUrl(urlData.publicUrl)
    }
    setUploading(false)
  }, [profile.id])

  async function handleSave() {
    if (!displayName.trim()) { setError('Display name is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const { error } = await supabase.from('users').update({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      avatar_url: avatarUrl || null,
    }).eq('id', profile.id)
    if (error) { setError(error.message); setSaving(false); return }
    onSave({ display_name: displayName, bio: bio || null, avatar_url: avatarUrl || null })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-cream rounded-t-3xl px-5 pt-5 pb-10 pb-safe z-10 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-serif text-xl">Edit Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/[0.06] flex items-center justify-center text-clay text-lg">×</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 mb-4">{error}</div>}

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <label className="cursor-pointer group">
            <div className="relative w-20 h-20 rounded-[22px] overflow-hidden bg-cream-linen border-2 border-white shadow-sm">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-terracotta/20 to-cream-linen">
                  {displayName[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                }
              </div>
            </div>
            <input type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }} />
          </label>
          <p className="text-xs text-clay mt-2">Tap to change photo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name" className="input-base" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Tell people about your cooking style..." rows={3}
              className="input-base resize-none" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full mt-6 py-4">
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

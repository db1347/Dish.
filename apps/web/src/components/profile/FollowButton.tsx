'use client'
import { useState } from 'react'

export function FollowButton({
  targetUserId,
  initialFollowing,
  currentUserId,
}: {
  targetUserId: string
  initialFollowing: boolean
  currentUserId: string | null
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  if (!currentUserId || currentUserId === targetUserId) return null

  async function toggle() {
    setLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const res = await fetch('/api/follow', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ following_id: targetUserId }),
    })
    if (res.ok) setFollowing(f => !f)
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`text-sm font-semibold px-5 py-2 rounded-xl transition-all disabled:opacity-50 ${
        following
          ? 'bg-cream-linen border border-black/10 text-espresso'
          : 'bg-terracotta text-white'
      }`}>
      {loading
        ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
        : following ? 'Following' : 'Follow'}
    </button>
  )
}

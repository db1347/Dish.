'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function MarkAllReadButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markAllRead() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={markAllRead} disabled={loading}
      className="text-xs font-semibold text-terracotta hover:text-terracotta-dark transition-colors disabled:opacity-50">
      {loading ? 'Marking...' : 'Mark all read'}
    </button>
  )
}

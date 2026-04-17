'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      title="Sign out"
      className="w-9 h-9 rounded-xl bg-black/[0.06] flex items-center justify-center hover:bg-black/10 transition-colors text-clay"
    >
      {/* Exit icon */}
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M9 2H12.5C13 2 13.5 2.5 13.5 3V12C13.5 12.5 13 13 12.5 13H9" stroke="#7A6A62" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M6 5L2.5 7.5L6 10" stroke="#7A6A62" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="2.5" y1="7.5" x2="10" y2="7.5" stroke="#7A6A62" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

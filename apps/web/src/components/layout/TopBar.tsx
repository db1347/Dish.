import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from './SignOutButton'

export async function TopBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-black/[0.06]">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-serif font-bold text-[22px] text-espresso leading-none">
          dish<span className="text-terracotta">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/explore" className="w-9 h-9 rounded-xl bg-black/[0.06] flex items-center justify-center hover:bg-black/10 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#2A1F1A" strokeWidth="1.4"/>
              <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="#2A1F1A" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </Link>
          {user ? (
            <>
              <Link href="/notifications" className="w-9 h-9 rounded-xl bg-black/[0.06] flex items-center justify-center hover:bg-black/10 transition-colors relative">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2C6 2 4.5 3.5 4.5 5.5c0 3.5-2 4.5-2 4.5h11s-2-1-2-4.5C11.5 3.5 10 2 8 2z" stroke="#2A1F1A" strokeWidth="1.2"/>
                  <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="#2A1F1A" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full"/>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary text-xs py-2 px-4">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}

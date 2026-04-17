'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <main className="min-h-dvh bg-cream flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-5xl text-espresso mb-2">dish<span className="text-terracotta">.</span></h1>
          <p className="text-sm text-clay">Cook more. Share more.</p>
        </div>

        {sent ? (
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="font-semibold text-espresso mb-2">Check your inbox</h2>
            <p className="text-sm text-clay">Magic link sent to <strong className="text-espresso">{email}</strong></p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm text-terracotta font-medium">Use a different email</button>
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={() => handleOAuth('google')} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-black/10 rounded-xl py-3.5 text-sm font-medium hover:bg-cream-linen transition-all disabled:opacity-60">
              Continue with Google
            </button>
            <button onClick={() => handleOAuth('apple')} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-espresso border border-espresso rounded-xl py-3.5 text-sm font-medium text-white hover:bg-espresso/90 transition-all disabled:opacity-60">
              Continue with Apple
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-xs text-clay">or</span>
              <div className="flex-1 h-px bg-black/10" />
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl overflow-hidden border border-black/10 bg-cream-linen">
              <button
                onClick={() => { setMode('password'); setError(null) }}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${mode === 'password' ? 'bg-white text-espresso shadow-sm' : 'text-clay'}`}>
                Password
              </button>
              <button
                onClick={() => { setMode('magic'); setError(null) }}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${mode === 'magic' ? 'bg-white text-espresso shadow-sm' : 'text-clay'}`}>
                Magic link
              </button>
            </div>

            {mode === 'password' ? (
              <form onSubmit={handlePassword} className="space-y-3">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" className="input-base" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" className="input-base" required />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button type="submit" disabled={loading || !email || !password} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" className="input-base" required />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button type="submit" disabled={loading || !email} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-clay pt-1">
              Test accounts: <span className="text-espresso font-medium">marco@dish.test</span> · password <span className="text-espresso font-medium">dish123</span>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

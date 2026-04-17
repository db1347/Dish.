'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Screen = 'signin' | 'signup' | 'sent'

export default function LoginPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingEmail, setExistingEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setExistingEmail(user.email)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function reset() {
    setError(null)
    setEmail('')
    setPassword('')
    setUsername('')
  }

  async function handleSignOut() {
    setLoading(true)
    await supabase.auth.signOut()
    setExistingEmail(null)
    setLoading(false)
  }

  async function handleSignIn(e: React.FormEvent) {
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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase().replace(/\s+/g, '_'),
          full_name: username,
        },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // If email confirmation is disabled in Supabase, session is returned immediately
    if (data.session) {
      router.push('/onboarding')
      router.refresh()
    } else {
      setScreen('sent')
    }
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

  // Already signed in
  if (existingEmail) {
    return (
      <main className="min-h-dvh bg-cream flex items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="card p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-[18px] bg-terracotta/10 flex items-center justify-center mx-auto text-2xl">👋</div>
            <div>
              <p className="text-sm text-clay">Signed in as</p>
              <p className="font-semibold text-espresso mt-0.5">{existingEmail}</p>
            </div>
            <button onClick={() => { router.push('/'); router.refresh() }} className="btn-primary w-full">
              Continue to dish.
            </button>
            <button onClick={handleSignOut} disabled={loading}
              className="w-full text-sm text-clay hover:text-espresso transition-colors py-2 disabled:opacity-60">
              {loading ? 'Signing out…' : 'Sign in with a different account'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Confirmation email sent
  if (screen === 'sent') {
    return (
      <main className="min-h-dvh bg-cream flex items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="card p-6 text-center space-y-3">
            <div className="text-4xl">📬</div>
            <h2 className="font-semibold text-espresso">Check your inbox</h2>
            <p className="text-sm text-clay">
              Confirmation sent to <strong className="text-espresso">{email}</strong>.<br/>
              Click the link to activate your account.
            </p>
            <p className="text-xs text-clay/70 pt-1">
              No email? Check spam, or{' '}
              <button onClick={() => { setScreen('signup'); reset() }} className="text-terracotta underline">try again</button>.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-cream flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Logo subtitle={screen === 'signup' ? 'Create your account' : 'Cook more. Share more.'} />

        <div className="space-y-3">
          {/* OAuth */}
          <button onClick={() => handleOAuth('google')} disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-black/10 rounded-xl py-3.5 text-sm font-medium hover:bg-cream-linen transition-all disabled:opacity-60">
            Continue with Google
          </button>
          <button onClick={() => handleOAuth('apple')} disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-espresso rounded-xl py-3.5 text-sm font-medium text-white hover:bg-espresso/90 transition-all disabled:opacity-60">
            Continue with Apple
          </button>

          <Divider />

          {screen === 'signin' ? (
            <>
              <form onSubmit={handleSignIn} className="space-y-2.5">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" className="input-base" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" className="input-base" required />
                {error && <p className="text-xs text-red-500 pt-0.5">{error}</p>}
                <button type="submit" disabled={loading || !email || !password}
                  className="btn-primary w-full disabled:opacity-60 mt-1">
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
              <p className="text-center text-sm text-clay pt-1">
                No account?{' '}
                <button onClick={() => { setScreen('signup'); reset() }}
                  className="text-terracotta font-semibold hover:underline">
                  Create one
                </button>
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleSignUp} className="space-y-2.5">
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Username (e.g. marcorossi)" className="input-base" required minLength={3} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" className="input-base" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)" className="input-base" required minLength={6} />
                {error && <p className="text-xs text-red-500 pt-0.5">{error}</p>}
                <button type="submit" disabled={loading || !email || !password || !username}
                  className="btn-primary w-full disabled:opacity-60 mt-1">
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
              <p className="text-center text-sm text-clay pt-1">
                Already have an account?{' '}
                <button onClick={() => { setScreen('signin'); reset() }}
                  className="text-terracotta font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <h1 className="font-serif font-bold text-5xl text-espresso mb-2">
        dish<span className="text-terracotta">.</span>
      </h1>
      {subtitle && <p className="text-sm text-clay">{subtitle}</p>}
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-black/10" />
      <span className="text-xs text-clay">or</span>
      <div className="flex-1 h-px bg-black/10" />
    </div>
  )
}

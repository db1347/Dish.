'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FollowButton } from '@/components/profile/FollowButton'
import type { Comment, Recipe } from '@dish/types'

// ─── Countdown Timer ───────────────────────────────────────────────────────
function StepTimer({ mins, large = false }: { mins: number; large?: boolean }) {
  const total = mins * 60
  const [remaining, setRemaining] = useState(total)
  const [running, setRunning] = useState(false)
  const done = remaining === 0
  const pct = ((total - remaining) / total) * 100
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0')
  const ss = (remaining % 60).toString().padStart(2, '0')

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(id); setRunning(false); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  function toggle() {
    if (done) { setRemaining(total); setRunning(false); return }
    setRunning(r => !r)
  }

  const size = large ? 80 : 40
  const r = large ? 34 : 16
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <button onClick={toggle}
      className={`relative flex items-center justify-center rounded-full transition-all active:scale-95
        ${large ? 'w-20 h-20' : 'mt-2 gap-1 px-2.5 py-1 bg-cream-linen rounded-full'}
        ${done ? 'bg-sage/20' : running ? 'bg-terracotta/10' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={large ? '' : 'hidden'} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E2D9" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={done ? '#7B9E82' : '#C4684A'} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
      </svg>
      {large ? (
        <span className={`absolute text-sm font-bold ${done ? 'text-sage' : 'text-espresso'}`}>
          {done ? '✓' : running ? `${mm}:${ss}` : `${mins}m`}
        </span>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke={done ? '#7B9E82' : '#7A6A62'} strokeWidth="1"/>
            <path d="M5 3v2.5l1.5 1" stroke={done ? '#7B9E82' : '#7A6A62'} strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <span className={`text-[10px] font-medium ${done ? 'text-sage' : running ? 'text-terracotta' : 'text-clay'}`}>
            {done ? 'Done!' : running ? `${mm}:${ss}` : `${mins}m`}
          </span>
        </>
      )}
    </button>
  )
}

// ─── Live Cooking Mode ─────────────────────────────────────────────────────
function CookingMode({ recipe, servings, onClose }: {
  recipe: Recipe; servings: number; onClose: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [voiceOn, setVoiceOn] = useState(false)
  const step = recipe.steps[idx]
  const isLast = idx === recipe.steps.length - 1
  const isFirst = idx === 0

  function scaleQty(qty: number) {
    return Math.round((qty * servings / recipe.servings) * 100) / 100
  }

  const speak = useCallback((text: string) => {
    if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.9
    window.speechSynthesis.speak(utt)
  }, [voiceOn])

  useEffect(() => {
    speak(step.instruction)
  }, [idx, speak, step.instruction])

  function goNext() {
    if (!isLast) setIdx(i => i + 1)
    else onClose()
  }
  function goPrev() { if (!isFirst) setIdx(i => i - 1) }

  // Swipe support
  const touchStart = useRef(0)
  function onTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const delta = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 60) { if (delta > 0) goNext(); else goPrev() }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1A110E] flex flex-col select-none"
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <span className="text-white/60 text-sm font-medium">
          Step {idx + 1} of {recipe.steps.length}
        </span>
        <button onClick={() => setVoiceOn(v => !v)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${voiceOn ? 'bg-terracotta' : 'bg-white/10'}`}>
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            <rect x="4" y="0" width="6" height="10" rx="3" fill={voiceOn ? 'white' : 'none'} stroke="white" strokeWidth="1.4"/>
            <path d="M1 8c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="7" y1="14" x2="7" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 mx-5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-terracotta rounded-full transition-all duration-500"
          style={{ width: `${((idx + 1) / recipe.steps.length) * 100}%` }} />
      </div>

      {/* Relevant ingredients for this step (first step shows all) */}
      {idx === 0 && recipe.ingredients.length > 0 && (
        <div className="px-5 pt-4">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">You'll need</p>
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredients.slice(0, 6).map((ing, i) => (
              <span key={i} className="text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-full">
                {scaleQty(ing.quantity)} {ing.unit} {ing.name}
              </span>
            ))}
            {recipe.ingredients.length > 6 && (
              <span className="text-xs text-white/40 bg-white/10 px-2.5 py-1 rounded-full">+{recipe.ingredients.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-14 h-14 rounded-full bg-terracotta flex items-center justify-center text-white text-2xl font-bold mb-8">
          {step.order}
        </div>
        <p className="text-white text-xl leading-relaxed font-light max-w-sm">
          {step.instruction}
        </p>
        {step.timer_mins && step.timer_mins > 0 && (
          <div className="mt-8">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Timer</p>
            <StepTimer mins={step.timer_mins} large />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 pb-12">
        <button onClick={goPrev} disabled={isFirst}
          className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-20 transition-opacity">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4l-6 6 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-white/40 text-xs">swipe to navigate</span>
        <button onClick={goNext}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isLast ? 'bg-sage text-white' : 'bg-white/10'}`}>
          {isLast ? (
            <span className="text-sm font-bold">🎉</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Nutrition Analysis ────────────────────────────────────────────────────
function NutritionTab({ recipe }: { recipe: Recipe }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [data, setData] = useState<{ calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; sugar_g: number; sodium_mg: number; note: string } | null>(null)

  async function analyze() {
    setStatus('loading')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'nutrition', recipe }),
      })
      const reader = res.body?.getReader()
      if (!reader) { setStatus('error'); return }
      const dec = new TextDecoder()
      let raw = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += dec.decode(value)
      }
      const json = JSON.parse(raw.trim())
      setData(json)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'idle') return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="text-4xl mb-4">🔬</div>
      <p className="text-sm text-clay mb-5">Get a macro breakdown powered by AI</p>
      <button onClick={analyze} className="btn-primary text-sm">Analyse nutrition</button>
    </div>
  )

  if (status === 'loading') return (
    <div className="flex flex-col items-center py-12 gap-3">
      <div className="w-10 h-10 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      <p className="text-sm text-clay">Crunching the numbers…</p>
    </div>
  )

  if (status === 'error') return (
    <div className="text-center py-10">
      <p className="text-sm text-clay mb-3">Couldn't analyse this recipe.</p>
      <button onClick={() => setStatus('idle')} className="btn-ghost text-sm">Try again</button>
    </div>
  )

  if (!data) return null

  const macros = [
    { label: 'Calories', value: data.calories, unit: 'kcal', color: 'bg-terracotta' },
    { label: 'Protein', value: data.protein_g, unit: 'g', color: 'bg-sage' },
    { label: 'Carbs', value: data.carbs_g, unit: 'g', color: 'bg-amber-400' },
    { label: 'Fat', value: data.fat_g, unit: 'g', color: 'bg-blue-400' },
  ]
  const extras = [
    { label: 'Fibre', value: `${data.fiber_g}g` },
    { label: 'Sugar', value: `${data.sugar_g}g` },
    { label: 'Sodium', value: `${data.sodium_mg}mg` },
  ]

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-clay uppercase tracking-widest font-semibold">Per serving</p>
      <div className="grid grid-cols-2 gap-2">
        {macros.map(m => (
          <div key={m.label} className="card p-4">
            <div className={`w-2 h-2 rounded-full ${m.color} mb-2`} />
            <div className="text-lg font-bold text-espresso">{m.value}<span className="text-xs font-normal text-clay ml-0.5">{m.unit}</span></div>
            <div className="text-[10px] text-clay">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between px-1">
        {extras.map(e => (
          <div key={e.label} className="text-center">
            <div className="text-sm font-semibold text-espresso">{e.value}</div>
            <div className="text-[10px] text-clay">{e.label}</div>
          </div>
        ))}
      </div>
      {data.note && <p className="text-xs text-clay italic bg-cream-linen rounded-xl p-3">{data.note}</p>}
      <button onClick={() => { setStatus('idle'); setData(null) }} className="text-xs text-clay hover:text-espresso transition-colors w-full text-center pt-1">
        Recalculate
      </button>
    </div>
  )
}

// ─── Recipe Remix ──────────────────────────────────────────────────────────
function RemixPanel({ recipe, onSave }: { recipe: Recipe; onSave: (remixed: Partial<Recipe>) => void }) {
  const [open, setOpen] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<Partial<Recipe> | null>(null)
  const [raw, setRaw] = useState('')

  async function remix() {
    if (!instruction.trim()) return
    setStatus('loading')
    setRaw('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'remix', recipe, instruction }),
      })
      const reader = res.body?.getReader()
      if (!reader) { setStatus('error'); return }
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value)
        setRaw(full)
      }
      const json = JSON.parse(full.trim())
      setResult(json)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-terracotta/40 text-terracotta text-sm font-medium hover:bg-terracotta/5 transition-colors">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 7h12M7 1v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      Remix this recipe
    </button>
  )

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-espresso">Remix with AI</span>
        <button onClick={() => { setOpen(false); setStatus('idle'); setResult(null) }} className="text-clay text-xs">Cancel</button>
      </div>

      {status === 'idle' && (
        <>
          <div className="space-y-1.5">
            {['Make it vegan', 'Add more heat', 'Gluten-free version', 'Cut the calories'].map(s => (
              <button key={s} onClick={() => setInstruction(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${instruction === s ? 'border-terracotta bg-terracotta/10 text-terracotta' : 'border-black/10 text-clay hover:border-terracotta/40'}`}>
                {s}
              </button>
            ))}
          </div>
          <textarea value={instruction} onChange={e => setInstruction(e.target.value)}
            placeholder="Or describe your own remix…"
            rows={2} className="input-base text-sm resize-none" />
          <button onClick={remix} disabled={!instruction.trim()}
            className="btn-primary w-full text-sm disabled:opacity-50">
            Generate remix
          </button>
        </>
      )}

      {status === 'loading' && (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
          <p className="text-xs text-clay">Remixing…</p>
          {raw && <p className="text-[10px] text-clay/60 text-center line-clamp-2">{raw.slice(-80)}</p>}
        </div>
      )}

      {status === 'done' && result && (
        <div className="space-y-3">
          <div className="bg-cream-linen rounded-xl p-3">
            <h4 className="font-semibold text-espresso text-sm mb-1">{result.title}</h4>
            <p className="text-xs text-clay leading-relaxed">{result.description}</p>
          </div>
          {result.ingredients && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-clay mb-2">Key changes</p>
              <div className="space-y-1">
                {result.ingredients.slice(0, 4).map((ing, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-espresso">{ing.name}</span>
                    <span className="text-clay">{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => { onSave(result); setOpen(false) }}
              className="btn-primary flex-1 text-sm">
              Save remixed recipe
            </button>
            <button onClick={() => { setStatus('idle'); setResult(null) }}
              className="btn-ghost text-sm px-4">
              Redo
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-4">
          <p className="text-sm text-clay mb-2">Something went wrong.</p>
          <button onClick={() => setStatus('idle')} className="btn-ghost text-sm">Try again</button>
        </div>
      )}
    </div>
  )
}

// ─── Star Rating ───────────────────────────────────────────────────────────
function StarRating({ recipeId, initialRating, initialUserRating, currentUserId }: {
  recipeId: string; initialRating: number; initialUserRating: number; currentUserId: string | null
}) {
  const [userRating, setUserRating] = useState(initialUserRating)
  const [hover, setHover] = useState(0)
  const [avg, setAvg] = useState(initialRating)
  const [loading, setLoading] = useState(false)

  async function rate(stars: number) {
    if (!currentUserId || loading) return
    setLoading(true)
    const res = await fetch('/api/rate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId, stars }),
    })
    if (res.ok) { setUserRating(stars); setAvg(prev => Math.round(((prev + stars) / 2) * 10) / 10) }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center py-6 border-t border-black/[0.06]">
      <p className="text-xs font-semibold text-clay uppercase tracking-wider mb-3">Rate this recipe</p>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map(star => (
          <button key={star} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
            onClick={() => rate(star)} disabled={!currentUserId || loading}
            className="text-3xl transition-transform active:scale-90 disabled:cursor-not-allowed">
            <span className={hover ? (star <= hover ? 'text-terracotta' : 'text-black/15') : (star <= userRating ? 'text-terracotta' : 'text-black/15')}>★</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-clay">
        {userRating > 0 ? `You rated this ${userRating}★` : currentUserId ? 'Tap to rate' : 'Sign in to rate'}
        {avg > 0 && <span className="ml-2 text-espresso font-medium">{avg.toFixed(1)} avg</span>}
      </p>
    </div>
  )
}

// ─── Comments ──────────────────────────────────────────────────────────────
function CommentsSection({ recipeId, initialComments, currentUser }: {
  recipeId: string
  initialComments: Comment[]
  currentUser: { id: string; username: string; avatar_url: string | null } | null
}) {
  const [comments, setComments] = useState(initialComments)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function submit() {
    if (!body.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId, body }),
    })
    if (res.ok) { const { comment } = await res.json(); setComments(c => [...c, comment]); setBody('') }
    setSubmitting(false)
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment?')) return
    setDeleting(id)
    await fetch('/api/comments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment_id: id }) })
    setComments(c => c.filter(x => x.id !== id))
    setDeleting(null)
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="border-t border-black/[0.06] pt-5">
      <h3 className="text-xs font-semibold text-clay uppercase tracking-wider mb-4">Comments ({comments.length})</h3>
      {comments.length > 0 && (
        <div className="space-y-4 mb-5">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cream-linen flex items-center justify-center flex-shrink-0 text-xs font-semibold text-espresso overflow-hidden">
                {c.author?.avatar_url
                  ? <Image src={c.author.avatar_url} alt={c.author.display_name ?? ''} width={32} height={32} className="w-full h-full object-cover" />
                  : (c.author?.display_name?.[0] ?? c.author?.username?.[0] ?? '?').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/profile/${c.author?.username}`} className="text-xs font-semibold text-espresso hover:text-terracotta">{c.author?.display_name ?? c.author?.username}</Link>
                  <span className="text-[10px] text-clay">{timeAgo(c.created_at)}</span>
                  {currentUser?.id === c.author_id && (
                    <button onClick={() => deleteComment(c.id)} disabled={deleting === c.id} className="ml-auto text-[10px] text-clay hover:text-red-400 transition-colors">
                      {deleting === c.id ? '...' : 'Delete'}
                    </button>
                  )}
                </div>
                <p className="text-sm text-espresso leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {currentUser ? (
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-cream-linen flex items-center justify-center flex-shrink-0 text-xs font-semibold text-espresso">{currentUser.username[0].toUpperCase()}</div>
          <div className="flex-1 flex gap-2">
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add a comment…" rows={2} className="input-base resize-none flex-1 text-sm py-2" />
            <button onClick={submit} disabled={!body.trim() || submitting} className="btn-primary text-sm px-4 py-2 self-end disabled:opacity-50">{submitting ? '...' : 'Post'}</button>
          </div>
        </div>
      ) : (
        <Link href="/auth/login" className="text-sm text-terracotta font-medium">Sign in to comment</Link>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
type Tab = 'ingredients' | 'steps' | 'nutrition' | 'notes'

export function RecipeDetailClient({ recipe, currentUser, initialUserRating, initialComments, isFollowing, isSaved }: {
  recipe: Recipe
  currentUser: { id: string; username: string; avatar_url: string | null } | null
  initialUserRating: number
  initialComments: Comment[]
  isFollowing: boolean
  isSaved: boolean
}) {
  const [activeTab, setActiveTab] = useState<Tab>('ingredients')
  const [servings, setServings] = useState(recipe.servings)
  const [saved, setSaved] = useState(isSaved)
  const [savingRecipe, setSavingRecipe] = useState(false)
  const [cookingMode, setCookingMode] = useState(false)

  function scaleQty(qty: number) {
    return Math.round((qty * servings / recipe.servings) * 100) / 100
  }

  async function toggleSave() {
    if (!currentUser) return
    setSavingRecipe(true)
    const res = await fetch('/api/save', {
      method: saved ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipe.id }),
    })
    if (res.ok) setSaved(s => !s)
    setSavingRecipe(false)
  }

  async function saveRemix(remixed: Partial<Recipe>) {
    if (!currentUser) return
    await fetch('/api/recipes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...remixed, is_ai_generated: true, ai_prompt: `Remix of "${recipe.title}"` }),
    })
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'steps', label: 'Steps' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'notes', label: 'Notes' },
  ]

  return (
    <>
      {/* Cover */}
      <div className="relative w-full h-64 bg-cream-linen overflow-hidden">
        {recipe.cover_image_url ? (
          <Image src={recipe.cover_image_url} alt={recipe.title} fill sizes="100vw" priority className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta/20 to-cream-linen">
            <span className="text-7xl">🍽️</span>
          </div>
        )}
        {recipe.is_ai_generated && (
          <span className="absolute top-4 left-4 bg-white/90 text-terracotta text-xs font-semibold px-3 py-1 rounded-full">✨ AI-Generated</span>
        )}
        <button onClick={toggleSave} disabled={savingRecipe || !currentUser}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 15.5l-7-7a4 4 0 015.7-5.6L9 4.2l1.3-1.3a4 4 0 015.7 5.6L9 15.5z"
              stroke={saved ? '#C4684A' : '#2A1F1A'} strokeWidth="1.4" fill={saved ? '#C4684A' : 'none'} fillOpacity={saved ? 0.15 : 0}/>
          </svg>
        </button>
      </div>

      <div className="px-4 pt-5 pb-6">
        <h1 className="heading-serif text-2xl mb-3">{recipe.title}</h1>

        {recipe.author && (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-cream-linen overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-semibold text-espresso">
              {recipe.author.avatar_url
                ? <Image src={recipe.author.avatar_url} alt={recipe.author.display_name} width={36} height={36} className="w-full h-full object-cover" />
                : recipe.author.display_name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${recipe.author.username}`} className="text-sm font-semibold text-espresso hover:text-terracotta transition-colors">{recipe.author.display_name}</Link>
              <p className="text-xs text-clay">@{recipe.author.username}</p>
            </div>
            <FollowButton targetUserId={recipe.author.id} initialFollowing={isFollowing} currentUserId={currentUser?.id ?? null} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5 p-3 bg-cream-linen rounded-2xl">
          {[
            { label: 'Prep', value: recipe.prep_time_mins > 0 ? `${recipe.prep_time_mins}m` : '—' },
            { label: 'Cook', value: recipe.cook_time_mins > 0 ? `${recipe.cook_time_mins}m` : '—' },
            { label: 'Serves', value: recipe.servings },
            { label: 'Rating', value: recipe.avg_rating > 0 ? `${recipe.avg_rating.toFixed(1)}★` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-sm font-semibold text-espresso">{value}</div>
              <div className="text-[9px] text-clay">{label}</div>
            </div>
          ))}
        </div>

        {/* Cook now button */}
        <button onClick={() => setCookingMode(true)}
          className="w-full flex items-center justify-center gap-2 mb-4 py-3.5 bg-espresso text-white text-sm font-semibold rounded-2xl hover:bg-espresso/90 transition-colors active:scale-[0.99]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3l8 5-8 5V3z" fill="white"/>
          </svg>
          Cook this recipe
        </button>

        {/* Portion scaler */}
        <div className="flex items-center justify-between mb-5 p-3 card">
          <span className="text-sm font-medium text-espresso">Servings</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setServings(s => Math.max(1, s - 1))}
              className="w-8 h-8 rounded-full bg-cream-linen text-espresso text-lg font-light hover:bg-black/10 transition-colors flex items-center justify-center">−</button>
            <span className="text-sm font-semibold text-espresso w-6 text-center">{servings}</span>
            <button onClick={() => setServings(s => s + 1)}
              className="w-8 h-8 rounded-full bg-cream-linen text-espresso text-lg font-light hover:bg-black/10 transition-colors flex items-center justify-center">+</button>
          </div>
          {servings !== recipe.servings && <span className="text-[10px] text-terracotta font-medium">Scaled</span>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cream-linen rounded-xl mb-4 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-white text-espresso shadow-sm' : 'text-clay'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 px-3 bg-cream-linen rounded-xl">
                <div>
                  <span className="text-sm font-medium text-espresso capitalize">{ing.name}</span>
                  {ing.notes && <span className="text-[10px] text-clay ml-1.5">({ing.notes})</span>}
                </div>
                <span className="text-xs text-clay font-medium">{scaleQty(ing.quantity)} {ing.unit}</span>
              </div>
            ))}
            {recipe.ingredients.length === 0 && <p className="text-sm text-clay text-center py-6">No ingredients listed.</p>}
          </div>
        )}

        {/* Steps */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            {recipe.steps.map(step => (
              <div key={step.order} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-terracotta text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{step.order}</div>
                <div className="flex-1">
                  <p className="text-sm text-espresso leading-relaxed">{step.instruction}</p>
                  {step.timer_mins && step.timer_mins > 0 ? (
                    <StepTimer mins={step.timer_mins} />
                  ) : null}
                </div>
              </div>
            ))}
            {recipe.steps.length === 0 && <p className="text-sm text-clay text-center py-6">No steps listed.</p>}
          </div>
        )}

        {/* Nutrition */}
        {activeTab === 'nutrition' && <NutritionTab recipe={recipe} />}

        {/* Notes */}
        {activeTab === 'notes' && (
          <div className="py-4 space-y-4">
            {recipe.description
              ? <p className="text-sm text-espresso leading-relaxed">{recipe.description}</p>
              : <p className="text-sm text-clay text-center py-6">No notes from the author.</p>}
            {recipe.dietary_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.dietary_tags.map(tag => (
                  <span key={tag} className="tag-pill bg-sage/15 text-sage-dark text-xs capitalize">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Remix */}
        <div className="mt-6">
          <RemixPanel recipe={recipe} onSave={saveRemix} />
        </div>

        {/* Rating */}
        <StarRating recipeId={recipe.id} initialRating={recipe.avg_rating} initialUserRating={initialUserRating} currentUserId={currentUser?.id ?? null} />

        {/* Comments */}
        <CommentsSection recipeId={recipe.id} initialComments={initialComments} currentUser={currentUser} />
      </div>

      {/* Cooking mode overlay */}
      {cookingMode && (
        <CookingMode recipe={recipe} servings={servings} onClose={() => setCookingMode(false)} />
      )}
    </>
  )
}

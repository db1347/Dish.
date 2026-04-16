'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FollowButton } from '@/components/profile/FollowButton'
import type { Comment, Recipe, User } from '@dish/types'

type Tab = 'ingredients' | 'steps' | 'notes'

function StarRating({ recipeId, initialRating, initialUserRating, currentUserId }: {
  recipeId: string
  initialRating: number
  initialUserRating: number
  currentUserId: string | null
}) {
  const [userRating, setUserRating] = useState(initialUserRating)
  const [hover, setHover] = useState(0)
  const [avg, setAvg] = useState(initialRating)
  const [loading, setLoading] = useState(false)

  async function rate(stars: number) {
    if (!currentUserId || loading) return
    setLoading(true)
    const res = await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId, stars }),
    })
    if (res.ok) {
      setUserRating(stars)
      // Optimistically update avg
      setAvg(prev => Math.round(((prev + stars) / 2) * 10) / 10)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center py-6 border-t border-black/[0.06]">
      <p className="text-xs font-semibold text-clay uppercase tracking-wider mb-3">Rate this recipe</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => rate(star)}
            disabled={!currentUserId || loading}
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId, body }),
    })
    if (res.ok) {
      const { comment } = await res.json()
      setComments(c => [...c, comment])
      setBody('')
    }
    setSubmitting(false)
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment?')) return
    setDeleting(id)
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id: id }),
    })
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
      <h3 className="text-xs font-semibold text-clay uppercase tracking-wider mb-4">
        Comments ({comments.length})
      </h3>
      {comments.length > 0 && (
        <div className="space-y-4 mb-5">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cream-linen flex items-center justify-center flex-shrink-0 text-xs font-semibold text-espresso overflow-hidden">
                {c.author?.avatar_url
                  ? <Image src={c.author.avatar_url} alt={c.author.display_name ?? ''} width={32} height={32} className="w-full h-full object-cover" />
                  : (c.author?.display_name?.[0] ?? c.author?.username?.[0] ?? '?').toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/profile/${c.author?.username}`} className="text-xs font-semibold text-espresso hover:text-terracotta">
                    {c.author?.display_name ?? c.author?.username}
                  </Link>
                  <span className="text-[10px] text-clay">{timeAgo(c.created_at)}</span>
                  {currentUser?.id === c.author_id && (
                    <button onClick={() => deleteComment(c.id)} disabled={deleting === c.id}
                      className="ml-auto text-[10px] text-clay hover:text-red-400 transition-colors">
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
          <div className="w-8 h-8 rounded-full bg-cream-linen flex items-center justify-center flex-shrink-0 text-xs font-semibold text-espresso">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Add a comment..."
              rows={2} className="input-base resize-none flex-1 text-sm py-2" />
            <button onClick={submit} disabled={!body.trim() || submitting}
              className="btn-primary text-sm px-4 py-2 self-end disabled:opacity-50">
              {submitting ? '...' : 'Post'}
            </button>
          </div>
        </div>
      ) : (
        <Link href="/auth/login" className="text-sm text-terracotta font-medium">Sign in to comment</Link>
      )}
    </div>
  )
}

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

  function scaleQty(qty: number) {
    return Math.round((qty * servings / recipe.servings) * 100) / 100
  }

  async function toggleSave() {
    if (!currentUser) return
    setSavingRecipe(true)
    const method = saved ? 'DELETE' : 'POST'
    const res = await fetch('/api/save', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipe.id }),
    })
    if (res.ok) setSaved(s => !s)
    setSavingRecipe(false)
  }

  const totalMins = recipe.prep_time_mins + recipe.cook_time_mins

  return (
    <>
      {/* Cover */}
      <div className="relative w-full h-64 bg-cream-linen overflow-hidden">
        {recipe.cover_image_url ? (
          <Image src={recipe.cover_image_url} alt={recipe.title} fill sizes="100vw" priority className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-light/50 to-terracotta/30">
            <span className="text-7xl">🍽️</span>
          </div>
        )}
        {recipe.is_ai_generated && (
          <span className="absolute top-4 left-4 bg-white/90 text-terracotta text-xs font-semibold px-3 py-1 rounded-full">
            ✨ AI-Generated
          </span>
        )}
        <button onClick={toggleSave} disabled={savingRecipe || !currentUser}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 15.5l-7-7a4 4 0 015.7-5.6L9 4.2l1.3-1.3a4 4 0 015.7 5.6L9 15.5z"
              stroke={saved ? '#C4684A' : '#2A1F1A'} strokeWidth="1.4"
              fill={saved ? '#C4684A' : 'none'} fillOpacity={saved ? 0.15 : 0}/>
          </svg>
        </button>
      </div>

      <div className="px-4 pt-5 pb-6">
        {/* Title & Author */}
        <h1 className="heading-serif text-2xl mb-3">{recipe.title}</h1>

        {recipe.author && (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-cream-linen overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-semibold text-espresso">
              {recipe.author.avatar_url
                ? <Image src={recipe.author.avatar_url} alt={recipe.author.display_name} width={36} height={36} className="w-full h-full object-cover" />
                : recipe.author.display_name[0]?.toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${recipe.author.username}`} className="text-sm font-semibold text-espresso hover:text-terracotta transition-colors">
                {recipe.author.display_name}
              </Link>
              <p className="text-xs text-clay">@{recipe.author.username}</p>
            </div>
            <FollowButton
              targetUserId={recipe.author.id}
              initialFollowing={isFollowing}
              currentUserId={currentUser?.id ?? null}
            />
          </div>
        )}

        {/* Stats bar */}
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
          {servings !== recipe.servings && (
            <span className="text-[10px] text-terracotta font-medium">Scaled</span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-cream-linen rounded-xl mb-4">
          {(['ingredients', 'steps', 'notes'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-espresso shadow-sm' : 'text-clay'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Ingredients tab */}
        {activeTab === 'ingredients' && (
          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 px-3 bg-cream-linen rounded-xl">
                <span className="text-sm font-medium text-espresso capitalize">{ing.name}</span>
                <span className="text-xs text-clay font-medium">
                  {scaleQty(ing.quantity)} {ing.unit}
                </span>
              </div>
            ))}
            {recipe.ingredients.length === 0 && (
              <p className="text-sm text-clay text-center py-6">No ingredients listed.</p>
            )}
          </div>
        )}

        {/* Steps tab */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            {recipe.steps.map(step => (
              <div key={step.order} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-terracotta text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{step.order}</div>
                <div className="flex-1">
                  <p className="text-sm text-espresso leading-relaxed">{step.instruction}</p>
                  {step.timer_mins && step.timer_mins > 0 ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-clay bg-cream-linen px-2 py-1 rounded-full">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#7A6A62" strokeWidth="1"/><path d="M5 3v2.5l1.5 1" stroke="#7A6A62" strokeWidth="1" strokeLinecap="round"/></svg>
                      {step.timer_mins} min
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
            {recipe.steps.length === 0 && (
              <p className="text-sm text-clay text-center py-6">No steps listed.</p>
            )}
          </div>
        )}

        {/* Notes tab */}
        {activeTab === 'notes' && (
          <div className="py-4">
            {recipe.description ? (
              <p className="text-sm text-espresso leading-relaxed">{recipe.description}</p>
            ) : (
              <p className="text-sm text-clay text-center py-6">No notes from the author.</p>
            )}
            {recipe.dietary_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {recipe.dietary_tags.map(tag => (
                  <span key={tag} className="tag-pill bg-sage/15 text-sage-dark text-xs capitalize">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        <StarRating
          recipeId={recipe.id}
          initialRating={recipe.avg_rating}
          initialUserRating={initialUserRating}
          currentUserId={currentUser?.id ?? null}
        />

        {/* Comments */}
        <CommentsSection
          recipeId={recipe.id}
          initialComments={initialComments}
          currentUser={currentUser}
        />
      </div>
    </>
  )
}

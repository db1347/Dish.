import { createClient } from '@/lib/supabase/server'
import { RecipeCard } from '@/components/feed/RecipeCard'
import { StoriesRow } from '@/components/feed/StoriesRow'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AISuggestionRow } from '@/components/feed/AISuggestionRow'
import Link from 'next/link'
import type { Recipe } from '@dish/types'

const FEATURE_CARDS = [
  { href: '/meal-plan', emoji: '📅', label: 'Meal Plan', sub: 'AI weekly planner', color: 'from-terracotta/15 to-terracotta/5' },
  { href: '/shopping', emoji: '🛒', label: 'Shopping', sub: 'Smart list from recipes', color: 'from-sage/20 to-sage/5' },
  { href: '/generate', emoji: '✨', label: 'Generate', sub: 'Recipe from ingredients', color: 'from-amber-400/15 to-amber-400/5' },
]

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile for personalization
  const { data: profile } = user
    ? await supabase.from('users').select('cuisine_prefs, dietary_prefs').eq('id', user.id).single()
    : { data: null }

  // Get following list
  const { data: following } = user
    ? await supabase.from('follows').select('following:users(id, username, avatar_url)').eq('follower_id', user.id).limit(8)
    : { data: [] }

  const stories = following?.map((f: { following: unknown }) => f.following) ?? []
  const followingIds = following?.map((f: { following: unknown }) => (f.following as { id: string }).id) ?? []

  // Following-first feed
  let feedRecipes: Recipe[] = []
  if (user && followingIds.length > 0) {
    const { data } = await supabase
      .from('recipes')
      .select('*, author:users(id, username, display_name, avatar_url)')
      .in('author_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(20)
    feedRecipes = (data ?? []) as Recipe[]
  }

  // Personalized suggestions: filter by user's cuisine prefs first, fall back to trending
  let suggestedRecipes: Recipe[] = []
  const cuisinePrefs: string[] = profile?.cuisine_prefs ?? []
  if (cuisinePrefs.length > 0) {
    const { data } = await supabase
      .from('recipes')
      .select('*, author:users(id, username, display_name, avatar_url)')
      .in('cuisine', cuisinePrefs)
      .order('save_count', { ascending: false })
      .limit(6)
    suggestedRecipes = (data ?? []) as Recipe[]
  }

  // Fall back to trending
  const { data: trendingRecipes } = await supabase
    .from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .order('save_count', { ascending: false })
    .limit(20)

  // AI suggestions
  const { data: aiRecipes } = await supabase
    .from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .eq('is_ai_generated', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const showFollowingFeed = feedRecipes.length > 0

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24">
        <StoriesRow stories={stories as { id: string; username: string; avatar_url: string | null }[]} />

        {/* Feature strip */}
        <div className="px-3 pt-1 pb-2">
          <div className="flex gap-2">
            {FEATURE_CARDS.map(f => (
              <Link key={f.href} href={f.href}
                className={`flex-1 rounded-2xl bg-gradient-to-br ${f.color} p-3 flex flex-col gap-1`}>
                <span className="text-xl">{f.emoji}</span>
                <span className="text-xs font-semibold text-espresso leading-tight">{f.label}</span>
                <span className="text-[9px] text-clay leading-tight">{f.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        {aiRecipes && aiRecipes.length > 0 && (
          <AISuggestionRow recipes={aiRecipes as Recipe[]} />
        )}

        {/* Personalized daily picks */}
        {suggestedRecipes.length > 0 && (
          <section className="px-3 mt-2">
            <div className="flex items-center justify-between py-3">
              <div>
                <h2 className="text-[13px] font-semibold text-espresso">Today&apos;s picks for you</h2>
                <p className="text-[10px] text-clay">Based on your cuisine preferences</p>
              </div>
              <Link href="/explore" className="text-[11px] text-terracotta font-medium">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {suggestedRecipes.map((r: Recipe) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </section>
        )}

        {/* Following feed */}
        {showFollowingFeed && (
          <section className="px-3 mt-4">
            <div className="flex items-center justify-between py-3">
              <h2 className="text-[13px] font-semibold text-espresso">Following</h2>
              <Link href="/explore" className="text-[11px] text-terracotta font-medium">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {feedRecipes.map((r: Recipe) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </section>
        )}

        {/* Trending */}
        {trendingRecipes && trendingRecipes.length > 0 && (
          <section className="px-3 mt-4">
            <div className="flex items-center justify-between py-3">
              <h2 className="text-[13px] font-semibold text-espresso">Trending today</h2>
              <Link href="/explore" className="text-[11px] text-terracotta font-medium">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(trendingRecipes as Recipe[]).map(r => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </section>
        )}

        {!showFollowingFeed && (!trendingRecipes || trendingRecipes.length === 0) && (
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <div className="text-5xl mb-4">🍳</div>
            <h2 className="heading-serif text-xl mb-2">Your feed is empty</h2>
            <p className="text-sm text-clay mb-6">Follow some chefs to see their recipes here.</p>
            <Link href="/explore" className="btn-primary text-sm">Explore recipes</Link>
          </div>
        )}
      </div>
      <BottomNav active="home" />
    </main>
  )
}

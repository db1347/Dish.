import { createClient } from '@/lib/supabase/server'
import { RecipeCard } from '@/components/feed/RecipeCard'
import { StoriesRow } from '@/components/feed/StoriesRow'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AISuggestionRow } from '@/components/feed/AISuggestionRow'
import type { Recipe } from '@dish/types'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get following list for logged-in users
  const { data: following } = user
    ? await supabase.from('follows').select('following:users(id, username, avatar_url)').eq('follower_id', user.id).limit(8)
    : { data: [] }

  const stories = following?.map((f: { following: unknown }) => f.following) ?? []
  const followingIds = following?.map((f: { following: unknown }) => (f.following as { id: string }).id) ?? []

  // Following-first feed logic
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

  // Fall back to trending if empty
  const { data: trendingRecipes } = await supabase
    .from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .order('save_count', { ascending: false })
    .limit(20)

  // AI suggestions: 3 most recent AI-generated recipes globally
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

        {/* AI Suggestions */}
        {aiRecipes && aiRecipes.length > 0 && (
          <AISuggestionRow recipes={aiRecipes as Recipe[]} />
        )}

        {/* Following feed */}
        {showFollowingFeed && (
          <section className="px-3 mt-1">
            <div className="flex items-center justify-between py-3">
              <h2 className="text-[13px] font-semibold text-espresso">Following</h2>
              <a href="/explore" className="text-[11px] text-terracotta font-medium">See all</a>
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
              <a href="/explore" className="text-[11px] text-terracotta font-medium">See all</a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(trendingRecipes as Recipe[]).map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!showFollowingFeed && (!trendingRecipes || trendingRecipes.length === 0) && (
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <div className="text-5xl mb-4">🍳</div>
            <h2 className="heading-serif text-xl mb-2">Your feed is empty</h2>
            <p className="text-sm text-clay mb-6">Follow some chefs to see their recipes here.</p>
            <a href="/explore" className="btn-primary text-sm">Explore recipes</a>
          </div>
        )}
      </div>
      <BottomNav active="home" />
    </main>
  )
}

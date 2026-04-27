import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { RecipeDetailClient } from '@/components/recipe/RecipeDetailClient'

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url, bio, follower_count, following_count, recipe_count, avg_rating, dietary_prefs, cuisine_prefs, skill_level, is_premium, ai_generations_today, ai_generations_reset_at, created_at)')
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .eq('recipe_id', id)
    .order('created_at', { ascending: true })

  // Check if user has rated
  let userRating = 0
  let isFollowing = false
  let isSaved = false

  if (user) {
    const [{ data: rating }, { data: follow }, { data: collections }] = await Promise.all([
      supabase.from('ratings').select('stars').eq('recipe_id', id).eq('user_id', user.id).single(),
      supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', recipe.author_id).single(),
      supabase.from('collections').select('id, collection_recipes!inner(recipe_id)').eq('user_id', user.id).eq('collection_recipes.recipe_id', id),
    ])
    userRating = rating?.stars ?? 0
    isFollowing = !!follow
    isSaved = !!(collections && collections.length > 0)
  }

  const currentUser = user ? {
    id: user.id,
    username: (user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'user') as string,
    avatar_url: (user.user_metadata?.avatar_url ?? null) as string | null,
  } : null

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      {/* Back button overlaid on cover */}
      <header className="absolute top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="#2A1F1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        <RecipeDetailClient
          recipe={recipe}
          currentUser={currentUser}
          initialUserRating={userRating}
          initialComments={comments ?? []}
          isFollowing={isFollowing}
          isSaved={isSaved}
        />
      </div>
      <BottomNav active="home" />
    </main>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/BottomNav'
import { FollowButton } from '@/components/profile/FollowButton'
import { RecipeCard } from '@/components/feed/RecipeCard'
import type { Recipe } from '@dish/types'

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })

  let isFollowing = false
  if (currentUser) {
    const { data: follow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!follow
  }

  const totalRecipes = (recipes ?? []).length

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      {/* Back header */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-black/[0.06] px-4 py-3 flex items-center gap-3">
        <Link href="/" className="w-9 h-9 rounded-xl bg-black/[0.06] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="#2A1F1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-sm font-semibold text-espresso flex-1">@{profile.username}</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-terracotta/20 via-cream-linen to-sage/10 px-5 pt-8 pb-6">
          <div className="flex items-end gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-[22px] overflow-hidden bg-cream-linen border-2 border-white shadow-sm flex-shrink-0">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.display_name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {profile.display_name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="heading-serif text-xl leading-tight">{profile.display_name}</h2>
              <p className="text-xs text-clay mt-0.5">@{profile.username}</p>
            </div>
            <FollowButton
              targetUserId={profile.id}
              initialFollowing={isFollowing}
              currentUserId={currentUser?.id ?? null}
            />
          </div>

          {profile.bio && (
            <p className="text-sm text-espresso/80 leading-relaxed mb-4">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Recipes', value: profile.recipe_count ?? totalRecipes },
              { label: 'Followers', value: profile.follower_count ?? 0 },
              { label: 'Following', value: profile.following_count ?? 0 },
              { label: 'Avg ★', value: (profile.avg_rating ?? 0).toFixed(1) },
            ].map(({ label, value }) => (
              <div key={label} className="card p-3 text-center">
                <div className="text-lg font-bold text-espresso leading-tight">{value}</div>
                <div className="text-[9px] text-clay mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recipes grid */}
        <section className="px-3 mt-4">
          {recipes && recipes.length > 0 ? (
            <>
              <div className="flex items-center justify-between py-3">
                <h3 className="text-[13px] font-semibold text-espresso">Recipes</h3>
                <span className="text-[11px] text-clay">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {recipes.map((r: Recipe) => (
                  <Link key={r.id} href={`/recipe/${r.id}`} className="card block overflow-hidden hover:border-black/15 transition-colors">
                    <div className="relative w-full h-24 bg-cream-linen">
                      {r.cover_image_url ? (
                        <Image src={r.cover_image_url} alt={r.title} fill sizes="33vw" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-light/40 to-terracotta/20">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-medium text-espresso line-clamp-2 leading-tight">{r.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">🍳</div>
              <h3 className="heading-serif text-lg mb-2">No recipes yet</h3>
              <p className="text-sm text-clay">@{profile.username} hasn&apos;t shared any recipes.</p>
            </div>
          )}
        </section>
      </div>
      <BottomNav active="profile" />
    </main>
  )
}

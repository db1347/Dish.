import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { MyProfileClient } from '@/components/profile/MyProfileClient'
import type { Recipe } from '@dish/types'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const { data: collections } = await supabase
    .from('collections')
    .select('*, collection_recipes(recipe_id, recipes(*, author:users(id, username, display_name, avatar_url)))')
    .eq('user_id', user.id)

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24">
        <MyProfileClient
          profile={profile}
          recipes={(recipes ?? []) as Recipe[]}
          collections={collections ?? []}
        />
      </div>
      <BottomNav active="profile" />
    </main>
  )
}

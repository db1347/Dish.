import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { SavedClient } from '@/components/saved/SavedClient'
import type { Recipe } from '@dish/types'

interface CollectionRecipe {
  recipe_id: string
  added_at: string
  recipes: Recipe
}

interface Collection {
  id: string
  name: string
  is_public: boolean
  created_at: string
  collection_recipes: CollectionRecipe[]
}

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: collections } = await supabase
    .from('collections')
    .select(`
      id, name, is_public, created_at,
      collection_recipes(
        recipe_id, added_at,
        recipes:recipe_id(*, author:users(id, username, display_name, avatar_url))
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24">
        <SavedClient initialCollections={(collections ?? []) as unknown as Collection[]} />
      </div>
      <BottomNav active="saved" />
    </main>
  )
}

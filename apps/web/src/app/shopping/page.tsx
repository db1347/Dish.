import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ShoppingClient } from '@/components/shopping/ShoppingClient'
import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@dish/types'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let savedRecipes: Recipe[] = []
  if (user) {
    const { data } = await supabase
      .from('collection_recipes')
      .select('recipes(*, author:users(id, username, display_name, avatar_url))')
      .eq('collections.user_id', user.id)
      .limit(20)
    savedRecipes = (data ?? [])
      .map((r: { recipes: unknown }) => r.recipes)
      .filter(Boolean) as Recipe[]
  }

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24">
        <ShoppingClient savedRecipes={savedRecipes} />
      </div>
      <BottomNav active="saved" />
    </main>
  )
}

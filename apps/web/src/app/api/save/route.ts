import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to save recipes.' }, { status: 401 })

  const { recipe_id, collection_id } = await request.json()
  if (!recipe_id) return Response.json({ message: 'recipe_id required.' }, { status: 400 })

  // Get or create default collection
  let collId = collection_id
  if (!collId) {
    const { data: existing } = await supabase.from('collections')
      .select('id').eq('user_id', user.id).eq('name', 'Saved').single()
    if (existing) {
      collId = existing.id
    } else {
      const { data: created } = await supabase.from('collections')
        .insert({ user_id: user.id, name: 'Saved' }).select('id').single()
      collId = created?.id
    }
  }

  if (!collId) return Response.json({ message: 'Could not find or create collection.' }, { status: 500 })

  const { error } = await supabase.from('collection_recipes').upsert({
    collection_id: collId,
    recipe_id,
  })
  if (error) return Response.json({ message: error.message }, { status: 500 })

  // Increment save_count (best-effort; function may not exist until DB migration is run)
  try { await supabase.rpc('increment_save_count', { rid: recipe_id }) } catch { /* ignore */ }

  return Response.json({ saved: true, collection_id: collId })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to unsave recipes.' }, { status: 401 })

  const { recipe_id } = await request.json()
  if (!recipe_id) return Response.json({ message: 'recipe_id required.' }, { status: 400 })

  // Find all user's collections containing this recipe and remove
  const { data: userCollections } = await supabase.from('collections')
    .select('id').eq('user_id', user.id)

  if (userCollections?.length) {
    const ids = userCollections.map(c => c.id)
    await supabase.from('collection_recipes')
      .delete()
      .in('collection_id', ids)
      .eq('recipe_id', recipe_id)
  }

  return Response.json({ saved: false })
}

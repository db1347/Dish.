import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to view collections.' }, { status: 401 })

  const { data, error } = await supabase
    .from('collections')
    .select(`
      id, name, is_public, created_at,
      collection_recipes(
        recipe_id,
        added_at,
        recipes:recipe_id(*, author:users(id, username, display_name, avatar_url))
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ message: error.message }, { status: 500 })
  return Response.json({ collections: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to create collections.' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return Response.json({ message: 'Collection name required.' }, { status: 400 })

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single()

  if (error) return Response.json({ message: error.message }, { status: 500 })
  return Response.json({ collection: data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Unauthorized.' }, { status: 401 })

  const { collection_id, recipe_id } = await request.json()

  if (recipe_id && collection_id) {
    // Remove a recipe from a collection
    const { error } = await supabase.from('collection_recipes')
      .delete()
      .eq('collection_id', collection_id)
      .eq('recipe_id', recipe_id)
    if (error) return Response.json({ message: error.message }, { status: 500 })
    return Response.json({ removed: true })
  }

  if (collection_id) {
    // Delete the entire collection
    const { error } = await supabase.from('collections')
      .delete()
      .eq('id', collection_id)
      .eq('user_id', user.id)
    if (error) return Response.json({ message: error.message }, { status: 500 })
    return Response.json({ deleted: true })
  }

  return Response.json({ message: 'collection_id required.' }, { status: 400 })
}

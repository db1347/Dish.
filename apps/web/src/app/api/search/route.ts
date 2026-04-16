import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const cuisine = searchParams.get('cuisine') ?? ''
  const dietary = searchParams.get('dietary') ?? ''
  const skill = searchParams.get('skill') ?? ''
  const maxTime = parseInt(searchParams.get('max_time') ?? '0') || 0

  let recipeQuery = supabase
    .from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url)')

  if (query) {
    recipeQuery = recipeQuery.textSearch('search_vector', query, { type: 'websearch' })
  } else {
    recipeQuery = recipeQuery.order('save_count', { ascending: false })
  }

  if (cuisine) recipeQuery = recipeQuery.eq('cuisine', cuisine)
  if (dietary) recipeQuery = recipeQuery.contains('dietary_tags', [dietary])
  if (skill) recipeQuery = recipeQuery.eq('skill_level', skill)
  if (maxTime) recipeQuery = recipeQuery.lte('prep_time_mins', maxTime)

  const { data: recipes, error } = await recipeQuery.limit(40)
  if (error) return Response.json({ message: error.message }, { status: 500 })

  // Top chefs by follower count (for empty search state)
  const { data: topChefs } = query ? { data: [] } : await supabase
    .from('users')
    .select('id, username, display_name, avatar_url, follower_count, recipe_count')
    .order('follower_count', { ascending: false })
    .limit(5)

  return Response.json({ recipes: recipes ?? [], topChefs: topChefs ?? [] })
}

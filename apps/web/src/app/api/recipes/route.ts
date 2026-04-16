import { createClient } from '@/lib/supabase/server'
import type { Ingredient, Step } from '@dish/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to create recipes.' }, { status: 401 })

  const body = await request.json()
  const {
    title, description, cuisine, dietary_tags, skill_level,
    prep_time_mins, cook_time_mins, servings,
    ingredients, steps, cover_image_url, is_ai_generated, ai_prompt,
  } = body

  if (!title?.trim()) return Response.json({ message: 'Title is required.' }, { status: 400 })

  const { data: recipe, error } = await supabase.from('recipes').insert({
    author_id: user.id,
    title: title.trim(),
    description: description?.trim() ?? '',
    cuisine: cuisine ?? '',
    dietary_tags: dietary_tags ?? [],
    skill_level: skill_level ?? 'beginner',
    prep_time_mins: Number(prep_time_mins) || 0,
    cook_time_mins: Number(cook_time_mins) || 0,
    servings: Number(servings) || 2,
    ingredients: ingredients ?? [],
    steps: steps ?? [],
    cover_image_url: cover_image_url ?? null,
    is_ai_generated: is_ai_generated ?? false,
    ai_prompt: ai_prompt ?? null,
  }).select().single()

  if (error) return Response.json({ message: error.message }, { status: 500 })

  // Update recipe_count (best-effort; function may not exist until DB migration is run)
  try { await supabase.rpc('increment_recipe_count', { uid: user.id }) } catch { /* ignore */ }

  return Response.json({ recipe }, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const author_id = searchParams.get('author_id')

  let query = supabase.from('recipes')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (author_id) query = query.eq('author_id', author_id)

  const { data, error } = await query.limit(50)
  if (error) return Response.json({ message: error.message }, { status: 500 })
  return Response.json({ recipes: data })
}

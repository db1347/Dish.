import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to rate recipes.' }, { status: 401 })

  const { recipe_id, stars } = await request.json()
  if (!recipe_id || !stars || stars < 1 || stars > 5)
    return Response.json({ message: 'recipe_id and stars (1-5) required.' }, { status: 400 })

  const { error } = await supabase.from('ratings').upsert({
    recipe_id, user_id: user.id, stars,
  }, { onConflict: 'recipe_id,user_id' })

  if (error) return Response.json({ message: error.message }, { status: 500 })

  // Recalculate avg_rating
  const { data: ratings } = await supabase.from('ratings')
    .select('stars').eq('recipe_id', recipe_id)

  if (ratings) {
    const avg = ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
    await supabase.from('recipes').update({
      avg_rating: Math.round(avg * 100) / 100,
      rating_count: ratings.length,
    }).eq('id', recipe_id)
  }

  return Response.json({ rated: true, stars })
}

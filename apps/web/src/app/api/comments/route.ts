import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const recipe_id = searchParams.get('recipe_id')
  if (!recipe_id) return Response.json({ message: 'recipe_id required.' }, { status: 400 })

  const { data, error } = await supabase.from('comments')
    .select('*, author:users(id, username, display_name, avatar_url)')
    .eq('recipe_id', recipe_id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ message: error.message }, { status: 500 })
  return Response.json({ comments: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to comment.' }, { status: 401 })

  const { recipe_id, body } = await request.json()
  if (!recipe_id || !body?.trim())
    return Response.json({ message: 'recipe_id and body required.' }, { status: 400 })

  const { data: comment, error } = await supabase.from('comments').insert({
    recipe_id, author_id: user.id, body: body.trim(),
  }).select('*, author:users(id, username, display_name, avatar_url)').single()

  if (error) return Response.json({ message: error.message }, { status: 500 })
  return Response.json({ comment }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to delete comments.' }, { status: 401 })

  const { comment_id } = await request.json()
  if (!comment_id) return Response.json({ message: 'comment_id required.' }, { status: 400 })

  const { error } = await supabase.from('comments').delete()
    .eq('id', comment_id).eq('author_id', user.id)

  if (error) return Response.json({ message: error.message }, { status: 500 })
  return Response.json({ deleted: true })
}

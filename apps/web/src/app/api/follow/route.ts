import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to follow chefs.' }, { status: 401 })

  const { following_id } = await request.json()
  if (!following_id) return Response.json({ message: 'following_id required.' }, { status: 400 })
  if (following_id === user.id) return Response.json({ message: 'Cannot follow yourself.' }, { status: 400 })

  const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id })
  if (error) return Response.json({ message: error.message }, { status: 500 })

  return Response.json({ following: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to unfollow.' }, { status: 401 })

  const { following_id } = await request.json()
  if (!following_id) return Response.json({ message: 'following_id required.' }, { status: 400 })

  const { error } = await supabase.from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', following_id)
  if (error) return Response.json({ message: error.message }, { status: 500 })

  return Response.json({ following: false })
}

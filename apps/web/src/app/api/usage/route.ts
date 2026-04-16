import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ used: 0, limit: 3, is_premium: false })

  const { data: profile } = await supabase.from('users')
    .select('is_premium, ai_generations_today, ai_generations_reset_at')
    .eq('id', user.id).single()

  if (!profile) return Response.json({ used: 0, limit: 3, is_premium: false })

  const resetAt = new Date(profile.ai_generations_reset_at ?? 0)
  const used = resetAt < new Date() ? 0 : (profile.ai_generations_today ?? 0)

  return Response.json({
    used,
    limit: 3,
    is_premium: profile.is_premium ?? false,
  })
}

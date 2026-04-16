import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { GenerateRecipeInput } from '@dish/types'

const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY!,
  baseURL: 'https://api.x.ai/v1',
})

const MODEL = 'grok-3-latest'
const DAILY_FREE_LIMIT = 3

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in to generate recipes.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium, ai_generations_today, ai_generations_reset_at')
    .eq('id', user.id)
    .single()

  if (profile && !profile.is_premium) {
    const resetAt = new Date(profile.ai_generations_reset_at ?? 0)
    const generationsToday = resetAt < new Date() ? 0 : (profile.ai_generations_today ?? 0)
    if (generationsToday >= DAILY_FREE_LIMIT)
      return Response.json(
        { message: 'Daily limit reached. Upgrade to premium for unlimited generations.' },
        { status: 429 }
      )
  }

  const body: GenerateRecipeInput = await request.json()
  const { ingredients, dietary_prefs, cuisine, max_time_mins } = body
  if (!ingredients?.length)
    return Response.json({ message: 'Provide at least one ingredient.' }, { status: 400 })

  const prompt = `You are a professional chef. Create a delicious recipe using primarily: ${ingredients.join(', ')}.
${dietary_prefs?.length ? `Must be: ${dietary_prefs.join(', ')}.` : ''}
${cuisine ? `Cuisine: ${cuisine}.` : ''}
${max_time_mins ? `Max time: ${max_time_mins} minutes.` : ''}

Write a warm 2–3 sentence description, then output the recipe as:
\`\`\`json
{"title":"","description":"","cuisine":"","dietary_tags":[],"skill_level":"beginner","prep_time_mins":0,"cook_time_mins":0,"servings":2,"estimated_calories":0,"ingredients":[{"id":"1","name":"","quantity":1,"unit":"","notes":""}],"steps":[{"order":1,"instruction":"","timer_mins":0}]}
\`\`\``

  // Increment usage counter (fire-and-forget)
  supabase.from('users').update({
    ai_generations_today: (profile?.ai_generations_today ?? 0) + 1,
    ai_generations_reset_at: new Date(Date.now() + 86400000).toISOString(),
  }).eq('id', user.id).then(() => {})

  const stream = await grok.chat.completions.create({
    model: MODEL,
    max_tokens: 1500,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content
          if (text) controller.enqueue(encoder.encode(text))
        }
      } finally {
        controller.close()
      }
    },
    cancel() {
      stream.controller.abort()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}

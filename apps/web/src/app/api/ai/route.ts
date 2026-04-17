import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const grok = new OpenAI({ apiKey: process.env.GROK_API_KEY!, baseURL: 'https://api.x.ai/v1' })
const MODEL = 'grok-3-latest'

function stream(prompt: string, maxTokens = 1200) {
  return grok.chat.completions.create({
    model: MODEL, max_tokens: maxTokens, stream: true,
    messages: [{ role: 'user', content: prompt }],
  })
}

function streamResponse(s: Awaited<ReturnType<typeof stream>>) {
  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      try {
        for await (const chunk of s) {
          const t = chunk.choices[0]?.delta?.content
          if (t) controller.enqueue(enc.encode(t))
        }
      } finally { controller.close() }
    },
    cancel() { s.controller.abort() },
  })
  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ message: 'Sign in required.' }, { status: 401 })

  const body = await request.json()
  const { mode } = body

  if (mode === 'nutrition') {
    const { recipe } = body
    const prompt = `You are a nutritionist. Analyze per-serving nutritional content for this recipe.
Title: ${recipe.title}
Servings: ${recipe.servings}
Ingredients: ${recipe.ingredients.map((i: { quantity: number; unit: string; name: string }) => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}

Reply with ONLY this JSON, no markdown, no extra text:
{"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"fiber_g":0,"sugar_g":0,"sodium_mg":0,"note":""}`
    return streamResponse(await stream(prompt, 300))
  }

  if (mode === 'remix') {
    const { recipe, instruction } = body
    const prompt = `You are a creative chef. Remix this recipe as instructed.
Original: "${recipe.title}" — ${recipe.description}
Ingredients: ${recipe.ingredients.map((i: { quantity: number; unit: string; name: string }) => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
Steps: ${recipe.steps.map((s: { order: number; instruction: string }) => `${s.order}. ${s.instruction}`).join(' | ')}
Remix instruction: "${instruction}"

Reply with ONLY this JSON, no markdown:
{"title":"","description":"","cuisine":"","dietary_tags":[],"skill_level":"beginner","prep_time_mins":0,"cook_time_mins":0,"servings":2,"ingredients":[{"id":"1","name":"","quantity":1,"unit":"","notes":""}],"steps":[{"order":1,"instruction":"","timer_mins":0}]}`
    return streamResponse(await stream(prompt, 1200))
  }

  if (mode === 'meal-plan') {
    const { goal, dietary_prefs, days, people } = body
    const prompt = `Create a ${days}-day meal plan for ${people} person(s).
Goal: ${goal || 'balanced and healthy'}
Dietary preferences: ${dietary_prefs?.length ? dietary_prefs.join(', ') : 'none'}

Each meal should be realistic and easy. Include variety.
Reply with ONLY this JSON, no markdown:
{"days":[{"day":"Monday","breakfast":{"name":"","description":"","prep_mins":0,"calories_approx":0},"lunch":{"name":"","description":"","prep_mins":0,"calories_approx":0},"dinner":{"name":"","description":"","prep_mins":0,"calories_approx":0}}]}`
    return streamResponse(await stream(prompt, 2000))
  }

  if (mode === 'shopping-list') {
    const { recipes } = body
    const lines = (recipes as Array<{ title: string; servings: number; ingredients: Array<{ quantity: number; unit: string; name: string }> }>)
      .flatMap(r => r.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`))
    const prompt = `Consolidate this ingredient list into a tidy shopping list. Merge duplicates, convert units where sensible, and group by supermarket category (Produce, Dairy, Meat & Fish, Pantry, Bakery, Frozen, Other).
Ingredients: ${lines.join(' | ')}

Reply with ONLY this JSON, no markdown:
{"categories":[{"name":"Produce","items":[{"name":"","amount":"","checked":false}]}]}`
    return streamResponse(await stream(prompt, 800))
  }

  return Response.json({ message: 'Unknown AI mode.' }, { status: 400 })
}

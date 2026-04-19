import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const grok = new OpenAI({ apiKey: process.env.GROK_API_KEY!, baseURL: 'https://api.x.ai/v1' })
const MODEL = 'grok-3-latest'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

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

  if (mode === 'scan') {
    const { image_base64, mime_type } = body
    if (!image_base64) return Response.json({ message: 'No image provided.' }, { status: 400 })

    const prompt = `You are a recipe extraction expert. Look at this image of a recipe book page and extract all recipe information you can find.

Reply with ONLY this JSON (no markdown, no extra text, no code blocks):
{
  "title": "",
  "description": "",
  "cuisine": "",
  "dietary_tags": [],
  "skill_level": "beginner",
  "prep_time_mins": 0,
  "cook_time_mins": 0,
  "servings": 2,
  "ingredients": [{"id": "1", "name": "", "quantity": 1, "unit": "g", "notes": ""}],
  "steps": [{"order": 1, "instruction": "", "timer_mins": 0}]
}

Rules:
- skill_level must be one of: beginner, intermediate, advanced
- dietary_tags must only include values from: vegan, vegetarian, gluten-free, dairy-free, keto, paleo, halal, kosher
- cuisine must be one of: Italian, Asian, Mexican, Mediterranean, Indian, French, American, Middle Eastern, Japanese, Thai, Other
- unit must be one of: g, kg, ml, l, cup, tbsp, tsp, piece, slice, pinch, bunch
- If a field is unclear or not present, use sensible defaults
- Extract as much detail as possible from the image`

    try {
      const geminiRes = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mime_type || 'image/jpeg', data: image_base64 } },
              { text: prompt },
            ],
          }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.2 },
        }),
      })
      const geminiJson = await geminiRes.json()
      if (!geminiRes.ok) {
        const errMsg = geminiJson?.error?.message ?? JSON.stringify(geminiJson)
        throw new Error(errMsg)
      }
      const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
      const clean = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim()
      const jsonMatch = clean.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error(`Model returned non-JSON: ${clean.slice(0, 200)}`)
      const parsed = JSON.parse(jsonMatch[0])
      return Response.json({ recipe: parsed })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[scan] error:', msg)
      return Response.json({ message: `Scan failed: ${msg}` }, { status: 500 })
    }
  }

  return Response.json({ message: 'Unknown AI mode.' }, { status: 400 })
}

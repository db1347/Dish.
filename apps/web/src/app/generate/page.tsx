'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import type { DietaryPref, GeneratedRecipe } from '@dish/types'

const DIETARY_OPTIONS: DietaryPref[] = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto']
const CUISINE_OPTIONS = ['Any', 'Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'French']
const TIME_OPTIONS = [{ label: 'Any time', value: 0 }, { label: '< 20 min', value: 20 }, { label: '< 30 min', value: 30 }, { label: '< 60 min', value: 60 }]
const DAILY_FREE_LIMIT = 3

export default function GeneratePage() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPref[]>([])
  const [cuisine, setCuisine] = useState('Any')
  const [maxTime, setMaxTime] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generationsUsed, setGenerationsUsed] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  // Fetch usage count on mount
  useEffect(() => {
    fetch('/api/usage').then(r => r.json()).then(d => {
      if (d.used !== undefined) setGenerationsUsed(d.used)
    }).catch(() => {})
  }, [])

  function addIngredient() {
    const val = inputValue.trim().toLowerCase()
    if (val && !ingredients.includes(val)) setIngredients(p => [...p, val])
    setInputValue('')
  }

  async function generate(keepIngredients = false) {
    if (!ingredients.length) return
    setGenerating(true)
    setStreamText('')
    setRecipe(null)
    setError(null)
    setSavedId(null)
    if (!keepIngredients) { /* keep same ingredients */ }
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          dietary_prefs: dietaryPrefs,
          cuisine: cuisine === 'Any' ? undefined : cuisine,
          max_time_mins: maxTime || undefined,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreamText(full)
      }
      const match = full.match(/```json\n([\s\S]*?)\n```/)
      if (match) {
        setRecipe(JSON.parse(match[1]))
        setStreamText('')
        setGenerationsUsed(prev => prev !== null ? Math.min(prev + 1, DAILY_FREE_LIMIT) : 1)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  async function saveToProfile() {
    if (!recipe) return
    setSaving(true)
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          cuisine: recipe.cuisine,
          dietary_tags: recipe.dietary_tags,
          skill_level: recipe.skill_level,
          prep_time_mins: recipe.prep_time_mins,
          cook_time_mins: recipe.cook_time_mins,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          is_ai_generated: true,
          ai_prompt: `Ingredients: ${ingredients.join(', ')}`,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setSavedId(json.recipe.id)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const limitReached = generationsUsed !== null && generationsUsed >= DAILY_FREE_LIMIT
  const showBanner = generationsUsed !== null && generationsUsed >= 2

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 pt-6 pb-4">
          <h1 className="heading-serif text-2xl mb-1">What&apos;s in your kitchen?</h1>
          <p className="text-sm text-clay">Add ingredients — AI will create a recipe for you</p>
        </div>

        {/* Usage counter */}
        {generationsUsed !== null && (
          <div className="mx-4 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-clay">Daily generations</span>
              <span className={`text-xs font-semibold ${generationsUsed >= 2 ? 'text-terracotta' : 'text-espresso'}`}>
                {generationsUsed} of {DAILY_FREE_LIMIT} used
              </span>
            </div>
            <div className="h-1.5 bg-cream-linen rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(generationsUsed / DAILY_FREE_LIMIT) * 100}%`,
                  backgroundColor: generationsUsed >= 2 ? '#C4684A' : '#7B9E82',
                }}
              />
            </div>
          </div>
        )}

        {/* Usage banner */}
        {showBanner && (
          <div className="mx-4 mb-3 bg-terracotta/10 border border-terracotta/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-terracotta font-medium">
              {limitReached ? '3 of 3 free recipes used today' : `${generationsUsed} of 3 free recipes used today`}
              {' — '}upgrade for unlimited
            </p>
            <a href="/upgrade" className="text-xs font-semibold text-terracotta underline">Upgrade</a>
          </div>
        )}

        <div className="mx-4 card p-4 mb-4">
          <p className="text-[10px] font-semibold text-clay uppercase tracking-wider mb-3">Your ingredients</p>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ingredients.map(ing => (
                <button key={ing} onClick={() => setIngredients(p => p.filter(i => i !== ing))}
                  className="flex items-center gap-1.5 bg-cream-linen text-espresso text-xs font-medium px-3 py-1.5 rounded-full hover:bg-terracotta/10 transition-colors">
                  {ing} <span className="text-clay text-[10px]">×</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={inputValue} onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addIngredient()}
              placeholder="e.g. eggs, tomatoes, feta..." className="input-base flex-1" />
            <button onClick={addIngredient} disabled={!inputValue.trim()}
              className="bg-terracotta text-white text-sm font-medium px-4 rounded-xl disabled:opacity-40 hover:bg-terracotta-dark transition-colors">
              Add
            </button>
          </div>
        </div>

        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {DIETARY_OPTIONS.map(p => (
              <button key={p} onClick={() => setDietaryPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                className={`flex-shrink-0 tag-pill text-xs transition-colors ${dietaryPrefs.includes(p) ? 'bg-terracotta text-white' : 'bg-white border border-black/10 text-clay'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CUISINE_OPTIONS.map(c => (
              <button key={c} onClick={() => setCuisine(c)}
                className={`flex-shrink-0 tag-pill text-xs transition-colors ${cuisine === c ? 'bg-terracotta text-white' : 'bg-white border border-black/10 text-clay'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {TIME_OPTIONS.map(({ label, value }) => (
              <button key={value} onClick={() => setMaxTime(value)}
                className={`tag-pill text-xs transition-colors ${maxTime === value ? 'bg-terracotta text-white' : 'bg-white border border-black/10 text-clay'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-6">
          <button onClick={() => generate()} disabled={!ingredients.length || generating || limitReached}
            className="btn-primary w-full py-4 text-base disabled:opacity-50">
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating your recipe...
              </span>
            ) : limitReached ? 'Daily limit reached' : 'Generate recipe'}
          </button>
          {generationsUsed !== null && (
            <p className="text-center text-xs text-clay mt-2">
              {limitReached ? 'Upgrade for unlimited generations' : `${DAILY_FREE_LIMIT - generationsUsed} free generation${DAILY_FREE_LIMIT - generationsUsed !== 1 ? 's' : ''} remaining today`}
            </p>
          )}
        </div>

        {error && (
          <div className="mx-4 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {generating && streamText && (
          <div className="mx-4 card p-5 mb-4">
            <span className="tag-pill bg-terracotta/10 text-terracotta text-[10px] mb-3 inline-block">AI generating</span>
            <p className="text-sm text-espresso leading-relaxed whitespace-pre-wrap font-mono">
              {streamText}<span className="inline-block w-0.5 h-4 bg-terracotta ml-0.5 animate-pulse align-middle" />
            </p>
          </div>
        )}

        {recipe && (
          <div className="mx-4 card p-5 mb-4">
            <div className="flex items-start justify-between mb-3">
              <span className="tag-pill bg-terracotta/10 text-terracotta text-[10px] inline-block">✨ AI-generated</span>
              <div className="flex gap-2">
                <button onClick={() => generate(true)}
                  disabled={generating || limitReached}
                  className="text-xs font-medium text-clay hover:text-terracotta transition-colors disabled:opacity-40">
                  Try another ↺
                </button>
              </div>
            </div>
            <h2 className="heading-serif text-xl mb-1">{recipe.title}</h2>
            <p className="text-sm text-clay mb-4 leading-relaxed">{recipe.description}</p>
            <div className="grid grid-cols-4 gap-2 mb-5 p-3 bg-cream-linen rounded-xl">
              {[['Prep', `${recipe.prep_time_mins}m`], ['Cook', `${recipe.cook_time_mins}m`], ['Serves', recipe.servings], ['Kcal', recipe.estimated_calories]].map(([l, v]) => (
                <div key={l} className="text-center">
                  <div className="text-sm font-semibold text-espresso">{v}</div>
                  <div className="text-[9px] text-clay">{l}</div>
                </div>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-espresso uppercase tracking-wider mb-3">Ingredients</h3>
            <div className="space-y-2 mb-5">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex justify-between items-center py-2 px-3 bg-cream-linen rounded-xl">
                  <span className="text-sm font-medium text-espresso capitalize">{ing.name}</span>
                  <span className="text-xs text-clay">{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-espresso uppercase tracking-wider mb-3">Steps</h3>
            <div className="space-y-3 mb-6">
              {recipe.steps.map(step => (
                <div key={step.order} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-terracotta text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{step.order}</div>
                  <p className="text-sm text-espresso leading-relaxed flex-1">{step.instruction}</p>
                </div>
              ))}
            </div>

            {/* Save to profile */}
            {savedId ? (
              <a href={`/recipe/${savedId}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-sage/15 text-sage-dark text-sm font-semibold">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="#5A7A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Saved! View recipe →
              </a>
            ) : (
              <button onClick={saveToProfile} disabled={saving}
                className="btn-primary w-full py-3 text-sm">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : '+ Save to my profile'}
              </button>
            )}
          </div>
        )}
      </div>
      <BottomNav active="generate" />
    </main>
  )
}

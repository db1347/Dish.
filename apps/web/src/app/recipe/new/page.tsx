'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/layout/BottomNav'
import type { DietaryPref, Ingredient, SkillLevel, Step } from '@dish/types'

const CUISINE_LIST = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'French', 'American', 'Middle Eastern', 'Japanese', 'Thai', 'Other']
const DIETARY_OPTIONS: DietaryPref[] = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'halal', 'kosher']
const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced']
const UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'pinch', 'bunch']

function newIngredient(): Ingredient {
  return { id: crypto.randomUUID(), name: '', quantity: 1, unit: 'g', notes: '' }
}
function newStep(order: number): Step {
  return { order, instruction: '', timer_mins: 0 }
}

export default function NewRecipePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [dietaryTags, setDietaryTags] = useState<DietaryPref[]>([])
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState(2)
  const [ingredients, setIngredients] = useState<Ingredient[]>([newIngredient()])
  const [steps, setSteps] = useState<Step[]>([newStep(1)])
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Portion scaler — base servings stored at creation time
  const [baseServings] = useState(2)

  function scaleQuantity(qty: number) {
    return Math.round((qty * servings / baseServings) * 100) / 100
  }

  // Ingredients CRUD
  function addIngredient() { setIngredients(p => [...p, newIngredient()]) }
  function updateIngredient(id: string, field: keyof Ingredient, value: string | number) {
    setIngredients(p => p.map(i => i.id === id ? { ...i, [field]: value } : i))
  }
  function removeIngredient(id: string) {
    setIngredients(p => p.length > 1 ? p.filter(i => i.id !== id) : p)
  }

  // Steps CRUD
  function addStep() { setSteps(p => [...p, newStep(p.length + 1)]) }
  function updateStep(order: number, field: keyof Step, value: string | number) {
    setSteps(p => p.map(s => s.order === order ? { ...s, [field]: value } : s))
  }
  function removeStep(order: number) {
    if (steps.length <= 1) return
    setSteps(p => p.filter(s => s.order !== order).map((s, i) => ({ ...s, order: i + 1 })))
  }

  // Cover photo upload
  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { data, error } = await supabase.storage.from('recipe-images').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('recipe-images').getPublicUrl(data.path)
      setCoverUrl(urlData.publicUrl)
    }
    setUploading(false)
  }, [])

  async function handleSubmit() {
    if (!title.trim()) { setError('Please add a title.'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, cuisine, dietary_tags: dietaryTags,
          skill_level: skillLevel,
          prep_time_mins: Number(prepTime) || 0,
          cook_time_mins: Number(cookTime) || 0,
          servings,
          ingredients: ingredients.filter(i => i.name.trim()),
          steps: steps.filter(s => s.instruction.trim()),
          cover_image_url: coverUrl,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      router.push(`/recipe/${json.recipe.id}`)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-black/[0.06] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-black/[0.06] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="#2A1F1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="heading-serif text-lg flex-1">New Recipe</h1>
        <button onClick={handleSubmit} disabled={saving || !title.trim()}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : 'Publish'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Cover photo */}
        <div className="relative w-full h-48 bg-cream-linen flex items-center justify-center cursor-pointer overflow-hidden"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white border border-black/10 flex items-center justify-center">
                {uploading
                  ? <span className="w-5 h-5 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
                  : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 5v12M5 11h12" stroke="#C4684A" strokeWidth="1.8" strokeLinecap="round"/></svg>
                }
              </div>
              <span className="text-xs text-clay font-medium">Add cover photo</span>
              <span className="text-[10px] text-clay/60">Drag & drop or tap to upload</span>
              <input type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
            </label>
          )}
          {coverUrl && (
            <button onClick={() => setCoverUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white text-sm">×</button>
          )}
        </div>

        <div className="px-4 py-5 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}

          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Creamy Tomato Basil Pasta"
              className="input-base text-base font-medium" />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What makes this recipe special?"
              rows={3} className="input-base resize-none" />
          </div>

          {/* Cuisine */}
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Cuisine</label>
            <select value={cuisine} onChange={e => setCuisine(e.target.value)} className="input-base">
              <option value="">Select cuisine...</option>
              {CUISINE_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Dietary tags */}
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-2">Dietary tags</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(tag => (
                <button key={tag} onClick={() => setDietaryTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])}
                  className={`tag-pill text-xs transition-colors ${dietaryTags.includes(tag) ? 'bg-terracotta text-white' : 'bg-white border border-black/10 text-clay'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Skill level */}
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-2">Skill level</label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map(lvl => (
                <button key={lvl} onClick={() => setSkillLevel(lvl)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${skillLevel === lvl ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-black/10 text-clay'}`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Times & servings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Prep (min)</label>
              <input type="number" min="0" value={prepTime} onChange={e => setPrepTime(e.target.value)}
                placeholder="15" className="input-base text-center" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Cook (min)</label>
              <input type="number" min="0" value={cookTime} onChange={e => setCookTime(e.target.value)}
                placeholder="30" className="input-base text-center" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-1.5">Serves</label>
              <div className="flex items-center border border-black/10 rounded-xl overflow-hidden bg-cream-linen">
                <button onClick={() => setServings(s => Math.max(1, s - 1))}
                  className="flex-1 py-3 text-clay text-lg font-light hover:bg-black/5 transition-colors">−</button>
                <span className="flex-1 text-center text-sm font-semibold text-espresso">{servings}</span>
                <button onClick={() => setServings(s => s + 1)}
                  className="flex-1 py-3 text-clay text-lg font-light hover:bg-black/5 transition-colors">+</button>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-semibold text-clay uppercase tracking-wider">Ingredients</label>
              {servings !== baseServings && (
                <span className="text-[9px] text-terracotta font-medium bg-terracotta/10 px-2 py-0.5 rounded-full">
                  Scaled for {servings} servings
                </span>
              )}
            </div>
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex gap-2 items-center">
                  <input value={ing.name} onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                    placeholder="Ingredient name" className="input-base flex-[3] text-sm py-2.5" />
                  <input type="number" min="0" step="0.1"
                    value={servings !== baseServings ? scaleQuantity(ing.quantity) : ing.quantity}
                    onChange={e => updateIngredient(ing.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="input-base flex-1 text-center text-sm py-2.5 px-2" />
                  <select value={ing.unit} onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
                    className="input-base flex-[1.5] text-sm py-2.5 px-2">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button onClick={() => removeIngredient(ing.id)}
                    className="w-9 h-9 flex-shrink-0 rounded-xl bg-black/[0.05] flex items-center justify-center text-clay text-lg hover:bg-red-50 hover:text-red-400 transition-colors">×</button>
                </div>
              ))}
            </div>
            <button onClick={addIngredient}
              className="mt-3 w-full py-2.5 border border-dashed border-black/15 rounded-xl text-sm text-clay font-medium hover:border-terracotta hover:text-terracotta transition-colors flex items-center justify-center gap-2">
              <span className="text-lg leading-none">+</span> Add ingredient
            </button>
          </div>

          {/* Steps */}
          <div>
            <label className="text-[10px] font-semibold text-clay uppercase tracking-wider block mb-2">Steps</label>
            <div className="space-y-3">
              {steps.map(step => (
                <div key={step.order} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-terracotta text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-2">{step.order}</div>
                  <div className="flex-1">
                    <textarea value={step.instruction} onChange={e => updateStep(step.order, 'instruction', e.target.value)}
                      placeholder={`Step ${step.order} instructions...`}
                      rows={2} className="input-base resize-none text-sm w-full" />
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className="text-[10px] text-clay">Timer (min)</label>
                      <input type="number" min="0" value={step.timer_mins ?? 0}
                        onChange={e => updateStep(step.order, 'timer_mins', parseInt(e.target.value) || 0)}
                        className="w-16 bg-cream-linen border border-black/10 rounded-lg px-2 py-1 text-xs text-center" />
                      <button onClick={() => removeStep(step.order)}
                        className="ml-auto text-[10px] text-clay hover:text-red-400 transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addStep}
              className="mt-3 w-full py-2.5 border border-dashed border-black/15 rounded-xl text-sm text-clay font-medium hover:border-terracotta hover:text-terracotta transition-colors flex items-center justify-center gap-2">
              <span className="text-lg leading-none">+</span> Add step
            </button>
          </div>

          {/* Publish CTA */}
          <button onClick={handleSubmit} disabled={saving || !title.trim()}
            className="btn-primary w-full py-4 text-base disabled:opacity-50 mt-2">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </span>
            ) : 'Publish Recipe'}
          </button>
        </div>
      </div>
      <BottomNav active="profile" />
    </main>
  )
}

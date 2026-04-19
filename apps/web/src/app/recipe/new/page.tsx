'use client'
import { useState, useCallback, useRef } from 'react'
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

// Hebrew unit keywords → app unit
const HEB_UNITS: Record<string, string> = {
  'כוס': 'cup', 'כוסות': 'cup',
  'כף': 'tbsp', 'כפות': 'tbsp',
  'כפית': 'tsp', 'כפיות': 'tsp',
  'גרם': 'g', 'גר': 'g', "ג'": 'g',
  'קילוגרם': 'kg', "ק\"ג": 'kg', 'קג': 'kg',
  'מיליליטר': 'ml', "מ\"ל": 'ml',
  'ליטר': 'l',
  'חתיכה': 'piece', 'חתיכות': 'piece',
  'פרוסה': 'slice', 'פרוסות': 'slice',
  'קמצוץ': 'pinch',
  'אגד': 'bunch', 'צרור': 'bunch',
}

// Section headers in Hebrew
const INGR_HEADERS = /מצרכים|חומרים|רכיבים/
const STEP_HEADERS = /אופן\s*הכנה|הכנה|הוראות|שלבים|דרך\s*ההכנה/

function parseOcrText(raw: string): ScannedRecipe {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) return {}

  // Title: first non-trivial line (>2 chars)
  const title = lines.find(l => l.length > 2) ?? ''

  let inIngredients = false
  let inSteps = false
  const ingredients: Ingredient[] = []
  const stepLines: string[] = []
  const descLines: string[] = []

  for (const line of lines) {
    if (line === title) continue

    if (INGR_HEADERS.test(line)) { inIngredients = true; inSteps = false; continue }
    if (STEP_HEADERS.test(line)) { inSteps = true; inIngredients = false; continue }

    if (inIngredients) {
      // Try to parse quantity + unit + name
      // Match leading number (arabic or hebrew-ish) optionally followed by fraction
      const numMatch = line.match(/^([\d½¼¾⅓⅔\u215b-\u215e.,/]+)\s*/)
      let quantity = 1
      let rest = line
      if (numMatch) {
        quantity = parseFloat(numMatch[1].replace(',', '.')) || 1
        rest = line.slice(numMatch[0].length)
      }
      // Check for unit
      let unit = 'g'
      for (const [heb, eng] of Object.entries(HEB_UNITS)) {
        if (rest.startsWith(heb)) { unit = eng; rest = rest.slice(heb.length).trim(); break }
      }
      const name = rest.trim()
      if (name) ingredients.push({ id: crypto.randomUUID(), name, quantity, unit, notes: '' })
    } else if (inSteps) {
      // Strip leading numbers/dots
      const clean = line.replace(/^\d+[.)]\s*/, '')
      if (clean.length > 3) stepLines.push(clean)
    } else {
      if (line !== title && line.length > 3) descLines.push(line)
    }
  }

  const steps: Step[] = stepLines.map((instruction, i) => ({ order: i + 1, instruction, timer_mins: 0 }))
  const description = descLines.slice(0, 3).join(' ')

  return {
    title,
    description,
    ingredients: ingredients.length ? ingredients : undefined,
    steps: steps.length ? steps : undefined,
  }
}

function ScanModal({ onClose, onFill }: { onClose: () => void; onFill: (data: ScannedRecipe) => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setError(null)
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function scan() {
    if (!imageFile) return
    setScanning(true)
    setProgress(0)
    setError(null)
    try {
      const Tesseract = (await import('tesseract.js')).default
      const result = await Tesseract.recognize(imageFile, 'heb+eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
        },
      })
      const text = result.data.text
      if (!text.trim()) throw new Error('Could not read any text from this image. Try a clearer photo.')
      const parsed = parseOcrText(text)
      onFill(parsed)
      onClose()
    } catch (e) {
      setError((e as Error).message || 'Could not read the image. Try a clearer photo.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={e => e.target === e.currentTarget && !scanning && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !scanning && onClose()} />
      <div className="relative w-full bg-cream rounded-t-3xl px-5 pt-5 pb-10 z-10">
        <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-terracotta/10 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="12" rx="2" stroke="#C4684A" strokeWidth="1.4"/>
              <circle cx="10" cy="11" r="3" stroke="#C4684A" strokeWidth="1.4"/>
              <path d="M7 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke="#C4684A" strokeWidth="1.4"/>
              <path d="M14 8.5h1" stroke="#C4684A" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 className="heading-serif text-lg leading-tight">Scan recipe page</h2>
            <p className="text-xs text-clay mt-0.5">OCR will read the text and fill in the details</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">{error}</p>}

        {!preview ? (
          <div
            className="border-2 border-dashed border-black/15 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-terracotta transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>
            <div className="w-16 h-16 rounded-2xl bg-terracotta/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 6v16M6 14h16" stroke="#C4684A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-espresso">Choose a photo</p>
            <p className="text-xs text-clay text-center">Take a photo of the recipe page or upload from your camera roll</p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-cream-linen h-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Recipe scan" className="w-full h-full object-cover" />
              {scanning && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 px-6">
                  <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="text-white text-sm font-semibold">Reading text... {progress}%</p>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              {!scanning && (
                <button onClick={() => { setPreview(null); setImageFile(null) }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white text-sm">×</button>
              )}
            </div>
            {!scanning && (
              <>
                <button onClick={() => fileRef.current?.click()}
                  className="text-xs text-clay underline underline-offset-2 w-full text-center">
                  Use a different photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={scanning} className="btn-ghost flex-1 disabled:opacity-40">Cancel</button>
          <button
            onClick={scan}
            disabled={!imageFile || scanning}
            className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
            {scanning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reading recipe...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3.5h2M11 3.5h2M1 10.5h2M11 10.5h2M3.5 1v2M3.5 11v2M10.5 1v2M10.5 11v2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  <rect x="4" y="4" width="6" height="6" rx="1" stroke="white" strokeWidth="1.2"/>
                </svg>
                Scan & fill
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ScannedRecipe {
  title?: string
  description?: string
  cuisine?: string
  dietary_tags?: DietaryPref[]
  skill_level?: SkillLevel
  prep_time_mins?: number
  cook_time_mins?: number
  servings?: number
  ingredients?: Ingredient[]
  steps?: Step[]
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
  const [showScanModal, setShowScanModal] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)

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

  // Fill form from scan
  function handleScanFill(data: ScannedRecipe) {
    if (data.title) setTitle(data.title)
    if (data.description) setDescription(data.description)
    if (data.cuisine && CUISINE_LIST.includes(data.cuisine)) setCuisine(data.cuisine)
    if (data.dietary_tags?.length) setDietaryTags(data.dietary_tags.filter(t => DIETARY_OPTIONS.includes(t)))
    if (data.skill_level && SKILL_LEVELS.includes(data.skill_level)) setSkillLevel(data.skill_level)
    if (data.prep_time_mins) setPrepTime(String(data.prep_time_mins))
    if (data.cook_time_mins) setCookTime(String(data.cook_time_mins))
    if (data.servings) setServings(data.servings)
    if (data.ingredients?.length) {
      setIngredients(data.ingredients.map((ing, i) => ({
        ...ing,
        id: ing.id ?? String(i + 1),
        unit: UNITS.includes(ing.unit) ? ing.unit : 'g',
      })))
    }
    if (data.steps?.length) {
      setSteps(data.steps.map((s, i) => ({ ...s, order: i + 1, timer_mins: s.timer_mins ?? 0 })))
    }
    setScanSuccess(true)
    setTimeout(() => setScanSuccess(false), 6000)
  }

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
          {/* Scan banner */}
          {scanSuccess && (
            <div className="bg-sage/20 border border-sage/40 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-xl">✨</span>
              <div>
                <p className="text-sm font-semibold text-espresso">Recipe filled from scan!</p>
                <p className="text-xs text-clay mt-0.5">Review and edit the details below before publishing.</p>
              </div>
              <button onClick={() => setScanSuccess(false)} className="ml-auto text-clay text-lg leading-none flex-shrink-0">×</button>
            </div>
          )}

          {/* Scan CTA */}
          <button
            onClick={() => setShowScanModal(true)}
            className="w-full flex items-center gap-4 bg-gradient-to-r from-terracotta/10 to-terracotta/5 border border-terracotta/20 rounded-2xl p-4 hover:from-terracotta/15 hover:to-terracotta/8 transition-colors text-left">
            <div className="w-12 h-12 rounded-2xl bg-terracotta flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="6" width="16" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
                <circle cx="11" cy="12" r="3.5" stroke="white" strokeWidth="1.5"/>
                <path d="M8 6V5a1 1 0 011-1h4a1 1 0 011 1v1" stroke="white" strokeWidth="1.5"/>
                <path d="M15.5 9.5h1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-espresso">Scan a recipe book page</p>
              <p className="text-xs text-clay mt-0.5">Take or upload a photo — AI fills in everything automatically</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-clay">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-black/[0.06]" />
            <span className="text-[10px] text-clay font-medium uppercase tracking-wider">or fill in manually</span>
            <div className="flex-1 h-px bg-black/[0.06]" />
          </div>

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

      {showScanModal && (
        <ScanModal
          onClose={() => setShowScanModal(false)}
          onFill={handleScanFill}
        />
      )}
    </main>
  )
}

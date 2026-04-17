'use client'
import { useState } from 'react'
import type { DietaryPref } from '@dish/types'

type Meal = { name: string; description: string; prep_mins: number; calories_approx: number }
type Day = { day: string; breakfast: Meal; lunch: Meal; dinner: Meal }
type Plan = { days: Day[] }

const GOALS = [
  { id: 'balanced', label: 'Balanced & healthy', emoji: '⚖️' },
  { id: 'weight-loss', label: 'Weight loss', emoji: '🏃' },
  { id: 'muscle-gain', label: 'Muscle & protein', emoji: '💪' },
  { id: 'budget', label: 'Budget-friendly', emoji: '💰' },
  { id: 'quick', label: 'Quick meals only', emoji: '⚡' },
  { id: 'comfort', label: 'Comfort food', emoji: '🛋️' },
]

const DIETARY: { id: DietaryPref; label: string }[] = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
]

const MEAL_EMOJI: Record<string, string> = {
  breakfast: '☀️', lunch: '🌤️', dinner: '🌙',
}

export function MealPlanClient() {
  const [goal, setGoal] = useState('balanced')
  const [dietary, setDietary] = useState<DietaryPref[]>([])
  const [days, setDays] = useState(7)
  const [people, setPeople] = useState(2)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [raw, setRaw] = useState('')
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  function toggleDietary(pref: DietaryPref) {
    setDietary(d => d.includes(pref) ? d.filter(x => x !== pref) : [...d, pref])
  }

  async function generate() {
    setStatus('loading')
    setRaw('')
    setPlan(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'meal-plan', goal, dietary_prefs: dietary, days, people }),
      })
      if (!res.ok) { setStatus('error'); return }
      const reader = res.body?.getReader()
      if (!reader) { setStatus('error'); return }
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value)
        setRaw(full)
      }
      // Extract JSON
      const match = full.match(/\{[\s\S]*\}/)
      if (!match) { setStatus('error'); return }
      const json: Plan = JSON.parse(match[0])
      setPlan(json)
      setStatus('done')
      setExpandedDay(json.days[0]?.day ?? null)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done' && plan) {
    return (
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-serif text-2xl">{days}-Day Meal Plan</h1>
            <p className="text-xs text-clay mt-0.5">
              {GOALS.find(g => g.id === goal)?.emoji} {GOALS.find(g => g.id === goal)?.label}
              {dietary.length > 0 && ` · ${dietary.join(', ')}`}
              {` · ${people} ${people === 1 ? 'person' : 'people'}`}
            </p>
          </div>
          <button onClick={() => { setStatus('idle'); setPlan(null) }}
            className="btn-ghost text-xs py-2 px-3">New plan</button>
        </div>

        <div className="space-y-3">
          {plan.days.map(day => (
            <div key={day.day} className="card overflow-hidden">
              <button
                onClick={() => setExpandedDay(e => e === day.day ? null : day.day)}
                className="w-full flex items-center justify-between px-4 py-3.5">
                <span className="font-semibold text-espresso text-sm">{day.day}</span>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {(['breakfast', 'lunch', 'dinner'] as const).map(m => (
                      <span key={m} className="text-base">{MEAL_EMOJI[m]}</span>
                    ))}
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                    className={`transition-transform ${expandedDay === day.day ? 'rotate-180' : ''}`}>
                    <path d="M2 4l4 4 4-4" stroke="#7A6A62" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {expandedDay === day.day && (
                <div className="border-t border-black/[0.06]">
                  {(['breakfast', 'lunch', 'dinner'] as const).map(mealKey => {
                    const meal = day[mealKey]
                    return (
                      <div key={mealKey} className="px-4 py-3 border-b border-black/[0.04] last:border-0">
                        <div className="flex items-start gap-3">
                          <span className="text-xl mt-0.5">{MEAL_EMOJI[mealKey]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-clay uppercase tracking-wide">{mealKey}</p>
                              <div className="flex items-center gap-2 text-[10px] text-clay flex-shrink-0">
                                {meal.prep_mins > 0 && <span>⏱ {meal.prep_mins}m</span>}
                                {meal.calories_approx > 0 && <span>~{meal.calories_approx} kcal</span>}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-espresso mt-0.5">{meal.name}</p>
                            <p className="text-xs text-clay leading-relaxed mt-0.5">{meal.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Shopping list CTA */}
        <div className="mt-6 p-4 card border-dashed border-terracotta/30 text-center">
          <p className="text-sm font-semibold text-espresso mb-1">Ready to shop?</p>
          <p className="text-xs text-clay mb-3">Generate a smart shopping list for this plan</p>
          <a href="/shopping" className="btn-primary text-sm inline-block">Build shopping list</a>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-7">
        <h1 className="heading-serif text-2xl mb-1">Meal Plan Generator</h1>
        <p className="text-sm text-clay">AI builds your week of meals around your goals.</p>
      </div>

      {/* Goal */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-clay uppercase tracking-widest mb-3">Your goal</p>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button key={g.id} onClick={() => setGoal(g.id)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${goal === g.id ? 'border-terracotta bg-terracotta/5' : 'border-black/10 bg-white hover:border-terracotta/30'}`}>
              <span className="text-xl">{g.emoji}</span>
              <span className={`text-xs font-medium leading-tight ${goal === g.id ? 'text-espresso' : 'text-clay'}`}>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dietary */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-clay uppercase tracking-widest mb-3">Dietary preferences</p>
        <div className="flex flex-wrap gap-2">
          {DIETARY.map(d => (
            <button key={d.id} onClick={() => toggleDietary(d.id)}
              className={`text-sm px-4 py-2 rounded-full border transition-all ${dietary.includes(d.id) ? 'border-terracotta bg-terracotta/10 text-terracotta' : 'border-black/10 text-clay hover:border-terracotta/30'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days + people */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-[10px] text-clay uppercase tracking-widest mb-2">Days</p>
          <div className="flex items-center justify-between">
            <button onClick={() => setDays(d => Math.max(3, d - 1))} className="w-8 h-8 rounded-full bg-cream-linen text-espresso flex items-center justify-center text-lg">−</button>
            <span className="text-xl font-bold text-espresso">{days}</span>
            <button onClick={() => setDays(d => Math.min(14, d + 1))} className="w-8 h-8 rounded-full bg-cream-linen text-espresso flex items-center justify-center text-lg">+</button>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-[10px] text-clay uppercase tracking-widest mb-2">People</p>
          <div className="flex items-center justify-between">
            <button onClick={() => setPeople(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-full bg-cream-linen text-espresso flex items-center justify-center text-lg">−</button>
            <span className="text-xl font-bold text-espresso">{people}</span>
            <button onClick={() => setPeople(p => Math.min(8, p + 1))} className="w-8 h-8 rounded-full bg-cream-linen text-espresso flex items-center justify-center text-lg">+</button>
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={status === 'loading'}
        className="btn-primary w-full py-4 text-base disabled:opacity-60">
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Building your plan…
          </span>
        ) : `Generate ${days}-day meal plan`}
      </button>

      {status === 'loading' && raw && (
        <p className="text-center text-xs text-clay mt-3 animate-pulse">
          {raw.length < 50 ? 'Thinking…' : 'Almost there…'}
        </p>
      )}

      {status === 'error' && (
        <p className="text-center text-sm text-red-400 mt-3">
          Something went wrong. <button onClick={() => setStatus('idle')} className="underline">Try again</button>
        </p>
      )}
    </div>
  )
}

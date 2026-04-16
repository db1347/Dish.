'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { DietaryPref, SkillLevel } from '@dish/types'

const DIETARY_OPTIONS: { value: DietaryPref; label: string; emoji: string }[] = [
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
  { value: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { value: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { value: 'keto', label: 'Keto', emoji: '🥑' },
  { value: 'paleo', label: 'Paleo', emoji: '🍖' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
]

const CUISINE_OPTIONS = [
  { value: 'Italian', emoji: '🍝' },
  { value: 'Asian', emoji: '🍜' },
  { value: 'Mexican', emoji: '🌮' },
  { value: 'Mediterranean', emoji: '🫒' },
  { value: 'Indian', emoji: '🍛' },
  { value: 'French', emoji: '🥐' },
  { value: 'American', emoji: '🍔' },
  { value: 'Middle Eastern', emoji: '🧆' },
  { value: 'Japanese', emoji: '🍱' },
  { value: 'Thai', emoji: '🍲' },
]

const SKILL_OPTIONS: { value: SkillLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'I follow recipes step-by-step', emoji: '🌿' },
  { value: 'intermediate', label: 'Home Cook', desc: 'I can improvise a bit', emoji: '🍳' },
  { value: 'advanced', label: 'Confident Chef', desc: 'I experiment freely', emoji: '👨‍🍳' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPref[]>([])
  const [cuisinePrefs, setCuisinePrefs] = useState<string[]>([])
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner')
  const [saving, setSaving] = useState(false)

  function toggleDietary(val: DietaryPref) {
    setDietaryPrefs(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])
  }

  function toggleCuisine(val: string) {
    setCuisinePrefs(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val])
  }

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({
        dietary_prefs: dietaryPrefs,
        cuisine_prefs: cuisinePrefs,
        skill_level: skillLevel,
      }).eq('id', user.id)
    }
    router.push('/')
  }

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-14 pb-8">
        {[1, 2, 3].map(n => (
          <div key={n} className={`rounded-full transition-all duration-300 ${n === step ? 'w-6 h-2 bg-terracotta' : n < step ? 'w-2 h-2 bg-terracotta/40' : 'w-2 h-2 bg-black/10'}`} />
        ))}
      </div>

      <div className="flex-1 px-5 overflow-y-auto pb-32">
        {step === 1 && (
          <div>
            <p className="text-[11px] font-semibold text-terracotta uppercase tracking-widest mb-2">Step 1 of 3</p>
            <h1 className="heading-serif text-3xl mb-2">Any dietary needs?</h1>
            <p className="text-sm text-clay mb-8">We&apos;ll tailor recipe suggestions just for you. Select all that apply.</p>
            <div className="grid grid-cols-2 gap-3">
              {DIETARY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => toggleDietary(opt.value)}
                  className={`card p-4 flex items-center gap-3 transition-all active:scale-[0.97] ${dietaryPrefs.includes(opt.value) ? 'border-terracotta bg-terracotta/5' : 'hover:border-black/15'}`}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-sm font-semibold ${dietaryPrefs.includes(opt.value) ? 'text-terracotta' : 'text-espresso'}`}>{opt.label}</span>
                  {dietaryPrefs.includes(opt.value) && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-clay text-center mt-6">No restrictions? Just tap Next!</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-[11px] font-semibold text-terracotta uppercase tracking-widest mb-2">Step 2 of 3</p>
            <h1 className="heading-serif text-3xl mb-2">Favourite cuisines?</h1>
            <p className="text-sm text-clay mb-8">Pick the cuisines that make your mouth water.</p>
            <div className="grid grid-cols-2 gap-3">
              {CUISINE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => toggleCuisine(opt.value)}
                  className={`card p-4 flex items-center gap-3 transition-all active:scale-[0.97] ${cuisinePrefs.includes(opt.value) ? 'border-terracotta bg-terracotta/5' : 'hover:border-black/15'}`}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-sm font-semibold ${cuisinePrefs.includes(opt.value) ? 'text-terracotta' : 'text-espresso'}`}>{opt.value}</span>
                  {cuisinePrefs.includes(opt.value) && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-[11px] font-semibold text-terracotta uppercase tracking-widest mb-2">Step 3 of 3</p>
            <h1 className="heading-serif text-3xl mb-2">Cooking skill level?</h1>
            <p className="text-sm text-clay mb-8">We&apos;ll match recipes to your comfort zone.</p>
            <div className="flex flex-col gap-4">
              {SKILL_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setSkillLevel(opt.value)}
                  className={`card p-5 flex items-center gap-4 transition-all active:scale-[0.97] text-left ${skillLevel === opt.value ? 'border-terracotta bg-terracotta/5' : 'hover:border-black/15'}`}>
                  <span className="text-4xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${skillLevel === opt.value ? 'text-terracotta' : 'text-espresso'}`}>{opt.label}</p>
                    <p className="text-xs text-clay mt-0.5">{opt.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${skillLevel === opt.value ? 'border-terracotta bg-terracotta' : 'border-black/20'}`}>
                    {skillLevel === opt.value && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 inset-x-0 bg-cream/95 backdrop-blur-sm border-t border-black/[0.06] px-5 py-4 pb-safe">
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">Back</button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1">Next</button>
          ) : (
            <button onClick={finish} disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up...
                </span>
              ) : 'Start cooking! 🍳'}
            </button>
          )}
        </div>
        {step === 1 && (
          <button onClick={() => setStep(2)} className="w-full text-center text-xs text-clay mt-3">
            Skip for now
          </button>
        )}
      </div>
    </main>
  )
}

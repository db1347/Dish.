'use client'
import { useState } from 'react'
import type { Recipe } from '@dish/types'

type ShopItem = { name: string; amount: string; checked: boolean }
type Category = { name: string; items: ShopItem[] }
type ShoppingList = { categories: Category[] }

const CATEGORY_EMOJI: Record<string, string> = {
  'Produce': '🥬', 'Dairy': '🧀', 'Meat & Fish': '🥩', 'Pantry': '🫙',
  'Bakery': '🍞', 'Frozen': '❄️', 'Other': '🛒',
}

export function ShoppingClient({ savedRecipes }: { savedRecipes: Recipe[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [list, setList] = useState<ShoppingList | null>(null)
  const [manualIngredients, setManualIngredients] = useState('')

  function toggleRecipe(id: string) {
    setSelected(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function generate() {
    const pickedRecipes = savedRecipes.filter(r => selected.has(r.id))
    // Also parse manual ingredients into a fake "recipe"
    const extras = manualIngredients.trim()
      ? [{ title: 'Extra items', servings: 1, ingredients: manualIngredients.split('\n').filter(Boolean).map((line, i) => ({ id: String(i), name: line.trim(), quantity: 1, unit: '', notes: '' })) }]
      : []

    const allRecipes = [...pickedRecipes, ...extras]
    if (allRecipes.length === 0) return

    setStatus('loading')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'shopping-list', recipes: allRecipes }),
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
      }
      const match = full.match(/\{[\s\S]*\}/)
      if (!match) { setStatus('error'); return }
      setList(JSON.parse(match[0]))
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  function toggleItem(catIdx: number, itemIdx: number) {
    if (!list) return
    setList(prev => {
      if (!prev) return prev
      const next = { ...prev, categories: prev.categories.map((c, ci) =>
        ci !== catIdx ? c : {
          ...c, items: c.items.map((it, ii) =>
            ii !== itemIdx ? it : { ...it, checked: !it.checked }
          )
        }
      )}
      return next
    })
  }

  const total = list?.categories.reduce((s, c) => s + c.items.length, 0) ?? 0
  const checked = list?.categories.reduce((s, c) => s + c.items.filter(i => i.checked).length, 0) ?? 0

  if (status === 'done' && list) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="heading-serif text-2xl">Shopping List</h1>
          <button onClick={() => { setStatus('idle'); setList(null) }} className="btn-ghost text-xs py-2 px-3">New list</button>
        </div>
        <p className="text-xs text-clay mb-6">{checked}/{total} items checked</p>

        {/* Progress */}
        <div className="h-1.5 bg-cream-linen rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-sage rounded-full transition-all duration-300"
            style={{ width: total > 0 ? `${(checked / total) * 100}%` : '0%' }} />
        </div>

        <div className="space-y-5">
          {list.categories.map((cat, ci) => {
            const catChecked = cat.items.every(i => i.checked)
            return (
              <div key={ci}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{CATEGORY_EMOJI[cat.name] ?? '🛒'}</span>
                  <span className={`text-xs font-semibold uppercase tracking-widest ${catChecked ? 'line-through text-clay/50' : 'text-clay'}`}>{cat.name}</span>
                  <span className="text-[10px] text-clay/60">({cat.items.filter(i => !i.checked).length} left)</span>
                </div>
                <div className="card divide-y divide-black/[0.04] overflow-hidden">
                  {cat.items.map((item, ii) => (
                    <button key={ii} onClick={() => toggleItem(ci, ii)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-linen/50 transition-colors text-left">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.checked ? 'bg-sage border-sage' : 'border-black/20'}`}>
                        {item.checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm flex-1 transition-all ${item.checked ? 'line-through text-clay/50' : 'text-espresso'}`}>{item.name}</span>
                      <span className="text-xs text-clay flex-shrink-0">{item.amount}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {checked === total && total > 0 && (
          <div className="mt-8 text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-semibold text-espresso">All done! Time to cook.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-7">
        <h1 className="heading-serif text-2xl mb-1">Shopping List</h1>
        <p className="text-sm text-clay">Pick recipes and AI consolidates your ingredients.</p>
      </div>

      {/* Saved recipes to pick from */}
      {savedRecipes.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-clay uppercase tracking-widest mb-3">From your saved recipes</p>
          <div className="space-y-2">
            {savedRecipes.map(r => (
              <button key={r.id} onClick={() => toggleRecipe(r.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${selected.has(r.id) ? 'border-terracotta bg-terracotta/5' : 'border-black/10 bg-white hover:border-terracotta/30'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected.has(r.id) ? 'bg-terracotta border-terracotta' : 'border-black/20'}`}>
                  {selected.has(r.id) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${selected.has(r.id) ? 'text-espresso' : 'text-clay'}`}>{r.title}</p>
                  <p className="text-[10px] text-clay/70">{r.ingredients.length} ingredients · serves {r.servings}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual entry */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-clay uppercase tracking-widest mb-3">Or type ingredients manually</p>
        <textarea
          value={manualIngredients}
          onChange={e => setManualIngredients(e.target.value)}
          placeholder={"2 tbsp olive oil\n500g chicken breast\n1 lemon\n..."}
          rows={5}
          className="input-base text-sm resize-none"
        />
        <p className="text-[10px] text-clay mt-1">One ingredient per line</p>
      </div>

      <button
        onClick={generate}
        disabled={status === 'loading' || (selected.size === 0 && !manualIngredients.trim())}
        className="btn-primary w-full py-4 text-base disabled:opacity-60">
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Building list…
          </span>
        ) : `Build shopping list${selected.size > 0 ? ` (${selected.size} recipe${selected.size > 1 ? 's' : ''})` : ''}`}
      </button>

      {status === 'error' && (
        <p className="text-center text-sm text-red-400 mt-3">
          Something went wrong. <button onClick={() => setStatus('idle')} className="underline">Try again</button>
        </p>
      )}
    </div>
  )
}

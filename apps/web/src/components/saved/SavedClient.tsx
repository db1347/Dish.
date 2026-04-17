'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Recipe } from '@dish/types'

interface CollectionRecipe {
  recipe_id: string
  added_at: string
  recipes: Recipe
}

interface Collection {
  id: string
  name: string
  is_public: boolean
  created_at: string
  collection_recipes: CollectionRecipe[]
}

function NewCollectionModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (c: Collection) => void
}) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create() {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.message); setSaving(false); return }
    onCreate({ ...json.collection, collection_recipes: [] })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-cream rounded-t-3xl px-5 pt-5 pb-10 z-10">
        <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mb-5" />
        <h2 className="heading-serif text-xl mb-4">New Collection</h2>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && create()}
          placeholder="e.g. Weeknight dinners, Desserts..."
          className="input-base mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={create} disabled={!name.trim() || saving} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SavedClient({ initialCollections }: { initialCollections: Collection[] }) {
  const [collections, setCollections] = useState(initialCollections)
  const [activeCollId, setActiveCollId] = useState<string>(initialCollections[0]?.id ?? '')
  const [showNewModal, setShowNewModal] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const activeCollection = collections.find(c => c.id === activeCollId) ?? collections[0]
  const recipes = activeCollection?.collection_recipes
    ?.map(cr => cr.recipes)
    .filter(Boolean) ?? []

  async function removeRecipe(collectionId: string, recipeId: string) {
    setRemoving(recipeId)
    const res = await fetch('/api/collections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection_id: collectionId, recipe_id: recipeId }),
    })
    if (res.ok) {
      setCollections(prev => prev.map(c =>
        c.id === collectionId
          ? { ...c, collection_recipes: c.collection_recipes.filter(cr => cr.recipe_id !== recipeId) }
          : c
      ))
    }
    setRemoving(null)
  }

  function handleCreate(collection: Collection) {
    setCollections(prev => [...prev, collection])
    setActiveCollId(collection.id)
  }

  const totalSaved = collections.reduce((sum, c) => sum + (c.collection_recipes?.length ?? 0), 0)

  return (
    <>
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h1 className="heading-serif text-xl">Saved</h1>
          <p className="text-xs text-clay mt-0.5">{totalSaved} recipe{totalSaved !== 1 ? 's' : ''} saved</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 btn-ghost text-xs py-2 px-3">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New list
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div className="text-5xl mb-4">🔖</div>
          <h2 className="heading-serif text-xl mb-2">Nothing saved yet</h2>
          <p className="text-sm text-clay mb-6">Tap the heart on any recipe to save it here.</p>
          <Link href="/explore" className="btn-primary text-sm">Find recipes to save</Link>
        </div>
      ) : (
        <>
          {/* Collection tabs */}
          {collections.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
              {collections.map(c => (
                <button key={c.id} onClick={() => setActiveCollId(c.id)}
                  className={`flex-shrink-0 tag-pill text-xs border transition-colors ${activeCollId === c.id ? 'bg-espresso text-white border-espresso' : 'bg-white border-black/10 text-clay'}`}>
                  {c.name}
                  <span className="ml-1.5 opacity-60">({c.collection_recipes?.length ?? 0})</span>
                </button>
              ))}
            </div>
          )}

          {/* Recipe grid */}
          <div className="px-4">
            {recipes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {recipes.map(r => (
                  <div key={r.id} className="relative group">
                    <Link href={`/recipe/${r.id}`} className="card block overflow-hidden hover:border-black/15 transition-colors">
                      <div className="relative w-full h-[110px] bg-cream-linen">
                        {r.cover_image_url ? (
                          <Image src={r.cover_image_url} alt={r.title} fill sizes="50vw" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-light/40 to-terracotta/20">
                            <span className="text-3xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h3 className="text-[11px] font-semibold text-espresso leading-tight mb-1 line-clamp-2">{r.title}</h3>
                        <p className="text-[9px] text-clay truncate">{r.author?.display_name ?? r.author?.username}</p>
                      </div>
                    </Link>
                    {/* Remove button */}
                    <button
                      onClick={() => removeRecipe(activeCollId, r.id)}
                      disabled={removing === r.id}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 active:opacity-100">
                      {removing === r.id ? '…' : '×'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">📂</div>
                <p className="text-sm font-medium text-espresso mb-1">This list is empty</p>
                <p className="text-xs text-clay mb-5">Save recipes and they&apos;ll appear here.</p>
                <Link href="/explore" className="btn-primary text-sm">Find recipes</Link>
              </div>
            )}
          </div>
        </>
      )}

      {showNewModal && (
        <NewCollectionModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  )
}

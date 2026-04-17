'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { EditProfileModal } from './EditProfileModal'
import { RecipeCard } from '@/components/feed/RecipeCard'
import type { Recipe, User } from '@dish/types'

interface CollectionWithRecipes {
  id: string
  name: string
  collection_recipes: Array<{ recipe_id: string; recipes: Recipe }>
}

export function MyProfileClient({
  profile: initialProfile,
  recipes,
  collections,
}: {
  profile: User
  recipes: Recipe[]
  collections: CollectionWithRecipes[]
}) {
  const [profile, setProfile] = useState(initialProfile)
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState<'recipes' | 'saved'>('recipes')

  if (!profile) return null

  const savedRecipes = collections.flatMap(c =>
    (c.collection_recipes ?? []).map((cr) => cr.recipes).filter(Boolean)
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-terracotta/20 via-cream-linen to-sage/10 px-5 pt-8 pb-6">
        <div className="flex items-end gap-4 mb-4">
          <div className="relative w-20 h-20 rounded-[22px] overflow-hidden bg-cream-linen border-2 border-white shadow-sm flex-shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.display_name} fill sizes="80px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-terracotta/20 to-cream-linen font-bold text-espresso">
                {profile.display_name[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="heading-serif text-xl leading-tight">{profile.display_name}</h2>
            <p className="text-xs text-clay mt-0.5">@{profile.username}</p>
          </div>
          <button onClick={() => setShowEdit(true)}
            className="btn-ghost text-xs py-2 px-4 flex-shrink-0">
            Edit
          </button>
        </div>

        {profile.bio && (
          <p className="text-sm text-espresso/80 leading-relaxed mb-4">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Recipes', value: profile.recipe_count ?? recipes.length },
            { label: 'Followers', value: profile.follower_count ?? 0 },
            { label: 'Following', value: profile.following_count ?? 0 },
            { label: 'Avg ★', value: (profile.avg_rating ?? 0).toFixed(1) },
          ].map(({ label, value }) => (
            <div key={label} className="card p-3 text-center">
              <div className="text-lg font-bold text-espresso leading-tight">{value}</div>
              <div className="text-[9px] text-clay mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* New recipe CTA */}
      <div className="px-4 mt-4">
        <Link href="/recipe/new" className="btn-primary flex items-center justify-center gap-2 w-full py-3 text-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Share a new recipe
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/[0.06] mt-4 px-4">
        <button onClick={() => setActiveTab('recipes')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'recipes' ? 'text-terracotta border-b-2 border-terracotta' : 'text-clay'}`}>
          Recipes ({recipes.length})
        </button>
        <button onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'saved' ? 'text-terracotta border-b-2 border-terracotta' : 'text-clay'}`}>
          Saved ({savedRecipes.length})
        </button>
      </div>

      {/* Content */}
      <div className="px-3 mt-3">
        {activeTab === 'recipes' && (
          recipes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">🍳</div>
              <h3 className="heading-serif text-lg mb-2">Share your first recipe</h3>
              <p className="text-sm text-clay mb-6">Let the world taste your cooking.</p>
              <Link href="/recipe/new" className="btn-primary text-sm">Create recipe</Link>
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedRecipes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {savedRecipes.map(r => r && <RecipeCard key={r.id} recipe={r} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">🔖</div>
              <h3 className="heading-serif text-lg mb-2">Nothing saved yet</h3>
              <p className="text-sm text-clay mb-6">Bookmark recipes you love.</p>
              <Link href="/explore" className="btn-primary text-sm">Find recipes</Link>
            </div>
          )
        )}
      </div>

      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => setProfile(p => ({ ...p, ...updated }))}
        />
      )}
    </div>
  )
}

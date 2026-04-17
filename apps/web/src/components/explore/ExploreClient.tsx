'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { RecipeCard } from '@/components/feed/RecipeCard'
import { FollowButton } from '@/components/profile/FollowButton'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Recipe } from '@dish/types'

const CUISINES = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'French', 'American', 'Japanese', 'Thai']
const DIETARY = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto']
const SKILLS = ['beginner', 'intermediate', 'advanced']
const TIME_FILTERS = [
  { label: 'Any time', value: 0 },
  { label: '< 20 min', value: 20 },
  { label: '< 30 min', value: 30 },
  { label: '< 60 min', value: 60 },
]

interface Chef {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  follower_count: number
  recipe_count: number
}

export function ExploreClient() {
  const [query, setQuery] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [dietary, setDietary] = useState('')
  const [skill, setSkill] = useState('')
  const [maxTime, setMaxTime] = useState(0)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [topChefs, setTopChefs] = useState<Chef[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const fetchResults = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (cuisine) params.set('cuisine', cuisine)
    if (dietary) params.set('dietary', dietary)
    if (skill) params.set('skill', skill)
    if (maxTime) params.set('max_time', String(maxTime))
    const res = await fetch(`/api/search?${params}`)
    if (res.ok) {
      const data = await res.json()
      setRecipes(data.recipes ?? [])
      setTopChefs(data.topChefs ?? [])
    }
    setLoading(false)
  }, [query, cuisine, dietary, skill, maxTime])

  useEffect(() => {
    const t = setTimeout(fetchResults, query ? 350 : 0)
    return () => clearTimeout(t)
  }, [fetchResults, query])

  const hasFilters = !!(cuisine || dietary || skill || maxTime > 0)
  const isSearching = !!query

  return (
    <>
      {/* Sticky search + filter bar — offset below TopBar (~57px) */}
      <div className="sticky top-[57px] z-30 bg-cream/95 backdrop-blur-sm px-4 py-3 border-b border-black/[0.06]">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#7A6A62" strokeWidth="1.4"/>
            <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="#7A6A62" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search recipes, cuisines, ingredients..."
            className="input-base pl-9 pr-10"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-clay text-lg leading-none">×</button>
          )}
        </div>

        {/* Quick cuisine pills + filter toggle */}
        <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex-shrink-0 flex items-center gap-1.5 tag-pill text-xs border transition-colors ${hasFilters ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-black/10 text-clay'}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Filters{hasFilters ? ' •' : ''}
          </button>
          {CUISINES.slice(0, 5).map(c => (
            <button key={c} onClick={() => setCuisine(cuisine === c ? '' : c)}
              className={`flex-shrink-0 tag-pill text-xs border transition-colors ${cuisine === c ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-black/10 text-clay'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded filters drawer */}
      {showFilters && (
        <div className="bg-white border-b border-black/[0.06] px-4 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-clay uppercase tracking-wider mb-2">Dietary</p>
            <div className="flex gap-2 flex-wrap">
              {DIETARY.map(d => (
                <button key={d} onClick={() => setDietary(dietary === d ? '' : d)}
                  className={`tag-pill text-xs border transition-colors capitalize ${dietary === d ? 'bg-terracotta text-white border-terracotta' : 'bg-cream-linen border-transparent text-clay'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-clay uppercase tracking-wider mb-2">Skill Level</p>
            <div className="flex gap-2">
              {SKILLS.map(s => (
                <button key={s} onClick={() => setSkill(skill === s ? '' : s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${skill === s ? 'bg-terracotta text-white border-terracotta' : 'bg-cream-linen border-transparent text-clay'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-clay uppercase tracking-wider mb-2">Max Cook Time</p>
            <div className="flex gap-2 flex-wrap">
              {TIME_FILTERS.map(({ label, value }) => (
                <button key={value} onClick={() => setMaxTime(maxTime === value ? 0 : value)}
                  className={`tag-pill text-xs border transition-colors ${maxTime === value && value > 0 ? 'bg-terracotta text-white border-terracotta' : 'bg-cream-linen border-transparent text-clay'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <button onClick={() => { setCuisine(''); setDietary(''); setSkill(''); setMaxTime(0) }}
              className="text-xs text-terracotta font-medium">Clear all filters</button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="px-4 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Top chefs — shown when idle */}
            {!isSearching && topChefs.length > 0 && (
              <section className="px-4 pt-4 pb-2">
                <h2 className="text-[13px] font-semibold text-espresso mb-3">Top chefs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topChefs.map(chef => (
                    <div key={chef.id} className="flex items-center gap-3">
                      <Link href={`/profile/${chef.username}`}
                        className="w-10 h-10 rounded-full bg-cream-linen overflow-hidden flex items-center justify-center text-sm font-bold text-espresso flex-shrink-0">
                        {chef.avatar_url
                          ? <Image src={chef.avatar_url} alt={chef.display_name} width={40} height={40} className="w-full h-full object-cover" />
                          : chef.display_name[0]?.toUpperCase()
                        }
                      </Link>
                      <Link href={`/profile/${chef.username}`} className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-espresso truncate">{chef.display_name}</p>
                        <p className="text-[10px] text-clay">@{chef.username} · {chef.follower_count} followers</p>
                      </Link>
                      <FollowButton targetUserId={chef.id} initialFollowing={false} currentUserId={null} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="px-4 pt-4">
              {recipes.length > 0 ? (
                <>
                  {isSearching && (
                    <p className="text-xs text-clay mb-3">
                      {recipes.length} result{recipes.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                    </p>
                  )}
                  {!isSearching && !hasFilters && (
                    <h2 className="text-[13px] font-semibold text-espresso mb-3">Trending recipes</h2>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="heading-serif text-xl mb-2">No recipes found</h3>
                  <p className="text-sm text-clay mb-6">
                    {isSearching ? `Nothing matched "${query}". Try different keywords.` : 'Try adjusting your filters.'}
                  </p>
                  {(isSearching || hasFilters) && (
                    <button
                      onClick={() => { setQuery(''); setCuisine(''); setDietary(''); setSkill(''); setMaxTime(0) }}
                      className="btn-primary text-sm">
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}

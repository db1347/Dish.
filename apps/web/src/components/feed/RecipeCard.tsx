import Link from 'next/link'
import Image from 'next/image'
import type { Recipe } from '@dish/types'

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalMins = recipe.prep_time_mins + recipe.cook_time_mins
  return (
    <Link href={`/recipe/${recipe.id}`} className="card block hover:border-black/15 transition-colors">
      <div className="relative w-full h-[110px] overflow-hidden rounded-t-2xl bg-cream-linen">
        {recipe.cover_image_url ? (
          <Image src={recipe.cover_image_url} alt={recipe.title} fill sizes="50vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-light/40 to-terracotta/20">
            <span className="text-3xl">🍽️</span>
          </div>
        )}
        {recipe.is_ai_generated && (
          <span className="absolute top-2 left-2 bg-white/90 text-terracotta text-[9px] font-semibold px-2 py-0.5 rounded-full">AI</span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-[11px] font-semibold text-espresso leading-tight mb-1 line-clamp-2">{recipe.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-clay truncate max-w-[70%]">{recipe.author?.display_name ?? recipe.author?.username}</span>
          <span className="text-[9px] text-terracotta font-semibold">★ {recipe.avg_rating.toFixed(1)}</span>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {totalMins > 0 && <span className="tag-pill bg-cream-linen text-clay text-[9px]">{totalMins}m</span>}
          {recipe.dietary_tags[0] && <span className="tag-pill bg-sage/15 text-sage-dark text-[9px] capitalize">{recipe.dietary_tags[0]}</span>}
        </div>
      </div>
    </Link>
  )
}

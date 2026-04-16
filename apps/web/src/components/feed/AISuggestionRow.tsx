import Link from 'next/link'
import Image from 'next/image'
import type { Recipe } from '@dish/types'

export function AISuggestionRow({ recipes }: { recipes: Recipe[] }) {
  if (!recipes.length) return null
  return (
    <section className="mt-3 mb-1">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <h2 className="text-[13px] font-semibold text-espresso">AI suggestions</h2>
        </div>
        <Link href="/generate" className="text-[11px] text-terracotta font-medium">Try AI →</Link>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
        {recipes.map((r) => (
          <Link key={r.id} href={`/recipe/${r.id}`}
            className="flex-shrink-0 w-44 card overflow-hidden hover:border-black/15 transition-colors">
            <div className="relative w-full h-24 bg-cream-linen">
              {r.cover_image_url ? (
                <Image src={r.cover_image_url} alt={r.title} fill sizes="176px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-light/40 to-terracotta/20">
                  <span className="text-3xl">🍽️</span>
                </div>
              )}
              <span className="absolute top-2 left-2 bg-white/90 text-terracotta text-[9px] font-semibold px-2 py-0.5 rounded-full">AI</span>
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-semibold text-espresso leading-tight line-clamp-2 mb-1">{r.title}</p>
              <p className="text-[9px] text-clay truncate">{r.author?.display_name ?? r.author?.username}</p>
            </div>
          </Link>
        ))}
        <Link href="/generate"
          className="flex-shrink-0 w-44 card flex flex-col items-center justify-center gap-2 min-h-[120px] border-dashed hover:border-terracotta/40 transition-colors">
          <div className="w-10 h-10 rounded-2xl bg-terracotta/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="#C4684A" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="3" stroke="#C4684A" strokeWidth="1.5"/>
            </svg>
          </div>
          <p className="text-[11px] font-semibold text-terracotta text-center leading-tight">Generate your<br/>own recipe</p>
        </Link>
      </div>
    </section>
  )
}

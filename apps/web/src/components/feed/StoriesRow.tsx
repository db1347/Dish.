'use client'
import Image from 'next/image'
import Link from 'next/link'

interface Story { id: string; username: string; avatar_url: string | null }

export function StoriesRow({ stories }: { stories: Story[] }) {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar">
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-[52px] h-[52px] rounded-full border-2 border-dashed border-terracotta/40 flex items-center justify-center bg-terracotta/5">
          <span className="text-terracotta text-xl font-light">+</span>
        </div>
        <span className="text-[9px] text-terracotta font-medium">Add</span>
      </div>
      {stories.length === 0
        ? ['Marco', 'Yuki', 'Ade', 'Leo'].map(name => (
            <div key={name} className="flex flex-col items-center gap-1 flex-shrink-0 opacity-40">
              <div className="w-[52px] h-[52px] rounded-full bg-cream-linen border border-black/10 flex items-center justify-center text-lg">🧑‍🍳</div>
              <span className="text-[9px] text-clay">{name}</span>
            </div>
          ))
        : stories.map(s => (
            <Link key={s.id} href={`/profile/${s.username}`} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-br from-terracotta to-terracotta-light">
                <div className="w-full h-full rounded-full border-2 border-cream overflow-hidden bg-cream-linen">
                  {s.avatar_url
                    ? <Image src={s.avatar_url} alt={s.username} width={48} height={48} className="object-cover w-full h-full" />
                    : <div className="w-full h-full flex items-center justify-center bg-terracotta-light/30 text-terracotta font-semibold text-sm">{s.username[0].toUpperCase()}</div>
                  }
                </div>
              </div>
              <span className="text-[9px] text-clay text-center max-w-[52px] truncate">{s.username}</span>
            </Link>
          ))}
    </div>
  )
}

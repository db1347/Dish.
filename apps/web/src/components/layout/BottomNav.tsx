'use client'
import Link from 'next/link'

type NavItem = 'home' | 'explore' | 'generate' | 'saved' | 'profile'
const C = { active: '#C4684A', muted: '#7A6A62' }

export function BottomNav({ active }: { active: NavItem }) {
  const items = [
    { key: 'home', href: '/', label: 'Home', icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 10L11 3l8 7v10H14v-6H8v6H3V10z" stroke={a ? C.active : C.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill={a ? C.active : 'none'} fillOpacity={a ? 0.12 : 0}/>
      </svg>
    )},
    { key: 'explore', href: '/explore', label: 'Explore', icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="10" cy="10" r="6.5" stroke={a ? C.active : C.muted} strokeWidth="1.4"/>
        <line x1="15" y1="15" x2="19" y2="19" stroke={a ? C.active : C.muted} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    )},
    { key: 'saved', href: '/saved', label: 'Saved', icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M6 3h10a1 1 0 011 1v15l-7-3.5L3 19V4a1 1 0 011-1z" stroke={a ? C.active : C.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill={a ? C.active : 'none'} fillOpacity={a ? 0.12 : 0}/>
      </svg>
    )},
    { key: 'profile', href: '/profile', label: 'Profile', icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke={a ? C.active : C.muted} strokeWidth="1.4" fill={a ? C.active : 'none'} fillOpacity={a ? 0.12 : 0}/>
        <path d="M3 19c0-4.5 16-4.5 16 0" stroke={a ? C.active : C.muted} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    )},
  ] as const

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-sm border-t border-black/[0.08] pb-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {(items.slice(0,2) as typeof items[number][]).map(item => (
          <Link key={item.key} href={item.href} className="flex flex-col items-center gap-1 flex-1 py-1">
            {item.icon(active === item.key)}
            <span className={`text-[9px] font-medium ${active === item.key ? 'text-terracotta' : 'text-clay'}`}>{item.label}</span>
          </Link>
        ))}
        <div className="flex flex-col items-center flex-1">
          <Link href="/generate" className="w-12 h-12 bg-terracotta rounded-[16px] flex items-center justify-center -mt-5 hover:bg-terracotta-dark active:scale-95 transition-all">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="3.5" stroke="white" strokeWidth="1.5"/>
            </svg>
          </Link>
          <span className="text-[9px] font-medium text-terracotta mt-1">AI</span>
        </div>
        {(items.slice(2) as typeof items[number][]).map(item => (
          <Link key={item.key} href={item.href} className="flex flex-col items-center gap-1 flex-1 py-1">
            {item.icon(active === item.key)}
            <span className={`text-[9px] font-medium ${active === item.key ? 'text-terracotta' : 'text-clay'}`}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

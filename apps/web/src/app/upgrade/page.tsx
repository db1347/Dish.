import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'

const FEATURES = [
  { emoji: '✨', title: 'Unlimited AI recipes', desc: 'Generate as many recipes as you want, every day.' },
  { emoji: '🎯', title: 'Personalised meal plans', desc: 'Get weekly meal plans tailored to your preferences.' },
  { emoji: '📊', title: 'Nutrition insights', desc: 'Detailed macros and nutritional info for every recipe.' },
  { emoji: '🏷️', title: 'Premium badge', desc: 'Stand out with a premium chef badge on your profile.' },
  { emoji: '📥', title: 'Export recipes', desc: 'Download your recipes as beautiful PDFs.' },
  { emoji: '🔒', title: 'Private collections', desc: 'Keep some collections just for yourself.' },
]

export default function UpgradePage() {
  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-b from-terracotta/15 to-cream px-5 pt-14 pb-8 text-center">
          <div className="text-5xl mb-4">👨‍🍳</div>
          <h1 className="heading-serif text-3xl mb-2">dish<span className="text-terracotta">.</span> Premium</h1>
          <p className="text-sm text-clay max-w-xs mx-auto">
            Unlock the full potential of your cooking journey.
          </p>

          {/* Pricing */}
          <div className="mt-8 flex gap-3 justify-center">
            <div className="card p-5 flex-1 max-w-[150px] border-2 border-terracotta/30 bg-terracotta/5">
              <p className="text-xs font-semibold text-terracotta mb-1">Monthly</p>
              <p className="heading-serif text-2xl">$4.99</p>
              <p className="text-[10px] text-clay">per month</p>
            </div>
            <div className="card p-5 flex-1 max-w-[150px] border-2 border-terracotta bg-terracotta/10 relative overflow-hidden">
              <span className="absolute top-2 right-2 text-[9px] font-bold text-white bg-terracotta px-2 py-0.5 rounded-full">BEST VALUE</span>
              <p className="text-xs font-semibold text-terracotta mb-1">Annual</p>
              <p className="heading-serif text-2xl">$2.99</p>
              <p className="text-[10px] text-clay">per month</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-4 py-2">
          <h2 className="text-[13px] font-semibold text-espresso mb-4">Everything included</h2>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3 p-3 card">
                <span className="text-2xl flex-shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-espresso">{f.title}</p>
                  <p className="text-xs text-clay mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pt-6 pb-4">
          <div className="bg-terracotta/10 border border-terracotta/20 rounded-2xl px-4 py-4 text-center mb-4">
            <p className="text-xs text-terracotta font-medium">
              🚧 Premium subscriptions are coming soon!<br/>
              Join the waitlist to be first in line.
            </p>
          </div>
          <button className="btn-primary w-full py-4 text-base">Join the waitlist</button>
          <Link href="/" className="block text-center text-xs text-clay mt-4">Maybe later</Link>
        </div>
      </div>
      <BottomNav active="profile" />
    </main>
  )
}

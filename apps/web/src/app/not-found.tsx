import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-cream flex flex-col items-center justify-center px-8 text-center">
      <div className="text-6xl mb-6">🍽️</div>
      <h1 className="heading-serif text-3xl mb-2">404</h1>
      <h2 className="heading-serif text-xl mb-3">This page doesn&apos;t exist</h2>
      <p className="text-sm text-clay mb-8 max-w-xs">
        Looks like this recipe got lost in the kitchen. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/" className="btn-primary w-full text-center">
          Back to home
        </Link>
        <Link href="/explore" className="btn-ghost w-full text-center">
          Explore recipes
        </Link>
      </div>
    </main>
  )
}

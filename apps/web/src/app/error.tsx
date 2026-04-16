'use client'
import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-dvh bg-cream flex flex-col items-center justify-center px-8 text-center">
      <div className="text-6xl mb-6">😬</div>
      <h1 className="heading-serif text-2xl mb-2">Something went wrong</h1>
      <p className="text-sm text-clay mb-8 max-w-xs">
        We hit an unexpected snag. Don&apos;t worry — your recipes are safe.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={reset} className="btn-primary w-full">
          Try again
        </button>
        <a href="/" className="btn-ghost w-full text-center">
          Back to home
        </a>
      </div>
      {error.digest && (
        <p className="text-[10px] text-clay/50 mt-8 font-mono">{error.digest}</p>
      )}
    </main>
  )
}

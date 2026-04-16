import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-cream-linen rounded-2xl', className)} />
  )
}

export function RecipeCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="w-full h-[110px] rounded-none rounded-t-2xl" />
      <div className="p-2.5 space-y-2">
        <Skeleton className="h-3 w-4/5 rounded-lg" />
        <Skeleton className="h-3 w-3/5 rounded-lg" />
        <div className="flex gap-1 mt-1">
          <Skeleton className="h-4 w-10 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="px-5 pt-8 pb-6">
      <div className="flex items-end gap-4 mb-4">
        <Skeleton className="w-20 h-20 rounded-[22px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-3 w-full rounded-lg mb-2" />
      <Skeleton className="h-3 w-4/5 rounded-lg mb-4" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="px-3 pt-4">
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => <RecipeCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

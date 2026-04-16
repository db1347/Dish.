import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ExploreClient } from '@/components/explore/ExploreClient'

export default function ExplorePage() {
  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24">
        <ExploreClient />
      </div>
      <BottomNav active="explore" />
    </main>
  )
}

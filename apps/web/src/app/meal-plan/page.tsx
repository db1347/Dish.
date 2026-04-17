import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { MealPlanClient } from '@/components/meal-plan/MealPlanClient'

export default function MealPlanPage() {
  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24">
        <MealPlanClient />
      </div>
      <BottomNav active="explore" />
    </main>
  )
}

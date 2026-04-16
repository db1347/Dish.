import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton'

type NotifType = 'new_follower' | 'recipe_like' | 'recipe_comment' | 'recipe_rating'

interface Notification {
  id: string
  type: NotifType
  read: boolean
  created_at: string
  actor: { id: string; username: string; display_name: string; avatar_url: string | null } | null
  recipe: { id: string; title: string } | null
}

function notifText(n: Notification): string {
  const name = n.actor?.display_name ?? n.actor?.username ?? 'Someone'
  switch (n.type) {
    case 'new_follower': return `${name} started following you`
    case 'recipe_like': return `${name} saved your recipe`
    case 'recipe_comment': return `${name} commented on "${n.recipe?.title ?? 'your recipe'}"`
    case 'recipe_rating': return `${name} rated "${n.recipe?.title ?? 'your recipe'}"`
    default: return 'New notification'
  }
}

function notifHref(n: Notification): string {
  if (n.type === 'new_follower' && n.actor) return `/profile/${n.actor.username}`
  if (n.recipe) return `/recipe/${n.recipe.id}`
  return '/'
}

function notifEmoji(type: NotifType): string {
  switch (type) {
    case 'new_follower': return '👤'
    case 'recipe_like': return '🔖'
    case 'recipe_comment': return '💬'
    case 'recipe_rating': return '⭐'
    default: return '🔔'
  }
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      id, type, read, created_at,
      actor:actor_id(id, username, display_name, avatar_url),
      recipe:recipe_id(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = (notifications ?? []).filter(n => !n.read).length

  return (
    <main className="min-h-dvh bg-cream flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="heading-serif text-xl">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-clay mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <MarkAllReadButton userId={user.id} />
          )}
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="px-4 space-y-1">
            {(notifications as unknown as Notification[]).map(n => (
              <Link key={n.id} href={notifHref(n)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${n.read ? 'bg-transparent' : 'bg-terracotta/5 border border-terracotta/10'}`}>
                {/* Avatar or emoji */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-cream-linen overflow-hidden flex items-center justify-center text-sm font-bold text-espresso">
                    {n.actor?.avatar_url
                      ? <Image src={n.actor.avatar_url} alt={n.actor.display_name} width={40} height={40} className="w-full h-full object-cover" />
                      : (n.actor?.display_name[0] ?? '?').toUpperCase()
                    }
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">{notifEmoji(n.type)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-espresso leading-snug">{notifText(n)}</p>
                  <p className="text-[10px] text-clay mt-0.5">{timeAgo(n.created_at)}</p>
                </div>

                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-terracotta flex-shrink-0" />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h2 className="heading-serif text-xl mb-2">All caught up!</h2>
            <p className="text-sm text-clay mb-6">When people follow you or interact with your recipes, you&apos;ll see it here.</p>
            <Link href="/explore" className="btn-primary text-sm">Discover chefs</Link>
          </div>
        )}
      </div>
      <BottomNav active="home" />
    </main>
  )
}

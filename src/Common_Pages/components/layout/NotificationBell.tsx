import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import {
  getNotifications,
  markNotificationsRead,
  type Notification,
} from '@/Common_Pages/notifications/notifications'

const when = (iso: string) => {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Top-bar bell: shows a dot when there are unread notifications and a dropdown
// list. Opening it marks everything as read.
const NotificationBell = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const load = useCallback(async () => {
    if (!user) return
    const res = await getNotifications(user.userId)
    setItems(res.notifications)
    setUnread(res.unread)
  }, [user])

  useEffect(() => {
    load()
    const t = setInterval(load, 15000) // poll for new notifications
    return () => clearInterval(t)
  }, [load])

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0 && user) {
      await markNotificationsRead(user.userId)
      setUnread(0)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={toggle}
        className="relative rounded-lg p-2 text-emerald-100/80 transition hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-emerald-950 ring-2 ring-emerald-950">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button className="fixed inset-0 z-40 cursor-default" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-emerald-950 shadow-2xl">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
              Notifications
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-4 text-center text-sm text-emerald-200/50">No notifications yet.</p>
              ) : (
                items.map((n) => (
                  <div key={n.id} className={`border-b border-white/5 px-4 py-3 last:border-0 ${n.read ? '' : 'bg-white/5'}`}>
                    <p className="text-sm text-emerald-50">{n.message}</p>
                    <p className="mt-1 text-[11px] text-emerald-200/40">{when(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell

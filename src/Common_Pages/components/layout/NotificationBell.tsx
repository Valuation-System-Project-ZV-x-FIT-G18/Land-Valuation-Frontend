import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { getNotifications, markNotificationsRead, type Notification } from '@/Common_Pages/notifications/notifications'

const relativeTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ]
  for (const [unit, size] of ranges) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

const NotificationIcon = ({ unread }: { unread: boolean }) => (
  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${unread ? 'bg-gold-400/15 text-gold-300' : 'bg-white/5 text-emerald-200/60'}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m6.36.64-1.42 1.42M21 12h-2M5 12H3m4.06-4.94L5.64 5.64M8 16h8m-7 3h6M8.5 12a3.5 3.5 0 1 1 7 0v1.2c0 .67.27 1.32.74 1.8H7.76c.47-.48.74-1.13.74-1.8V12Z" />
    </svg>
  </span>
)

const NotificationBell = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (showLoading = false) => {
    if (!user) return { notifications: [] as Notification[], unread: 0 }
    if (showLoading) setLoading(true)
    const result = await getNotifications(user.userId)
    setItems(result.notifications)
    setUnread(result.unread)
    if (showLoading) setLoading(false)
    return result
  }, [user])

  useEffect(() => {
    load()
    const timer = window.setInterval(() => load(), 15000)
    return () => window.clearInterval(timer)
  }, [load])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const toggle = async () => {
    if (open) return setOpen(false)
    const latest = await load(true)
    setOpen(true)
    if ((latest?.unread ?? 0) > 0 && user) {
      await markNotificationsRead(user.userId)
      setUnread(0)
      setItems((current) => current.map((item) => ({ ...item, read: true })))
    }
  }

  return (
    <div className="relative">
      <button type="button" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} aria-haspopup="dialog" aria-expanded={open} onClick={toggle}
        className={`relative rounded-xl p-2 transition ${open ? 'bg-white/10 text-white' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-emerald-950 shadow-sm ring-2 ring-emerald-950">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && <>
        <button className="fixed inset-0 z-40 cursor-default" aria-label="Close notifications" onClick={() => setOpen(false)} />
        <section role="dialog" aria-label="Notifications" className="fixed inset-x-3 top-16 z-50 animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-emerald-950/95 shadow-card-hover backdrop-blur-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[380px]">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold text-white">Notifications</h2>
              <p className="mt-0.5 text-xs text-emerald-200/50">{items.length ? `${items.length} recent update${items.length === 1 ? '' : 's'}` : 'Your recent activity'}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-lg p-1.5 text-emerald-200/60 transition hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </header>

          <div className="max-h-[min(26rem,calc(100vh-7rem))] overflow-y-auto">
            {loading ? <div className="space-y-3 p-5" aria-label="Loading notifications">{[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-white/5" />)}</div>
              : items.length === 0 ? <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-emerald-200/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21h4" /></svg>
                </span>
                <p className="mt-4 text-sm font-semibold text-white">You are all caught up</p>
                <p className="mt-1 max-w-56 text-xs leading-5 text-emerald-200/50">New project and workflow updates will appear here.</p>
              </div> : <div className="divide-y divide-white/5">{items.map((notification) => (
                <article key={notification.id} className={`relative flex gap-3 px-5 py-4 transition hover:bg-white/5 ${notification.read ? '' : 'bg-gold-400/[0.04]'}`}>
                  <NotificationIcon unread={!notification.read} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2"><p className="flex-1 text-sm leading-5 text-emerald-50">{notification.message}</p>{!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-400" title="Unread" />}</div>
                    <time dateTime={notification.createdAt} title={new Date(notification.createdAt).toLocaleString()} className="mt-1.5 block text-[11px] font-medium text-emerald-200/45">{relativeTime(notification.createdAt)}</time>
                  </div>
                </article>
              ))}</div>}
          </div>
        </section>
      </>}
    </div>
  )
}

export default NotificationBell

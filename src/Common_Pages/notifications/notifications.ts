// In-site notifications shown on the top-bar bell.
// The backend reads the user from the JWT, so no user id is sent from here.

export type Notification = {
  id: number
  message: string
  read: boolean
  createdAt: string
}

export async function getNotifications(): Promise<{ notifications: Notification[]; unread: number }> {
  try {
    const res = await fetch('/api/notifications')
    if (!res.ok) return { notifications: [], unread: 0 }
    return await res.json()
  } catch {
    return { notifications: [], unread: 0 }
  }
}

export async function markNotificationsRead(): Promise<void> {
  try {
    await fetch('/api/notifications/read', { method: 'POST' })
  } catch {
    /* ignore */
  }
}

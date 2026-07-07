// In-site notifications shown on the top-bar bell.

export type Notification = {
  id: number
  message: string
  read: boolean
  createdAt: string
}

export async function getNotifications(
  userId: string,
): Promise<{ notifications: Notification[]; unread: number }> {
  try {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`)
    if (!res.ok) return { notifications: [], unread: 0 }
    return await res.json()
  } catch {
    return { notifications: [], unread: 0 }
  }
}

export async function markNotificationsRead(userId: string): Promise<void> {
  try {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
  } catch {
    /* ignore */
  }
}

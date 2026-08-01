// API calls for the Admin > User Details page.

export type RegisteredUser = {
  userId: string
  name: string
  role: string
  email: string
  phone: string
  nic: string
  province: string
  district: string
  city: string
  photoPath: string
}

export type EditableUser = {
  firstName: string
  lastName: string
  email: string
  phone: string
  province: string
  district: string
  city: string
}

export async function getUsers(): Promise<{ users: RegisteredUser[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/users')
    if (!res.ok) return { users: [], error: 'Could not load registered users.' }
    const body = await res.json()
    return { users: (body.users as RegisteredUser[]) ?? [] }
  } catch {
    return { users: [], error: 'Could not reach the server. Please try again.' }
  }
}

export async function updateUser(
  userId: string,
  data: EditableUser,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    const message = Array.isArray(body.message) ? body.message.join(' ') : (body.message as string)
    return { ok: false, error: message || 'Could not save changes.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

export async function deleteUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: (body.error as string) || 'Could not delete this user.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

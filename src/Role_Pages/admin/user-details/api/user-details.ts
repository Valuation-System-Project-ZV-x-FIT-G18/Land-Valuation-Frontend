// API calls for the Admin > User Details page.

export type RegisteredUser = {
  userId: string
  name: string
  firstName: string
  lastName: string
  role: string
  email: string
  phone: string
  nic: string
  province: string
  district: string
  city: string
  photoPath: string
  status: 'Active' | 'Suspended' | 'Deactivated'
  createdAt: string
  lastLoginAt: string | null
}

export type EditableUser = {
  firstName: string
  lastName: string
  role: string
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

// Email the user a fresh temporary password and force a change at next login.
export async function resetUserPassword(
  userId: string,
): Promise<{ ok: boolean; email?: string; error?: string }> {
  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/reset-password`, {
      method: 'POST',
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true, email: body.email as string }
    const message = Array.isArray(body.message) ? body.message.join(' ') : (body.message as string)
    return { ok: false, error: message || 'Could not reset this password.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

export async function updateUserStatus(
  userId: string,
  status: RegisteredUser['status'],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: (body.message as string) || 'Could not change this account status.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

export type AdminAuditLog = {
  id: string; actorUserId: string | null; action: string; targetUserId: string | null
  details: Record<string, unknown>; createdAt: string
}

export async function getAuditLogs(): Promise<{ logs: AdminAuditLog[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/audit-logs')
    if (!res.ok) return { logs: [], error: 'Could not load the audit log.' }
    const body = await res.json()
    return { logs: (body.logs as AdminAuditLog[]) ?? [] }
  } catch {
    return { logs: [], error: 'Could not reach the server.' }
  }
}

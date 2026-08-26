// API call for the admin "Add Role" page.
import { getApiError } from '@/Common_Pages/api/getApiError'

export type NewRole = {
  role: string
  firstName: string
  lastName: string
  nic: string
  email: string
  phone: string
  district: string
  province: string
  city: string
  postalCode: string
  address: string
  dateOfBirth: string
  branchCode: string // Bank-only internal account and branch identifier
  branchName: string // Bank only
  bankName: string // Bank only
  designation: string // Bank only — the contact person's designation
}

// Create a new staff account (POST /api/admin/roles).
export async function addRole(
  data: NewRole,
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  try {
    // Explicit allow-list prevents stale browser form fields from reaching the
    // strict backend DTO after the account form evolves.
    const payload: NewRole = {
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      nic: data.nic,
      email: data.email,
      phone: data.phone,
      district: data.district,
      province: data.province,
      city: data.city,
      postalCode: data.postalCode,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
      branchCode: data.branchCode,
      branchName: data.branchName,
      bankName: data.bankName,
      designation: data.designation,
    }
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true, userId: body.userId as string }
    return { ok: false, error: getApiError(body, 'Could not create the account. Please check the entered details.') }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

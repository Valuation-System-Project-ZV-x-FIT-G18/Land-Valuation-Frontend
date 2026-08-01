import type { EditableUser } from '@/Role_Pages/admin/user-details/api/user-details'

// Shared constants/helpers for the User Details table + edit form.

export const emailOk = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export const emptyForm: EditableUser = {
  firstName: '', lastName: '', email: '', phone: '', province: '', district: '', city: '',
}

// Colour-code each role so the table is easy to scan at a glance.
export const ROLE_TONE: Record<string, 'gold' | 'info' | 'success' | 'warning' | 'neutral'> = {
  Admin: 'gold',
  Coordinator: 'info',
  'Technical Officer': 'success',
  'Manager L1': 'warning',
  'Manager L2': 'warning',
  'Manager L3': 'warning',
  Bank: 'neutral',
  'Loan Applicant': 'neutral',
}

export const editFields: { name: keyof EditableUser; label: string; type?: string }[] = [
  { name: 'firstName', label: 'First Name *' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'province', label: 'Province' },
  { name: 'district', label: 'District' },
  { name: 'city', label: 'City' },
]

export const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-emerald-200/40 outline-none focus:border-gold-400/60'

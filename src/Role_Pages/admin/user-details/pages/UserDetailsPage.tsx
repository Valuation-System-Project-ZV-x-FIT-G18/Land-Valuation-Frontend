import { useEffect, useMemo, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Badge from '@/Common_Pages/components/ui/Badge'
import Table from '@/Common_Pages/components/ui/Table'
import Avatar from '@/Common_Pages/components/ui/Avatar'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import {
  getUsers,
  updateUser,
  deleteUser,
  type RegisteredUser,
  type EditableUser,
} from '@/Role_Pages/admin/user-details/api/user-details'
import { emailOk, emptyForm, ROLE_TONE, editFields, inputClass } from '@/Role_Pages/admin/user-details/pages/userDetailsHelpers'

// Admin > User Details. Every registered account, with edit/delete.
const UserDetailsPage = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState<RegisteredUser | null>(null)
  const [form, setForm] = useState<EditableUser>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof EditableUser, string>>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<RegisteredUser | null>(null)
  const [removing, setRemoving] = useState(false)

  const load = () => {
    setLoading(true)
    getUsers().then((res) => {
      setUsers(res.users)
      if (res.error) setNotice(res.error)
      setLoading(false)
    })
  }
  useEffect(load, [])

  if (user && user.role !== 'Admin') {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="font-semibold text-gold-200">Admins only</p>
        <p className="mt-1 text-sm text-emerald-100/70">You don&apos;t have permission to view this page.</p>
      </Card>
    )
  }

  const openEdit = (u: RegisteredUser) => {
    const [firstName, ...rest] = u.name.split(' ')
    setForm({
      firstName: firstName ?? '', lastName: rest.join(' '), email: u.email,
      phone: u.phone, province: u.province, district: u.district, city: u.city,
    })
    setErrors({})
    setEditing(u)
  }

  const validate = (f: EditableUser) => {
    const found: Partial<Record<keyof EditableUser, string>> = {}
    if (!f.firstName.trim()) found.firstName = 'First name is required.'
    if (!emailOk(f.email)) found.email = 'Enter a valid email address.'
    return found
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const found = validate(form)
    if (Object.keys(found).length > 0) { setErrors(found); return }
    setSaving(true)
    const res = await updateUser(editing.userId, form)
    setSaving(false)
    if (res.ok) {
      setNotice(`${editing.userId} was updated.`)
      setEditing(null)
      load()
    } else {
      setErrors({ firstName: res.error })
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setRemoving(true)
    const res = await deleteUser(deleting.userId)
    setRemoving(false)
    setNotice(res.ok ? `${deleting.userId} was deleted.` : (res.error ?? 'Could not delete this user.'))
    setDeleting(null)
    if (res.ok) load()
  }

  const roles = useMemo(() => Array.from(new Set(users.map((u) => u.role))).sort(), [users])
  const q = search.trim().toLowerCase()
  const filtered = users.filter(
    (u) =>
      (!roleFilter || u.role === roleFilter) &&
      (!q || `${u.userId} ${u.name} ${u.role} ${u.email} ${u.nic}`.toLowerCase().includes(q)),
  )

  const rows = filtered.map((u) => [
    <div key="name" className="flex items-center gap-3">
      <Avatar userId={u.userId} name={u.name || u.userId} photoPath={u.photoPath} size="sm" />
      <div className="min-w-0 leading-tight">
        <p className="truncate font-medium text-white">{u.name || '—'}</p>
        <p className="text-xs text-emerald-200/60">{u.userId}</p>
      </div>
    </div>,
    <Badge key="role" tone={ROLE_TONE[u.role] ?? 'neutral'}>{u.role}</Badge>,
    <span key="email" className="text-emerald-100/80">{u.email || '—'}</span>,
    u.phone || '—',
    u.district || '—',
    <div key="actions" className="flex justify-end gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(u)}>Edit</Button>
      <Button type="button" size="sm" variant="danger" disabled={u.userId === user?.userId} onClick={() => setDeleting(u)}>
        Delete
      </Button>
    </div>,
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          User <GradientText>Details</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Every registered account. Edit personal details or remove an account.
        </p>
      </div>
      {notice && <p className="text-center text-sm text-emerald-200">{notice}</p>}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-200 via-gold-300 to-amber-400" />
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-emerald-100/70">
              <span className="font-semibold text-white">{filtered.length}</span> of {users.length} registered users
            </p>
            <div className="flex gap-2 sm:w-96">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, email or NIC…"
                className={`${inputClass} flex-1`}
              />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`${inputClass} sm:w-40`}>
                <option value="" className="bg-emerald-900">All roles</option>
                {roles.map((r) => <option key={r} value={r} className="bg-emerald-900">{r}</option>)}
              </select>
            </div>
          </div>
          {loading ? (
            <p className="text-center text-sm text-emerald-200/60">Loading…</p>
          ) : (
            <Table
              columns={['User', 'Role', 'Email', 'Phone', 'District', 'Actions']}
              rows={rows}
              emptyText="No matching users."
              minWidth={800}
            />
          )}
        </div>
      </Card>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User">
        <form onSubmit={handleSave} noValidate className="space-y-4">
          {editFields.map((f) => (
            <FormField
              key={f.name}
              label={f.label}
              name={f.name}
              type={f.type ?? 'text'}
              value={form[f.name]}
              onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
              error={errors[f.name]}
            />
          ))}
          <Button type="submit" fullWidth loading={saving}>Save Changes</Button>
        </form>
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete User">
        <p className="text-sm text-emerald-100/80">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{deleting?.name || deleting?.userId}</span>{' '}
          ({deleting?.userId})? This cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={() => setDeleting(null)}>Cancel</Button>
          <Button type="button" variant="danger" fullWidth loading={removing} onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

export default UserDetailsPage

import { useEffect, useMemo, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Badge from '@/Common_Pages/components/ui/Badge'
import Table from '@/Common_Pages/components/ui/Table'
import Avatar from '@/Common_Pages/components/ui/Avatar'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import ProvinceDistrictFields from '@/Common_Pages/components/ui/ProvinceDistrictFields'
import ConfirmModal from '@/Common_Pages/components/ui/ConfirmModal'
import { getUsers, updateUser, updateUserStatus, resetUserPassword, type EditableUser, type RegisteredUser } from '@/Role_Pages/admin/user-details/api/user-details'
import { ROLE_TONE, editFields, emptyForm, inputClass } from '@/Role_Pages/admin/user-details/pages/userDetailsHelpers'

// Admins can view accounts, correct their details, reset a forgotten password
// and change an account's status. Identity fields (login ID, NIC, email) stay
// fixed here — changing those would silently break the records tied to them.

const EDITABLE_ROLES = [
  'Admin', 'Coordinator', 'Technical Officer',
  'Manager L1', 'Manager L2', 'Manager L3', 'Loan Applicant',
]
const roleOptions = EDITABLE_ROLES.map((role) => ({ value: role, label: role }))

const UserDetailsPage = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [changing, setChanging] = useState<{ user: RegisteredUser; status: RegisteredUser['status'] } | null>(null)
  const [removing, setRemoving] = useState(false)
  const [editing, setEditing] = useState<RegisteredUser | null>(null)
  const [form, setForm] = useState<EditableUser>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [resetting, setResetting] = useState<RegisteredUser | null>(null)
  const [resetBusy, setResetBusy] = useState(false)

  const load = () => {
    setLoading(true)
    getUsers().then((res) => {
      setUsers(res.users)
      if (res.error) setError(res.error)
      setLoading(false)
    })
  }
  useEffect(load, [])

  if (user && user.role !== 'Admin') return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <p className="font-semibold text-accent-200">Admins only</p>
      <p className="mt-1 text-sm text-emerald-100">You don&apos;t have permission to view this page.</p>
    </Card>
  )

  const confirmStatus = async () => {
    if (!changing) return
    setRemoving(true)
    const res = await updateUserStatus(changing.user.userId, changing.status)
    setRemoving(false)
    if (res.ok) setNotice(`${changing.user.userId} is now ${changing.status.toLowerCase()}.`)
    else setError(res.error ?? 'Could not change this account status.')
    setChanging(null)
    if (res.ok) load()
  }

  // Open the edit form pre-filled from the row, so an admin corrects what is
  // already there rather than retyping the record.
  const startEdit = (target: RegisteredUser) => {
    setFormError('')
    setEditing(target)
    setForm({
      firstName: target.firstName,
      lastName: target.lastName,
      role: target.role,
      phone: target.phone,
      province: target.province,
      district: target.district,
      city: target.city,
    })
  }

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return
    setFormError('')
    setSaving(true)
    const res = await updateUser(editing.userId, form)
    setSaving(false)
    if (!res.ok) {
      setFormError(res.error ?? 'Could not save changes.')
      return
    }
    setEditing(null)
    setNotice(`${editing.userId} has been updated.`)
    load()
  }

  const confirmReset = async () => {
    if (!resetting) return
    setResetBusy(true)
    const res = await resetUserPassword(resetting.userId)
    setResetBusy(false)
    if (res.ok) setNotice(`A new temporary password has been emailed to ${res.email}. They must change it at their next sign-in, and any open session has been signed out.`)
    else setError(res.error ?? 'Could not reset this password.')
    setResetting(null)
  }

  const roles = useMemo(() => Array.from(new Set(users.map((u) => u.role))).sort(), [users])
  const q = search.trim().toLowerCase()
  const filtered = users.filter((u) =>
    (!roleFilter || u.role === roleFilter) &&
    (!q || `${u.userId} ${u.name} ${u.role} ${u.email} ${u.nic}`.toLowerCase().includes(q)),
  )
  const rows = filtered.map((u) => [
    <div key="name" className="flex items-center gap-3">
      <Avatar userId={u.userId} name={u.name || u.userId} photoPath={u.photoPath} size="sm" />
      <div className="min-w-0 leading-tight">
        <p className="truncate font-medium text-white">{u.name || '—'}</p>
        <p className="text-xs text-emerald-200">{u.userId}</p>
      </div>
    </div>,
    <Badge key="role" tone={ROLE_TONE[u.role] ?? 'neutral'}>{u.role}</Badge>,
    <span key="email" className="text-emerald-100">{u.email || '—'}</span>,
    u.phone || '—',
    <Badge key="status" status={u.status === 'Active' ? 'Active' : undefined} tone={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'warning' : 'neutral'}>{u.status}</Badge>,
    <span key="login" className="whitespace-nowrap text-xs text-emerald-100">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</span>,
    <div key="actions" className="flex flex-wrap justify-end gap-2">
      {/* Bank logins are keyed to a branch code rather than a person, so they
          are managed from Bank Management, not edited as an ordinary account. */}
      {u.role !== 'Bank' && <Button type="button" size="sm" variant="outline" onClick={() => startEdit(u)}>Edit</Button>}
      {u.email && <Button type="button" size="sm" variant="outline" onClick={() => setResetting(u)}>Reset password</Button>}
      {u.status !== 'Active' && <Button type="button" size="sm" variant="outline" onClick={() => setChanging({ user: u, status: 'Active' })}>Activate</Button>}
      {u.status === 'Active' && <Button type="button" size="sm" variant="outline" disabled={u.userId === user?.userId} onClick={() => setChanging({ user: u, status: 'Suspended' })}>Suspend</Button>}
      {u.status !== 'Deactivated' && <Button type="button" size="sm" variant="danger" disabled={u.userId === user?.userId} onClick={() => setChanging({ user: u, status: 'Deactivated' })}>Deactivate</Button>}
    </div>,
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SuccessModal open={!!notice} title="Account Updated" message={notice} closeLabel="Done" onClose={() => setNotice('')} />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">User <GradientText>Details</GradientText></h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100">Manage registered accounts without removing their project history.</p>
      </div>
      {error && <p className="text-center text-sm text-red-300">{error}</p>}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-200 via-accent-300 to-amber-400" />
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-emerald-100"><span className="font-semibold text-white">{filtered.length}</span> of {users.length} registered users</p>
            <div className="grid w-full gap-2 sm:w-[36rem] sm:grid-cols-[minmax(0,1fr)_10rem]">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name, email or NIC" className={`${inputClass} min-w-0`} />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={inputClass}>
                <option value="" className="bg-surface">All roles</option>
                {roles.map((role) => <option key={role} value={role} className="bg-surface">{role}</option>)}
              </select>
            </div>
          </div>
          {loading ? <p className="text-center text-sm text-emerald-200">Loading…</p> : (
            <Table columns={['User', 'Role', 'Email', 'Phone', 'Status', 'Last login', 'Actions']} rows={rows} emptyText="No matching users." minWidth={980} />
          )}
        </div>
      </Card>

      {/* Edit account details. Login ID, NIC and email are deliberately absent:
          other tables key off them, so they are not editable from here. */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User Details">
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <p className="text-emerald-100">
                Login ID <span className="font-semibold text-white">{editing.userId}</span>
                {editing.nic && <> &middot; NIC <span className="font-semibold text-white">{editing.nic}</span></>}
              </p>
              {editing.email && <p className="mt-1 text-xs text-emerald-200">{editing.email}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {editFields.map((field) => (
                <FormField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={form[field.name]}
                  onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))}
                />
              ))}
              <SelectField
                label="Role *"
                name="role"
                value={form.role}
                onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
                options={roleOptions}
              />
              <ProvinceDistrictFields
                province={form.province}
                district={form.district}
                onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))}
              />
            </div>

            {formError && <p className="text-sm text-red-300">{formError}</p>}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" fullWidth onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" fullWidth loading={saving}>Save changes</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!resetting}
        title="Reset Password"
        message={`Email a new temporary password to ${resetting?.email ?? ''}? ${resetting?.name || resetting?.userId} will be signed out everywhere and must set a new password at their next sign-in.`}
        confirmLabel={resetBusy ? 'Sending…' : 'Send new password'}
        onConfirm={confirmReset}
        onCancel={() => setResetting(null)}
      />
      <Modal open={!!changing} onClose={() => setChanging(null)} title="Change Account Status">
        <p className="text-sm text-emerald-100">
          Change <span className="font-semibold text-white">{changing?.user.name || changing?.user.userId}</span> to <span className="font-semibold text-accent-200">{changing?.status}</span>? Non-active accounts cannot sign in, but their project history is preserved.
        </p>
        <div className="mt-5 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={() => setChanging(null)}>Cancel</Button>
          <Button type="button" variant={changing?.status === 'Deactivated' ? 'danger' : 'primary'} fullWidth loading={removing} onClick={confirmStatus}>Confirm</Button>
        </div>
      </Modal>
    </div>
  )
}

export default UserDetailsPage

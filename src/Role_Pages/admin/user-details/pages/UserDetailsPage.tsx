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
import { getUsers, deleteUser, type RegisteredUser } from '@/Role_Pages/admin/user-details/api/user-details'
import { ROLE_TONE, inputClass } from '@/Role_Pages/admin/user-details/pages/userDetailsHelpers'

// Admins can view and remove accounts, but cannot edit user details.
const UserDetailsPage = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<RegisteredUser | null>(null)
  const [removing, setRemoving] = useState(false)

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
      <p className="font-semibold text-gold-200">Admins only</p>
      <p className="mt-1 text-sm text-emerald-100/70">You don&apos;t have permission to view this page.</p>
    </Card>
  )

  const confirmDelete = async () => {
    if (!deleting) return
    setRemoving(true)
    const res = await deleteUser(deleting.userId)
    setRemoving(false)
    if (res.ok) setNotice(`${deleting.userId} was deleted.`)
    else setError(res.error ?? 'Could not delete this user.')
    setDeleting(null)
    if (res.ok) load()
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
        <p className="text-xs text-emerald-200/60">{u.userId}</p>
      </div>
    </div>,
    <Badge key="role" tone={ROLE_TONE[u.role] ?? 'neutral'}>{u.role}</Badge>,
    <span key="email" className="text-emerald-100/80">{u.email || '—'}</span>,
    u.phone || '—',
    u.district || '—',
    <div key="actions" className="flex justify-end">
      <Button type="button" size="sm" variant="danger" disabled={u.userId === user?.userId} onClick={() => setDeleting(u)}>Delete</Button>
    </div>,
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SuccessModal open={!!notice} title="User Deleted" message={notice} closeLabel="Done" onClose={() => setNotice('')} />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">User <GradientText>Details</GradientText></h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">View registered account details or remove an account.</p>
      </div>
      {error && <p className="text-center text-sm text-red-300">{error}</p>}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-200 via-gold-300 to-amber-400" />
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-emerald-100/70"><span className="font-semibold text-white">{filtered.length}</span> of {users.length} registered users</p>
            <div className="flex gap-2 sm:w-96">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name, email or NIC…" className={`${inputClass} flex-1`} />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`${inputClass} sm:w-40`}>
                <option value="" className="bg-emerald-900">All roles</option>
                {roles.map((role) => <option key={role} value={role} className="bg-emerald-900">{role}</option>)}
              </select>
            </div>
          </div>
          {loading ? <p className="text-center text-sm text-emerald-200/60">Loading…</p> : (
            <Table columns={['User', 'Role', 'Email', 'Phone', 'District', 'Actions']} rows={rows} emptyText="No matching users." minWidth={800} />
          )}
        </div>
      </Card>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete User">
        <p className="text-sm text-emerald-100/80">
          Are you sure you want to delete <span className="font-semibold text-white">{deleting?.name || deleting?.userId}</span> ({deleting?.userId})? This cannot be undone.
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

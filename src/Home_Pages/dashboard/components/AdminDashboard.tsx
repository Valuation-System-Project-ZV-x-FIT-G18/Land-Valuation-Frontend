import { useCallback, useEffect, useState } from 'react'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import WelcomeCard from './WelcomeCard'
import Badge from '@/Common_Pages/components/ui/Badge'
import Card from '@/Common_Pages/components/ui/Card'
import { getAuditLogs, getUsers, type AdminAuditLog, type RegisteredUser } from '@/Role_Pages/admin/user-details/api/user-details'
import { EmptyState, LoadingRows, SectionCard, SummaryCards, formatDate } from './RoleDashboardParts'

const ACTION_LABELS: Record<string, string> = {
  USER_CREATED: 'User created', USER_UPDATED: 'User updated', USER_STATUS_CHANGED: 'Account status changed',
}
const statusTone = (status: RegisteredUser['status']) =>
  status === 'Active' ? 'success' : status === 'Suspended' ? 'warning' : 'neutral'

const AdminDashboard = ({ user }: { user: AuthUser }) => {
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [activity, setActivity] = useState<AdminAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [userResult, auditResult] = await Promise.all([getUsers(), getAuditLogs()])
    setUsers(userResult.users); setActivity(auditResult.logs)
    setError(userResult.error || auditResult.error || ''); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const active = users.filter((item) => item.status === 'Active').length
  const suspended = users.filter((item) => item.status === 'Suspended').length
  const deactivated = users.filter((item) => item.status === 'Deactivated').length
  const recentUsers = [...users]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 8)

  return <div className="space-y-6">
    <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />
    {error && <Card className="border-red-400/30 p-4 text-sm text-red-200">{error} <button className="ml-2 text-accent-200 underline" onClick={load}>Try again</button></Card>}
    <SummaryCards loading={loading} items={[
      { label: 'Total Accounts', value: users.length, hint: 'All user accounts', tone: 'bg-accent-300' },
      { label: 'Active', value: active, hint: 'Can sign in', tone: 'bg-emerald-300' },
      { label: 'Suspended', value: suspended, hint: 'Access temporarily blocked', tone: 'bg-amber-300' },
      { label: 'Deactivated', value: deactivated, hint: 'Access disabled', tone: 'bg-slate-300' },
    ]} />

    <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <SectionCard title="Recent Accounts">
        {loading ? <LoadingRows /> : recentUsers.length === 0 ? <EmptyState>No user accounts found.</EmptyState> :
          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-emerald-100"><tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Created</th></tr></thead>
            <tbody className="divide-y divide-white/10">{recentUsers.map((item) => <tr key={item.userId}>
              <td className="p-3"><p className="font-medium text-white">{item.name || item.userId}</p><p className="text-xs text-emerald-100">{item.userId}</p></td>
              <td className="p-3 text-emerald-100">{item.role}</td>
              <td className="p-3"><Badge tone={statusTone(item.status)}>{item.status}</Badge></td>
              <td className="whitespace-nowrap p-3 text-emerald-100">{formatDate(item.createdAt)}</td>
            </tr>)}</tbody>
          </table></div>}
      </SectionCard>

      <SectionCard title="Recent Admin Activity">
        {loading ? <LoadingRows /> : activity.length === 0 ? <EmptyState>No administrative activity recorded.</EmptyState> :
          <div className="divide-y divide-white/10">{activity.slice(0, 6).map((item) => <div key={item.id} className="py-3 first:pt-0">
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-white">{ACTION_LABELS[item.action] ?? item.action}</p><span className="whitespace-nowrap text-xs text-emerald-100">{formatDate(item.createdAt)}</span></div>
            <p className="mt-1 text-xs text-emerald-100">{item.actorUserId ?? 'System'} · {item.targetUserId ?? '—'}</p>
          </div>)}</div>}
      </SectionCard>
    </div>
  </div>
}

export default AdminDashboard

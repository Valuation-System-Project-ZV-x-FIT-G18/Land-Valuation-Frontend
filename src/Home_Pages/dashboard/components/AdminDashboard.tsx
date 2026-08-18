import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import WelcomeCard from './WelcomeCard'
import Badge from '@/Common_Pages/components/ui/Badge'
import Card from '@/Common_Pages/components/ui/Card'
import { getUsers, type RegisteredUser } from '@/Role_Pages/admin/user-details/api/user-details'
import { EmptyState, LoadingRows, SectionCard, SummaryCards } from './RoleDashboardParts'

const INTERNAL = new Set(['Admin', 'Coordinator', 'Technical Officer', 'Manager L1', 'Manager L2', 'Manager L3'])

const AdminDashboard = ({ user }: { user: AuthUser }) => {
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    const result = await getUsers(); setUsers(result.users); setError(result.error || ''); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])
  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>()
    users.forEach((item) => counts.set(item.role, (counts.get(item.role) ?? 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [users])
  const staff = users.filter((item) => INTERNAL.has(item.role)).length
  const external = users.length - staff

  return <div className="space-y-6">
    <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />
    {error && <Card className="border-red-400/30 p-4 text-sm text-red-200">{error} <button className="ml-2 text-gold-200 underline" onClick={load}>Try again</button></Card>}
    <SummaryCards loading={loading} items={[
      { label: 'Total Users', value: users.length, hint: 'All registered system accounts', tone: 'bg-gold-300' },
      { label: 'Internal Staff', value: staff, hint: 'Administrative and valuation staff', tone: 'bg-sky-300' },
      { label: 'Client Accounts', value: external, hint: 'Bank and Loan Applicant accounts', tone: 'bg-emerald-300' },
      { label: 'Roles', value: roleCounts.length, hint: 'Roles currently represented', tone: 'bg-violet-300' },
    ]} />
    <SectionCard title="User Management Overview" subtitle="Registered accounts available through the existing user-management service.">
      {loading ? <LoadingRows /> : users.length === 0 ? <EmptyState>No recent users found.</EmptyState> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-emerald-100/45"><tr><th className="p-3">Name</th><th className="p-3">User ID</th><th className="p-3">Role</th><th className="p-3">Account Status</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-white/10">{users.slice(0, 10).map((item) => <tr key={item.userId}><td className="p-3 text-white">{item.name || '—'}</td><td className="p-3 text-gold-200">{item.userId}</td><td className="p-3">{item.role}</td><td className="p-3"><Badge status="Active">Registered</Badge></td><td className="p-3"><Link to="/admin/user-details" className="text-gold-200 hover:underline">Manage →</Link></td></tr>)}</tbody></table></div>}
    </SectionCard>
    <SectionCard title="Users by Role" subtitle="Live distribution calculated from registered user accounts.">
      {loading ? <LoadingRows /> : roleCounts.length === 0 ? <EmptyState>No role information is available.</EmptyState> : <div className="space-y-4">{roleCounts.map(([role, count]) => <div key={role}><div className="mb-1.5 flex justify-between text-sm"><span className="text-emerald-50">{role}</span><span className="font-semibold text-gold-200">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-gold-300" style={{ width: `${Math.max(5, (count / users.length) * 100)}%` }} /></div></div>)}</div>}
    </SectionCard>
  </div>
}
export default AdminDashboard

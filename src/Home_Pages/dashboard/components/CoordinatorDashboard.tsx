import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import WelcomeCard from './WelcomeCard'
import Badge from '@/Common_Pages/components/ui/Badge'
import Card from '@/Common_Pages/components/ui/Card'
import { getDashboardProjects } from '@/Role_Pages/coordinator/project-status/api/project-status'
import type { ProjectRow } from '@/Role_Pages/coordinator/project-status/types/project-status'
import { getUnassigned } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type { UnassignedValuation } from '@/Role_Pages/coordinator/fleet-management/types/fleet'
import { getPendingSlips, type PendingSlip } from '@/Role_Pages/coordinator/payment-slips/api/payment-slips'
import { getNotifications, type Notification } from '@/Common_Pages/notifications/notifications'
import { EmptyState, formatDate, LoadingRows, SectionCard, SummaryCards } from './RoleDashboardParts'

const CoordinatorDashboard = ({ user }: { user: AuthUser }) => {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [unassigned, setUnassigned] = useState<UnassignedValuation[]>([])
  const [slips, setSlips] = useState<PendingSlip[]>([])
  const [activity, setActivity] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [projectResult, assignmentResult, pendingSlips, notifications] = await Promise.all([
      getDashboardProjects(), getUnassigned(), getPendingSlips(), getNotifications(user.userId),
    ])
    setProjects(projectResult.projects); setUnassigned(assignmentResult.valuations); setSlips(pendingSlips); setActivity(notifications.notifications.slice(0, 6))
    if (projectResult.error || assignmentResult.error) setError(projectResult.error || assignmentResult.error || '')
    setLoading(false)
  }, [user.userId])
  useEffect(() => { load() }, [load])

  const completed = projects.filter((p) => p.status === 'Valuation Completed').length
  const active = projects.length - completed
  const projectById = new Map(projects.map((p) => [p.projectId, p]))

  return <div className="space-y-6">
    <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />
    {error && <Card className="border-red-400/30 p-4 text-sm text-red-200">{error} <button className="ml-2 text-gold-200 underline" onClick={load}>Try again</button></Card>}
    <SummaryCards loading={loading} items={[
      { label: 'Active Projects', value: active, hint: 'Projects still moving through valuation', tone: 'bg-sky-300' },
      { label: 'Pending Assignments', value: unassigned.length, hint: 'Valuations without a Technical Officer', tone: 'bg-amber-300' },
      { label: 'Pending Payment Slips', value: slips.length, hint: 'Submitted slips awaiting verification', tone: 'bg-red-300' },
      { label: 'Completed Projects', value: completed, hint: 'Payment verified and valuation completed', tone: 'bg-emerald-300' },
    ]} />
    <SectionCard title="Projects Requiring Attention" subtitle="Assignments and payments currently waiting for Coordinator action.">
      {loading ? <LoadingRows /> : unassigned.length + slips.length === 0 ? <EmptyState>No projects currently require your attention.</EmptyState> :
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-emerald-100/45"><tr><th className="p-3">Project</th><th className="p-3">Applicant</th><th className="p-3">Property</th><th className="p-3">Current Stage</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-white/10">
          {unassigned.map((item) => { const project = projectById.get(item.projectId); return <tr key={`assignment-${item.valuationRowId}`}><td className="p-3 font-semibold text-gold-200">{item.projectId}</td><td className="p-3">{item.nic}</td><td className="p-3">{project?.propertyType || '—'}</td><td className="p-3"><Badge status="Pending assignment">Pending assignment</Badge></td><td className="p-3"><Link className="text-gold-200 hover:underline" to="/coordinator/fleet-management/assign">Assign officer →</Link></td></tr> })}
          {slips.map((slip) => <tr key={`slip-${slip.projectId}`}><td className="p-3 font-semibold text-gold-200">{slip.projectId}</td><td className="p-3">{slip.ownerName}</td><td className="p-3">{slip.location || '—'}</td><td className="p-3"><Badge status="Pending verification">Payment verification</Badge></td><td className="p-3"><Link className="text-gold-200 hover:underline" to="/coordinator/payment-slips">Verify slip →</Link></td></tr>)}
        </tbody></table></div>}
    </SectionCard>
    <SectionCard title="Recent Project Activity" subtitle="Latest real workflow notifications and newly created projects.">
      {loading ? <LoadingRows /> : activity.length ? <ul className="divide-y divide-white/10">{activity.map((item) => <li key={item.id} className="py-3"><p className="text-sm text-emerald-50">{item.message}</p><p className="mt-1 text-xs text-emerald-100/45">{formatDate(item.createdAt)}</p></li>)}</ul> : projects.length ? <ul className="divide-y divide-white/10">{projects.slice(0, 5).map((p) => <li key={p.projectId} className="py-3 text-sm text-emerald-50">Project {p.projectId} created <span className="ml-2 text-xs text-emerald-100/45">{formatDate(p.createdAt)}</span></li>)}</ul> : <EmptyState>No recent project activity is available.</EmptyState>}
    </SectionCard>
  </div>
}
export default CoordinatorDashboard

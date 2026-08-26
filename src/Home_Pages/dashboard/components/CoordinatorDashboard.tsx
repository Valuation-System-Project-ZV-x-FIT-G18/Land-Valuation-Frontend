import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import WelcomeCard from './WelcomeCard'
import Badge from '@/Common_Pages/components/ui/Badge'
import Card from '@/Common_Pages/components/ui/Card'
import { getDashboardProjects } from '@/Role_Pages/coordinator/project-status/api/project-status'
import type { ProjectRow } from '@/Role_Pages/coordinator/project-status/types/project-status'
import { getFleetOfficers, getUnassigned } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type { FleetOfficers, UnassignedValuation } from '@/Role_Pages/coordinator/fleet-management/types/fleet'
import { getPendingSlips, type PendingSlip } from '@/Role_Pages/coordinator/payment-slips/api/payment-slips'
import { getNotifications, type Notification } from '@/Common_Pages/notifications/notifications'
import { EmptyState, formatDate, LoadingRows, SectionCard, SummaryCards } from './RoleDashboardParts'

const CoordinatorDashboard = ({ user }: { user: AuthUser }) => {
  const emptyFleet: FleetOfficers = { all: [], available: [], assigned: [], onLeave: [], rejected: [] }
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [unassigned, setUnassigned] = useState<UnassignedValuation[]>([])
  const [slips, setSlips] = useState<PendingSlip[]>([])
  const [activity, setActivity] = useState<Notification[]>([])
  const [fleet, setFleet] = useState<FleetOfficers>(emptyFleet)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [projectResult, assignmentResult, pendingSlips, notifications, fleetResult] = await Promise.all([
      getDashboardProjects(), getUnassigned(), getPendingSlips(), getNotifications(), getFleetOfficers(),
    ])
    setProjects(projectResult.projects); setUnassigned(assignmentResult.valuations); setSlips(pendingSlips); setActivity(notifications.notifications.slice(0, 6))
    setFleet(fleetResult)
    if (projectResult.error || assignmentResult.error || fleetResult.error) setError(projectResult.error || assignmentResult.error || fleetResult.error || '')
    setLoading(false)
  }, [user.userId])
  useEffect(() => { load() }, [load])

  const completed = projects.filter((p) => p.status === 'Valuation Completed').length
  const active = projects.length - completed
  const projectById = new Map(projects.map((p) => [p.projectId, p]))
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  const visitsToday = fleet.assigned.filter((officer) => officer.assignedDate === today)

  return <div className="space-y-6">
    <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />
    {error && <Card className="border-red-400/30 p-4 text-sm text-red-200">{error} <button className="ml-2 text-accent-200 underline" onClick={load}>Try again</button></Card>}
    <SummaryCards loading={loading} items={[
      { label: 'Site Visits Today', value: visitsToday.length, hint: 'Inspections scheduled for today', tone: 'bg-sky-300' },
      { label: 'Available Today', value: fleet.available.length, hint: 'Officers available for assignment', tone: 'bg-emerald-300' },
      { label: 'On Leave Today', value: fleet.onLeave.length, hint: 'Approved officer leave today', tone: 'bg-amber-300' },
      { label: 'Needs Reassignment', value: fleet.rejected.length, hint: 'Rejected assignments awaiting action', tone: 'bg-red-500' },
    ]} />
    <SectionCard title="Today’s Operations" subtitle="Technical Officer visits scheduled for today in Sri Lanka time.">
      {loading ? <LoadingRows /> : visitsToday.length === 0 ? <EmptyState>No site visits are scheduled for today.</EmptyState> :
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-emerald-100"><tr><th className="p-3">Officer</th><th className="p-3">Project</th><th className="p-3">Property location</th><th className="p-3">Visit time</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-white/10">
          {visitsToday.map((officer) => <tr key={officer.valuationRowId}><td className="p-3"><p className="font-medium text-white">{officer.name}</p><p className="text-xs text-emerald-100/60">{officer.userId}</p></td><td className="p-3 font-semibold text-accent-200">{officer.projectId}</td><td className="max-w-[260px] p-3 text-emerald-100">{officer.propertyLocation || 'Location not provided'}</td><td className="p-3">{officer.assignedTime || 'Time not set'}</td><td className="p-3"><Badge status={officer.status}>{officer.status}</Badge></td><td className="p-3"><Link className="text-accent-200 hover:underline" to="/coordinator/fleet-management">View operation →</Link></td></tr>)}
        </tbody></table></div>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white">Available today</h3>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">{fleet.available.length}</span>
          </div>
          {loading ? <div className="mt-4 h-12 animate-pulse rounded-lg bg-white/5" /> : fleet.available.length === 0 ? <p className="mt-4 text-sm text-emerald-100/60">No officers are currently available.</p> :
            <ul className="mt-3 divide-y divide-white/10">{fleet.available.slice(0, 5).map((officer) => <li key={officer.userId} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium text-emerald-50">{officer.name}</p><p className="text-xs text-emerald-100/55">{officer.userId} · {officer.district || 'District not set'}</p></div><Link to="/coordinator/fleet-management/assign" className="text-xs font-semibold text-accent-200 hover:underline">Assign</Link></li>)}</ul>}
          {fleet.available.length > 5 && <Link to="/coordinator/fleet-management/summary" className="mt-3 inline-block text-xs font-semibold text-accent-200 hover:underline">View all available officers →</Link>}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white">On leave today</h3>
            <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-200">{fleet.onLeave.length}</span>
          </div>
          {loading ? <div className="mt-4 h-12 animate-pulse rounded-lg bg-white/5" /> : fleet.onLeave.length === 0 ? <p className="mt-4 text-sm text-emerald-100/60">No officers are on leave today.</p> :
            <ul className="mt-3 divide-y divide-white/10">{fleet.onLeave.slice(0, 5).map((officer) => <li key={officer.userId} className="py-3"><p className="text-sm font-medium text-emerald-50">{officer.name}</p><p className="text-xs text-emerald-100/55">{officer.userId} · {officer.reason || 'Reason not provided'}</p></li>)}</ul>}
          {fleet.onLeave.length > 5 && <Link to="/coordinator/fleet-management/attendance" className="mt-3 inline-block text-xs font-semibold text-accent-200 hover:underline">View attendance →</Link>}
        </div>
      </div>
    </SectionCard>
    <SectionCard title="Projects Requiring Attention" subtitle="Assignments and payments currently waiting for Coordinator action.">
      {loading ? <LoadingRows /> : unassigned.length + slips.length + fleet.rejected.length === 0 ? <EmptyState>No projects currently require your attention.</EmptyState> :
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-emerald-100"><tr><th className="p-3">Project</th><th className="p-3">Related party</th><th className="p-3">Details</th><th className="p-3">Current Stage</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-white/10">
          {fleet.rejected.map((item) => <tr key={`rejected-${item.valuationRowId}`}><td className="p-3 font-semibold text-accent-200">{item.projectId}</td><td className="p-3"><p className="text-emerald-50">{item.name}</p><p className="text-xs text-emerald-100/55">{item.userId}</p></td><td className="p-3"><p className="max-w-[220px] truncate text-amber-200" title={item.reason}>{item.reason || 'No reason provided'}</p></td><td className="p-3"><Badge status="Rejected assignment">Needs reassignment</Badge></td><td className="p-3"><Link className="text-accent-200 hover:underline" to="/coordinator/fleet-management/rejected">Review &amp; reassign →</Link></td></tr>)}
          {unassigned.map((item) => { const project = projectById.get(item.projectId); return <tr key={`assignment-${item.valuationRowId}`}><td className="p-3 font-semibold text-accent-200">{item.projectId}</td><td className="p-3">{item.nic}</td><td className="p-3">{project?.propertyType || '—'}</td><td className="p-3"><Badge status="Pending assignment">Pending assignment</Badge></td><td className="p-3"><Link className="text-accent-200 hover:underline" to="/coordinator/fleet-management/assign">Assign officer →</Link></td></tr> })}
          {slips.map((slip) => <tr key={`slip-${slip.projectId}`}><td className="p-3 font-semibold text-accent-200">{slip.projectId}</td><td className="p-3">{slip.ownerName}</td><td className="p-3">{slip.location || '—'}</td><td className="p-3"><Badge status="Pending verification">Payment verification</Badge></td><td className="p-3"><Link className="text-accent-200 hover:underline" to="/coordinator/payment-slips">Verify slip →</Link></td></tr>)}
        </tbody></table></div>}
    </SectionCard>
    <SectionCard title="Recent Project Activity" subtitle="Latest real workflow notifications and newly created projects.">
      {loading ? <LoadingRows /> : activity.length ? <ul className="divide-y divide-white/10">{activity.map((item) => <li key={item.id} className="py-3"><p className="text-sm text-emerald-50">{item.message}</p><p className="mt-1 text-xs text-emerald-100">{formatDate(item.createdAt)}</p></li>)}</ul> : projects.length ? <ul className="divide-y divide-white/10">{projects.slice(0, 5).map((p) => <li key={p.projectId} className="py-3 text-sm text-emerald-50">Project {p.projectId} created <span className="ml-2 text-xs text-emerald-100">{formatDate(p.createdAt)}</span></li>)}</ul> : <EmptyState>No recent project activity is available.</EmptyState>}
    </SectionCard>
  </div>
}
export default CoordinatorDashboard

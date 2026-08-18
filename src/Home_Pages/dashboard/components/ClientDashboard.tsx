import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import WelcomeCard from './WelcomeCard'
import Badge from '@/Common_Pages/components/ui/Badge'
import Card from '@/Common_Pages/components/ui/Card'
import { getClientDashboardProjects, type ClientDashboardProject } from '@/Role_Pages/client/api/client'
import { getNotifications, type Notification } from '@/Common_Pages/notifications/notifications'
import { EmptyState, formatDate, LoadingRows, SectionCard, SummaryCards } from './RoleDashboardParts'

const friendlyStage = (project: ClientDashboardProject) => {
  if (project.reportAvailable) return 'Report Available'
  if (project.reviewStatus === 'locked') return project.slipPending ? 'Payment Verification' : 'Payment Pending'
  if (project.reviewStatus === 'pending_l1') return 'Final Review'
  if (['pending_l2', 'pending_l3'].includes(project.reviewStatus)) return 'Under Review'
  if (project.technicalOfficerId) return 'Valuation in Progress'
  return project.projectStatus || 'Request Received'
}

const ClientDashboard = ({ user, audience }: { user: AuthUser; audience: 'bank' | 'applicant' }) => {
  const [projects, setProjects] = useState<ClientDashboardProject[]>([])
  const [updates, setUpdates] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [items, activity] = await Promise.all([getClientDashboardProjects(), getNotifications(user.userId)])
      setProjects(items); setUpdates(activity.notifications.slice(0, 6))
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Could not load dashboard information.') }
    finally { setLoading(false) }
  }, [user.userId])
  useEffect(() => { load() }, [load])
  const completed = projects.filter((p) => p.paid && p.reviewStatus === 'locked').length
  const reports = projects.filter((p) => p.reportAvailable)
  const paymentPending = projects.filter((p) => p.reviewStatus === 'locked' && !p.paid).length
  const inProgress = projects.length - completed
  const isBank = audience === 'bank'

  return <div className="space-y-6">
    <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />
    {error && <Card className="border-red-400/30 p-4 text-sm text-red-200">{error} <button className="ml-2 text-gold-200 underline" onClick={load}>Try again</button></Card>}
    <SummaryCards loading={loading} items={isBank ? [
      { label: 'Valuation Requests', value: projects.length, hint: 'Projects associated with your branch', tone: 'bg-gold-300' },
      { label: 'In Progress', value: inProgress, hint: 'Requests still being processed', tone: 'bg-sky-300' },
      { label: 'Awaiting Completion', value: paymentPending, hint: 'Finalized reports awaiting payment', tone: 'bg-amber-300' },
      { label: 'Reports Available', value: reports.length, hint: 'Finalized and payment-cleared reports', tone: 'bg-emerald-300' },
    ] : [
      { label: 'My Projects', value: projects.length, hint: 'Your valuation requests', tone: 'bg-gold-300' },
      { label: 'In Progress', value: inProgress - paymentPending, hint: 'Requests moving through valuation', tone: 'bg-sky-300' },
      { label: 'Payment Pending', value: paymentPending, hint: 'Finalized requests awaiting payment', tone: 'bg-amber-300' },
      { label: 'Completed', value: completed, hint: 'Payment confirmed and valuation completed', tone: 'bg-emerald-300' },
    ]} />
    <SectionCard title={isBank ? 'Recent Valuation Requests' : 'My Valuation Requests'} subtitle={isBank ? 'Projects associated with your bank branch.' : 'A clear overview of your current valuation requests.'}>
      {loading ? <LoadingRows /> : projects.length === 0 ? <EmptyState>{isBank ? 'No valuation requests are currently associated with your bank.' : 'You currently have no active valuation requests.'}</EmptyState> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-emerald-100/45"><tr><th className="p-3">Project</th><th className="p-3">{isBank ? 'Applicant' : 'Property'}</th><th className="p-3">Location</th><th className="p-3">Requested</th><th className="p-3">Current Stage</th><th className="p-3">Report</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-white/10">{projects.map((project) => <tr key={project.projectId}><td className="p-3 font-semibold text-gold-200">{project.projectId}</td><td className="p-3">{isBank ? project.ownerName : project.property}</td><td className="p-3">{project.location || '—'}</td><td className="p-3">{formatDate(project.createdAt)}</td><td className="p-3"><Badge status={friendlyStage(project)}>{friendlyStage(project)}</Badge></td><td className="p-3">{project.reportAvailable ? <Badge status="Available">Available</Badge> : <span className="text-emerald-100/45">Not available</span>}</td><td className="p-3">{project.reportAvailable && isBank ? <Link to="/bank/report" className="text-gold-200 hover:underline">View report →</Link> : !isBank && project.reviewStatus === 'locked' && !project.paid ? <Link to="/applicant/payment" className="text-gold-200 hover:underline">Payment →</Link> : <span className="text-emerald-100/40">No action</span>}</td></tr>)}</tbody></table></div>}
    </SectionCard>
    {isBank ? <SectionCard title="Reports Available" subtitle="Only finalized reports with confirmed payment are shown.">{loading ? <LoadingRows /> : reports.length === 0 ? <EmptyState>No valuation reports are currently available.</EmptyState> : <div className="grid gap-3 sm:grid-cols-2">{reports.map((project) => <Link key={project.projectId} to="/bank/report" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold-300/40"><p className="font-semibold text-gold-200">{project.projectId}</p><p className="mt-1 text-sm text-emerald-100/65">{project.ownerName}</p><p className="mt-3 text-xs text-emerald-300">Open final report →</p></Link>)}</div>}</SectionCard> : paymentPending > 0 ? <SectionCard title="Action Required" subtitle="Complete these steps to finish your valuation request."><div className="space-y-3">{projects.filter((p) => p.reviewStatus === 'locked' && !p.paid).map((project) => <div key={project.projectId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-4"><div><p className="font-semibold text-white">{project.projectId}</p><p className="mt-1 text-sm text-amber-100/70">{project.slipPending ? 'Your payment slip is awaiting verification.' : 'Submit payment and upload the payment slip.'}</p></div>{!project.slipPending && <Link to="/applicant/payment" className="text-sm font-semibold text-gold-200">Make payment →</Link>}</div>)}</div></SectionCard> : null}
    <SectionCard title={isBank ? 'Recent Updates' : 'Recent Updates'} subtitle="Latest notifications related to your valuation requests.">{loading ? <LoadingRows /> : updates.length === 0 ? <EmptyState>No recent updates are available.</EmptyState> : <ul className="divide-y divide-white/10">{updates.map((item) => <li key={item.id} className="py-3"><p className="text-sm text-emerald-50">{item.message}</p><p className="mt-1 text-xs text-emerald-100/45">{formatDate(item.createdAt)}</p></li>)}</ul>}</SectionCard>
  </div>
}
export default ClientDashboard

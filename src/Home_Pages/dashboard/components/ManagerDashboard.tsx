import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import Badge from '@/Common_Pages/components/ui/Badge'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import WelcomeCard from '@/Home_Pages/dashboard/components/WelcomeCard'
import {
  getAllProjects,
  getRecentManagerActivities,
  STATUS_LABEL,
  type ManagerActivity,
  type ManagerProject,
} from '@/Role_Pages/manager/drafts/api/manager-drafts'

type Props = { user: AuthUser }
type DashboardData = {
  pending: ManagerProject[]
  approved: ManagerProject[]
  rejected: ManagerProject[]
  final: ManagerProject[]
  activities: ManagerActivity[]
}

const EMPTY_DATA: DashboardData = { pending: [], approved: [], rejected: [], final: [], activities: [] }

const levelFor = (role: string): 'L1' | 'L2' | 'L3' =>
  role === 'Manager L1' ? 'L1' : role === 'Manager L2' ? 'L2' : 'L3'

const attentionCopy: Record<'L1' | 'L2' | 'L3', string> = {
  L3: 'Technical Officer drafts waiting for the first management review.',
  L2: 'Reports forwarded by L3 and waiting for your L2 review.',
  L1: 'Reports forwarded by L2 and waiting for final approval.',
}

function formatUpdated(value?: string) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  const elapsed = Date.now() - date.getTime()
  const hours = Math.max(0, Math.floor(elapsed / 3_600_000))
  if (hours < 1) return 'Less than an hour ago'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function activityText(activity: ManagerActivity) {
  const actor = activity.actorRole || 'Manager'
  switch (activity.toStatus) {
    case 'pending_l2': return `${activity.projectId} approved by ${actor} and forwarded to L2`
    case 'pending_l1': return `${activity.projectId} approved by ${actor} and forwarded to L1`
    case 'rejected_to_to': return `${activity.projectId} returned to the Technical Officer by ${actor}`
    case 'rejected_l3': return `${activity.projectId} returned to L3 by ${actor}`
    case 'rejected_l2': return `${activity.projectId} returned to L2 by ${actor}`
    case 'locked': return `${activity.projectId} finalized and locked by ${actor}`
    default: return `${activity.projectId} changed to ${STATUS_LABEL[activity.toStatus] ?? activity.toStatus} by ${actor}`
  }
}

const ManagerDashboard = ({ user }: Props) => {
  const navigate = useNavigate()
  const level = levelFor(user.role)
  const [data, setData] = useState<DashboardData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activityError, setActivityError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setActivityError('')
    try {
      const [pending, approved, rejected, final] = await Promise.all([
        getAllProjects(level, 'check', true),
        getAllProjects(level, 'approved', true),
        getAllProjects(level, 'rejected', true),
        level === 'L1' ? getAllProjects(level, 'final', true) : Promise.resolve([]),
      ])
      setData((current) => ({ ...current, pending, approved, rejected, final }))
    } catch {
      setError('Dashboard information could not be loaded. Please try again.')
    } finally {
      setLoading(false)
    }

    try {
      const activities = await getRecentManagerActivities(8)
      setData((current) => ({ ...current, activities }))
    } catch {
      setActivityError('Recent activity could not be loaded.')
      setData((current) => ({ ...current, activities: [] }))
    }
  }, [level])

  useEffect(() => { load() }, [load])

  const review = (project: ManagerProject) =>
    navigate('/manager/check-drafts', { state: { projectId: project.projectId } })

  const cards = [
    { label: 'Pending Reviews', value: data.pending.length, to: '/manager/check-drafts', tone: 'text-amber-200', dot: 'bg-amber-300' },
    { label: 'Approved Reports', value: data.approved.length, to: '/manager/approved-drafts', tone: 'text-emerald-200', dot: 'bg-emerald-300' },
    { label: 'Rejected Reports', value: data.rejected.length, to: '/manager/rejected-drafts', tone: 'text-red-200', dot: 'bg-red-500' },
    { label: 'Finalized Reports', value: data.final.length, to: '/manager/final-reports', tone: 'text-accent-200', dot: 'bg-accent-300' },
  ].filter((card) => card.label !== 'Finalized Reports' || level === 'L1')

  return (
    <div className="space-y-6">
      <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />

      {error && (
        <Card className="border-red-400/30 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-200">{error}</p>
            <Button type="button" size="sm" variant="outline" onClick={load}>Try again</Button>
          </div>
        </Card>
      )}

      <div
        className={`grid gap-4 sm:grid-cols-2 ${level === 'L1' ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}
        aria-busy={loading}
      >
        {cards.map((card) => (
          <button key={card.label} type="button" onClick={() => navigate(card.to)} className="text-left">
            <Card hover className="h-full p-5 transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className={`h-2.5 w-2.5 rounded-full ${card.dot}`} />
                <span className="text-sm text-emerald-100">View →</span>
              </div>
              <p className={`mt-5 text-3xl font-bold ${card.tone}`}>{loading ? '—' : card.value}</p>
              <p className="mt-1 text-sm font-medium text-emerald-100">{card.label}</p>
            </Card>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-200 via-accent-300 to-amber-400" />
        <div className="p-5 sm:p-7">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Reports Requiring My Attention</h2>
              <p className="mt-1 text-sm text-emerald-100">{attentionCopy[level]}</p>
            </div>
            {!loading && <span className="text-xs text-accent-200">{data.pending.length} pending</span>}
          </div>

          {loading ? (
            <div className="space-y-3" role="status">
              {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
              <span className="sr-only">Loading reports</span>
            </div>
          ) : !error && data.pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-10 text-center">
              <p className="font-medium text-accent-200">You are all caught up</p>
              <p className="mt-1 text-sm text-emerald-100">No reports are currently waiting for your {level} review.</p>
            </div>
          ) : !error ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-emerald-100">
                  <tr>
                    <th className="px-3 py-3 font-medium">Project</th>
                    <th className="px-3 py-3 font-medium">Applicant / Client</th>
                    <th className="px-3 py-3 font-medium">Current Stage</th>
                    <th className="px-3 py-3 font-medium">Submitted By</th>
                    <th className="px-3 py-3 font-medium">Updated</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.pending.map((project) => (
                    <tr key={project.projectId} className="transition hover:bg-white/[0.03]">
                      <td className="px-3 py-4 font-semibold text-accent-200">{project.projectId}</td>
                      <td className="px-3 py-4 text-white">{project.ownerName || '—'}</td>
                      <td className="px-3 py-4 text-emerald-100">Manager {level} review</td>
                      <td className="px-3 py-4 text-emerald-100">
                        {level === 'L3' ? project.valuations[0]?.technicalOfficerId || 'Technical Officer' : `Manager ${level === 'L2' ? 'L3' : 'L2'}`}
                      </td>
                      <td className="px-3 py-4 text-emerald-100">{formatUpdated(project.updatedAt)}</td>
                      <td className="px-3 py-4"><Badge tone="warning">{STATUS_LABEL[project.reviewStatus] ?? project.reviewStatus}</Badge></td>
                      <td className="px-3 py-4 text-right"><Button type="button" size="sm" variant="outline" onClick={() => review(project)}>Review</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <span className="text-xs text-emerald-100">Latest workflow changes</span>
        </div>
        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-white/5" />
        ) : activityError ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-red-300/20 px-4 py-7 text-center">
            <p className="text-sm text-red-200">{activityError}</p>
            <Button type="button" size="sm" variant="outline" onClick={load}>Try again</Button>
          </div>
        ) : data.activities.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 px-4 py-7 text-center text-sm text-emerald-100">No recent review activity is available yet.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {data.activities.map((activity) => (
              <li key={`${activity.projectId}-${activity.toStatus}-${activity.createdAt}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-emerald-50">{activityText(activity)}</p>
                  <p className="mt-0.5 text-xs text-emerald-100">{formatUpdated(activity.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default ManagerDashboard

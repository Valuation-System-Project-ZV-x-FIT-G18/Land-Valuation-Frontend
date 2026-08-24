import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import Badge from '@/Common_Pages/components/ui/Badge'
import Card from '@/Common_Pages/components/ui/Card'
import WelcomeCard from './WelcomeCard'
import { EmptyState, LoadingRows, SectionCard, SummaryCards } from './RoleDashboardParts'
import { getAssignments, type Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

const isCorrection = (assignment: Assignment) => assignment.reviewStatus.toLowerCase().includes('reject')
const isCompleted = (assignment: Assignment) =>
  assignment.reviewStatus.toLowerCase().includes('locked') || assignment.status.toLowerCase().includes('complete')

const TechnicalOfficerDashboard = ({ user }: { user: AuthUser }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const result = await getAssignments(user.userId)
    setAssignments(result.assignments)
    setError(result.error ?? '')
    setLoading(false)
  }, [user.userId])

  useEffect(() => { load() }, [load])

  const active = useMemo(() => assignments.filter((item) => !isCompleted(item)), [assignments])
  const awaiting = active.filter((item) => item.status === 'Technical Officer Assigned' && !isCorrection(item))
  const corrections = active.filter(isCorrection)
  const completed = assignments.filter(isCompleted)
  const priority = [...corrections, ...awaiting, ...active.filter((item) => !corrections.includes(item) && !awaiting.includes(item))]

  return (
    <div className="space-y-6">
      <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />

      {error && (
        <Card className="border-red-400/30 p-4 text-sm text-red-200">
          {error} <button type="button" className="ml-2 text-gold-200 underline" onClick={load}>Try again</button>
        </Card>
      )}

      <SummaryCards loading={loading} items={[
        { label: 'Active Projects', value: active.length, hint: 'Current Technical Officer workload', tone: 'bg-sky-300' },
        { label: 'Awaiting Response', value: awaiting.length, hint: 'Assignments awaiting acceptance', tone: 'bg-amber-300' },
        { label: 'Corrections', value: corrections.length, hint: 'Drafts returned for correction', tone: 'bg-red-300' },
        { label: 'Completed', value: completed.length, hint: 'Completed and locked valuations', tone: 'bg-emerald-300' },
      ]} />

      <SectionCard title="Projects Requiring Attention" subtitle="Assignments and corrections currently waiting for Technical Officer action.">
        {loading ? <LoadingRows /> : priority.length === 0 ? <EmptyState>No active assignments currently require your attention.</EmptyState> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-emerald-100/45">
                <tr><th className="p-3">Project</th><th className="p-3">Applicant</th><th className="p-3">Location</th><th className="p-3">Current Stage</th><th className="p-3">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {priority.slice(0, 6).map((item) => (
                  <tr key={item.valuationRowId}>
                    <td className="p-3 font-semibold text-gold-200">{item.projectId}</td>
                    <td className="p-3 text-emerald-50">{item.owner.name || item.owner.nic || '—'}</td>
                    <td className="p-3 text-emerald-100/70">{item.location.district || item.location.address || '—'}</td>
                    <td className="p-3"><Badge status={isCorrection(item) ? 'Correction required' : item.status}>{isCorrection(item) ? 'Correction required' : item.status}</Badge></td>
                    <td className="p-3"><Link to={isCorrection(item) ? '/technical-officer/corrections' : '/technical-officer/assignments'} className="text-gold-200 hover:underline">Open project →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Technical Officer Workflow" subtitle="Continue the next stage of field work and valuation preparation.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Assigned Projects', '/technical-officer/assignments'],
            ['Inspection Data', '/technical-officer/inspections'],
            ['Site Photos', '/technical-officer/site-photos'],
            ['Create Draft', '/technical-officer/draft'],
          ].map(([label, to]) => (
            <Link key={to} to={to} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4 font-medium text-emerald-50 transition hover:border-gold-400/45 hover:bg-gold-400/5 hover:text-gold-200">
              {label} <span className="float-right text-emerald-100/40">→</span>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export default TechnicalOfficerDashboard

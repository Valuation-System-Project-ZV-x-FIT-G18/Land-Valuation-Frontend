import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import Card from '@/Common_Pages/components/ui/Card'
import { getAssignments, type Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

const isCorrection = (assignment: Assignment) => assignment.reviewStatus.toLowerCase().includes('reject')
const isCompleted = (assignment: Assignment) =>
  assignment.reviewStatus.toLowerCase().includes('locked') || assignment.status.toLowerCase().includes('complete')

const TechnicalOfficerDashboard = ({ user }: { user: AuthUser }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getAssignments(user.userId).then((result) => {
      if (!cancelled) {
        setAssignments(result.assignments)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [user.userId])

  const active = useMemo(() => assignments.filter((item) => !isCompleted(item)), [assignments])
  const awaiting = active.filter((item) => item.status === 'Technical Officer Assigned')
  const corrections = active.filter(isCorrection)
  const priority = corrections[0] ?? awaiting[0] ?? active[0]
  const count = (value: number) => loading ? '—' : value

  const summaries = [
    { label: 'Assigned projects', value: count(active.length), hint: 'Total workload', icon: '🗂️' },
    { label: 'Needs response', value: count(awaiting.length), hint: 'Awaiting acceptance', icon: '⌛' },
    { label: 'Corrections', value: count(corrections.length), hint: 'Drafts returned to you', icon: '↩️' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Today&apos;s work overview</h1>
          <p className="mt-1 text-sm text-emerald-100/60 sm:text-base">Prioritise assignments, complete inspections, and progress reports.</p>
        </div>
        <Link to="/technical-officer/assignments" className="font-semibold text-gold-300 transition hover:text-gold-200">
          View all projects →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaries.map((item) => (
          <Card key={item.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <p className="font-semibold text-emerald-100/65">{item.label}</p>
              <span aria-hidden="true" className="text-lg">{item.icon}</span>
            </div>
            <p className="mt-4 text-4xl font-bold text-gold-300">{item.value}</p>
            <p className="mt-1 text-sm text-emerald-100/45">{item.hint}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Priority projects</h2>
          <span className="text-sm text-emerald-100/45">Next assignments</span>
        </div>
        {loading ? (
          <div className="mt-7 h-12 animate-pulse rounded-xl bg-white/5" />
        ) : priority ? (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{priority.projectId}</p>
              <p className="mt-1 text-sm text-emerald-100/55">
                {[priority.location.district, priority.location.address].filter(Boolean).join(' · ') || 'Location not recorded'}
              </p>
            </div>
            <Link to="/technical-officer/assignments" className="text-sm font-medium text-gold-300 hover:text-gold-200">Continue →</Link>
          </div>
        ) : (
          <p className="mt-7 text-sm text-emerald-100/55">No active assignments need your attention.</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white">Continue workflow</h2>
        <div className="mt-5 space-y-3">
          {[
            ['Review assignments', '/technical-officer/assignments'],
            ['Record inspection data', '/technical-officer/inspections'],
            ['Create valuation draft', '/technical-officer/draft'],
          ].map(([label, to], index) => (
            <Link
              key={to}
              to={to}
              className={`block rounded-xl border px-4 py-3 font-medium transition hover:border-gold-400/50 hover:bg-gold-400/5 ${index === 1 ? 'border-gold-400/45 text-gold-200' : 'border-white/10 bg-white/[0.035] text-emerald-50'}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default TechnicalOfficerDashboard

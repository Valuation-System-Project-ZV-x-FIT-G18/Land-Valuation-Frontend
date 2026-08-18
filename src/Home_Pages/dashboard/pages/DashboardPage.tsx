import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import WelcomeCard from '@/Home_Pages/dashboard/components/WelcomeCard'
import { roleMenus, type SidebarItem } from '@/Common_Pages/components/sidebar/roleMenus'
import { getAssignments, type Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import '@/Home_Pages/dashboard/styles/dashboard-page.css'

const ROLE_TAGLINE: Record<string, string> = {
  Coordinator: 'Register applicants & banks, create projects, run valuations and manage the fleet.',
  'Technical Officer': 'Inspect sites, capture photos, generate descriptions and build valuation drafts.',
  'Manager L1': 'Review drafts submitted by L2, then reject or lock the final report.',
  'Manager L2': 'Review drafts from L3, correct issues, then reject or pass to L1.',
  'Manager L3': 'Check technical officers’ drafts and submit them up the review chain.',
  Admin: 'Add roles and oversee the whole valuation workflow.',
  'Loan Applicant': 'Submit property details and pay to release your valuation report.',
  Bank: 'View the finalised valuation reports for your projects once released.',
}

const TechnicalOfficerOverview = ({ userId }: { userId: string }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void getAssignments(userId).then((result) => {
      if (active) {
        setAssignments(result.assignments)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [userId])

  const pendingAcceptance = assignments.filter((item) => item.status === 'Technical Officer Assigned').length
  const corrections = assignments.filter((item) => item.reviewStatus.toLowerCase().includes('reject')).length
  const priorityProjects = assignments
    .filter((item) => !item.reviewStatus.toLowerCase().includes('locked'))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 3)
  const metrics = [
    { label: 'Assigned projects', value: assignments.length, hint: 'Total workload', icon: '🗂️' },
    { label: 'Needs response', value: pendingAcceptance, hint: 'Awaiting acceptance', icon: '⏳' },
    { label: 'Corrections', value: corrections, hint: 'Drafts returned to you', icon: '↩️' },
  ]

  return (
    <section className="space-y-5" aria-label="Technical officer workspace">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Today&apos;s work overview</h2>
          <p className="mt-1 text-sm text-emerald-100/65">Prioritise assignments, complete inspections, and progress reports.</p>
        </div>
        <Link to="/technical-officer/assignments" className="text-sm font-medium text-gold-300 hover:text-gold-200">View all projects →</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-start justify-between"><p className="text-sm text-emerald-100/70">{metric.label}</p><span className="text-lg" aria-hidden="true">{metric.icon}</span></div>
            <p className="mt-2 text-3xl font-bold text-gold-300">{loading ? '–' : metric.value}</p>
            <p className="mt-1 text-xs text-emerald-100/50">{metric.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-white">Priority projects</h3><span className="text-xs text-emerald-100/55">Next assignments</span></div>
          {loading ? <p className="mt-4 text-sm text-emerald-100/60">Loading your projects…</p> : priorityProjects.length === 0 ? <p className="mt-4 text-sm text-emerald-100/60">No active projects assigned right now.</p> : (
            <div className="mt-3 divide-y divide-white/10">
              {priorityProjects.map((project) => (
                <Link key={project.valuationRowId} to="/technical-officer/assignments" className="flex items-center justify-between gap-3 py-3 transition hover:text-gold-200">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{project.project.landName || project.projectId}</p><p className="mt-0.5 truncate text-xs text-emerald-100/60">{project.location.district || 'Location to be confirmed'} · {project.owner.name}</p></div>
                  <span className="shrink-0 text-xs text-gold-300">{project.status === 'Technical Officer Assigned' ? 'Respond' : 'Continue'} →</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-white">Continue workflow</h3>
          <div className="mt-3 space-y-2">
            <Link to="/technical-officer/assignments" className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-emerald-100 transition hover:border-gold-400/40 hover:text-gold-200">Review assignments</Link>
            <Link to="/technical-officer/inspections" className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-emerald-100 transition hover:border-gold-400/40 hover:text-gold-200">Record inspection data</Link>
            <Link to="/technical-officer/draft" className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-emerald-100 transition hover:border-gold-400/40 hover:text-gold-200">Create valuation draft</Link>
          </div>
        </Card>
      </div>
    </section>
  )
}

const DashboardPage = () => {
  const { user } = useAuth()
  if (!user) return null

  const actions: SidebarItem[] = [
    ...(roleMenus[user.role] ?? []),
    { label: 'Project Status', to: '/coordinator/project-states', icon: '📈' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white sm:text-4xl"><GradientText>Dashboard</GradientText></h1>
      <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />
      {user.role === 'Technical Officer' ? <TechnicalOfficerOverview userId={user.userId} /> : (
        <div>
          <p className="mb-3 text-sm text-emerald-100/70">{ROLE_TAGLINE[user.role] ?? 'Your workspace.'}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((a) => (
              <Link key={a.to} to={a.to} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-emerald-950/40 p-5 shadow-card backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-gold-400/40 hover:shadow-card-hover">
                <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-2xl transition group-hover:bg-gold-400/15">{a.icon}</div><span className="text-emerald-100/40">↗</span></div>
                <p className="mt-3 font-semibold text-gold-300">{a.label}</p><p className="mt-0.5 text-xs text-emerald-100/60">Open {a.label.toLowerCase()}</p>
              </Link>
            ))}
          </div>
          {actions.length === 1 && <Card className="mt-6 p-5 text-sm text-emerald-100/70">More options for your role will appear here as they are enabled.</Card>}
        </div>
      )}
    </div>
  )
}

export default DashboardPage

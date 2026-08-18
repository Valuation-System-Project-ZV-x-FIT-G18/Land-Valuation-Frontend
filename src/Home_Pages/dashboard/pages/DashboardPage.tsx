import { Link } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import WelcomeCard from '@/Home_Pages/dashboard/components/WelcomeCard'
import ManagerDashboard from '@/Home_Pages/dashboard/components/ManagerDashboard'
import CoordinatorDashboard from '@/Home_Pages/dashboard/components/CoordinatorDashboard'
import AdminDashboard from '@/Home_Pages/dashboard/components/AdminDashboard'
import ClientDashboard from '@/Home_Pages/dashboard/components/ClientDashboard'
import TechnicalOfficerDashboard from '@/Home_Pages/dashboard/components/TechnicalOfficerDashboard'
import { roleMenus, type SidebarItem } from '@/Common_Pages/components/sidebar/roleMenus'
import SidebarIcon from '@/Common_Pages/components/sidebar/SidebarIcon'
import '@/Home_Pages/dashboard/styles/dashboard-page.css'

// A short line describing what each role does from here.
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

// Dashboard shown after login — the quick actions differ by role.
const DashboardPage = () => {
  const { user } = useAuth()
  if (!user) return null
  if (user.role.startsWith('Manager L')) return <ManagerDashboard user={user} />
  if (user.role === 'Coordinator') return <CoordinatorDashboard user={user} />
  if (user.role === 'Admin') return <AdminDashboard user={user} />
  if (user.role === 'Bank') return <ClientDashboard user={user} audience="bank" />
  if (user.role === 'Loan Applicant') return <ClientDashboard user={user} audience="applicant" />
  if (user.role === 'Technical Officer') return <TechnicalOfficerDashboard user={user} />

  const isCoordinator = false

  // The role's own menu items + Project Status (available to everyone).
  const actions: SidebarItem[] = [
    ...(roleMenus[user.role] ?? []),
    { label: 'Project Status', to: '/coordinator/project-states', icon: 'map' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        <GradientText>Dashboard</GradientText>
      </h1>
      <WelcomeCard name={user.name} role={user.role} userId={user.userId} photoPath={user.photoPath} />

      {isCoordinator ? (
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9m5 10V5m5 14v-7m5 7V8" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300/80">Workspace overview</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-white">Coordination centre</h2>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-emerald-100/65">
                Manage the valuation workflow from one organised workspace. Use the sidebar to access applicant records, projects, valuations, payments and field operations.
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-200/50">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]" />
                System workspace is ready
              </div>
            </div>

            <div className="flex flex-col justify-center border-t border-white/10 bg-white/[0.025] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-200/45">Today</p>
              <p className="mt-2 font-display text-2xl font-semibold text-white">
                {new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date())}
              </p>
              <p className="mt-1 text-sm text-emerald-100/60">
                {new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
              </p>
              <div className="mt-5 h-px bg-gradient-to-r from-gold-400/40 to-transparent" />
              <p className="mt-4 text-xs leading-5 text-emerald-200/50">Select a section from the sidebar to begin your work.</p>
            </div>
          </div>
        </Card>
      ) : <div>
        <p className="mb-3 text-sm text-emerald-100/70">{ROLE_TAGLINE[user.role] ?? 'Your workspace.'}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-emerald-950/40 p-5 shadow-card backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-gold-400/40 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gold-300 transition group-hover:bg-gold-400/15">
                  <SidebarIcon name={a.icon} />
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-emerald-100/40 transition group-hover:translate-x-0.5 group-hover:text-gold-300"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </div>
              <p className="mt-3 font-semibold text-gold-300">{a.label}</p>
              <p className="mt-0.5 text-xs text-emerald-100/60">Open {a.label.toLowerCase()}</p>
            </Link>
          ))}
        </div>
      </div>}

      {!isCoordinator && actions.length === 1 && (
        <Card className="p-5 text-sm text-emerald-100/70">
          More options for your role will appear here as they are enabled.
        </Card>
      )}
    </div>
  )
}

export default DashboardPage

import { Link } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import WelcomeCard from '@/Home_Pages/dashboard/components/WelcomeCard'
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

      <div>
        <p className="mb-3 text-sm text-emerald-100/70">{ROLE_TAGLINE[user.role] ?? 'Your workspace.'}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-white/95 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-200 transition group-hover:bg-blue-700 group-hover:text-white">
                  <SidebarIcon name={a.icon} />
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </div>
              <p className="mt-3 font-semibold text-slate-900">{a.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">Open {a.label.toLowerCase()}</p>
            </Link>
          ))}
        </div>
      </div>

      {actions.length === 1 && (
        <Card className="p-5 text-sm text-emerald-100/70">
          More options for your role will appear here as they are enabled.
        </Card>
      )}
    </div>
  )
}

export default DashboardPage

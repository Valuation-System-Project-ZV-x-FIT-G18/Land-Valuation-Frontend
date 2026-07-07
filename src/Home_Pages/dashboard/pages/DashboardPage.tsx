import { Link } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import WelcomeCard from '@/Home_Pages/dashboard/components/WelcomeCard'
import { roleMenus, type SidebarItem } from '@/Common_Pages/components/sidebar/roleMenus'
import '@/Home_Pages/dashboard/styles/dashboard-page.css'

// A short line describing what each role does from here.
const ROLE_TAGLINE: Record<string, string> = {
  Coordinator: 'Register applicants & banks, create projects, run valuations and manage the fleet.',
  'Technical Officer': 'Inspect sites, capture photos, generate descriptions and build valuation drafts.',
  'Manager L1': 'Review drafts submitted by L2, then reject or lock the final report.',
  'Manager L2': 'Review drafts from L3, correct issues, then reject or pass to L1.',
  'Manager L3': 'Check technical officers’ drafts and submit them up the review chain.',
  Admin: 'Add roles and oversee the whole valuation workflow.',
  'Loan Applicant': 'Upload your documents and pay to release your valuation report.',
  Bank: 'View the finalised valuation reports for your projects once released.',
}

// Dashboard shown after login — the quick actions differ by role.
const DashboardPage = () => {
  const { user } = useAuth()
  if (!user) return null

  // The role's own menu items + Project Status (available to everyone).
  const actions: SidebarItem[] = [
    ...(roleMenus[user.role] ?? []),
    { label: 'Project Status', to: '/coordinator/project-states', icon: '📈' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        <GradientText>Dashboard</GradientText>
      </h1>
      <WelcomeCard name={user.name} role={user.role} userId={user.userId} />

      <div>
        <p className="mb-3 text-sm text-emerald-100/70">{ROLE_TAGLINE[user.role] ?? 'Your workspace.'}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-gold-400/40 hover:bg-white/10"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-2xl transition group-hover:bg-gold-400/15">
                {a.icon}
              </div>
              <p className="font-semibold text-gold-300">{a.label}</p>
              <p className="mt-0.5 text-xs text-emerald-100/60">Open {a.label.toLowerCase()} →</p>
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

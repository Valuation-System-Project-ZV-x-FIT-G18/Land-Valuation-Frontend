import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import WelcomeCard from './WelcomeCard'

const TechnicalOfficerDashboard = ({ user }: { user: AuthUser }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-white sm:text-4xl">
      <GradientText>Dashboard</GradientText>
    </h1>

    <WelcomeCard
      name={user.name}
      role={user.role}
      userId={user.userId}
      photoPath={user.photoPath}
    />

    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-400/15 text-accent-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9m5 10V5m5 14v-7m5 7V8" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">Workspace overview</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Field valuation workspace</h2>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-emerald-100">
            Manage assigned valuations, site inspections, property evidence and draft preparation from one organised workflow. Open an assigned project once, then follow the guided steps through to submission.
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]" />
            Technical Officer workspace is ready
          </div>
        </div>

        <div className="flex flex-col justify-center border-t border-white/10 bg-white/[0.025] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">Today</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">
            {new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date())}
          </p>
          <p className="mt-1 text-sm text-emerald-100">
            {new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
          <div className="mt-5 h-px bg-gradient-to-r from-accent-400/40 to-transparent" />
          <p className="mt-4 text-xs leading-5 text-emerald-200">Open Assigned Projects to begin or resume valuation work.</p>
        </div>
      </div>
    </Card>
  </div>
)

export default TechnicalOfficerDashboard

import { useNavigate } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Coordinator > Fleet Management (landing).
// Two creative navigation cards: View Summary and Assign Technical Officers.
const cards = [
  {
    to: '/coordinator/fleet-management/summary',
    icon: '📊',
    title: 'View Summary',
    text: "See the fleet at a glance — how many officers are available, assigned, on leave, or have rejected work.",
  },
  {
    to: '/coordinator/fleet-management/assign',
    icon: '🧑‍🔧',
    title: 'Assign Technical Officers',
    text: 'Review officer availability and assign pending valuations with a visit date & time.',
  },
  {
    to: '/coordinator/fleet-management/attendance',
    icon: '🗓️',
    title: 'TO Attendance',
    text: 'Review technical officer leave requests and approve or reject them before they affect availability.',
  },
]

const FleetManagementPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Fleet <GradientText>Management</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Manage the technical officer fleet and assign valuation work.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.to}
            type="button"
            onClick={() => navigate(c.to)}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-7 text-left shadow-xl transition hover:-translate-y-1 hover:border-gold-400/40 hover:bg-white/10"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-gold-500/20 text-3xl">
              {c.icon}
            </span>
            <h2 className="mt-5 text-xl font-bold text-white group-hover:text-gold-100">
              {c.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-emerald-100/70">{c.text}</p>
            <span className="mt-4 text-sm font-semibold text-gold-300">
              Open →
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FleetManagementPage

import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { getFleetOfficers, getLeaves } from '@/Role_Pages/coordinator/fleet-management/api/fleet'

// Fleet Management is one workspace, not four separate destinations. Everything
// here is about the same set of technical officers, so it lives behind a single
// sidebar entry with tabs across the top — the pattern operations dashboards
// use, where a supervisor moves between views of one dataset all day.
//
// The tabs are real routes, so each view stays deep-linkable, refresh-safe and
// backed by the browser's back button.
type Counts = { rejected: number; leaves: number }

type Tab = { to: string; label: string; badge?: keyof Counts }

const tabs: Tab[] = [
  { to: '/coordinator/fleet-management/summary', label: 'Summary' },
  { to: '/coordinator/fleet-management/assign', label: 'Assign Officers' },
  { to: '/coordinator/fleet-management/rejected', label: 'Rejected', badge: 'rejected' },
  { to: '/coordinator/fleet-management/attendance', label: 'Attendance', badge: 'leaves' },
]

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? 'border-accent-400 text-accent-200'
      : 'border-transparent text-emerald-100 hover:border-white/20 hover:text-white'
  }`

// A count badge is shown only when the tab needs the coordinator's attention,
// so a quiet fleet stays visually quiet.
const CountBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null
  return (
    <span className="rounded-full bg-accent-400/20 px-2 py-0.5 text-xs font-bold text-accent-200">
      {count}
    </span>
  )
}

const FleetWorkspace = () => {
  const location = useLocation()
  const [counts, setCounts] = useState<Counts>({ rejected: 0, leaves: 0 })

  // Re-read the counts whenever the coordinator switches tabs, so accepting a
  // rejection or approving leave is reflected without a manual refresh.
  const loadCounts = useCallback(async () => {
    const [officers, leaves] = await Promise.all([getFleetOfficers(), getLeaves()])
    setCounts({
      rejected: officers.rejected.length,
      leaves: leaves.filter((l) => l.status === 'Pending').length,
    })
  }, [])

  useEffect(() => {
    loadCounts()
  }, [loadCounts, location.pathname])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Fleet <GradientText>Management</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100">
          Manage the technical officer fleet and assign valuation work.
        </p>
      </div>

      <nav
        aria-label="Fleet Management sections"
        className="flex gap-1 overflow-x-auto border-b border-white/10"
      >
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={tabClass}>
            <span>{tab.label}</span>
            {tab.badge && <CountBadge count={counts[tab.badge]} />}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ refreshCounts: loadCounts }} />
    </div>
  )
}

export default FleetWorkspace

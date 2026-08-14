import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { roleMenus } from '@/Common_Pages/components/sidebar/roleMenus'
import SidebarIcon from '@/Common_Pages/components/sidebar/SidebarIcon'

// Fixed, full-height app sidebar for internal pages.
// 256px wide, pinned left on desktop; slides in as a drawer on mobile.

const itemBase =
  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-0.5'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${itemBase} ${
    isActive
      ? 'bg-blue-200 text-blue-950 shadow-sm ring-1 ring-blue-300'
      : 'text-slate-600 hover:bg-white hover:text-blue-800'
  }`

const Chip = ({ children, active }: { children: ReactNode; active: boolean }) => (
  <span
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition ${
      active ? 'bg-blue-600 text-white' : 'bg-slate-200/70 text-slate-600 group-hover:bg-blue-100'
    }`}
  >
    {children}
  </span>
)

const Item = (props: {
  to: string
  icon: ReactNode
  label: string
  end?: boolean
  onClick?: () => void
}) => (
  <NavLink to={props.to} end={props.end} onClick={props.onClick} className={linkClass}>
    {({ isActive }) => (
      <>
        {isActive && (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 animate-fade-in rounded-r bg-blue-600" />
        )}
        <Chip active={isActive}>{props.icon}</Chip>
        <span>{props.label}</span>
      </>
    )}
  </NavLink>
)

type SidebarProps = { open: boolean; onClose: () => void }

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = user ? (roleMenus[user.role] ?? []) : []

  const handleLogout = () => {
    onClose()
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Mobile dark overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-blue-200 bg-gradient-to-b from-blue-50 via-blue-100 to-[#dce9f8] shadow-lg transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 border-b border-slate-200 px-5 py-4"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-sky-500 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9" r="2.5" fill="currentColor" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-wide text-slate-900">CODEHUB</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Land Valuation
            </span>
          </span>
        </Link>

        {/* Menu (scrolls if long) */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Menu
          </p>
          <nav className="space-y-1">
            <Item to="/dashboard" icon={<SidebarIcon name="dashboard" />} label="Dashboard" end onClick={onClose} />
            {items.map((item) => (
              <Item key={item.to} to={item.to} icon={<SidebarIcon name={item.icon} />} label={item.label} onClick={onClose} />
            ))}
            {/* Project Status is available to every role (internal + external) */}
            <Item to="/coordinator/project-states" icon={<SidebarIcon name="map" />} label="Project Status" onClick={onClose} />
          </nav>
        </div>

        {/* Bottom: Settings + Logout */}
        <div className="space-y-1 border-t border-slate-200 p-3">
          <Item to="/settings" icon={<SidebarIcon name="settings" />} label="Settings" onClick={onClose} />
          <button
            type="button"
            onClick={handleLogout}
            className={`${itemBase} w-full text-emerald-100/70 hover:bg-red-500/10 hover:text-red-300`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base transition group-hover:bg-red-500/15">
              <SidebarIcon name="logout" />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

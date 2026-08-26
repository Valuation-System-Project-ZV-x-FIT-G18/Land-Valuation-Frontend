import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { roleMenuGroups, roleMenus, type SidebarSection } from '@/Common_Pages/components/sidebar/roleMenus'

// Fixed, full-height app sidebar for internal pages.
// 256px wide, pinned left on desktop; slides in as a drawer on mobile.

const itemBase =
  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-0.5'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${itemBase} ${
    isActive
      ? 'bg-gradient-to-r from-accent-400/25 to-transparent text-accent-100 shadow-sm'
      : 'text-emerald-100 hover:bg-white/5 hover:text-white'
  }`

const Item = (props: {
  to: string
  label: string
  nested?: boolean
  end?: boolean
  onClick?: () => void
}) => (
  <NavLink
    to={props.to}
    end={props.end}
    onClick={props.onClick}
    className={(state) => `${linkClass(state)} ${props.nested ? 'ml-3 py-2 text-[13px]' : ''}`}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 animate-fade-in rounded-r bg-accent-400 shadow-[0_0_10px_rgba(30, 150, 200,0.6)]" />
        )}
        <span>{props.label}</span>
      </>
    )}
  </NavLink>
)

type SidebarProps = { open: boolean; onClose: () => void }

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const items = user ? (roleMenus[user.role] ?? []) : []
  const groups = user ? (roleMenuGroups[user.role] ?? []) : []
  const [openSection, setOpenSection] = useState<SidebarSection | null>(null)

  // Keep the group containing the current page open, including after refresh.
  useEffect(() => {
    // Match nested pages too, so a tab or sub-page inside a section (e.g.
    // Fleet Management > Rejected) still opens and highlights its entry.
    const activeItem = items.find(
      (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
    )
    if (activeItem?.section) {
      setOpenSection(activeItem.section)
      return
    }
    // Roles without their own Projects entry reach the same list through the
    // shared Project Status link appended to their tracking group.
    if (location.pathname.startsWith('/coordinator/projects')) {
      const trackingGroup = groups.find((group) => group.includeProjectStatus)
      if (trackingGroup) setOpenSection(trackingGroup.id)
    }
  }, [groups, items, location.pathname])

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
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-surface shadow-card transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 border-b border-white/10 px-5 py-4"
        >
          {/* The same logo file the public header uses. The sidebar drew its own
              pin icon instead, so the brand visibly changed the moment anyone
              signed in. */}
          <img src="/images/codehub-logo.png" alt="" className="h-10 w-10 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-wide text-white">CODEHUB</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
              Land Valuation
            </span>
          </span>
        </Link>

        {/* Menu (scrolls if long) */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Workspace
            </p>
            <Item to="/dashboard" label="Dashboard" end onClick={onClose} />
            {user?.role === 'Coordinator' ? (
              items.map((item) => (
                <Item key={item.to} to={item.to} label={item.label} onClick={onClose} />
              ))
            ) : groups.map((section) => {
                const sectionItems = items.filter((item) => item.section === section.id)
                const onlyProjectStatus = section.includeProjectStatus && sectionItems.length === 0

                // A collapsible heading adds an unnecessary click when the
                // section contains only one destination. Render it directly.
                if (sectionItems.length + (section.includeProjectStatus ? 1 : 0) === 1) {
                  if (onlyProjectStatus) {
                    return <Item key={section.id} to="/coordinator/projects" label="Project Status" onClick={onClose} />
                  }
                  const item = sectionItems[0]
                  return <Item key={section.id} to={item.to} label={item.label} onClick={onClose} />
                }

                return (
                  <div key={section.id} className="overflow-hidden rounded-xl">
                    <button
                      type="button"
                      aria-expanded={openSection === section.id}
                      onClick={() => setOpenSection((current) => current === section.id ? null : section.id)}
                      className={`${itemBase} w-full justify-between text-left ${
                        openSection === section.id
                          ? 'bg-white/[0.07] text-white'
                          : 'text-emerald-100 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex min-w-0 items-center">
                        <span className="truncate">{section.label}</span>
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${openSection === section.id ? 'rotate-180 text-accent-300' : ''}`}
                      >
                        <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {openSection === section.id && (
                      <div className="mb-1 ml-4 space-y-0.5 border-l border-emerald-300/15 py-1">
                        {sectionItems.map((item) => (
                            <Item key={item.to} to={item.to} label={item.label} nested onClick={onClose} />
                          ))}
                        {section.includeProjectStatus && (
                          <Item to="/coordinator/projects" label="Project Status" nested onClick={onClose} />
                        )}
                      </div>
                    )}
                  </div>
                )
            })}
          </nav>
        </div>

        {/* Bottom: Settings + Logout */}
        <div className="space-y-1 border-t border-white/10 p-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Account
          </p>
          <Item to="/settings" label="Settings" onClick={onClose} />
          <button
            type="button"
            onClick={handleLogout}
            className={`${itemBase} w-full text-emerald-100 hover:bg-red-500/10 hover:text-red-300`}
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

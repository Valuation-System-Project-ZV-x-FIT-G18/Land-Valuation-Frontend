//01

import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import NotificationBell from '@/Common_Pages/components/layout/NotificationBell'
import Avatar from '@/Common_Pages/components/ui/Avatar'

// Top bar for internal pages. Right side: messages, notifications, user profile.
// Left side (mobile only): the hamburger that opens the sidebar drawer.

const IconButton = ({
  label,
  dot,
  onClick,
  children,
}: {
  label: string
  dot?: boolean
  onClick?: () => void
  children: ReactNode
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="relative rounded-lg p-2 text-emerald-100 transition hover:bg-white/10 hover:text-white"
  >
    {children}
    {dot && (
      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-400 ring-2 ring-surface" />
    )}
  </button>
)

const InternalTopbar = ({ onMenu }: { onMenu: () => void }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const onMessages = location.pathname === '/messages'

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-surface px-4 py-3 sm:px-6">
      {/* Mobile: open the sidebar */}
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="rounded-lg p-2 text-xl leading-none text-white transition hover:bg-white/10 md:hidden"
      >
        ☰
      </button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Click to open Messages; click again (while on it) to close/go back. */}
        <IconButton
          label={onMessages ? 'Close messages' : 'Messages'}
          onClick={() => (onMessages ? navigate(-1) : navigate('/messages'))}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </IconButton>

        <NotificationBell />

        {/* User profile — click to open a small dropdown with account details. */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-3 rounded-xl px-1 py-1 pr-1 transition hover:bg-white/5 sm:pl-2"
          >
            <Avatar userId={user?.userId ?? ''} name={user?.name ?? ''} photoPath={user?.photoPath} size="sm" />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs font-medium text-accent-300">{user?.role}</p>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`hidden h-4 w-4 text-emerald-100 transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <>
              {/* Click-away backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-card-hover">
                <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                  <Avatar userId={user?.userId ?? ''} name={user?.name ?? ''} photoPath={user?.photoPath} size="md" />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs font-medium text-accent-300">{user?.role}</p>
                  </div>
                </div>
                <dl className="space-y-2 px-4 py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <dt className="text-emerald-200">User ID</dt>
                    <dd className="font-medium text-white">{user?.userId}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-emerald-200">Role</dt>
                    <dd className="font-medium text-white">{user?.role}</dd>
                  </div>
                </dl>
                <div className="p-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/settings')
                    }}
                    className="w-full rounded-xl bg-accent-400/15 px-4 py-2 text-sm font-semibold text-accent-300 transition hover:bg-accent-400/25"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default InternalTopbar

import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import Sidebar from '@/Common_Pages/components/sidebar/Sidebar'
import InternalTopbar from '@/Common_Pages/components/layout/InternalTopbar'

// Which role each URL section belongs to. A user whose role doesn't match is
// redirected away, so e.g. a Loan Applicant can't open /admin/... by URL.
const ROLE_SECTIONS: { prefix: string; allow: (role: string) => boolean }[] = [
  { prefix: '/admin', allow: (r) => r === 'Admin' },
  { prefix: '/coordinator', allow: (r) => r === 'Coordinator' },
  { prefix: '/manager', allow: (r) => r.startsWith('Manager') },
  { prefix: '/technical-officer', allow: (r) => r === 'Technical Officer' },
  { prefix: '/applicant', allow: (r) => r === 'Loan Applicant' },
  { prefix: '/bank', allow: (r) => r === 'Bank' },
]

// Routes that live under a role's URL prefix but are shared with every role
// (e.g. Project Status is under /coordinator but every role links to it).
const SHARED_ROUTES = ['/coordinator/project-states']

// App shell for all internal (logged-in staff) pages.
// Fixed sidebar on the left (256px); content fills the area beside it.
// On mobile the sidebar becomes a slide-in drawer opened from the top bar.
const InternalLayout = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Not logged in -> send to the internal login page.
  if (!user) return <Navigate to="/login/internal" replace />

  // First login (loan applicant) -> must change password before anything else.
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  // Role guard: block a section that doesn't belong to this user's role,
  // unless the exact path is explicitly shared across every role.
  const section = ROLE_SECTIONS.find((s) => location.pathname.startsWith(s.prefix))
  if (section && !section.allow(user.role) && !SHARED_ROUTES.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Content area, offset by the sidebar width on desktop */}
      <div className="md:pl-64">
        {/* Top bar: messages, notifications, and the user profile on the right */}
        <InternalTopbar onMenu={() => setMobileOpen(true)} />

        <main className="px-4 py-8 sm:px-6 lg:px-10">
          {/* `key`ed on the path so each page fades up on navigation. */}
          <div key={location.pathname} className="mx-auto max-w-6xl animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default InternalLayout

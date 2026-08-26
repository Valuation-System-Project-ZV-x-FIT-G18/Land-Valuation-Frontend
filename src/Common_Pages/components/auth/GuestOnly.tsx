import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'

// Wraps pages that only make sense when signed out (the login pages).
// A session is shared across every tab of the browser, so a user who is
// already signed in must not see a login form again — send them straight
// to their dashboard instead.
const GuestOnly = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default GuestOnly

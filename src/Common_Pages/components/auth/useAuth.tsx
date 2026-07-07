import { createContext, useContext, type ReactNode } from 'react'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'

// Holds the currently logged-in user for the whole app.
// Stored in sessionStorage, so it survives a refresh but clears when the tab closes.

export type AuthUser = {
  userId: string
  name: string
  role: string
  mustChangePassword?: boolean // true until a first-login password change
}

type AuthValue = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useSessionState<AuthUser | null>('authUser', null)
  return (
    <AuthContext.Provider
      value={{ user, login: (u) => setUser(u), logout: () => setUser(null) }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

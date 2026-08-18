import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'

// Holds the currently logged-in user for the whole app.
// Stored in sessionStorage, so it survives a refresh but clears when the tab closes.

export type AuthUser = {
  userId: string
  name: string
  role: string
  mustChangePassword?: boolean // true until a first-login password change
  photoPath?: string // stored file name of the profile picture, if one was uploaded
}

type AuthValue = {
  user: AuthUser | null
  login: (user: AuthUser, accessToken?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useSessionState<AuthUser | null>('authUser', null)
  const [accessToken, setAccessToken] = useSessionState<string>('accessToken', '')

  useEffect(() => {
    const originalFetch = window.fetch.bind(window)
    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (!url.startsWith('/api/') || !accessToken) return originalFetch(input, init)
      const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined))
      headers.set('Authorization', `Bearer ${accessToken}`)
      const response = await originalFetch(input, { ...init, headers })
      // A request started with an older token may finish after the user has
      // logged in again. Never let that stale 401 erase the new session.
      const storedToken = (() => {
        try { return JSON.parse(sessionStorage.getItem('accessToken') ?? '""') as string }
        catch { return '' }
      })()
      if (response.status === 401 && storedToken === accessToken) {
        setUser(null)
        setAccessToken('')
      }
      return response
    }
    return () => { window.fetch = originalFetch }
  }, [accessToken])

  const login = (nextUser: AuthUser, token?: string) => {
    setUser(nextUser)
    if (token) setAccessToken(token)
  }
  const logout = () => { setUser(null); setAccessToken('') }
  return (
    <AuthContext.Provider
      value={{ user: accessToken ? user : null, login, logout }}
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

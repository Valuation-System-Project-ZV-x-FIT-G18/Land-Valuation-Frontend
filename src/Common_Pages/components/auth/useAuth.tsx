import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react'
import { useLocalState } from '@/Common_Pages/hooks/useLocalState'

// Holds the currently logged-in user for the whole app.
// Stored in localStorage so login/logout state is shared across browser tabs.

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
  const [user, setUser] = useLocalState<AuthUser | null>('authUser', null)
  const [accessToken, setAccessToken] = useLocalState<string>('accessToken', '')

  // Install authenticated fetch before child pages run their passive effects.
  // A normal useEffect races page-load API calls after a hard refresh.
  useLayoutEffect(() => {
    const originalFetch = window.fetch.bind(window)
    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (!url.startsWith('/api/')) return originalFetch(input, init)
      const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined))
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
      const requestInit = { ...init, headers, credentials: 'include' as RequestCredentials }
      const response = await originalFetch(input, requestInit)
      if (response.status !== 401 || url.startsWith('/api/auth/login') || url.startsWith('/api/auth/refresh')) {
        return response
      }

      const refreshed = await originalFetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      if (!refreshed.ok) {
        setUser(null)
        setAccessToken('')
        return response
      }
      const body = await refreshed.json() as { accessToken?: string }
      if (!body.accessToken) return response
      setAccessToken(body.accessToken)
      headers.set('Authorization', `Bearer ${body.accessToken}`)
      return originalFetch(input, { ...requestInit, headers })
    }
    return () => { window.fetch = originalFetch }
  }, [accessToken])

  const login = (nextUser: AuthUser, token?: string) => {
    setUser(nextUser)
    if (token) setAccessToken(token)
  }
  const logout = () => {
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    setAccessToken('')
  }
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

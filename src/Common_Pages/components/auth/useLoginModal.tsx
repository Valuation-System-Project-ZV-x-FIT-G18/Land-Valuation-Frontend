import { createContext, useContext, useState, type ReactNode } from 'react'

// Small shared state for the Login popup, so different parts of the app
// (the Login button, the Header, the Layout) can all read/control it.

type LoginModalValue = {
  open: boolean
  openLogin: () => void
  closeLogin: () => void
}

const LoginModalContext = createContext<LoginModalValue | null>(null)

export const LoginModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <LoginModalContext.Provider
      value={{
        open,
        openLogin: () => setOpen(true),
        closeLogin: () => setOpen(false),
      }}
    >
      {children}
    </LoginModalContext.Provider>
  )
}

export const useLoginModal = () => {
  const ctx = useContext(LoginModalContext)
  if (!ctx) {
    throw new Error('useLoginModal must be used within a LoginModalProvider')
  }
  return ctx
}

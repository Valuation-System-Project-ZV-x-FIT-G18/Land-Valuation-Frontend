import { Outlet, useLocation } from 'react-router-dom'
import Header from '@/Common_Pages/components/layout/Header'
import Footer from '@/Common_Pages/components/layout/Footer'
import LoginChoiceModal from '@/Common_Pages/components/auth/LoginChoiceModal'
import { useLoginModal } from '@/Common_Pages/components/auth/useLoginModal'

// Marketing layout for the PUBLIC pages (home, request valuation, login).
// Provides the shared background, the Header (logo + CODEHUB name), and Footer.
// Internal/dashboard pages use InternalLayout instead.

const Layout = () => {
  const { open, closeLogin } = useLoginModal()
  // `key`ed on the path so each page fades/slides in on navigation.
  const location = useLocation()

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-800 to-green-700">
      {/* Decorative background: soft brand glow + two floating blobs.
          Green = land/nature, gold = value. Sizes grow with the screen. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden bg-brand-radial">
        <div className="absolute -top-10 -right-10 h-48 w-48 animate-float rounded-full bg-emerald-500 opacity-20 mix-blend-multiply blur-3xl sm:h-72 sm:w-72 lg:h-96 lg:w-96" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 animate-float rounded-full bg-gold-500 opacity-20 mix-blend-multiply blur-3xl sm:h-72 sm:w-72 lg:h-96 lg:w-96" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header shows on every page */}
      <Header />

      {/* Each page's own content is rendered here, above the background.
          flex-1 pushes the Footer to the bottom on short pages. */}
      <main key={location.pathname} className="relative z-10 flex-1 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer shows on every page */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Login popup — rendered here so it layers above the header */}
      <LoginChoiceModal open={open} onClose={closeLogin} />
    </div>
  )
}

export default Layout

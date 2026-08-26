import { Outlet, useLocation } from 'react-router-dom'
import Header from '@/Common_Pages/components/layout/Header'
import Footer from '@/Common_Pages/components/layout/Footer'

// Marketing layout for the PUBLIC pages (home, request valuation, login).
// Provides the shared background, the Header (logo + CODEHUB name), and Footer.
// Internal/dashboard pages use InternalLayout instead.

const Layout = () => {
  // `key`ed on the path so each page fades/slides in on navigation.
  const location = useLocation()

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-surface-sunken">
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

    </div>
  )
}

export default Layout

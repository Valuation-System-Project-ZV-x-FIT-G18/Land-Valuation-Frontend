// Header component for the Land Valuation System.
// Left side: a professional logo mark + the company name "CODEHUB".
// Styled as a sticky "glass" bar that floats above the page background.
// On mobile the nav collapses into a hamburger menu.

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLoginModal } from '@/Common_Pages/components/auth/useLoginModal'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
]

const Header = () => {
  const location = useLocation()
  const { open: loginOpen } = useLoginModal()
  const [menuOpen, setMenuOpen] = useState(false)
  // The Home/About/Services/Contact menu belongs on the public marketing pages,
  // and is hidden while the login popup is open.
  const showMenu =
    ['/', '/about', '/services', '/contact'].includes(location.pathname) && !loginOpen

  // Underline that grows from the left on hover; solid when on the active page.
  const linkClass = (to: string) => {
    const active = location.pathname === to
    return `relative text-sm font-medium transition-colors duration-200 sm:text-base after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-blue-600 after:transition-all after:duration-300 ${
      active
        ? 'text-blue-700 after:w-full'
        : 'text-slate-600 hover:text-blue-700 after:w-0 hover:after:w-full'
    }`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-8 sm:py-4">
        {/* ---- Left side: logo + company name ---- */}
        <Link
          to="/"
          className="group flex items-center gap-3 outline-none"
          aria-label="CODEHUB home"
        >
          <img
            src="/images/codehub-logo.png"
            alt="CODEHUB logo"
            className="h-16 w-16 transition-transform duration-300 group-hover:scale-105"
          />

          <span className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-slate-950 to-blue-700 bg-clip-text text-xl font-bold tracking-wide text-transparent sm:text-2xl">
              CODEHUB
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
              Land Valuation
            </span>
          </span>
        </Link>

        {/* ---- Right side: menu items ----
            Full nav on desktop; hamburger on mobile. Hidden during login popup. */}
        {showMenu && (
          <>
            <nav className="ml-auto hidden items-center gap-8 sm:flex">
              {NAV.map((item) => (
                <Link key={item.label} to={item.to} className={linkClass(item.to)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="ml-auto rounded-lg p-2 text-slate-700 transition hover:bg-blue-50 sm:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
                {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Mobile dropdown panel */}
      {showMenu && menuOpen && (
        <nav className="animate-fade-in border-t border-slate-200 bg-white px-4 py-3 shadow-lg sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-base font-medium transition ${
                location.pathname === item.to
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Header

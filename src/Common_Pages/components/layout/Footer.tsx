// Footer shown on every page (added once in components/Layout.tsx).
// Simple: the CODEHUB brand name and a copyright line.

const Footer = () => {
  return (
    <footer className="border-t border-gold-500/20 bg-emerald-950/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-emerald-100/70 sm:px-8">
        &copy; All rights reserved.
      </div>
    </footer>
  )
}

export default Footer

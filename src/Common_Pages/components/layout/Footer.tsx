// Footer shown on every page (added once in components/Layout.tsx).
// Simple: the CODEHUB brand name and a copyright line.

const Footer = () => {
  return (
    <footer className="border-t border-accent-500/20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-emerald-100 sm:px-8">
        &copy; All rights reserved.
      </div>
    </footer>
  )
}

export default Footer

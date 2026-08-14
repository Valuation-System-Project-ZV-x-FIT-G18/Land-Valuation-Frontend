// Footer shown on every page (added once in components/Layout.tsx).
// Simple: the CODEHUB brand name and a copyright line.

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-8">
        <span className="font-semibold text-slate-700">CODEHUB Land Valuation</span>
        <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer

// A small colored pill for a project / valuation status.
// The color is picked from keywords so new status names still look sensible.
const toneFor = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('reject') || s.includes('cancel') || s.includes('fail'))
    return 'border-red-400/30 bg-red-500/15 text-red-200'
  if (s.includes('complet') || s.includes('valued') || s.includes('approv') || s.includes('done'))
    return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
  if (
    s.includes('review') ||
    s.includes('progress') ||
    s.includes('pending') ||
    s.includes('submit') ||
    s.includes('assign')
  )
    return 'border-amber-400/30 bg-amber-400/15 text-amber-200'
  return 'border-white/20 bg-white/10 text-emerald-100'
}

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneFor(
      status,
    )}`}
  >
    {status || 'Unknown'}
  </span>
)

export default StatusBadge

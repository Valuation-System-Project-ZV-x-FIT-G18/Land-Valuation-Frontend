// Live-filter search box shared by every Manager review table (Check Drafts,
// Corrections, Final Reports, Approved, Rejected). Filters client-side as the
// manager types — no extra request.
type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

const SearchBox = ({ value, onChange, placeholder = 'Search by Project ID, owner or location…' }: Props) => (
  <div className="relative mx-auto max-w-lg">
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-emerald-200/40 outline-none transition focus:border-accent-400/60 focus:ring-2 focus:ring-accent-400/30"
    />
  </div>
)

export default SearchBox

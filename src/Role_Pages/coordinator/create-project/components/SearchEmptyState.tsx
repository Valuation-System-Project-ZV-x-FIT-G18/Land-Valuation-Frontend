// Empty state shown before any search is run on the Create Project page.
// A house + magnifier illustration, a prompt, and a few feature chips.

const chips = ['NIC Lookup', 'Linked Projects', 'Instant Results']

const SearchEmptyState = () => (
  <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
    <svg viewBox="0 0 120 96" className="mx-auto h-24 w-auto" fill="none">
      {/* house */}
      <path d="M28 48 L55 26 L82 48 V82 H28 Z" fill="#d1fae5" />
      <path d="M24 50 L55 24 L86 50" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="48" y="62" width="14" height="20" rx="1" fill="#10b981" />
      <rect x="34" y="56" width="10" height="10" rx="1" fill="#6ee7b7" />
      <rect x="66" y="56" width="10" height="10" rx="1" fill="#6ee7b7" />
      {/* magnifier */}
      <circle cx="84" cy="44" r="15" fill="#064e3b" stroke="#E3C24A" strokeWidth="4" />
      <circle cx="84" cy="44" r="15" fill="#38bdf8" opacity="0.12" />
      <line x1="95" y1="55" x2="108" y2="68" stroke="#E3C24A" strokeWidth="6" strokeLinecap="round" />
      {/* sparkles */}
      <circle cx="22" cy="40" r="2" fill="#E3C24A" />
      <circle cx="98" cy="74" r="2" fill="#E3C24A" />
      <circle cx="70" cy="20" r="1.5" fill="#6ee7b7" />
    </svg>

    <h3 className="mt-4 text-xl font-bold text-white">Search for an Applicant</h3>
    <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
      Enter an applicant NIC number above to instantly find their account and
      linked projects.
    </p>

    <div className="mt-5 flex flex-wrap justify-center gap-2">
      {chips.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-emerald-100/80"
        >
          {label}
        </span>
      ))}
    </div>
  </div>
)

export default SearchEmptyState

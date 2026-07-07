// Search box for the Project Status page. Pick a mode (NIC or Project ID),
// then the list filters live as you type.
export type SearchMode = 'nic' | 'project'

type ProjectSearchBarProps = {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  value: string
  onChange: (v: string) => void
}

const modes: [SearchMode, string][] = [
  ['nic', 'Search by NIC'],
  ['project', 'Search by Project ID'],
]

const ProjectSearchBar = ({ mode, onModeChange, value, onChange }: ProjectSearchBarProps) => (
  <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8">
    {/* Mode toggle */}
    <div className="flex justify-center">
      <div className="inline-flex rounded-xl border border-white/10 bg-emerald-950/40 p-1">
        {modes.map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === m
                ? 'bg-gradient-to-r from-amber-300 to-gold-400 text-emerald-950 shadow'
                : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* Live-filter input */}
    <div className="relative mt-6">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/40">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={mode === 'nic' ? 'Type a NIC to filter…' : 'Type a Project ID to filter…'}
        className="w-full rounded-xl border border-white/15 bg-white/5 py-3.5 pl-11 pr-4 text-white placeholder-emerald-200/40 outline-none transition focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
      />
    </div>
    <p className="mt-2 text-center text-xs text-emerald-200/50">Results filter as you type.</p>
  </div>
)

export default ProjectSearchBar

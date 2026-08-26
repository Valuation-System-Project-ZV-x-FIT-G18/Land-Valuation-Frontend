// Search box for the Project Status page. Pick a mode (NIC or Project ID),
// then the list filters live as you type.
export type SearchMode = 'nic' | 'project'

type ProjectSearchBarProps = {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  value: string
  onChange: (v: string) => void
}

const ProjectSearchBar = ({ mode, onModeChange, value, onChange }: ProjectSearchBarProps) => (
  <div className="mx-auto grid max-w-3xl gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-card sm:grid-cols-[11rem_1fr]">
    <select
      aria-label="Search field"
      value={mode}
      onChange={(event) => onModeChange(event.target.value as SearchMode)}
      className="rounded-xl border border-white/15 bg-surface px-4 py-3 text-sm font-medium text-white outline-none focus:border-accent-400/60 focus:ring-2 focus:ring-accent-400/30"
    >
      <option value="nic" className="bg-surface">NIC</option>
      <option value="project" className="bg-surface">Project ID</option>
    </select>
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={mode === 'nic' ? 'Search by NIC' : 'Search by Project ID'}
        className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-11 pr-10 text-white placeholder-emerald-200/40 outline-none transition focus:border-accent-400/60 focus:ring-2 focus:ring-accent-400/30"
      />
      {value && <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-100 hover:text-white">×</button>}
    </div>
  </div>
)

export default ProjectSearchBar

import type { ReactNode } from 'react'

// Compact metric tile: a big value, a label, and an optional icon. Used for
// dashboard/summary stat rows (e.g. counts of officers, projects, valuations).

type StatCardProps = {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
  className?: string
}

const StatCard = ({ label, value, icon, hint, className = '' }: StatCardProps) => (
  <div
    className={`card-hover rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-card backdrop-blur-sm hover:border-gold-400/30 ${className}`}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/60">
        {label}
      </p>
      {icon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/10 text-lg ring-1 ring-gold-400/20">
          {icon}
        </span>
      )}
    </div>
    <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-emerald-100/50">{hint}</p>}
  </div>
)

export default StatCard

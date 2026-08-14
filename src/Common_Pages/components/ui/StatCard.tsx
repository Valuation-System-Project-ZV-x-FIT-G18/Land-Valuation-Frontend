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
    className={`card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md ${className}`}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {icon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700 ring-1 ring-blue-100">
          {icon}
        </span>
      )}
    </div>
    <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
)

export default StatCard

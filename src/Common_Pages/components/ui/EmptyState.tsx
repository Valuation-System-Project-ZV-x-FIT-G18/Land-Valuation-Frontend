import type { ReactNode } from 'react'

// Friendly placeholder for "nothing here yet" states (empty lists, no results,
// before a search). Keeps empty screens intentional and on-brand instead of a
// bare line of grey text.
//   icon:   large emoji or SVG shown in a soft gold circle
//   title:  short headline
//   message: optional supporting line
//   action:  optional button/link node

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
  className?: string
}

const EmptyState = ({
  icon = '📭',
  title,
  message,
  action,
  className = '',
}: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center ${className}`}
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400/10 text-3xl ring-1 ring-gold-400/20">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {message && (
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-emerald-100/60">
        {message}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export default EmptyState

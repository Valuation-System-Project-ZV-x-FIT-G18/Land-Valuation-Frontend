import type { ReactNode } from 'react'

// Small status pill. Pick a `tone` directly, or pass `status` text and let the
// component infer a tone from common keywords (approved/pending/rejected…),
// so status colouring is consistent everywhere instead of re-written per page.

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

type BadgeProps = {
  children: ReactNode
  tone?: Tone
  status?: string
  className?: string
}

const toneClass: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-emerald-100 ring-emerald-700',
  accent: 'bg-accent-50 text-accent-100 ring-accent-400/30',
  success: 'bg-emerald-400/12 text-emerald-600 ring-emerald-400/35',
  warning: 'bg-amber-50 text-amber-100 ring-amber-400/35',
  danger: 'bg-red-50 text-red-100 ring-red-400/35',
  info: 'bg-sky-50 text-sky-100 ring-sky-400/35',
}

// Map free-text status words to a tone.
const inferTone = (status: string): Tone => {
  const s = status.toLowerCase()
  if (/(reject|fail|declin|cancel|error|overdue)/.test(s)) return 'danger'
  if (/(pending|await|review|progress|draft)/.test(s)) return 'warning'
  if (/(approv|complete|done|paid|verified|released|active|locked)/.test(s))
    return 'success'
  if (/(assign|new|submitted|sent)/.test(s)) return 'info'
  return 'neutral'
}

const Badge = ({ children, tone, status, className = '' }: BadgeProps) => {
  const resolved = tone ?? (status ? inferTone(status) : 'neutral')
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${toneClass[resolved]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge

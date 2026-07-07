import type { ReactNode } from 'react'

// Small status pill. Pick a `tone` directly, or pass `status` text and let the
// component infer a tone from common keywords (approved/pending/rejected…),
// so status colouring is consistent everywhere instead of re-written per page.

type Tone = 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'info'

type BadgeProps = {
  children: ReactNode
  tone?: Tone
  status?: string
  className?: string
}

const toneClass: Record<Tone, string> = {
  neutral: 'bg-white/10 text-emerald-100/80 ring-white/15',
  gold: 'bg-gold-400/15 text-gold-200 ring-gold-400/30',
  success: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30',
  warning: 'bg-amber-400/15 text-amber-200 ring-amber-400/30',
  danger: 'bg-red-500/15 text-red-200 ring-red-400/30',
  info: 'bg-sky-500/15 text-sky-200 ring-sky-400/30',
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClass[resolved]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge

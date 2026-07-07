import type { ReactNode } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Standard page heading: an optional eyebrow, a large title (with the accented
// word in gold), a subtitle, and an optional actions slot on the right. Using
// this everywhere keeps every page's hero consistent instead of hand-written.
//   title:     plain string; the `accent` word/phrase is gold-gradiented
//   accent:    optional highlighted portion appended after the title
//   eyebrow:   small uppercase label above the title
//   subtitle:  supporting line under the title
//   actions:   buttons/links shown on the right (wraps below on mobile)

type PageHeaderProps = {
  title: string
  accent?: string
  eyebrow?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

const PageHeader = ({
  title,
  accent,
  eyebrow,
  subtitle,
  actions,
  className = '',
}: PageHeaderProps) => (
  <div
    className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
  >
    <div>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300/80">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        {title}
        {accent && (
          <>
            {' '}
            <GradientText>{accent}</GradientText>
          </>
        )}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm text-emerald-100/70 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
)

export default PageHeader

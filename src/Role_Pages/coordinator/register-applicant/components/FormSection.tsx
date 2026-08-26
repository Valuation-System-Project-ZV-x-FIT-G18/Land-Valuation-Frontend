import type { ReactNode } from 'react'

// Reusable section header + grouped fields for the registration form.
const FormSection = ({
  icon,
  title,
  description,
  number,
  children,
}: {
  icon?: string
  title: string
  description?: string
  number?: number
  children: ReactNode
}) => (
  <section className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
    <div className="mb-5 flex items-start gap-3 border-b border-white/10 pb-4">
      {number && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-300/25 bg-accent-300/10 text-sm font-bold text-accent-200">{number}</span>}
      {icon && <span className="text-base">{icon}</span>}
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-emerald-100">{description}</p>}
      </div>
    </div>
    <div className="space-y-5">{children}</div>
  </section>
)

export default FormSection

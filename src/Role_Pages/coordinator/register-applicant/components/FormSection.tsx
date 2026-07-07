import type { ReactNode } from 'react'

// Reusable section header + grouped fields for the registration form.
const FormSection = ({
  icon,
  title,
  children,
}: {
  icon?: string
  title: string
  children: ReactNode
}) => (
  <section className="space-y-4">
    <h3 className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-wider text-gold-300">
      {icon && <span className="text-base">{icon}</span>}
      {title}
    </h3>
    {children}
  </section>
)

export default FormSection

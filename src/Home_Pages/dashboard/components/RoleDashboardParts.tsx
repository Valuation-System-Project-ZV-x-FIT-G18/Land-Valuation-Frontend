import type { ReactNode } from 'react'
import Card from '@/Common_Pages/components/ui/Card'

export type SummaryItem = { label: string; value: number; hint: string; tone: string }

export const SummaryCards = ({ items, loading }: { items: SummaryItem[]; loading: boolean }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy={loading}>
    {items.map((item) => (
      <Card key={item.label} className="p-5">
        <span className={`block h-2.5 w-2.5 rounded-full ${item.tone}`} />
        <p className="mt-5 text-3xl font-bold text-white">{loading ? '—' : item.value}</p>
        <p className="mt-1 text-sm font-semibold text-emerald-100">{item.label}</p>
        <p className="mt-1 text-xs text-emerald-100">{item.hint}</p>
      </Card>
    ))}
  </div>
)

export const SectionCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <Card className="overflow-hidden">
    <div className="h-1 bg-gradient-to-r from-amber-200 via-accent-300 to-amber-400" />
    <div className="p-5 sm:p-7">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-emerald-100">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  </Card>
)

export const LoadingRows = () => (
  <div className="space-y-3" role="status">
    {[0, 1, 2].map((row) => <div key={row} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
    <span className="sr-only">Loading dashboard information</span>
  </div>
)

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-9 text-center text-sm text-emerald-100">{children}</p>
)

export const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

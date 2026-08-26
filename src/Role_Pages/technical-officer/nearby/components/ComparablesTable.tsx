import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import type { Comparable } from '@/Role_Pages/technical-officer/nearby/api/nearby'

type Props = {
  comparables: Comparable[]
  aiUsed: boolean
  loading: boolean
  onChange: (index: number, field: keyof Comparable, value: string | number) => void
  onRefresh: () => void
  onAdd: () => void
  onDelete: (index: number) => void
}

const Field = ({ label, children }: { label: string; children: React.ReactNode; wide?: boolean }) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-emerald-200">{label}</span>
    {children}
  </label>
)

const distanceQuality = (km: number) => {
  if (!km) return { label: 'Distance required', tone: 'border-amber-400/30 bg-amber-400/10 text-amber-200' }
  if (km <= 0.5) return { label: 'Strong proximity', tone: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' }
  if (km <= 2) return { label: 'Usable proximity', tone: 'border-accent-400/30 bg-accent-400/10 text-accent-200' }
  return { label: 'Outside 2 km', tone: 'border-red-400/30 bg-red-400/10 text-red-200' }
}

const recencyQuality = (date: string) => {
  if (!date) return { label: 'Date required', tone: 'border-amber-400/30 bg-amber-400/10 text-amber-200' }
  const age = (Date.now() - new Date(date).getTime()) / 31_557_600_000
  if (age <= 1) return { label: 'Recent ≤ 1 year', tone: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' }
  if (age <= 2) return { label: 'Usable ≤ 2 years', tone: 'border-accent-400/30 bg-accent-400/10 text-accent-200' }
  return { label: 'Older than 2 years', tone: 'border-red-400/30 bg-red-400/10 text-red-200' }
}

const LAND_TYPES = [
  'Bare / Residential Land',
  'Residential Land',
  'Commercial Land',
  'Agricultural Land',
  'Mixed-use Land',
  'Other',
]

const ComparablesTable = ({ comparables, aiUsed, loading, onChange, onRefresh, onAdd, onDelete }: Props) => (
  <Card className="overflow-hidden">
    <div className="hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300">Comparable selection</p>
          <h3 className="mt-1 text-lg font-bold text-white">Find suitable nearby lands</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-100">
            Results must be close, recent and physically comparable to the subject land. Search results are
            candidates only and must be verified before valuation.
          </p>
        </div>
        <Button type="button" variant="outline" loading={loading} onClick={onRefresh} className="shrink-0">
          {loading ? 'Searching nearby lands…' : '⌖ Find nearby lands'}
        </Button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {[
          ['01', 'Distance', 'Prefer ≤ 500 m; maximum 2 km'],
          ['02', 'Recency', 'Current or within the last 2 years'],
          ['03', 'Extent', 'Prefer a similar land extent'],
        ].map(([number, title, text]) => (
          <div key={number} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <span className="text-[10px] font-bold text-accent-300">{number}</span>
            <p className="mt-1 text-xs font-semibold text-white">{title}</p>
            <p className="mt-1 text-[11px] leading-4 text-emerald-100">{text}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="flex justify-end border-b border-white/10 p-4 sm:px-6">
      <Button type="button" variant="outline" loading={loading} onClick={onRefresh}>
        {loading ? 'Searching nearby lands...' : 'Find nearby lands'}
      </Button>
    </div>

    <div className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Comparable candidates</h4>
          <p className="text-xs text-emerald-100">
            {comparables.length ? `${comparables.length} land${comparables.length === 1 ? '' : 's'} ranked from nearest to farthest` : 'No verified nearby lands loaded'}
          </p>
        </div>
        {aiUsed && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold text-emerald-200">Web results</span>}
      </div>

      {comparables.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 px-5 py-10 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-400/10 text-xl">⌖</div>
          <h5 className="mt-3 font-semibold text-white">No suitable nearby lands found yet</h5>
          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-emerald-100">
            Run the nearby search. If it returns no verifiable candidate, add one land confirmed through a field enquiry,
            owner, broker, deed or reliable property source.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comparables.map((c, i) => {
          const quality = distanceQuality(Number(c.distanceKm))
          const recency = recencyQuality(c.saleDate)
          return (
            <section key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
              <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400/15 text-xs font-bold text-accent-200">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-sm font-semibold text-white">Nearby Land {String(i + 1).padStart(2, '0')}</p>
                  <p className="text-[11px] text-emerald-100">{c.area || 'Location not entered'}</p>
                </div>
                <span className={`ml-auto rounded-full border px-2.5 py-1 text-[10px] font-semibold ${quality.tone}`}>{quality.label}</span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${recency.tone}`}>{recency.label}</span>
                <button type="button" onClick={() => onDelete(i)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-emerald-100 hover:border-red-400/40 hover:text-red-300">Remove</button>
              </div>

              <div className="grid gap-3 p-4">
                <Field label="Location / area"><Input sizeVariant="sm" value={c.area} onChange={(e) => onChange(i, 'area', e.target.value)} placeholder="Village, road or locality" /></Field>
                <Field label="Distance from subject"><Input sizeVariant="sm" type="number" value={c.distanceKm || ''} onChange={(e) => onChange(i, 'distanceKm', Number(e.target.value))} placeholder="Distance in km" /></Field>
                <Field label="Land type">
                  <select
                    value={c.propertyType || 'Bare / Residential Land'}
                    onChange={(e) => onChange(i, 'propertyType', e.target.value)}
                    className="h-9 w-full rounded-lg border border-white/15 bg-surface px-3 text-sm text-white outline-none focus:border-accent-400/60"
                  >
                    {LAND_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </Field>
                <Field label="Extent"><Input sizeVariant="sm" type="number" value={c.extentPerches || ''} onChange={(e) => onChange(i, 'extentPerches', Number(e.target.value))} placeholder="Perches" /></Field>
                <Field label="Evidence date"><Input sizeVariant="sm" type="date" value={c.saleDate} onChange={(e) => onChange(i, 'saleDate', e.target.value)} /></Field>
                <Field label="Price per perch"><Input sizeVariant="sm" type="number" value={c.pricePerPerch || ''} onChange={(e) => onChange(i, 'pricePerPerch', Number(e.target.value))} placeholder="Rs. per perch" /></Field>
                <Field label="Reference / listing link" wide><Input sizeVariant="sm" value={c.refNo || c.source} onChange={(e) => onChange(i, 'refNo', e.target.value)} placeholder="Listing URL or enquiry reference" /></Field>
                <Field label="Similarity / adjustment notes" wide><Input sizeVariant="sm" value={c.note} onChange={(e) => onChange(i, 'note', e.target.value)} placeholder="Record relevant similarities, differences and valuation adjustments" /></Field>
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {comparables.length < 3 && <Button type="button" variant="outline" size="sm" onClick={onAdd}>+ Add nearby land</Button>}
        {comparables.length >= 3 && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">Maximum 3 candidates selected</span>}
        <span className="text-[11px] text-emerald-100">Use the listing link or enquiry reference when it is available.</span>
      </div>
    </div>
  </Card>
)

export default ComparablesTable

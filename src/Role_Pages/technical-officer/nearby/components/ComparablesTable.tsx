import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import Select from '@/Common_Pages/components/ui/Select'
import EmptyState from '@/Common_Pages/components/ui/EmptyState'
import type { Comparable } from '@/Role_Pages/technical-officer/nearby/api/nearby'

const TYPES = ['Recent Land Sale', 'Current Market Asking Price']

type Props = {
  comparables: Comparable[]
  aiUsed: boolean
  loading: boolean
  onChange: (index: number, field: keyof Comparable, value: string | number) => void
  onRefresh: () => void
  onAdd: () => void
  onDelete: (index: number) => void
}

const ComparablesTable = ({ comparables, aiUsed, loading, onChange, onRefresh, onAdd, onDelete }: Props) => (
  <Card className="p-5 sm:p-6">
    <div className="mb-1 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-gold-300">🏷️ Compare Nearby Land — 5 nearest listings</h3>
      <Button type="button" variant="outline" size="sm" loading={loading} onClick={onRefresh}>
        {loading ? 'Searching…' : '↻ Search the web'}
      </Button>
    </div>
    <p className="mb-3 text-xs text-emerald-100/60">
      Researched across the web (any property site) via AI, with each listing&apos;s real source
      {aiUsed ? '' : ' — AI is off or unavailable, so enter listings manually'}. Please verify every
      price before use — all fields are editable.
    </p>

    <div className="space-y-3">
      {comparables.map((c, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-white">#{i + 1}</span>
            <Input
              sizeVariant="sm"
              fullWidth={false}
              aria-label="Source (site / URL)"
              value={c.source}
              onChange={(e) => onChange(i, 'source', e.target.value)}
              placeholder="Source (site / URL)"
              className="w-48"
            />
            <Select
              sizeVariant="sm"
              aria-label="Evidence type"
              options={TYPES}
              value={c.evidenceType}
              onChange={(e) => onChange(i, 'evidenceType', e.target.value)}
            />
            <div className="ml-auto flex items-center gap-1 text-xs text-emerald-100/70">
              <span>Rs.</span>
              <Input
                sizeVariant="sm"
                type="number"
                fullWidth={false}
                aria-label="Price per perch"
                value={c.pricePerPerch || ''}
                onChange={(e) => onChange(i, 'pricePerPerch', Number(e.target.value))}
                className="w-32 text-right font-semibold text-gold-200"
                placeholder="price / perch"
              />
              <span>/P</span>
              <button
                type="button"
                onClick={() => onDelete(i)}
                aria-label="Remove comparable"
                className="ml-1 rounded-lg border border-white/15 px-2 py-1 text-xs text-emerald-200/70 transition hover:border-red-400/50 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <Input sizeVariant="sm" aria-label="Area" value={c.area} onChange={(e) => onChange(i, 'area', e.target.value)} placeholder="Area" />
            <Input sizeVariant="sm" aria-label="Reference number" value={c.refNo} onChange={(e) => onChange(i, 'refNo', e.target.value)} placeholder="Ref. No" />
            <Input sizeVariant="sm" aria-label="Sale date" value={c.saleDate} onChange={(e) => onChange(i, 'saleDate', e.target.value)} placeholder="Date" />
            <Input sizeVariant="sm" type="number" aria-label="Extent in perches" value={c.extentPerches || ''} onChange={(e) => onChange(i, 'extentPerches', Number(e.target.value))} placeholder="Extent (P)" />
            <Input sizeVariant="sm" type="number" aria-label="Distance in km" value={c.distanceKm || ''} onChange={(e) => onChange(i, 'distanceKm', Number(e.target.value))} placeholder="Distance (km)" />
            <Input sizeVariant="sm" aria-label="Note" value={c.note} onChange={(e) => onChange(i, 'note', e.target.value)} placeholder="Note" className="sm:col-span-3" />
          </div>
        </div>
      ))}
      {comparables.length === 0 && !loading && (
        <EmptyState
          icon="🔍"
          title="No listings yet"
          message="Click “Search the web” to pull nearby listings, or add a known property below."
        />
      )}
    </div>

    <div className="mt-3">
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        + Add known property
      </Button>
      <p className="mt-1 text-[11px] text-emerald-100/50">
        Use this for a comparable you already know (a recent nearby sale, a deed, or field enquiry).
      </p>
    </div>
  </Card>
)

export default ComparablesTable

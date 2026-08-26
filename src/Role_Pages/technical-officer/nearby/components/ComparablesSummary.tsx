import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import type { Comparable } from '@/Role_Pages/technical-officer/nearby/api/nearby'

// A senior-valuer style summary of the collected price evidence: how many
// comparables, the per-perch range, average & median, and a recommended rate to
// adopt. This is what turns raw listings into "an idea" for the valuation.
type Props = {
  comparables: Comparable[]
  adoptedRate: number
  onApplyRate: (rate: number) => void
}

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-US')}`

const median = (sorted: number[]) => {
  const n = sorted.length
  if (n === 0) return 0
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
}

const Stat = ({ label, value, accent, wide }: { label: string; value: string; accent?: boolean; wide?: boolean }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 p-3 text-center ${wide ? 'col-span-2' : ''}`}>
    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">{label}</p>
    <p className={`mt-1 break-words text-[13px] font-bold leading-5 ${accent ? 'text-accent-200' : 'text-white'}`}>{value}</p>
  </div>
)

const ComparablesSummary = ({ comparables, adoptedRate, onApplyRate }: Props) => {
  const valid = comparables.filter((c) => Number(c.pricePerPerch) > 0)
  const prices = valid.map((c) => Number(c.pricePerPerch)).sort((a, b) => a - b)
  const n = prices.length

  if (n === 0) {
    return (
      <Card className="p-5 sm:p-6">
        <h3 className="mb-1 text-sm font-semibold text-accent-300">Price Evidence Summary</h3>
        <p className="text-xs text-emerald-100">
          Add at least one comparable with a per-perch price to see the price analysis.
        </p>
      </Card>
    )
  }

  const min = prices[0]
  const max = prices[n - 1]
  const avg = prices.reduce((a, b) => a + b, 0) / n
  const med = median(prices)
  const knownCount = valid.filter((c) => /known|provided|field/i.test(c.source)).length
  const portalCount = n - knownCount

  // How the officer's adopted rate sits against the evidence.
  const stance =
    adoptedRate <= 0
      ? ''
      : adoptedRate < min
        ? 'below the evidence range — justify why the subject is inferior.'
        : adoptedRate > max
          ? 'above the evidence range — justify why the subject is superior.'
          : 'within the evidence range.'

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-3 text-sm font-semibold text-accent-300">Price Evidence Summary</h3>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Comparables" value={String(n)} />
        <Stat label="Lowest / P" value={rs(min)} />
        <Stat label="Highest / P" value={rs(max)} />
        <Stat label="Average / P" value={rs(avg)} />
        <Stat label="Median / P" value={rs(med)} accent wide />
      </div>

      <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-emerald-100">
        Based on <b className="text-white">{n}</b> comparable{n > 1 ? 's' : ''}
        {knownCount > 0 && ` (${portalCount} from portals, ${knownCount} known/field)`}, per-perch
        values range from <b className="text-accent-200">{rs(min)}</b> to{' '}
        <b className="text-accent-200">{rs(max)}</b>, with an average of{' '}
        <b className="text-accent-200">{rs(avg)}</b> and a median of{' '}
        <b className="text-accent-200">{rs(med)}</b>. A rate around the median is a fair and defensible
        basis for the subject property, adjusted for its size, frontage, access and condition.
        {stance && (
          <>
            {' '}
            Your adopted rate of <b className="text-white">{rs(adoptedRate)}</b> is {stance}
          </>
        )}
      </p>

      <div className="mt-3 grid gap-2">
        <Button type="button" variant="outline" className="w-full !justify-start !px-4 !py-2 text-xs" onClick={() => onApplyRate(Math.round(med))}>
          Adopt median ({rs(med)})
        </Button>
        <Button type="button" variant="outline" className="w-full !justify-start !px-4 !py-2 text-xs" onClick={() => onApplyRate(Math.round(avg))}>
          Adopt average ({rs(avg)})
        </Button>
      </div>
    </Card>
  )
}

export default ComparablesSummary

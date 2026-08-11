import Card from '@/Common_Pages/components/ui/Card'
import type { Report } from '@/Role_Pages/technical-officer/nearby/api/nearby'

const rs = (n: number) => 'Rs. ' + Math.round(n).toLocaleString('en-US')
const extentArp = (total: number) => {
  const acres = Math.floor(total / 160)
  const balance = total - acres * 160
  const roods = Math.floor(balance / 40)
  return `${acres}A-${roods}R-${Number((balance - roods * 40).toFixed(2))}P`
}
const evidenceLabel = (_type: string, index: number) => `Nearby Land ${String(index + 1).padStart(2, '0')}`

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  if (!n) return 0
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

type Props = {
  report: Report
  onEditStatement: (v: string) => void
  onEditConclusion: (v: string) => void
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gold-300">{children}</h3>
)

const ReportSections = ({ report, onEditStatement, onEditConclusion }: Props) => {
  const { evidence, basis, calculation: calc, conclusion, summary } = report

  // Price statistics for the evidence footer.
  const priced = evidence.comparables.filter((c) => Number(c.pricePerPerch) > 0)
  const prices = priced.map((c) => Number(c.pricePerPerch))
  const low = prices.length ? Math.min(...prices) : evidence.rangeLow
  const high = prices.length ? Math.max(...prices) : evidence.rangeHigh
  const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
  const med = median(prices)
  const adopted = calc.ratePerPerch
  const stance =
    !adopted || !prices.length ? '' : adopted < low ? 'below' : adopted > high ? 'above' : 'within'

  return (
    <div className="space-y-4">
      {/* 9. EVIDENCE OF LAND VALUES */}
      <Card className="p-5 sm:p-6">
        <H>9. Nearby Comparable Land Evidence</H>
        <p className="mb-3 text-xs text-emerald-100/60">
          {priced.length} comparable land {priced.length === 1 ? 'evidence' : 'evidences'} analysed
          within the vicinity of the subject property.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-emerald-100/90">
            <thead className="text-[11px] uppercase text-emerald-200/60">
              <tr>
                <th className="w-[22%] py-2 pr-3">Ref No.</th>
                <th className="w-[54%] py-2 pr-3">Remarks</th>
                <th className="w-[24%] py-2 text-right">Per perch price (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {evidence.comparables.map((c, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="py-3 pr-3 align-top font-semibold text-white">{evidenceLabel(c.evidenceType, i)}</td>
                  <td className="py-2 pr-3 align-top">
                    {[c.refNo && `Ref. No. ${c.refNo}`, c.saleDate && `Date ${c.saleDate}`,
                      c.extentPerches > 0 && `Extent ${extentArp(c.extentPerches)}`,
                      c.distanceKm > 0 && `located about ${c.distanceKm < 1 ? `${Math.round(c.distanceKm * 1000)} meters` : `${Number(c.distanceKm.toFixed(2))} km`} away from the subject property`,
                      c.area && `Location: ${c.area}`, c.propertyType && `Property type: ${c.propertyType}`,
                      c.roadAccess && `Road access: ${c.roadAccess}`, c.note, c.source && `Source: ${c.source}`]
                      .filter(Boolean).join('; ')}.
                  </td>
                  <td className="py-3 text-right align-top font-semibold text-gold-200">{rs(c.pricePerPerch)}/- per perch</td>
                </tr>
              ))}
            </tbody>
            {prices.length > 0 && (
              <tfoot className="border-t-2 border-white/20 text-[11px]">
                <tr>
                  <td className="py-2 font-semibold text-emerald-100">Evidence range</td>
                  <td className="py-2 text-emerald-200/70">Lowest {rs(low)} - Highest {rs(high)}</td>
                  <td className="py-2 text-right font-semibold text-gold-200">{rs(low)} – {rs(high)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-emerald-200/70">Average / Median</td>
                  <td className="py-1 text-emerald-200/70">Avg {rs(avg)} / Med {rs(med)}</td>
                  <td className="py-1 text-right text-emerald-100">{rs(avg)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-white">Adopted rate</td>
                  <td className="py-1 text-emerald-200/70">
                    {stance ? `(${stance} the evidence range)` : ''}
                  </td>
                  <td className="py-1 text-right font-bold text-gold-300">{rs(adopted)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <label className="mt-3 block text-[11px] font-medium text-emerald-200/60">Market survey statement (AI)</label>
        <textarea value={evidence.marketSurveyStatement} onChange={(e) => onEditStatement(e.target.value)} rows={2}
          className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/60" />
      </Card>

      {/* 10. BASE OF VALUATION & RATIONALE */}
      <Card className="p-5 sm:p-6">
        <H>10. Base of Valuation &amp; Rationale</H>
        <ul className="list-inside list-disc space-y-1 text-sm text-emerald-100/90">
          <li>{basis.asIsNote}</li>
          <li>I have <span className="font-semibold text-gold-200">{basis.previouslyValued}</span> this property before.</li>
        </ul>
      </Card>

      {/* 11. VALUATION CALCULATION */}
      <Card className="p-5 sm:p-6">
        <H>11. Valuation Calculation</H>
        <table className="w-full text-left text-sm text-emerald-100/90">
          <tbody>
            <tr className="border-b border-white/10"><td className="py-2">Total Land Extent</td><td className="py-2">{calc.totalExtentPerches} Perches</td><td className="py-2 text-right"></td></tr>
            <tr className="border-b border-white/10"><td className="py-2">Bare Land Value</td><td className="py-2">{calc.totalExtentPerches} Perches @ {rs(calc.ratePerPerch)} / perch</td><td className="py-2 text-right font-semibold text-gold-200">{rs(calc.bareLandValue)}</td></tr>
            <tr><td className="py-2 font-semibold text-white">Market Value of Land</td><td className="py-2"></td><td className="py-2 text-right font-bold text-gold-300">{rs(calc.marketValue)}</td></tr>
          </tbody>
        </table>
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-emerald-100/70">
          {calc.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </Card>

      {/* 12. CONCLUSION */}
      <Card className="p-5 sm:p-6">
        <H>12. Conclusion</H>
        <textarea value={conclusion.text} onChange={(e) => onEditConclusion(e.target.value)} rows={3}
          className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/60" />
      </Card>

      {/* 13. SUMMARY */}
      <Card className="p-5 sm:p-6">
        <H>13. Summary — Land Only</H>
        <div className="space-y-3 text-sm text-emerald-100/90">
          <div>
            <p>Market Value as at <span className="font-medium text-white">{summary.valuationDate}</span>: <span className="font-bold text-gold-300">{rs(summary.marketValue)}</span></p>
            <p className="text-xs italic text-emerald-200/70">({summary.marketValueWords})</p>
          </div>
          <div>
            <p>Forced Sale Value ({summary.forcedSalePct}%) as at <span className="font-medium text-white">{summary.valuationDate}</span>: <span className="font-bold text-gold-300">{rs(summary.forcedSaleValue)}</span></p>
            <p className="text-xs italic text-emerald-200/70">({summary.forcedSaleValueWords})</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ReportSections

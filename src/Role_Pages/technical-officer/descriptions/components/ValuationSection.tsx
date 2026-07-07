import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import { getValuation, type Valuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

const rs = (n: number) => 'Rs. ' + Math.round(n || 0).toLocaleString('en-US') + ' /-'

type Props = { projectId: string; value: string; onChange: (v: string) => void }

// Section 11 — Contractor's Test Method (Cost Approach) valuation table.
// Rate/building value/say are editable; land & market values recompute.
const ValuationSection = ({ projectId, value, onChange }: Props) => {
  const [v, setV] = useState<Valuation | null>(null)

  useEffect(() => {
    if (value) {
      try { setV(JSON.parse(value)); return } catch { /* fall through to fetch */ }
    }
    getValuation(projectId).then((d) => d && setV(d))
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute derived amounts and push the JSON up to the parent.
  const update = (patch: Partial<Valuation>) => {
    setV((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      next.landValue = Math.round((next.totalPerches || 0) * (next.ratePerPerch || 0))
      next.marketValue = next.landValue + (next.buildingValue || 0)
      const merged = { ...next }
      onChange(JSON.stringify(merged))
      return merged
    })
  }

  const setNote = (i: number, text: string) =>
    update({ notes: (v?.notes ?? []).map((n, idx) => (idx === i ? text : n)) })

  if (!v) return null
  const inputCls = 'w-40 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-gold-400/60'

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-gold-300">11. Valuation</h3>
      <p className="mb-4 text-xs text-emerald-100/70">Contractor's Test Method (Cost Approach)</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-emerald-100/90">
          <thead className="text-[11px] uppercase text-emerald-200/60">
            <tr>
              <th className="py-1 pr-3"></th>
              <th className="py-1 pr-3">Extent</th>
              <th className="py-1 pr-3">Notes</th>
              <th className="py-1 pr-3 text-right">Amount (Rs.)</th>
              <th className="py-1 text-right">Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/10"><td className="py-2 font-semibold text-white" colSpan={5}>Land</td></tr>
            <tr className="border-t border-white/10">
              <td className="py-2 pr-3">Total Extent</td>
              <td className="py-2 pr-3">{v.extentText}</td>
              <td className="py-2 pr-3">1</td>
              <td></td><td></td>
            </tr>
            <tr className="border-t border-white/10">
              <td className="py-2 pr-3 font-semibold text-white">Extent to be valued</td>
              <td className="py-2 pr-3 font-semibold text-white">{v.extentText}</td>
              <td></td><td></td><td></td>
            </tr>
            <tr className="border-t border-white/10">
              <td className="py-2 pr-3">{v.extentText} of land @ {rs(v.ratePerPerch)} per perch</td>
              <td></td>
              <td className="py-2 pr-3">2</td>
              <td className="py-2 pr-3 text-right font-semibold text-gold-200">{rs(v.landValue)}</td>
              <td></td>
            </tr>
            <tr className="border-t border-white/10">
              <td className="py-2 pr-3">Market value of land and building</td>
              <td></td><td></td><td></td>
              <td className="py-2 text-right font-semibold text-gold-200">{rs(v.marketValue)}</td>
            </tr>
            <tr className="border-t border-white/10">
              <td className="py-2 pr-3 font-bold text-white">Say</td>
              <td></td><td></td><td></td>
              <td className="py-2 text-right font-bold text-gold-300">{rs(v.say)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Editable inputs */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block"><span className="mb-1 block text-[11px] text-emerald-200/70">Rate per perch (Rs.)</span>
          <input type="number" value={v.ratePerPerch || ''} onChange={(e) => update({ ratePerPerch: Number(e.target.value) })} className={inputCls} /></label>
        <label className="block"><span className="mb-1 block text-[11px] text-emerald-200/70">Building value (Rs.)</span>
          <input type="number" value={v.buildingValue || ''} onChange={(e) => update({ buildingValue: Number(e.target.value) })} className={inputCls} /></label>
        <label className="block"><span className="mb-1 block text-[11px] text-emerald-200/70">Say (Rs.)</span>
          <input type="number" value={v.say || ''} onChange={(e) => update({ say: Number(e.target.value) })} className={inputCls} /></label>
      </div>

      {/* Notes */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-emerald-200/70">Notes</p>
        <ol className="space-y-2">
          {(v.notes ?? []).map((n, i) => (
            <li key={i} className="flex gap-2">
              <span className="pt-2 text-xs text-emerald-200/60">{i + 1}.</span>
              <textarea value={n} onChange={(e) => setNote(i, e.target.value)} rows={i === 0 ? 1 : 3}
                className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-gold-400/60" />
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}

export default ValuationSection

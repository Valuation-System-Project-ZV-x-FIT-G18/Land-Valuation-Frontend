import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import { getEvidence } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

const rs = (n: number) => 'Rs. ' + Math.round(n || 0).toLocaleString('en-US') + ' /-'

type Row = { refNo: string; remarks: string; pricePerPerch: number }
type State = {
  subjectConsideration: string
  subjectDate: string
  offersStatus: string
  rows: Row[]
  rangeStatement: string
  hasAnalysis: boolean
}

type Props = { projectId: string; value: string; onChange: (v: string) => void }

// Section 9 — Evidence of Land Values (RICS evidence hierarchy). Comparable rows
// are pulled from the saved Analyse Nearby Lands analysis, then editable.
const EvidenceSection = ({ projectId, value, onChange }: Props) => {
  const [s, setS] = useState<State | null>(null)

  useEffect(() => {
    if (value) {
      try { setS(JSON.parse(value)); return } catch { /* fetch */ }
    }
    getEvidence(projectId).then((ev) => {
      if (!ev) return
      const rows: Row[] = ev.comparables.map((c, i) => ({
        refNo: c.refNo || `${c.evidenceType} ${String(i + 1).padStart(2, '0')}`,
        remarks: [
          c.date && `Date – ${c.date}`,
          c.extentPerches && `Extent- ${c.extentPerches}P`,
          c.distanceKm && `Located about ${c.distanceKm} km from the subject property`,
          c.source && `Source: ${c.source}`,
        ].filter(Boolean).join('\n'),
        pricePerPerch: c.pricePerPerch,
      }))
      setS({
        subjectConsideration: '',
        subjectDate: '',
        offersStatus: 'Not available',
        rows,
        rangeStatement:
          `A study of the property market in this area reveals that land values vary from ${rs(ev.rangeLow)} to ` +
          `${rs(ev.rangeHigh)} per perch depending on factors affecting the property market.`,
        hasAnalysis: ev.hasAnalysis,
      })
    })
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<State>) =>
    setS((prev) => { if (!prev) return prev; const next = { ...prev, ...patch }; onChange(JSON.stringify(next)); return next })
  const setRow = (i: number, patch: Partial<Row>) =>
    update({ rows: (s?.rows ?? []).map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })

  if (!s) return null
  const cell = 'w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-400/60'
  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li className="flex gap-2 text-xs text-emerald-100/85"><span className="text-gold-400/70">•</span><span>{children}</span></li>
  )

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-gold-300">9. Evidence of Land Values &amp; Rentals</h3>
      <p className="mb-3 text-xs font-semibold text-emerald-100/80">9.1 RICS Evidence Hierarchy — Direct Comparable</p>

      {!s.hasAnalysis && (
        <p className="mb-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-2 text-[11px] text-amber-200">
          No Analyse Nearby Lands analysis saved yet — run &amp; save it to auto-fill the comparable evidence below.
        </p>
      )}

      <ul className="space-y-2">
        <Bullet>
          Completed transactions of the subject property:
          <div className="mt-1 flex flex-wrap gap-2">
            <input value={s.subjectConsideration} onChange={(e) => update({ subjectConsideration: e.target.value })} placeholder="Consideration (Rs.)" className={cell + ' max-w-[180px]'} />
            <input value={s.subjectDate} onChange={(e) => update({ subjectDate: e.target.value })} placeholder="Date of transaction" className={cell + ' max-w-[180px]'} />
          </div>
        </Bullet>
        <Bullet>Completed transactions of other similar real estate assets with full and accurate information — Not available.</Bullet>
        <Bullet>Completed transactions of similar real estate with enough reliable data — Not available.</Bullet>
        <Bullet>
          Similar real estate being marketed where offers may have been made but no binding contract —{' '}
          <select value={s.offersStatus} onChange={(e) => update({ offersStatus: e.target.value })} className="rounded border border-white/15 bg-slate-800 px-2 py-0.5 text-xs text-white">
            <option>Not available</option><option>Available</option>
          </select>
        </Bullet>
        <Bullet>Nearby comparable lands are selected primarily by distance, recency and similarity to the subject land.</Bullet>
        <Bullet>Each comparable should have a verifiable price source and broadly similar land use, extent and road access.</Bullet>
        <Bullet>Market Indices — statistical measures of value based on market conditions and comparative analysis; these indices have not been adopted in this valuation.</Bullet>
      </ul>

      {/* Comparable evidence table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-emerald-100/90">
          <thead className="text-[11px] uppercase text-emerald-200/60">
            <tr><th className="py-1 pr-2">Ref. No</th><th className="py-1 pr-2">Remarks</th><th className="py-1 text-right">Per perch price (Rs.)</th></tr>
          </thead>
          <tbody>
            {s.rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10 align-top">
                <td className="py-2 pr-2"><input value={r.refNo} onChange={(e) => setRow(i, { refNo: e.target.value })} className={cell} /></td>
                <td className="py-2 pr-2"><textarea value={r.remarks} onChange={(e) => setRow(i, { remarks: e.target.value })} rows={3} className={cell + ' resize-none'} /></td>
                <td className="py-2 text-right"><input type="number" value={r.pricePerPerch || ''} onChange={(e) => setRow(i, { pricePerPerch: Number(e.target.value) })} className={cell + ' text-right font-semibold text-gold-200'} /></td>
              </tr>
            ))}
            {s.rows.length === 0 && <tr><td colSpan={3} className="py-2 text-[11px] text-emerald-100/50">No comparable evidence yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <label className="mt-3 block text-[11px] font-medium text-emerald-200/60">Value range statement</label>
      <textarea value={s.rangeStatement} onChange={(e) => update({ rangeStatement: e.target.value })} rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/60" />
    </Card>
  )
}

export default EvidenceSection

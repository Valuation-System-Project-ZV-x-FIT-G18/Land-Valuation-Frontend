import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import LocationCard from './LocationCard'
import ComparablesTable from './ComparablesTable'
import ComparablesSummary from './ComparablesSummary'
import ReportSections from './ReportSections'
import NextStepModal from '@/Role_Pages/technical-officer/shared/NextStepModal'
import {
  getLocation, getComparables, analyse, getAnalysis, saveAnalysis,
  type NearbyLocation, type Comparable, type Report,
} from '@/Role_Pages/technical-officer/nearby/api/nearby'

const TRENDS = ['going up steadily', 'staying the same', 'slowing down']
const PREV = ['not valued', 'previously valued']

const NearbyAnalyser = ({ projectId, onBack }: { projectId: string; onBack: () => void }) => {
  const [loc, setLoc] = useState<NearbyLocation | null>(null)
  const [comps, setComps] = useState<Comparable[]>([])
  const [aiComps, setAiComps] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [inp, setInp] = useState({ rate: '', pct: '80', date: new Date().toISOString().slice(0, 10), prev: PREV[0], trend: TRENDS[1] })
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [goNext, setGoNext] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const applyRate = (cs: Comparable[]) => {
    const prices = cs.map((c) => c.pricePerPerch).filter((n) => n > 0)
    const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
    setInp((p) => ({ ...p, rate: p.rate || (avg ? String(avg) : '') }))
  }

  const fetchComps = () => {
    setFetching(true)
    return getComparables(projectId).then((r) => {
      setComps(r.comparables)
      setAiComps(r.aiUsed)
      applyRate(r.comparables)
      // Auto-select the market trend the AI judged for the area.
      if (r.marketTrend && TRENDS.includes(r.marketTrend)) {
        setInp((p) => ({ ...p, trend: r.marketTrend }))
      }
      setFetching(false)
    })
  }

  useEffect(() => {
    getLocation(projectId).then(setLoc)
    getAnalysis(projectId).then((saved) => {
      if (saved) {
        setReport(saved)
        setComps(saved.evidence.comparables)
        setInp((p) => ({
          ...p, rate: String(saved.calculation.ratePerPerch || p.rate), pct: String(saved.summary.forcedSalePct || 80),
          date: saved.summary.valuationDate || p.date, prev: saved.basis.previouslyValued || p.prev, trend: saved.conclusion.marketTrend || p.trend,
        }))
      } else {
        fetchComps()
      }
    })
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const editComp = (i: number, field: keyof Comparable, value: string | number) =>
    setComps((cs) => cs.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)))

  // Manually add a comparable the officer already knows (not from the portals).
  const addComp = () =>
    setComps((cs) => [
      ...cs,
      { area: '', refNo: '', saleDate: '', extentPerches: 0, distanceKm: 0, pricePerPerch: 0,
        evidenceType: 'Recent Land Sale', source: 'Known / Provided', note: '' },
    ])
  const deleteComp = (i: number) => setComps((cs) => cs.filter((_, idx) => idx !== i))

  const generate = async () => {
    setBusy(true); setError(''); setNotice('')
    const res = await analyse(projectId, {
      comparables: comps,
      ratePerPerch: Number(inp.rate) || 0,
      forcedSalePct: Number(inp.pct) || 80,
      valuationDate: inp.date, previouslyValued: inp.prev, marketTrend: inp.trend,
    })
    setBusy(false)
    if ('error' in res) return setError(res.error)
    setReport(res)
    setNotice(res.aiUsed ? '✨ Sections generated with AI. Review, edit, then save.' : 'Sections generated. Review, edit, then save.')
  }

  const save = async () => {
    if (!report) return
    setSaving(true); setError('')
    const res = await saveAnalysis(projectId, report)
    setSaving(false)
    if (res.ok) {
      setNotice('✓ Analysis saved to the database.')
      setGoNext(true)
    } else {
      setError(res.error ?? 'Could not save.')
    }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block"><span className="mb-1 block text-[11px] font-medium text-emerald-200/70">{label}</span>{children}</label>
  )
  const ic = 'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-gold-400/60'
  const sc = 'w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-1.5 text-sm text-white'

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">← Back to projects</Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Analyse Nearby Lands — <GradientText>{projectId}</GradientText></h1>
        <p className="mx-auto mt-2 max-w-xl text-emerald-100/70">
          Gather nearby land prices — from the portals or ones you already know — read the price
          evidence summary to settle on a fair per-perch rate, then generate the evidence &amp;
          valuation sections.
        </p>
      </div>

      {loc && <LocationCard loc={loc} />}

      <ComparablesTable comparables={comps} aiUsed={aiComps} loading={fetching} onChange={editComp} onRefresh={fetchComps} onAdd={addComp} onDelete={deleteComp} />

      <ComparablesSummary
        comparables={comps}
        adoptedRate={Number(inp.rate) || 0}
        onApplyRate={(rate) => setInp((p) => ({ ...p, rate: String(rate) }))}
      />

      <Card className="p-5 sm:p-6">
        <h3 className="mb-3 text-sm font-semibold text-gold-300">⚖️ Valuation inputs</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Adopted rate (Rs. / perch)"><input value={inp.rate} onChange={(e) => setInp({ ...inp, rate: e.target.value })} className={ic} /></Field>
          <Field label="Forced sale value (%)"><input value={inp.pct} onChange={(e) => setInp({ ...inp, pct: e.target.value })} className={ic} /></Field>
          <Field label="Valuation date"><input type="date" value={inp.date} onChange={(e) => setInp({ ...inp, date: e.target.value })} className={ic} /></Field>
          <Field label="Previously valued?"><select value={inp.prev} onChange={(e) => setInp({ ...inp, prev: e.target.value })} className={sc}>{PREV.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Market trend (auto-detected)"><select value={inp.trend} onChange={(e) => setInp({ ...inp, trend: e.target.value })} className={sc}>{TRENDS.map((o) => <option key={o}>{o}</option>)}</select></Field>
        </div>
        <div className="mt-4 text-center">
          <Button type="button" disabled={busy} onClick={generate}>{busy ? 'Generating…' : '✨ Generate Sections 9–13'}</Button>
          {notice && <p className="mt-3 text-sm text-emerald-200">{notice}</p>}
          {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}
        </div>
      </Card>

      {report && (
        <>
          <ReportSections report={report}
            onEditStatement={(v) => setReport({ ...report, evidence: { ...report.evidence, marketSurveyStatement: v } })}
            onEditConclusion={(v) => setReport({ ...report, conclusion: { ...report.conclusion, text: v } })} />
          <Button type="button" fullWidth disabled={saving} onClick={save}>{saving ? 'Saving…' : 'OK — Save Analysis'}</Button>
        </>
      )}

      <NextStepModal
        open={goNext}
        onClose={() => setGoNext(false)}
        nextLabel="Generate Descriptions"
        nextTo="/technical-officer/descriptions"
        projectId={projectId}
        message="Nearby-lands analysis saved."
      />
    </div>
  )
}

export default NearbyAnalyser

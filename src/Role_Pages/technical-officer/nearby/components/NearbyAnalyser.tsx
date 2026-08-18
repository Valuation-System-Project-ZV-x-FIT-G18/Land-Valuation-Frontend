import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import LocationCard from './LocationCard'
import ComparablesTable from './ComparablesTable'
import ComparablesSummary from './ComparablesSummary'
import {
  getLocation, getComparables, analyse, getAnalysis, saveAnalysis,
  type NearbyLocation, type Comparable, type Report,
} from '@/Role_Pages/technical-officer/nearby/api/nearby'

const TRENDS = ['going up steadily', 'staying the same', 'slowing down']

const NearbyAnalyser = ({ projectId, onBack, onContinue }: { projectId: string; onBack: () => void; onContinue: () => void }) => {
  const [loc, setLoc] = useState<NearbyLocation | null>(null)
  const [comps, setComps] = useState<Comparable[]>([])
  const [aiComps, setAiComps] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [inp, setInp] = useState({ rate: '', date: new Date().toISOString().slice(0, 10), trend: TRENDS[1] })
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToDatabase, setSavedToDatabase] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [searchMessage, setSearchMessage] = useState<{ kind: 'error' | 'notice'; text: string } | null>(null)

  const applyRate = (cs: Comparable[]) => {
    const prices = cs.map((c) => c.pricePerPerch).filter((n) => n > 0)
    const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
    setInp((p) => ({ ...p, rate: p.rate || (avg ? String(avg) : '') }))
  }

  const fetchComps = async () => {
    setFetching(true)
    setSearchMessage(null)
    try {
      const r = await getComparables(projectId)
      if (r.error) {
        setSearchMessage({ kind: 'error', text: r.error })
        return
      }
      setComps(r.comparables)
      setAiComps(r.aiUsed)
      applyRate(r.comparables)
      // Auto-select the market trend the AI judged for the area.
      if (r.marketTrend && TRENDS.includes(r.marketTrend)) {
        setInp((p) => ({ ...p, trend: r.marketTrend }))
      }
      if (r.comparables.length === 0) {
        setSearchMessage({ kind: 'notice', text: 'No suitable nearby lands were found. Add a verified nearby comparable land manually and continue.' })
      }
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    getLocation(projectId).then(setLoc)
    getAnalysis(projectId).then((saved) => {
      if (saved) {
        setReport(saved)
        setSavedToDatabase(true)
        setComps(saved.evidence.comparables)
        setInp((p) => ({
          ...p, rate: String(saved.calculation.ratePerPerch || p.rate),
          date: saved.summary.valuationDate || p.date, trend: saved.conclusion.marketTrend || p.trend,
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
      ...cs.slice(0, 2),
      { area: '', refNo: '', saleDate: '', extentPerches: 0, distanceKm: 0, pricePerPerch: 0,
        evidenceType: 'Nearby Comparable Land', propertyType: 'Bare / Residential Land', roadAccess: '', source: 'Field / Market Enquiry', note: '' },
    ])
  const deleteComp = (i: number) => setComps((cs) => cs.filter((_, idx) => idx !== i))

  const generate = async () => {
    setBusy(true); setError(''); setNotice(''); setSavedToDatabase(false)
    const res = await analyse(projectId, {
      comparables: comps,
      ratePerPerch: Number(inp.rate) || 0,
      forcedSalePct: 80,
      valuationDate: inp.date, previouslyValued: 'not valued', marketTrend: inp.trend,
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
      setSavedToDatabase(true)
      setNotice('✓ Analysis saved to the database.')
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Nearby Land Comparables</h1>
        <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-sm font-semibold">
          <GradientText>{projectId}</GradientText>
        </span>
      </div>

      {loc && <LocationCard loc={loc} />}

      <ComparablesTable comparables={comps} aiUsed={aiComps} loading={fetching} onChange={editComp} onRefresh={fetchComps} onAdd={addComp} onDelete={deleteComp} />

      {searchMessage && (
        <p className={`rounded-xl border px-4 py-3 text-sm ${searchMessage.kind === 'error'
          ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
          : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'}`}>
          {searchMessage.text}
        </p>
      )}

      <ComparablesSummary
        comparables={comps}
        adoptedRate={Number(inp.rate) || 0}
        onApplyRate={(rate) => setInp((current) => ({ ...current, rate: String(rate) }))}
      />

      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gold-300">Prepare comparison summary</h2>
        <p className="mt-1 text-sm leading-6 text-emerald-100/60">
          Confirm the adopted base rate from the comparable evidence. This summary records the nearby-market
          evidence and the rate selected by the valuer.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Adopted base rate per perch (Rs.)">
            <input className={ic} type="number" min="0" step="1000" value={inp.rate}
              onChange={(e) => setInp((current) => ({ ...current, rate: e.target.value }))} />
          </Field>
          <Field label="Valuation date">
            <input className={ic} type="date" value={inp.date}
              onChange={(e) => setInp((current) => ({ ...current, date: e.target.value }))} />
          </Field>
          <Field label="Market trend">
            <select className={sc} value={inp.trend}
              onChange={(e) => setInp((current) => ({ ...current, trend: e.target.value }))}>
              {TRENDS.map((trend) => <option key={trend}>{trend}</option>)}
            </select>
          </Field>
        </div>
        <Button type="button" className="mt-5" loading={busy} onClick={generate}>
          Prepare summary
        </Button>
        {error && !report && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </Card>

      {report && (
        <Card className="border border-gold-400/25 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-gold-300/70">Transfer summary</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Nearby Land Analysis Summary</h2>
              <p className="mt-1 text-xs text-emerald-100/55">These details record the saved nearby-market evidence.</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-emerald-100/70">
              {report.evidence.comparables.length} comparables
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100/45">Land extent</p><p className="mt-1 font-bold text-white">{report.calculation.totalExtentPerches} perches</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100/45">Lowest evidence</p><p className="mt-1 font-bold text-white">Rs. {report.evidence.rangeLow.toLocaleString('en-LK')}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100/45">Highest evidence</p><p className="mt-1 font-bold text-white">Rs. {report.evidence.rangeHigh.toLocaleString('en-LK')}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100/45">Adopted base rate</p><p className="mt-1 font-bold text-gold-300">Rs. {report.calculation.ratePerPerch.toLocaleString('en-LK')} / perch</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100/45">Valuation date</p><p className="mt-1 font-bold text-white">{report.summary.valuationDate}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100/45">Market trend</p><p className="mt-1 font-bold capitalize text-white">{report.conclusion.marketTrend}</p></div>
          </div>
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs leading-5 text-emerald-100/70">
            This summary contains the comparable evidence range, adopted rate, land extent, valuation date and market trend for the selected project.
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="button" loading={saving} onClick={save}>Save summary</Button>
            {savedToDatabase && <Button type="button" variant="outline" onClick={onContinue}>Continue to Generate Descriptions →</Button>}
            {notice && <p className="text-sm text-emerald-300">{notice}</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>
        </Card>
      )}

    </div>
  )
}

export default NearbyAnalyser

import { useEffect, useRef, useState } from 'react'
import StepFooter from '@/Role_Pages/technical-officer/shared/StepFooter'
import BackButton from '@/Role_Pages/technical-officer/shared/BackButton'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import LocationCard from './LocationCard'
import ComparablesTable from './ComparablesTable'
import ComparablesSummary from './ComparablesSummary'
import {
  getLocation, getComparables, analyse, getAnalysis, saveAnalysis,
  type NearbyLocation, type Comparable, type Report,
} from '@/Role_Pages/technical-officer/nearby/api/nearby'
import type { Evidence, Valuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

const TRENDS = ['going up steadily', 'staying the same', 'slowing down']

type PreviewData = { values: Record<string, string>; evidence: Evidence; valuation: Valuation | null }

const NearbyAnalyser = ({ projectId, onBack, onContinue, onDataSaved, onPreviewChange, onReportNavigate }: { projectId: string; onBack: () => void; onContinue: () => void; onDataSaved?: () => void; onPreviewChange?: (preview: PreviewData) => void; onReportNavigate?: (section: string) => void }) => {
  const [loc, setLoc] = useState<NearbyLocation | null>(null)
  const [comps, setComps] = useState<Comparable[]>([])
  const [aiComps, setAiComps] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  // forcedSalePct was hard-coded to 80 in the request. The forced sale value is
  // a professional judgement that varies with the property, and the figure it
  // produces goes to a bank, so the valuer sets it and the report states it.
  const [inp, setInp] = useState({ rate: '', date: new Date().toISOString().slice(0, 10), trend: TRENDS[1], forcedSalePct: '80' })
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToDatabase, setSavedToDatabase] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [searchMessage, setSearchMessage] = useState<{ kind: 'error' | 'notice'; text: string } | null>(null)
  // Set when a saved analysis is restored, so restoring does not count as a
  // change that needs re-analysing.
  const skipNextAutoRef = useRef(false)

  useEffect(() => {
    const evidence: Evidence = {
      comparables: comps.map((item) => ({
        refNo: item.refNo,
        date: item.saleDate,
        area: item.area,
        note: item.note,
        propertyType: item.propertyType,
        roadAccess: item.roadAccess,
        extentPerches: item.extentPerches,
        distanceKm: item.distanceKm,
        pricePerPerch: item.pricePerPerch,
        evidenceType: item.evidenceType,
        source: item.source,
      })),
      rangeLow: report?.evidence.rangeLow ?? 0,
      rangeHigh: report?.evidence.rangeHigh ?? 0,
      hasAnalysis: comps.length > 0,
    }
    const valuation: Valuation | null = report ? {
      extentText: `${report.calculation.totalExtentPerches} perches`,
      totalPerches: report.calculation.totalExtentPerches,
      ratePerPerch: report.calculation.ratePerPerch,
      landValue: report.calculation.bareLandValue,
      buildingValue: 0,
      marketValue: report.calculation.marketValue,
      say: report.summary.marketValue,
      notes: report.calculation.notes,
    } : null
    onPreviewChange?.({
      evidence,
      valuation,
      values: {
        marketValue: report ? String(report.summary.marketValue) : '',
        marketValueWords: report?.summary.marketValueWords ?? '',
        forcedSaleValue: report ? String(report.summary.forcedSaleValue) : '',
        forcedSaleValueWords: report?.summary.forcedSaleValueWords ?? '',
        forcedSalePct: report ? String(report.summary.forcedSalePct || 80) : inp.forcedSalePct,
        valuationDate: report?.summary.valuationDate ?? inp.date,
        conclusion: report?.conclusion.text ?? '',
        nearbyPropertyDetails: report?.evidence.marketSurveyStatement ?? '',
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comps, inp.date, report])

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
          forcedSalePct: String(saved.summary.forcedSalePct || p.forcedSalePct),
        }))
        // What was just restored already IS the summary, so the auto-rebuild
        // below must not immediately regenerate it and mark it unsaved.
        skipNextAutoRef.current = true
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

  // The summary is a view of the comparables plus the three inputs, so it is
  // rebuilt whenever those change instead of waiting for a button. The debounce
  // keeps typing a rate from firing a request per keystroke, and the signature
  // stops an unchanged set of inputs from being re-analysed.
  const inputSignature = JSON.stringify({ comps, ...inp })
  const lastAnalysedRef = useRef('')

  useEffect(() => {
    if (skipNextAutoRef.current) {
      skipNextAutoRef.current = false
      lastAnalysedRef.current = inputSignature
      return
    }
    if (comps.length === 0 || !(Number(inp.rate) > 0)) return
    if (lastAnalysedRef.current === inputSignature) return

    const timer = window.setTimeout(() => {
      lastAnalysedRef.current = inputSignature
      void generate()
    }, 900)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSignature])

  const generate = async () => {
    setBusy(true); setError(''); setNotice(''); setSavedToDatabase(false)
    const forcedSalePct = Number(inp.forcedSalePct)
    if (!Number.isFinite(forcedSalePct) || forcedSalePct < 1 || forcedSalePct > 100) {
      setBusy(false)
      setError('Forced sale percentage must be between 1% and 100%.')
      return
    }
    const res = await analyse(projectId, {
      comparables: comps,
      ratePerPerch: Number(inp.rate) || 0,
      forcedSalePct,
      valuationDate: inp.date, previouslyValued: 'not valued', marketTrend: inp.trend,
    })
    setBusy(false)
    if ('error' in res) return setError(res.error)
    setReport(res)
    setNotice(res.aiUsed ? 'Sections generated with AI. Review, edit, then save.' : 'Sections generated. Review, edit, then save.')
  }

  // Returns whether the save succeeded, so the step footer knows whether it may
  // move on to the next step.
  const save = async () => {
    if (!report) {
      setError('Generate the analysis before saving.')
      return false
    }
    setSaving(true); setError('')
    const res = await saveAnalysis(projectId, report)
    setSaving(false)
    if (res.ok) {
      setSavedToDatabase(true)
      onDataSaved?.()
      setNotice('✓ Analysis saved to the database.')
      return true
    }
    setError(res.error ?? 'Could not save.')
    return false
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block"><span className="mb-1 block text-[11px] font-medium text-emerald-200">{label}</span>{children}</label>
  )
  const ic = 'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-accent-400/60'
  const sc = 'w-full rounded-lg border border-white/15 bg-surface px-3 py-1.5 text-sm text-white'

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <BackButton onClick={onBack} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Nearby Land Comparables</h1>
        <span className="rounded-full border border-accent-400/25 bg-accent-400/10 px-3 py-1 text-sm font-semibold">
          <GradientText>{projectId}</GradientText>
        </span>
      </div>

      {loc && <LocationCard loc={loc} />}

      <div onFocusCapture={() => onReportNavigate?.('comparables')} onMouseDown={() => onReportNavigate?.('comparables')}>
        <ComparablesTable comparables={comps} aiUsed={aiComps} loading={fetching} onChange={editComp} onRefresh={fetchComps} onAdd={addComp} onDelete={deleteComp} />
      </div>

      {searchMessage && (
        <p className={`rounded-xl border px-4 py-3 text-sm ${searchMessage.kind === 'error'
          ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
          : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'}`}>
          {searchMessage.text}
        </p>
      )}

      <div onFocusCapture={() => onReportNavigate?.('comparables')} onMouseDown={() => onReportNavigate?.('comparables')}>
        <ComparablesSummary
          comparables={comps}
          adoptedRate={Number(inp.rate) || 0}
          onApplyRate={(rate) => setInp((current) => ({ ...current, rate: String(rate) }))}
        />
      </div>

      <div onFocusCapture={() => onReportNavigate?.('valuation')} onMouseDown={() => onReportNavigate?.('valuation')}>
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-accent-300">Prepare comparison summary</h2>
        <p className="mt-1 text-sm leading-6 text-emerald-100">
          Confirm the adopted base rate from the comparable evidence. This summary records the nearby-market
          evidence and the rate selected by the valuer.
        </p>
        <div className="mt-4 grid gap-4">
          <Field label="Adopted base rate per perch (Rs.)">
            <input className={ic} type="number" min="0" step="1000" value={inp.rate}
              onChange={(e) => setInp((current) => ({ ...current, rate: e.target.value }))} />
          </Field>
          <Field label="Valuation date">
            <input className={ic} type="date" value={inp.date}
              onChange={(e) => setInp((current) => ({ ...current, date: e.target.value }))} />
          </Field>
          <Field label="Forced sale value (% of market value)">
            <input className={ic} type="number" min="1" max="100" step="5" value={inp.forcedSalePct}
              onChange={(e) => setInp((current) => ({ ...current, forcedSalePct: e.target.value }))} />
          </Field>
          <Field label="Market trend">
            <select className={sc} value={inp.trend}
              onChange={(e) => setInp((current) => ({ ...current, trend: e.target.value }))}>
              {TRENDS.map((trend) => <option key={trend}>{trend}</option>)}
            </select>
          </Field>
        </div>
        {/* No "prepare" button: the summary is a view of these three inputs, so
            it simply follows them. */}
        <p className="mt-4 text-xs text-emerald-200">
          {busy
            ? 'Updating the summary…'
            : comps.length === 0
              ? 'Add at least one comparable to build the summary.'
              : Number(inp.rate) > 0
                ? 'The summary below updates automatically as you change these.'
                : 'Enter or adopt a base rate to build the summary.'}
        </p>
        {error && !report && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </Card>
      </div>

      {report && (
        <Card className="border border-accent-400/25 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-accent-300">Transfer summary</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Nearby Land Analysis Summary</h2>
              <p className="mt-1 text-xs text-emerald-100">These details record the saved nearby-market evidence.</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-emerald-100">
              {report.evidence.comparables.length} comparables
            </span>
          </div>
          {/* Only the figures that are decided here. The comparable count and
              the per-perch range already have their own panel above; repeating
              them made the same numbers look like two different findings. */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100">Land extent</p><p className="mt-1 font-bold text-white">{report.calculation.totalExtentPerches} perches</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100">Adopted base rate</p><p className="mt-1 font-bold text-accent-300">Rs. {report.calculation.ratePerPerch.toLocaleString('en-LK')} / perch</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100">Market value</p><p className="mt-1 font-bold text-white">Rs. {report.calculation.marketValue.toLocaleString('en-LK')}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100">Valuation date</p><p className="mt-1 font-bold text-white">{report.summary.valuationDate}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100">Market trend</p><p className="mt-1 font-bold capitalize text-white">{report.conclusion.marketTrend}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase text-emerald-100">Forced sale value ({report.summary.forcedSalePct || 80}% of market value)</p><p className="mt-1 font-bold text-white">Rs. {report.summary.forcedSaleValue.toLocaleString('en-LK')}</p></div>
          </div>
          {notice && <p className="mt-4 text-sm text-emerald-300">{notice}</p>}
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <StepFooter
            current="nearby"
            nextDisabled={!report}
            hint="Generate the analysis first."
            onNext={onContinue}
            onSave={save}
            saving={saving}
          />
        </Card>
      )}

    </div>
  )
}

export default NearbyAnalyser

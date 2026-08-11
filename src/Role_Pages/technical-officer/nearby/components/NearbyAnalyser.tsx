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
      ...cs.slice(0, 2),
      { area: '', refNo: '', saleDate: '', extentPerches: 0, distanceKm: 0, pricePerPerch: 0,
        evidenceType: 'Nearby Comparable Land', propertyType: 'Bare / Residential Land', roadAccess: '', source: 'Field / Market Enquiry', note: '' },
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

    </div>
  )
}

export default NearbyAnalyser

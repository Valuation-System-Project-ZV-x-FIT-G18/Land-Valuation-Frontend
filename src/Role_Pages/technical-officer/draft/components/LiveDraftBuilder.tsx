import { useEffect, useMemo, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import InspectionForm from '@/Role_Pages/technical-officer/inspections/components/InspectionForm'
import type { InspectionData } from '@/Role_Pages/technical-officer/inspections/api/inspections'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import { getBuildValues, getSavedReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { getEvidence, getValuation, type Evidence, type Valuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { getPhotos } from '@/Role_Pages/technical-officer/site-photos/api/site-photos'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { mapInspectionToReportValues } from '@/Role_Pages/technical-officer/draft/utils/mapInspectionToReportValues'
import LiveReportPreview from '@/Role_Pages/technical-officer/draft/components/LiveReportPreview'
import DraftEditor from '@/Role_Pages/technical-officer/draft/components/DraftEditor'

type Props = {
  assignment: Assignment
  toId: string
  onBack: () => void
  inspectionMode?: boolean
}

const parse = (value?: string) => {
  try { return value ? JSON.parse(value) : null } catch { return null }
}

const LiveDraftBuilder = ({ assignment, toId, onBack, inspectionMode = false }: Props) => {
  const { projectId, valuationId } = assignment
  const [inspectionData, setInspectionData] = useState<InspectionData>({})
  const [baseValues, setBaseValues] = useState<Record<string, string> | null>(null)
  const [valuation, setValuation] = useState<Valuation | null>(null)
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [photoCount, setPhotoCount] = useState(0)
  const [savedHtml, setSavedHtml] = useState<string | null>(null)
  const [useSavedDraft, setUseSavedDraft] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [editingHtml, setEditingHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getBuildValues(projectId), getValuation(projectId), getEvidence(projectId), getSavedReport(projectId), getPhotos(projectId)])
      .then(([values, valuationData, evidenceData, saved, photos]) => {
        if (!values) setError('Could not collect the saved project information.')
        setBaseValues(values)
        setValuation(valuationData)
        setEvidence(evidenceData)
        setSavedHtml(saved)
        // During inspection we always show a non-destructive live projection;
        // an existing manually edited draft remains saved and untouched.
        setUseSavedDraft(!inspectionMode && !!saved)
        setPhotoCount(photos.photos.length)
      })
      .finally(() => setLoading(false))
  }, [inspectionMode, projectId])

  const liveValues = useMemo(
    () => ({ ...(baseValues ?? {}), ...mapInspectionToReportValues(inspectionData) }),
    [baseValues, inspectionData],
  )

  // A short debounce keeps the large report responsive without any API calls.
  useEffect(() => {
    if (!baseValues || useSavedDraft) return
    const timer = window.setTimeout(() => {
      setPreviewHtml(buildReportHtml(liveValues, parse(baseValues.savedValuation) ?? valuation, evidence, projectId, parse(baseValues.savedEvidence)))
    }, 200)
    return () => window.clearTimeout(timer)
  }, [baseValues, evidence, liveValues, projectId, useSavedDraft, valuation])

  useEffect(() => {
    if (savedHtml && useSavedDraft) setPreviewHtml(savedHtml)
  }, [savedHtml, useSavedDraft])

  const readiness = useMemo(() => [
    { label: 'Inspection Data', ready: Object.values(inspectionData).some((value) => value.trim()) || !!baseValues?.inspectionDate },
    { label: 'Property Details', ready: !!baseValues?.propertyAddress },
    { label: 'Site Photos', ready: photoCount > 0 },
    { label: 'GPS / Map', ready: !!baseValues?.gpsCoordinates },
    { label: 'Comparable Analysis', ready: !!evidence?.hasAnalysis || !!evidence?.comparables.length },
    { label: 'Descriptions', ready: !!(baseValues?.landDescription || baseValues?.localityDescription) },
    { label: 'Valuation', ready: !!valuation || !!baseValues?.marketValue },
  ], [baseValues, evidence, inspectionData, photoCount, valuation])

  const regenerate = () => {
    if (savedHtml && !window.confirm('Regenerate from the latest data? This preview will replace the saved edited version. Your saved draft remains unchanged until you submit the regenerated report.')) return
    setPreviewHtml('')
    setUseSavedDraft(false)
  }

  const startEditing = () => {
    if (!previewHtml) return
    if (!useSavedDraft && !window.confirm('Start editing this generated draft? Live automatic updates will stop so your manual edits are preserved.')) return
    setEditingHtml(previewHtml)
  }

  if (editingHtml) return (
    <DraftEditor projectId={projectId} valuationId={valuationId} initialHtml={editingHtml} onBack={() => setEditingHtml(null)} />
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>← Projects</Button>
        {!inspectionMode && <div className="flex flex-wrap gap-2">
          {savedHtml && <Button type="button" variant="outline" size="sm" onClick={regenerate}>Regenerate from Latest Data</Button>}
          <Button type="button" size="sm" disabled={loading || !previewHtml} onClick={startEditing}>
            {useSavedDraft ? 'Continue Editing Saved Draft' : 'Start Editing Draft'}
          </Button>
        </div>}
      </div>
      {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      <div className="grid gap-4 xl:h-[calc(100vh-10rem)] xl:min-h-[680px] xl:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]">
        <section className="min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-emerald-950/35 p-4">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/75">Inspection Data</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Inspection Form</h1>
            <p className="mt-1 text-sm text-emerald-100/60">Upload a form for OCR assistance, then verify or correct every value.</p>
          </div>
          <InspectionForm
            projectId={projectId}
            toId={toId}
            assignment={assignment}
            onBack={onBack}
            compact
            promptAfterSave={inspectionMode}
            value={inspectionData}
            onChange={setInspectionData}
          />
        </section>
        <LiveReportPreview html={previewHtml} loading={loading} savedDraft={useSavedDraft} readiness={readiness} />
      </div>
    </div>
  )
}

export default LiveDraftBuilder

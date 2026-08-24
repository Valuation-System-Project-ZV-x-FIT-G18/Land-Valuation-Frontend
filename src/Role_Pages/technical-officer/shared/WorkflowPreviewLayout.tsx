import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBuildValues } from '@/Role_Pages/technical-officer/draft/api/draft'
import { getEvidence, getValuation, type Evidence, type Valuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { getPhotos, getReportPhotoSources } from '@/Role_Pages/technical-officer/site-photos/api/site-photos'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import LiveReportPreview, { type ReportNavigationTarget } from '@/Role_Pages/technical-officer/draft/components/LiveReportPreview'

const parse = (value?: string) => {
  try { return value ? JSON.parse(value) : null } catch { return null }
}

type Props = {
  projectId: string
  refreshToken?: number
  valueOverrides?: Record<string, string>
  valuationOverride?: Valuation | null
  evidenceOverride?: Evidence | null
  navigationTarget?: ReportNavigationTarget | null
  onPreviewHtmlChange?: (html: string) => void
  children: ReactNode
}

// Shared shell used after a project is selected in every field-work and
// valuation-support stage. The left tool changes; the report stays visible.
const WorkflowPreviewLayout = ({ projectId, refreshToken = 0, valueOverrides = {}, valuationOverride, evidenceOverride, navigationTarget, onPreviewHtmlChange, children }: Props) => {
  const [values, setValues] = useState<Record<string, string> | null>(null)
  const [valuation, setValuation] = useState<Valuation | null>(null)
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [photoCount, setPhotoCount] = useState(0)
  const [photoSources, setPhotoSources] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getBuildValues(projectId), getValuation(projectId), getEvidence(projectId), getPhotos(projectId)])
      .then(async ([buildValues, valuationData, evidenceData, photos]) => {
        setValues(buildValues)
        setValuation(valuationData)
        setEvidence(evidenceData)
        setPhotoCount(photos.photos.length)
        setPhotoSources(await getReportPhotoSources(projectId, photos.photos))
      })
      .finally(() => setLoading(false))
  }, [projectId, refreshToken])

  const previewValues = useMemo(() => ({ ...(values ?? {}), ...photoSources, ...valueOverrides }), [photoSources, valueOverrides, values])
  const previewValuation = valuationOverride === undefined ? valuation : valuationOverride
  const previewEvidence = evidenceOverride === undefined ? evidence : evidenceOverride
  const html = useMemo(() => values
    ? buildReportHtml(previewValues, parse(previewValues.savedValuation) ?? previewValuation, previewEvidence, projectId, parse(previewValues.savedEvidence))
    : '', [previewEvidence, previewValuation, previewValues, projectId, values])

  useEffect(() => {
    if (html) onPreviewHtmlChange?.(html)
  }, [html, onPreviewHtmlChange])

  const readiness = useMemo(() => [
    { label: 'Inspection Data', ready: !!previewValues.inspectionDate },
    { label: 'Property Details', ready: !!previewValues.propertyAddress },
    { label: 'Site Photos', ready: photoCount > 0 },
    { label: 'GPS / Map', ready: !!previewValues.gpsCoordinates },
    { label: 'Comparable Analysis', ready: !!previewEvidence?.hasAnalysis || !!previewEvidence?.comparables.length },
    { label: 'Descriptions', ready: !!(previewValues.landDescription || previewValues.localityDescription) },
    { label: 'Valuation', ready: !!previewValuation || !!previewValues.marketValue },
  ], [photoCount, previewEvidence, previewValuation, previewValues])

  return (
    <div className="grid gap-4 xl:h-[calc(100vh-8rem)] xl:min-h-[680px] xl:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]">
      <section className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-emerald-950/25 p-4 [&_*]:min-w-0">{children}</section>
      <LiveReportPreview html={html} loading={loading} savedDraft={false} readiness={readiness} navigationTarget={navigationTarget} />
    </div>
  )
}

export default WorkflowPreviewLayout

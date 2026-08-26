import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBuildValues, getReportSurveyPlanSource } from '@/Role_Pages/technical-officer/draft/api/draft'
import { getEvidence, getValuation, type Evidence, type Valuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { getPhotos, getReportPhotoSources } from '@/Role_Pages/technical-officer/site-photos/api/site-photos'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import LiveReportPreview, { type ReportNavigationTarget } from '@/Role_Pages/technical-officer/draft/components/LiveReportPreview'
import TOWorkflowStepper, { type TOStepId } from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import WorkflowContextBanner from '@/Role_Pages/technical-officer/shared/WorkflowContextBanner'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { loadWorkflowSelection } from '@/Role_Pages/technical-officer/assignments/utils/workflowSelection'

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
  // Which workflow step this screen is. The stepper has to stay on screen while
  // the officer works through the steps, not only on the project picker they
  // see before choosing one.
  step?: TOStepId
  children: ReactNode
}

// Shared shell used after a project is selected in every field-work and
// valuation-support stage. The left tool changes; the report stays visible.
const WorkflowPreviewLayout = ({ projectId, refreshToken = 0, valueOverrides = {}, valuationOverride, evidenceOverride, navigationTarget, onPreviewHtmlChange, step, children }: Props) => {
  const { user } = useAuth()
  const workflowSelection = loadWorkflowSelection(user?.userId ?? '')
  const [values, setValues] = useState<Record<string, string> | null>(null)
  const [valuation, setValuation] = useState<Valuation | null>(null)
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [photoSources, setPhotoSources] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getBuildValues(projectId), getValuation(projectId), getEvidence(projectId), getPhotos(projectId), getReportSurveyPlanSource(projectId)])
      .then(async ([buildValues, valuationData, evidenceData, photos, surveyPlan]) => {
        setValues(buildValues)
        setValuation(valuationData)
        setEvidence(evidenceData)
        setPhotoSources({
          ...(await getReportPhotoSources(projectId, photos.photos)),
          ...(surveyPlan ? { surveyPlanImage: surveyPlan } : {}),
        })
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

  // The stepper costs about 6rem of height, so the split pane below it gives
  // that back instead of pushing the report preview off the bottom of the view.
  const gridHeight = step ? 'xl:h-[calc(100vh-14rem)]' : 'xl:h-[calc(100vh-8rem)]'

  return (
    <>
      {step && <TOWorkflowStepper current={step} />}
      <WorkflowContextBanner projectId={projectId} assignment={workflowSelection?.assignment} />
      <div className={`grid gap-4 ${gridHeight} xl:min-h-[680px] xl:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]`}>
        <section className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-surface p-4 [&_*]:min-w-0">{children}</section>
        <LiveReportPreview html={html} loading={loading} savedDraft={false} navigationTarget={navigationTarget} />
      </div>
    </>
  )
}

export default WorkflowPreviewLayout

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@/Role_Pages/technical-officer/shared/BackButton'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import ConfirmModal from '@/Common_Pages/components/ui/ConfirmModal'
import InspectionForm from '@/Role_Pages/technical-officer/inspections/components/InspectionForm'
import type { InspectionData } from '@/Role_Pages/technical-officer/inspections/api/inspections'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import { getBuildValues, getReportSurveyPlanSource, getSavedReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { generateAllSections, getDescriptions, getEvidence, getValuation, type Descriptions, type Evidence, type Valuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { getPhotos, getReportPhotoSources } from '@/Role_Pages/technical-officer/site-photos/api/site-photos'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { mapInspectionToReportValues, reportKeyForInspectionField } from '@/Role_Pages/technical-officer/draft/utils/mapInspectionToReportValues'
import { ownerOfReportField } from '@/Role_Pages/technical-officer/shared/reportFieldOwner'
import { STEPS } from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import { mapDescriptionsToReportValues } from '@/Role_Pages/technical-officer/draft/utils/mapDescriptionsToReportValues'
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
  const [descriptions, setDescriptions] = useState<Descriptions | null>(null)
  const [photoSources, setPhotoSources] = useState<Record<string, string>>({})
  const [savedHtml, setSavedHtml] = useState<string | null>(null)
  const [useSavedDraft, setUseSavedDraft] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [editingHtml, setEditingHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState<'regenerate' | 'edit' | null>(null)
  const [navigationTarget, setNavigationTarget] = useState<{ section: string; requestId: number } | null>(null)
  const [focusField, setFocusField] = useState<{ key: string; requestId: number } | null>(null)
  // Set once the officer types into the report itself; null while the report is
  // still being rebuilt from the form.
  const [manualHtml, setManualHtml] = useState<string | null>(null)
  // Explains a click that could not go anywhere, instead of doing nothing.
  const [fieldNote, setFieldNote] = useState('')
  const navigate = useNavigate()

  // Both directions come from the alias table that actually fills the report,
  // so a field can never be navigable one way and dead the other. This file
  // used to keep its own shorter copy of that table, which is why most fields
  // led nowhere.

  // Form input focused -> scroll the report to the value it fills.
  const navigateToField = (fieldName: string) => {
    setNavigationTarget({
      section: `field:${reportKeyForInspectionField(fieldName)}`,
      requestId: Date.now(),
    })
  }

  // Report value clicked -> go to wherever that value is actually entered.
  // Only the inspection form is on this screen; everything else lives on
  // another step, and a few values belong to the project record entirely.
  const focusFormField = (reportKey: string) => {
    const owner = ownerOfReportField(reportKey)
    if (!owner) return

    if (owner.kind === 'coordinator') {
      setFieldNote(`This comes from ${owner.what}, so it is not filled in here — ask the coordinator to update it.`)
      return
    }
    if (owner.step === 'inspection' && owner.formField) {
      setFieldNote('')
      setFocusField({ key: owner.formField, requestId: Date.now() })
      return
    }
    // Another step owns it: carry the project across so it opens on this record.
    navigate(STEPS.find((s) => s.id === owner.step)?.to ?? '', {
      state: { projectId, valuationId: assignment.valuationId, assignment },
    })
  }

  // Generate only after the officer explicitly saves the Inspection step.
  // Opening Descriptions does not call Gemini. The backend uses deterministic
  // template wording only when Gemini is disabled, fails, or returns no text.
  const writeReportSections = async () => {
    const result = await generateAllSections(projectId)
    if (!result.ok || !result.data) {
      throw new Error(result.error ?? 'Could not generate the report descriptions.')
    }
    setDescriptions(result.data)
  }

  // Typing straight into the report makes the edited HTML the source of truth.
  // Regenerating from the form after that would silently wipe what was typed,
  // so the live rebuild stops at the first keystroke in the sheet.
  const editReportHtml = (edited: string) => {
    setManualHtml(edited)
    setPreviewHtml(edited)
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([getBuildValues(projectId), getValuation(projectId), getEvidence(projectId), getDescriptions(projectId), getSavedReport(projectId), getPhotos(projectId), getReportSurveyPlanSource(projectId)])
      .then(async ([values, valuationData, evidenceData, descriptionsData, saved, photos, surveyPlan]) => {
        if (!values) setError('Could not collect the saved project information.')
        setBaseValues(values)
        setValuation(valuationData)
        setEvidence(evidenceData)
        setDescriptions(descriptionsData)
        setSavedHtml(saved)
        // Active drafts must open from the latest workflow data. A previously
        // saved HTML draft is static and may predate photos/descriptions.
        setUseSavedDraft(false)
        setPhotoSources({
          ...(await getReportPhotoSources(projectId, photos.photos)),
          ...(surveyPlan ? { surveyPlanImage: surveyPlan } : {}),
        })
      })
      .finally(() => setLoading(false))
  }, [inspectionMode, projectId])

  const liveValues = useMemo(
    () => ({ ...(baseValues ?? {}), ...mapDescriptionsToReportValues(descriptions), ...photoSources, ...mapInspectionToReportValues(inspectionData) }),
    [baseValues, descriptions, inspectionData, photoSources],
  )

  // Report generation is local and synchronous, so every controlled-input
  // change is reflected in the preview on the next React render.
  useEffect(() => {
    if (!baseValues || useSavedDraft || manualHtml !== null) return
    setPreviewHtml(buildReportHtml(liveValues, parse(baseValues.savedValuation) ?? valuation, evidence, projectId, parse(baseValues.savedEvidence)))
  }, [baseValues, evidence, liveValues, manualHtml, projectId, useSavedDraft, valuation])

  useEffect(() => {
    if (savedHtml && useSavedDraft) setPreviewHtml(savedHtml)
  }, [savedHtml, useSavedDraft])

  const runRegenerate = () => {
    setConfirming(null)
    setPreviewHtml('')
    setUseSavedDraft(false)
    // Regenerating means "throw away my typing and rebuild from the data", so
    // the manual edits are released and the live rebuild resumes.
    setManualHtml(null)
  }
  const regenerate = () => {
    if (savedHtml || manualHtml !== null) return setConfirming('regenerate')
    runRegenerate()
  }

  const showSavedDraft = () => {
    if (!savedHtml) return
    setUseSavedDraft(true)
  }

  const runStartEditing = () => {
    setConfirming(null)
    setEditingHtml(previewHtml)
  }
  const startEditing = () => {
    if (!previewHtml) return
    if (!useSavedDraft) return setConfirming('edit')
    runStartEditing()
  }

  if (editingHtml) return (
    <DraftEditor projectId={projectId} valuationId={valuationId} initialHtml={editingHtml} onBack={() => setEditingHtml(null)} />
  )

  return (
    <div className="space-y-4">
      <ConfirmModal
        open={confirming === 'regenerate'}
        title="Regenerate from latest data?"
        message="This preview will replace the saved edited version. Your saved draft stays unchanged until you submit the regenerated report."
        confirmLabel="Regenerate"
        onConfirm={runRegenerate}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmModal
        open={confirming === 'edit'}
        title="Start editing this draft?"
        message="Live automatic updates will stop from here on, so your manual edits are preserved."
        confirmLabel="Start editing"
        onConfirm={runStartEditing}
        onCancel={() => setConfirming(null)}
      />
      <div><BackButton onClick={onBack} /></div>
      {!inspectionMode && (
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Create <GradientText>Draft</GradientText></h1>
            <p className="mt-1 text-sm text-emerald-100">Project {projectId} · Valuation {valuationId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedHtml && (useSavedDraft
              ? <Button type="button" variant="outline" size="sm" onClick={regenerate}>Regenerate from Latest Data</Button>
              : <Button type="button" variant="outline" size="sm" onClick={showSavedDraft}>View Previous Saved Draft</Button>)}
            <Button type="button" size="sm" disabled={loading || !previewHtml} onClick={startEditing}>
              {useSavedDraft ? 'Continue Editing Saved Draft' : 'Start Editing Draft'}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      {fieldNote && (
        <p className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          {fieldNote}
          <button type="button" onClick={() => setFieldNote('')} className="text-xs underline">Dismiss</button>
        </p>
      )}
      {/* Both screens that use this builder now show the workflow stepper above
          it, so the split pane leaves room for it rather than running off the
          bottom of the viewport. */}
      <div className="grid gap-4 xl:h-[calc(100vh-16rem)] xl:min-h-[680px] xl:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]">
        <section className="min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-surface p-4">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-300">Inspection Data</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Inspection Form</h1>
            <p className="mt-1 text-sm text-emerald-100">Upload a form for OCR assistance, then verify or correct every value.</p>
          </div>
          <InspectionForm
            projectId={projectId}
            toId={toId}
            assignment={assignment}
            onBack={onBack}
            compact
            autoSave
            promptAfterSave={inspectionMode}
            value={inspectionData}
            onChange={setInspectionData}
            onFieldFocus={navigateToField}
            focusField={focusField}
            afterSave={inspectionMode ? writeReportSections : undefined}
          />
        </section>
        <LiveReportPreview
          html={previewHtml}
          loading={loading}
          savedDraft={useSavedDraft}
          navigationTarget={navigationTarget}
          editable
          onHtmlChange={editReportHtml}
          onFieldPick={focusFormField}
        />
      </div>
    </div>
  )
}

export default LiveDraftBuilder

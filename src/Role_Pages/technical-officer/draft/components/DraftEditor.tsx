//02
import { useEffect, useMemo, useRef, useState } from 'react'
import BackButton from '@/Role_Pages/technical-officer/shared/BackButton'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { autosaveReport, downloadReportPdf, getBuildValues, getDraftHistory, getSavedReport, inlineReportImages, inlineReportImagesWithLinks, restoreReportImageLinks, saveReport, type DraftVersion } from '@/Role_Pages/technical-officer/draft/api/draft'
import { getDescriptions, getEvidence, getValuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { mapDescriptionsToReportValues } from '@/Role_Pages/technical-officer/draft/utils/mapDescriptionsToReportValues'
import ConfirmModal from '@/Common_Pages/components/ui/ConfirmModal'
import ReportReadiness from '@/Role_Pages/technical-officer/draft/components/ReportReadiness'
import { analyseReportReadiness } from '@/Role_Pages/technical-officer/draft/utils/reportReadiness'

type Props = {
  projectId: string
  valuationId: number
  onBack: () => void
  correctionMode?: boolean
  rejectReason?: string
  readOnly?: boolean
  reviewStatus?: string
  initialHtml?: string
}

const DraftEditor = ({ projectId, valuationId, onBack, correctionMode = false, rejectReason = '', readOnly = false, reviewStatus = '', initialHtml }: Props) => {
  const paperRef = useRef<HTMLDivElement>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [readinessHtml, setReadinessHtml] = useState('')
  const [pendingHtml, setPendingHtml] = useState('')
  const [confirmIncomplete, setConfirmIncomplete] = useState(false)
  const [autosaveState, setAutosaveState] = useState<'idle' | 'waiting' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState('')
  const [versions, setVersions] = useState<DraftVersion[]>([])
  const readiness = useMemo(() => analyseReportReadiness(readinessHtml || html), [html, readinessHtml])

  const loadFromData = async () => {
    setLoading(true); setError('')
    const [values, valuation, evidence, descriptions] = await Promise.all([
      getBuildValues(projectId), getValuation(projectId), getEvidence(projectId), getDescriptions(projectId),
    ])
    if (!values) setError('Could not collect the saved project information.')
    else {
      const parse = (value?: string) => { try { return value ? JSON.parse(value) : null } catch { return null } }
      const reportValues = { ...values, ...mapDescriptionsToReportValues(descriptions) }
      // Built with /api/ image links, then embedded for display only. Baking the
      // photographs straight in here would put several megabytes through every
      // auto-save; the links are restored before the draft is stored.
      const built = buildReportHtml(reportValues, parse(reportValues.savedValuation) ?? valuation, evidence, projectId, parse(reportValues.savedEvidence))
      const { html: withImages } = await inlineReportImagesWithLinks(built)
      setHtml(withImages)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (initialHtml) {
      setHtml(initialHtml)
      setLoading(false)
      return
    }
    ;(async () => {
      const saved = await getSavedReport(projectId)
      if (saved) {
        // A saved draft stores compact /api/ links, but an <img> carries no
        // auth header, so the officer reopening their own draft saw no images
        // either. Embed them for display; the links go back on auto-save.
        const { html: withImages } = await inlineReportImagesWithLinks(saved)
        setHtml(withImages)
        setLoading(false)
      }
      else await loadFromData()
    })()
  }, [initialHtml, projectId])

  useEffect(() => {
    if (correctionMode) void getDraftHistory(projectId).then(setVersions)
  }, [correctionMode, projectId])

  useEffect(() => () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
  }, [])

  const queueAutosave = (reportHtml: string) => {
    if (readOnly) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    setAutosaveState('waiting')
    autosaveTimer.current = setTimeout(async () => {
      setAutosaveState('saving')
      const result = await autosaveReport(projectId, restoreReportImageLinks(reportHtml))
      if (!result.ok) {
        setAutosaveState('error')
        return
      }
      setLastSavedAt(result.savedAt ?? new Date().toISOString())
      setAutosaveState('saved')
    }, 1500)
  }

  const saveAndSubmit = async (reportHtml: string) => {
    setBusy('submit'); setError('')
    // Embed the photographs before the report leaves the officer's hands. The
    // /api/ image links only resolve for someone holding this officer's token,
    // so a submitted report full of links reaches the manager and the bank with
    // every image missing.
    const withImages = await inlineReportImages(reportHtml)
    const result = await saveReport(projectId, withImages)
    setBusy('')
    if (!result.ok) return setError(result.error || 'Could not submit the draft.')
    setSubmitted(true)
  }

  const submit = () => {
    const reportHtml = paperRef.current?.innerHTML ?? html
    const latestReadiness = analyseReportReadiness(reportHtml)
    setReadinessHtml(reportHtml)
    if (latestReadiness.blockers.length) {
      setError(`The draft cannot be submitted yet. ${latestReadiness.blockers.join(' ')}`)
      return
    }
    if (latestReadiness.warnings.length) {
      setPendingHtml(reportHtml)
      setConfirmIncomplete(true)
      return
    }
    void saveAndSubmit(reportHtml)
  }

  const downloadPdf = async () => {
    setBusy('pdf'); setError('')
    const result = await downloadReportPdf(projectId, 'draft')
    setBusy('')
    if (!result.ok) setError(result.error || 'Could not generate the PDF.')
  }


  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <BackButton onClick={onBack} />

      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{correctionMode ? 'Draft ' : readOnly ? 'Submitted ' : 'Create '}<GradientText>{correctionMode ? 'Corrections' : 'Draft'}</GradientText></h1>
          <p className="mt-1 text-sm text-emerald-100">Project {projectId} · Valuation {valuationId}</p>
          {readOnly && <p className="mt-2 inline-flex rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-medium capitalize text-sky-100">Review status: {reviewStatus.replace(/_/g, ' ') || 'submitted'}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" loading={busy === 'pdf'} disabled={loading || (!!busy && busy !== 'pdf')} onClick={downloadPdf}>Download PDF</Button>
          {!readOnly && <Button type="button" size="sm" variant="success" loading={busy === 'submit'} disabled={loading || (!!busy && busy !== 'submit')} onClick={submit}>Submit for L3 review</Button>}
        </div>
      </div>

      {!readOnly && (
        <p className={`text-right text-xs ${autosaveState === 'error' ? 'text-red-200' : 'text-emerald-100'}`} aria-live="polite">
          {autosaveState === 'waiting' && 'Unsaved changes'}
          {autosaveState === 'saving' && 'Saving working draft…'}
          {autosaveState === 'saved' && `Working draft saved${lastSavedAt ? ` at ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`}
          {autosaveState === 'error' && 'Auto-save failed. Keep this page open and try editing again.'}
          {autosaveState === 'idle' && 'Changes are saved automatically while you edit.'}
        </p>
      )}

      {correctionMode && rejectReason && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
          <b>Manager L3 correction request:</b> {rejectReason}
        </div>
      )}
      {correctionMode && versions.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <h2 className="font-semibold text-white">Report version history</h2>
          <p className="mt-1 text-xs text-emerald-100">Previous submissions and manager decisions are retained for audit.</p>
          <ol className="mt-3 space-y-2">
            {versions.map((version) => (
              <li key={version.version} className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-2 text-sm first:border-0 first:pt-0">
                <span className="text-white">Version {version.version} · <span className="capitalize">{version.event}</span> by {version.actorRole}</span>
                <time className="text-emerald-200">{version.createdAt ? new Date(version.createdAt).toLocaleString() : ''}</time>
                {version.reason && <p className="w-full text-amber-200">Reason: {version.reason}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {!readOnly && <ReportReadiness readiness={readiness} />}
      {error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      {loading ? <p className="py-16 text-center text-emerald-100">Building the report from saved data...</p> : (
        <div className="overflow-x-auto rounded-xl bg-slate-200 p-4 sm:p-8">
          <div
            ref={paperRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onInput={(event) => queueAutosave(event.currentTarget.innerHTML)}
            className={`mx-auto min-h-[1120px] w-[794px] max-w-none bg-paper p-[55px] text-black shadow-card outline-none ${readOnly ? '' : 'draft-working-values'}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
      <ConfirmModal
        open={confirmIncomplete}
        title="Submit an incomplete report?"
        message={`${readiness.warnings.join(' ')} Review the highlighted report fields before submitting. Continue only when the missing items are genuinely not applicable.`}
        confirmLabel="Submit for review"
        cancelLabel="Continue editing"
        onCancel={() => setConfirmIncomplete(false)}
        onConfirm={() => {
          setConfirmIncomplete(false)
          void saveAndSubmit(pendingHtml)
        }}
      />
      <SuccessModal open={submitted} title="Draft submitted" message="The valuation draft has been saved and submitted for the Manager L3 check." onClose={onBack} />
    </div>
  )
}

export default DraftEditor

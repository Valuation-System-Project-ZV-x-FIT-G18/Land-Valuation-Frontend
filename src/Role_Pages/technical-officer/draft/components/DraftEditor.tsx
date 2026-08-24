//02
import { useEffect, useRef, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { downloadReportPdf, getBuildValues, getSavedReport, saveReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { getEvidence, getValuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

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
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const loadFromData = async () => {
    setLoading(true); setError('')
    const [values, valuation, evidence] = await Promise.all([
      getBuildValues(projectId), getValuation(projectId), getEvidence(projectId),
    ])
    if (!values) setError('Could not collect the saved project information.')
    else {
      const parse = (value?: string) => { try { return value ? JSON.parse(value) : null } catch { return null } }
      setHtml(buildReportHtml(values, parse(values.savedValuation) ?? valuation, evidence, projectId, parse(values.savedEvidence)))
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
      if (saved) { setHtml(saved); setLoading(false) }
      else await loadFromData()
    })()
  }, [initialHtml, projectId])

  const submit = async () => {
    setBusy('submit'); setError('')
    const reportHtml = paperRef.current?.innerHTML ?? html
    const result = await saveReport(projectId, reportHtml)
    setBusy('')
    if (!result.ok) return setError(result.error || 'Could not submit the draft.')
    setSubmitted(true)
  }

  const downloadPdf = async () => {
    setBusy('pdf'); setError('')
    const result = await downloadReportPdf(projectId, 'draft')
    setBusy('')
    if (!result.ok) setError(result.error || 'Could not generate the PDF.')
  }


  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-100/70 transition hover:text-white">
        <span aria-hidden="true">←</span> Projects
      </button>

      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{correctionMode ? 'Draft ' : readOnly ? 'Submitted ' : 'Create '}<GradientText>{correctionMode ? 'Corrections' : 'Draft'}</GradientText></h1>
          <p className="mt-1 text-sm text-emerald-100/65">Project {projectId} · Valuation {valuationId}</p>
          {readOnly && <p className="mt-2 inline-flex rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-medium capitalize text-sky-100">Review status: {reviewStatus.replace(/_/g, ' ') || 'submitted'}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" loading={busy === 'pdf'} disabled={loading || (!!busy && busy !== 'pdf')} onClick={downloadPdf}>Download PDF</Button>
          {!readOnly && <Button type="button" size="sm" variant="success" loading={busy === 'submit'} disabled={loading || (!!busy && busy !== 'submit')} onClick={submit}>Submit for L3 review</Button>}
        </div>
      </div>

      {correctionMode && rejectReason && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
          <b>Manager L3 correction request:</b> {rejectReason}
        </div>
      )}
      {error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      {loading ? <p className="py-16 text-center text-emerald-100/65">Building the report from saved data...</p> : (
        <div className="overflow-x-auto rounded-xl bg-slate-200 p-4 sm:p-8">
          <div
            ref={paperRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            className="mx-auto min-h-[1120px] w-[794px] max-w-none bg-white p-[55px] text-black shadow-2xl outline-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
      <SuccessModal open={submitted} title="Draft submitted" message="The valuation draft has been saved and submitted for the Manager L3 check." onClose={onBack} />
    </div>
  )
}

export default DraftEditor

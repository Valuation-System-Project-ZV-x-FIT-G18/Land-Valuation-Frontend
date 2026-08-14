import { useEffect, useRef, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { downloadTemplateReport, getBuildValues, getSavedReport, saveReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { getEvidence, getValuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

type Props = { projectId: string; valuationId: number; onBack: () => void; correctionMode?: boolean; rejectReason?: string }

const DraftEditor = ({ projectId, valuationId, onBack, correctionMode = false, rejectReason = '' }: Props) => {
  const paperRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const loadFromData = async () => {
    setLoading(true); setError(''); setNotice('')
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
    ;(async () => {
      const saved = await getSavedReport(projectId)
      if (saved) { setHtml(saved); setLoading(false) }
      else await loadFromData()
    })()
  }, [projectId])

  const submit = async () => {
    setBusy('submit'); setError(''); setNotice('')
    const reportHtml = paperRef.current?.innerHTML ?? html
    const result = await saveReport(projectId, reportHtml)
    setBusy('')
    if (!result.ok) return setError(result.error || 'Could not submit the draft.')
    setSubmitted(true)
  }

  const download = async () => {
    setBusy('word'); setError(''); setNotice('')
    const result = await downloadTemplateReport(projectId)
    setBusy('')
    result.ok ? setNotice('Editable Word report downloaded.') : setError(result.error || 'Could not download Word report.')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">Back</Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={loading || !!busy} onClick={loadFromData}>Re-fill from data</Button>
          <Button type="button" variant="outline" loading={busy === 'word'} disabled={loading || (!!busy && busy !== 'word')} onClick={download}>Download Word</Button>
          <Button type="button" variant="success" loading={busy === 'submit'} disabled={loading || (!!busy && busy !== 'submit')} onClick={submit}>Save & Submit to L3</Button>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">{correctionMode ? 'Draft ' : 'Create '}<GradientText>{correctionMode ? 'Corrections' : 'Draft'}</GradientText></h1>
        <p className="mt-1 text-sm text-emerald-100/65">{projectId} | Valuation #{valuationId}</p>
      </div>
      {correctionMode && rejectReason && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
          <b>Manager L3 correction request:</b> {rejectReason}
        </div>
      )}
      {notice && <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{notice}</p>}
      {error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      {loading ? <p className="py-16 text-center text-emerald-100/65">Building the report from saved data...</p> : (
        <div className="overflow-x-auto rounded-xl bg-slate-200 p-4 sm:p-8">
          <div
            ref={paperRef}
            contentEditable
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

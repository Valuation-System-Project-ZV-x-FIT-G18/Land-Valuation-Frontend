import { useEffect, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { downloadBankReportPdf, getBankFinalReport } from '../api/client'

// Read-only finalized report for the requesting bank (no editing or review actions).
const ClientReportView = ({ projectId, onBack }: { projectId: string; onBack: () => void }) => {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setHtml('')
    getBankFinalReport(projectId)
      .then((reportHtml) => { if (active) setHtml(reportHtml) })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not load the finalized report.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [projectId])

  const downloadPdf = async () => {
    setDownloading(true)
    setError('')
    try {
      await downloadBankReportPdf(projectId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not download the finalized PDF.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">← Back</Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Valuation Report — <GradientText>{projectId}</GradientText></h1>
      </div>
      <div className="text-center">
        <Button type="button" variant="outline" onClick={downloadPdf} disabled={loading || downloading || !html} className="!px-5 !py-2 text-sm">
          {downloading ? 'Preparing PDF…' : '⬇ Download PDF'}
        </Button>
      </div>
      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading the report…</p>
      ) : error ? (
        <div className="rounded-xl border border-red-300/30 bg-red-950/20 px-5 py-4 text-center text-sm text-red-200">{error}</div>
      ) : (
        <div className="rounded-xl bg-white p-2 shadow-2xl">
          <div className="min-h-[60vh] rounded-md bg-white p-8" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </div>
  )
}

export default ClientReportView

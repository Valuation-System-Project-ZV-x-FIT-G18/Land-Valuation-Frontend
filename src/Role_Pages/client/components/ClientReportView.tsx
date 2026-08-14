import { useEffect, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { getBuildValues, getSavedReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { getValuation, getEvidence } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { downloadReportWord } from '@/Common_Pages/utils/downloadReportWord'

// Read-only, finalised report for a bank client (no editing, no review actions).
const ClientReportView = ({ projectId, onBack }: { projectId: string; onBack: () => void }) => {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const saved = await getSavedReport(projectId)
      if (saved) { setHtml(saved); setLoading(false); return }
      const [values, valuation, evidence] = await Promise.all([getBuildValues(projectId), getValuation(projectId), getEvidence(projectId)])
      if (values) {
        const parse = (s?: string) => { try { return s ? JSON.parse(s) : null } catch { return null } }
        setHtml(buildReportHtml(values, parse(values.savedValuation) ?? valuation, evidence, projectId, parse(values.savedEvidence)))
      }
      setLoading(false)
    })()
  }, [projectId])

  const downloadWord = () => downloadReportWord(html, `Valuation-Report-${projectId}`)

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">← Back</Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Valuation Report — <GradientText>{projectId}</GradientText></h1>
      </div>
      <div className="text-center">
        <Button type="button" variant="outline" onClick={downloadWord} className="!px-5 !py-2 text-sm">⬇ Download Word</Button>
      </div>
      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading the report…</p>
      ) : (
        <div className="rounded-xl bg-white p-2 shadow-2xl">
          <div className="min-h-[60vh] rounded-md bg-white p-8" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </div>
  )
}

export default ClientReportView

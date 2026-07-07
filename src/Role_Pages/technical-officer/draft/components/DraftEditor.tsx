import { useEffect, useRef, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import Spinner from '@/Common_Pages/components/ui/Spinner'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { getBuildValues, getSavedReport, saveReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { getValuation, getEvidence } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

type Props = { projectId: string; onBack: () => void }

const DraftEditor = ({ projectId, onBack }: Props) => {
  const paperRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rebuilding, setRebuilding] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  // Assemble the styled report HTML from all the project data.
  const assemble = async () => {
    const [values, valuation, evidence] = await Promise.all([
      getBuildValues(projectId),
      getValuation(projectId),
      getEvidence(projectId),
    ])
    if (!values) return null
    // Prefer the valuation/evidence tables the officer saved in Generate Descriptions.
    const parse = (s?: string) => { try { return s ? JSON.parse(s) : null } catch { return null } }
    const savedVal = parse(values.savedValuation)
    const savedEvi = parse(values.savedEvidence)
    return buildReportHtml(values, savedVal ?? valuation, evidence, projectId, savedEvi)
  }

  // On open: prefer the saved (edited) report; otherwise build a fresh one.
  useEffect(() => {
    ;(async () => {
      const saved = await getSavedReport(projectId)
      if (saved) setHtml(saved)
      else {
        const built = await assemble()
        built ? setHtml(built) : setError('Project not found.')
      }
      setLoading(false)
    })()
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const rebuild = async () => {
    setRebuilding(true); setError(''); setNotice('')
    const built = await assemble()
    setRebuilding(false)
    if (!built) return setError('Could not rebuild the report.')
    setHtml(built)
    setNotice('Report re-filled from the latest project data.')
  }

  const save = async () => {
    setSaving(true); setError('')
    const current = paperRef.current?.innerHTML ?? html
    const res = await saveReport(projectId, current)
    setSaving(false)
    res.ok
      ? setNotice('✓ Draft saved and submitted for the L3 check. The applicant has been notified.')
      : setError(res.error ?? 'Could not save.')
  }

  const download = () => {
    const current = paperRef.current?.innerHTML ?? html
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>Valuation Report</title></head>
      <body style="margin:40px">${current}</body></html>`
    const blob = new Blob(['﻿', doc], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Valuation-Report-${projectId}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Spinner size={8} />
        <p className="text-sm text-emerald-200/60">Assembling the styled report…</p>
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>← Back to projects</Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Valuation Report Draft — <GradientText>{projectId}</GradientText></h1>
        <p className="mx-auto mt-2 max-w-xl text-emerald-100/70">
          The full report with the CODEHUB letterhead, tables and photos — filled from the project data. Click into the page to edit, then save or download as Word.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" size="sm" loading={rebuilding} onClick={rebuild}>
          {rebuilding ? 'Re-filling…' : '↻ Re-fill from data'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={download}>⬇ Download as Word</Button>
      </div>
      {notice && (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">{notice}</p>
      )}
      {error && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-300">{error}</p>
      )}

      {/* White "paper" — editable in place. The gold ring + badge make it clear
          this region is directly editable. */}
      <div className="relative rounded-2xl bg-white p-2 shadow-card-hover ring-1 ring-gold-400/40">
        <span className="pointer-events-none absolute -top-3 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-emerald-950 shadow">
          ✎ Editing — click anywhere to edit
        </span>
        <div
          ref={paperRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[60vh] rounded-xl bg-white p-8 outline-none"
          style={{ color: '#111' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <Button type="button" fullWidth variant="success" loading={saving} onClick={save}>{saving ? 'Saving…' : 'OK — Save & Submit for L3 Check'}</Button>
    </div>
  )
}

export default DraftEditor

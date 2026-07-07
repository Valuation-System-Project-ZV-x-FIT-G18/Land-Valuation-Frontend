import { useEffect, useRef, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { getBuildValues, getSavedReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { getValuation, getEvidence } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { draftAction, STATUS_LABEL } from '@/Role_Pages/manager/drafts/api/manager-drafts'

type Props = {
  projectId: string
  valuationId: number
  level: 'L1' | 'L2' | 'L3' | 'COORD' | 'TO'
  reviewStatus: string
  rejectReason: string
  onBack: () => void
  onDone: () => void
}

// Editable draft report with the manager review actions.
const ManagerReportView = ({ projectId, valuationId, level, reviewStatus, rejectReason, onBack, onDone }: Props) => {
  const paperRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  // Styled rejection dialog: who it goes back to + the typed reason.
  const [rejectTo, setRejectTo] = useState<{ target: string; backTo: string } | null>(null)
  const [reasonText, setReasonText] = useState('')

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

  const current = () => paperRef.current?.innerHTML ?? html

  const run = async (status: string, label: string, reason = '') => {
    setBusy(label); setError(''); setNotice('')
    const res = await draftAction(projectId, status, current(), reason)
    setBusy('')
    if (!res.ok) return setError(res.error ?? 'Action failed.')
    setNotice(`✓ Saved — ${label} done.`)
    setTimeout(onDone, 1000)
  }

  const save = async () => {
    setBusy('Save'); setError('')
    const res = await draftAction(projectId, reviewStatus || 'draft', current())
    setBusy('')
    res.ok ? setNotice('✓ Saved.') : setError(res.error ?? 'Could not save.')
  }

  const locked = reviewStatus === 'locked'
  // Which rejection reason banner this level should see.
  const showReason =
    (level === 'L3' && reviewStatus === 'rejected_l3') ||
    (level === 'L2' && reviewStatus === 'rejected_l2') ||
    (level === 'COORD' && reviewStatus === 'rejected_to_coordinator')

  // Open the styled reason dialog (instead of window.prompt).
  const reject = (target: string, backTo: string) => {
    setReasonText('')
    setRejectTo({ target, backTo })
  }
  const confirmReject = async () => {
    if (!rejectTo) return
    const { target } = rejectTo
    setRejectTo(null)
    await run(target, 'Reject', reasonText.trim())
  }

  const download = () => {
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body style="margin:40px">${current()}</body></html>`
    const blob = new Blob(['﻿', doc], { type: 'application/msword' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `Valuation-Report-${projectId}-V${valuationId}.doc`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">← Back</Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Draft Report — <GradientText>{projectId}</GradientText> · Valuation #{valuationId}</h1>
        <p className="mt-1 text-xs text-emerald-200/60">Status: {STATUS_LABEL[reviewStatus] ?? reviewStatus}</p>
      </div>

      {showReason && rejectReason && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
          <b>Rejected:</b> {rejectReason}
        </div>
      )}
      {locked && (
        <div className="rounded-lg border border-gold-400/40 bg-gold-400/10 p-3 text-center text-sm text-gold-200">
          🔒 This report is locked and can no longer be edited.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {!locked && (
          <Button type="button" variant="outline" onClick={save} disabled={!!busy} className="!px-5 !py-2 text-sm">{busy === 'Save' ? 'Saving…' : '💾 Save edits'}</Button>
        )}
        <Button type="button" variant="outline" onClick={download} className="!px-5 !py-2 text-sm">⬇ Download</Button>
        {level === 'L3' && (reviewStatus === 'pending_l3' || reviewStatus === 'draft' || reviewStatus === 'rejected_l3') && (
          <>
            <Button type="button" variant="outline" onClick={() => reject('rejected_to_to', 'Technical Officer')} disabled={!!busy} className="!px-5 !py-2 text-sm !border-amber-400/50 !text-amber-200">
              {busy === 'Reject' ? 'Sending…' : '✖ Send back to Technical Officer'}
            </Button>
            <Button type="button" onClick={() => run('pending_l2', 'Submit to L2')} disabled={!!busy} className="!px-5 !py-2 text-sm">
              {busy === 'Submit to L2' ? 'Submitting…' : '➡ Submit to L2'}
            </Button>
          </>
        )}
        {level === 'L2' && (
          <>
            {reviewStatus === 'pending_l2' && (
              <Button type="button" variant="outline" onClick={() => reject('rejected_l3', 'L3')} disabled={!!busy} className="!px-5 !py-2 text-sm !border-amber-400/50 !text-amber-200">
                {busy === 'Reject' ? 'Rejecting…' : '✖ Reject to L3'}
              </Button>
            )}
            <Button type="button" onClick={() => run('pending_l1', 'Submit to L1')} disabled={!!busy} className="!px-5 !py-2 text-sm">
              {busy === 'Submit to L1' ? 'Submitting…' : '✔ Submit to L1'}
            </Button>
          </>
        )}
        {level === 'L1' && !locked && (
          <>
            <Button type="button" variant="outline" onClick={() => reject('rejected_l2', 'L2')} disabled={!!busy} className="!px-5 !py-2 text-sm !border-amber-400/50 !text-amber-200">
              {busy === 'Reject' ? 'Rejecting…' : '✖ Reject to L2'}
            </Button>
            <Button type="button" onClick={() => run('locked', 'Lock')} disabled={!!busy} className="!px-5 !py-2 text-sm">
              {busy === 'Lock' ? 'Locking…' : '🔒 Lock report'}
            </Button>
          </>
        )}
      </div>
      {notice && <p className="text-center text-sm text-emerald-200">{notice}</p>}
      {error && <p className="text-center text-sm text-amber-300">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading the report…</p>
      ) : (
        <div className="rounded-xl bg-white p-2 shadow-2xl">
          <div ref={paperRef} contentEditable={!locked} suppressContentEditableWarning className="min-h-[60vh] rounded-md bg-white p-8 outline-none" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}

      {/* Styled rejection dialog */}
      <Modal open={!!rejectTo} onClose={() => setRejectTo(null)}>
        <div>
          <h3 className="text-xl font-bold text-white">
            Send back to <GradientText>{rejectTo?.backTo}</GradientText>
          </h3>
          <p className="mt-1 text-sm text-emerald-100/70">
            Add a reason for the correction — it will be shown to the {rejectTo?.backTo}.
          </p>
          <textarea
            autoFocus
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            rows={4}
            placeholder="e.g. The extent figures don't match the survey plan — please re-check."
            className="mt-4 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
          />
          <div className="mt-5 flex gap-3">
            <Button type="button" fullWidth disabled={!reasonText.trim()} onClick={confirmReject}>
              Send back
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={() => setRejectTo(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManagerReportView

import { useEffect, useRef, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { getBuildValues, getSavedReport } from '@/Role_Pages/technical-officer/draft/api/draft'
import { buildReportHtml } from '@/Role_Pages/technical-officer/draft/utils/buildReportHtml'
import { getValuation, getEvidence } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import { draftAction, getDraftFields, STATUS_LABEL } from '@/Role_Pages/manager/drafts/api/manager-drafts'

type Props = {
  projectId: string
  valuationId: number
  level: 'L1' | 'L2' | 'L3' | 'COORD' | 'TO' | 'VIEW'
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
  const [inspectionDate, setInspectionDate] = useState('')
  const [valuationDate, setValuationDate] = useState('')
  // Styled rejection dialog: who it goes back to + the typed reason.
  const [rejectTo, setRejectTo] = useState<{ target: string; backTo: string } | null>(null)
  const [reasonText, setReasonText] = useState('')
  const [lockOpen, setLockOpen] = useState(false)
  const [reportPrice, setReportPrice] = useState('')
  // Blocking "✓ done" card shown after an action that leaves this page
  // (submit / lock / reject) — closing it navigates back via onDone.
  const [success, setSuccess] = useState<{ title: string; message: string } | null>(null)

  useEffect(() => {
    getDraftFields(projectId).then((fields) => {
      setInspectionDate(fields.inspectionDate)
      setValuationDate(fields.valuationDate || new Date().toISOString().slice(0, 10))
    })
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

  const run = async (status: string, busyLabel: string, successTitle: string, successMessage: string, reason = '', price?: number) => {
    setBusy(busyLabel); setError('')
    const res = await draftAction(projectId, status, current(), reason, valuationDate, price)
    setBusy('')
    if (!res.ok) return setError(res.error ?? 'Action failed.')
    setSuccess({ title: successTitle, message: successMessage })
  }

  const save = async () => {
    setBusy('Save'); setError('')
    const res = await draftAction(projectId, reviewStatus || 'draft', current(), '', valuationDate)
    setBusy('')
    res.ok ? setNotice('✓ Saved.') : setError(res.error ?? 'Could not save.')
  }

  const locked = reviewStatus === 'locked'
  // A plain "view the draft" mode (Approved Drafts) — always read-only, no review actions.
  const readOnly = locked || level === 'VIEW'
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
    const { target, backTo } = rejectTo
    setRejectTo(null)
    await run(
      target,
      'Reject',
      `Sent back to ${backTo}`,
      `The draft has been returned to ${backTo} along with your feedback.`,
      reasonText.trim(),
    )
  }

  const confirmLock = async () => {
    const price = Number(reportPrice.replace(/,/g, ''))
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid report price greater than zero.')
      return
    }
    setLockOpen(false)
    await run('locked', 'Lock', 'Report Locked', `The report was locked with a payable price of Rs. ${price.toLocaleString('en-LK')}.`, '', price)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">← Back</Button>
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Draft Report — <GradientText>{projectId}</GradientText></h1>
          <p className="mt-1 text-xs text-emerald-200/60">
            Valuation #{valuationId} · {STATUS_LABEL[reviewStatus] ?? reviewStatus}
          </p>
        </div>
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
          <label className="block sm:w-40">
            <span className="mb-1 block text-xs font-medium text-emerald-100/60">Inspection date</span>
            <input
              type="date"
              value={inspectionDate}
              readOnly
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-emerald-100/65 outline-none"
            />
          </label>
          <label className="block sm:w-40">
            <span className="mb-1 block text-xs font-medium text-emerald-100/60">Valuation date</span>
            <input
              type="date"
              value={valuationDate}
              disabled={readOnly}
              onChange={(e) => setValuationDate(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/60 disabled:opacity-60"
            />
          </label>
        </div>
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
        {!readOnly && (
          <Button type="button" variant="outline" onClick={save} disabled={!!busy} className="!px-5 !py-2 text-sm">{busy === 'Save' ? 'Saving…' : '💾 Save edits'}</Button>
        )}
        {level === 'L3' && (reviewStatus === 'pending_l3' || reviewStatus === 'draft' || reviewStatus === 'rejected_l3') && (
          <>
            <Button type="button" variant="outline" onClick={() => reject('rejected_to_to', 'Technical Officer')} disabled={!!busy} className="!px-5 !py-2 text-sm !border-amber-400/50 !text-amber-200">
              {busy === 'Reject' ? 'Sending…' : '✖ Send back to Technical Officer'}
            </Button>
            <Button
              type="button"
              onClick={() => run('pending_l2', 'Submit to L2', 'Submitted to L2', 'The draft has been sent to Manager L2 for review.')}
              disabled={!!busy}
              className="!px-5 !py-2 text-sm"
            >
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
            <Button
              type="button"
              onClick={() => run('pending_l1', 'Submit to L1', 'Submitted to L1', 'The draft has been sent to Manager L1 for review.')}
              disabled={!!busy}
              className="!px-5 !py-2 text-sm"
            >
              {busy === 'Submit to L1' ? 'Submitting…' : '✔ Submit to L1'}
            </Button>
          </>
        )}
        {level === 'L1' && !locked && (
          <>
            <Button type="button" variant="outline" onClick={() => reject('rejected_l2', 'L2')} disabled={!!busy} className="!px-5 !py-2 text-sm !border-amber-400/50 !text-amber-200">
              {busy === 'Reject' ? 'Rejecting…' : '✖ Reject to L2'}
            </Button>
            <Button
              type="button"
              onClick={() => { setReportPrice(''); setError(''); setLockOpen(true) }}
              disabled={!!busy}
              className="!px-5 !py-2 text-sm"
            >
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
          <div ref={paperRef} contentEditable={!readOnly} suppressContentEditableWarning className="min-h-[60vh] rounded-md bg-white p-8 outline-none" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: html }} />
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

      <Modal open={lockOpen} onClose={() => setLockOpen(false)}>
        <div>
          <h3 className="text-xl font-bold text-white">Set Report Price</h3>
          <p className="mt-1 text-sm text-emerald-100/70">
            Enter the final amount the applicant must pay before locking report <span className="font-semibold text-gold-300">{projectId}</span>.
          </p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-emerald-100">Report price (LKR)</span>
            <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/5 focus-within:border-gold-400/60 focus-within:ring-2 focus-within:ring-gold-400/30">
              <span className="flex items-center border-r border-white/15 px-4 text-sm font-semibold text-gold-200">Rs.</span>
              <input
                autoFocus
                type="number"
                min="1"
                step="0.01"
                value={reportPrice}
                onChange={(e) => setReportPrice(e.target.value)}
                placeholder="e.g. 7500"
                className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-emerald-200/40"
              />
            </div>
          </label>
          <div className="mt-5 flex gap-3">
            <Button type="button" fullWidth disabled={!!busy || !reportPrice} onClick={confirmLock}>Lock report</Button>
            <Button type="button" variant="outline" fullWidth disabled={!!busy} onClick={() => setLockOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation card — acknowledging it returns to the list. */}
      <SuccessModal
        open={!!success}
        title={success?.title ?? ''}
        message={success?.message}
        onClose={() => { setSuccess(null); onDone() }}
      />
    </div>
  )
}

export default ManagerReportView

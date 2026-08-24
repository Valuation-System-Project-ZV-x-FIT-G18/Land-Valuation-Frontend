import { useEffect, useRef, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { downloadReportPdf } from '@/Role_Pages/technical-officer/draft/api/draft'
import { draftAction, getDraftFields, getManagerReport, STATUS_LABEL } from '@/Role_Pages/manager/drafts/api/manager-drafts'

type Props = {
  projectId: string
  valuationId: number
  level: 'L1' | 'L2' | 'L3' | 'COORD' | 'TO' | 'VIEW'
  reviewStatus: string
  rejectReason: string
  reviewType?: 'new' | 'recheck'
  previousReturnReason?: string
  previousReturnedAt?: string
  resubmittedAt?: string
  onBack: () => void
  onDone: () => void
  onFinalized?: () => void
}

// Editable draft report with the manager review actions.
const ManagerReportView = ({
  projectId, valuationId, level, reviewStatus, rejectReason, reviewType,
  previousReturnReason, previousReturnedAt, resubmittedAt, onBack, onDone, onFinalized,
}: Props) => {
  const paperRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [inspectionDate, setInspectionDate] = useState('')
  const [valuationDate, setValuationDate] = useState('')
  const [loadedStatus, setLoadedStatus] = useState(reviewStatus)
  const [finalizedAt, setFinalizedAt] = useState('')
  // Styled rejection dialog: who it goes back to + the typed reason.
  const [rejectTo, setRejectTo] = useState<{ target: string; backTo: string } | null>(null)
  const [reasonText, setReasonText] = useState('')
  const [lockOpen, setLockOpen] = useState(false)
  const [reportPrice, setReportPrice] = useState('')
  // Blocking "✓ done" card shown after an action that leaves this page
  // (submit / lock / reject) — closing it navigates back via onDone.
  const [success, setSuccess] = useState<{ title: string; message: string; finalized?: boolean } | null>(null)

  useEffect(() => {
    getDraftFields(projectId).then((fields) => {
      setInspectionDate(fields.inspectionDate)
      setValuationDate(fields.valuationDate || new Date().toISOString().slice(0, 10))
    })
    ;(async () => {
      try {
        const saved = await getManagerReport(projectId)
        setHtml(saved.reportHtml)
        setLoadedStatus(saved.reviewStatus || reviewStatus)
        if (saved.reviewStatus === 'locked') setFinalizedAt(saved.updatedAt)
        if (!saved.reportHtml.trim()) setError('The saved report is empty. Please contact an administrator before reviewing it.')
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load the saved report.')
      } finally {
        setLoading(false)
      }
    })()
  }, [projectId])

  const current = () => paperRef.current?.innerHTML ?? html

  const run = async (status: string, busyLabel: string, successTitle: string, successMessage: string, reason = '', price?: number) => {
    setBusy(busyLabel); setError('')
    const res = await draftAction(projectId, status, current(), reason, valuationDate, price)
    setBusy('')
    if (!res.ok) return setError(res.error ?? 'Action failed.')
    setSuccess({ title: successTitle, message: successMessage, finalized: status === 'locked' })
  }

  const save = async () => {
    setBusy('Save'); setError('')
    const res = await draftAction(projectId, loadedStatus || 'draft', current(), '', valuationDate)
    setBusy('')
    res.ok ? setNotice('✓ Saved.') : setError(res.error ?? 'Could not save.')
  }

  const downloadPdf = async () => {
    setError('')
    setBusy('PDF')
    const result = await downloadReportPdf(projectId, loadedStatus === 'locked' ? 'final' : 'draft')
    setBusy('')
    if (!result.ok) setError(result.error || 'Could not generate the PDF.')
  }

  const locked = loadedStatus === 'locked'
  // A plain "view the draft" mode (Approved Drafts) — always read-only, no review actions.
  const readOnly = locked || level === 'VIEW'
  // Which rejection reason banner this level should see.
  const showReason =
    (level === 'L3' && loadedStatus === 'rejected_l3') ||
    (level === 'L2' && loadedStatus === 'rejected_l2') ||
    (level === 'COORD' && loadedStatus === 'rejected_to_coordinator')

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
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {locked ? 'Finalized Report' : 'Draft Report'} — <GradientText>{projectId}</GradientText>
          </h1>
          <p className="mt-1 text-xs text-emerald-200/60">
            Valuation #{valuationId} · {STATUS_LABEL[loadedStatus] ?? loadedStatus}
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
      {reviewType === 'recheck' && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="font-semibold text-amber-200">Recheck Submission</p>
          <p className="mt-1 text-amber-100/80">This report was previously returned for correction and has been resubmitted for review.</p>
          {(previousReturnedAt || resubmittedAt) && (
            <p className="mt-2 text-xs text-amber-100/60">
              {previousReturnedAt && <>Previously returned {new Date(previousReturnedAt).toLocaleString('en-GB')}.</>}
              {resubmittedAt && <> Resubmitted {new Date(resubmittedAt).toLocaleString('en-GB')}.</>}
            </p>
          )}
          {previousReturnReason && <p className="mt-2"><span className="font-semibold">Previous correction reason:</span> {previousReturnReason}</p>}
        </div>
      )}
      {locked && (
        <div className="rounded-lg border border-gold-400/40 bg-gold-400/10 p-3 text-center text-sm text-gold-200">
          <span className="font-semibold">Finalized / Locked</span> — this report can no longer be edited or returned.
          {finalizedAt && <span className="ml-1 text-gold-100/70">Locked {new Date(finalizedAt).toLocaleString('en-GB')}.</span>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" onClick={downloadPdf} disabled={loading || !html || !!busy} className="!px-5 !py-2 text-sm">
          {busy === 'PDF' ? 'Generating PDF…' : 'Download PDF'}
        </Button>
        {!readOnly && (
          <Button type="button" variant="outline" onClick={save} disabled={!!busy} className="!px-5 !py-2 text-sm">{busy === 'Save' ? 'Saving…' : 'Save edits'}</Button>
        )}
        {level === 'L3' && (loadedStatus === 'pending_l3' || loadedStatus === 'draft' || loadedStatus === 'rejected_l3') && (
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
            {loadedStatus === 'pending_l2' && (
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
        {level === 'L1' && loadedStatus === 'pending_l1' && (
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
              {busy === 'Lock' ? 'Locking…' : 'Final Approve & Lock'}
            </Button>
          </>
        )}
      </div>
      {notice && <p className="text-center text-sm text-emerald-200">{notice}</p>}
      {error && <p className="text-center text-sm text-amber-300">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading the report…</p>
      ) : html ? (
        <div className="rounded-xl bg-white p-2 shadow-2xl">
          {readOnly ? (
            <div className="min-h-[60vh] rounded-md bg-white p-8" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div ref={paperRef} contentEditable suppressContentEditableWarning className="min-h-[60vh] rounded-md bg-white p-8 outline-none" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      ) : null}

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
          <h3 className="text-xl font-bold text-white">Final Approve &amp; Lock</h3>
          <p className="mt-1 text-sm text-emerald-100/70">
            Are you sure you want to give final approval and lock this report? After locking, it cannot be edited or returned through the normal approval workflow.
          </p>
          <p className="mt-3 text-sm text-emerald-100/70">Enter the final amount the applicant must pay for report <span className="font-semibold text-gold-300">{projectId}</span>.</p>
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
            <Button type="button" fullWidth disabled={!!busy || !reportPrice} onClick={confirmLock}>Final Approve &amp; Lock</Button>
            <Button type="button" variant="outline" fullWidth disabled={!!busy} onClick={() => setLockOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation card — acknowledging it returns to the list. */}
      <SuccessModal
        open={!!success}
        title={success?.title ?? ''}
        message={success?.message}
        onClose={() => {
          const finalized = success?.finalized
          setSuccess(null)
          if (finalized && onFinalized) onFinalized()
          else onDone()
        }}
      />
    </div>
  )
}

export default ManagerReportView

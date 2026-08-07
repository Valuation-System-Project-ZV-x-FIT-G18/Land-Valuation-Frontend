import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import {
  getPendingSlips, verifySlip, slipUrl, type PendingSlip,
} from '@/Role_Pages/coordinator/payment-slips/api/payment-slips'

// Coordinator > Payment Slips.
// Verify (approve/reject) bank-transfer slips uploaded by loan applicants.
const PaymentSlipsPage = () => {
  const [slips, setSlips] = useState<PendingSlip[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getPendingSlips().then((s) => { setSlips(s); setLoading(false) })
  }, [])
  useEffect(() => { load() }, [load])

  const act = async (projectId: string, approve: boolean) => {
    setBusy(projectId)
    setNotice(''); setError('')
    const res = await verifySlip(projectId, approve)
    setBusy('')
    if (res.ok) {
      setNotice(approve ? `Payment verified for ${projectId}. The report has been released.` : `Slip for ${projectId} has been rejected.`)
      load()
    } else setError(res.error ?? 'Action failed.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SuccessModal
        open={!!notice}
        title="Action Completed"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Payment <GradientText>Slips</GradientText></h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Verify the bank-transfer slips applicants uploaded. Approving releases the report.
        </p>
      </div>
      {error && <p className="text-center text-sm text-amber-300">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading…</p>
      ) : slips.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">No slips to verify</p>
          <p className="mt-1 text-sm text-emerald-100/70">Uploaded bank-transfer slips awaiting verification appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {slips.map((s) => (
            <Card key={s.projectId} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-semibold text-gold-300">{s.projectId}</p>
                <p className="mt-0.5 truncate text-sm text-emerald-100/80">{s.ownerName} · {s.location || '—'}</p>
                <a href={slipUrl(s.projectId)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium text-gold-300 hover:text-gold-200">
                  View uploaded slip ↗
                </a>
              </div>
              <div className="flex gap-2">
                <Button type="button" disabled={busy === s.projectId} onClick={() => act(s.projectId, true)} className="!px-4 !py-2 text-sm">
                  {busy === s.projectId ? '…' : '✓ Verify'}
                </Button>
                <Button type="button" variant="outline" disabled={busy === s.projectId} onClick={() => act(s.projectId, false)} className="!px-4 !py-2 text-sm !border-amber-400/50 !text-amber-200">
                  ✖ Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default PaymentSlipsPage

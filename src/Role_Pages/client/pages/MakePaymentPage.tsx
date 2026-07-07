import { useCallback, useEffect, useRef, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import {
  getApplicantReports, payForReport, payWithSlip, type ClientReport,
} from '@/Role_Pages/client/api/client'

const rs = (n: number) => 'Rs. ' + Math.round(n || 0).toLocaleString('en-US') + ' /-'
const pct = (r: number) => (r * 100).toFixed(2) + '%'

// Bank account the manual transfer goes to (shown on the slip-upload step).
const BANK_ACCOUNT = { bank: "People's Bank", branch: 'Kaduwela', name: 'CODEHUB Valuations (Pvt) Ltd', number: '086-2-001-5-0034567' }

type Step = 'choose' | 'card' | 'slip'

const MakePaymentPage = () => {
  const { user } = useAuth()
  const nic = user?.userId ?? ''
  const [reports, setReports] = useState<ClientReport[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  // Payment dialog state
  const [target, setTarget] = useState<ClientReport | null>(null)
  const [step, setStep] = useState<Step>('choose')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [slip, setSlip] = useState<File | null>(null)
  const slipRef = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    setLoading(true)
    getApplicantReports(nic).then((r) => { setReports(r); setLoading(false) })
  }, [nic])
  useEffect(() => { if (nic) load() }, [nic, load])

  const open = (r: ClientReport) => {
    setTarget(r); setStep('choose'); setError('')
    setCard({ number: '', name: '', expiry: '', cvv: '' }); setSlip(null)
  }
  const close = () => { if (!busy) setTarget(null) }
  const success = (r: ClientReport, viaSlip = false) => {
    setTarget(null)
    setNotice(
      viaSlip
        ? `✓ Slip uploaded for ${r.projectId}. A coordinator will verify it — the report is released once verified.`
        : `✓ Payment received for ${r.projectId}. Your bank can now view the report.`,
    )
    load()
  }

  const payCard = async () => {
    if (!target) return
    const digits = card.number.replace(/\s/g, '')
    if (digits.length < 12 || !card.name.trim() || !/^\d{2}\/\d{2}$/.test(card.expiry) || card.cvv.length < 3) {
      return setError('Please enter valid card details.')
    }
    setBusy(true); setError('')
    const res = await payForReport(target.projectId)
    setBusy(false)
    res.ok ? success(target) : setError(res.error ?? 'Payment failed.')
  }

  const paySlip = async () => {
    if (!target) return
    if (!slip) return setError('Please attach your bank deposit slip.')
    setBusy(true); setError('')
    const res = await payWithSlip(target.projectId, slip)
    setBusy(false)
    res.ok ? success(target, true) : setError(res.error ?? 'Upload failed.')
  }

  const inp = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Make <GradientText>Payment</GradientText></h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">Pay the professional valuation fee to release your finalised report to your bank.</p>
      </div>
      {notice && <p className="text-center text-sm text-emerald-200">{notice}</p>}

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading…</p>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">No reports to pay for</p>
          <p className="mt-1 text-sm text-emerald-100/70">A report appears here once it is finalised (locked) by the valuer.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.projectId} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-semibold text-gold-300">{r.projectId}</p>
                <p className="mt-0.5 truncate text-sm text-emerald-100/80">{r.ownerName} · {r.location || '—'}</p>
                <p className="mt-1 text-xs text-emerald-100/60">Market Value: {rs(r.marketValue)}</p>
                <p className="mt-0.5 text-sm text-emerald-100/70">Valuation fee: <span className="font-semibold text-gold-200">{rs(r.fee)}</span></p>
              </div>
              {r.paid ? (
                <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">✓ Paid</span>
              ) : r.slipPending ? (
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">⏳ Slip pending verification</span>
              ) : (
                <Button type="button" onClick={() => open(r)}>💳 Pay {rs(r.fee)}</Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!target} onClose={close}>
        {target && (
          <div>
            <h3 className="text-xl font-bold text-white">Pay Valuation Fee — <GradientText>{target.projectId}</GradientText></h3>

            {/* Clear fee breakdown: value-in-band × rate = fee */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="flex justify-between"><span className="text-emerald-100/70">Assessed Market Value</span><span className="font-semibold text-white">{rs(target.marketValue)}</span></div>
              <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-200/50">How the fee is worked out</p>
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase text-emerald-200/45">
                  <tr><th className="py-1 text-left">Value in this band</th><th className="py-1 text-center">Rate</th><th className="py-1 text-right">Fee</th></tr>
                </thead>
                <tbody className="text-emerald-100/85">
                  {target.feeBreakdown.map((b, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-1">{rs(b.to - b.from)}<span className="text-emerald-200/40"> ({rs(b.from)}–{rs(b.to)})</span></td>
                      <td className="py-1 text-center text-emerald-200/60">× {pct(b.rate)}</td>
                      <td className="py-1 text-right font-medium text-white">{rs(b.amount)}</td>
                    </tr>
                  ))}
                  {target.feeBreakdown.length === 0 && (
                    <tr><td className="py-1 text-emerald-200/50" colSpan={3}>No market value on record — minimum fee applies.</td></tr>
                  )}
                </tbody>
              </table>
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-emerald-100/80"><span>Total of bands (scale fee)</span><span>{rs(target.scaleFee)}</span></div>
              {target.minApplied && <div className="flex justify-between text-amber-300/90"><span>Minimum fee applied</span><span>{rs(target.minFee)}</span></div>}
              {!target.minApplied && target.fee !== target.scaleFee && <div className="flex justify-between text-emerald-200/60"><span>Rounded up to nearest Rs. 100</span><span>+ {rs(target.fee - target.scaleFee)}</span></div>}
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-bold text-gold-300"><span>Total payable</span><span>{rs(target.fee)}</span></div>
            </div>

            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

            {/* Step 1 — choose a method */}
            {step === 'choose' && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => { setStep('card'); setError('') }} className="rounded-xl border border-white/15 bg-white/5 p-4 text-left transition hover:border-gold-400/50">
                  <div className="text-2xl">💳</div><p className="mt-1 font-semibold text-white">Pay by Card</p><p className="text-xs text-emerald-100/60">Visa / Mastercard — instant</p>
                </button>
                <button type="button" onClick={() => { setStep('slip'); setError('') }} className="rounded-xl border border-white/15 bg-white/5 p-4 text-left transition hover:border-gold-400/50">
                  <div className="text-2xl">🏦</div><p className="mt-1 font-semibold text-white">Bank Transfer</p><p className="text-xs text-emerald-100/60">Deposit & upload the slip</p>
                </button>
              </div>
            )}

            {/* Step 2a — card form */}
            {step === 'card' && (
              <div className="mt-4 space-y-3">
                <FormField label="Card Number" name="cardNo" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" />
                <FormField label="Name on Card" name="cardName" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="C. FERNANDO" />
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Expiry (MM/YY)" name="exp" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="08/27" />
                  <FormField label="CVV" name="cvv" type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="•••" />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" fullWidth disabled={busy} onClick={payCard}>{busy ? 'Processing…' : `Pay ${rs(target.fee)}`}</Button>
                  <Button type="button" variant="outline" fullWidth disabled={busy} onClick={() => setStep('choose')}>Back</Button>
                </div>
                <p className="text-center text-[11px] text-emerald-200/40">Demo card gateway — use 4242 4242 4242 4242. No real charge.</p>
              </div>
            )}

            {/* Step 2b — bank transfer + slip upload */}
            {step === 'slip' && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-100/85">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200/50">Deposit {rs(target.fee)} to</p>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <span className="text-emerald-200/60">Bank</span><span>{BANK_ACCOUNT.bank}</span>
                    <span className="text-emerald-200/60">Branch</span><span>{BANK_ACCOUNT.branch}</span>
                    <span className="text-emerald-200/60">Account name</span><span>{BANK_ACCOUNT.name}</span>
                    <span className="text-emerald-200/60">Account no.</span><span className="font-semibold text-gold-200">{BANK_ACCOUNT.number}</span>
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-emerald-100">Upload your deposit slip</p>
                  <input ref={slipRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { setSlip(e.target.files?.[0] ?? null); setError('') }} className={inp} />
                  {slip && <p className="mt-1 text-xs text-emerald-200/70">Selected: {slip.name}</p>}
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="button" fullWidth disabled={busy} onClick={paySlip}>{busy ? 'Uploading…' : 'Upload slip & confirm'}</Button>
                  <Button type="button" variant="outline" fullWidth disabled={busy} onClick={() => setStep('choose')}>Back</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MakePaymentPage

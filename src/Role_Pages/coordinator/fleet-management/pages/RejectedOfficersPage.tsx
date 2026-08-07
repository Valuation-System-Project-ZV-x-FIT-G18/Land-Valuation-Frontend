import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { getFleetOfficers, acceptRejection } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type { RejectedItem } from '@/Role_Pages/coordinator/fleet-management/types/fleet'

// Coordinator > Rejected.
// Technical officers who rejected an assigned project. Accepting the rejection
// frees the valuation and returns the officer to the Available pool.
const RejectedOfficersPage = () => {
  const [rejected, setRejected] = useState<RejectedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getFleetOfficers().then((o) => { setRejected(o.rejected); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const accept = async (rowId: number) => {
    setError('')
    const res = await acceptRejection(rowId)
    if (res.ok) { setNotice('Rejection accepted — the officer is available again.'); load() }
    else setError(res.error ?? 'Could not accept.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SuccessModal
        open={!!notice}
        title="Assignment Updated"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Rejected <GradientText>Assignments</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Officers who rejected their assigned project. Accept the rejection to free the officer
          (back to Available) so the work can be re-assigned.
        </p>
      </div>

      {error && <p className="text-center text-sm text-red-300">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading…</p>
      ) : rejected.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">No rejected assignments</p>
          <p className="mt-1 text-sm text-emerald-100/70">Rejections from technical officers will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rejected.map((o) => (
            <Card key={o.valuationRowId} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-semibold text-gold-300">{o.name} <span className="text-emerald-200/50">({o.userId})</span></p>
                <p className="mt-0.5 text-sm text-emerald-100/80">
                  Project {o.projectId} · {o.district || '—'} · {o.phone || '—'}
                </p>
                <p className="mt-1 text-xs text-amber-200/90"><b>Reason:</b> {o.reason || '—'}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => accept(o.valuationRowId)}
                className="!px-5 !py-2.5 text-sm !border-emerald-400/50 !text-emerald-200"
              >
                Accept → free officer
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default RejectedOfficersPage

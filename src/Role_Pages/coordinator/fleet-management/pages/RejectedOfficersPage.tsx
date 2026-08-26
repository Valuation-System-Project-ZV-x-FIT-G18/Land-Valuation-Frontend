import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import { getFleetOfficers, acceptRejection } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type { RejectedItem } from '@/Role_Pages/coordinator/fleet-management/types/fleet'

// Coordinator > Fleet Management > Rejected.
// Technical officers who rejected an assigned project. Accepting the rejection
// frees the valuation and returns the officer to the Available pool.
//
// This used to be a separate sidebar entry, which put officer work two levels
// apart from the rest of the fleet. It belongs to the fleet, so it is a tab.
const RejectedOfficersPage = () => {
  const navigate = useNavigate()
  const { refreshCounts } = useOutletContext<{ refreshCounts: () => void }>()
  const [rejected, setRejected] = useState<RejectedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getFleetOfficers().then((o) => { setRejected(o.rejected); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const accept = async (item: RejectedItem) => {
    setError('')
    setAcceptingId(item.valuationRowId)
    const res = await acceptRejection(item.valuationRowId)
    setAcceptingId(null)
    if (res.ok) {
      refreshCounts()
      navigate('/coordinator/fleet-management/assign', {
        state: { projectId: item.projectId, reassigning: true },
      })
    } else setError(res.error ?? 'Could not accept the rejection.')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <p className="text-sm text-emerald-100">
        Officers who rejected their assigned project. Accept the rejection to free the officer
        (back to Available) so the work can be re-assigned.
      </p>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm text-emerald-200">Loading…</p>
      ) : rejected.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-accent-200">No rejected assignments</p>
          <p className="mt-1 text-sm text-emerald-100">Rejections from technical officers will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rejected.map((o) => (
            <Card key={o.valuationRowId} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-semibold text-accent-300">{o.name} <span className="text-emerald-200">({o.userId})</span></p>
                <p className="mt-0.5 text-sm text-emerald-100">
                  Project {o.projectId} · {o.district || '—'} · {o.phone || '—'}
                </p>
                <p className="mt-1 text-xs text-amber-200"><b>Reason:</b> {o.reason || '—'}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                loading={acceptingId === o.valuationRowId}
                disabled={acceptingId !== null}
                onClick={() => accept(o)}
                className="!px-5 !py-2.5 text-sm !border-emerald-400/50 !text-emerald-200"
              >
                Accept and reassign
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default RejectedOfficersPage

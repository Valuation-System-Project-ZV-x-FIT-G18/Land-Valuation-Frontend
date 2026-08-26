import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Input from '@/Common_Pages/components/ui/Input'
import Table from '@/Common_Pages/components/ui/Table'
import WorkflowStepper from '@/Role_Pages/coordinator/shared/WorkflowStepper'
import ApplicantSearch from '@/Role_Pages/coordinator/create-project/components/ApplicantSearch'
import type { ApplicantSelection } from '@/Role_Pages/coordinator/create-project/components/ApplicantSearch'
import { listApplicants } from '@/Role_Pages/coordinator/applicants/api/applicants'
import type { ApplicantListRow } from '@/Role_Pages/coordinator/applicants/types/applicants'
import '@/Role_Pages/coordinator/create-project/styles/create-project-page.css'

// Coordinator > Applicants (step 1 of the valuation workflow).
// The NIC search stays at the top because that is the fast path when the
// coordinator has the applicant in front of them. Underneath it sits the full
// roster, so an applicant can also be found by name, city or bank branch —
// previously the only way in was knowing an exact NIC by heart.
const ApplicantsPage = () => {
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const [applicants, setApplicants] = useState<ApplicantListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [select, setSelect] = useState<ApplicantSelection>()

  useEffect(() => {
    listApplicants().then((res) => {
      setApplicants(res.applicants)
      if (res.error) setError(res.error)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return applicants
    return applicants.filter((a) =>
      [a.name, a.nic, a.email, a.phone, a.district, a.city, a.applicantBusinessName]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [applicants, filter])

  // Picking a row hands the NIC to the search card above and scrolls back to
  // it, so every applicant action lives in exactly one place.
  const open = (a: ApplicantListRow) => {
    setSelect({ nic: a.nic, at: Date.now() })
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const columns = ['Applicant', 'NIC', 'Contact', 'Location', 'Projects', '']
  const toCells = (a: ApplicantListRow) => [
    <span>
      <span className="block font-medium text-white">{a.name || '—'}</span>
      {a.applicantBusinessName && (
        <span className="block text-xs text-emerald-100/60">{a.applicantBusinessName}</span>
      )}
    </span>,
    <span className="whitespace-nowrap">{a.nic}</span>,
    <span>
      <span className="block">{a.email || '—'}</span>
      <span className="block text-xs text-emerald-100/60">{a.phone || ''}</span>
    </span>,
    <span>{[a.city, a.district].filter(Boolean).join(', ') || '—'}</span>,
    <span className={a.projectCount === 0 ? 'text-emerald-300/60' : 'text-accent-300'}>
      {a.projectCount}
    </span>,
    <div className="flex justify-end">
      <Button type="button" variant="outline" className="!px-3 !py-1.5 text-xs" onClick={() => open(a)}>
        Open
      </Button>
    </div>,
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <WorkflowStepper current="register" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            <GradientText>Applicants</GradientText>
          </h1>
          <p className="mt-2 max-w-xl text-emerald-100">
            Everyone registered as a property owner requesting a valuation.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            // A fresh registration always opens empty.
            sessionStorage.removeItem('registerApplicant:form')
            navigate('/coordinator/register-applicant')
          }}
          className="!px-5 !py-2.5 text-sm"
        >
          + Register Applicant
        </Button>
      </div>

      <div ref={searchRef}>
        <ApplicantSearch select={select} />
      </div>

      <section className="mt-10 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h2 className="text-xl font-bold text-white">All registered applicants</h2>
          <p className="mt-1 text-sm text-emerald-100">
            Search by name, city or contact details when the NIC is not to hand.
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center text-sm text-emerald-200">Loading applicants…</p>
        ) : (
          <>
            <Input
              aria-label="Filter applicants"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name, NIC, email, phone or city…"
            />
            <Card className="p-4 sm:p-6">
              <p className="mb-3 text-xs uppercase tracking-wide text-emerald-200">
                {filtered.length} of {applicants.length} applicant
                {applicants.length === 1 ? '' : 's'}
              </p>
              <Table
                columns={columns}
                rows={filtered.map(toCells)}
                minWidth={880}
                emptyText={
                  applicants.length === 0
                    ? 'No applicants have been registered yet.'
                    : 'No applicant matches that filter.'
                }
              />
            </Card>
          </>
        )}
      </section>
    </div>
  )
}

export default ApplicantsPage

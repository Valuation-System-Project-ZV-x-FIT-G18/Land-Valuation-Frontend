import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ClientReportView from '@/Role_Pages/client/components/ClientReportView'
import { getBankReports, type ClientReport } from '@/Role_Pages/client/api/client'

// Bank > View Report.
// Finalised (locked) reports for the bank's projects — viewable once the loan
// applicant has paid the report fee.
const BankViewReportPage = () => {
  const { user } = useAuth()
  const bankId = user?.userId ?? ''
  const [reports, setReports] = useState<ClientReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!bankId) return
    getBankReports(bankId).then((r) => { setReports(r); setLoading(false) })
  }, [bankId])

  if (selected) {
    return <ClientReportView projectId={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">View <GradientText>Report</GradientText></h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100">
          Finalised valuation reports for your projects. A report opens once the loan applicant has paid the report fee.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-emerald-200">Loading…</p>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-accent-200">No reports yet</p>
          <p className="mt-1 text-sm text-emerald-100">Finalised reports for your projects will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.projectId} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-accent-300">{r.projectId}</p>
                  <p className="mt-0.5 truncate text-sm text-emerald-100">{r.ownerName} · {r.location || '—'}</p>
                </div>
                {r.paid ? (
                  <button
                    type="button"
                    onClick={() => setSelected(r.projectId)}
                    className="rounded-lg border border-accent-400/40 bg-accent-400/10 px-4 py-2 text-sm font-medium text-accent-200 transition hover:bg-accent-400/20"
                  >
                    View report →
                  </button>
                ) : (
                  <span className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-200">
                    Pay to view — awaiting the applicant's payment
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BankViewReportPage

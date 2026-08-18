import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import { valuationSections } from '@/Role_Pages/coordinator/new-valuation/constants/valuationFields'
import {
  fetchValuationDetails,
  type ValuationDetails,
} from '@/Role_Pages/coordinator/new-valuation/api/new-valuation'

type Props = { rowId: number; onBack: () => void }

// Extra fields saved outside the static sections (bank picker + auto-fill).
const bankFields: { name: string; label: string }[] = [
  { name: 'bankName', label: 'Bank' },
  { name: 'branchName', label: 'Branch' },
  { name: 'bankBranchCity', label: 'Bank Branch City / Address' },
  { name: 'bankContactPerson', label: 'Contact Person' },
  { name: 'bankContactNo', label: 'Contact Number' },
]

// Read-only view of every field a coordinator filled in for one valuation.
const ValuationDetailsView = ({ rowId, onBack }: Props) => {
  const [data, setData] = useState<ValuationDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchValuationDetails(rowId)
      .then(setData)
      .finally(() => setLoading(false))
  }, [rowId])

  if (loading) {
    return <p className="text-center text-sm text-emerald-200/70">Loading valuation…</p>
  }
  if (!data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-red-300">Could not load this valuation.</p>
        <Button type="button" variant="outline" className="mt-4" onClick={onBack}>
          Back
        </Button>
      </Card>
    )
  }

  const d = data.details ?? {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">
          Valuation <span className="text-gold-300">#{data.valuationId}</span>
          <span className="text-sm font-normal text-emerald-200/60"> · Project {data.projectId}</span>
        </h2>
        <Button type="button" variant="outline" className="!px-5 !py-2.5 text-sm" onClick={onBack}>
          Back
        </Button>
      </div>

      {/* Bank & branch */}
      <Card className="p-6">
        <h3 className="mb-4 text-base font-semibold text-emerald-100">🏦 Bank &amp; Branch</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          {bankFields.map((f) => (
            <Field key={f.name} label={f.label} value={d[f.name]} />
          ))}
        </dl>
      </Card>

      {/* Static sections */}
      {valuationSections.map((section) => (
        <Card key={section.title} className="p-6">
          <h3 className="mb-4 text-base font-semibold text-emerald-100">
            {section.icon} {section.title}
          </h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((f) => (
              <Field key={f.name} label={f.label} value={d[f.name]} />
            ))}
          </dl>
        </Card>
      ))}

      {/* Bank's request letter */}
      <Card className="p-6">
        <h3 className="mb-3 text-base font-semibold text-emerald-100">📎 Bank&apos;s Request Letter</h3>
        {data.hasRequestLetter ? (
          <a
            href={`/api/coordinator/valuations/file?id=${data.rowId}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-gold-300 underline-offset-2 hover:underline"
          >
            View document ↗
          </a>
        ) : (
          <p className="text-sm text-emerald-200/50">No request letter was uploaded.</p>
        )}
      </Card>
    </div>
  )
}

// One label/value pair.
const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-emerald-200/50">{label}</dt>
    <dd className="mt-0.5 text-sm text-white/90">
      {value ? value : <span className="text-emerald-200/40">—</span>}
    </dd>
  </div>
)

export default ValuationDetailsView

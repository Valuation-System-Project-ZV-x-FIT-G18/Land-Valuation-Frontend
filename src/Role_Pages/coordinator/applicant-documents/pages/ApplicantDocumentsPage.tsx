import { useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import Badge from '@/Common_Pages/components/ui/Badge'
import PageHeader from '@/Common_Pages/components/ui/PageHeader'
import EmptyState from '@/Common_Pages/components/ui/EmptyState'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { documentSections } from '@/Role_Pages/loan-applicant/documents/constants/documentTypes'
import {
  getDocuments,
  documentUrl,
  setDocumentStatus,
  type UploadedDoc,
} from '@/Role_Pages/loan-applicant/documents/api/documents'

// Flat lookup of docType -> label for showing readable names.
const labelOf: Record<string, string> = {}
documentSections.forEach((s) => s.docs.forEach((d) => (labelOf[d.key] = d.label)))

// Coordinator > Applicant Documents: view + review a loan applicant's uploads.
const ApplicantDocumentsPage = () => {
  const [nic, setNic] = useState('')
  const [searchedNic, setSearchedNic] = useState('')
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  // Track which doc + action is updating so its button shows a spinner.
  const [reviewing, setReviewing] = useState('')

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateNIC(nic)
    if (err) return setError(err)
    setError('')
    setLoading(true)
    const res = await getDocuments(nic.trim())
    setDocs(res.documents)
    setSearchedNic(nic.trim())
    setSearched(true)
    setLoading(false)
  }

  const review = async (doc: UploadedDoc, status: string) => {
    setReviewing(doc.docType + status)
    const res = await setDocumentStatus(searchedNic, doc.docType, status, labelOf[doc.docType] ?? doc.docType)
    if (res.ok) {
      const r = await getDocuments(searchedNic)
      setDocs(r.documents)
    } else setError(res.error ?? 'Could not update.')
    setReviewing('')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Applicant"
        accent="Documents"
        subtitle="Enter an applicant's NIC to view and review the documents they uploaded."
      />

      <Card className="p-6 sm:p-8">
        <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              aria-label="Applicant NIC"
              value={nic}
              onChange={(e) => { setNic(e.target.value); setError('') }}
              placeholder="Applicant NIC (e.g. 200012345678)"
              error={error || undefined}
            />
          </div>
          <Button type="submit" loading={loading} className="shrink-0">
            {loading ? 'Loading…' : 'View'}
          </Button>
        </form>
      </Card>

      {searched && !loading && docs.length === 0 && (
        <EmptyState
          icon="📄"
          title="No documents"
          message="This applicant hasn't uploaded any documents yet."
        />
      )}

      {docs.length > 0 && (
        <div className="space-y-3">
          {docs.map((d) => (
            <Card key={d.docType} hover className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{labelOf[d.docType] ?? d.docType}</p>
                {d.fileName && (
                  <a href={documentUrl(searchedNic, d.docType)} className="mt-0.5 inline-flex items-center gap-1 text-xs text-gold-200 underline">
                    📎 {d.fileName}
                  </a>
                )}
              </div>
              <Badge status={d.status} className="shrink-0">{d.status}</Badge>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  loading={reviewing === d.docType + 'Approved'}
                  onClick={() => review(d, 'Approved')}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={reviewing === d.docType + 'Resubmit'}
                  onClick={() => review(d, 'Resubmit')}
                >
                  Resubmit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicantDocumentsPage

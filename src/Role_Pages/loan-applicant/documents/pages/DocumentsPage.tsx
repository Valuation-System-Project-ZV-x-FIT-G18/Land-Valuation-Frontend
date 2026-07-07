import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import DocumentRow from '@/Role_Pages/loan-applicant/documents/components/DocumentRow'
import { documentSections } from '@/Role_Pages/loan-applicant/documents/constants/documentTypes'
import {
  getDocuments,
  uploadDocument,
  type UploadedDoc,
} from '@/Role_Pages/loan-applicant/documents/api/documents'

// Loan Applicant > My Documents. Upload the documents needed for the valuation.
const DocumentsPage = () => {
  const { user } = useAuth()
  const nic = user?.userId ?? '' // a loan applicant's user_id is their NIC
  const [uploaded, setUploaded] = useState<Record<string, UploadedDoc>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!nic) return
    const res = await getDocuments(nic)
    const map: Record<string, UploadedDoc> = {}
    res.documents.forEach((d) => (map[d.docType] = d))
    setUploaded(map)
    setLoading(false)
  }, [nic])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (docType: string, file: File) => {
    const res = await uploadDocument(nic, docType, file)
    if (res.ok) await load()
    return res
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          My <GradientText>Documents</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Upload the documents for your land valuation. Fields marked{' '}
          <span className="text-gold-300">*</span> are required.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading your documents…</p>
      ) : (
        documentSections.map((section) => (
          <Card key={section.title} className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <span>{section.icon}</span> {section.title}
            </h2>
            <div className="space-y-2">
              {section.docs.map((doc) => (
                <DocumentRow
                  key={doc.key}
                  nic={nic}
                  doc={doc}
                  uploaded={uploaded[doc.key]}
                  onUpload={handleUpload}
                />
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default DocumentsPage

import { useEffect, useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import MessageCard from '@/Role_Pages/coordinator/website-inbox/components/MessageCard'
import {
  getValuationRequests,
  type ValuationRequest,
} from '@/Role_Pages/coordinator/website-inbox/api/website-inbox'

// Coordinator > New Requests: valuation requests submitted on the public website.
const NewRequestsPage = () => {
  const [requests, setRequests] = useState<ValuationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getValuationRequests().then((res) => {
      setRequests(res.requests)
      if (res.error) setError(res.error)
      setLoading(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          New <GradientText>Requests</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Land valuation requests submitted through the website.
        </p>
      </div>

      {error && <p className="text-center text-sm text-red-300">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading requests…</p>
      ) : requests.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">No requests yet</p>
          <p className="mt-1 text-sm text-emerald-100/70">
            New valuation requests from the website will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <MessageCard
              key={r.id}
              name={r.name}
              email={r.email}
              phone={r.phone}
              nic={r.nic}
              message={r.message}
              createdAt={r.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NewRequestsPage

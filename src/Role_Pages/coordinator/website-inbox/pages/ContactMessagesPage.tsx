import { useEffect, useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import MessageCard from '@/Role_Pages/coordinator/website-inbox/components/MessageCard'
import {
  getContactMessages,
  type ContactMessage,
} from '@/Role_Pages/coordinator/website-inbox/api/website-inbox'

// Coordinator > Contact Messages: inquiries from the homepage contact form.
const ContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getContactMessages().then((res) => {
      setMessages(res.messages)
      if (res.error) setError(res.error)
      setLoading(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Contact <GradientText>Messages</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Inquiries sent from the website contact form.
        </p>
      </div>

      {error && <p className="text-center text-sm text-red-300">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading messages…</p>
      ) : messages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">No messages yet</p>
          <p className="mt-1 text-sm text-emerald-100/70">
            Contact inquiries from the website will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <MessageCard
              key={m.id}
              name={m.name}
              email={m.email}
              phone={m.phone}
              message={m.message}
              createdAt={m.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ContactMessagesPage

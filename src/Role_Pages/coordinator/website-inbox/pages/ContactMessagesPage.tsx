import { useCallback, useEffect, useMemo, useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import MessageCard from '@/Role_Pages/coordinator/website-inbox/components/MessageCard'
import { getContactMessages, type ContactMessage } from '@/Role_Pages/coordinator/website-inbox/api/website-inbox'

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError('')
    const result = await getContactMessages()
    setMessages(result.messages)
    if (result.error) setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => { loadMessages() }, [loadMessages])

  const visibleMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return messages
    return messages.filter(({ name, email, phone, message }) =>
      [name, email, phone, message].some((value) => value.toLowerCase().includes(query)),
    )
  }, [messages, search])

  const today = new Date().toDateString()
  const newToday = messages.filter(({ createdAt }) => {
    const date = new Date(createdAt)
    return !Number.isNaN(date.getTime()) && date.toDateString() === today
  }).length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300/75">Website inbox</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Contact <GradientText>Messages</GradientText></h1>
          <p className="mt-2 max-w-xl text-sm text-emerald-100/65">Review and respond to inquiries submitted through the public website.</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center"><p className="text-lg font-semibold text-white">{messages.length}</p><p className="text-[10px] uppercase tracking-wider text-emerald-200/45">Total</p></div>
          <div className="rounded-xl border border-gold-400/20 bg-gold-400/10 px-4 py-2.5 text-center"><p className="text-lg font-semibold text-gold-300">{newToday}</p><p className="text-[10px] uppercase tracking-wider text-gold-200/55">Today</p></div>
        </div>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search contact messages</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-200/40"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-3.5-3.5" /></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email or message..." className="w-full rounded-xl border border-white/10 bg-emerald-950/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-emerald-200/35 focus:border-gold-400/50 focus:ring-2 focus:ring-gold-400/10" />
          </label>
          <button type="button" onClick={loadMessages} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-emerald-50 transition hover:border-gold-400/30 hover:bg-white/10 disabled:cursor-wait disabled:opacity-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M20 6v5h-5M4 18v-5h5M6.1 9A7 7 0 0 1 18 6l2 5M4 13l2 5a7 7 0 0 0 11.9-3" /></svg>
            Refresh
          </button>
        </div>
      </Card>

      {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl border border-white/5 bg-white/[0.035]" />)}</div>
      ) : messages.length === 0 ? (
        <Card className="flex flex-col items-center p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gold-300"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6.5 12 13l9-6.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" /></svg></span>
          <p className="mt-4 font-semibold text-white">No messages yet</p><p className="mt-1 text-sm text-emerald-100/60">Contact inquiries from the website will appear here.</p>
        </Card>
      ) : visibleMessages.length === 0 ? (
        <Card className="p-8 text-center"><p className="font-semibold text-white">No matching messages</p><p className="mt-1 text-sm text-emerald-100/60">Try a different name, email address or keyword.</p></Card>
      ) : (
        <div className="space-y-3">{visibleMessages.map((message) => <MessageCard key={message.id} {...message} />)}</div>
      )}
    </div>
  )
}

export default ContactMessagesPage

import { useCallback, useEffect, useMemo, useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'
import { getContactMessages, updateContactMessageStatus, type ContactMessage } from '@/Role_Pages/coordinator/website-inbox/api/website-inbox'

const formatDate = (value: string, compact = false) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, compact
    ? { month: 'short', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?'

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<'Open' | 'Resolved' | 'All'>('Open')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError('')
    const result = await getContactMessages()
    setMessages(result.messages)
    setSelectedId((current) => current ?? result.messages[0]?.id ?? null)
    if (result.error) setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => { loadMessages() }, [loadMessages])

  const visibleMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    const byStatus = statusFilter === 'All' ? messages : messages.filter((message) => message.status === statusFilter)
    if (!query) return byStatus
    return byStatus.filter(({ name, email, phone, message }) =>
      [name, email, phone, message].some((value) => value.toLowerCase().includes(query)),
    )
  }, [messages, search, statusFilter])

  const selectedMessage = visibleMessages.find((message) => message.id === selectedId)
    ?? visibleMessages[0]

  const changeStatus = async (message: ContactMessage) => {
    const next = message.status === 'Open' ? 'Resolved' : 'Open'
    setUpdatingStatus(true)
    const result = await updateContactMessageStatus(message.id, next)
    setUpdatingStatus(false)
    if (!result.ok) {
      setError(result.error ?? 'Could not update the message.')
      return
    }
    setMessages((current) => current.map((item) => item.id === message.id
      ? { ...item, status: next, resolvedAt: next === 'Resolved' ? new Date().toISOString() : null }
      : item))
  }

  const today = new Date().toDateString()
  const newToday = messages.filter(({ createdAt }) => {
    const date = new Date(createdAt)
    return !Number.isNaN(date.getTime()) && date.toDateString() === today
  }).length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-300">Website inbox</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Contact <GradientText>Messages</GradientText></h1>
          <p className="mt-2 max-w-xl text-sm text-emerald-100">Review and respond to inquiries submitted through the public website.</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center"><p className="text-lg font-semibold text-white">{messages.length}</p><p className="text-[10px] uppercase tracking-wider text-emerald-200">Total</p></div>
          <div className="rounded-xl border border-accent-400/20 bg-accent-400/10 px-4 py-2.5 text-center"><p className="text-lg font-semibold text-accent-300">{newToday}</p><p className="text-[10px] uppercase tracking-wider text-accent-200">Today</p></div>
        </div>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search contact messages</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-200"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-3.5-3.5" /></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email or message..." className="w-full rounded-xl border border-white/10 bg-surface py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-emerald-200 focus:border-accent-400/50 focus:ring-2 focus:ring-accent-400/10" />
          </label>
          <div className="flex rounded-xl border border-white/10 bg-surface p-1">
            {(['Open', 'Resolved', 'All'] as const).map((status) => <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${statusFilter === status ? 'bg-accent-300 text-emerald-950' : 'text-emerald-100 hover:text-white'}`}>{status}</button>)}
          </div>
          <button type="button" onClick={loadMessages} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-emerald-50 transition hover:border-accent-400/30 hover:bg-white/10 disabled:cursor-wait disabled:opacity-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M20 6v5h-5M4 18v-5h5M6.1 9A7 7 0 0 1 18 6l2 5M4 13l2 5a7 7 0 0 0 11.9-3" /></svg>
            Refresh
          </button>
        </div>
      </Card>

      {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {loading ? (
        <Card className="grid min-h-[30rem] animate-pulse lg:grid-cols-[21rem_1fr]"><div className="border-r border-white/10 bg-white/[0.025]" /><div /></Card>
      ) : messages.length === 0 ? (
        <Card className="flex flex-col items-center p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-accent-300"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6.5 12 13l9-6.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" /></svg></span>
          <p className="mt-4 font-semibold text-white">No messages yet</p><p className="mt-1 text-sm text-emerald-100">Contact inquiries from the website will appear here.</p>
        </Card>
      ) : visibleMessages.length === 0 ? (
        <Card className="p-8 text-center"><p className="font-semibold text-white">No matching messages</p><p className="mt-1 text-sm text-emerald-100">Try a different name, email address or keyword.</p></Card>
      ) : (
        <Card className="grid min-h-[34rem] overflow-hidden lg:grid-cols-[21rem_1fr]">
          <aside className="border-b border-white/10 bg-black/5 lg:border-b-0 lg:border-r" aria-label="Message list">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Inbox</p>
              <span className="text-xs text-emerald-100">{visibleMessages.length} messages</span>
            </div>
            <div className="max-h-[34rem] overflow-y-auto">
              {visibleMessages.map((message) => {
                const active = selectedMessage?.id === message.id
                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => setSelectedId(message.id)}
                    className={`flex w-full gap-3 border-b border-white/[0.07] px-4 py-4 text-left transition ${active ? 'bg-accent-300/10 shadow-[inset_3px_0_0_#1e96c8]' : 'hover:bg-white/[0.045]'}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${active ? 'border-accent-300/30 bg-accent-300/10 text-accent-200' : 'border-white/10 bg-white/5 text-emerald-100'}`}>{initials(message.name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-white">{message.name}</span><time dateTime={message.createdAt} className="shrink-0 text-[10px] text-emerald-100">{formatDate(message.createdAt, true)}</time></span>
                      <span className="mt-1 block truncate text-xs text-emerald-100">{message.message}</span>
                      <span className="mt-1.5 flex items-center justify-between gap-2 text-[11px]"><span className="truncate text-emerald-100">{message.email}</span><span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${message.status === 'Open' ? 'bg-sky-300/10 text-sky-200' : 'bg-emerald-300/10 text-emerald-200'}`}>{message.status}</span></span>
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          {selectedMessage && (
            <article className="flex min-w-0 flex-col">
              <header className="border-b border-white/10 px-5 py-5 sm:px-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent-300/20 bg-accent-300/10 text-sm font-bold text-accent-200">{initials(selectedMessage.name)}</span>
                    <div className="min-w-0"><h2 className="truncate text-lg font-semibold text-white">Website valuation enquiry</h2><p className="mt-0.5 text-xs text-emerald-100">From {selectedMessage.name} · {selectedMessage.status}</p></div>
                  </div>
                  <time dateTime={selectedMessage.createdAt} className="text-xs text-emerald-100">{formatDate(selectedMessage.createdAt)}</time>
                </div>
              </header>

              <div className="flex-1 px-5 py-6 sm:px-7">
                <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-emerald-50">{selectedMessage.message}</p>
              </div>

              <footer className="border-t border-white/10 bg-black/5 px-5 py-4 sm:px-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-100">Contact details</p>
                <div className="flex flex-wrap gap-2">
                  <a href={`mailto:${selectedMessage.email}`} className="inline-flex items-center gap-2 rounded-lg bg-accent-300/10 px-3 py-2 text-sm font-medium text-accent-200 transition hover:bg-accent-300/15">Email {selectedMessage.email}</a>
                  {selectedMessage.phone && <a href={`tel:${selectedMessage.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-emerald-100 transition hover:bg-white/10">Call {selectedMessage.phone}</a>}
                  <button type="button" disabled={updatingStatus} onClick={() => changeStatus(selectedMessage)} className="ml-auto inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50">{updatingStatus ? 'Updating…' : selectedMessage.status === 'Open' ? 'Mark as resolved' : 'Reopen enquiry'}</button>
                </div>
              </footer>
            </article>
          )}
        </Card>
      )}
    </div>
  )
}

export default ContactMessagesPage

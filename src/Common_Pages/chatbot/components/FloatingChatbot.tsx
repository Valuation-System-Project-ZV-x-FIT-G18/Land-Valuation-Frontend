import { FormEvent, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { askChatbot, type ChatTurn } from '@/Common_Pages/chatbot/api/chatbot'

type DisplayTurn = ChatTurn & { sources?: string[] }

const ChatbotIcon = ({ className = 'h-8 w-8' }: { className?: string }) => (
  <img
    src="/images/ai-assistant-portrait.png"
    alt=""
    className={`${className} rounded-full object-cover`}
    aria-hidden="true"
  />
)

const ROLE_SUGGESTION: Record<string, string> = {
  Admin: 'How do I add a new staff user?',
  Coordinator: 'What is the correct project setup order?',
  'Technical Officer': 'What should I complete before submitting a draft?',
  'Manager L1': 'What must I check before locking a report?',
  'Manager L2': 'What should I verify in an L3-approved draft?',
  'Manager L3': 'How do I review a Technical Officer draft?',
  'Loan Applicant': 'When can I make the payment?',
  Bank: 'When can I view the final report?',
}

const FloatingChatbot = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<DisplayTurn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy, open])

  if (!user) return null

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || busy) return
    const history = messages.map(({ role, content }) => ({ role, content }))
    setMessages((current) => [...current, { role: 'user', content: question }])
    setInput('')
    setError('')
    setBusy(true)
    try {
      const result = await askChatbot(user.userId, user.role, question, history)
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: result.answer, sources: result.sources },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant could not answer right now.')
    } finally {
      setBusy(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void send(input)
  }

  return (
    <div className="fixed bottom-5 right-4 z-[60] sm:bottom-6 sm:right-6">
      {open && (
        <section
          role="dialog"
          aria-label="AI Help Assistant"
          className="mb-3 flex h-[min(620px,calc(100vh-110px))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-emerald-950 shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-900 to-emerald-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gold-300/60 shadow-inner">
                <ChatbotIcon className="h-full w-full" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">CODEHUB Assistant</p>
                <p className="text-[11px] text-emerald-200/65">Guidance for {user.role}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-emerald-100/70 transition hover:bg-white/10 hover:text-white">×</button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-xl">💬</div>
                <p className="mt-3 text-sm font-semibold text-white">How can I help?</p>
                <p className="mt-1 text-xs leading-5 text-emerald-100/55">Ask about your tasks or the valuation workflow.</p>
                <button type="button" onClick={() => void send(ROLE_SUGGESTION[user.role] ?? 'How does the valuation process work?')} className="mt-4 rounded-xl border border-gold-400/25 bg-gold-400/10 px-3 py-2 text-left text-xs leading-5 text-gold-200 transition hover:bg-gold-400/20">{ROLE_SUGGESTION[user.role] ?? 'How does the valuation process work?'}</button>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${message.role === 'user' ? 'rounded-br-md bg-gold-400 text-emerald-950' : 'rounded-bl-md border border-white/10 bg-white/5 text-emerald-50'}`}>
                  {message.content}
                  {message.sources && message.sources.length > 0 && <p className="mt-2 border-t border-white/10 pt-1.5 text-[10px] leading-4 text-emerald-200/45">Sources: {message.sources.join(' · ')}</p>}
                </div>
              </div>
            ))}
            {busy && <div className="flex justify-start"><div className="animate-pulse rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-emerald-100/65">Thinking…</div></div>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="border-t border-white/10 bg-emerald-950 p-3">
            {error && <p className="mb-2 text-[11px] text-red-300">{error}</p>}
            <div className="flex gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} disabled={busy} maxLength={1000} placeholder="Type your question…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-emerald-900/60 px-3 py-2.5 text-xs text-white placeholder:text-emerald-100/35 focus:border-gold-400/50 focus:outline-none" />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-emerald-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40">➤</button>
            </div>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} className="group relative ml-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/70 bg-gradient-to-br from-gold-100 via-gold-300 to-gold-500 text-emerald-950 shadow-[0_10px_30px_rgba(0,0,0,0.38),0_0_0_5px_rgba(227,194,74,0.12)] transition duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_14px_36px_rgba(0,0,0,0.4),0_0_0_7px_rgba(227,194,74,0.16)]">
        {open ? <span className="text-3xl font-light leading-none">×</span> : <ChatbotIcon className="h-14 w-14 transition-transform duration-200 group-hover:scale-105" />}
        {!open && <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-950 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" aria-hidden="true" />}
      </button>
    </div>
  )
}

export default FloatingChatbot

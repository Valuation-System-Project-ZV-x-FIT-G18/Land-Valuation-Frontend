//06
import { useEffect, useRef, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import { downloadAttachment } from '@/Home_Pages/messages/api/messages'
import type { Message, Partner } from '@/Home_Pages/messages/types/messages'

type ConversationProps = {
  me: string
  partner: Partner
  messages: Message[]
  onSend: (body: string, file: File | null) => Promise<{ ok: boolean; error?: string }>
  onBack: () => void
}

const time = (iso: string) => {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
}

const Conversation = ({ me, partner, messages, onSend, onBack }: ConversationProps) => {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !file) return
    setSending(true)
    const res = await onSend(text.trim(), file)
    setSending(false)
    if (res.ok) {
      setText('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } else {
      setError(res.error ?? 'Could not send.')
    }
  }

  const openAttachment = async (message: Message) => {
    setError('')
    const blob = await downloadAttachment(message.id)
    if (!blob) {
      setError('Could not open the attachment.')
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = message.fileName
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-emerald-700 px-4 py-3">
        <button type="button" onClick={onBack} className="text-emerald-200 transition hover:text-white md:hidden">←</button>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-white">
          {partner.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{partner.name}</p>
          <p className="text-xs text-emerald-200">{partner.role} · {partner.userId}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-surface-sunken p-4 sm:p-6">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-emerald-200">No messages yet. Say hello 👋</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-lg border px-3.5 py-2.5 text-sm ${mine ? 'border-accent-400/20 bg-accent-400 text-emerald-950' : 'border-emerald-700 bg-surface-muted text-emerald-100'}`}>
                  {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                  {m.fileName && (
                    <button
                      type="button"
                      onClick={() => void openAttachment(m)}
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium underline ${mine ? 'bg-surface text-emerald-900' : 'bg-white/10 text-accent-200'}`}
                    >
                      Attachment: {m.fileName}
                    </button>
                  )}
                  <p className={`mt-1 text-[10px] ${mine ? 'text-emerald-900' : 'text-emerald-200'}`}>{time(m.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Reply box */}
      <form onSubmit={submit} className="border-t border-emerald-700 bg-surface p-3">
        {file && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-emerald-100">
            <span className="truncate">Attachment: {file.name}</span>
            <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="ml-auto text-emerald-200 hover:text-red-300">✕</button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="cursor-pointer rounded-lg border border-white/15 p-2.5 text-emerald-100 transition hover:border-accent-400/50 hover:text-accent-200" title="Attach a file (PDF)">
            Attach file
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError('') }}
            />
          </label>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError('') }}
            rows={1}
            placeholder="Type a message…"
            className="max-h-32 flex-1 resize-none rounded-md border border-emerald-700 bg-surface px-4 py-2.5 text-sm text-white placeholder:text-emerald-200 outline-none focus:border-accent-400/60 focus:ring-2 focus:ring-accent-400/20"
          />
          <Button type="submit" disabled={sending || (!text.trim() && !file)} className="!px-5 !py-2.5">
            {sending ? '…' : 'Send'}
          </Button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
      </form>
    </div>
  )
}

export default Conversation

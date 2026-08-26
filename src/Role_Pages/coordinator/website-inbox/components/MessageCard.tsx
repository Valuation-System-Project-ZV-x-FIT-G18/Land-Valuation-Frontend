import Card from '@/Common_Pages/components/ui/Card'

type MessageCardProps = { name: string; email: string; phone: string; message: string; createdAt: string }

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?'

const MessageCard = ({ name, email, phone, message, createdAt }: MessageCardProps) => (
  <Card className="group overflow-hidden transition duration-200 hover:border-accent-400/25 hover:shadow-card-hover">
    <div className="flex gap-4 p-5 sm:p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent-400/20 bg-accent-400/10 text-sm font-semibold text-accent-300">{initials(name)}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="font-semibold text-white">{name}</p><p className="mt-0.5 text-xs text-emerald-200">Website inquiry</p></div>
          <time dateTime={createdAt} className="shrink-0 text-[11px] font-medium text-emerald-200">{formatDate(createdAt)}</time>
        </div>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-emerald-50">{message}</p>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4" aria-label="Contact information">
          <span className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-accent-400/15 px-3 py-2 text-xs font-semibold text-accent-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            <span className="break-all">{email}</span>
          </span>
          {phone && <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-emerald-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62a2 2 0 0 1 2 2.29Z" /></svg>{phone}
          </span>}
        </div>
      </div>
    </div>
  </Card>
)

export default MessageCard

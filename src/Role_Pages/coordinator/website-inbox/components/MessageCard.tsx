import Card from '@/Common_Pages/components/ui/Card'

// One website submission (a valuation request or a contact message).
type MessageCardProps = {
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
  nic?: string
}

const formatDate = (value: string) => {
  const d = new Date(value)
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const MessageCard = ({ name, email, phone, message, createdAt, nic }: MessageCardProps) => (
  <Card className="p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-xs text-emerald-200/60">
          {email}
          {phone ? ` · ${phone}` : ''}
          {nic ? ` · NIC ${nic}` : ''}
        </p>
      </div>
      <span className="shrink-0 text-xs text-emerald-200/40">{formatDate(createdAt)}</span>
    </div>
    <p className="mt-3 whitespace-pre-wrap break-words border-t border-white/10 pt-3 text-sm text-emerald-50/90">
      {message}
    </p>
  </Card>
)

export default MessageCard

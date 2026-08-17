//04
import type { Thread } from '@/Home_Pages/messages/types/messages'

// The list of the current user's conversations (one per other person).
type ThreadListProps = {
  threads: Thread[]
  activeId?: string
  onSelect: (t: Thread) => void
}

const ThreadList = ({ threads, activeId, onSelect }: ThreadListProps) => {
  if (threads.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-xs text-emerald-200/50">
        No conversations yet.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {threads.map((t) => (
        <button
          key={t.otherId}
          type="button"
          onClick={() => onSelect(t)}
          className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
            activeId === t.otherId
              ? 'border-gold-400/40 bg-white/10'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/40 to-gold-500/30 text-sm font-bold text-white">
            {t.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-white">{t.name}</p>
              {t.unread > 0 && (
                <span className="ml-1 shrink-0 rounded-full bg-gold-400 px-1.5 text-[10px] font-bold text-emerald-950">
                  {t.unread}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-emerald-200/50">{t.role}</p>
            <p className="mt-0.5 truncate text-xs text-emerald-100/60">{t.lastBody}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

export default ThreadList

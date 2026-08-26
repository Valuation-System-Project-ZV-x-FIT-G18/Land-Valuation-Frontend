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
      <p className="p-6 text-center text-xs text-slate-500">
        No conversations yet.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {threads.map((t) => (
        <button
          key={t.otherId}
          type="button"
          onClick={() => onSelect(t)}
          className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition ${
            activeId === t.otherId
              ? 'border-accent-400/30 bg-accent-400/10'
              : 'border-transparent hover:border-emerald-700 hover:bg-surface'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-emerald-50">
            {t.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-white">{t.name}</p>
              {t.unread > 0 && (
                <span className="ml-1 shrink-0 rounded-full bg-accent-400 px-1.5 text-[10px] font-bold text-emerald-950">
                  {t.unread}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-emerald-200">{t.role}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{t.lastBody}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

export default ThreadList

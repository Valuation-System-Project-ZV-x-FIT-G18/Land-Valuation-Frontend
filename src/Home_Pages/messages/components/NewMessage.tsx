import { useEffect, useState } from 'react'
import { searchUsers } from '@/Home_Pages/messages/api/messages'
import type { DirectoryUser, Partner } from '@/Home_Pages/messages/types/messages'

const NewMessage = ({ onStart }: { onStart: (partner: Partner) => void }) => {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      const result = await searchUsers(query)
      if (!active) return
      setUsers(result.users)
      setError(result.error ?? '')
      setLoading(false)
    }, 250)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])

  const open = (user: DirectoryUser) => {
    onStart({ userId: user.userId, name: user.name, role: user.role })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-emerald-700 p-5">
        <h3 className="text-lg font-bold text-white">New message</h3>
        <p className="mt-1 text-sm text-emerald-100">Search by name, email, role, or account ID.</p>
        <label className="mt-4 block">
          <span className="sr-only">Search people</span>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people"
            className="w-full rounded-md border border-emerald-700 bg-surface px-4 py-3 text-sm text-white outline-none placeholder:text-emerald-200 focus:border-accent-400/60 focus:ring-2 focus:ring-accent-400/20"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <p className="p-6 text-center text-sm text-emerald-100">Searching...</p>
        ) : error ? (
          <p className="p-6 text-center text-sm text-red-300">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-center text-sm text-emerald-100">No matching people found.</p>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <button
                key={user.userId}
                type="button"
                onClick={() => open(user)}
                className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-3 text-left transition hover:border-emerald-700 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
                  <span className="block truncate text-xs text-emerald-100">{user.email}</span>
                </span>
                <span className="shrink-0 text-xs text-accent-200">{user.role}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewMessage

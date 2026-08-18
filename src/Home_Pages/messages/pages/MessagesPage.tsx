import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ThreadList from '@/Home_Pages/messages/components/ThreadList'
import NewMessage from '@/Home_Pages/messages/components/NewMessage'
import Conversation from '@/Home_Pages/messages/components/Conversation'
import { getThreads, getConversation, sendMessage } from '@/Home_Pages/messages/api/messages'
import type { Message, Partner, Thread } from '@/Home_Pages/messages/types/messages'

const MessagesPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const me = user?.userId ?? ''
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<Partner | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [composing, setComposing] = useState(false)

  const loadThreads = useCallback(async () => {
    if (!me) return
    setThreads((await getThreads()).threads)
  }, [me])

  const loadConversation = useCallback(async () => {
    if (!me || !active) return
    setMessages((await getConversation(active.userId)).messages)
  }, [me, active])

  useEffect(() => {
    void loadThreads()
    const timer = setInterval(loadThreads, 8000)
    return () => clearInterval(timer)
  }, [loadThreads])

  useEffect(() => {
    if (!active) {
      setMessages([])
      return
    }
    void loadConversation()
    const timer = setInterval(loadConversation, 4000)
    return () => clearInterval(timer)
  }, [active, loadConversation])

  const openPartner = (partner: Partner) => {
    setComposing(false)
    setActive(partner)
  }

  const handleSend = async (body: string, file: File | null) => {
    if (!active) return { ok: false, error: 'No conversation open.' }
    const result = await sendMessage(active.userId, body, file)
    if (result.ok) {
      await loadConversation()
      void loadThreads()
    }
    return result
  }

  const newMessage = () => {
    setComposing(true)
    setActive(null)
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)} className="!px-3">
            <span aria-hidden="true">&larr;</span>
            <span>Back</span>
          </Button>
          <div className="h-7 w-px bg-white/10" />
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Messages</h1>
            <p className="text-xs text-slate-400">{threads.length} conversation{threads.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={newMessage}
          className="!rounded-lg !bg-gold-400 !text-emerald-950 !shadow-none hover:!translate-y-0 hover:!bg-gold-300"
        >
          <span className="text-lg leading-none" aria-hidden="true">+</span>
          New message
        </Button>
      </div>

      <section className="grid h-[calc(100vh-12rem)] min-h-[540px] overflow-hidden rounded-lg border border-slate-700/60 bg-[#0b1f24] shadow-card md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className={`${composing || active ? 'hidden md:flex' : 'flex'} min-h-0 flex-col border-r border-slate-700/60 bg-[#0d292d]`}>
          <div className="border-b border-slate-700/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-slate-400">Recent conversations</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <ThreadList
              threads={threads}
              activeId={active?.userId}
              onSelect={(thread) => openPartner({ userId: thread.otherId, name: thread.name, role: thread.role })}
            />
          </div>
        </aside>

        <div className={`${!composing && !active ? 'hidden md:block' : 'block'} min-h-0 bg-[#0a2427]`}>
          {composing ? (
            <NewMessage onStart={openPartner} />
          ) : active ? (
            <Conversation me={me} partner={active} messages={messages} onSend={handleSend} onBack={() => setActive(null)} />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-600/60 bg-slate-800/40 text-lg text-slate-300" aria-hidden="true">@</div>
                <p className="mt-4 text-sm font-medium text-slate-300">Choose a conversation</p>
                <p className="mt-1 text-xs text-slate-500">Select a recent thread or start a new message.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default MessagesPage

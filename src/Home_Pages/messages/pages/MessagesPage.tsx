import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ThreadList from '@/Home_Pages/messages/components/ThreadList'
import NewMessage from '@/Home_Pages/messages/components/NewMessage'
import Conversation from '@/Home_Pages/messages/components/Conversation'
import {
  getThreads,
  getConversation,
  sendMessage,
} from '@/Home_Pages/messages/api/messages'
import type { Message, Partner, Thread } from '@/Home_Pages/messages/types/messages'

// In-system private messaging. Pick a role + person to start a chat; only the
// two of you can see it. Replies appear live (polled every few seconds).
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
    setThreads((await getThreads(me)).threads)
  }, [me])

  const loadConversation = useCallback(async () => {
    if (!me || !active) return
    setMessages((await getConversation(me, active.userId)).messages)
  }, [me, active])

  // Poll the inbox.
  useEffect(() => {
    loadThreads()
    const t = setInterval(loadThreads, 8000)
    return () => clearInterval(t)
  }, [loadThreads])

  // Poll the open conversation so replies show up.
  useEffect(() => {
    if (!active) {
      setMessages([])
      return
    }
    loadConversation()
    const t = setInterval(loadConversation, 4000)
    return () => clearInterval(t)
  }, [active, loadConversation])

  const openPartner = (p: Partner) => {
    setComposing(false)
    setActive(p)
  }

  const handleSend = async (body: string, file: File | null) => {
    if (!active) return { ok: false, error: 'No conversation open.' }
    const res = await sendMessage(me, active.userId, body, file)
    if (res.ok) {
      await loadConversation()
      loadThreads()
    }
    return res
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(-1)}
        className="!px-5 !py-2.5 text-sm"
      >
        ← Back
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          <GradientText>Messages</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Send a private message to any user. Only you and they can see it.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Left: new message + conversations */}
        <div className="space-y-3">
          <Button
            type="button"
            fullWidth
            onClick={() => {
              setComposing(true)
              setActive(null)
            }}
          >
            + New Message
          </Button>
          <ThreadList
            threads={threads}
            activeId={active?.userId}
            onSelect={(t) => openPartner({ userId: t.otherId, name: t.name, role: t.role })}
          />
        </div>

        {/* Right: compose or the active conversation */}
        <div>
          {composing ? (
            <NewMessage onStart={openPartner} />
          ) : active ? (
            <Conversation
              me={me}
              partner={active}
              messages={messages}
              onSend={handleSend}
              onBack={() => setActive(null)}
            />
          ) : (
            <Card className="flex h-[70vh] items-center justify-center p-8 text-center">
              <p className="text-sm text-emerald-200/50">
                Select a conversation, or start a new message.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesPage

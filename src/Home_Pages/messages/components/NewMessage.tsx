import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { listUsersByRole, sendForm } from '@/Home_Pages/messages/api/messages'
import type { DirectoryUser, Partner } from '@/Home_Pages/messages/types/messages'

// Every role that can be messaged, including the external roles.
const allRoles = [
  'Admin',
  'Coordinator',
  'Technical Officer',
  'Manager L1',
  'Manager L2',
  'Manager L3',
  'Bank', // external
  'Loan Applicant', // external
]

const NewMessage = ({ onStart }: { onStart: (p: Partner) => void }) => {
  const { user } = useAuth()
  const isCoordinator = user?.role === 'Coordinator'

  // A Coordinator messages clients (Loan Applicants) most of the time, so
  // skip the role picker entirely and go straight to a client dropdown —
  // with the option to send them the Project Details Form right here.
  if (isCoordinator) return <NewClientMessage onStart={onStart} />

  return <NewRoleMessage onStart={onStart} />
}

// Coordinator-only: pick a client directly (no role step), then either open
// a chat with them or send them the Project Details Form straight away.
const NewClientMessage = ({ onStart }: { onStart: (p: Partner) => void }) => {
  const { user } = useAuth()
  const me = user?.userId ?? ''
  const [clients, setClients] = useState<DirectoryUser[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingForm, setSendingForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    listUsersByRole('Loan Applicant').then((res) => {
      setClients(res.users)
      if (res.error) setError(res.error)
      setLoading(false)
    })
  }, [])

  const selected = clients.find((c) => c.userId === userId)
  const clientOptions = [
    { value: '', label: loading ? 'Loading…' : clients.length ? 'Select a client' : 'No clients registered yet' },
    ...clients.map((c) => ({ value: c.userId, label: `${c.name} (${c.userId})` })),
  ]

  const openChat = () => {
    if (!selected) return setError('Choose a client.')
    onStart({ userId: selected.userId, name: selected.name, role: 'Loan Applicant' })
  }

  const sendFormToClient = async () => {
    if (!selected) return setError('Choose a client.')
    setSendingForm(true)
    setError('')
    const res = await sendForm(me, selected.userId)
    setSendingForm(false)
    if (res.ok) {
      // Jump straight into the conversation so they see it was sent.
      onStart({ userId: selected.userId, name: selected.name, role: 'Loan Applicant' })
    } else {
      setError(res.error ?? 'Could not send the form.')
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-bold text-white">Message a Client</h3>
      <div className="space-y-5">
        <SelectField
          label="Client"
          name="client"
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setError('') }}
          options={clientOptions}
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" fullWidth onClick={openChat} disabled={!userId}>
            Open Chat
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={sendFormToClient}
            disabled={!userId || sendingForm}
            loading={sendingForm}
          >
            📋 Send Form
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Every other role: pick a role, then a person of that role, to open a chat.
const NewRoleMessage = ({ onStart }: { onStart: (p: Partner) => void }) => {
  const { user } = useAuth()
  const [role, setRole] = useState('')
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onRole = async (r: string) => {
    setRole(r)
    setUserId('')
    setUsers([])
    setError('')
    if (!r) return
    setLoading(true)
    const res = await listUsersByRole(r)
    setUsers(res.users.filter((u) => u.userId !== user?.userId)) // exclude yourself
    if (res.error) setError(res.error)
    setLoading(false)
  }

  const start = () => {
    const u = users.find((x) => x.userId === userId)
    if (!u) return setError('Choose a recipient.')
    onStart({ userId: u.userId, name: u.name, role })
  }

  // You message OTHER roles — hide your own role from the list.
  const roles = allRoles.filter((r) => r !== user?.role)
  const roleOptions = [{ value: '', label: 'Select a role' }, ...roles.map((r) => ({ value: r, label: r }))]
  const userOptions = [
    { value: '', label: loading ? 'Loading…' : users.length ? 'Select a person' : 'No users in this role' },
    ...users.map((u) => ({ value: u.userId, label: `${u.name} (${u.userId})` })),
  ]

  return (
    <Card className="p-6 sm:p-8">
      <h3 className="mb-5 text-lg font-bold text-white">New Message</h3>
      <div className="space-y-5">
        <SelectField label="Role" name="role" value={role} onChange={(e) => onRole(e.target.value)} options={roleOptions} />
        <SelectField
          label="Recipient"
          name="recipient"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value)
            setError('')
          }}
          options={userOptions}
        />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <Button type="button" fullWidth onClick={start} disabled={!userId}>
          Open Chat
        </Button>
      </div>
    </Card>
  )
}

export default NewMessage

//04
import { useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { listUsersByRole } from '@/Home_Pages/messages/api/messages'
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

// Pick a role, then a person of that role, to open a chat with them.
const NewMessage = ({ onStart }: { onStart: (p: Partner) => void }) => {
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

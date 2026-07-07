import Card from '@/Common_Pages/components/ui/Card'

// Shows the logged-in user's details on the dashboard.
type WelcomeCardProps = {
  name: string
  role: string
  userId: string
}

const WelcomeCard = ({ name, role, userId }: WelcomeCardProps) => (
  <Card className="mt-6 p-6 sm:p-8">
    <p className="text-xl font-semibold text-white">Welcome, {name} 👋</p>

    <dl className="mt-4 space-y-2 text-sm">
      <div className="flex justify-between border-b border-white/10 pb-2">
        <dt className="text-emerald-200/80">Role</dt>
        <dd className="font-medium text-gold-300">{role}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-emerald-200/80">User ID</dt>
        <dd className="font-medium text-white">{userId}</dd>
      </div>
    </dl>

    <p className="mt-4 text-sm text-emerald-100/70">
      Your role-specific tools will appear here.
    </p>
  </Card>
)

export default WelcomeCard

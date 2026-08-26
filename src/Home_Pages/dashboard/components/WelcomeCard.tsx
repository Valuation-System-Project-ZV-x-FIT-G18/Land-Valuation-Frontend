import Card from '@/Common_Pages/components/ui/Card'
import Avatar from '@/Common_Pages/components/ui/Avatar'

// Shows the logged-in user's details on the dashboard.
type WelcomeCardProps = {
  name: string
  role: string
  userId: string
  photoPath?: string
}

const WelcomeCard = ({ name, role, userId, photoPath }: WelcomeCardProps) => (
  <Card className="mt-6 overflow-hidden">
    <div className="h-1 w-full bg-gradient-to-r from-amber-200 via-accent-300 to-amber-400" />

    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-center gap-4">
        <Avatar userId={userId} name={name} photoPath={photoPath} size="lg" />
        <div>
          <p className="text-xl font-semibold text-white">Welcome, {name}</p>
          <p className="mt-0.5 text-sm text-emerald-200">{role}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs sm:self-auto">
        <span className="text-emerald-200">User ID</span>
        <span className="font-medium text-accent-300">{userId}</span>
      </div>
    </div>
  </Card>
)

export default WelcomeCard

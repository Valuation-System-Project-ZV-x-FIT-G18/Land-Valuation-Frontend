import GradientText from '@/Common_Pages/components/ui/GradientText'
import Card from '@/Common_Pages/components/ui/Card'

// A simple "coming soon" page, reused for internal pages not built yet.
const PlaceholderPage = ({ title }: { title: string }) => (
  <div>
    <h1 className="text-3xl font-bold text-white sm:text-4xl">
      <GradientText>{title}</GradientText>
    </h1>
    <Card className="mt-6 p-6 sm:p-8">
      <p className="text-emerald-100/80">This page is coming soon.</p>
    </Card>
  </div>
)

export default PlaceholderPage

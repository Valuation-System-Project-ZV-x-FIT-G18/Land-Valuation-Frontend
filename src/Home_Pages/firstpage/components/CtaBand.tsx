import Reveal from '@/Common_Pages/components/ui/Reveal'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useLoginModal } from '@/Common_Pages/components/auth/useLoginModal'

// Closing call-to-action band — a full-width photo panel with a green overlay
// and the primary login action, so the page ends on a clear next step.
const CtaBand = () => {
  const { openLogin } = useLoginModal()

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-gold-400/25 shadow-card-hover">
          {/* Background photo */}
          <img
            src="/images/land-green.jpg"
            alt="Aerial view of green land ready for valuation"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Green brand overlay for readable text on top of the photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-emerald-950/70" />

          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">
              Ready to value your land the <GradientText>smart way?</GradientText>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-100/80">
              Join banks, applicants and valuation professionals across all 24 districts
              already using CODEHUB.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button type="button" variant="outline" size="lg" onClick={openLogin}>
                Login to Your Account
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default CtaBand

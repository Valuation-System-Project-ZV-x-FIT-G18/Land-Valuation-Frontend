import TrustIndicators from '@/Home_Pages/firstpage/components/TrustIndicators'
import HeroVisual from '@/Home_Pages/firstpage/components/HeroVisual'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Button from '@/Common_Pages/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useLoginModal } from '@/Common_Pages/components/auth/useLoginModal'

// Hero section for the homepage.
// Left column: heading, subtitle, trust indicators.
// Right column: the visual report-preview element (HeroVisual).
// The call-to-action buttons live in the closing CtaBand at the bottom of the
// page, so they are intentionally not repeated here.
const Hero = () => {
  const navigate = useNavigate()
  const { openLogin } = useLoginModal()
  return (
    <section className="home-hero mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:py-24">
      {/* ---- Left column: text content (staggered entrance animation) ---- */}
      <div className="text-center lg:text-left">
        {/* Small eyebrow badge */}
        <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-4 py-1.5 text-xs font-semibold text-brand-navy shadow-sm">
          <span className="h-2 w-2 rounded-full bg-brand-cyan" />
          Sri Lanka&apos;s Land Valuation Platform
        </span>

        {/* Main heading */}
        <h1
          className="mt-6 animate-fade-up text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          style={{ animationDelay: '0.08s' }}
        >
          Sri Lanka&apos;s Trusted{' '}
          <GradientText>Digital Land Valuation</GradientText> Platform
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-6 max-w-xl animate-fade-up text-base leading-7 text-slate-600 sm:text-lg lg:mx-0"
          style={{ animationDelay: '0.16s' }}
        >
          AI-powered land valuation workflow for banks, loan applicants, and
          valuation professionals.
        </p>

        <div className="mt-8 flex animate-fade-up flex-wrap justify-center gap-3 lg:justify-start" style={{ animationDelay: '0.2s' }}>
          <Button className="home-primary-cta" type="button" onClick={() => navigate('/request-valuation')}>Request a Valuation</Button>
          <Button className="home-secondary-cta" type="button" variant="outline" onClick={openLogin}>Sign in to Portal</Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.24s' }}>
          <TrustIndicators />
        </div>
      </div>

      {/* ---- Right column: visual element ---- */}
      <div className="animate-fade-up lg:pl-8" style={{ animationDelay: '0.2s' }}>
        <HeroVisual />
      </div>
    </section>
  )
}

export default Hero

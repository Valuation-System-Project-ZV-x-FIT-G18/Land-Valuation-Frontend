import TrustIndicators from '@/Home_Pages/firstpage/components/TrustIndicators'
import HeroVisual from '@/Home_Pages/firstpage/components/HeroVisual'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Hero section for the homepage.
// Left column: heading, subtitle, trust indicators.
// Right column: the visual report-preview element (HeroVisual).
// The call-to-action buttons live in the closing CtaBand at the bottom of the
// page, so they are intentionally not repeated here.
const Hero = () => {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:py-24">
      {/* ---- Left column: text content (staggered entrance animation) ---- */}
      <div className="text-center lg:text-left">
        {/* Small eyebrow badge */}
        <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-gold-400/30 bg-white/5 px-4 py-1.5 text-xs font-medium text-emerald-100 backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
          Sri Lanka&apos;s Land Valuation Platform
        </span>

        {/* Main heading */}
        <h1
          className="mt-6 animate-fade-up text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          style={{ animationDelay: '0.08s' }}
        >
          Sri Lanka&apos;s Trusted{' '}
          <GradientText>Digital Land Valuation</GradientText> Platform
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-6 max-w-xl animate-fade-up text-base text-emerald-100/85 sm:text-lg lg:mx-0"
          style={{ animationDelay: '0.16s' }}
        >
          AI-powered land valuation workflow for banks, loan applicants, and
          valuation professionals.
        </p>

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

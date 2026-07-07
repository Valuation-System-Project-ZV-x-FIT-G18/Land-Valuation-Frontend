import Reveal from '@/Common_Pages/components/ui/Reveal'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// "How it works" — the 4-step journey from request to bank-ready report.
// Each step is a glass card with a number badge, icon and short description.
const steps = [
  {
    icon: '📝',
    title: 'Request a Valuation',
    text: 'Submit your property details online in minutes — no paperwork, no queues.',
  },
  {
    icon: '📍',
    title: 'On-Site Inspection',
    text: 'A licensed technical officer visits the land, captures GPS, photos and field data.',
  },
  {
    icon: '✨',
    title: 'AI-Assisted Report',
    text: 'AI drafts descriptions and researches real market comparables for an accurate figure.',
  },
  {
    icon: '🏦',
    title: 'Bank-Ready Report',
    text: 'A multi-level reviewed, professional report is delivered straight to your bank.',
  },
]

const HowItWorks = () => (
  <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300/80">
        Simple Process
      </p>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        How It <GradientText>Works</GradientText>
      </h2>
      <p className="mt-4 text-emerald-100/70">
        From request to a bank-ready valuation in four clear steps.
      </p>
    </Reveal>

    <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Connecting line behind the cards on large screens */}
      <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent lg:block" />

      {steps.map((step, i) => (
        <Reveal key={step.title} delay={i * 120}>
          <div className="card-hover group relative h-full rounded-2xl border border-white/10 bg-emerald-950/40 p-6 text-center shadow-card backdrop-blur-sm hover:border-gold-400/40 hover:shadow-card-hover">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-gold-400/20 text-3xl ring-1 ring-gold-400/25 transition-transform duration-300 group-hover:scale-110">
              {step.icon}
            </div>
            <span className="mt-4 inline-block rounded-full bg-gold-400/15 px-3 py-0.5 text-xs font-bold text-gold-200">
              Step {i + 1}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm text-emerald-100/70">{step.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
)

export default HowItWorks

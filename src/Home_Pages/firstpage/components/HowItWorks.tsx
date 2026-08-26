import Reveal from '@/Common_Pages/components/ui/Reveal'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// "How it works" — the 4-step journey from request to bank-ready report.
// Each step is a glass card with a number badge, icon and short description.
const steps = [
  {
    title: 'Request a Valuation',
    text: 'Submit your property details online in minutes — no paperwork, no queues.',
  },
  {
    title: 'On-Site Inspection',
    text: 'A licensed technical officer visits the land, captures GPS, photos and field data.',
  },
  {
    title: 'AI-Assisted Report',
    text: 'AI drafts descriptions and researches real market comparables for an accurate figure.',
  },
  {
    title: 'Bank-Ready Report',
    text: 'A multi-level reviewed, professional report is delivered straight to your bank.',
  },
]

const HowItWorks = () => (
  <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
        Simple Process
      </p>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        How It <GradientText>Works</GradientText>
      </h2>
      <p className="mt-4 text-emerald-100">
        From request to a bank-ready valuation in four clear steps.
      </p>
    </Reveal>

    <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Connecting line behind the cards on large screens */}
      <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent lg:block" />

      {steps.map((step, i) => (
        <Reveal key={step.title} delay={i * 120}>
          <div className="card-hover group relative h-full rounded-2xl border border-white/10 bg-surface p-6 text-center shadow-card hover:border-accent-400/40 hover:shadow-card-hover">
            <span className="mt-4 inline-block rounded-full bg-accent-400/15 px-3 py-0.5 text-xs font-bold text-accent-200">
              Step {i + 1}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm text-emerald-100">{step.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
)

export default HowItWorks

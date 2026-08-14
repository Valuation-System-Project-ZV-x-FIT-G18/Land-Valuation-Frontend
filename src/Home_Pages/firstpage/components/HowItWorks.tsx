import Reveal from '@/Common_Pages/components/ui/Reveal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SidebarIcon from '@/Common_Pages/components/sidebar/SidebarIcon'

// "How it works" — the 4-step journey from request to bank-ready report.
// Each step is a glass card with a number badge, icon and short description.
const steps = [
  {
    icon: 'edit',
    title: 'Request a Valuation',
    text: 'Submit your property details online in minutes — no paperwork, no queues.',
  },
  {
    icon: 'location',
    title: 'On-Site Inspection',
    text: 'A licensed technical officer visits the land, captures GPS, photos and field data.',
  },
  {
    icon: 'document',
    title: 'AI-Assisted Report',
    text: 'AI drafts descriptions and researches real market comparables for an accurate figure.',
  },
  {
    icon: 'check',
    title: 'Bank-Ready Report',
    text: 'A multi-level reviewed, professional report is delivered straight to your bank.',
  },
]

const HowItWorks = () => (
  <section className="border-y border-blue-100 bg-white/55 py-20">
   <div className="mx-auto max-w-7xl px-4 sm:px-8">
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
          <div className="card-hover group relative h-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:border-blue-300 hover:shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-brand-blue ring-1 ring-cyan-200 transition group-hover:bg-brand-cyan group-hover:text-white">
              <SidebarIcon name={step.icon} />
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
   </div>
  </section>
)

export default HowItWorks

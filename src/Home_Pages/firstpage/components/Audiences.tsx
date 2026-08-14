import Reveal from '@/Common_Pages/components/ui/Reveal'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// "Built for everyone" — three audience cards, each with a real photo, an
// overlay, and the key benefits for that group.
const audiences = [
  {
    image: '/images/city-skyline.jpg',
    tag: 'For Banks & Lenders',
    title: 'Confident Lending Decisions',
    points: ['Standardised, reviewed reports', 'Faster loan turnaround', 'Full audit trail per project'],
  },
  {
    image: '/images/property-house.jpg',
    tag: 'For Loan Applicants',
    title: 'A Simple, Transparent Process',
    points: ['Request online in minutes', 'Track your valuation live', 'Secure document uploads'],
  },
  {
    image: '/images/officer-inspection.jpg',
    tag: 'For Valuation Professionals',
    title: 'Powerful Field-to-Report Tools',
    points: ['GPS mapping & site photos', 'AI-drafted descriptions', 'Market comparables research'],
  },
]

const Audiences = () => (
  <section className="home-toned-section mx-auto max-w-7xl px-4 py-20 sm:px-8">
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300/80">
        One Platform
      </p>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        Built for <GradientText>Everyone</GradientText>
      </h2>
      <p className="mt-4 text-emerald-100/70">
        Whether you lend, borrow, or value — CODEHUB fits your part of the journey.
      </p>
    </Reveal>

    <div className="mt-14 grid gap-6 lg:grid-cols-3">
      {audiences.map((a, i) => (
        <Reveal key={a.title} delay={i * 130}>
          <div className="card-hover group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-lg">
            {/* Photo with gradient overlay */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={a.image}
                alt={a.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
              <span className="absolute bottom-3 left-4 rounded-full border border-cyan-200/80 bg-cyan-50/95 px-3 py-1 text-xs font-semibold text-brand-navy shadow-sm backdrop-blur-sm">
                {a.tag}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">{a.title}</h3>
              <ul className="mt-4 space-y-2">
                {a.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-emerald-100/80">
                    <span className="mt-0.5 text-gold-400">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
)

export default Audiences

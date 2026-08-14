import Reveal from '@/Common_Pages/components/ui/Reveal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SidebarIcon from '@/Common_Pages/components/sidebar/SidebarIcon'

// Feature grid — the platform's standout capabilities as compact icon cards.
const features = [
  { icon: 'document', title: 'AI-Powered Descriptions', text: 'Generate professional land, locality and legal write-ups in seconds.' },
  { icon: 'location', title: 'Live Map & GPS', text: 'Pinpoint the exact property with satellite imagery and GPS coordinates.' },
  { icon: 'map', title: 'Nearby Land Analysis', text: 'Identify and compare the closest suitable lands by distance, recency, land use and access.' },
  { icon: 'document', title: 'Secure Document Vault', text: 'Applicants upload documents safely; officers review with one click.' },
  { icon: 'check', title: 'Multi-Level Review', text: 'Every report passes structured L1–L3 manager checks before release.' },
  { icon: 'mail', title: 'Instant Notifications', text: 'Email updates at every milestone keep everyone in the loop.' },
]

const Features = () => (
  <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300/80">
        Everything Included
      </p>
      <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        Powerful <GradientText>Features</GradientText>
      </h2>
      <p className="mt-4 text-emerald-100/70">
        A complete valuation workflow — from field inspection to final report.
      </p>
    </Reveal>

    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => (
        <Reveal key={f.title} delay={(i % 3) * 100}>
          <div className="card-hover group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-lg">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-brand-blue ring-1 ring-cyan-200 transition group-hover:bg-brand-cyan group-hover:text-white">
              <SidebarIcon name={f.icon} />
            </span>
            <div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-emerald-100/70">{f.text}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
)

export default Features

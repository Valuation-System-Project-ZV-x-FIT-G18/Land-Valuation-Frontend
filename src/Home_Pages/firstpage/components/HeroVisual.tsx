import SriLankaMap from '@/Home_Pages/firstpage/components/SriLankaMap'

// Visual element for the right side of the hero.
// Shows a Sri Lanka map with valuation locations, plus an overlapping photo
// of a technical officer conducting a field inspection.

const HeroVisual = () => {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Soft glow behind the visual */}
      <div className="absolute -inset-6 rounded-[2rem] bg-cyan-300/15 blur-3xl" />

      {/* Main panel: dark emerald so the gold map + pins stand out clearly */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-white/95 p-6 shadow-[0_24px_70px_-30px_rgba(30,64,175,0.42)]">
        {/* Panel heading */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Valuation Coverage</p>
          <span className="flex items-center gap-1.5 text-xs font-medium text-brand-blue">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-cyan" />
            Live
          </span>
        </div>

        {/* Sri Lanka map */}
        <div className="mx-auto h-72 w-full">
          <SriLankaMap />
        </div>

        {/* Small legend */}
        <p className="mt-2 text-center text-xs text-slate-500">
          <span className="font-semibold text-brand-blue">24 districts</span> with
          active valuation locations
        </p>
      </div>

      {/* Overlapping photo card: technical officer conducting inspection */}
      <div className="absolute -bottom-8 -left-6 w-44 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl sm:w-52">
        <img
          src="/images/officer-inspection.jpg"
          alt="Technical officer conducting a land inspection with surveying equipment"
          className="h-28 w-full object-cover sm:h-32"
        />
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-slate-900">Field Inspection</p>
          <p className="text-[10px] text-slate-500">
            Licensed technical officers on site
          </p>
        </div>
      </div>
    </div>
  )
}

export default HeroVisual

type ReadinessItem = { label: string; ready: boolean }

const ReportReadiness = ({ items }: { items: ReadinessItem[] }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">Report Readiness</p>
    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-2 text-slate-700">
          <span>{item.label}</span>
          <span className={item.ready ? 'text-emerald-600' : 'text-amber-600'}>{item.ready ? '✓' : '⚠ Missing'}</span>
        </div>
      ))}
    </div>
  </div>
)

export default ReportReadiness

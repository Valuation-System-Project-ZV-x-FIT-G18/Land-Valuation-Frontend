// The CODEHUB mark: one geometric symbol used in the header, the sidebar and
// the favicon, so the brand reads the same everywhere.
//
// A location pin (the land being valued) sitting on a baseline (the valuation
// record). Drawn in the accent colour with currentColor for the pin, so it
// inherits whatever colour its container sets.

const BrandMark = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" role="img" aria-label="CODEHUB" className={className}>
    <rect width="40" height="40" rx="10" className="fill-accent-500" />
    <path
      d="M20 9.5c-4.14 0-7.5 3.3-7.5 7.38 0 5.16 6.34 11.9 6.61 12.18a1.23 1.23 0 0 0 1.78 0c.27-.28 6.61-7.02 6.61-12.18 0-4.08-3.36-7.38-7.5-7.38Z"
      className="fill-paper"
    />
    <circle cx="20" cy="16.8" r="2.9" className="fill-accent-500" />
    <rect x="12" y="31.5" width="16" height="2.2" rx="1.1" className="fill-paper" opacity="0.85" />
  </svg>
)

export default BrandMark

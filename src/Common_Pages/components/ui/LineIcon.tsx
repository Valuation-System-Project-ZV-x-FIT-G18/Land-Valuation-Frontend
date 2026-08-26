// Minimal stroked icons drawn in the accent colour.
//
// These replace the emoji that used to anchor the marketing cards: emoji are
// full-colour vendor artwork, so they never match a single-accent, matt
// palette. A one-weight line icon does the same job and stays on-brand.

export type LineIconName = 'mail' | 'phone' | 'pin'

const paths: Record<LineIconName, string> = {
  mail: 'M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9Zm0 .5 9 6 9-6',
  phone: 'M6.5 4h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6L16 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z',
  pin: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Zm0-8.2a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z',
}

const LineIcon = ({ name, className = 'h-5 w-5' }: { name: LineIconName; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d={paths[name]} />
  </svg>
)

export default LineIcon

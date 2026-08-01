// A persistent, prominent "card" confirmation banner shown after an action
// succeeds (e.g. approving a document, verifying a payment slip). Unlike a
// modal it doesn't block the page, so it fits list pages where staff process
// several items in a row.
type Props = { message: string }

const SuccessBanner = ({ message }: Props) => (
  <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-200">
    <span aria-hidden>✓</span>
    <span>{message}</span>
  </div>
)

export default SuccessBanner

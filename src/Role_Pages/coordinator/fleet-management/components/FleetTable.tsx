import type { ReactNode } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Table from '@/Common_Pages/components/ui/Table'

// A titled table used for each officer category (available, assigned, on leave,
// rejected). Thin wrapper around the shared Table primitive + a Card header with
// a count chip. Cells can be plain text or nodes (e.g. an action button).
type FleetTableProps = {
  title: string
  icon: string
  columns: string[]
  rows: ReactNode[][]
  emptyText: string
}

const FleetTable = ({ title, icon, columns, rows, emptyText }: FleetTableProps) => (
  <Card className="p-5 sm:p-6">
    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
      <span>{icon}</span> {title}
      <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-emerald-100/80">
        {rows.length}
      </span>
    </h3>

    <Table columns={columns} rows={rows} emptyText={emptyText} />
  </Card>
)

export default FleetTable

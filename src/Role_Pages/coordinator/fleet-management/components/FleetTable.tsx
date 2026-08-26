import type { ReactNode } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Table from '@/Common_Pages/components/ui/Table'

// A titled table used for each officer category (available, assigned, on leave,
// rejected). Thin wrapper around the shared Table primitive + a Card header with
// a count chip. Cells can be plain text or nodes (e.g. an action button).
type FleetTableProps = {
  title: string
  subtitle?: string
  columns: string[]
  rows: ReactNode[][]
  emptyText: string
}

const FleetTable = ({ title, subtitle, columns, rows, emptyText }: FleetTableProps) => (
  <Card className="p-5 sm:p-6">
    <div className="mb-4">
      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
        {title}
        <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-emerald-100">
          {rows.length}
        </span>
      </h3>
      {subtitle && <p className="mt-1 text-sm text-emerald-100">{subtitle}</p>}
    </div>

    <Table columns={columns} rows={rows} emptyText={emptyText} />
  </Card>
)

export default FleetTable

import type { ReactNode } from 'react'

// Reusable data table with the app's styling (horizontal scroll on small
// screens, subtle row dividers, hover highlight). Cells can be text or nodes
// (badges, buttons). Pass `emptyText` to show a friendly line when there are
// no rows. Keeps every table in the app looking identical.

type TableProps = {
  columns: string[]
  rows: ReactNode[][]
  emptyText?: string
  minWidth?: number
  className?: string
}

const Table = ({
  columns,
  rows,
  emptyText = 'Nothing to show yet.',
  minWidth = 640,
  className = '',
}: TableProps) => {
  if (rows.length === 0) {
    return <p className="text-sm text-emerald-200">{emptyText}</p>
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className="w-full border-collapse text-left text-sm"
        style={{ minWidth: `${minWidth}px` }}
      >
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-emerald-200">
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-emerald-100">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table

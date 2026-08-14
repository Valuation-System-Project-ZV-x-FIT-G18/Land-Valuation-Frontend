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
    return <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{emptyText}</p>
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-sm"
        style={{ minWidth: `${minWidth}px` }}
      >
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100 text-xs uppercase tracking-wide text-slate-700">
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
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/60"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-3 text-slate-700">
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

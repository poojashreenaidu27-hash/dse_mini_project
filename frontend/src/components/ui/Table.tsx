// src/components/ui/Table.tsx
import React from 'react'

type TableProps = {
  /** Header titles */
  columns: string[]
  /** Rows of cells – each row is an array of React nodes */
  rows: React.ReactNode[][]
  /** Optional class for the table element */
  className?: string
}

export const Table: React.FC<TableProps> = ({ columns, rows, className = '' }) => {
  return (
    <table className={`min-w-full border ${className}`}>
      <thead className="bg-gray-200">
        <tr>
          {columns.map((col, i) => (
            <th key={i} className="p-2 border text-left">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="hover:bg-gray-100">
            {row.map((cell, ci) => (
              <td key={ci} className="p-2 border">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table


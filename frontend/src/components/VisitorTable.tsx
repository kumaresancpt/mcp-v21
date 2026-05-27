import { Visitor } from '../hooks/useVisitors'
import { StatusBadge } from './StatusBadge'

interface VisitorTableProps {
  data: Visitor[]
  onSort?: (column: string) => void
  onFilter?: (filters: any) => void
  onPageChange?: (page: number) => void
  onRowClick?: (visitor: Visitor) => void
}

export function VisitorTable({ data, onRowClick }: VisitorTableProps) {
  const columns = ['Name', 'Company', 'Host', 'Purpose', 'Check-in Time', 'Check-out Time', 'Status', 'Badge', 'Action']

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            {columns.map((column) => (
              <th key={column} className="px-2 py-2.5 text-left font-semibold text-xs text-text-secondary">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((visitor) => (
            <tr
              key={visitor.id}
              className="border-b border-border-light hover:bg-bg-primary transition-colors cursor-pointer"
              onClick={() => onRowClick?.(visitor)}
            >
              <td className="px-2 py-2.5 text-xs font-medium">{visitor.name}</td>
              <td className="px-2 py-2.5 text-xs">{visitor.company}</td>
              <td className="px-2 py-2.5 text-xs">{visitor.host}</td>
              <td className="px-2 py-2.5 text-xs">{visitor.purpose}</td>
              <td className="px-2 py-2.5 text-xs">{visitor.checkInTime}</td>
              <td className="px-2 py-2.5 text-xs">{visitor.checkOutTime || '-'}</td>
              <td className="px-2 py-2.5 text-xs">
                <StatusBadge status={visitor.status} />
              </td>
              <td className="px-2 py-2.5 text-xs">{visitor.badge}</td>
              <td className="px-2 py-2.5 text-xs flex gap-2">
                <button title="View" className="hover:text-primary transition-colors">
                  👁️
                </button>
                <button title="Edit" className="hover:text-primary transition-colors">
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

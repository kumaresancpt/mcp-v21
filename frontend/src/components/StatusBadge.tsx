interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Check in':
        return 'bg-status-success text-white'
      case 'Waiting':
      case 'Pending Approval':
        return 'bg-status-warning text-white'
      case 'Checked Out':
        return 'bg-status-info text-white'
      case 'Expired Pass':
        return 'bg-status-error text-white'
      default:
        return 'bg-border-light text-text-primary'
    }
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

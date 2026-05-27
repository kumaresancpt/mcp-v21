import { useState } from 'react'

interface FilterPanelProps {
  onApply: (filters: any) => void
  onClose: () => void
}

export function FilterPanel({ onApply, onClose }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    status: [] as string[],
    host: '',
    company: '',
  })

  const statusOptions = ['Check in', 'Waiting', 'Checked Out', 'Expired Pass', 'Pending Approval']

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }))
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      status: [],
      host: '',
      company: '',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-card p-6 max-w-sm w-full max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        {/* Status Filter */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-text-primary mb-2">Status</label>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusChange(status)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-text-primary">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Host Filter */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-text-primary mb-2">Host</label>
          <input
            type="text"
            value={filters.host}
            onChange={(e) => setFilters((prev) => ({ ...prev, host: e.target.value }))}
            placeholder="Search host..."
            className="input-field w-full"
          />
        </div>

        {/* Company Filter */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-text-primary mb-2">Company</label>
          <input
            type="text"
            value={filters.company}
            onChange={(e) => setFilters((prev) => ({ ...prev, company: e.target.value }))}
            placeholder="Search company..."
            className="input-field w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex-1 btn-secondary">
            Reset
          </button>
          <button onClick={handleApply} className="flex-1 btn-primary">
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

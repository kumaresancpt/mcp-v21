import { useState, useCallback } from 'react'
import { useEmployeeSearch, Employee } from '../hooks/useEmployeeSearch'

interface HostSearchProps {
  onSelect: (employee: Employee) => void
  onDepartmentPopulate?: (department: string) => void
}

export function HostSearch({ onSelect, onDepartmentPopulate }: HostSearchProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const { employees, loading, search } = useEmployeeSearch()

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)

      if (value.length >= 2) {
        search(value)
        setShowResults(true)
      } else {
        setShowResults(false)
      }
    },
    [search],
  )

  const handleSelectEmployee = (employee: Employee) => {
    setQuery(employee.name)
    setShowResults(false)
    onSelect(employee)
    onDepartmentPopulate?.(employee.department)
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search host employee..."
        className="input-field w-full"
      />

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-light rounded-lg shadow-subtle z-10 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-text-secondary text-sm">Loading...</div>
          ) : employees.length > 0 ? (
            <>
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => handleSelectEmployee(employee)}
                  className="w-full text-left px-3 py-2 hover:bg-bg-primary transition-colors border-b border-border-light last:border-b-0"
                >
                  <div className="font-medium text-sm">{employee.name}</div>
                  <div className="text-xs text-text-secondary">
                    {employee.employeeId} • {employee.department}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <>
              <div className="p-3 text-center text-text-secondary text-sm">No employees found</div>
              <button className="w-full text-left px-3 py-2 hover:bg-bg-primary transition-colors text-primary font-medium text-sm">
                Not found? Add manually
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

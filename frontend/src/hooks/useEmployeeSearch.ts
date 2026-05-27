import { useState, useCallback, useEffect } from 'react'

export interface Employee {
  id: string
  name: string
  employeeId: string
  department: string
}

interface UseEmployeeSearchReturn {
  employees: Employee[]
  loading: boolean
  error: string | null
  search: (query: string) => void
}

export function useEmployeeSearch(): UseEmployeeSearchReturn {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setEmployees([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Debounce with a 300ms delay
        const timer = setTimeout(async () => {
          // Read token fresh from localStorage
          const token = localStorage.getItem('accessToken')
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          }

          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const response = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers,
          })

          // Handle 401 - token expired
          if (response.status === 401) {
            // Attempt token refresh
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              try {
                const refreshResponse = await fetch('/api/auth/refresh-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken }),
                })

                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json()
                  localStorage.setItem('accessToken', refreshData.accessToken)

                  // Retry original request with new token
                  const retryHeaders: HeadersInit = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${refreshData.accessToken}`,
                  }

                  const retryResponse = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: retryHeaders,
                  })

                  if (!retryResponse.ok) {
                    throw new Error(await retryResponse.text())
                  }

                  const data = await retryResponse.json()
                  setEmployees(data ?? [])
                  return
                }
              } catch (refreshErr) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
                return
              }
            } else {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              window.location.href = '/login'
              return
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || 'Failed to search employees')
          }

          const data = await response.json()
          setEmployees(data ?? [])
        }, 300)

        return () => clearTimeout(timer)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search employees'
        setError(errorMessage)
        setLoading(false)
      }
    }

    const timer = setTimeout(search, 0)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    if (q.length < 2) {
      setEmployees([])
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [])

  return {
    employees,
    loading,
    error,
    search: handleSearch,
  }
}

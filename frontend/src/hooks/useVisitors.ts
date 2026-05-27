import { useState, useCallback, useEffect } from 'react'

export interface Visitor {
  id: string
  name: string
  company: string
  host: string
  purpose: string
  checkInTime: string
  checkOutTime: string | null
  status: 'Check in' | 'Waiting' | 'Checked Out' | 'Expired Pass' | 'Pending Approval'
  badge: string
}

interface UseVisitorsReturn {
  visitorList: Visitor[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  onSearch: (query: string) => void
  onFilter: (filters: any) => void
  onPageChange: (page: number) => void
}

export function useVisitors(initialPage: number = 1, initialPageSize: number = 10): UseVisitorsReturn {
  const [visitorList, setVisitorList] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [totalCount, setTotalCount] = useState(0)

  // Fetch visitors from backend API
  const fetchVisitors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      if (filters.status) {
        params.append('status', filters.status)
      }

      if (filters.host) {
        params.append('host', filters.host)
      }

      if (filters.company) {
        params.append('company', filters.company)
      }

      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom)
      }

      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo)
      }

      // Read token fresh from localStorage
      const token = localStorage.getItem('accessToken')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/visitors?${params.toString()}`, {
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

              const retryResponse = await fetch(`/api/visitors?${params.toString()}`, {
                method: 'GET',
                headers: retryHeaders,
              })

              if (!retryResponse.ok) {
                throw new Error(await retryResponse.text())
              }

              const data = await retryResponse.json()
              setVisitorList(data.visitorList ?? [])
              setTotalCount(data.totalCount ?? 0)
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
        throw new Error(errorData.detail || 'Failed to fetch visitors')
      }

      const data = await response.json()
      setVisitorList(data.visitorList ?? [])
      setTotalCount(data.totalCount ?? 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch visitors'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, filters])

  // Fetch on mount and when filters/search/pagination change
  useEffect(() => {
    fetchVisitors()
  }, [fetchVisitors])

  const onSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const onFilter = useCallback((newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  return {
    visitorList,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    onSearch,
    onFilter,
    onPageChange,
  }
}

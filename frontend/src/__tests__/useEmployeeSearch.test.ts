import { renderHook, act, waitFor } from '@testing-library/react'
import { useEmployeeSearch } from '../hooks/useEmployeeSearch'

// Mock fetch
global.fetch = jest.fn()

describe('useEmployeeSearch', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
    localStorage.clear()
  })

  it('does not search if query is less than 2 characters', async () => {
    const { result } = renderHook(() => useEmployeeSearch())

    act(() => {
      result.current.search('J')
    })

    await waitFor(() => {
      expect(result.current.employees).toEqual([])
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('searches when query is 2 or more characters', async () => {
    const mockEmployees = [
      { id: 'emp1', name: 'John Smith', employeeId: 'E001', department: 'Engineering' },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployees,
    })

    const { result } = renderHook(() => useEmployeeSearch())

    act(() => {
      result.current.search('Jo')
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('api/employees/search?q=Jo'), expect.any(Object))
    })
  })

  it('returns employees with name, id, and department', async () => {
    const mockEmployees = [
      { id: 'emp1', name: 'John Smith', employeeId: 'E001', department: 'Engineering' },
      { id: 'emp2', name: 'Jane Doe', employeeId: 'E002', department: 'HR' },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmployees,
    })

    const { result } = renderHook(() => useEmployeeSearch())

    act(() => {
      result.current.search('John')
    })

    await waitFor(() => {
      expect(result.current.employees).toEqual(mockEmployees)
    })
  })

  it('debounces search requests', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    })

    const { result } = renderHook(() => useEmployeeSearch())

    act(() => {
      result.current.search('A')
      result.current.search('AB')
      result.current.search('ABC')
    })

    // Wait for debounce (300ms) + fetch time
    await waitFor(() => {
      // Should only be called once after debounce, not 3 times
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  it('handles fetch error and sets error state', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useEmployeeSearch())

    act(() => {
      result.current.search('Jo')
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.loading).toBe(false)
  })
})

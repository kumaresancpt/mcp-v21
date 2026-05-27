import { renderHook, act, waitFor } from '@testing-library/react'
import { useVisitors } from '../hooks/useVisitors'

// Mock fetch
global.fetch = jest.fn()

describe('useVisitors', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
    localStorage.clear()
  })

  it('fetches visitor list on mount', async () => {
    const mockVisitors = [
      { id: '1', name: 'John', company: 'Tech', host: 'Jane', purpose: 'Meeting', checkInTime: '09:00', checkOutTime: '10:00', status: 'Checked Out' as const, badge: 'b1' },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ visitorList: mockVisitors, totalCount: 1 }),
    })

    const { result } = renderHook(() => useVisitors())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/visitors'), expect.any(Object))
  })

  it('calls onSearch with search query', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ visitorList: [], totalCount: 0 }),
    })

    const { result } = renderHook(() => useVisitors())

    act(() => {
      result.current.onSearch('John')
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('search=John'), expect.any(Object))
    })
  })

  it('calls onFilter with filter parameters', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ visitorList: [], totalCount: 0 }),
    })

    const { result } = renderHook(() => useVisitors())

    act(() => {
      result.current.onFilter({ status: 'Check in', host: 'Jane' })
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=Check in'),
        expect.any(Object),
      )
    })
  })

  it('updates current page when onPageChange is called', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ visitorList: [], totalCount: 0 }),
    })

    const { result } = renderHook(() => useVisitors())

    act(() => {
      result.current.onPageChange(2)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('page=2'), expect.any(Object))
    })
  })

  it('handles fetch error and sets error state', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useVisitors())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.loading).toBe(false)
  })
})

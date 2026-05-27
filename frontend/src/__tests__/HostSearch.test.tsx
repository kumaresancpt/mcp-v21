import { render, screen, fireEvent } from '@testing-library/react'
import { HostSearch } from '../components/HostSearch'

// Mock useEmployeeSearch hook
jest.mock('../hooks/useEmployeeSearch', () => ({
  useEmployeeSearch: () => ({
    employees: [
      { id: 'emp1', name: 'John Smith', employeeId: 'E001', department: 'Engineering' },
      { id: 'emp2', name: 'Jane Doe', employeeId: 'E002', department: 'HR' },
    ],
    loading: false,
    error: null,
    search: jest.fn(),
  }),
}))

describe('HostSearch', () => {
  it('renders input field with placeholder "Search host employee..."', () => {
    const mockOnSelect = jest.fn()
    render(<HostSearch onSelect={mockOnSelect} />)
    const input = screen.getByPlaceholderText('Search host employee...')
    expect(input).toBeInTheDocument()
  })

  it('does not show dropdown results initially', () => {
    const mockOnSelect = jest.fn()
    render(<HostSearch onSelect={mockOnSelect} />)
    const dropdown = screen.queryByText('John Smith')
    expect(dropdown).not.toBeInTheDocument()
  })

  it('shows dropdown results when input has 2 or more characters', () => {
    const mockOnSelect = jest.fn()
    render(<HostSearch onSelect={mockOnSelect} />)
    const input = screen.getByPlaceholderText('Search host employee...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Jo' } })
    const result = screen.getByText('John Smith')
    expect(result).toBeInTheDocument()
  })

  it('displays employee results with name, employee ID, and department', () => {
    const mockOnSelect = jest.fn()
    render(<HostSearch onSelect={mockOnSelect} />)
    const input = screen.getByPlaceholderText('Search host employee...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Jo' } })
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText(/E001/)).toBeInTheDocument()
    expect(screen.getByText(/Engineering/)).toBeInTheDocument()
  })

  it('calls onSelect callback when clicking on an employee result', () => {
    const mockOnSelect = jest.fn()
    render(<HostSearch onSelect={mockOnSelect} />)
    const input = screen.getByPlaceholderText('Search host employee...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Jo' } })
    const employeeButton = screen.getByText('John Smith').closest('button')!
    fireEvent.click(employeeButton)
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Smith',
        employeeId: 'E001',
        department: 'Engineering',
      }),
    )
  })
})

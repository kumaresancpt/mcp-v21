import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPanel } from '../components/FilterPanel'

describe('FilterPanel', () => {
  it('renders modal with title "Filters"', () => {
    const mockOnApply = jest.fn()
    const mockOnClose = jest.fn()
    render(<FilterPanel onApply={mockOnApply} onClose={mockOnClose} />)
    const title = screen.getByText('Filters')
    expect(title).toBeInTheDocument()
  })

  it('renders Status filter with 5 checkbox options', () => {
    const mockOnApply = jest.fn()
    const mockOnClose = jest.fn()
    render(<FilterPanel onApply={mockOnApply} onClose={mockOnClose} />)
    const statusOptions = ['Check in', 'Waiting', 'Checked Out', 'Expired Pass', 'Pending Approval']
    statusOptions.forEach((status) => {
      expect(screen.getByLabelText(status)).toBeInTheDocument()
    })
  })

  it('renders Host and Company text input fields', () => {
    const mockOnApply = jest.fn()
    const mockOnClose = jest.fn()
    render(<FilterPanel onApply={mockOnApply} onClose={mockOnClose} />)
    const hostInput = screen.getByPlaceholderText('Search host...')
    const companyInput = screen.getByPlaceholderText('Search company...')
    expect(hostInput).toBeInTheDocument()
    expect(companyInput).toBeInTheDocument()
  })

  it('renders Apply and Reset buttons', () => {
    const mockOnApply = jest.fn()
    const mockOnClose = jest.fn()
    render(<FilterPanel onApply={mockOnApply} onClose={mockOnClose} />)
    const applyButton = screen.getByText('Apply')
    const resetButton = screen.getByText('Reset')
    expect(applyButton).toBeInTheDocument()
    expect(resetButton).toBeInTheDocument()
  })

  it('calls onApply callback when clicking Apply button', () => {
    const mockOnApply = jest.fn()
    const mockOnClose = jest.fn()
    render(<FilterPanel onApply={mockOnApply} onClose={mockOnClose} />)
    const checkInCheckbox = screen.getByLabelText('Check in') as HTMLInputElement
    fireEvent.click(checkInCheckbox)
    const hostInput = screen.getByPlaceholderText('Search host...') as HTMLInputElement
    fireEvent.change(hostInput, { target: { value: 'John' } })
    const applyButton = screen.getByText('Apply')
    fireEvent.click(applyButton)
    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['Check in'],
        host: 'John',
      }),
    )
  })
})

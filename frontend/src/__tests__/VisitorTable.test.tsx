import { render, screen, fireEvent } from '@testing-library/react'
import { VisitorTable } from '../components/VisitorTable'
import { Visitor } from '../hooks/useVisitors'

// Mock StatusBadge component
jest.mock('../components/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid={`badge-${status}`}>{status}</span>,
}))

describe('VisitorTable', () => {
  const mockVisitors: Visitor[] = [
    {
      id: '1',
      name: 'John Doe',
      company: 'TechCorp',
      host: 'Jane Smith',
      purpose: 'Meeting',
      checkInTime: '09:00 AM',
      checkOutTime: '10:00 AM',
      status: 'Checked Out',
      badge: 'badge-001',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'FinanceInc',
      host: 'Bob Wilson',
      purpose: 'Audit',
      checkInTime: '10:30 AM',
      checkOutTime: null,
      status: 'Check in',
      badge: 'badge-002',
    },
  ]

  it('renders table with all 9 column headers', () => {
    render(<VisitorTable data={mockVisitors} />)
    const expectedColumns = ['Name', 'Company', 'Host', 'Purpose', 'Check-in Time', 'Check-out Time', 'Status', 'Badge', 'Action']
    expectedColumns.forEach((column) => {
      expect(screen.getByText(column)).toBeInTheDocument()
    })
  })

  it('renders visitor data in table rows', () => {
    render(<VisitorTable data={mockVisitors} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('TechCorp')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('FinanceInc')).toBeInTheDocument()
  })

  it('renders status badges for each visitor', () => {
    render(<VisitorTable data={mockVisitors} />)
    const badge1 = screen.getByTestId('badge-Checked Out')
    const badge2 = screen.getByTestId('badge-Check in')
    expect(badge1).toBeInTheDocument()
    expect(badge2).toBeInTheDocument()
  })

  it('renders action buttons (eye and pencil icons) for each row', () => {
    render(<VisitorTable data={mockVisitors} />)
    const viewButtons = screen.getAllByTitle('View')
    const editButtons = screen.getAllByTitle('Edit')
    expect(viewButtons).toHaveLength(2)
    expect(editButtons).toHaveLength(2)
  })

  it('calls onRowClick callback when clicking on a row', () => {
    const mockOnRowClick = jest.fn()
    render(<VisitorTable data={mockVisitors} onRowClick={mockOnRowClick} />)
    const firstVisitorName = screen.getByText('John Doe')
    fireEvent.click(firstVisitorName.closest('tr')!)
    expect(mockOnRowClick).toHaveBeenCalledWith(mockVisitors[0])
  })
})

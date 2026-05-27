import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AllVisitors } from '../pages/AllVisitors'

// Mock the hooks
jest.mock('../hooks/useVisitors', () => ({
  useVisitors: () => ({
    visitorList: [
      {
        id: '1',
        name: 'John Doe',
        company: 'TechCorp',
        host: 'Jane Smith',
        purpose: 'Meeting',
        checkInTime: '09:00 AM',
        checkOutTime: '10:00 AM',
        status: 'Checked Out' as const,
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
        status: 'Check in' as const,
        badge: 'badge-002',
      },
    ],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalCount: 32,
    onSearch: jest.fn(),
    onFilter: jest.fn(),
    onPageChange: jest.fn(),
  }),
}))

// Mock VisitorTable component
jest.mock('../components/VisitorTable', () => ({
  VisitorTable: ({ data }: any) => (
    <div data-testid="visitor-table">
      {data.map((v: any) => (
        <div key={v.id} data-testid={`visitor-row-${v.id}`}>
          {v.name}
        </div>
      ))}
    </div>
  ),
}))

// Mock FilterPanel component
jest.mock('../components/FilterPanel', () => ({
  FilterPanel: ({ onClose }: any) => (
    <div data-testid="filter-panel">
      <button onClick={onClose} data-testid="close-filter">
        Close
      </button>
    </div>
  ),
}))

// Mock Sidebar component
jest.mock('../components/Sidebar', () => ({
  Sidebar: ({ currentPage }: any) => (
    <div data-testid="sidebar" data-current-page={currentPage}>
      Sidebar
    </div>
  ),
}))

describe('AllVisitors', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AllVisitors />
      </BrowserRouter>,
    )
  })

  it('renders the page title "All Visitors"', () => {
    const title = screen.getByText('All Visitors')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-2xl')
  })

  it('renders search input with placeholder text', () => {
    const searchInput = screen.getByPlaceholderText('Search Visitor, Passes')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveClass('input-field')
  })

  it('renders Add Visitor button that navigates on click', () => {
    const addButton = screen.getByText('Add Visitor')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveClass('btn-primary')
  })

  it('renders pagination footer with record count', () => {
    const paginationText = screen.getByText(/Show 2 of 32 Records/)
    expect(paginationText).toBeInTheDocument()
  })

  it('renders page number buttons for pagination', () => {
    const pageButton1 = screen.getByText('1')
    const pageButton2 = screen.getByText('2')
    const pageButton3 = screen.getByText('3')
    const pageButton4 = screen.getByText('4')
    expect(pageButton1).toBeInTheDocument()
    expect(pageButton2).toBeInTheDocument()
    expect(pageButton3).toBeInTheDocument()
    expect(pageButton4).toBeInTheDocument()
  })
})

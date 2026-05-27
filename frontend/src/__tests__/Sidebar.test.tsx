import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

describe('Sidebar', () => {
  it('renders logo section with "VISITOR" text', () => {
    render(
      <BrowserRouter>
        <Sidebar currentPage="all-visitors" />
      </BrowserRouter>,
    )
    const logoText = screen.getByText('VISITOR')
    expect(logoText).toBeInTheDocument()
    expect(logoText).toHaveClass('text-xl')
    expect(logoText).toHaveClass('font-bold')
  })

  it('renders all 6 menu items with icons', () => {
    render(
      <BrowserRouter>
        <Sidebar currentPage="all-visitors" />
      </BrowserRouter>,
    )
    const menuItems = ['Dashboard', 'All Visitors', 'Gate Check-In', 'Gate Check-Out', 'Reports', 'Settings']
    menuItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('highlights the active menu item (All Visitors)', () => {
    render(
      <BrowserRouter>
        <Sidebar currentPage="all-visitors" />
      </BrowserRouter>,
    )
    const allVisitorsButton = screen.getByText('All Visitors').closest('button')
    expect(allVisitorsButton).toHaveClass('bg-primary')
    expect(allVisitorsButton).toHaveClass('bg-opacity-10')
    expect(allVisitorsButton).toHaveClass('text-primary')
  })

  it('renders copyright footer text', () => {
    render(
      <BrowserRouter>
        <Sidebar currentPage="all-visitors" />
      </BrowserRouter>,
    )
    const copyrightText = screen.getByText('© 2026 Changepond. All Rights Reserved.')
    expect(copyrightText).toBeInTheDocument()
  })

  it('renders menu items with proper styling and hover states', () => {
    render(
      <BrowserRouter>
        <Sidebar currentPage="all-visitors" />
      </BrowserRouter>,
    )
    const dashboardButton = screen.getByText('Dashboard').closest('button')
    expect(dashboardButton).toHaveClass('w-full')
    expect(dashboardButton).toHaveClass('flex')
    expect(dashboardButton).toHaveClass('items-center')
    expect(dashboardButton).toHaveClass('gap-3')
  })
})

import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../components/StatusBadge'

describe('StatusBadge', () => {
  it('renders "Check in" status with green background color', () => {
    render(<StatusBadge status="Check in" />)
    const badge = screen.getByText('Check in')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-status-success')
    expect(badge).toHaveClass('text-white')
  })

  it('renders "Waiting" status with orange background color', () => {
    render(<StatusBadge status="Waiting" />)
    const badge = screen.getByText('Waiting')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-status-warning')
    expect(badge).toHaveClass('text-white')
  })

  it('renders "Checked Out" status with purple background color', () => {
    render(<StatusBadge status="Checked Out" />)
    const badge = screen.getByText('Checked Out')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-status-info')
    expect(badge).toHaveClass('text-white')
  })

  it('renders "Expired Pass" status with red background color', () => {
    render(<StatusBadge status="Expired Pass" />)
    const badge = screen.getByText('Expired Pass')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-status-error')
    expect(badge).toHaveClass('text-white')
  })

  it('renders "Pending Approval" status with orange background color', () => {
    render(<StatusBadge status="Pending Approval" />)
    const badge = screen.getByText('Pending Approval')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-status-warning')
    expect(badge).toHaveClass('text-white')
  })
})

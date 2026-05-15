import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import LoginPage from '../pages/LoginPage'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders left panel with background image role', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(
      screen.getByRole('img', {
        name: /two professionals shaking hands at a gated building/i,
      })
    ).toBeInTheDocument()
  })

  it('renders right white card panel', () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('renders VISITOR logo text', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText('VISITOR')).toBeInTheDocument()
  })

  it('renders Powered by CHANGEPOND', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Powered by')).toBeInTheDocument()
    expect(screen.getByAltText('CHANGEPOND')).toBeInTheDocument()
  })

  it('renders Admin as default active role tab', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument()
  })

  it('renders Receptionist tab', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Receptionist' })).toBeInTheDocument()
  })

  it('renders Security Guard tab', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Security Guard' })).toBeInTheDocument()
  })
})

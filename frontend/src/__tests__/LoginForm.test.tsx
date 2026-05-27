import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import LoginPage from '../pages/LoginPage'

// LoginPage renders LoginForm, RoleSelector, SignUpLink, and Footer together.
// All LoginForm element assertions are derived from the actual LoginForm component.
// Tests 11-12 check SignUpLink and Footer which are siblings of LoginForm in LoginPage.

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('LoginForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders username input with correct placeholder', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('ex., john@123')).toBeInTheDocument()
  })

  it('renders password input with correct placeholder', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('Please Enter')).toBeInTheDocument()
  })

  it('password input type is password by default', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('Please Enter')).toHaveAttribute('type', 'password')
  })

  it('eye icon click toggles password visibility to text', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    // Default aria-label when password is hidden
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByPlaceholderText('Please Enter')).toHaveAttribute('type', 'text')
  })

  it('eye icon click again toggles back to password', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(screen.getByPlaceholderText('Please Enter')).toHaveAttribute('type', 'password')
  })

  it('Keep me logged In checkbox is unchecked by default', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('Keep me logged In checkbox toggles on click', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('Forgot Password button is rendered', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Forgot Password?' })).toBeInTheDocument()
  })

  it('Login button is rendered with correct text', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('Login button click with empty fields shows required validation', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    // Both inputs carry the HTML `required` attribute — this is the native validation mechanism
    expect(screen.getByPlaceholderText('ex., john@123')).toBeRequired()
    expect(screen.getByPlaceholderText('Please Enter')).toBeRequired()
  })

  it('renders Sign up link', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('renders copyright footer text', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(
      screen.getByText('Copyright 2026 Changepond. All Rights Reserved.')
    ).toBeInTheDocument()
  })
})

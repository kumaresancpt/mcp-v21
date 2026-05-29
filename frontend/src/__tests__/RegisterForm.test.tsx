import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import RegisterForm from '../components/RegisterForm'
import * as authService from '../api/authService'

// Mock the authService.register function
jest.mock('../api/authService', () => ({
  register: jest.fn(),
}))

  // Test Case a: Component renders with all 5 input fields
  it('renders all 5 input fields: name, email, phoneNumber, password, confirmPassword', () => {
    render(<RegisterForm />)

    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter 10-digit phone number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password (min 8 characters)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
  })

  // Test Case b: Component renders submit button
  it('renders submit button with Register text', () => {
    render(<RegisterForm />)
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument()
  })

  // Test Case c: Component renders all form labels
  it('renders all form labels: Name, Email, Phone Number, Password, Confirm Password', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  // Test Case d: Form submission calls authService.register with correct payload
  it('calls authService.register with correct payload on form submission', async () => {
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    mockRegister.mockResolvedValueOnce({
      message: 'Registration successful!',
      userId: 'test-user-id',
    })

    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify authService.register was called with correct payload
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        password: 'Test@1234',
        confirmPassword: 'Test@1234',
      })
    })
  })

  // Test Case e: Email format validation error displays (before submit, client-side)
  it('displays email format validation error when email is invalid', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with invalid email
    await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid-email')
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })
  })

  // Test Case f: Email uniqueness error from API (response.detail) displays on 400
  it('displays email uniqueness error from API response on 400 status', async () => {
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    mockRegister.mockRejectedValueOnce(new Error('Email is already registered'))

    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'existing@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Email is already registered')).toBeInTheDocument()
    })
  })

  // Test Case g: Password mismatch error displays
  it('displays password mismatch error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with mismatched passwords
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Different123')

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  // Test Case h: Password length validation error displays (< 8 chars)
  it('displays password length validation error when password is less than 8 characters', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with short password
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Short1')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Short1')

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  // Test Case i: PhoneNumber validation error displays (invalid format)
  it('displays phone number validation error when phone number format is invalid', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with invalid phone number
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '123')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Phone number must be 10 digits')).toBeInTheDocument()
    })
  })

  // Test Case j: Required field validation error displays (missing field)
  it('displays required field validation error when name is empty', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form but leave name empty
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  // Test Case k: Success message displays on 201 response
  it('displays success message on successful registration (201 response)', async () => {
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    mockRegister.mockResolvedValueOnce({
      message: 'User registered successfully. Please check your email for verification link.',
      userId: 'new-user-id',
    })

    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText(/User registered successfully/)).toBeInTheDocument()
    })
  })

  // Test Case l: Form fields cleared after successful submission
  it('clears form fields after successful registration', async () => {
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    mockRegister.mockResolvedValueOnce({
      message: 'User registered successfully!',
      userId: 'new-user-id',
    })

    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify fields are cleared after success
    await waitFor(() => {
      expect((screen.getByPlaceholderText('Enter your full name') as HTMLInputElement).value).toBe('')
      expect((screen.getByPlaceholderText('Enter your email') as HTMLInputElement).value).toBe('')
      expect((screen.getByPlaceholderText('Enter 10-digit phone number') as HTMLInputElement).value).toBe('')
      expect((screen.getByPlaceholderText('Enter password (min 8 characters)') as HTMLInputElement).value).toBe('')
      expect((screen.getByPlaceholderText('Confirm password') as HTMLInputElement).value).toBe('')
    })
  })

  // Test Case m: Loading spinner shows during API call
  it('shows loading state during API call (button text changes to Registering...)', async () => {
    const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>
    // Use a delayed promise to observe the loading state
    mockRegister.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Success!', userId: 'id' }), 100))
    )

    const user = userEvent.setup()
    render(<RegisterForm />)

    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Enter 10-digit phone number'), '1234567890')
    await user.type(screen.getByPlaceholderText('Enter password (min 8 characters)'), 'Test@1234')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Test@1234')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register/i })
    await user.click(submitButton)

    // Verify loading state (button text changes)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Registering/i })).toBeInTheDocument()
    })

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument()
    })
  })
})

import React, { useState } from 'react'
import { register } from '../api/authService'

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="#8390A2" strokeWidth="1.5" />
    <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#8390A2" strokeWidth="1.5" />
    <path d="M2 6L12 13L22 6" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4H3C2.44772 4 2 4.44772 2 5V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V5C22 4.44772 21.5523 4 21 4H19" stroke="#8390A2" strokeWidth="1.5" />
    <path d="M7 4H17" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21" stroke="#8390A2" strokeWidth="1.5" />
    <path d="M7 3V8H17V3M18 22H6C4.89543 22 4 21.1046 4 20V12C4 10.8954 4.89543 10 6 10H18C19.1046 10 20 10.8954 20 12V20C20 21.1046 19.1046 22 18 22Z" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const EyeOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#8390A2" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" stroke="#8390A2" strokeWidth="1.5" />
  </svg>
)

const EyeClosedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12a18.45 18.45 0 015.06-5.94" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1 1l22 22" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

interface RegisterFormState {
  name: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  isLoading: boolean
  error: string | null
  successMessage: string | null
  fieldErrors: {
    name?: string
    email?: string
    phoneNumber?: string
    password?: string
    confirmPassword?: string
  }
}

const inputContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '400px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  border: '1px solid #B9B9B9',
  borderRadius: '8px',
  paddingLeft: '16px',
  paddingRight: '48px',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  color: '#3B3B3B',
  backgroundColor: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
}

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#DC2626',
  backgroundColor: '#FEF2F2',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  color: '#3B3B3B',
  marginBottom: '6px',
  display: 'block',
}

const errorTextStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '12px',
  color: '#DC2626',
  marginTop: '4px',
  marginLeft: '0px',
}

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
}

const buttonStyle: React.CSSProperties = {
  width: '400px',
  height: '48px',
  backgroundColor: '#5B21B6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '24px',
}

const successMessageStyle: React.CSSProperties = {
  width: '400px',
  padding: '12px 16px',
  backgroundColor: '#DCFCE7',
  border: '1px solid #86EFAC',
  borderRadius: '8px',
  color: '#166534',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  marginBottom: '16px',
  textAlign: 'center',
}

const errorMessageStyle: React.CSSProperties = {
  width: '400px',
  padding: '12px 16px',
  backgroundColor: '#FEE2E2',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  color: '#991B1B',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  marginBottom: '16px',
  textAlign: 'center',
}

const RegisterForm: React.FC = () => {
  const [state, setState] = useState<RegisterFormState>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    error: null,
    successMessage: null,
    fieldErrors: {},
  })

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone number validation (basic: 10 digits)
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: typeof state.fieldErrors = {}

    if (!state.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!state.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(state.email)) {
      errors.email = 'Invalid email format'
    }

    if (!state.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!validatePhoneNumber(state.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits'
    }

    if (!state.password) {
      errors.password = 'Password is required'
    } else if (state.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!state.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required'
    } else if (state.password !== state.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setState((prev) => ({ ...prev, fieldErrors: errors }))
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState((prev) => ({ ...prev, error: null, successMessage: null }))

    // Validate form before API call
    if (!validateForm()) {
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await register({
        name: state.name,
        email: state.email,
        phoneNumber: state.phoneNumber,
        password: state.password,
        confirmPassword: state.confirmPassword,
      })

      // Success
      setState((prev) => ({
        ...prev,
        isLoading: false,
        successMessage: response.message || 'Registration successful!',
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        fieldErrors: {},
      }))
    } catch (error) {
      // API error
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setState((prev) => ({
      ...prev,
      [name]: value,
      fieldErrors: {
        ...prev.fieldErrors,
        [name]: undefined,
      },
    }))
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Success Message */}
      {state.successMessage && (
        <div style={successMessageStyle} role="alert">
          {state.successMessage}
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div style={errorMessageStyle} role="alert">
          {state.error}
        </div>
      )}

      {/* Name Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="name" style={labelStyle}>
          Name
        </label>
        <div style={inputContainerStyle}>
          <input
            id="name"
            name="name"
            type="text"
            value={state.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            style={state.fieldErrors.name ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.name}
            aria-describedby={state.fieldErrors.name ? 'name-error' : undefined}
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <UserIcon />
          </div>
        </div>
        {state.fieldErrors.name && (
          <div id="name-error" style={errorTextStyle}>
            {state.fieldErrors.name}
          </div>
        )}
      </div>

      {/* Email Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="email" style={labelStyle}>
          Email
        </label>
        <div style={inputContainerStyle}>
          <input
            id="email"
            name="email"
            type="email"
            value={state.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            style={state.fieldErrors.email ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.email}
            aria-describedby={state.fieldErrors.email ? 'email-error' : undefined}
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <EmailIcon />
          </div>
        </div>
        {state.fieldErrors.email && (
          <div id="email-error" style={errorTextStyle}>
            {state.fieldErrors.email}
          </div>
        )}
      </div>

      {/* Phone Number Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="phoneNumber" style={labelStyle}>
          Phone Number
        </label>
        <div style={inputContainerStyle}>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={state.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter 10-digit phone number"
            style={state.fieldErrors.phoneNumber ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.phoneNumber}
            aria-describedby={state.fieldErrors.phoneNumber ? 'phone-error' : undefined}
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <PhoneIcon />
          </div>
        </div>
        {state.fieldErrors.phoneNumber && (
          <div id="phone-error" style={errorTextStyle}>
            {state.fieldErrors.phoneNumber}
          </div>
        )}
      </div>

      {/* Password Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="password" style={labelStyle}>
          Password
        </label>
        <div style={inputContainerStyle}>
          <input
            id="password"
            name="password"
            type={state.showPassword ? 'text' : 'password'}
            value={state.password}
            onChange={handleInputChange}
            placeholder="Enter password (min 8 characters)"
            style={state.fieldErrors.password ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.password}
            aria-describedby={state.fieldErrors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            style={iconStyle}
            onClick={() => setState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
            disabled={state.isLoading}
            aria-label={state.showPassword ? 'Hide password' : 'Show password'}
          >
            {state.showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
        {state.fieldErrors.password && (
          <div id="password-error" style={errorTextStyle}>
            {state.fieldErrors.password}
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div style={{ width: '100%' }}>
        <label htmlFor="confirmPassword" style={labelStyle}>
          Confirm Password
        </label>
        <div style={inputContainerStyle}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={state.showConfirmPassword ? 'text' : 'password'}
            value={state.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm password"
            style={state.fieldErrors.confirmPassword ? errorInputStyle : inputStyle}
            disabled={state.isLoading}
            aria-invalid={!!state.fieldErrors.confirmPassword}
            aria-describedby={state.fieldErrors.confirmPassword ? 'confirm-error' : undefined}
          />
          <button
            type="button"
            style={iconStyle}
            onClick={() => setState((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
            disabled={state.isLoading}
            aria-label={state.showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {state.showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
        {state.fieldErrors.confirmPassword && (
          <div id="confirm-error" style={errorTextStyle}>
            {state.fieldErrors.confirmPassword}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        style={{
          ...buttonStyle,
          opacity: state.isLoading ? 0.6 : 1,
          cursor: state.isLoading ? 'not-allowed' : 'pointer',
        }}
        disabled={state.isLoading}
      >
        {state.isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}

export default RegisterForm

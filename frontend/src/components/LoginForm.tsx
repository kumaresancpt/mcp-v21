import React, { useState } from 'react'

type Role = 'Admin' | 'Receptionist' | 'Security Guard'

interface LoginFormProps {
  selectedRole: Role
}

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="#8390A2" strokeWidth="1.5" />
    <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke="#8390A2" strokeWidth="1.5" strokeLinecap="round" />
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
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  color: '#3B3B3B',
  marginBottom: '6px',
  display: 'block',
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

interface LoginFormState {
  username: string
  password: string
  keepMeLoggedIn: boolean
  showPassword: boolean
  isLoading: boolean
  error: string | null
  forgotPasswordMessage: string | null
  forgotPasswordError: string | null
  isForgotPasswordLoading: boolean
}

const LoginForm: React.FC<LoginFormProps> = ({ selectedRole }) => {
  const [state, setState] = useState<LoginFormState>({
    username: '',
    password: '',
    keepMeLoggedIn: false,
    showPassword: false,
    isLoading: false,
    error: null,
    forgotPasswordMessage: null,
    forgotPasswordError: null,
    isForgotPasswordLoading: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: state.username,
          password: state.password,
          role: selectedRole,
          keepMeLoggedIn: state.keepMeLoggedIn,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: (data as { detail?: string }).detail ?? 'Login failed. Please try again.',
        }))
        return
      }
      const data = await response.json() as { redirectUrl?: string; message?: string; role?: string }
      
      // Store the session token in localStorage so ProtectedRoute and API calls can access it
      if (data.message) {
        localStorage.setItem('accessToken', data.message)
      }
      
      // Redirect to dashboard or home
      window.location.href = data.redirectUrl ?? '/'
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }))
    }
  }

  const handleForgotPassword = async () => {
    if (!state.username) {
      setState((prev) => ({
        ...prev,
        forgotPasswordError: 'Please enter your username or email first.',
        forgotPasswordMessage: null,
      }))
      return
    }
    setState((prev) => ({
      ...prev,
      isForgotPasswordLoading: true,
      forgotPasswordError: null,
      forgotPasswordMessage: null,
    }))
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: state.username }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setState((prev) => ({
          ...prev,
          isForgotPasswordLoading: false,
          forgotPasswordError: (data as { detail?: string }).detail ?? 'Failed to send reset email. Please try again.',
        }))
        return
      }
      setState((prev) => ({
        ...prev,
        isForgotPasswordLoading: false,
        forgotPasswordMessage: 'If your account exists, an OTP has been sent to your registered email.',
      }))
    } catch {
      setState((prev) => ({
        ...prev,
        isForgotPasswordLoading: false,
        forgotPasswordError: 'Network error. Please try again.',
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Username */}
      <div>
        <label htmlFor="username" style={labelStyle}>Username</label>
        <div style={inputContainerStyle}>
          <input
            id="username"
            type="text"
            placeholder="ex., john@123"
            value={state.username}
            onChange={(e) => setState((prev) => ({ ...prev, username: e.target.value }))}
            style={inputStyle}
            autoComplete="username"
            required
          />
          <span style={iconStyle} aria-hidden="true">
            <UserIcon />
          </span>
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <div style={inputContainerStyle}>
          <input
            id="password"
            type={state.showPassword ? 'text' : 'password'}
            placeholder="Please Enter"
            value={state.password}
            onChange={(e) => setState((prev) => ({ ...prev, password: e.target.value }))}
            style={inputStyle}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            style={iconStyle}
            onClick={() => setState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
            aria-label={state.showPassword ? 'Hide password' : 'Show password'}
          >
            {state.showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </button>
        </div>
      </div>

      {/* Checkbox Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '400px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={state.keepMeLoggedIn}
            onChange={(e) => setState((prev) => ({ ...prev, keepMeLoggedIn: e.target.checked }))}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '2px',
              accentColor: '#5B21B6',
              cursor: 'pointer',
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: '#3B3B3B',
              letterSpacing: '0.2px',
            }}
          >
            Keep me logged In
          </span>
        </label>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: '#5B21B6',
            textDecoration: 'underline',
            letterSpacing: '0.2px',
            cursor: 'pointer',
          }}
          onClick={handleForgotPassword}
          disabled={state.isForgotPasswordLoading}
        >
          Forgot Password?
        </button>
      </div>

      {/* Error Banner */}
      {state.error && (
        <p
          role="alert"
          style={{
            color: '#DC2626',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
        >
          {state.error}
        </p>
      )}

      {/* Forgot Password Success Banner */}
      {state.forgotPasswordMessage && (
        <p
          role="status"
          style={{
            color: '#15803D',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
        >
          {state.forgotPasswordMessage}
        </p>
      )}

      {/* Forgot Password Error Banner */}
      {state.forgotPasswordError && (
        <p
          role="alert"
          style={{
            color: '#DC2626',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
        >
          {state.forgotPasswordError}
        </p>
      )}

      {/* Login Button */}
      <button
        type="submit"
        disabled={state.isLoading}
        style={{
          width: '400px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: state.isLoading ? '#7C3AED' : '#5B21B6',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: '14px',
          border: 'none',
          cursor: state.isLoading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        {state.isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm

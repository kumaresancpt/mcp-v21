import React from 'react'
import { useNavigate } from 'react-router-dom'

const SignUpLink: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div
      style={{
        width: '400px',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span style={{ fontWeight: 400, fontSize: '16px', color: '#353638' }}>
        Don't have an account?{' '}
      </span>
      <button
        type="button"
        onClick={() => navigate('/register')}
        style={{
          background: 'none',
          border: 'none',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '16px',
          color: '#5B21B6',
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        Sign up
      </button>
    </div>
  )
}

export default SignUpLink

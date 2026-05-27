import React from 'react'
import { useNavigate } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#F9FAFB',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', color: '#5B21B6', marginBottom: '16px' }}>
          Register
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#353638', marginBottom: '24px' }}>
          Registration page coming soon.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: '#5B21B6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default RegisterPage

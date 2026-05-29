import React from 'react'
import { Link } from 'react-router-dom'
import HeroImage from '../components/HeroImage'
import RegisterForm from '../components/RegisterForm'
import Logo from '../components/Logo'

const RegisterPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left Panel — Hero Image */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <HeroImage alt="Two professionals meeting on a building balcony" />
      </div>

      {/* Right Panel — White Card with Registration Form */}
      <div
        style={{
          width: '596px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '56px',
          borderBottomLeftRadius: '56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          zIndex: 1,
          flexShrink: 0,
          overflowY: 'auto',
        }}
      >
        {/* Logo row — left-aligned with consistent indent */}
        <div style={{ flexShrink: 0, padding: 'clamp(40px, 11.6vh, 103px) 0 0 142px' }}>
          <Logo />
        </div>

        {/* Main content — fills remaining height, centres the stack vertically */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            padding: '16px 40px',
          }}
        >
          {/* Register heading + subtitle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.208px',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '33px',
                color: '#5B21B6',
                lineHeight: '41.6px',
                margin: 0,
                letterSpacing: '0.208px',
              }}
            >
              Register
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#747474',
                lineHeight: '17.64px',
                margin: 0,
              }}
            >
              Create your account to get started
            </p>
          </div>

          {/* Registration Form */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <RegisterForm />
          </div>

          {/* Login Link */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              color: '#747474',
              margin: '16px 0 0 0',
              textAlign: 'center',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#5B21B6',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

import React, { useState } from 'react'
import Logo from '../components/Logo'
import RoleSelector from '../components/RoleSelector'
import LoginForm from '../components/LoginForm'
import SignUpLink from '../components/SignUpLink'

type Role = 'Admin' | 'Receptionist' | 'Security Guard'

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('Admin')

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
      {/* Left Panel — Background Photo from Figma node 40:5198 */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        role="img"
        aria-label="Two professionals shaking hands at a gated building"
      >
        <img
          src="https://www.figma.com/api/mcp/asset/0009f241-019a-4ae9-ad5d-31f5b417d6a2"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>

      {/* Right Panel — White Card, flex-column so logo never overlaps content */}
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
        {/* Logo row — left-aligned with Figma-accurate indent */}
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
          {/* "Login" heading + "Welcome to Visitor" subtitle — Figma node 40:5208 */}
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
              Login
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '20px',
                color: '#474A5F',
                margin: 0,
                letterSpacing: '0.208px',
              }}
            >
              Welcome to Visitor
            </p>
          </div>

          {/* Role selector pill */}
          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

          {/* Login form fields */}
          <LoginForm selectedRole={selectedRole} />

          {/* Sign-up link */}
          <SignUpLink />
        </div>

        {/* Copyright footer — pinned to bottom of flex column */}
        <div style={{ flexShrink: 0, textAlign: 'center', padding: '0 40px 41px' }}>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: '#292D32',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Copyright 2026 Changepond. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

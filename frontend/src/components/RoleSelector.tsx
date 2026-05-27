import React from 'react'

type Role = 'Admin' | 'Receptionist' | 'Security Guard'

interface RoleSelectorProps {
  selectedRole: Role
  onRoleChange: (role: Role) => void
}

const roles: Role[] = ['Admin', 'Receptionist', 'Security Guard']

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        width: '400px',
        height: '48px',
        backgroundColor: '#F3F3F3',
        borderRadius: '48px',
        padding: '4px',
        gap: '2px',
      }}
    >
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onRoleChange(role)}
          style={{
            flex: 1,
            height: '100%',
            borderRadius: '44px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: selectedRole === role ? 600 : 400,
            fontSize: '14px',
            color: selectedRole === role ? '#ffffff' : '#3C3C3C',
            backgroundColor: selectedRole === role ? '#5B21B6' : 'transparent',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {role}
        </button>
      ))}
    </div>
  )
}

export default RoleSelector

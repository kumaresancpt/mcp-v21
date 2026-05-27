import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  currentPage?: string
}

export function Sidebar({ currentPage = 'all-visitors' }: SidebarProps) {
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { id: 'all-visitors', label: 'All Visitors', path: '/visitors', icon: '👥' },
    { id: 'gate-checkin', label: 'Gate Check-In', path: '/gate-checkin', icon: '🚪' },
    { id: 'gate-checkout', label: 'Gate Check-Out', path: '/gate-checkout', icon: '🚪' },
    { id: 'reports', label: 'Reports', path: '/reports', icon: '📋' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  return (
    <aside className="w-72 bg-white border-r border-border-light flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-border-light">
        <h1 className="text-xl font-bold text-primary">VISITOR</h1>
        <p className="text-xs text-text-secondary mt-1">Powered by CHANGEPOND</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-primary bg-opacity-10 text-primary font-semibold'
                : 'text-text-primary hover:bg-bg-primary'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-light text-center">
        <p className="text-xs text-text-secondary">
          © 2026 Changepond. All Rights Reserved.
        </p>
      </div>
    </aside>
  )
}

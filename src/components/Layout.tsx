import { Link, useLocation } from 'react-router-dom'

const nav = [
  { path: '/', label: 'Dashboard', icon: '◉' },
  { path: '/staff', label: 'Staff', icon: '◎' },
  { path: '/attendance', label: 'Attendance', icon: '✓' },
  { path: '/reports', label: 'Reports', icon: '▤' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">◈</span>
          <span className="sidebar-title">Attendance</span>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="header">
          <h1 className="header-title">Office Attendance System</h1>
          <div className="header-meta">
            <span className="header-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  )
}

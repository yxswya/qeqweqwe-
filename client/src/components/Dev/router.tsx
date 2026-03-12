import type * as React from 'react'
import { Link } from 'react-router'

const DevRouter: React.FC = () => {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/app/dashboard">Home</Link>
        <Link to="/app/dashboard/KQgfO8wf_m9gcfI9ZWjGy">
          Dashboard(需登录)
        </Link>
        <Link to="/app/settings">Settings(需登录)</Link>
        <Link to="/login">Login</Link>
      </nav>
    </div>
  )
}

export default DevRouter

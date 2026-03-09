import type * as React from 'react'
import { Link } from 'react-router'

const DevRouter: React.FC = () => {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/app/dashboard/c49c9c54-deac-435a-8422-4b6920bf336c">
          Dashboard(需登录)
        </Link>
        <Link to="/app/settings">Settings(需登录)</Link>
        <Link to="/login">Login</Link>
      </nav>
    </div>
  )
}

export default DevRouter

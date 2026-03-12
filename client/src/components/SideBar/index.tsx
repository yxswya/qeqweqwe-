import { NavLink } from 'react-router'

const SideBar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`

  return (
    <div className="w-68 bg-white flex flex-col shrink-0 p-4">
      <ul>
        <li>
          <NavLink to="/app/dashboard" className={linkClass}>
            会话
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/settings" className={linkClass}>
            设置
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/rag-answer" className={linkClass}>
            RAG构建产物问答
          </NavLink>
        </li>
      </ul>
    </div>
  )
}

export default SideBar

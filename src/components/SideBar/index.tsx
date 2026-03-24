import { NavLink } from 'react-router'

const SideBar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`

  return (
    <div className="w-68 bg-white flex flex-col shrink-0 p-4 border-r border-slate-200">
      <ul>
        <li>
          <NavLink to="/app/dashboard" className={linkClass}>
            会话
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/models" className={linkClass}>
            模型列表
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/rags" className={linkClass}>
            RAG 知识库
          </NavLink>
        </li>
      </ul>
    </div>
  )
}

export default SideBar

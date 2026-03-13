import { Outlet } from 'react-router'

import { authApi } from '@/api'
import { requireAuth } from '@/auth'
import SideBar from '@/components/SideBar'
import TopBar from '@/components/TopBar'

// 受保护 loader：验证 token + 获取用户信息
export async function appLoader({ request }: { request: Request }) {
  requireAuth(request) // 未登录会 redirect

  // 获取用户信息（每次进入 /app 时）
  const user = (await authApi.getCurrentUser()).data

  return { user }
}

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden h-full">
        <SideBar />
        <div className="w-0 flex-1 h-full relative bg-[#e8edfd]">
          <img src="/会话组件-背景图片.svg" className="w-full h-full absolute top-0 left-0 pointer-events-none object-cover" alt="background" />
          <div className="w-full h-full relative z-2"><Outlet /></div>
        </div>
      </div>
    </div>
  )
}

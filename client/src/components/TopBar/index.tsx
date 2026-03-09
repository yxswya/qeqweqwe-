import type { UserInfo } from '@/api'
import {
  Bell,
  ChevronDown,
  Code,
  InfinityIcon,
  LayoutGrid,
  LogOut,
  Settings,
  Shield,
  User,
} from 'lucide-react'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Form, Link, useRouteLoaderData } from 'react-router'

import DevRouter from '@/components/Dev/router'
import { env } from '@/config/env'

// loader 返回类型
export interface AppLoaderData {
  user: UserInfo
}

const TopBar: React.FC = () => {
  // 读取 /app 路由的 loader 返回数据（需给路由配 id）
  const data = useRouteLoaderData('app') as AppLoaderData
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current
        && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div
      className="w-full h-15 bg-white flex items-center justify-between px-[26.67px] relative"
      style={{ boxShadow: '2.67px 2.67px 10.67px rgba(82, 90, 102, 0.08)' }}
    >
      <div className="flex items-center shrink-0 gap-1">
        <InfinityIcon color="#334bf8" size={38} />
        <img
          src="/AI要素聚合平台.svg"
          className="h-full object-contain"
          alt="AI要素聚合平台"
        />
      </div>
      {env.isDev && (
        <DevRouter />
      )}

      <div className="flex gap-3 items-center h-full">
        {/* 用户菜单触发器 */}
        <div className="relative h-full" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3 h-full hover:bg-gray-50 transition-colors duration-200"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="avatar"
              className="w-8 h-8 rounded object-cover"
            />
            <span className="text-sm font-medium text-gray-700">
              {data.user.username}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Premium 风格用户面板 */}
          <style>
            {`
            @keyframes panelSlideIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .panel-animate { animation: panelSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          `}
          </style>

          {isDropdownOpen && (
            <div className="panel-animate absolute z-50 right-0 top-full mt-2.5 w-96 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.12)] overflow-hidden">
              {/* 渐变 Banner 头部 - 包含头像和信息 */}
              <div className="relative h-auto">
                <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-indigo-900 to-slate-800"></div>
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-40"></div>
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500 rounded-full mix-blend-screen filter blur-2xl opacity-40"></div>
                {/* 用户信息行 */}
                <div className="relative z-10 flex items-center gap-4 p-5">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="avatar"
                    className="w-16 h-16 rounded-xl object-cover border-3 border-white/30 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate">
                      {data.user.username}
                    </h3>
                    <p className="text-xs text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-purple-300 font-semibold mt-0.5">
                      {data.user.role}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {data.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="bg-white px-5 pb-4">
                <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100">
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-800">142</div>
                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      任务
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-800">4.9</div>
                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      评级
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-800">12</div>
                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      项目
                    </div>
                  </div>
                </div>
              </div>

              {/* 主菜单项 */}
              <div className="bg-white px-3 pb-2 space-y-0.5">
                <Link
                  to="/app/user-profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium">个人中心</span>
                </Link>

                <Link
                  to="/app/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <Settings size={16} />
                  </div>
                  <span className="text-sm font-medium">系统设置</span>
                </Link>

                {/* 快捷入口 */}
                <div className="flex justify-around mt-2 pt-2 border-t border-slate-100">
                  {[
                    { icon: Bell, label: '通知', to: '/app/notifications', color: 'bg-indigo-50 text-indigo-500 hover:bg-indigo-500' },
                    { icon: Shield, label: '安全', to: '/app/security', color: 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500' },
                    { icon: Code, label: '开发者', to: '/app/developer', color: 'bg-purple-50 text-purple-500 hover:bg-purple-500' },
                    { icon: LayoutGrid, label: '更多', to: '/app/more', color: 'bg-slate-100 text-slate-500 hover:bg-slate-600' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-200 group"
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center transition-all`}>
                        <item.icon size={16} className="group-hover:text-white" />
                      </div>
                      <span className="text-[12px] font-medium text-slate-500">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 底部退出登录 */}
              <div className="bg-white px-3 pb-3">
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-medium"
                  >
                    <LogOut size={16} />
                    <span>退出登录</span>
                  </button>
                </Form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopBar

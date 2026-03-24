import * as React from 'react'
import { Link } from 'react-router'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 背景装饰 */}
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.025] pointer-events-none -z-10 bg-black -top-[150px] -right-[100px]" />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.025] pointer-events-none -z-10 bg-black -bottom-[200px] -left-[150px]" />

      {/* 导航栏 */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-6
          bg-white/80 backdrop-blur-xl border-b border-gray-100"
      >
        <Link to="/" className="flex items-center gap-2.5 text-base font-semibold tracking-[-0.02em] no-underline text-black">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          AI 要素聚合
        </Link>
        <div className="flex gap-7">
          <Link to="#" className="text-[0.85rem] text-gray-500 no-underline transition-colors hover:text-black">
            探索
          </Link>
          <Link to="#" className="text-[0.85rem] text-gray-500 no-underline transition-colors hover:text-black">
            文档
          </Link>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-1 flex items-center justify-center pt-[120px] pb-20 px-6">
        <div className="w-full max-w-[400px] [perspective:1200px]">
          {children}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="text-center py-7 text-[0.76rem] text-gray-400">
        AI 要素聚合 — Aggregate Intelligence, Amplify Possibility.
      </footer>
    </div>
  )
}

export default AuthLayout

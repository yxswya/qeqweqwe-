import type { UserInfo } from '@/api'
import * as React from 'react'
import { useState } from 'react'
import { useRouteLoaderData } from 'react-router'

interface UserData {
  realName: string
  nickname: string
  role: string
  email: string
  phone: string
  department: string
  joinDate: string
  bio: string
  avatarUrl: string
}

// loader 返回类型
export interface AppLoaderData {
  user: UserInfo
}

export default function UserProfilePremium() {
  // 读取 /app 路由的 loader 返回数据（需给路由配 id）
  const data = useRouteLoaderData('app') as AppLoaderData
  console.log(data)

  const [activeTab, setActiveTab] = useState<
    'basic' | 'security' | 'preferences'
  >('basic')

  const [formData, setFormData] = useState<UserData>({
    realName: data.user.username.toUpperCase(),
    nickname: data.user.username, // 'Alex'
    role: '高级架构师 / Tech Lead' + `- [${data.user.role}]`,
    email: data.user.email, // 'alex.zhang@enterprise.com'
    phone: '+86 138 0000 8888',
    department: '核心研发部 (Core R&D)',
    joinDate: '2021-08-12',
    bio: '专注于构建高可用性、可扩展的企业级 SaaS 平台。对用户体验与微服务架构有着极致的追求。',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Saved:', formData)
    alert('资料已安全更新')
  }

  return (
    <div className="w-full min-h-screen pb-12 font-sans bg-transparent pt-10">
      {/* 注入丝滑的高端过渡动画 */}
      <style>
        {`
        @keyframes premiumFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tab-content-active {
          animation: premiumFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}
      </style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 高端 Banner 区域 */}
        <div className="relative w-full h-64 rounded-4xl overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-indigo-900 to-slate-800"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
        </div>

        {/* 核心布局区 */}
        <div className="relative -mt-24 grid grid-cols-12 gap-8">
          {/* 左侧：个人资料悬浮卡片 */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 flex flex-col items-center text-center relative z-10 h-fit">
              <div className="relative -mt-20 mb-4 group cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-4xl transform rotate-6 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <img
                  src={formData.avatarUrl}
                  alt="avatar"
                  className="relative w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl transition-transform duration-500 group-hover:scale-100"
                />
                <button className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 shadow-lg transition-colors z-20">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {formData.realName}
              </h2>
              <p className="text-sm font-medium text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-600 mt-1">
                {formData.role}
              </p>

              <div className="w-full grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
                <div>
                  <div className="text-2xl font-bold text-slate-800">142</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    任务
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">4.9</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    评级
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">12</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    项目
                  </div>
                </div>
              </div>

              <div className="w-full mt-8 space-y-5 text-left text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="truncate">{formData.email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span>{formData.phone}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <span>{formData.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================== */}
          {/* 右侧：操作区与表单             */}
          {/* ============================== */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 z-10">
            {/* iOS 风格分段控制器 (Tabs) */}
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl inline-flex space-x-1 shadow-sm border border-slate-100 self-start">
              {(['basic', 'security', 'preferences'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ease-out ${
                    activeTab === tab
                      ? 'text-slate-900 bg-white shadow-sm ring-1 ring-slate-900/5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'basic' && '基本资料'}
                  {tab === 'security' && '账户安全'}
                  {tab === 'preferences' && '偏好设置'}
                </button>
              ))}
            </div>

            {/* 表单面板 */}
            {/* 添加了 min-h-[780px] (移动端) 和 md:min-h-[620px] (PC端) 锁定高度，不再跳动 */}
            <div className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 min-h-195 md:min-h-155 flex flex-col">
              {activeTab === 'basic' && (
                <div className="tab-content-active flex-1 flex flex-col">
                  <div className="mb-8 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        更新基本资料
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        管理您在企业内部显示的个人信息。
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="flex-1 flex flex-col"
                  >
                    <div className="space-y-6 pb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            系统真实姓名
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.realName}
                              readOnly
                              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 font-medium focus:outline-none cursor-not-allowed"
                            />
                            <svg
                              className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            内部花名 / 昵称
                          </label>
                          <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-800 font-medium shadow-sm hover:border-slate-300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            联系邮箱
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-800 font-medium shadow-sm hover:border-slate-300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            移动电话
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-800 font-medium shadow-sm hover:border-slate-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          个人简介 / 个性签名
                        </label>
                        <textarea
                          rows={4}
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 resize-none text-slate-800 font-medium shadow-sm hover:border-slate-300 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* 高端按钮组 - 添加了 mt-auto 使其固定在底部 */}
                    <div className="pt-6 mt-auto border-t border-slate-100 flex justify-end gap-4">
                      <button
                        type="button"
                        className="px-6 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                      >
                        放弃更改
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
                      >
                        保存并应用
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 空状态设计 - 添加了 flex-1 让其填满整个高度并完美居中 */}
              {activeTab === 'security' && (
                <div className="tab-content-active flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">
                    安全防护中
                  </h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    您的账号目前受企业级双重认证保护。如需修改密码或密保问题，请前往企业安全中心。
                  </p>
                  <button className="mt-6 px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">
                    前往安全中心
                  </button>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="tab-content-active flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-10 h-10 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      >
                      </path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      >
                      </path>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">偏好设置</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    在这里您可以自定义系统的外观、通知偏好与语言时区设置。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

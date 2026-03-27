import type { LoginParams, RegisterParams } from '@/api'
import { ArrowRight, Layers, Lock, Mail, Sparkles, User } from 'lucide-react'
import * as React from 'react'
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from 'react-router'
import { authApi } from '@/api'
import {
  AuthButton,
  AuthHeader,
  AuthLayout,
  FormInput,
  LoadingOverlay,
  PasswordStrength,
} from '@/components/Auth'
import { isAuthenticated, safeRedirect, setToken } from '../auth'

// 从 @/api 导出的 authApi
const { login, register } = authApi

// 类型别名，用于 action 函数
type ActionData = { error?: string, intent?: string }

// 已登录访问 /login：直接跳走
export function loader({ request }: { request: Request }) {
  if (isAuthenticated()) {
    const url = new URL(request.url)
    const redirectTo = safeRedirect(url.searchParams.get('redirectTo'))
    throw redirect(redirectTo)
  }
  return null
}

// 提交登录表单：设置 token -> redirect 回去
export async function action({ request }: { request: Request }) {
  const formData = await request.formData()
  const intent = formData.get('intent')
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirectTo') || '/app/dashboard'

  // 注册逻辑
  if (intent === 'register') {
    const username = String(formData.get('reg_username') || '').trim()
    const email = String(formData.get('reg_email') || '').trim()
    const password = String(formData.get('reg_password') || '').trim()

    if (!username || !email || !password) {
      return { error: '请填写所有必填项', intent: 'register' }
    }

    if (password.length < 6) {
      return { error: '密码至少需要 6 位字符', intent: 'register' }
    }

    try {
      const params: RegisterParams = { username, password, email }
      const result = await authApi.register(params)
      setToken(result.token)
      // 存储用户信息到 localStorage
      localStorage.setItem('user_info', JSON.stringify({
        username: result.user.username,
        email: result.user.email,
        role: '普通用户',
      }))
      return redirect(redirectTo)
    }
    catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }, message?: string }
      const message = axiosErr.response?.data?.message || axiosErr.message || '注册失败，请重试'
      return { error: message, intent: 'register' }
    }
  }

  // 登录逻辑
  const params: LoginParams = {
    username: String(formData.get('username') || '').trim(),
    password: String(formData.get('password') || '').trim(),
  }

  if (!params.username || !params.password) {
    return { error: '请输入用户名和密码', intent: 'login' }
  }

  try {
    const result = await authApi.login(params)
    setToken(result.token)
    // 存储用户信息到 localStorage
    localStorage.setItem('user_info', JSON.stringify({
      username: result.user.username,
      email: result.user.email,
      role: '普通用户',
    }))
    return redirect(redirectTo)
  }
  catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } }, message?: string }
    const message = axiosErr.response?.data?.message || axiosErr.message || '登录失败，请重试'
    return { error: message, intent: 'login' }
  }
}

export default function LoginPage() {
  const [sp] = useSearchParams()
  const redirectTo = sp.get('redirectTo') ?? '/app/dashboard'

  const actionData = useActionData() as { error?: string, intent?: string } | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [regPassword, setRegPassword] = React.useState('')

  // 切换模式
  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
  }

  // 面板切换动画样式
  const panelBase = 'w-full transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]'
  const loginPanelClass = `${panelBase} ${
    mode === 'login'
      ? 'opacity-100 translate-x-0 rotate-y-0'
      : 'absolute top-0 left-0 opacity-0 -translate-x-full -rotate-y-[15deg] pointer-events-none'
  }`
  const registerPanelClass = `${panelBase} ${
    mode === 'register'
      ? 'opacity-100 translate-x-0 rotate-y-0'
      : 'absolute top-0 left-0 opacity-0 translate-x-full rotate-y-[15deg] pointer-events-none'
  }`

  return (
    <>
      {/* 登录加载动画 */}
      <LoadingOverlay
        visible={isSubmitting && mode === 'login'}
        text="正在登录..."
      />
      <LoadingOverlay
        visible={isSubmitting && mode === 'register'}
        text="正在创建账户..."
      />

      <AuthLayout>
        <div className="relative transform-3d">
          {/* 登录面板 */}
          <div className={loginPanelClass}>
            <AuthHeader
              icon={Layers}
              title="欢迎回来"
              subtitle="登录 AI 要素聚合，继续你的探索"
            />

            {actionData?.error && actionData.intent !== 'register' && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {actionData.error}
              </div>
            )}

            <Form method="post" autoComplete="off">
              <input type="hidden" name="intent" value="login" />

              <FormInput
                label="用户名"
                name="username"
                placeholder="请输入用户名"
                icon={User}
                defaultValue="yxswy"
              />

              <FormInput
                label="密码"
                name="password"
                type="password"
                placeholder="请输入密码"
                icon={Lock}
                defaultValue="18267094443"
              />

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 text-[0.8rem] text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  保持登录
                </label>
                <a
                  href="#"
                  className="text-[0.8rem] text-gray-500 no-underline transition-colors hover:text-black"
                >
                  忘记密码
                </a>
              </div>

              <AuthButton
                icon={ArrowRight}
                text="登录"
                loading={isSubmitting && mode === 'login'}
                loadingText="登录中..."
              />
            </Form>

            <div className="flex items-center gap-3.5 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[0.75rem] text-gray-400 uppercase tracking-wider">或</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-[0.84rem] text-gray-500 mt-7">
              还没有账户?
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="bg-none border-none text-black font-semibold text-[0.84rem] cursor-pointer ml-1 relative py-0.5
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1.5px] after:bg-black
                  after:scale-x-0 after:origin-right after:transition-transform after:duration-400
                  hover:after:scale-x-100 hover:after:origin-left"
              >
                立即注册
              </button>
            </p>
          </div>

          {/* 注册面板 */}
          <div className={registerPanelClass}>
            <AuthHeader
              icon={Sparkles}
              title="创建账户"
              subtitle="加入 AI 要素聚合，开启智能新纪元"
            />

            {actionData?.error && actionData.intent === 'register' && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {actionData.error}
              </div>
            )}

            <Form method="post" autoComplete="off">
              <input type="hidden" name="intent" value="register" />

              <FormInput
                label="用户名"
                name="reg_username"
                placeholder="你的名字"
                icon={User}
              />

              <FormInput
                label="邮箱地址"
                name="reg_email"
                type="email"
                placeholder="your@email.com"
                icon={Mail}
              />

              <div className="mb-4">
                <FormInput
                  label="设置密码"
                  name="reg_password"
                  type="password"
                  placeholder="至少 8 位字符"
                  icon={Lock}
                  onInput={setRegPassword}
                />
                <PasswordStrength password={regPassword} />
              </div>

              <div className="flex items-center mb-6">
                <label className="flex items-center gap-2 text-[0.8rem] text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree"
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  同意服务条款与隐私政策
                </label>
              </div>

              <AuthButton
                icon={Sparkles}
                text="创建账户"
                loading={isSubmitting && mode === 'register'}
                loadingText="创建中..."
              />
            </Form>

            <div className="flex items-center gap-3.5 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[0.75rem] text-gray-400 uppercase tracking-wider">或</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-[0.84rem] text-gray-500 mt-7">
              已有账户?
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="bg-none border-none text-black font-semibold text-[0.84rem] cursor-pointer ml-1 relative py-0.5
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1.5px] after:bg-black
                  after:scale-x-0 after:origin-right after:transition-transform after:duration-400
                  hover:after:scale-x-100 hover:after:origin-left"
              >
                返回登录
              </button>
            </p>

            <p className="text-center mt-5 text-[0.75rem] text-gray-400 leading-relaxed">
              创建账户即表示你同意我们的
              {' '}
              <a href="#" className="text-gray-500 hover:text-black transition-colors">服务条款</a>
              {' '}
              和
              {' '}
              <a href="#" className="text-gray-500 hover:text-black transition-colors">隐私政策</a>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          登录后将跳转到：
          <code className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs">{redirectTo}</code>
        </p>
      </AuthLayout>
    </>
  )
}

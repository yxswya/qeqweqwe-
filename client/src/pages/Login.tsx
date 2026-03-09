import type { LoginParams } from '@/api'
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from 'react-router'
import { authApi } from '@/api'
import { isAuthenticated, safeRedirect, setTokens } from '../auth'

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
  const params: LoginParams = {
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || '').trim(),
  }

  if (!params.email || !params.password) {
    return { error: '请输入用户名和密码' }
  }

  try {
    // ======== 调用登录 API ========
    const result = await authApi.login(params)
    console.log('登录成功', result)

    // 存 token
    setTokens(result.data.access_token || '', result.data.refresh_token || '')
  }
  catch (err: unknown) {
    // 处理错误
    const message = (err as { message: string })?.message || '登录失败，请重试'

    return { error: message }
  }
}

export default function LoginPage() {
  const [sp] = useSearchParams()
  const redirectTo = sp.get('redirectTo') ?? '/app/dashboard'

  // 获取 action 返回的错误
  const actionData = useActionData() as { error?: string } | undefined

  // 获取提交状态
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  return (
    <div>
      <h2>Login</h2>

      {actionData?.error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{actionData.error}</div>
      )}
      <Form method="post" style={{ display: 'grid', gap: 8, maxWidth: 240 }}>
        <input
          name="email"
          defaultValue="demander@example.com"
          placeholder="email"
        />
        <input
          name="password"
          defaultValue="Demander123!"
          placeholder="password"
          type="password"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </Form>

      <p style={{ marginTop: 12, color: '#666' }}>
        登录后将跳转到：
        <code>{redirectTo}</code>
      </p>
    </div>
  )
}

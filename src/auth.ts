import { redirect } from 'react-router'

const ACCESS_TOKEN_KEY = 'access_token'

// 获取 access_token
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

// 存储 Token（登录时调用）
export function setToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

// 清除 Token 和用户信息
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem('user_info')
}

// 获取用户信息
export function getUserInfo(): { username: string, email?: string | null, role?: string } | null {
  const userInfo = localStorage.getItem('user_info')
  if (userInfo) {
    try {
      return JSON.parse(userInfo)
    }
    catch {
      return null
    }
  }
  return null
}

export function isAuthenticated() {
  return !!getAccessToken()
}

// 防止 open redirect（只允许站内路径）
export function safeRedirect(to: string | null | undefined, defaultTo = '/app/dashboard') {
  if (!to)
    return defaultTo
  if (!to.startsWith('/') || to.startsWith('//'))
    return defaultTo
  return to
}

// 未登录时，跳到 /login?redirectTo=xxx
export function redirectToLogin(request: Request) {
  const url = new URL(request.url)
  const redirectTo = url.pathname + url.search // 保留 query
  const params = new URLSearchParams()
  params.set('redirectTo', redirectTo)

  throw redirect(`/login?${params.toString()}`)
}

// 受保护 loader：未登录直接 redirect
export function requireAuth(request: Request) {
  const token = getAccessToken()
  if (!token)
    redirectToLogin(request)
  return { token }
}

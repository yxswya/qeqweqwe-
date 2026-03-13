import { redirect } from 'react-router'
import { authApi } from './api'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// 获取 access_token
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

// 获取 refresh_token
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// 存储 Token（登录时调用）
export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

// 清除所有 Token
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// 刷新 Token（用于拦截器）
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken)
    throw new Error('No refresh token')

  try {
    const data = await authApi.refreshToken({ refresh_token: refreshToken })
    setTokens(data.data.access_token, data.data.refresh_token || refreshToken)
    return data.data.access_token
  }
  catch (err) {
    clearTokens()
    throw err
  }
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

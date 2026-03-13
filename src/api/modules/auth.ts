import { http } from '@/api'

export interface Success<T> {
  code: number
  data: T
  message: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface LoginResult {
  access_token: string
  expires_in: number
  refresh_token: string
  token_type: string
}

export interface UserInfo {
  username: string
  email: string
  phone: null
  role: string
  id: string
  avatar_url: null
  bio: null
  status: 'active'
  is_verified: true
  created_at: string
  updated_at: string
}

export interface RefreshTokenParams {
  refresh_token: string
}

export interface RefreshTokenResult {
  access_token: string
  refresh_token?: string // 有些后端会返回新 refresh_token
}

export const authApi = {
  // 登录
  login: (params: LoginParams) =>
    http.post<Success<LoginResult>>('/auth/login', params),

  // 退出登录（可选：通知后端销毁 session）
  logout: () =>
    http.post<void>('/auth/logout'),

  // 获取当前用户信息
  getCurrentUser: () =>
    http.get<Success<UserInfo>>('/auth/me'),

  // 刷新 token（如果后端支持）
  refreshToken: (params: RefreshTokenParams) =>
    http.post<Success<RefreshTokenResult>>('/auth/refresh', params),
}

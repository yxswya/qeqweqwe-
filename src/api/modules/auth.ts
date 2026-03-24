import { http } from '@/api'

export interface Success<T> {
  code: number
  data: T
  message: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
}

export interface LoginResult {
  access_token: string
  refresh_token: string
  username: string
  token_type: string
}

export interface UserInfo {
  id: string
  username: string
  email: null | string
  avatarUrl: null | string
  createdAt: string
}

export interface RefreshTokenParams {
  refresh_token: string
}

export interface RefreshTokenResult {
  access_token: string
  refresh_token?: string
}

export const authApi = {
  login: (params: LoginParams) =>
    http.post<Success<LoginResult>>('/auth/login', params),

  register: (params: RegisterParams) =>
    http.post<Success<LoginResult>>('/auth/register', params),

  getCurrentUser: () =>
    http.get<Success<UserInfo>>('/auth/me'),

  refreshToken: (params: RefreshTokenParams) =>
    http.post<Success<RefreshTokenResult>>('/auth/refresh', params),
}

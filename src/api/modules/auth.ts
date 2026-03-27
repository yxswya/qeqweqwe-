import { server } from '@/api/modules/session'

// 后端返回的用户信息
export interface User {
  id: string
  username: string
  email: string | null
}

// 后端返回的登录/注册响应
export interface AuthResponse {
  token: string
  user: User
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  email?: string
}

export const authApi = {
  // 登录 - 后端 POST /auth/sign-in
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await server.api.v1.auth['sign-in'].post(params)
    return response.data as AuthResponse
  },

  // 注册 - 后端 POST /auth/sign-up
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const response = await server.api.v1.auth['sign-up'].post(params)
    return response.data as AuthResponse
  },

  // 登出 - 后端 POST /auth/sign-out
  signOut: async (): Promise<void> => {
    await server.api.v1.auth['sign-out'].post()
  },
}

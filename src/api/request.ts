import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import { clearTokens, getAccessToken } from '@/auth'
import { env } from '@/config/env'

// ========== 创建 Axios 实例 ==========
export const request = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ========== 请求拦截器：自动携带 Token ==========
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()

    if (token && config.headers) {
      // 常见格式：Bearer token
      config.headers.Authorization = `Bearer ${token}`
    }

    // 如果 data 是 FormData，删除默认的 Content-Type，让 Axios 自动设置 multipart/form-data
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// ========== 响应拦截器：统一处理错误 ==========
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<{ message?: string }>) => {
    const { response, config } = error

    // 打印错误
    console.error(`%c[Error] ${config?.url}`, 'color: red;font-weight: bold;', response?.status, response?.data)

    // ========== 401 未授权：清 token + 跳登录 ==========
    if (response?.status === 401) {
      // 如果已经在登录页，不要再次跳转
      if (window.location.pathname === '/login') {
        return Promise.reject(error)
      }

      clearTokens()

      // 获取当前路径，登录后跳回（排除登录页本身和错误页面）
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && !currentPath.startsWith('/40') && !currentPath.startsWith('/50')) {
        const redirectTo = currentPath + window.location.search
        const params = new URLSearchParams()
        params.set('redirectTo', redirectTo)
        window.location.href = `/login?${params.toString()}`
      }

      return Promise.reject(error)
    }

    // ========== 403 无权限 ==========
    if (response?.status === 403) {
      console.error('[403 Forbidden]', config?.url)
      return Promise.reject(error)
    }

    // ========== 500 服务器错误 ==========
    if (response?.status && response.status >= 500) {
      console.error('[500 Server Error]', config?.url, response?.data)
      return Promise.reject(error)
    }

    // ========== 网络错误 ==========
    if (!response) {
      console.error('[Network Error]', error.message)
    }

    return Promise.reject(error)
  },
)

// ========== 便捷方法 ==========
export const http = {
  get: <T>(url: string, params?: object) =>
    request.get<T>(url, { params }).then(res => res.data),

  post: <T>(url: string, data?: FormData | object) =>
    request.post<T>(url, data).then(res => res.data),

  put: <T>(url: string, data?: FormData | object) =>
    request.put<T>(url, data).then(res => res.data),

  patch: <T>(url: string, data?: FormData | object) =>
    request.patch<T>(url, data).then(res => res.data),

  delete: <T>(url: string, params?: object) =>
    request.delete<T>(url, { params }).then(res => res.data),
}

export default request

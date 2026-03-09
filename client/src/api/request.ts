import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import { redirect } from 'react-router'
import { clearTokens, getAccessToken, refreshAccessToken } from '@/auth'
import { env } from '@/config/env'
import { ERROR_CODE } from './constants'

// ========== 创建 Axios 实例 ==========
export const request = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== 刷新 Token 的锁（防止多次同时刷新） =====
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

// 将新 Token 应用到队列中的请求
function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    }
    else {
      prom.resolve(token!)
    }
  })

  failedQueue = []
}

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

    // 调试日志（开发环境）
    if (env.isDev) {
      console.log(`%c>>>>>> ${config.url} - ${config.method?.toUpperCase()}`, 'color: green;font-weight: bold;', config)
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
    const { code } = response.data

    // 检查业务错误码：4001 → Token 过期
    if (code === ERROR_CODE.TOKEN_EXPIRED) {
      return handleTokenExpired(response.config) // 处理刷新逻辑
    }

    // 调试日志
    if (env.isDev) {
      console.log(`%c<<<<<< ${response.config.url}`, 'color: green;font-weight: bold;', response.data)
    }

    // 如果后端有 { code, data, message } 格式，可在这里解包
    return response
  },
  (error: AxiosError<{ message?: string, code?: number }>) => {
    const { response, config } = error

    // 打印错误
    console.error(`%c[Error] ${config?.url}`, 'color: red;font-weight: bold;', response?.status, response?.data)

    // ========== 401 未授权：清 token + 跳登录 ==========
    if (response?.status === 401) {
      clearTokens()

      // 获取当前路径，登录后跳回
      const redirectTo = window.location.pathname + window.location.search
      const params = new URLSearchParams()
      params.set('redirectTo', redirectTo)
      redirect(`/login?${params.toString()}`)

      return Promise.reject(error)
    }

    // ========== 403 无权限 ==========
    if (response?.status === 403) {
      // 跳到无权限页
      window.location.href = '/403'
    }

    // ========== 500 服务器错误 ==========
    if (response?.status && response.status >= 500) {
      // 跳到服务器错误页
      window.location.href = '/500'
    }

    // ========== 网络错误 ==========
    if (!response) {
      console.error('[Network Error]', error.message)
      // toast.error("网络异常，请检查网络连接");
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

/**
 * 处理 Token 过期（4001）
 * @param originalConfig 原始请求的配置
 */
async function handleTokenExpired(originalConfig: InternalAxiosRequestConfig) {
  // 如果正在刷新，將请求加入队列，等待刷新完成
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    }).then((newToken) => {
      // 刷新成功后，用新 Token 重发原始请求
      originalConfig.headers.Authorization = `Bearer ${newToken}`
      return request(originalConfig)
    })
  }

  // 开始刷新 Token
  isRefreshing = true

  try {
    const newAccessToken = await refreshAccessToken()

    // 刷新成功 → 更新队列中的所有请求
    processQueue(null, newAccessToken)

    // 用新 Token 重发原始请求
    originalConfig.headers.Authorization = `Bearer ${newAccessToken}`
    return request(originalConfig)
  }
  catch (refreshError) {
    // 刷新失败 → 清空队列并跳转登录页
    processQueue(refreshError, null)
    clearTokens()
    throw redirect(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
  }
  finally {
    isRefreshing = false
  }
}

export default request

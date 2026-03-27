import type { App } from '../../../../super-milvus/src/index'
import { treaty } from '@elysiajs/eden'
import { getAccessToken } from '@/auth'
import { env } from '@/config/env'

// Eden Treaty 客户端 - 与后端 Elysia 应用类型安全通信
//@ts-ignore
export const server = treaty<App>(env.API_BASE_URL, {
  headers: () => ({
    Authorization: `Bearer ${getAccessToken() || ''}`,
  }),
})

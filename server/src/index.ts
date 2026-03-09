import { join } from 'node:path'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { staticPlugin } from '@elysiajs/static'
import { Elysia } from 'elysia'
import { chatRoutes } from './chat.controller'
import { logger } from './logger'

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .use(chatRoutes)
  // 静态文件服务 - 提供上传的文件访问
  .use(staticPlugin({
    assets: join(process.cwd(), 'uploads'),
    prefix: '/uploads',
  }))
  .listen(3000)

logger.info(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/openapi`,
)

export type App = typeof app

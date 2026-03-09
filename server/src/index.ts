import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { chatRoutes } from './chat.controller'
import { logger } from './logger'

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .use(chatRoutes)
  .listen(3000)

logger.info(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/openapi`,
)

export type App = typeof app

import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'
import { conversationRoutes } from './routes/conversation.routes'
import { messageRoutes } from './routes/message.routes'

const JWT_SECRET = 'Fischl von Luftschloss Narfidort'

/**
 * 聊天模块主路由
 * 聚合会话和消息相关路由
 */
export const chatRoutes = new Elysia({ prefix: '/api' })
  // JWT 配置
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET,
    }),
  )
  // 签名路由（无需认证）
  .get('/sign/:name', async ({ jwt, params: { name }, cookie: { auth } }) => {
    const value = await jwt.sign({ name })
    auth.set({
      value,
      httpOnly: true,
      maxAge: 7 * 86400,
      path: '/api',
    })
    return `Sign in as ${value}`
  })
  // JWT 认证中间件（应用于后续所有路由）
  .derive(async ({ jwt, cookie: { auth }, status }) => {
    const profile = await jwt.verify(auth.value as string)
    const userId = profile?.name as string

    if (!profile)
      return status(401, 'Unauthorized')

    return { userId }
  })
  // 子路由（继承认证上下文）
  .use(conversationRoutes)
  .use(messageRoutes)

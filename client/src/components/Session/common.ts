import type { App } from '../../../../server/src'
import type { Message } from '@/components/Session/types.ts'
import { treaty } from '@elysiajs/eden'

export const SYSTEM_BOT_ID = 'system-bot-id'

export const isBot = (message: Message) => message.senderId === SYSTEM_BOT_ID

export const app = treaty<App>('localhost:3000', {
  fetch: {
    credentials: 'include',
  },
})

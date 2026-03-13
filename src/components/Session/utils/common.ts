import type { Message } from '@/components/Session/types'

export const SYSTEM_BOT_ID = 'system-bot-id'
export const isBot = (message: Message) => message.senderId === SYSTEM_BOT_ID

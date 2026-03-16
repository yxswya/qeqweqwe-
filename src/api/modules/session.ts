import type { App } from '../../../../server/src/index.ts'
import { treaty } from '@elysiajs/eden'
import { getAccessToken } from '@/auth.ts'

// @ts-ignore
export const server = treaty<App>('localhost:3002', {
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
  },
})

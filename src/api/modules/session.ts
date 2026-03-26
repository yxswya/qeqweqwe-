import type { App } from '../../../../server/src/index.ts'
import { treaty } from '@elysiajs/eden'
import { getAccessToken } from '@/auth.ts'

// @ts-ignore
export const server = treaty<App>('http://101.35.246.159:3010', {
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
  },
})

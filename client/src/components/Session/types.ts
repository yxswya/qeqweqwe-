// import type { SelectMessage } from '../../../../server/src/schema'

import type { MessageResponse } from './utils/elysia'

// export type Message = Omit<SelectMessage, 'messageType'> & {
//   messageType: SelectMessage['messageType'] | 'LOADING'
// }

export type Message = MessageResponse

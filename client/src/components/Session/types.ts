import type { SelectMessage } from '../../../../server/src/schema'

// export type Message = Omit<SelectMessage, 'messageType'> & {
//   messageType: SelectMessage['messageType'] | 'LOADING'
// }

export type Message = SelectMessage

import { chatApi, sessionApi } from '@/api/modules'
import { convertFormat } from '@/components/Chat/utils/messageConverter'

// 获取指定会话消息列表
export async function fetchSessionMessages(
  sessionId: string,
  page: number = 1,
  pageSize: number = 10,
) {
  const response = await sessionApi.getSession(sessionId, {
    page,
    page_size: pageSize,
  })
  return response.items
}

// 获取指定绘画消息列表并将返回的数据格式化
export async function fetchSessionMessagesAndConvert(
  sessionId: string,
  page: number = 1,
  pageSize: number = 10,
) {
  const data = await fetchSessionMessages(sessionId, page, pageSize)
  return data.map(item => convertFormat(item))
}

// 发送聊天记录
export async function sendChatMessage(text: string, sessionId: string | undefined) {
  const response = await chatApi.sendMessage({
    role: 'user',
    content: text,
    session_id: sessionId,
  })
  return response.data
}

// 发送消息并将返回的消息格式化
export async function sendChatMessageAndConvert(
  text: string,
  sessionId: string | undefined,
): Promise<ReturnType<typeof convertFormat>> {
  const data = await sendChatMessage(text, sessionId)
  console.log('sendChatMessageAndConvert message', data)
  return convertFormat(data)
}

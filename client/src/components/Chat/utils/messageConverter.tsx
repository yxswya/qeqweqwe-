import type { ChatResponse, CompletenessCardMessage, IntentCardMessage } from '@/api/modules'
import type { Message } from '@/components/WorkFlow/store'
import type { ApiResponse } from '@/components/WorkFlow/types'
// import { Rag } from '@/components/Card'

import Loading from '@/components/Card/Loading'
import RagSimple from '@/components/Card/RagSimple'
import Text from '@/components/Card/Text'

import { MessageTypes } from '@/components/Chat/types.ts'
import { generateUniqueId } from '@/components/Chat/utils/helpers'

import { hasAnswer } from '@/components/WorkFlow/types'

export function getComponent(message: Message) {
  if (message.senderId !== 'system-bot-id') {
    return <Text content={message.content} />
  }

  if (message.content === 'loading') {
    return <Loading />
  }

  if (message.content === 'RAG_BUILD_INDEX') {
    return <RagSimple message={message} />
  }

  if (message.messageStatus === 'rag') {
    return <Text content="知识库构建中" />
  }

  if (message.content[0] === '{') {
    try {
      const content = JSON.parse(message.content) as ApiResponse

      if (hasAnswer(content)) {
        return <Text content={content.answer.normalized_request.ai_summary} />
      }
      else {
        return <Text content={content.workflow_hint.reason} />
      }
    }
    catch {
      return <Text content={message.content} />
    }
  }

  return <Text content={message.content} />

  // if (type === MessageTypes.Transparent) {
  //   return <Text message={message} />
  // }
  // else if (type === MessageTypes.UserText) {
  //   return <Text message={message} />
  // }
  // else if (type === MessageTypes.AssistantText) {
  //   return <Text message={message} />
  // }
  // else if (type === MessageTypes.AssistantAgentCreate) {
  //   return <></>
  // }
  // else if (type === MessageTypes.AssistantAskMoreInfo) {
  //   return <></>
  // }
  // else if (type === MessageTypes.AssistantRagBuildIndex) {
  //   return <Rag message={message} />
  // }
}

export function convertFormat(rawMessage: ChatResponse): Message {
  return {
    id: generateUniqueId(),
    raw: rawMessage,
    type: getType(rawMessage),
  }
}

export function getType(rawMessage: ChatResponse): MessageType {
  let type: MessageType = MessageTypes.UserText

  if ((rawMessage as (CompletenessCardMessage | IntentCardMessage)).role === 'assistant') {
    type = MessageTypes.AssistantText
  }

  if ((rawMessage as IntentCardMessage).meta_data?.intent?.actions[0] === 'RAG_BUILD_INDEX') {
    type = MessageTypes.AssistantRagBuildIndex
  }

  return type
}

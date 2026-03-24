import type { ApiResponse, Message } from '@/components/Session/types'
import * as React from 'react'
import Loading from '@/components/Card/Loading.tsx'
import ModelTrain from '@/components/Card/ModelTrain'
import { ModelTrainProgress, RagBuildProgress } from '@/components/Card/Progress'
import RagSimple from '@/components/Card/RagSimple'
import Text from '@/components/Card/Text.tsx'
import { hasAnswer, hasIntent, hasModelTrainProgress, hasRagBuildProgress } from '@/components/Session/types'
import { isBot } from '@/components/Session/utils/common.ts'

const MessageListItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.senderId !== 'system-bot-id'
  return (
    <>
      {/* 注入关键帧动画 */}
      <style>
        {`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        `}
      </style>
      <div
        key={message.id}
        className={`flex items-start px-4 gap-5.5 ${isUser && 'flex-row-reverse'}`}
      >
        <div>
          {
            isUser
              ? (
                  <div>
                    <img
                      className="w-12.5 h-12.5 overflow-hidden rounded-xl flex items-center justify-center object-cover"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="用户头像"
                    />
                  </div>
                )
              : (
                  <div
                    className="w-12.5 h-12.5 bg-[#cfddf0] overflow-hidden border border-[#bfdbfe] rounded-xl flex items-center justify-center"
                  >
                    <img
                      src="./机器人头像.png"
                      alt="avatar"
                      className="w-auto h-8 object-cover rounded-full"
                    />
                  </div>
                )
          }
        </div>

        <div
          className={`w-0 flex flex-1 ${message.senderId !== 'system-bot-id' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={
              `mb-2 overflow-hidden max-w-[70%] ${
                message.senderId !== 'system-bot-id'
                  ? 'origin-bottom-right rounded-s-2xl rounded-b-2xl bg-[#2563EB] text-white'
                  : 'origin-bottom-left rounded-2xl bg-white'
              } animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.075)_forwards]  min-h-12.5 flex justify-start items-center`
            }
          >
            {
              renderMessageListItem(message)
            }
          </div>
        </div>
      </div>
    </>
  )
}

export function renderMessageListItem(message: Message) {
  // 不是机器人的时候（用户）内容使用纯文本
  if (!isBot(message)) {
    return <Text content={message.content} />
  }

  // =========== 状态进行处理 ======================

  if (message.status === 'sending') {
    return <Loading />
  }

  // =========== 消息类型进行处理 ==================

  if (message.type === 'text' && message.content === 'Rag 构建') {
    return <RagSimple message={message} />
  }

  if (message.type === 'text') {
    return <Text content={message.content} />
  }

  // const mockData = {
  //   workload_level: 'small',
  //   gpu_type: 'CPU-only',
  //   gpu_count: 0,
  //   gpu_memory_gb: 0,
  //   cpu_cores: 4,
  //   ram_gb: 8,
  //   estimated_hours: 2,
  //   cost_sensitivity: 'medium',
  //   rationale: '需求为基于单一法规文档（约数万字）构建RAG智能客服助手，用于对外服务。知识库规模小，对响应速度要求中等，但强调“效果最好”和“语气专业”，需使用质量较高的嵌入模型和7B左右参数量的对话模型。初期并发量低，无需高性能GPU实时推理，可采用CPU进行向量检索及轻量模型推理，或云端API调用。开发调试为主要耗时。',
  //   confidence: 0.8,
  // }

  if (message.type === 'json') {
    const content = parseContent(message.content) as ApiResponse

    if (hasAnswer(content)) {
      return <Text content={content.answer.normalized_request.ai_summary} />
    }
    else if (hasIntent(content)) {
      return (
        <div className="w-full">
          <Text content={content.workflow_hint.reason} />
          {/* <h2 className="bg-red-500">{message.id}</h2> */}
          {/* {
            content.intent.actions.includes('ASK_MORE_INFO')
            && content.intent.intent === 'train.start'
            && (
              <TrainToopit message={message} />
            )
          } */}

          {/* {
            content.intent.actions.includes('AGENT_CREATE')
            && content.workflow_hint.stage === 'ready_for_agent_create'
            && (
              <>
                <ComputeEstimateSummary data={mockData} />
              </>
            )
          } */}

          {
            content.intent.actions.includes('RAG_BUILD_INDEX')
            && (
              <RagSimple message={message} />
            )
          }

          {
            content.intent.actions.includes('TRAIN_START')
            && (
              <ModelTrain message={message} />
            )
          }
          {/* <h1 className="bg-orange-500">
            {content.intent.domain}
            -
            {content.intent.sub_intent}
            -
            {content.intent.actions}
          </h1> */}
          {/* <Actions actions={content.intent.actions} /> */}
        </div>
      )
    }
    else if (hasRagBuildProgress(content)) {
      return <RagBuildProgress title={content.title} status={content.status} />
    }
    else if (hasModelTrainProgress(content)) {
      return <ModelTrainProgress title={content.title} status={content.status} />
    }
    else {
      console.log('存有无法识别的消息内容', message)
    }
  }
  return <Text content={message.content} />
}

function parseContent<T>(content: string) {
  try {
    return JSON.parse(content) as T
  }
  catch {
    return {}
  }
}

export default MessageListItem

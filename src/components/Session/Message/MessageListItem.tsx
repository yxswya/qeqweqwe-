import type { ApiResponse, Message } from '@/components/Session/types'
import * as React from 'react'
import Loading from '@/components/Card/Loading.tsx'
import ModelTrain from '@/components/Card/ModelTrain'
import RagSimple from '@/components/Card/RagSimple'
import Text from '@/components/Card/Text.tsx'
import TrainToopit from '@/components/Card/Train/Toopit'
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
      return (
        <div>
          {
            content.status === 'pending'
              ? (
                  <div className="w-80 bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-200" />
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        <div className="absolute inset-2 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {content.title}
                        </h3>
                        <p className="text-xs text-blue-500 font-medium">
                          知识库构建中...
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>正在构建向量索引</span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          运行中
                        </span>
                      </div>
                    </div>
                  </div>
                )
              : (
                  <div className="w-80 bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {content.title}
                        </h3>
                        <p className="text-xs text-green-500 font-medium">
                          知识库构建完成
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-green-400 to-emerald-400 rounded-full" style={{ width: '100%' }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>向量索引构建完成</span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          已完成
                        </span>
                      </div>
                    </div>
                  </div>
                )
          }
        </div>
      )
    }
    else if (hasModelTrainProgress(content)) {
      return (
        <div>
          {
            content.status === 'pending'
              ? (
                  <div className="w-80 bg-linear-to-br from-indigo-50 to-violet-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-200" />
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <div className="absolute inset-2 rounded-full bg-indigo-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {content.title}
                        </h3>
                        <p className="text-xs text-indigo-500 font-medium">
                          模型训练中...
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-indigo-400 to-violet-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>正在处理数据</span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          运行中
                        </span>
                      </div>
                    </div>
                  </div>
                )
              : (
                  <div className="w-80 bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 truncate">
                          {content.title}
                        </h3>
                        <p className="text-xs text-green-500 font-medium">
                          训练完成
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-green-400 to-emerald-400 rounded-full" style={{ width: '100%' }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>模型训练完成</span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          已完成
                        </span>
                      </div>
                    </div>
                  </div>
                )
          }
        </div>
      )
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

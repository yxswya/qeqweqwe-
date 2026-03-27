import type { ApiResponse, Message, MessageContent } from '@/components/Session/types'
import * as React from 'react'
import Loading from '@/components/Card/Loading.tsx'
import ModelTrain from '@/components/Card/ModelTrain'
import { ModelTrainProgress, RagBuildProgress } from '@/components/Card/Progress'
import RagSimple from '@/components/Card/RagSimple'
import Text from '@/components/Card/Text.tsx'
import {
  getTextFromContent,
  hasAnswer,
  hasIntent,
  hasModelTrainProgress,
  hasRagBuildProgress,
  isErrorContent,
  isLoadingContent,
  isModelTrainResponseContent,
  isRagBuildResponseContent,
  isResponseContent,
  isTextContent,
} from '@/components/Session/types'
import { isBot } from '@/components/Session/utils/common.ts'

const MessageListItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.senderId !== 'system'
  // 检查是否是模型训练进度卡片（需要hover展开详情，不能使用overflow-hidden）
  const content = message.content as MessageContent
  const isModelTrainCard = !isUser && typeof content === 'object' && content !== null && hasModelTrainProgress(content as ApiResponse)

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
          className={`w-0 flex flex-1 ${message.senderId !== 'system' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={
              `mb-2 ${isModelTrainCard ? '' : 'overflow-hidden'} max-w-[70%] ${
                message.senderId !== 'system'
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
  const content = message.content as MessageContent

  // =========== 基于内容类型进行处理 ==================

  // 用户消息：直接显示文本
  if (!isBot(message)) {
    return <Text content={getTextFromContent(content)} />
  }

  // 加载状态
  if (isLoadingContent(content)) {
    return <Loading />
  }

  // 错误状态
  if (isErrorContent(content)) {
    return <Text content={content.message} />
  }

  // 文本内容
  if (isTextContent(content)) {
    return <Text content={content.text} />
  }

  // RAG 构建响应内容
  if (isRagBuildResponseContent(content)) {
    const responseData = content.data
    // 检查是否包含进度信息
    if (responseData && typeof responseData === 'object') {
      if (hasRagBuildProgress(responseData)) {
        return <RagBuildProgress title={responseData.title} status={responseData.status} />
      }
    }
    return <Text content="知识库构建完成" />
  }

  // 模型训练响应内容
  if (isModelTrainResponseContent(content)) {
    const responseData = content.data
    // 检查是否包含进度信息
    if (responseData && typeof responseData === 'object') {
      const trainData = responseData.train as ApiResponse | undefined
      if (trainData && hasModelTrainProgress(trainData)) {
        const trainStage = (trainData.trainStage ?? 5) as 1 | 2 | 3 | 4 | 5
        return (
          <ModelTrainProgress
            title={trainData.title}
            stage={trainStage}
            data={{
              modelCode: trainData.modelCode,
              method: trainData.method,
              architecture: trainData.architecture,
              currentEpoch: trainData.currentEpoch,
              totalEpochs: trainData.totalEpochs,
              progress: trainData.progress,
              outputSize: trainData.outputSize,
              fileLocation: trainData.fileLocation,
              accuracy: trainData.accuracy,
              ragIndex: trainData.ragIndex,
              elapsedMs: trainData.elapsedMs,
              targetRegistry: trainData.targetRegistry,
              modelId: trainData.modelId,
              version: trainData.version,
              inferEndpoint: trainData.inferEndpoint,
              fileSize: trainData.fileSize,
              existsLocal: trainData.existsLocal,
            }}
          />
        )
      }
    }
    return <Text content="模型训练完成" />
  }

  // 响应内容（解析内部数据）
  if (isResponseContent(content)) {
    const responseData = content.data as ApiResponse

    if (hasAnswer(responseData)) {
      return <Text content={responseData.answer.normalized_request.ai_summary} />
    }
    else if (hasIntent(responseData)) {
      return (
        <div className="w-full">
          <Text content={responseData.workflow_hint.reason} />
          {
            responseData.intent.actions.includes('RAG_BUILD_INDEX')
            && (
              <RagSimple message={message} />
            )
          }

          {
            responseData.intent.actions.includes('TRAIN_START')
            && (
              <ModelTrain message={message} />
            )
          }
        </div>
      )
    }
    else if (hasRagBuildProgress(responseData)) {
      return <RagBuildProgress title={responseData.title} status={responseData.status} />
    }
    else if (hasModelTrainProgress(responseData)) {
      // 使用 trainStage 字段，默认为 1
      const trainStage = (responseData.trainStage ?? 1) as 1 | 2 | 3 | 4 | 5
      return (
        <ModelTrainProgress
          title={responseData.title}
          stage={trainStage}
          data={{
            modelCode: responseData.modelCode,
            method: responseData.method,
            architecture: responseData.architecture,
            currentEpoch: responseData.currentEpoch,
            totalEpochs: responseData.totalEpochs,
            progress: responseData.progress,
            outputSize: responseData.outputSize,
            fileLocation: responseData.fileLocation,
            accuracy: responseData.accuracy,
            ragIndex: responseData.ragIndex,
            elapsedMs: responseData.elapsedMs,
            targetRegistry: responseData.targetRegistry,
            modelId: responseData.modelId,
            version: responseData.version,
            inferEndpoint: responseData.inferEndpoint,
            fileSize: responseData.fileSize,
            existsLocal: responseData.existsLocal,
          }}
        />
      )
    }
    else {
      console.log('存有无法识别的响应内容', message)
      return <Text content="收到无法解析的响应" />
    }
  }

  console.log('存有无法识别的消息内容', message)
  return <Text content="我似乎不太理解你的意思。" />
}

export default MessageListItem

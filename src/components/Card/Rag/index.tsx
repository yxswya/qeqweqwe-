import type { RagComponentProps } from './types.ts'
import type { IntentCardMessage } from '@/api/modules/chat.ts'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router'

import { useChatStore } from '@/components/Chat/store/useMessageStore'
import FileParsingModal from './FileParsingModal.tsx'
import FileUploadModal from './FileUploadModal.tsx'
import KnowledgeBaseSection from './KnowledgeBaseSection.tsx'
import ModalWrapper from './ModalWrapper.tsx'
import RecommendedPlan from './RecommendedPlan.tsx'
import { useFileUpload } from './useFileUpload.ts'
import { useKnowledgeBaseModal } from './useKnowledgeBaseModal.ts'

const Rag: React.FC<RagComponentProps> = ({ message }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const uploadAreaRef = React.useRef<HTMLDivElement>(null)
  const logContainerRef = React.useRef<HTMLDivElement>(null)
  const { id: routeSessionId } = useParams()
  const { sessionId: storeSessionId, addAssistantMessage } = useChatStore()
  const sessionId = routeSessionId || storeSessionId

  // 使用文件上传 hook
  const {
    files,
    dragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    clearFiles,
    setFiles,
  } = useFileUpload()

  // 使用模态框状态管理 hook
  const {
    showModal,
    currentStage,
    parseProgress,
    estimatedTime,
    logs,
    knowledgeBaseEnabled,
    handleEnableKnowledgeBase,
    handleCancel,
    handleStartParse,
    handleComplete,
  } = useKnowledgeBaseModal({
    sessionId,
    addAssistantMessage,
    files,
    setFiles,
    clearFiles,
  })

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 只在 intent 阶段显示
  if ((message.raw as IntentCardMessage).meta_data?.intent.actions[0] !== 'RAG_BUILD_INDEX') {
    return <></>
  }

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-[#80bdff] w-full relative overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between h-15 bg-[#eff6ff] px-[26.67px]">
        <div className="flex items-center gap-2">
          <span className="text-[#1D4ED8] text-lg font-semibold">
            资源智能补齐与要素确认
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 bg-[#DBEAFE] text-[#2563EB] text-[13px] px-2.5 py-1 rounded-md">
          步骤 2/3
        </div>
      </div>

      <div className="px-8 pt-2.5 pb-8 flex flex-col gap-4.25">
        {/* 当前推荐方案 */}
        <RecommendedPlan message={message} />

        {/* 知识库补齐区域 */}
        <KnowledgeBaseSection
          message={message}
          knowledgeBaseEnabled={knowledgeBaseEnabled}
          onEnableKnowledgeBase={handleEnableKnowledgeBase}
        />
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.json,.txt,.pdf,.doc,.docx"
        onChange={handleFileSelect}
      />

      {/* 模态框 - 使用 Portal 渲染到全局 */}
      {showModal
        && createPortal(
          <ModalWrapper>
            {currentStage === 'upload'
              ? (
                  <FileUploadModal
                    files={files}
                    dragOver={dragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onUploadClick={handleUploadClick}
                    onFileSelect={handleFileSelect}
                    uploadAreaRef={uploadAreaRef}
                    fileInputRef={fileInputRef}
                    onCancel={handleCancel}
                    onStartParse={handleStartParse}
                  />
                )
              : (
                  <FileParsingModal
                    files={files}
                    parseProgress={parseProgress}
                    estimatedTime={estimatedTime}
                    logs={logs}
                    logContainerRef={logContainerRef}
                    onComplete={handleComplete}
                  />
                )}
          </ModalWrapper>,
          document.body,
        )}
    </div>
  )
}

export default Rag

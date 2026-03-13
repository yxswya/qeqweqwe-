import type { KnowledgeBaseSectionProps } from './types.ts'
import { CheckCircle } from 'lucide-react'
import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  EXPECTED_IMPROVEMENT,
  KNOWLEDGE_BASE_USE_CASES,
} from './constants.ts'

const KnowledgeBaseSection: React.FC<KnowledgeBaseSectionProps> = ({
  message,
  knowledgeBaseEnabled,
  onEnableKnowledgeBase,
}) => {
  const navigate = useNavigate()
  const { id: routeSessionId } = useParams()
  const { workflow_hint } = message.raw.meta_data
  const needMoreInfo = workflow_hint.stage === 'need_more_info'
  const sessionId = routeSessionId || message.raw.session_id

  // 已启用状态
  if (needMoreInfo && knowledgeBaseEnabled) {
    return (
      <div className="bg-[#ffffff] border border-[#cbf9db] rounded-xl flex flex-col gap-3 overflow-hidden">
        <div className="text-[#9096a1] text-sm bg-[#fbfffc] border-b border-[#e6eaf1] px-5.25 py-3.5 flex items-center justify-between">
          <span className="text-[14px] text-[#374151] font-bold leading-0 flex gap-2">
            <span className="bg-[#22c55e] w-4 h-4 rounded-full text-white flex justify-center items-center">
              <CheckCircle size={12} />
            </span>
            <div className="flex items-center text-[#374151]">
              已启用: 业务知识库
            </div>
          </span>

          <div
            className="bg-[#3b82f6] rounded-md px-2 py-1 text-[white] text-[10px]"
            style={{ lineHeight: 'normal !important' }}
          >
            已启用
          </div>
        </div>
        <div className="px-5.25 py-3.5 flex gap-3.5">
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="font-bold flex items-center">
              <CheckCircle size={16} color="#6b7280" className="mr-1.5" />
              <span className="text-[#374151]">已覆盖：</span>
            </span>
            {KNOWLEDGE_BASE_USE_CASES.map(useCase => (
              <span key={useCase} className="text-gray-500 text-xs">
                {useCase}
              </span>
            ))}
          </div>
          <div className="flex-1 flex flex-col w-full">
            <div className="bg-[#fafbfc] flex flex-col p-3.5 border border-[#f5f6f8] rounded-xl mb-3.5">
              <span className="text-[#45b56e] text-[14px] font-bold mb-1.25">
                预期效果提升: +
                {EXPECTED_IMPROVEMENT.min}
                % ~
                {' '}
                {EXPECTED_IMPROVEMENT.max}
                %
              </span>
              <span className="text-[#6b7280] text-[11px]">
                已基于历史数据进行初步补齐
              </span>
            </div>

            <div className="flex">
              <span
                className="bg-[#ffffff] text-[#374151] font-bold mb-1.25 flex-1 flex justify-center items-center h-8 rounded-lg text-xs cursor-pointer border border-[#e8eaed]"
                onClick={() => navigate(`/intelligent-dialogue/${sessionId}/data`)}
              >
                管理知识库
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 推荐状态（强烈推荐或可选）
  const badgeColor = needMoreInfo
    ? 'bg-[#3b82f6] text-[white]'
    : 'bg-[#e2e8f0] text-[#334155]'
  const badgeText = needMoreInfo ? '强烈推荐' : '可选'
  const sectionTitle = needMoreInfo ? '建议补充: 业务知识库' : '可选择补充: 业务知识库'

  return (
    <div className="bg-[#ffffff] border border-[#e6eaf1] rounded-xl flex flex-col gap-3 overflow-hidden">
      <div className="text-[#9096a1] text-sm bg-[#fcfdfd] border-b border-[#e6eaf1] px-5.25 py-3.5 flex items-center justify-between">
        <span className="text-[14px] text-[#374151] font-bold leading-0">
          {sectionTitle}
        </span>

        <div
          className={`${badgeColor} rounded-md px-2 py-1 text-[10px]`}
          style={{ lineHeight: 'normal !important' }}
        >
          {badgeText}
        </div>
      </div>
      <div className="px-5.25 py-3.5 flex gap-3.5">
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="font-bold">适用于：</span>
          {KNOWLEDGE_BASE_USE_CASES.map(useCase => (
            <span key={useCase} className="text-gray-500 text-xs">
              {useCase}
            </span>
          ))}
        </div>
        <div className="flex-1 flex flex-col w-full">
          <div className="bg-[#eff6ff] flex flex-col p-3.5 border border-[#dbeafe] rounded-xl mb-3.5">
            <span className="text-[#3b82f6] text-[14px] font-bold mb-1.25">
              预期效果提升: +
              {EXPECTED_IMPROVEMENT.min}
              % ~
              {' '}
              {EXPECTED_IMPROVEMENT.max}
              %
            </span>
            <span className="text-[#6b7280] text-[11px]">
              基于相似业务场景历史数据估算
            </span>
          </div>

          <div className="flex">
            <span
              className="bg-[#3b82f6] text-[white] font-bold mb-1.25 flex-1 flex justify-center items-center h-8 rounded-lg text-xs cursor-pointer"
              onClick={onEnableKnowledgeBase}
            >
              启用知识库补齐
            </span>
            <span className="text-[#6b7280] text-[11px] w-22 flex justify-center items-center h-8 rounded-lg text-xs">
              稍后再说
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBaseSection

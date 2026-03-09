import type { RecommendedPlanProps } from './types.ts'
import type { CompletenessCardMessage, IntentCardMessage } from '@/api/modules/chat.ts'
import { Brain, Info } from 'lucide-react'
import * as React from 'react'

const RecommendedPlan: React.FC<RecommendedPlanProps> = ({ message }) => {
  const { workflow_hint, completeness, intent } = (message.raw as IntentCardMessage).meta_data
  const result_data = (message.raw as IntentCardMessage).result_data

  const needMoreInfo = workflow_hint.stage === 'need_more_info'
  return (
    <div className="bg-[#ffffff] border border-[#e6eaf1] rounded-xl flex flex-col gap-3 overflow-hidden max-w-205">
      <div className="text-[#9096a1] text-sm bg-[#fcfdfd] border-b border-[#e6eaf1] px-5.25 py-3.5 flex items-center justify-between">
        <span className="text-[14px] text-[#374151] font-bold leading-0">
          当前推荐方案
        </span>
        {needMoreInfo
          ? (
              <div className="bg-[#fffbeb] rounded-md px-2 py-1 text-[#ec6925] text-[10px]" style={{ lineHeight: 'normal !important' }}>
                模型底座 (需优化)
              </div>
            )
          : (
              <div className="bg-[#eff6ff] rounded-md px-2 py-1 text-[#2563eb] text-[10px]" style={{ lineHeight: 'normal !important' }}>
                模型底座 (已完成)
              </div>
            )}
      </div>
      <div className="px-5.25 py-3.5 flex gap-3.5">
        <div>
          <Brain size={34} color="#3b82f6" />
        </div>
        <div className="flex flex-col w-full">
          <div className="text-[#374151] text-[18px] font-bold mb-1">
            {result_data?.train_preset.base_model}
          </div>

          <div className="text-[#9ca3af] text-[13px] mb-3.5 flex items-center gap-2">
            <span>
              使用场景
              <span className="font-bold text-black ml-1">
                {completeness.identified_info['使用场景']}
              </span>
            </span>
            <span>
              目标优先级
              <span className="font-bold text-black ml-1">
                {completeness.identified_info['目标优先级']}
              </span>
            </span>
          </div>

          {needMoreInfo
            ? (
                <span className="text-[#92400e] text-[16px] flex items-start bg-[#fffbeb] border border-[#ffedd5] py-2.5 px-3 rounded-lg w-full">
                  <Info size={18} className="mr-2" />
                  <span className="font-bold">系统判断</span>
                  <span className="pl-1 px-2">:</span>
                  <span className="flex-1">
                    {intent.rationale}
                  </span>
                </span>
              )
            : (
                <span className="text-[#1e40af] text-[16px] flex items-start bg-[#f3f6fc] border border-[#dbeafe] py-2.5 px-3 rounded-lg w-full">
                  <Info size={18} className="mr-2" />
                  <span className="font-bold">系统判断</span>
                  <span className="pl-1 px-2">:</span>
                  <span className="flex-1">
                    {intent.rationale}
                  </span>
                </span>
              )}
        </div>
      </div>
    </div>
  )
}

export default RecommendedPlan

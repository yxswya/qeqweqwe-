import type { RagConfig, TrainConfig } from './types'
import { defaultRagConfig, defaultTrainConfig } from './types'
import { Settings, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import RagConfigInput from './RagConfigInput'
import TrainConfigInput from './TrainConfigInput'

interface AdvancedSettingsProps {
  ragConfig: RagConfig
  trainConfig: TrainConfig
  onRagConfigChange: (config: RagConfig) => void
  onTrainConfigChange: (config: TrainConfig) => void
}

function AdvancedSettings({
  ragConfig,
  trainConfig,
  onRagConfigChange,
  onTrainConfigChange,
}: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const resetToDefaults = () => {
    onRagConfigChange(defaultRagConfig)
    onTrainConfigChange(defaultTrainConfig)
  }

  return (
    <div className="space-y-2">
      {/* 折叠/展开按钮 */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500 group-hover:text-indigo-500 transition-colors" />
          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
            高级设置
          </span>
        </div>
        {isExpanded
          ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )
          : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
      </button>

      {/* 折叠内容 */}
      {isExpanded && (
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* RAG 配置 */}
          <RagConfigInput config={ragConfig} onChange={onRagConfigChange} />

          {/* 分隔线 */}
          <div className="border-t border-slate-200" />

          {/* 训练配置 */}
          <TrainConfigInput config={trainConfig} onChange={onTrainConfigChange} />

          {/* 重置按钮 */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            >
              <RotateCcw className="w-3 h-3" />
              恢复默认
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSettings
export { defaultRagConfig, defaultTrainConfig }
export type { RagConfig, TrainConfig }

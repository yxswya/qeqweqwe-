import type { TrainConfig } from './types'
import { baseModelOptions } from './types'

interface TrainConfigInputProps {
  config: TrainConfig
  onChange: (config: TrainConfig) => void
}

function TrainConfigInput({ config, onChange }: TrainConfigInputProps) {
  const updateConfig = <K extends keyof TrainConfig>(key: K, value: TrainConfig[K]) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
        训练配置
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* 训练方法 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">训练方法</label>
          <select
            value={config.method}
            onChange={e => updateConfig('method', e.target.value as TrainConfig['method'])}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="lora">LoRA (推荐)</option>
            <option value="qlora">QLoRA (量化)</option>
            <option value="full">Full Fine-tuning</option>
          </select>
        </div>

        {/* 基础模型 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">基础模型</label>
          <select
            value={config.base_model}
            onChange={e => updateConfig('base_model', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          >
            {baseModelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 训练轮数 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">训练轮数 (Epochs)</label>
          <input
            type="number"
            value={config.epochs}
            onChange={e => updateConfig('epochs', Number.parseInt(e.target.value) || 1)}
            min={1}
            max={100}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* 批次大小 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">批次大小 (Batch Size)</label>
          <input
            type="number"
            value={config.batch_size}
            onChange={e => updateConfig('batch_size', Number.parseInt(e.target.value) || 1)}
            min={1}
            max={64}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* 最大序列长度 */}
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-slate-500">最大序列长度 (Max Seq Len)</label>
          <input
            type="number"
            value={config.max_seq_len}
            onChange={e => updateConfig('max_seq_len', Number.parseInt(e.target.value) || 256)}
            min={64}
            max={4096}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  )
}

export default TrainConfigInput

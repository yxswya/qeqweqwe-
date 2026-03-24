import type { RagConfig } from './types'
import { embedderOptions } from './types'

interface RagConfigInputProps {
  config: RagConfig
  onChange: (config: RagConfig) => void
}

function RagConfigInput({ config, onChange }: RagConfigInputProps) {
  const updateConfig = <K extends keyof RagConfig>(key: K, value: RagConfig[K]) => {
    onChange({ ...config, [key]: value })
  }

  const updateChunk = (key: 'size' | 'overlap', value: number) => {
    onChange({
      ...config,
      chunk: { ...config.chunk, [key]: value },
    })
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
        RAG 配置
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* 向量数据库后端 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">向量数据库</label>
          <select
            value={config.backend}
            onChange={e => updateConfig('backend', e.target.value as RagConfig['backend'])}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="pgvector">PgVector</option>
            <option value="milvus">Milvus</option>
          </select>
        </div>

        {/* Embedder 模型 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Embedder 模型</label>
          <select
            value={config.embedder}
            onChange={e => updateConfig('embedder', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          >
            {embedderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 向量维度 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">向量维度</label>
          <input
            type="number"
            value={config.dim}
            onChange={e => updateConfig('dim', Number.parseInt(e.target.value) || 384)}
            min={128}
            max={2048}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* 相似度度量 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">相似度度量</label>
          <select
            value={config.metric}
            onChange={e => updateConfig('metric', e.target.value as RagConfig['metric'])}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="cosine">Cosine (余弦)</option>
            <option value="l2">L2 (欧氏距离)</option>
            <option value="ip">IP (内积)</option>
          </select>
        </div>

        {/* Chunk 大小 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Chunk 大小</label>
          <input
            type="number"
            value={config.chunk.size}
            onChange={e => updateChunk('size', Number.parseInt(e.target.value) || 512)}
            min={64}
            max={2048}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Chunk 重叠 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">Chunk 重叠</label>
          <input
            type="number"
            value={config.chunk.overlap}
            onChange={e => updateChunk('overlap', Number.parseInt(e.target.value) || 64)}
            min={0}
            max={512}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  )
}

export default RagConfigInput

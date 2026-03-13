import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  Server,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

interface ComputeEstimate {
  workload_level: string
  gpu_type: string
  gpu_count: number
  gpu_memory_gb: number
  cpu_cores: number
  ram_gb: number
  estimated_hours: number
  cost_sensitivity: string
  rationale: string
  confidence: number
}

const data: ComputeEstimate = {
  workload_level: 'small',
  gpu_type: 'CPU-only',
  gpu_count: 0,
  gpu_memory_gb: 0,
  cpu_cores: 4,
  ram_gb: 8,
  estimated_hours: 2,
  cost_sensitivity: 'medium',
  rationale: '需求为基于单一法规文档（约数万字）构建RAG智能客服助手，用于对外服务。知识库规模小，对响应速度要求中等，但强调“效果最好”和“语气专业”，需使用质量较高的嵌入模型和7B左右参数量的对话模型。初期并发量低，无需高性能GPU实时推理，可采用CPU进行向量检索及轻量模型推理，或云端API调用。开发调试为主要耗时。',
  confidence: 0.8,
}

// 颜色映射配置 - 专业设计系统
const themeConfig = {
  workload: {
    small: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Zap },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Server },
    large: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: Server },
  },
  cost: {
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50' },
    high: { color: 'text-rose-600', bg: 'bg-rose-50' },
  },
}

const MetricPill: React.FC<{
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  delay?: number
}> = ({ icon: Icon, label, value, subValue, delay = 0 }) => (
  <div
    className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100
               hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50
               transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-100 shadow-sm
                    flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-100
                    transition-all duration-300"
    >
      <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold text-slate-800 tabular-nums">
          {value}
        </span>
        {subValue && (
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">
            {subValue}
          </span>
        )}
      </div>
    </div>
  </div>
)

const ConfidenceBadge: React.FC<{ value: number }> = ({ value }) => {
  const percentage = Math.round(value * 100)
  const getColor = (v: number) => {
    if (v >= 0.8)
      return 'stroke-emerald-500 text-emerald-600 bg-emerald-50 border-emerald-100'
    if (v >= 0.5)
      return 'stroke-amber-500 text-amber-600 bg-amber-50 border-amber-100'
    return 'stroke-rose-500 text-rose-600 bg-rose-50 border-rose-100'
  }

  const colorClass = getColor(value)
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-100"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClass.split(' ')[0]} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle2 className={`w-4 h-4 ${colorClass.split(' ')[1]}`} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">置信度</span>
        <span className={`text-sm font-bold tabular-nums ${colorClass.split(' ')[1]}`}>
          {percentage}
          %
        </span>
      </div>
    </div>
  )
}

export default function ComputeEstimateBubble() {
  const [showRationale, setShowRationale] = useState(false)
  const est = data

  const workloadStyle = themeConfig.workload[est.workload_level as keyof typeof themeConfig.workload]
    || themeConfig.workload.medium
  const WorkloadIcon = workloadStyle.icon

  const costStyle = themeConfig.cost[est.cost_sensitivity as keyof typeof themeConfig.cost]
    || themeConfig.cost.medium

  return (
    <div className="w-full">
      {/* 气泡容器 - 带有精致的阴影和边框 */}
      <div className="relative w-full animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">

        <div className="relative bg-white overflow-hidden">

          {/* 顶部装饰条 - 动态颜色根据工作负载 */}
          <div
            className={`h-1.5 w-full ${workloadStyle.bg.replace('bg-', 'bg-gradient-to-r from-').replace('50', '400')}`}
            style={{ background: `linear-gradient(90deg, var(--tw-gradient-stops))` }}
          />

          {/* Header 区域 */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${workloadStyle.bg} ${workloadStyle.border} border 
                                flex items-center justify-center shadow-sm`}
                >
                  <WorkloadIcon className={`w-6 h-6 ${workloadStyle.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">算力资源预估</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Compute Resource Estimate</p>
                </div>
              </div>

              {/* 工作负载标签 */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${workloadStyle.bg} border ${workloadStyle.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${workloadStyle.color.replace('text-', 'bg-')}`} />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${workloadStyle.color}`}>
                  {est.workload_level}
                </span>
              </div>
            </div>

            {/* 置信度悬浮标签 */}
            <div className="flex justify-end -mt-2 mb-2">
              <ConfidenceBadge value={est.confidence} />
            </div>
          </div>

          {/* 分割线 */}
          <div className="px-6">
            <div className="h-px bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
          </div>

          {/* 核心指标网格 - 专业排版 2x3 */}
          <div className="p-6 grid grid-cols-2 gap-3">
            <MetricPill
              icon={Server}
              label="GPU 配置"
              value={est.gpu_type}
              subValue={`${est.gpu_count} device${est.gpu_count !== 1 ? 's' : ''}`}
              delay={100}
            />
            <MetricPill
              icon={Cpu}
              label="CPU 核心"
              value={`${est.cpu_cores} Cores`}
              delay={150}
            />
            <MetricPill
              icon={MemoryStick}
              label="内存容量"
              value={`${est.ram_gb} GB`}
              subValue="RAM"
              delay={200}
            />
            <MetricPill
              icon={Clock}
              label="预估耗时"
              value={`${est.estimated_hours}h`}
              subValue="estimated"
              delay={250}
            />
            <MetricPill
              icon={Wallet}
              label="成本敏感"
              value={(
                <span className={`text-xs px-2 py-0.5 rounded-full ${costStyle.bg} ${costStyle.color} border border-current opacity-60`}>
                  {est.cost_sensitivity}
                </span>
              )}
              delay={300}
            />
            <MetricPill
              icon={HardDrive}
              label="显存"
              value={est.gpu_memory_gb === 0 ? '—' : `${est.gpu_memory_gb} GB`}
              subValue={est.gpu_memory_gb === 0 ? 'Shared Memory' : 'VRAM'}
              delay={350}
            />
          </div>

          {/* 分析依据 - 手风琴式展开 */}
          <div className="px-6 pb-6">
            <button
              onClick={() => setShowRationale(!showRationale)}
              className="w-full group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100
                       hover:bg-slate-100/50 hover:border-slate-200 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700">分析依据与建议</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ease-spring
                           ${showRationale ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
              />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showRationale ? 'max-h-48 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-sm text-slate-600 leading-relaxed">
                {est.rationale}
              </div>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="px-6 pb-4 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              系统已自动生成
            </span>
            <span className="tabular-nums">
              ID: EST-
              {Date.now().toString().slice(-6)}
            </span>
          </div>
        </div>
      </div>

      {/* 背景装饰圆点 - 增加空间感 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      </div>
    </div>
  )
}

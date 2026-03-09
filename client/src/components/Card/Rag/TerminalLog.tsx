import * as React from 'react'
import { useEffect } from 'react'
import type { TerminalLogProps } from './types.ts'
import { LOG_LEVEL_COLORS } from './constants.ts'

const TerminalLog: React.FC<TerminalLogProps> = ({ logs, logContainerRef }) => {
  // 当日志更新时自动滚动到底部
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, logContainerRef])

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      {/* macOS 终端风格标题栏 */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-gray-400 text-xs font-mono">
            知识库解析 — Terminal
          </span>
        </div>
      </div>

      {/* 日志内容区域 */}
      <div
        ref={logContainerRef}
        className="p-4 h-48 overflow-y-auto font-mono text-xs leading-relaxed"
        style={{
          fontFamily: '"Menlo", "Monaco", "Courier New", monospace',
          scrollBehavior: 'smooth',
        }}
      >
        {logs.length === 0
          ? (
              <div className="text-gray-500">等待解析开始...</div>
            )
          : (
              <div className="space-y-1">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-gray-500 shrink-0">
                      [{log.timestamp}]
                    </span>
                    <span
                      className={`${LOG_LEVEL_COLORS[log.type]} shrink-0`}
                    >
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
      </div>
    </div>
  )
}

export default TerminalLog

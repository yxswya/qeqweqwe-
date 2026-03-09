import { Copy, File } from 'lucide-react'
import * as React from 'react'
import type { FileParsingModalProps } from './types.ts'
import FileListItem from './FileListItem.tsx'
import TerminalLog from './TerminalLog.tsx'

const FileParsingModal: React.FC<FileParsingModalProps> = ({
  files,
  parseProgress,
  estimatedTime,
  logs,
  logContainerRef,
  onComplete,
}) => {
  return (
    <div className="w-2xl h-auto bg-white shadow-lg rounded-4xl flex flex-col">
      {/* 头部 */}
      <div className="w-full h-21.25 flex justify-between border-b border-[#e2e8f0] shrink-0">
        <div className="flex justify-start gap-3 px-6 py-5.5">
          <div className="bg-[#dbeafe] w-10 h-10 rounded-xl flex justify-center items-center">
            <Copy color="#3b82f6" size={20} />
          </div>
          <div>
            <div className="text-[#1e293b] font-bold text-[16px]">
              启用知识库补齐
            </div>
            <div className="text-[#64748b] text-[14px]">
              上传文档以构建专属知识库，提升模型回答准确率
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6">
        <div className="mb-2 text-[26px] text-center font-bold">
          正在知识库解析...
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#64748b]">
            预计时间:
            {' '}
            {Math.floor(estimatedTime / 60)
              .toString()
              .padStart(2, '0')}
            :
            {(estimatedTime % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[#3b82f6] font-bold">
            {parseProgress.toFixed(2)}
            %
          </span>
        </div>
        <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[#3b82f6] transition-all duration-500 rounded-full"
            style={{ width: `${parseProgress}%` }}
          />
        </div>
        <div className="mb-3 text-[#64748b] text-sm">解析任务队列</div>

        <div className="flex flex-col gap-3 h-45 overflow-auto mb-6">
          {files.map(file => (
            <FileListItem key={file.id} file={file} mode="parse" />
          ))}
        </div>

        {/* 终端风格日志 */}
        <div>
          <div className="mb-3 text-[#64748b] text-sm">解析日志</div>
          <TerminalLog logs={logs} logContainerRef={logContainerRef} />
        </div>
      </div>

      {/* 完成按钮 */}
      {parseProgress === 100 && (
        <div className="border-t border-[#e2e8f0] flex justify-end py-4 px-6 gap-3 shrink-0">
          <div
            className="flex items-center rounded-2xl px-5 bg-[#3b82f6] border border-[#3b82f6] text-white cursor-pointer h-10.5"
            onClick={onComplete}
          >
            完成
          </div>
        </div>
      )}
    </div>
  )
}

export default FileParsingModal

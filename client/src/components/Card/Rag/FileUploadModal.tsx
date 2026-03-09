import type { FileUploadModalProps } from './types.ts'
import { Copy, FilePlus } from 'lucide-react'
import * as React from 'react'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from './constants.ts'
import FileListItem from './FileListItem.tsx'

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  files,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onUploadClick,
  onFileSelect,
  uploadAreaRef,
  fileInputRef,
  onCancel,
  onStartParse,
}) => {
  const allUploaded = files.length > 0 && files.every(f => f.status === 'success')

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
              上传文档 以构建专属知识库，提升模型回答准确率
            </div>
            <div className="text-[#64748b] text-[14px]">
              上传文档以构建专属知识库，提升模型回答准确率
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6">
        <div className="mb-2">上传知识库文档</div>
        <div
          ref={uploadAreaRef}
          className={`border-dashed border-2 rounded-2xl border-[#bfd7fd] bg-[#f7fbff] h-48 mb-6 flex flex-col justify-center cursor-pointer ${dragOver ? 'bg-[#e6f0ff]' : ''}`}
          onClick={onUploadClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="w-16 h-16 bg-white rounded-full flex justify-center items-center mx-auto mb-4">
            <FilePlus size={30} className="text-[#3b82f6]" />
          </div>
          <div className="text-[#3b82f6] flex justify-center mb-1">
            点击或拖拽文件至此处上传
          </div>
          <div className="text-[#64748b] flex justify-center">
            支持 PDF, Word, TXT, Markdown 格式，单个文件不超过
            {' '}
            {MAX_FILE_SIZE / 1024 / 1024}
            MB
          </div>
        </div>
        <div className="mb-3 text-[#64748b] text-sm">上传列表</div>

        <div className="flex flex-col gap-3 h-45 overflow-auto">
          {files.length === 0
            ? (
                <div className="flex justify-center items-center">
                  待上传
                </div>
              )
            : (
                files.map(file => <FileListItem key={file.id} file={file} mode="upload" />)
              )}
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="border-t border-[#e2e8f0] flex justify-end py-4 px-6 gap-3 shrink-0">
        <div
          className="flex items-center rounded-2xl px-5 bg-[#ffffff] border border-[#e2e8f0] cursor-pointer h-10.5"
          onClick={onCancel}
        >
          取消
        </div>
        <div
          className={`flex items-center rounded-2xl px-5 border cursor-pointer h-10.5 ${
            allUploaded
              ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
              : 'bg-[#94a3b8] border-[#94a3b8] text-white cursor-not-allowed'
          }`}
          onClick={onStartParse}
        >
          开始导入并解析
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_FILE_TYPES}
        multiple
        onChange={onFileSelect}
      />
    </div>
  )
}

export default FileUploadModal

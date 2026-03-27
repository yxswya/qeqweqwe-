import type * as React from 'react'
import type { Message } from '@/components/Session/types'
import { FileText, Upload, X } from 'lucide-react'

import { useRef, useState } from 'react'
import { server } from '@/api/modules/session'
import Model from '@/components/Model'
import { useStore } from '@/components/Session/store'

const RagSimple: React.FC<{ message: Message }> = ({ message }) => {
  const { sessionId } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [ragTitle, setRagTitle] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleRagBuild = () => {
    setIsOpen(true)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setRagTitle('')
    setSelectedFiles([])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFiles(prev => [...prev, ...[...files]])
    }
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }, 0)
  }

  const removeFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove))
  }

  const uploadFiles = async () => {
    if (!ragTitle.trim()) {
      alert('请输入知识库名称')
      return
    }

    if (selectedFiles.length === 0) {
      alert('请选择至少一个文件')
      return
    }

    // 保存当前状态后立即关闭弹窗
    const title = ragTitle
    const files = [...selectedFiles]
    handleCloseModal()

    try {
      const datasetFileMetas = files.map(file => ({
        name: file.name,
        task_type: 'rag',
      }))

      const response = await server.api.v1.chat.rag.build({ sessionId }).post({
        title,
        files: files as unknown as File[],
        datasetFileMetas,
      })

      if (response.status === 200) {
        console.log(response.data)
      }
      else {
        console.error('知识库构建失败:', response.error)
      }
    }
    catch (error) {
      console.error('Upload error:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0)
      return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="px-5 pb-2 space-y-4 flex justify-end">
      <span
        onClick={handleRagBuild}
        className="underline text-blue-600 font-bold cursor-pointer text-lg"
      >
        开始构建知识库
      </span>
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />

      <Model
        isOpen={isOpen}
        onClose={handleCloseModal}
        closeOnOverlayClick={true}
        overlayClassName="backdrop-blur-sm"
        contentClassName="!max-w-2xl !w-full !bg-white !shadow-2xl !border-0"
      >
        <div className="space-y-6">
          {/* 标题区域 */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              构建知识库
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              输入知识库名称并上传相关文档
            </p>
          </div>

          {/* 表单区域 */}
          <div className="space-y-5">
            {/* 知识库名称输入 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                知识库名称
              </label>
              <input
                type="text"
                value={ragTitle}
                onChange={e => setRagTitle(e.target.value)}
                placeholder="请输入知识库名称..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-800 font-medium shadow-sm hover:border-slate-300"
              />
            </div>

            {/* 文件上传区域 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                上传文件
              </label>
              <div
                onClick={() => inputRef.current?.click()}
                className="w-full px-6 py-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors duration-300">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      点击选择文件或拖拽文件到此处
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      支持上传多个文件
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 已选文件列表 */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {`已选择 ${selectedFiles.length} 个文件`}
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map(file => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleCloseModal}
              className="px-6 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={uploadFiles}
              className="px-8 py-3 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transform transition-all duration-100 cursor-pointer"
            >
              开始构建
            </button>
          </div>
        </div>
      </Model>
    </div>
  )
}

export default RagSimple

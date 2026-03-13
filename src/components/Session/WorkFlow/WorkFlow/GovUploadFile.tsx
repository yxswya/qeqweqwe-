import type * as React from 'react'

import type { FileResponse } from '../../utils/elysia'

import { Archive, File, FileText, Image, Table, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'

import { useStore } from '@/components/Session/store'

// 文件类型图标映射
function getFileIcon(fileName: string): { icon: React.ReactNode, color: string, bg: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  const iconMap: Record<string, { icon: React.ReactNode, color: string, bg: string }> = {
    pdf: { icon: <FileText size={20} />, color: 'text-red-500', bg: 'bg-red-50' },
    doc: { icon: <FileText size={20} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    docx: { icon: <FileText size={20} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    txt: { icon: <FileText size={20} />, color: 'text-gray-500', bg: 'bg-gray-50' },
    md: { icon: <FileText size={20} />, color: 'text-gray-600', bg: 'bg-gray-50' },
    xls: { icon: <Table size={20} />, color: 'text-green-500', bg: 'bg-green-50' },
    xlsx: { icon: <Table size={20} />, color: 'text-green-500', bg: 'bg-green-50' },
    ppt: { icon: <File size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
    pptx: { icon: <File size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
    jpg: { icon: <Image size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    jpeg: { icon: <Image size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    png: { icon: <Image size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    gif: { icon: <Image size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    zip: { icon: <Archive size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    rar: { icon: <Archive size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  }

  return iconMap[ext] || { icon: <File size={20} />, color: 'text-gray-500', bg: 'bg-gray-50' }
}

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1)
    return '刚刚'
  if (minutes < 60)
    return `${minutes} 分钟前`
  if (hours < 24)
    return `${hours} 小时前`
  if (days < 7)
    return `${days} 天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 单个文件卡片组件
const FileCard: React.FC<{ file: FileResponse }> = ({ file }) => {
  console.log(file)
  const { icon, color, bg } = getFileIcon(file.fileName)

  return (
    <div className="group relative flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* 文件图标 */}
      <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
          {file.fileName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatTime(file.createdAt)}
        </p>
      </div>

      {/* 删除按钮 */}
      <button
        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
        onClick={() => {
          // TODO: 实现删除功能
          console.log('删除文件:', file.id)
        }}
        title="删除文件"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export const GovUploadFile: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { sessionId, files, setStatus } = useStore()

  const handleRagBuild = async () => {
    if (!sessionId) {
      console.log('不在会话中')

      return
    }
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const submit = async (uploadFiles: FileList | null) => {
    if (!uploadFiles || uploadFiles.length === 0)
      return
    const fileArray = [...uploadFiles]
    const formData = new FormData()
    for (let i = 0; i < fileArray.length; i++) {
      formData.append('files', fileArray[i])
    }
    formData.append('message_id', '')
    // 使用 @elysiajs/eden 调用上传接口
    const data = await fetch(`http://localhost:3002/api/v1/governance/${sessionId || ''}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(res => res.json())

    console.log(data)
    setStatus({
      files: [...files, ...data],
    })
  }

  return (
    <div className="space-y-3">
      {/* 上传按钮 */}
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />
      <div className="flex gap-2">
        <button
          onClick={() => handleRagBuild()}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow font-medium text-sm"
        >
          <Upload size={16} />
          上传
        </button>

        {/* 文件计数 */}
        {files.length > 0 && (
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg">
            <span className="text-xs text-gray-500">
              已上传
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {files.length}
            </span>
          </div>
        )}
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}

export default GovUploadFile

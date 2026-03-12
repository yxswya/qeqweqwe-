import type { FileResponse } from '../utils/elysia'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import useStore from '../store'

export const Questions: React.FC = () => {
  const { clarificationQuestions, fetchMessage } = useStore()
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4 shrink-0">
      {
        clarificationQuestions.map((question) => {
          return (
            <div key={question.id} className="space-y-3">
              <p className="text-gray-700 font-medium">{question.question}</p>
              <div className="flex flex-wrap gap-2">
                {question.options.map((opt) => {
                  return (
                    <span
                      key={opt.value}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        fetchMessage(opt.label)
                      }}
                    >
                      {opt.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

// 文件类型图标映射
function getFileIcon(fileName: string): { icon: string, color: string, bg: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  const iconMap: Record<string, { icon: string, color: string, bg: string }> = {
    pdf: { icon: '📄', color: 'text-red-500', bg: 'bg-red-50' },
    doc: { icon: '📝', color: 'text-blue-500', bg: 'bg-blue-50' },
    docx: { icon: '📝', color: 'text-blue-500', bg: 'bg-blue-50' },
    txt: { icon: '📃', color: 'text-gray-500', bg: 'bg-gray-50' },
    md: { icon: '📃', color: 'text-gray-600', bg: 'bg-gray-50' },
    xls: { icon: '📊', color: 'text-green-500', bg: 'bg-green-50' },
    xlsx: { icon: '📊', color: 'text-green-500', bg: 'bg-green-50' },
    ppt: { icon: '📊', color: 'text-orange-500', bg: 'bg-orange-50' },
    pptx: { icon: '📊', color: 'text-orange-500', bg: 'bg-orange-50' },
    jpg: { icon: '🖼️', color: 'text-purple-500', bg: 'bg-purple-50' },
    jpeg: { icon: '🖼️', color: 'text-purple-500', bg: 'bg-purple-50' },
    png: { icon: '🖼️', color: 'text-purple-500', bg: 'bg-purple-50' },
    gif: { icon: '🖼️', color: 'text-purple-500', bg: 'bg-purple-50' },
    zip: { icon: '📦', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    rar: { icon: '📦', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  }

  return iconMap[ext] || { icon: '📁', color: 'text-gray-500', bg: 'bg-gray-50' }
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
  const { icon, color, bg } = getFileIcon(file.fileName)

  return (
    <div className="group relative flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* 文件图标 */}
      <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center text-xl flex-shrink-0`}>
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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

export const InputFile: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { sessionId, files } = useStore()

  const handleRagBuild = async () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const submit = async (files: FileList | null) => {
    if (!files || files.length === 0)
      return
    const fileArray = Array.from(files)
    const formData = new FormData()
    for (let i = 0; i < fileArray.length; i++) {
      formData.append('files', fileArray[i])
    }
    formData.append('message_id', '')
    // 使用 @elysiajs/eden 调用上传接口
    const data = await fetch(`http://localhost:3002/api/v1/governance/${sessionId}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(res => res.json())

    console.log(data)
  }

  return (
    <div className="space-y-3">
      {/* 上传按钮 */}
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />
      <button
        onClick={() => handleRagBuild()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        上传文件
      </button>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-gray-500">已上传文件</span>
            <span className="text-xs text-gray-400">
              {files.length}
              {' '}
              个文件
            </span>
          </div>
          <div className="space-y-2">
            {files.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const { sessionId, status, fetchMessage } = useStore()

  const prevIdRef = useRef(sessionId) // 用 ref 保存上一次的 id

  useEffect(() => {
    const prevId = prevIdRef.current // 旧的 id

    if (prevId !== sessionId) {
      console.log(`id 从 ${prevId} 变为 ${sessionId}`)
      if (sessionId) {
        navigate(`/app/dashboard/${sessionId}`)
      }
      else {
        navigate(`/app/dashboard`)
      }
      // 在这里执行数据获取或其他逻辑
    }

    // 更新 ref 为当前 id，供下次比较
    prevIdRef.current = sessionId
  }, [sessionId]) // 依赖 id，只有 id 变化时才触发

  const handleChat = async () => {
    fetchMessage(value)
  }

  return (
    <div style={{ padding: '20px' }}>
      {status === 'input' && (
        <div className="shrink-0">
          <textarea
            className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={3}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="请输入您的问题..."
          />
          <button
            className="mt-3 w-full block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleChat}
          >
            发送请求
          </button>
        </div>
      )}

      { status === 'questions' && <Questions />}
      <InputFile />
    </div>
  )
}

export default App

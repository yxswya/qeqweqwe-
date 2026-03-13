import type * as React from 'react'
import type { Message } from '@/components/Session/types'
// import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
// import { app } from '@/components/Session/common.ts'
import { useStore } from '@/components/Session/store'

interface UploadedFile {
  name: string
  path: string
  status: 'uploading' | 'success' | 'error' | 'building'
}

const RagSimple: React.FC<{ message: Message }> = ({ message }) => {
  const { sessionId, ragBuildProgress, ragBuildLogs, messages, setStatus } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  // const [logs, setLogs] = useState<string[]>([])

  // 监听 ragBuildProgress 变化，更新文件状态
  useEffect(() => {
    if (!sessionId || uploadedFiles.length === 0)
      return

    // 当构建完成或失败时，更新文件状态
    if (ragBuildProgress?.state === 'succeeded' || ragBuildProgress?.state === 'failed') {
      const newStatus: 'success' | 'error' = ragBuildProgress.state === 'succeeded' ? 'success' : 'error'
      // 使用 setTimeout 避免在 effect 中直接调用 setState
      const timer = setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => ({
          ...f,
          status: f.status === 'building' ? newStatus : f.status,
        })))
      }, 0)

      return () => clearTimeout(timer)
    }

    // 更新日志
    if (ragBuildLogs?.logs && ragBuildLogs.logs.length > 0) {
      const timer = setTimeout(() => {
        // setLogs(ragBuildLogs.logs)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [ragBuildProgress, ragBuildLogs, sessionId, uploadedFiles])

  const handleRagBuild = async () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0)
      return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
  }

  const uploadFiles = async (files: FileList) => {
    const fileArray = [...files]
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0)

    console.log('Selected files:', fileArray.map(f => f.name))
    console.log('Total size:', formatFileSize(totalSize))

    // 初始化上传状态
    const initialFiles: UploadedFile[] = fileArray.map(file => ({
      name: file.name,
      path: '',
      status: 'uploading',
    }))
    setUploadedFiles(initialFiles)

    try {
      const formData = new FormData()
      formData.append('message_id', message.id)
      for (let i = 0; i < fileArray.length; i++) {
        formData.append('files', fileArray[i])
      }
      setLoading(true)
      // 使用 @elysiajs/eden 调用上传接口
      const data = await fetch(`http://101.35.246.159:3002/api/v1/governance/rag/${sessionId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }).then(res => res.json())

      setLoading(false)
      message.rags.push(data)
      setStatus({
        messages: [...messages],
      })
    }
    catch (error) {
      console.error('Upload error:', error)
      setUploadedFiles(prev =>
        prev.map(f => ({ ...f, status: 'error' })),
      )
    }
  }

  const submit = (files: FileList | null) => {
    if (!files || files.length === 0)
      return

    uploadFiles(files).catch(console.error)
  }

  return (
    <div className="px-5 py-4 space-y-4">
      <button
        onClick={() => handleRagBuild()}
        className="group inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[15px] font-medium px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        上传文件即刻构建
      </button>
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />

      <div className="space-y-4">
        {message?.rags?.length > 0 && (
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-[15px] font-semibold text-gray-700">构建记录（点击即可对话）</h3>
          </div>
        )}

        {loading && (
          <div className="space-y-2.5 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <div className="h-2.5 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-75" />
              <div className="h-2.5 w-32 bg-gray-200 rounded-full animate-pulse delay-75" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-150" />
              <div className="h-2.5 w-20 bg-gray-200 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {message?.rags?.map((el, index) => (
            <Link
              key={el.id}
              to={`/app/rag-answer/${el.indexVersion}`}
              className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-blue-50 group transition-colors duration-150"
            >
              <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors">
                {index + 1}
              </span>
              <span className="text-[15px] font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                {el.indexVersion}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RagSimple

import type * as React from 'react'
import type { Message } from '@/components/Session/types.ts'
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [logs, setLogs] = useState<string[]>([])

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
        setLogs(ragBuildLogs.logs)
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
    const fileArray = Array.from(files)
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
      // 使用 @elysiajs/eden 调用上传接口
      const data = await fetch(`http://localhost:3002/api/v1/governance/rag/${sessionId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }).then(res => res.json())

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
    <div className="px-4 py-3">
      <button
        onClick={() => handleRagBuild()}
        className="font-bold underline cursor-pointer hover:text-blue-800 px-3 py-2"
      >
        上传文件即刻构建
      </button>
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />

      <div className="pl-4">
        {
          message?.rags.length > 0 && <h3>构建记录(点击即可对话)</h3>
        }
        {
          message?.rags?.map((el, index) => {
            return (
              <div key={el.id} className="text-lg font-bold">
                <Link className="text-blue-600 underline font-bold" to={`/app/rag-answer/${el.indexVersion}`}>
                  {index + 1}
                  .
                  {el.indexVersion}
                </Link>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default RagSimple

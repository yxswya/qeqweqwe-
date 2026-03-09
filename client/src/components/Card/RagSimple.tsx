import type * as React from 'react'
import type { App } from '../../../../server/src/index'
import { treaty } from '@elysiajs/eden'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/components/WorkFlow/store'

const app = treaty<App>('localhost:3000', {
  fetch: {
    credentials: 'include',
  },
})

interface UploadedFile {
  name: string
  path: string
  status: 'uploading' | 'success' | 'error' | 'building'
}

const STORAGE_KEY = 'rag_build_files'

const RagSimple: React.FC = () => {
  const { sessionId, ragBuildProgress, ragBuildLogs } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const isInitializedRef = useRef(false)

  // 初始化时恢复正在构建的任务
  useEffect(() => {
    if (!sessionId || isInitializedRef.current)
      return

    const initializeFiles = async () => {
      // 从后端获取最新的构建记录
      try {
        const response = await fetch(`http://localhost:3000/api/conversations/${sessionId}/rag/builds`, {
          credentials: 'include',
        })
        const result = await response.json()
        if (result.success && result.data && result.data.length > 0) {
          const latestBuild = result.data[0]
          // 检查是否是异步任务且未完成（通过判断是否有空的 indexUri）
          if (latestBuild.async && !latestBuild.indexUri && latestBuild.runId) {
            // 这是一个正在进行的异步任务
            console.log('发现正在进行的构建任务:', latestBuild.runId)
            setUploadedFiles([{
              name: '构建中...',
              path: '',
              status: 'building',
            }])
          }
        }
      }
      catch (error) {
        console.error('检查构建状态失败:', error)
      }

      isInitializedRef.current = true
    }

    initializeFiles()
  }, [sessionId])

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

  // 调用 RAG 构建接口
  const callRagBuild = async (filePaths: string[]) => {
    if (!sessionId) {
      console.error('No sessionId available')
      return
    }

    setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'building' })))

    try {
      const response = await app.api.conversations({ id: sessionId }).rag.build.post({
        file_paths: filePaths,
      })

      if (response.data?.success) {
        console.log('RAG build initiated:', response.data)
      }
      else {
        console.error('RAG build failed:', response.error)
        setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'error' })))
      }
    }
    catch (error) {
      console.error('RAG build error:', error)
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'error' })))
    }
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
      // 使用 @elysiajs/eden 调用上传接口
      const response = await app.api.upload.post({
        files: fileArray,
      } as any)

      if (response.data?.success) {
        const paths = response.data.data
        console.log('Upload successful:', paths)
        setUploadedFiles(prev =>
          prev.map((f, i) => ({
            ...f,
            path: paths[i],
            status: 'success',
          })),
        )

        // 上传成功后自动调用 RAG 构建
        await callRagBuild(paths)
      }
      else {
        console.error('Upload failed:', response.error)
        setUploadedFiles(prev =>
          prev.map(f => ({ ...f, status: 'error' })),
        )
      }
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

    uploadFiles(files)
  }

  // 根据 ragBuildProgress 更新文件状态
  const getFileStatus = (file: UploadedFile): UploadedFile['status'] => {
    if (file.status !== 'building')
      return file.status

    if (!ragBuildProgress) {
      return 'building'
    }

    if (ragBuildProgress.state === 'succeeded') {
      return 'success'
    }
    else if (ragBuildProgress.state === 'failed') {
      return 'error'
    }
    else {
      return 'building'
    }
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-500'
      case 'building':
        return 'text-orange-500'
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
    }
  }

  const getStatusText = (file: UploadedFile) => {
    const currentStatus = getFileStatus(file)
    switch (currentStatus) {
      case 'uploading':
        return '上传中...'
      case 'building':
        return ragBuildProgress
          ? `${ragBuildProgress.message} ${(ragBuildProgress.progress * 100).toFixed(0)}%`
          : '构建中...'
      case 'success':
        return '✓ 完成'
      case 'error':
        return '✗ 失败'
    }
  }

  return (
    <div className="px-4">
      <button
        onClick={() => handleRagBuild()}
        className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        Rag 构建
      </button>

      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />

      {/* 上传结果展示 */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => {
            const currentStatus = getFileStatus(file)
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-50" title={file.name}>
                    {file.name}
                  </span>
                  <span className={`text-xs font-medium ${getStatusColor(currentStatus)}`}>
                    {getStatusText(file)}
                  </span>
                </div>
                {file.path && (
                  <div className="text-xs text-gray-500 mt-1">
                    {file.path}
                  </div>
                )}
                {/* 构建进度条 */}
                {currentStatus === 'building' && ragBuildProgress && ragBuildProgress.progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ragBuildProgress.progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {/* 构建日志 */}
                {logs.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">构建日志</div>
                    <div className="bg-gray-900 text-gray-100 rounded p-2 max-h-40 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {logs.map((log, i) => (
                          <div key={`${log}-${i}`} className="py-0.5">{log}</div>
                        ))}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RagSimple

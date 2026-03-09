import type * as React from 'react'
import type { App } from '../../../../server/src/index'
import { treaty } from '@elysiajs/eden'
import { useRef, useState } from 'react'
// import { useStore } from '@/components/WorkFlow/store'

const app = treaty<App>('localhost:3000', {
  fetch: {
    credentials: 'include',
  },
})

interface UploadedFile {
  name: string
  path: string
  status: 'uploading' | 'success' | 'error'
}

const RagSimple: React.FC = () => {
  // const { sessionId, fetchRagBuild } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const ragBuild = async () => {
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

    // 使用 FormData 上传
    const formData = new FormData()
    fileArray.forEach((file) => {
      formData.append('files', file)
    })

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

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-500'
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return '上传中...'
      case 'success':
        return '✓ 完成'
      case 'error':
        return '✗ 失败'
    }
  }

  return (
    <div className="px-4">
      <button
        onClick={() => ragBuild()}
        className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        Rag 构建
      </button>

      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />

      {/* 上传结果展示 */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 truncate max-w-50" title={file.name}>
                  {file.name}
                </span>
                <span className={`text-xs font-medium ${getStatusColor(file.status)}`}>
                  {getStatusText(file.status)}
                </span>
              </div>
              {file.path && (
                <div className="text-xs text-gray-500 mt-1">
                  {file.path}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RagSimple

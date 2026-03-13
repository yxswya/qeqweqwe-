import type { UploadFile } from './types.ts'
import * as React from 'react'
import { UPLOAD_PROGRESS_INTERVAL } from './constants.ts'

export interface UseFileUploadReturn {
  files: UploadFile[]
  dragOver: boolean
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  addFiles: (newFiles: FileList | File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>
  simulateUpload: (uploadFile: UploadFile) => void
}

/**
 * 文件上传管理 Hook
 */
export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = React.useState<UploadFile[]>([])
  const [dragOver, setDragOver] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
    // 重置 input 以允许选择相同文件
    e.target.value = ''
  }

  const addFiles = (newFiles: FileList | File[]) => {
    const uploadFiles: UploadFile[] = Array.from(newFiles).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'uploading' as const,
      progress: 0,
    }))

    setFiles(prev => [...prev, ...uploadFiles])

    // 开始模拟上传
    uploadFiles.forEach(simulateUpload)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearFiles = () => {
    setFiles([])
  }

  // 模拟文件上传
  const simulateUpload = (uploadFile: UploadFile) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5 // 每次增加 5-20%
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'success', progress: 100 }
              : f,
          ),
        )
      }
      else {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, progress: Math.min(progress, 99) }
              : f,
          ),
        )
      }
    }, UPLOAD_PROGRESS_INTERVAL)
  }

  return {
    files,
    dragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    addFiles,
    removeFile,
    clearFiles,
    setFiles,
    simulateUpload,
  }
}

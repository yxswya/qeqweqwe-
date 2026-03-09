import { CheckCircle, File } from 'lucide-react'
import * as React from 'react'
import type { FileListItemProps } from './types.ts'

const FileListItem: React.FC<FileListItemProps> = ({ file, mode }) => {
  const renderStatus = () => {
    if (mode === 'upload') {
      switch (file.status) {
        case 'uploading':
          return (
            <span className="text-[#3b82f6] flex items-center">
              <span className="text-[10px]">
                上传中 {file.progress.toFixed(2)}%
              </span>
            </span>
          )
        case 'success':
          return (
            <span className="text-[#16a34a] flex items-center">
              <CheckCircle size={12} />
              {' '}
              <span className="text-[10px]">上传成功</span>
            </span>
          )
        case 'error':
          return (
            <span className="text-[#dc2626] flex items-center">
              <span className="text-[10px]">上传失败</span>
            </span>
          )
      }
    }
    else {
      // mode === 'parse'
      switch (file.parseStatus) {
        case 'parsing':
          return (
            <span className="text-[#3b82f6] flex items-center">
              <span className="text-[10px]">
                解析中 {file.parseProgress?.toFixed(2)}%
              </span>
            </span>
          )
        case 'completed':
          return (
            <span className="text-[#16a34a] flex items-center">
              <CheckCircle size={12} />
              {' '}
              <span className="text-[10px]">解析成功</span>
            </span>
          )
        case 'pending':
          return (
            <span className="text-[#94a3b8] flex items-center">
              <span className="text-[10px]">等待中</span>
            </span>
          )
        case 'failed':
          return (
            <span className="text-[#dc2626] flex items-center">
              <span className="text-[10px]">解析失败</span>
            </span>
          )
      }
    }
  }

  const renderProgressBar = () => {
    if (mode === 'upload') {
      if (file.status === 'uploading') {
        return (
          <div className="w-full h-1 bg-[#e2e8f0] rounded overflow-hidden">
            <div
              className="h-full bg-[#3b82f6] transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )
      }
      if (file.status === 'success') {
        return <div className="w-full h-1 bg-[#16a34a]" />
      }
      if (file.status === 'error') {
        return <div className="w-full h-1 bg-[#dc2626]" />
      }
    }
    else {
      // mode === 'parse'
      if (file.parseStatus === 'parsing') {
        return (
          <div className="w-full h-1 bg-[#e2e8f0] rounded overflow-hidden">
            <div
              className="h-full bg-[#3b82f6] transition-all duration-300"
              style={{ width: `${file.parseProgress}%` }}
            />
          </div>
        )
      }
      if (file.parseStatus === 'completed') {
        return <div className="w-full h-1 bg-[#16a34a]" />
      }
      if (file.parseStatus === 'pending' || file.parseStatus === 'failed') {
        return <div className="w-full h-1 bg-[#e2e8f0]" />
      }
    }
  }

  return (
    <div className="bg-[#f3f6fc] border border-[#e2e8f0] p-3.5 flex gap-3 rounded-xl">
      <div className="bg-[#dbeafe] w-10 h-10 flex justify-center items-center rounded-xl">
        <File size={20} color="#2563eb" />
      </div>
      <div className="flex w-full flex-col justify-between py-1">
        <div className="flex w-full justify-between">
          <span>{file.file.name}</span>
          {renderStatus()}
        </div>
        <div>{renderProgressBar()}</div>
      </div>
    </div>
  )
}

export default FileListItem

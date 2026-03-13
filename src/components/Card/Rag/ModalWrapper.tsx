import * as React from 'react'

interface ModalWrapperProps {
  children: React.ReactNode
}

/**
 * 模态框包装器 - 提供毛玻璃背景和动画效果
 */
const ModalWrapper: React.FC<ModalWrapperProps> = ({ children }) => {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
      style={{
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          animation: 'scaleIn 0.13s ease-out',
        }}
      >
        {children}
      </div>

      {/* 内联样式定义动画 */}
      <style>
        {`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}
      </style>
    </div>
  )
}

export default ModalWrapper

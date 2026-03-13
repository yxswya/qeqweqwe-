import type { ReactNode } from 'react'
import { useEffect } from 'react'
import ReactDOM from 'react-dom'

export interface ModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean
  /** 关闭弹窗的回调（点击遮罩或关闭按钮时触发） */
  onClose: () => void
  /** 弹窗内容 */
  children: ReactNode
  /** 是否允许点击遮罩关闭，默认为 true */
  closeOnOverlayClick?: boolean
  /** 挂载的目标容器，默认为 document.body */
  container?: Element | DocumentFragment
  /** 自定义遮罩层样式类 */
  overlayClassName?: string
  /** 自定义内容区域样式类 */
  contentClassName?: string
}

/**
 * 全屏弹窗组件（使用 Portal 渲染到 body 下）
 */
function Modal({
  isOpen,
  onClose,
  children,
  closeOnOverlayClick = true,
  container = document.body,
  overlayClassName = '',
  contentClassName = '',
}: ModalProps) {
  // 锁定/解锁 body 滚动
  useEffect(() => {
    if (isOpen) {
      // 记录原来的 overflow 和 paddingRight（防止滚动条消失导致页面抖动）
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight

      // 如果已经有滚动条，计算其宽度并设置 paddingRight 补偿
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      document.body.style.overflow = 'hidden'

      return () => {
        // 恢复
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isOpen])

  // 如果弹窗关闭，不渲染任何内容
  if (!isOpen) {
    return null
  }

  // 点击遮罩处理
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // 使用 Portal 将弹窗渲染到指定容器（默认 body）
  return ReactDOM.createPortal(
    <div
      className={`modal-overlay ${overlayClassName}`}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className={`modal-content ${contentClassName}`}
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '24px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* 可选的关闭按钮，用户也可在 children 中自行添加 */}
        <button
          onClick={onClose}
          className="bg-gray-100 w-10 h-10 rounded-full hover:bg-gray-300 duration-150"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
          }}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    container,
  )
}

export default Modal

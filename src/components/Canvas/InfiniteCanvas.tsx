import * as React from 'react'

interface Point {
  x: number
  y: number
}

interface InfiniteCanvasProps {
  children: React.ReactNode
  className?: string
}

interface CanvasContextValue {
  offset: Point
  scale: number
  transform: (point: Point) => Point
  inverseTransform: (point: Point) => Point
}

export const CanvasContext = React.createContext<CanvasContextValue>({
  offset: { x: 0, y: 0 },
  scale: 1,
  transform: p => p,
  inverseTransform: p => p,
})

export const useCanvas = () => React.useContext(CanvasContext)

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ children, className }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  // 初始偏移量让内容居中显示
  const [offset, setOffset] = React.useState<Point>({ x: 300, y: 200 })
  const [scale, setScale] = React.useState(1)
  const [isDragging, setIsDragging] = React.useState(false)
  const dragStartRef = React.useRef<Point>({ x: 0, y: 0 })
  const offsetStartRef = React.useRef<Point>({ x: 0, y: 0 })

  // 将屏幕坐标转换为画布坐标
  const transform = React.useCallback((point: Point): Point => ({
    x: (point.x - offset.x) / scale,
    y: (point.y - offset.y) / scale,
  }), [offset, scale])

  // 将画布坐标转换为屏幕坐标
  const inverseTransform = React.useCallback((point: Point): Point => ({
    x: point.x * scale + offset.x,
    y: point.y * scale + offset.y,
  }), [offset, scale])

  // 处理鼠标按下
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      offsetStartRef.current = { ...offset }
    }
  }, [offset])

  // 处理鼠标移动
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setOffset({
        x: offsetStartRef.current.x + dx,
        y: offsetStartRef.current.y + dy,
      })
    }
  }, [isDragging])

  // 处理鼠标释放
  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  // 处理滚轮缩放
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container)
      return

    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(3, scale * zoomFactor))

    // 缩放时保持鼠标位置不变
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * (newScale / scale),
      y: mouseY - (mouseY - offset.y) * (newScale / scale),
    }

    setScale(newScale)
    setOffset(newOffset)
  }, [scale, offset])

  // 重置视图
  const resetView = React.useCallback(() => {
    setOffset({ x: 50, y: 50 })
    setScale(1)
  }, [])

  const contextValue = React.useMemo(() => ({
    offset,
    scale,
    transform,
    inverseTransform,
  }), [offset, scale, transform, inverseTransform])

  return (
    <CanvasContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className || ''}`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${offset.x}px ${offset.y}px`,
          }}
        />
        {/* 画布内容 */}
        <div
          className="absolute"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {children}
        </div>
        {/* 控制按钮 */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={resetView}
            className="px-3 py-1.5 bg-white rounded-lg shadow-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            重置视图
          </button>
          <div className="px-3 py-1.5 bg-white rounded-lg shadow-md border border-slate-200 text-sm text-slate-600 text-center">
            {Math.round(scale * 100)}%
          </div>
        </div>
      </div>
    </CanvasContext.Provider>
  )
}

export default InfiniteCanvas

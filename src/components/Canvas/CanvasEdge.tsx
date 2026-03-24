import * as React from 'react'

interface CanvasEdgeProps {
  startX: number
  startY: number
  endX: number
  endY: number
  label?: string
  type: 'contains' | 'produces' | 'trains' | 'registers'
}

const edgeTypeConfig = {
  contains: {
    color: '#94a3b8',
    dashArray: '6,4',
    label: '包含',
  },
  produces: {
    color: '#10b981',
    dashArray: '',
    label: '产出',
  },
  trains: {
    color: '#f59e0b',
    dashArray: '',
    label: '训练',
  },
  registers: {
    color: '#6366f1',
    dashArray: '',
    label: '注册',
  },
}

const CanvasEdgeComponent: React.FC<CanvasEdgeProps> = ({
  startX,
  startY,
  endX,
  endY,
  label,
  type,
}) => {
  const config = edgeTypeConfig[type]

  // 计算贝塞尔曲线控制点 - 垂直方向的曲线
  const midY = (startY + endY) / 2
  const controlOffset = Math.abs(endY - startY) * 0.4

  const pathD = `M ${startX} ${startY} C ${startX} ${startY + controlOffset}, ${endX} ${endY - controlOffset}, ${endX} ${endY}`

  // 计算箭头
  const arrowSize = 10
  const angle = Math.atan2(endY - (endY - controlOffset), endX - endX || 0.001)
  const arrowX1 = endX - arrowSize * Math.cos(angle - Math.PI / 6)
  const arrowY1 = endY - arrowSize * Math.sin(angle - Math.PI / 6)
  const arrowX2 = endX - arrowSize * Math.cos(angle + Math.PI / 6)
  const arrowY2 = endY - arrowSize * Math.sin(angle + Math.PI / 6)

  return (
    <g className="group">
      {/* 连线阴影 */}
      <path
        d={pathD}
        fill="none"
        stroke={config.color}
        strokeWidth={4}
        strokeOpacity={0.15}
        strokeDasharray={config.dashArray}
        className="transition-all"
      />
      {/* 连线主体 */}
      <path
        d={pathD}
        fill="none"
        stroke={config.color}
        strokeWidth={2}
        strokeDasharray={config.dashArray}
        className="transition-all"
      />
      {/* 箭头 */}
      <polygon
        points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={config.color}
      />
      {/* 标签背景 */}
      {label && (
        <>
          <rect
            x={startX - 20}
            y={midY - 10}
            width={40}
            height={20}
            rx={10}
            fill="white"
            className="shadow-sm"
          />
          <text
            x={startX}
            y={midY + 4}
            textAnchor="middle"
            className="text-xs font-medium pointer-events-none select-none"
            style={{ fontSize: '11px', fill: config.color }}
          >
            {label}
          </text>
        </>
      )}
    </g>
  )
}

export default CanvasEdgeComponent

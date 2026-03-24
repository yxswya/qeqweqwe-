import type { CanvasEdge as CanvasEdgeType, CanvasNode as CanvasNodeType } from '@/api/modules/canvas'
import * as React from 'react'
import CanvasEdgeComponent from './CanvasEdge'
import CanvasNodeComponent from './CanvasNode'

interface Position {
  x: number
  y: number
}

interface CanvasGraphProps {
  nodes: CanvasNodeType[]
  edges: CanvasEdgeType[]
  onNodeClick?: (node: CanvasNodeType) => void
  selectedNodeId?: string
}

// 布局算法：基于类型的有向层级布局
function layoutGraph(nodes: CanvasNodeType[], edges: CanvasEdgeType[]): Map<string, Position> {
  const positions = new Map<string, Position>()

  if (nodes.length === 0) {
    return positions
  }

  // 构建邻接表
  const children = new Map<string, string[]>()
  const parents = new Map<string, string[]>()

  nodes.forEach((node) => {
    children.set(node.id, [])
    parents.set(node.id, [])
  })

  edges.forEach((edge) => {
    children.get(edge.source)?.push(edge.target)
    parents.get(edge.target)?.push(edge.source)
  })

  // 定义节点类型的层级优先级
  const typeLevel: Record<string, number> = {
    session: 0,
    rag: 1,
    train: 2,
    model: 3,
    file: 1,
  }

  // 按类型和层级分组
  const levelGroups = new Map<number, CanvasNodeType[]>()

  // 先按类型层级分组
  nodes.forEach((node) => {
    const baseLevel = typeLevel[node.type] ?? 1
    if (!levelGroups.has(baseLevel)) {
      levelGroups.set(baseLevel, [])
    }
    levelGroups.get(baseLevel)!.push(node)
  })

  // 对每个层级内的节点按类型排序，确保同类型节点在一起
  levelGroups.forEach((levelNodes) => {
    levelNodes.sort((a, b) => {
      const typeOrder = ['rag', 'file', 'train', 'model']
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    })
  })

  // 计算位置
  const NODE_WIDTH = 200
  const NODE_HEIGHT = 80
  const HORIZONTAL_GAP = 80
  const VERTICAL_GAP = 120
  const START_X = 300
  const START_Y = 100

  // 获取所有层级并排序
  const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b)

  sortedLevels.forEach((level) => {
    const levelNodes = levelGroups.get(level)!

    // 计算该层级的总宽度
    const totalWidth = levelNodes.length * NODE_WIDTH + (levelNodes.length - 1) * HORIZONTAL_GAP
    let currentX = START_X - totalWidth / 2 + NODE_WIDTH / 2

    levelNodes.forEach((node) => {
      positions.set(node.id, {
        x: currentX,
        y: START_Y + level * (NODE_HEIGHT + VERTICAL_GAP),
      })
      currentX += NODE_WIDTH + HORIZONTAL_GAP
    })
  })

  return positions
}

const CanvasGraph: React.FC<CanvasGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
}) => {
  const positions = React.useMemo(() => layoutGraph(nodes, edges), [nodes, edges])

  // 计算画布大小
  const canvasSize = React.useMemo(() => {
    if (positions.size === 0) {
      return { width: 800, height: 600 }
    }

    let maxX = 0
    let maxY = 0

    positions.forEach((pos) => {
      maxX = Math.max(maxX, pos.x + 200)
      maxY = Math.max(maxY, pos.y + 100)
    })

    return { width: Math.max(maxX + 200, 800), height: Math.max(maxY + 200, 600) }
  }, [positions])

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 text-slate-400">
        <p>暂无数据</p>
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
      {/* SVG 层用于绘制连线 */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasSize.width}
        height={canvasSize.height}
      >
        {edges.map((edge) => {
          const startPos = positions.get(edge.source)
          const endPos = positions.get(edge.target)
          if (!startPos || !endPos)
            return null

          return (
            <CanvasEdgeComponent
              key={edge.id}
              startX={startPos.x}
              startY={startPos.y + 50}
              endX={endPos.x}
              endY={endPos.y - 50}
              label={edge.label}
              type={edge.type}
            />
          )
        })}
      </svg>

      {/* 节点层 */}
      {nodes.map((node) => {
        const pos = positions.get(node.id)
        if (!pos)
          return null

        return (
          <CanvasNodeComponent
            key={node.id}
            node={node}
            position={pos}
            isSelected={selectedNodeId === node.id}
            onClick={() => onNodeClick?.(node)}
          />
        )
      })}
    </div>
  )
}

export default CanvasGraph

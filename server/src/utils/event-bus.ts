import { EventEmitter } from 'node:events'

/**
 * 全局单例的事件总线
 * 用于 SSE 推送和跨模块通信
 */
export const eventBus = new EventEmitter()

// 如果并发量大，建议调大最大监听器数量防止报内存泄漏警告
eventBus.setMaxListeners(100)

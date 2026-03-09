/**
 * 生成唯一ID
 * @returns 唯一ID字符串（时间戳 + 随机字符串）
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

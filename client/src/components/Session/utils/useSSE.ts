import { useEffect, useRef, useState } from 'react'

export const ReadyState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
} as const
export type ReadyState = typeof ReadyState[keyof typeof ReadyState]

export interface UseSSEOptions {
  withCredentials?: boolean
  onMessage?: (data: any) => void
  onOpen?: (event: Event) => void
  onError?: (event: Event) => void
  eventTypes?: Record<string, (data: any) => void>
}

export interface UseSSEResult {
  data: any
  error: Event | null
  readyState: ReadyState
  close: () => void
}

export function useSSE(
  url: string | null | undefined,
  options: UseSSEOptions = {},
): UseSSEResult {
  const { withCredentials = false } = options

  // 使用 ref 存储回调，保证 effect 依赖稳定
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Event | null>(null)
  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.CONNECTING)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!url) {
      setReadyState(ReadyState.CLOSED)
      return
    }

    const es = new EventSource(url, { withCredentials })
    eventSourceRef.current = es

    es.onopen = (event) => {
      setReadyState(ReadyState.OPEN)
      setError(null)
      optionsRef.current.onOpen?.(event)
    }

    es.onmessage = (event) => {
      let parsedData: any
      try {
        parsedData = JSON.parse(event.data)
      }
      catch {
        parsedData = event.data
      }
      setData(parsedData)
      optionsRef.current.onMessage?.(parsedData)
    }

    es.onerror = (event) => {
      console.log('eeeeeeeeeeeeeeeee')
      const state = es.readyState === EventSource.CLOSED ? ReadyState.CLOSED : ReadyState.CONNECTING
      setReadyState(state)
      setError(event)
      optionsRef.current.onError?.(event)
      // EventSource 会自动重连，无需额外操作
    }

    // 注册自定义事件
    const currentEventTypes = optionsRef.current.eventTypes
    if (currentEventTypes) {
      Object.entries(currentEventTypes).forEach(([type, callback]) => {
        es.addEventListener(type, (e: MessageEvent) => {
          let parsedData: any
          try {
            parsedData = JSON.parse(e.data)
          }
          catch {
            parsedData = e.data
          }
          callback(parsedData)
        })
      })
    }

    return () => {
      console.log('?????')
      es.close()
      eventSourceRef.current = null
    }
  }, [url, withCredentials]) // 仅依赖 url 和 withCredentials

  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setReadyState(ReadyState.CLOSED)
    }
  }

  return { data, error, readyState, close }
}

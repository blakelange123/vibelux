import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Custom hook for managing memory leaks in React components
 * Provides utilities for cleanup of intervals, timeouts, event listeners, and async operations
 */
export function useMemoryManagement() {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const listenersRef = useRef<Array<{ element: EventTarget; event: string; handler: EventListener }>([])
  const abortControllersRef = useRef<Set<AbortController>>(new Set())
  const animationFramesRef = useRef<Set<number>>(new Set())

  // Safe interval management
  const setManagedInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay)
    intervalsRef.current.add(interval)
    return interval
  }, [])

  const clearManagedInterval = useCallback((interval: NodeJS.Timeout) => {
    clearInterval(interval)
    intervalsRef.current.delete(interval)
  }, [])

  // Safe timeout management
  const setManagedTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      callback()
      timersRef.current.delete(timeout)
    }, delay)
    timersRef.current.add(timeout)
    return timeout
  }, [])

  const clearManagedTimeout = useCallback((timeout: NodeJS.Timeout) => {
    clearTimeout(timeout)
    timersRef.current.delete(timeout)
  }, [])

  // Safe event listener management
  const addManagedEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options)
    listenersRef.current.push({ element, event, handler })
  }, [])

  const removeManagedEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    element.removeEventListener(event, handler)
    listenersRef.current = listenersRef.current.filter(
      listener => !(listener.element === element && listener.event === event && listener.handler === handler)
    )
  }, [])

  // Safe AbortController management for fetch requests
  const createManagedAbortController = useCallback(() => {
    const controller = new AbortController()
    abortControllersRef.current.add(controller)
    
    // Auto-remove when aborted
    controller.signal.addEventListener('abort', () => {
      abortControllersRef.current.delete(controller)
    })
    
    return controller
  }, [])

  // Safe animation frame management
  const requestManagedAnimationFrame = useCallback((callback: FrameRequestCallback) => {
    const id = requestAnimationFrame((time) => {
      callback(time)
      animationFramesRef.current.delete(id)
    })
    animationFramesRef.current.add(id)
    return id
  }, [])

  const cancelManagedAnimationFrame = useCallback((id: number) => {
    cancelAnimationFrame(id)
    animationFramesRef.current.delete(id)
  }, [])

  // Cleanup all managed resources
  const cleanup = useCallback(() => {
    // Clear all intervals
    intervalsRef.current.forEach(interval => clearInterval(interval))
    intervalsRef.current.clear()

    // Clear all timeouts
    timersRef.current.forEach(timeout => clearTimeout(timeout))
    timersRef.current.clear()

    // Remove all event listeners
    listenersRef.current.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    listenersRef.current.splice(0)

    // Abort all pending requests
    abortControllersRef.current.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort()
      }
    })
    abortControllersRef.current.clear()

    // Cancel all animation frames
    animationFramesRef.current.forEach(id => cancelAnimationFrame(id))
    animationFramesRef.current.clear()
  }, [])

  // Automatic cleanup on component unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    // Interval management
    setManagedInterval,
    clearManagedInterval,
    
    // Timeout management
    setManagedTimeout,
    clearManagedTimeout,
    
    // Event listener management
    addManagedEventListener,
    removeManagedEventListener,
    
    // Fetch/AbortController management
    createManagedAbortController,
    
    // Animation frame management
    requestManagedAnimationFrame,
    cancelManagedAnimationFrame,
    
    // Manual cleanup
    cleanup,
    
    // Status getters
    getActiveTimersCount: () => timersRef.current.size,
    getActiveIntervalsCount: () => intervalsRef.current.size,
    getActiveListenersCount: () => listenersRef.current.length,
    getActiveRequestsCount: () => abortControllersRef.current.size,
    getActiveAnimationFramesCount: () => animationFramesRef.current.size,
  }
}

/**
 * Hook for safe async operations with automatic cancellation
 */
export function useSafeAsync() {
  const { createManagedAbortController } = useMemoryManagement()

  const safeAsync = useCallback(async <T>(
    asyncFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    const controller = createManagedAbortController()
    
    try {
      const result = await asyncFn(controller.signal)
      return result
    } catch (error) {
      // Don't throw if the operation was aborted due to component unmount
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }
      throw error
    }
  }, [createManagedAbortController])

  return { safeAsync }
}

/**
 * Hook for safe WebSocket connections with automatic cleanup
 */
export function useSafeWebSocket(url: string | null) {
  const socketRef = useRef<WebSocket | null>(null)
  const { addManagedEventListener } = useMemoryManagement()

  const connect = useCallback(() => {
    if (!url || socketRef.current?.readyState === WebSocket.OPEN) return

    socketRef.current = new WebSocket(url)
    return socketRef.current
  }, [url, addManagedEventListener])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    return disconnect
  }, [disconnect])

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    isConnected: socketRef.current?.readyState === WebSocket.OPEN
  }
}

/**
 * Hook for components that need real-time data updates
 * Automatically manages intervals and prevents memory leaks
 */
export function useRealTimeData<T>(
  fetchData: () => Promise<T> | T,
  interval: number = 5000,
  enabled: boolean = true
) {
  const { setManagedInterval, clearManagedInterval } = useMemoryManagement()
  const { safeAsync } = useSafeAsync()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await safeAsync(async () => {
        return typeof fetchData === 'function' ? await fetchData() : fetchData
      })
      
      if (result !== null) {
        setData(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [fetchData, safeAsync])

  useEffect(() => {
    if (!enabled) return

    let intervalId: NodeJS.Timeout

    // Initial fetch
    updateData()

    // Set up interval for real-time updates
    intervalId = setManagedInterval(updateData, interval)

    return () => {
      if (intervalId) {
        clearManagedInterval(intervalId)
      }
    }
  }, [enabled, interval, updateData, setManagedInterval, clearManagedInterval])

  return { data, loading, error, refetch: updateData }
}
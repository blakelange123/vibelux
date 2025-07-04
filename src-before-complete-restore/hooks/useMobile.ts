import { useState, useEffect } from 'react'
import { useMediaQuery, useBreakpoint } from './useMediaQuery'

interface MobileInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  viewport: {
    width: number
    height: number
  }
  orientation: 'portrait' | 'landscape'
}

export function useMobile(): MobileInfo {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Check if touch device
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }

    // Update viewport dimensions
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }

    checkTouch()
    updateViewport()

    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    viewport,
    orientation
  }
}
'use client'

import { useEffect, useState } from 'react'

interface Room3DWebGLWrapperProps {
  roomDimensions: {
    width: number
    length: number
    height: number
  }
  fixtures: Array<{
    id: string
    x: number
    y: number
    z: number
    rotation: number
    width: number
    length: number
    height: number
    manufacturer: string
    model: string
    wattage: number
    ppe: number
    efficacy: number
    lumens: number
    selected?: boolean
  }>
  tiers?: Array<{
    id: string
    name?: string
    height: number
    benchDepth?: number
    canopyHeight?: number
    color?: string
    visible?: boolean
    enabled?: boolean
    rows?: number
    columns?: number
  }>
  lightIntensityScale?: number
  enableDimming?: boolean
  dimmingLevel?: number
  showTiers?: boolean
  showGrid?: boolean
  showLightBeams?: boolean
  showLabels?: boolean
  showWireframe?: boolean
  cameraPosition?: [number, number, number]
  orbitTarget?: [number, number, number]
}

export function Room3DWebGLWrapper(props: Room3DWebGLWrapperProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    // Dynamically import the component only on client side
    import('./Room3DWebGL').then((mod) => {
      setComponent(() => mod.Room3DWebGL as React.ComponentType<any>)
    })
  }, [])

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading 3D view...</p>
        </div>
      </div>
    )
  }

  return <Component {...props} />
}
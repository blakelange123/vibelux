import { useState, useEffect } from 'react'

interface Design {
  room: {
    width: number
    length: number
    height: number
  }
  fixtures: Array<{
    x: number
    y: number
    z: number
    model?: {
      ppf: number
      beamAngle: number
    }
  }>
}

export function useDesignSync() {
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null)

  useEffect(() => {
    // Listen for design updates
    const handleDesignUpdate = (event: CustomEvent) => {
      const design = event.detail
      setCurrentDesign(design)
      // Store in sessionStorage for other components
      sessionStorage.setItem('currentDesign', JSON.stringify(design))
    }

    // Listen for AI design applications
    const handleAIDesign = (event: CustomEvent) => {
      const design = event.detail
      setCurrentDesign(design)
      sessionStorage.setItem('currentDesign', JSON.stringify(design))
    }

    window.addEventListener('designUpdated' as any, handleDesignUpdate)
    window.addEventListener('applyAIDesign' as any, handleAIDesign)

    // Check for existing design in sessionStorage
    const storedDesign = sessionStorage.getItem('currentDesign')
    if (storedDesign) {
      setCurrentDesign(JSON.parse(storedDesign))
    }

    return () => {
      window.removeEventListener('designUpdated' as any, handleDesignUpdate)
      window.removeEventListener('applyAIDesign' as any, handleAIDesign)
    }
  }, [])

  const updateDesign = (design: Design) => {
    setCurrentDesign(design)
    sessionStorage.setItem('currentDesign', JSON.stringify(design))
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('designUpdated', { detail: design }))
  }

  // Convert design fixtures to format expected by VirtualSensorGrid
  const getFixturesForSensor = () => {
    if (!currentDesign) return []

    return currentDesign.fixtures.map(fixture => ({
      x: fixture.x,
      y: fixture.y,
      z: fixture.z,
      ppf: fixture.model?.ppf || 1000,
      beamAngle: fixture.model?.beamAngle || 120
    }))
  }

  return {
    currentDesign,
    updateDesign,
    getFixturesForSensor,
    roomDimensions: currentDesign ? {
      width: currentDesign.room.width,
      length: currentDesign.room.length,
      height: currentDesign.room.height
    } : null
  }
}
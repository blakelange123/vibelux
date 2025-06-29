'use client'

import { X, Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'
import { Room3DWebGLWrapper } from './Room3DWebGLWrapper'

interface Room3DModalProps {
  isOpen: boolean
  onClose: () => void
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
    model: {
      brand: string
      model: string
      wattage: number
      ppf: number
      beamAngle: number
    }
    enabled: boolean
  }>
  tiers: Array<{
    id: string
    name: string
    height: number
    benchDepth: number
    canopyHeight: number
    color: string
    visible: boolean
    enabled: boolean
  }>
}

export function Room3DModal({
  isOpen,
  onClose,
  roomDimensions,
  fixtures,
  tiers
}: Room3DModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-gray-900 rounded-xl shadow-2xl border border-gray-700 transition-all duration-300 ${
        isFullscreen 
          ? 'w-full h-full m-0 rounded-none' 
          : 'w-[90vw] h-[85vh] max-w-7xl'
      }`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700 rounded-t-xl">
          <h2 className="text-xl font-semibold text-white">3D Room Visualization</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 3D Content */}
        <div className="absolute inset-0 pt-16 rounded-b-xl overflow-hidden">
          <Room3DWebGLWrapper
            roomDimensions={roomDimensions}
            fixtures={fixtures.map(f => ({
              id: f.id,
              x: f.x,
              y: f.y,
              z: f.z,
              rotation: f.rotation,
              width: 0.6,
              length: 0.6,
              height: 0.1,
              manufacturer: f.model.brand,
              model: f.model.model,
              wattage: f.model.wattage,
              ppe: f.model.ppf ? f.model.ppf / f.model.wattage : 2.7,
              efficacy: f.model.ppf ? f.model.ppf / f.model.wattage : 2.7,
              lumens: f.model.ppf ? f.model.ppf * 5 : 8000,
              selected: false
            }))}
            tiers={tiers}
            showGrid={true}
            showLightBeams={true}
            showLabels={false}
            showWireframe={false}
          />
        </div>
      </div>
    </div>
  )
}
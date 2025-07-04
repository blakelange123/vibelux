'use client'

import { useState, useRef, useEffect } from 'react'
import { Zap, RotateCw, Trash2, Settings } from 'lucide-react'

interface DraggableFixtureProps {
  fixture: {
    id: string
    x: number // percentage
    y: number // percentage
    rotation: number
    model: {
      brand: string
      model: string
      wattage: number
      ppf: number
    }
    enabled: boolean
  }
  isSelected: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  onRotate: (id: string, rotation: number) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  containerBounds: DOMRect | null
}

export function DraggableFixture({
  fixture,
  isSelected,
  onSelect,
  onMove,
  onRotate,
  onDelete,
  onToggle,
  containerBounds
}: DraggableFixtureProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showControls, setShowControls] = useState(false)
  const fixtureRef = useRef<HTMLDivElement>(null)

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    onSelect(fixture.id)
    setIsDragging(true)
    setDragStart({
      x: e.clientX - (fixture.x * (containerBounds?.width || 0)),
      y: e.clientY - (fixture.y * (containerBounds?.height || 0))
    })
  }

  // Handle mouse move
  useEffect(() => {
    if (!isDragging || !containerBounds) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = ((e.clientX - dragStart.x) / containerBounds.width) * 100
      const newY = ((e.clientY - dragStart.y) / containerBounds.height) * 100
      
      // Constrain to bounds
      const constrainedX = Math.max(0, Math.min(100, newX))
      const constrainedY = Math.max(0, Math.min(100, newY))
      
      onMove(fixture.id, constrainedX, constrainedY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, fixture.id, onMove, containerBounds])

  // Handle rotation
  const handleRotate = () => {
    const newRotation = (fixture.rotation + 45) % 360
    onRotate(fixture.id, newRotation)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isSelected) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          onDelete(fixture.id)
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRotate()
          break
        case ' ':
          e.preventDefault()
          onToggle(fixture.id)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelected, fixture.id, onDelete, onToggle])

  return (
    <div
      ref={fixtureRef}
      className={`absolute transition-all duration-200 ${isDragging ? 'z-50' : 'z-10'}`}
      style={{
        left: `${fixture.x}%`,
        top: `${fixture.y}%`,
        transform: `translate(-50%, -50%) rotate(${fixture.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isSelected && setShowControls(false)}
    >
      {/* Fixture Body */}
      <div
        className={`relative w-16 h-16 rounded-lg transition-all duration-200 ${
          fixture.enabled 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/50' 
            : 'bg-gray-600'
        } ${
          isSelected 
            ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900' 
            : ''
        } ${
          isDragging ? 'scale-110' : 'hover:scale-105'
        }`}
      >
        <Zap className={`absolute inset-0 m-auto w-8 h-8 ${
          fixture.enabled ? 'text-white' : 'text-gray-400'
        }`} />
        
        {/* Power indicator */}
        {fixture.enabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Info tooltip */}
      {(showControls || isSelected) && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-20 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          <div className="font-medium">{fixture.model.brand} {fixture.model.model}</div>
          <div className="text-gray-400">{fixture.model.wattage}W • {fixture.model.ppf} PPF</div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-800 rotate-45" />
        </div>
      )}

      {/* Control buttons */}
      {(showControls || isSelected) && !isDragging && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-800 rounded-lg p-1 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRotate()
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Rotate (R)"
          >
            <RotateCw className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(fixture.id)
            }}
            className={`p-1.5 rounded transition-colors ${
              fixture.enabled 
                ? 'text-green-400 hover:text-green-300 hover:bg-gray-700' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Toggle On/Off (Space)"
          >
            <Zap className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(fixture.id)
            }}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
            title="Delete (Del)"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useCollaboration } from '@/hooks/useCollaboration'
import { CollaborativeCursors, PresenceAvatars, ActivityIndicator } from './CollaborativeCursors'
import { type User } from '@/lib/collaboration/collaboration-client'
import { 
  Users, 
  MousePointer,
  Move,
  Square,
  Circle,
  Type,
  Trash2,
  Copy,
  Layers
} from 'lucide-react'

interface CanvasObject {
  id: string
  type: 'rect' | 'circle' | 'text' | 'fixture'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  text?: string
  color?: string
  userId?: string
  selected?: boolean
  locked?: boolean
}

interface CollaborativeCanvasProps {
  projectId: string
  initialObjects?: CanvasObject[]
  onChange?: (objects: CanvasObject[]) => void
  readOnly?: boolean
  showPresence?: boolean
  className?: string
}

export function CollaborativeCanvas({
  projectId,
  initialObjects = [],
  onChange,
  readOnly = false,
  showPresence = true,
  className = ''
}: CollaborativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [objects, setObjects] = useState<CanvasObject[]>(initialObjects)
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'text'>('select')
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [activities, setActivities] = useState<Map<string, { user: any; activity: string }>>(new Map())
  
  const {
    isConnected,
    activeUsers,
    cursors,
    sendCursor,
    sendEdit,
    updatePresence
  } = useCollaboration({
    projectId,
    onEdit: (event) => {
      // Handle remote canvas edits
      switch (event.data.type) {
        case 'object-add':
          setObjects(prev => [...prev, event.data.object])
          showActivity(event.userId, 'added an object')
          break
        case 'object-update':
          setObjects(prev => prev.map(obj => 
            obj.id === event.data.id ? { ...obj, ...event.data.updates } : obj
          ))
          showActivity(event.userId, 'updated an object')
          break
        case 'object-delete':
          setObjects(prev => prev.filter(obj => obj.id !== event.data.id))
          showActivity(event.userId, 'deleted an object')
          break
        case 'object-select':
          setObjects(prev => prev.map(obj => ({
            ...obj,
            selected: obj.id === event.data.id && event.userId !== projectId
          })))
          break
      }
    }
  })

  // Show activity indicator
  const showActivity = (userId: string, activity: string) => {
    const user = activeUsers.find(u => u.user.id === userId)
    if (!user) return

    setActivities(prev => {
      const next = new Map(prev)
      next.set(userId, { user: user, activity })
      return next
    })

    // Remove after 3 seconds
    setTimeout(() => {
      setActivities(prev => {
        const next = new Map(prev)
        next.delete(userId)
        return next
      })
    }, 3000)
  }

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw objects
    objects.forEach(obj => {
      ctx.save()

      // Set styles
      if (obj.selected) {
        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
      } else if (obj.locked) {
        ctx.strokeStyle = '#6b7280'
        ctx.lineWidth = 2
      } else {
        ctx.strokeStyle = obj.color || '#60a5fa'
        ctx.lineWidth = 2
      }

      ctx.fillStyle = obj.color ? `${obj.color}20` : '#60a5fa20'

      // Draw shape
      switch (obj.type) {
        case 'rect':
        case 'fixture':
          if (obj.width && obj.height) {
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
            
            if (obj.type === 'fixture') {
              // Draw fixture icon
              ctx.fillStyle = ctx.strokeStyle
              ctx.font = '20px sans-serif'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText('💡', obj.x + obj.width / 2, obj.y + obj.height / 2)
            }
          }
          break

        case 'circle':
          if (obj.radius) {
            ctx.beginPath()
            ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
          }
          break

        case 'text':
          if (obj.text) {
            ctx.font = '16px sans-serif'
            ctx.fillStyle = obj.color || '#ffffff'
            ctx.fillText(obj.text, obj.x, obj.y)
          }
          break
      }

      ctx.restore()
    })
  }, [objects])

  // Update canvas on changes
  useEffect(() => {
    draw()
  }, [draw])

  // Handle mouse events
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Send cursor position
    sendCursor(e.clientX, e.clientY)

    // Handle drawing
    if (isDrawing && tool !== 'select') {
      // Preview drawing
      draw()
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      switch (tool) {
        case 'rect':
          const width = x - drawStart.x
          const height = y - drawStart.y
          ctx.strokeRect(drawStart.x, drawStart.y, width, height)
          break

        case 'circle':
          const radius = Math.sqrt(
            Math.pow(x - drawStart.x, 2) + Math.pow(y - drawStart.y, 2)
          )
          ctx.beginPath()
          ctx.arc(drawStart.x, drawStart.y, radius, 0, Math.PI * 2)
          ctx.stroke()
          break
      }

      ctx.setLineDash([])
    }
  }, [sendCursor, isDrawing, tool, drawStart, draw])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (readOnly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'select') {
      // Check if clicking on an object
      const clickedObject = objects.find(obj => {
        switch (obj.type) {
          case 'rect':
          case 'fixture':
            return obj.width && obj.height &&
              x >= obj.x && x <= obj.x + obj.width &&
              y >= obj.y && y <= obj.y + obj.height

          case 'circle':
            return obj.radius &&
              Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2)) <= obj.radius

          case 'text':
            return Math.abs(x - obj.x) < 50 && Math.abs(y - obj.y) < 20

          default:
            return false
        }
      })

      if (clickedObject) {
        setSelectedObject(clickedObject.id)
        sendEdit({
          type: 'object-select',
          id: clickedObject.id
        })
      } else {
        setSelectedObject(null)
      }
    } else {
      // Start drawing
      setIsDrawing(true)
      setDrawStart({ x, y })
    }
  }, [readOnly, tool, objects, sendEdit])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || readOnly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Create new object
    const newObject: CanvasObject = {
      id: `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      type: tool === 'select' ? 'rect' : tool === 'text' ? 'text' : tool,
      x: drawStart.x,
      y: drawStart.y,
      userId: projectId
    }

    switch (tool) {
      case 'rect':
        newObject.width = Math.abs(x - drawStart.x)
        newObject.height = Math.abs(y - drawStart.y)
        newObject.x = Math.min(drawStart.x, x)
        newObject.y = Math.min(drawStart.y, y)
        break

      case 'circle':
        newObject.radius = Math.sqrt(
          Math.pow(x - drawStart.x, 2) + Math.pow(y - drawStart.y, 2)
        )
        break

      case 'text':
        const text = window.prompt('Enter text:')
        if (!text) {
          setIsDrawing(false)
          return
        }
        newObject.text = text
        break
    }

    // Add object
    setObjects(prev => [...prev, newObject])
    onChange?.([...objects, newObject])

    // Send to other users
    sendEdit({
      type: 'object-add',
      object: newObject
    })

    setIsDrawing(false)
  }, [isDrawing, readOnly, tool, drawStart, projectId, objects, onChange, sendEdit])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (readOnly) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedObject) return

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          setObjects(prev => prev.filter(obj => obj.id !== selectedObject))
          sendEdit({
            type: 'object-delete',
            id: selectedObject
          })
          setSelectedObject(null)
          break

        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const objToDuplicate = objects.find(obj => obj.id === selectedObject)
            if (objToDuplicate) {
              const newObject = {
                ...objToDuplicate,
                id: `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                x: objToDuplicate.x + 20,
                y: objToDuplicate.y + 20
              }
              setObjects(prev => [...prev, newObject])
              sendEdit({
                type: 'object-add',
                object: newObject
              })
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [readOnly, selectedObject, objects, sendEdit])

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 rounded-t-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Tools */}
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded ${tool === 'select' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Select"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded ${tool === 'rect' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded ${tool === 'circle' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded ${tool === 'text' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Text"
          >
            <Type className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-700 mx-2" />

          {/* Object count */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Layers className="w-4 h-4" />
            {objects.length} objects
          </div>
        </div>

        {/* Presence */}
        {showPresence && activeUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <PresenceAvatars users={activeUsers} />
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="relative bg-gray-900 rounded-b-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => sendCursor(-100, -100)}
        />

        {/* Collaborative Cursors */}
        <CollaborativeCursors 
          cursors={cursors} 
          users={activeUsers}
        />

        {/* Activity Indicators */}
        <div className="absolute bottom-4 left-4 space-y-2">
          {Array.from(activities.values()).map(({ user, activity }) => (
            <ActivityIndicator
              key={user.user.id}
              user={user}
              activity={activity}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
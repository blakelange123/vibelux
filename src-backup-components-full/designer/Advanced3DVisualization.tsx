"use client"
import { useEffect, useRef, useState } from 'react'
import { 
  Maximize, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers,
  Sun,
  Eye,
  Settings,
  Grid3x3,
  Move3d,
  X
} from 'lucide-react'

interface Fixture {
  id: string
  x: number
  y: number
  z?: number
  width: number
  height: number
  power: number
  ppfd: number
  spectrum: any
  beamAngle?: number
  mountingHeight?: number
}

interface Room {
  width: number
  length: number
  height: number
  layers?: number
  layerSpacing?: number
}

interface RoomObject {
  id: string
  type: 'fixture' | 'plant' | 'bench' | 'rack' | 'underCanopy' | 'window' | 'greenhouse' | 'emergencyFixture' | 'exitDoor' | 'egressPath' | 'obstacle' | 'wall' | 'hvacFan'
  x: number
  y: number
  z: number
  width: number
  length: number
  height: number
  rotation?: number
}

interface Advanced3DVisualizationProps {
  room: Room
  fixtures: Fixture[]
  objects?: RoomObject[]
  showPPFDMap?: boolean
  showThermalMap?: boolean
  viewMode: '3d' | 'ppfd' | 'thermal' | 'layers'
  onViewModeChange: (mode: '3d' | 'ppfd' | 'thermal' | 'layers') => void
  onClose?: () => void
}

export function Advanced3DVisualization({
  room,
  fixtures,
  objects = [],
  showPPFDMap = false,
  showThermalMap = false,
  viewMode,
  onViewModeChange,
  onClose
}: Advanced3DVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    z: 5,
    rotX: -30,
    rotY: 45,
    zoom: 1
  })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  const [ppfdData, setPpfdData] = useState<number[][]>([])
  const [thermalData, setThermalData] = useState<number[][]>([])

  // Calculate PPFD grid data
  useEffect(() => {
    calculatePPFDGrid()
    calculateThermalGrid()
  }, [fixtures, room])

  const calculatePPFDGrid = () => {
    if (!room || !room.width || !room.length) return;
    
    const gridSize = 50
    const stepX = room.width / gridSize
    const stepY = room.length / gridSize
    const newPpfdData: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      const row: number[] = []
      for (let j = 0; j < gridSize; j++) {
        const x = j * stepX
        const y = i * stepY
        let totalPPFD = 0

        fixtures.forEach(fixture => {
          const distance = Math.sqrt(
            Math.pow(x - fixture.x, 2) + 
            Math.pow(y - fixture.y, 2) + 
            Math.pow((fixture.z || room.height * 0.9) - 0, 2)
          )
          
          // Inverse square law with beam angle consideration
          const beamAngle = (fixture.beamAngle || 120) * Math.PI / 180
          const cosAngle = Math.abs((fixture.z || room.height * 0.9)) / distance
          const angleAttenuation = cosAngle > Math.cos(beamAngle / 2) ? 
            Math.pow(cosAngle, 2) : 0

          if (distance > 0) {
            const ppfdContribution = (fixture.ppfd || 400) * angleAttenuation / Math.pow(distance, 2)
            totalPPFD += ppfdContribution
          }
        })

        row.push(Math.min(totalPPFD, 2000)) // Cap at reasonable max
      }
      newPpfdData.push(row)
    }
    setPpfdData(newPpfdData)
  }

  const calculateThermalGrid = () => {
    if (!room || !room.width || !room.length) return;
    
    const gridSize = 30
    const stepX = room.width / gridSize
    const stepY = room.length / gridSize
    const newThermalData: number[][] = []

    for (let i = 0; i < gridSize; i++) {
      const row: number[] = []
      for (let j = 0; j < gridSize; j++) {
        const x = j * stepX
        const y = i * stepY
        let totalHeat = 0

        fixtures.forEach(fixture => {
          const distance = Math.sqrt(
            Math.pow(x - fixture.x, 2) + 
            Math.pow(y - fixture.y, 2) + 
            Math.pow((fixture.z || room.height * 0.9) - 0, 2)
          )
          
          // Heat dissipation modeling (simplified)
          const heatOutput = fixture.power * 0.8 // 80% heat, 20% light efficiency
          if (distance > 0) {
            const heatContribution = heatOutput / (4 * Math.PI * Math.pow(distance, 2))
            totalHeat += heatContribution
          }
        })

        row.push(totalHeat + 22) // Base room temperature 22°C
      }
      newThermalData.push(row)
    }
    setThermalData(newThermalData)
  }

  const draw3D = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)

    // Set up projection
    const centerX = width / 2
    const centerY = height / 2
    const scale = camera.zoom * 20

    // Helper function for 3D to 2D projection
    const project = (x: number, y: number, z: number) => {
      // Simple isometric projection with rotation
      const radX = camera.rotX * Math.PI / 180
      const radY = camera.rotY * Math.PI / 180

      // Apply rotation
      const cosY = Math.cos(radY)
      const sinY = Math.sin(radY)
      const cosX = Math.cos(radX)
      const sinX = Math.sin(radX)

      const x1 = x * cosY - z * sinY
      const z1 = x * sinY + z * cosY
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX

      return {
        x: centerX + x1 * scale,
        y: centerY - y1 * scale,
        z: z2
      }
    }

    // Draw room outline
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 2
    const roomCorners = [
      project(0, 0, 0),
      project(room.width, 0, 0),
      project(room.width, room.length, 0),
      project(0, room.length, 0),
      project(0, 0, room.height),
      project(room.width, 0, room.height),
      project(room.width, room.length, room.height),
      project(0, room.length, room.height)
    ]

    // Draw floor
    ctx.beginPath()
    ctx.moveTo(roomCorners[0].x, roomCorners[0].y)
    ctx.lineTo(roomCorners[1].x, roomCorners[1].y)
    ctx.lineTo(roomCorners[2].x, roomCorners[2].y)
    ctx.lineTo(roomCorners[3].x, roomCorners[3].y)
    ctx.closePath()
    ctx.stroke()

    // Draw ceiling
    ctx.beginPath()
    ctx.moveTo(roomCorners[4].x, roomCorners[4].y)
    ctx.lineTo(roomCorners[5].x, roomCorners[5].y)
    ctx.lineTo(roomCorners[6].x, roomCorners[6].y)
    ctx.lineTo(roomCorners[7].x, roomCorners[7].y)
    ctx.closePath()
    ctx.stroke()

    // Draw vertical edges
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(roomCorners[i].x, roomCorners[i].y)
      ctx.lineTo(roomCorners[i + 4].x, roomCorners[i + 4].y)
      ctx.stroke()
    }

    // Draw multi-layer structures if enabled
    if (room.layers && room.layers > 1) {
      for (let layer = 1; layer < room.layers; layer++) {
        const layerHeight = (room.height / room.layers) * layer
        ctx.strokeStyle = '#6B7280'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        
        const layerCorners = [
          project(0, 0, layerHeight),
          project(room.width, 0, layerHeight),
          project(room.width, room.length, layerHeight),
          project(0, room.length, layerHeight)
        ]

        ctx.beginPath()
        ctx.moveTo(layerCorners[0].x, layerCorners[0].y)
        ctx.lineTo(layerCorners[1].x, layerCorners[1].y)
        ctx.lineTo(layerCorners[2].x, layerCorners[2].y)
        ctx.lineTo(layerCorners[3].x, layerCorners[3].y)
        ctx.closePath()
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Draw PPFD false color mapping
    if (viewMode === 'ppfd' && ppfdData.length > 0) {
      const gridSize = ppfdData.length
      const stepX = room.width / gridSize
      const stepY = room.length / gridSize

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const ppfd = ppfdData[i][j]
          const intensity = Math.min(ppfd / 1000, 1) // Normalize to 0-1
          
          // False color mapping: blue -> green -> yellow -> red
          let r, g, b
          if (intensity < 0.25) {
            r = 0
            g = Math.floor(intensity * 4 * 255)
            b = 255
          } else if (intensity < 0.5) {
            r = 0
            g = 255
            b = Math.floor((0.5 - intensity) * 4 * 255)
          } else if (intensity < 0.75) {
            r = Math.floor((intensity - 0.5) * 4 * 255)
            g = 255
            b = 0
          } else {
            r = 255
            g = Math.floor((1 - intensity) * 4 * 255)
            b = 0
          }

          const alpha = 0.7
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`

          const corners = [
            project(j * stepX, i * stepY, 0),
            project((j + 1) * stepX, i * stepY, 0),
            project((j + 1) * stepX, (i + 1) * stepY, 0),
            project(j * stepX, (i + 1) * stepY, 0)
          ]

          ctx.beginPath()
          ctx.moveTo(corners[0].x, corners[0].y)
          ctx.lineTo(corners[1].x, corners[1].y)
          ctx.lineTo(corners[2].x, corners[2].y)
          ctx.lineTo(corners[3].x, corners[3].y)
          ctx.closePath()
          ctx.fill()
        }
      }
    }

    // Draw thermal mapping
    if (viewMode === 'thermal' && thermalData.length > 0) {
      const gridSize = thermalData.length
      const stepX = room.width / gridSize
      const stepY = room.length / gridSize

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const temp = thermalData[i][j]
          const intensity = Math.min((temp - 22) / 20, 1) // 22-42°C range
          
          // Thermal color mapping: blue (cool) -> red (hot)
          const r = Math.floor(intensity * 255)
          const g = 0
          const b = Math.floor((1 - intensity) * 255)

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`

          const corners = [
            project(j * stepX, i * stepY, 0),
            project((j + 1) * stepX, i * stepY, 0),
            project((j + 1) * stepX, (i + 1) * stepY, 0),
            project(j * stepX, (i + 1) * stepY, 0)
          ]

          ctx.beginPath()
          ctx.moveTo(corners[0].x, corners[0].y)
          ctx.lineTo(corners[1].x, corners[1].y)
          ctx.lineTo(corners[2].x, corners[2].y)
          ctx.lineTo(corners[3].x, corners[3].y)
          ctx.closePath()
          ctx.fill()
        }
      }
    }

    // Draw all objects
    objects.forEach((obj, index) => {
      if (obj.type === 'fixture') {
        // Draw fixture with light cone
        const fixture = fixtures.find(f => f.id === obj.id)
        if (!fixture) return
        
        const fixtureZ = obj.z || room.height * 0.9
        const projected = project(obj.x, obj.y, fixtureZ)
        
        // Draw fixture as rectangle
        ctx.fillStyle = viewMode === 'thermal' ? '#FFD700' : '#FBBF24'
        ctx.strokeStyle = '#F59E0B'
        ctx.lineWidth = 2

        const fixtureWidth = obj.width || 2
        const fixtureLength = obj.length || 4

        const fixtureCorners = [
          project(obj.x - fixtureWidth/2, obj.y - fixtureLength/2, fixtureZ),
          project(obj.x + fixtureWidth/2, obj.y - fixtureLength/2, fixtureZ),
          project(obj.x + fixtureWidth/2, obj.y + fixtureLength/2, fixtureZ),
          project(obj.x - fixtureWidth/2, obj.y + fixtureLength/2, fixtureZ)
        ]

        ctx.beginPath()
        ctx.moveTo(fixtureCorners[0].x, fixtureCorners[0].y)
        ctx.lineTo(fixtureCorners[1].x, fixtureCorners[1].y)
        ctx.lineTo(fixtureCorners[2].x, fixtureCorners[2].y)
        ctx.lineTo(fixtureCorners[3].x, fixtureCorners[3].y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Draw light cone for visualization
        if (viewMode === '3d' || viewMode === 'ppfd') {
          const beamAngle = (fixture.beamAngle || 120) * Math.PI / 180
          const coneRadius = fixtureZ * Math.tan(beamAngle / 2)
          
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)'
          ctx.lineWidth = 1
          
          // Draw cone outline
          const coneCorners = [
            project(obj.x - coneRadius, obj.y - coneRadius, 0),
            project(obj.x + coneRadius, obj.y - coneRadius, 0),
            project(obj.x + coneRadius, obj.y + coneRadius, 0),
            project(obj.x - coneRadius, obj.y + coneRadius, 0)
          ]

          // Connect fixture to cone base
          ctx.beginPath()
          ctx.moveTo(projected.x, projected.y)
          ctx.lineTo(coneCorners[0].x, coneCorners[0].y)
          ctx.moveTo(projected.x, projected.y)
          ctx.lineTo(coneCorners[1].x, coneCorners[1].y)
          ctx.moveTo(projected.x, projected.y)
          ctx.lineTo(coneCorners[2].x, coneCorners[2].y)
          ctx.moveTo(projected.x, projected.y)
          ctx.lineTo(coneCorners[3].x, coneCorners[3].y)
          ctx.stroke()
        }

        // Label fixtures
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '12px Inter'
        ctx.fillText(`F${index + 1}`, projected.x + 10, projected.y - 10)
      } else if (obj.type === 'bench') {
        // Draw bench
        const projected = project(obj.x, obj.y, obj.z)
        
        ctx.fillStyle = '#8B4513'
        ctx.strokeStyle = '#654321'
        ctx.lineWidth = 2

        const corners = [
          project(obj.x - obj.width/2, obj.y - obj.length/2, obj.z),
          project(obj.x + obj.width/2, obj.y - obj.length/2, obj.z),
          project(obj.x + obj.width/2, obj.y + obj.length/2, obj.z),
          project(obj.x - obj.width/2, obj.y + obj.length/2, obj.z),
          project(obj.x - obj.width/2, obj.y - obj.length/2, obj.z + obj.height),
          project(obj.x + obj.width/2, obj.y - obj.length/2, obj.z + obj.height),
          project(obj.x + obj.width/2, obj.y + obj.length/2, obj.z + obj.height),
          project(obj.x - obj.width/2, obj.y + obj.length/2, obj.z + obj.height)
        ]

        // Draw top
        ctx.beginPath()
        ctx.moveTo(corners[4].x, corners[4].y)
        ctx.lineTo(corners[5].x, corners[5].y)
        ctx.lineTo(corners[6].x, corners[6].y)
        ctx.lineTo(corners[7].x, corners[7].y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Draw legs
        for (let i = 0; i < 4; i++) {
          ctx.beginPath()
          ctx.moveTo(corners[i].x, corners[i].y)
          ctx.lineTo(corners[i + 4].x, corners[i + 4].y)
          ctx.stroke()
        }
      } else if (obj.type === 'plant') {
        // Draw plant/canopy
        const projected = project(obj.x, obj.y, obj.z + obj.height/2)
        
        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)'
        ctx.strokeStyle = '#16A34A'
        ctx.lineWidth = 2

        const corners = [
          project(obj.x - obj.width/2, obj.y - obj.length/2, obj.z),
          project(obj.x + obj.width/2, obj.y - obj.length/2, obj.z),
          project(obj.x + obj.width/2, obj.y + obj.length/2, obj.z),
          project(obj.x - obj.width/2, obj.y + obj.length/2, obj.z)
        ]

        ctx.beginPath()
        ctx.moveTo(corners[0].x, corners[0].y)
        ctx.lineTo(corners[1].x, corners[1].y)
        ctx.lineTo(corners[2].x, corners[2].y)
        ctx.lineTo(corners[3].x, corners[3].y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Label
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '12px Inter'
        ctx.fillText('Plant', projected.x + 10, projected.y - 10)
      } else if (obj.type === 'rack') {
        // Draw vertical rack
        const projected = project(obj.x, obj.y, obj.z)
        
        ctx.strokeStyle = '#6B7280'
        ctx.lineWidth = 2

        // Draw rack frame
        const corners = [
          project(obj.x - obj.width/2, obj.y - obj.length/2, obj.z),
          project(obj.x + obj.width/2, obj.y - obj.length/2, obj.z),
          project(obj.x + obj.width/2, obj.y + obj.length/2, obj.z),
          project(obj.x - obj.width/2, obj.y + obj.length/2, obj.z),
          project(obj.x - obj.width/2, obj.y - obj.length/2, obj.z + obj.height),
          project(obj.x + obj.width/2, obj.y - obj.length/2, obj.z + obj.height),
          project(obj.x + obj.width/2, obj.y + obj.length/2, obj.z + obj.height),
          project(obj.x - obj.width/2, obj.y + obj.length/2, obj.z + obj.height)
        ]

        // Draw frame
        for (let i = 0; i < 4; i++) {
          ctx.beginPath()
          ctx.moveTo(corners[i].x, corners[i].y)
          ctx.lineTo(corners[i + 4].x, corners[i + 4].y)
          ctx.stroke()
        }

        // Draw shelves
        const shelves = 4
        for (let i = 1; i < shelves; i++) {
          const shelfHeight = obj.z + (obj.height / shelves) * i
          const shelfCorners = [
            project(obj.x - obj.width/2, obj.y - obj.length/2, shelfHeight),
            project(obj.x + obj.width/2, obj.y - obj.length/2, shelfHeight),
            project(obj.x + obj.width/2, obj.y + obj.length/2, shelfHeight),
            project(obj.x - obj.width/2, obj.y + obj.length/2, shelfHeight)
          ]
          
          ctx.strokeStyle = '#9CA3AF'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(shelfCorners[0].x, shelfCorners[0].y)
          ctx.lineTo(shelfCorners[1].x, shelfCorners[1].y)
          ctx.lineTo(shelfCorners[2].x, shelfCorners[2].y)
          ctx.lineTo(shelfCorners[3].x, shelfCorners[3].y)
          ctx.closePath()
          ctx.stroke()
        }
      }
    })

    // Old fixture drawing code - remove this section
    fixtures.forEach((fixture, index) => {
      const fixtureZ = fixture.z || room.height * 0.9
      const projected = project(fixture.x, fixture.y, fixtureZ)
      
      // Draw fixture as rectangle
      ctx.fillStyle = viewMode === 'thermal' ? '#FFD700' : '#FBBF24'
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2

      const fixtureWidth = fixture.width || 2
      const fixtureHeight = fixture.height || 1

      const fixtureCorners = [
        project(fixture.x - fixtureWidth/2, fixture.y - fixtureHeight/2, fixtureZ),
        project(fixture.x + fixtureWidth/2, fixture.y - fixtureHeight/2, fixtureZ),
        project(fixture.x + fixtureWidth/2, fixture.y + fixtureHeight/2, fixtureZ),
        project(fixture.x - fixtureWidth/2, fixture.y + fixtureHeight/2, fixtureZ)
      ]

      ctx.beginPath()
      ctx.moveTo(fixtureCorners[0].x, fixtureCorners[0].y)
      ctx.lineTo(fixtureCorners[1].x, fixtureCorners[1].y)
      ctx.lineTo(fixtureCorners[2].x, fixtureCorners[2].y)
      ctx.lineTo(fixtureCorners[3].x, fixtureCorners[3].y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw light cone for visualization
      if (viewMode === '3d' || viewMode === 'ppfd') {
        const beamAngle = (fixture.beamAngle || 120) * Math.PI / 180
        const coneRadius = fixtureZ * Math.tan(beamAngle / 2)
        
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)'
        ctx.lineWidth = 1
        
        // Draw cone outline
        const coneCorners = [
          project(fixture.x - coneRadius, fixture.y - coneRadius, 0),
          project(fixture.x + coneRadius, fixture.y - coneRadius, 0),
          project(fixture.x + coneRadius, fixture.y + coneRadius, 0),
          project(fixture.x - coneRadius, fixture.y + coneRadius, 0)
        ]

        // Connect fixture to cone base
        ctx.beginPath()
        ctx.moveTo(projected.x, projected.y)
        ctx.lineTo(coneCorners[0].x, coneCorners[0].y)
        ctx.moveTo(projected.x, projected.y)
        ctx.lineTo(coneCorners[1].x, coneCorners[1].y)
        ctx.moveTo(projected.x, projected.y)
        ctx.lineTo(coneCorners[2].x, coneCorners[2].y)
        ctx.moveTo(projected.x, projected.y)
        ctx.lineTo(coneCorners[3].x, coneCorners[3].y)
        ctx.stroke()
      }

      // Label fixtures
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '12px Inter'
      ctx.fillText(`F${index + 1}`, projected.x + 10, projected.y - 10)
    })

    // Draw axis indicators
    ctx.strokeStyle = '#EF4444'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(50, height - 80)
    ctx.lineTo(100, height - 80)
    ctx.stroke()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '12px Inter'
    ctx.fillText('X', 105, height - 75)

    ctx.strokeStyle = '#10B981'
    ctx.beginPath()
    ctx.moveTo(50, height - 80)
    ctx.lineTo(50, height - 130)
    ctx.stroke()
    ctx.fillText('Y', 45, height - 135)

    ctx.strokeStyle = '#3B82F6'
    ctx.beginPath()
    ctx.moveTo(50, height - 80)
    ctx.lineTo(30, height - 100)
    ctx.stroke()
    ctx.fillText('Z', 25, height - 105)
  }

  // Animation loop
  useEffect(() => {
    const animate = () => {
      draw3D()
      requestAnimationFrame(animate)
    }
    animate()
  }, [camera, room, fixtures, viewMode, ppfdData, thermalData])

  // Mouse handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMouse.x
    const deltaY = e.clientY - lastMouse.y

    setCamera(prev => ({
      ...prev,
      rotY: prev.rotY + deltaX * 0.5,
      rotX: Math.max(-90, Math.min(90, prev.rotX + deltaY * 0.5))
    }))

    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom - e.deltaY * 0.001))
    }))
  }

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      {/* View Mode Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {[
          { id: '3d', label: '3D View', icon: Move3d },
          { id: 'ppfd', label: 'PPFD Map', icon: Sun },
          { id: 'thermal', label: 'Thermal', icon: Layers },
          { id: 'layers', label: 'Layers', icon: Grid3x3 }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => onViewModeChange(mode.id as any)}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              viewMode === mode.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <mode.icon className="w-4 h-4" />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Camera Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
          className="p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom / 1.2) }))}
          className="p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCamera({ x: 0, y: 0, z: 5, rotX: -30, rotY: 45, zoom: 1 })}
          className="p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend for PPFD/Thermal views */}
      {(viewMode === 'ppfd' || viewMode === 'thermal') && (
        <div className="absolute bottom-4 left-4 z-10 bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-300 mb-2">
            {viewMode === 'ppfd' ? 'PPFD (μmol/m²/s)' : 'Temperature (°C)'}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-4 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded"></div>
            <div className="text-xs text-gray-400">
              {viewMode === 'ppfd' ? '0 → 1000+' : '22 → 42°C'}
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-gray-500">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
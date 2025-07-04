"use client"

import { useEffect, useRef } from 'react'
import { Grid3x3 } from 'lucide-react'

interface VerticalFarmLayout3DProps {
  roomDimensions: {
    width: number
    length: number
    height: number
  }
  rackConfig: {
    width: number
    length: number
    height: number
    tiers: number
  }
  layout: {
    racksPerRow: number
    rowCount: number
    totalRacks: number
    aisleWidth: number
  }
}

export function VerticalFarmLayout3D({ roomDimensions, rackConfig, layout }: VerticalFarmLayout3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const rotationRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const cameraRef = useRef({ rotX: 0.3, rotY: 0.5, zoom: 1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // 3D to 2D projection function
    const project3D = (x: number, y: number, z: number) => {
      const scale = canvas.height * 0.4 * cameraRef.current.zoom
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Apply rotation
      const rotX = cameraRef.current.rotX
      const rotY = cameraRef.current.rotY
      
      // Rotate around Y axis
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)
      const x1 = x * cosY - z * sinY
      const z1 = x * sinY + z * cosY

      // Rotate around X axis
      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX

      // Project to 2D
      const perspective = 1 / (1 + z2 * 0.001)
      const px = centerX + x1 * scale * perspective
      const py = centerY - y1 * scale * perspective

      return { x: px, y: py, z: z2 }
    }

    // Draw a 3D box
    const drawBox = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, opacity: number = 1) => {
      ctx.save()
      ctx.globalAlpha = opacity

      // Define vertices
      const vertices = [
        { x: x - w/2, y: y - h/2, z: z - d/2 }, // 0: front bottom left
        { x: x + w/2, y: y - h/2, z: z - d/2 }, // 1: front bottom right
        { x: x + w/2, y: y + h/2, z: z - d/2 }, // 2: front top right
        { x: x - w/2, y: y + h/2, z: z - d/2 }, // 3: front top left
        { x: x - w/2, y: y - h/2, z: z + d/2 }, // 4: back bottom left
        { x: x + w/2, y: y - h/2, z: z + d/2 }, // 5: back bottom right
        { x: x + w/2, y: y + h/2, z: z + d/2 }, // 6: back top right
        { x: x - w/2, y: y + h/2, z: z + d/2 }, // 7: back top left
      ]

      // Project vertices to 2D
      const projected = vertices.map(v => project3D(v.x, v.y, v.z))

      // Sort faces by depth for proper rendering
      const faces = [
        { indices: [0, 1, 2, 3], z: (projected[0].z + projected[1].z + projected[2].z + projected[3].z) / 4 }, // front
        { indices: [4, 5, 6, 7], z: (projected[4].z + projected[5].z + projected[6].z + projected[7].z) / 4 }, // back
        { indices: [0, 3, 7, 4], z: (projected[0].z + projected[3].z + projected[7].z + projected[4].z) / 4 }, // left
        { indices: [1, 2, 6, 5], z: (projected[1].z + projected[2].z + projected[6].z + projected[5].z) / 4 }, // right
        { indices: [3, 2, 6, 7], z: (projected[3].z + projected[2].z + projected[6].z + projected[7].z) / 4 }, // top
        { indices: [0, 1, 5, 4], z: (projected[0].z + projected[1].z + projected[5].z + projected[4].z) / 4 }, // bottom
      ].sort((a, b) => b.z - a.z)

      // Draw faces
      faces.forEach(face => {
        ctx.beginPath()
        face.indices.forEach((idx, i) => {
          const p = projected[idx]
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
        
        // Darker color for back faces
        const brightness = face.z > 0 ? 0.8 : 1
        ctx.fillStyle = color
        ctx.fill()
        
        // Stroke for edges
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * brightness})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw room outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      
      const roomScale = 0.02 // Scale down room dimensions for display
      const scaledRoom = {
        w: roomDimensions.width * roomScale,
        l: roomDimensions.length * roomScale,
        h: roomDimensions.height * roomScale
      }

      // Draw room wireframe
      const roomVertices = [
        { x: -scaledRoom.w/2, y: -scaledRoom.h/2, z: -scaledRoom.l/2 },
        { x: scaledRoom.w/2, y: -scaledRoom.h/2, z: -scaledRoom.l/2 },
        { x: scaledRoom.w/2, y: scaledRoom.h/2, z: -scaledRoom.l/2 },
        { x: -scaledRoom.w/2, y: scaledRoom.h/2, z: -scaledRoom.l/2 },
        { x: -scaledRoom.w/2, y: -scaledRoom.h/2, z: scaledRoom.l/2 },
        { x: scaledRoom.w/2, y: -scaledRoom.h/2, z: scaledRoom.l/2 },
        { x: scaledRoom.w/2, y: scaledRoom.h/2, z: scaledRoom.l/2 },
        { x: -scaledRoom.w/2, y: scaledRoom.h/2, z: scaledRoom.l/2 },
      ]
      
      const projectedRoom = roomVertices.map(v => project3D(v.x, v.y, v.z))
      
      // Draw room edges
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // front
        [4, 5], [5, 6], [6, 7], [7, 4], // back
        [0, 4], [1, 5], [2, 6], [3, 7], // connecting
      ]
      
      ctx.beginPath()
      edges.forEach(([i, j]) => {
        ctx.moveTo(projectedRoom[i].x, projectedRoom[i].y)
        ctx.lineTo(projectedRoom[j].x, projectedRoom[j].y)
      })
      ctx.stroke()

      // Draw racks
      const rackScale = roomScale
      const scaledRack = {
        w: rackConfig.width * rackScale,
        l: rackConfig.length * rackScale,
        h: rackConfig.height * rackScale
      }

      const aisleWidth = layout.aisleWidth * rackScale
      const startX = -scaledRoom.w/2 + scaledRack.w/2 + aisleWidth
      const startZ = -scaledRoom.l/2 + scaledRack.l/2 + aisleWidth

      for (let row = 0; row < layout.rowCount; row++) {
        for (let col = 0; col < layout.racksPerRow; col++) {
          const x = startX + col * (scaledRack.w + aisleWidth)
          const z = startZ + row * (scaledRack.l + aisleWidth)
          const y = 0

          // Draw rack structure
          drawBox(x, y, z, scaledRack.w, scaledRack.h, scaledRack.l, '#4B5563', 0.8)

          // Draw tiers
          const tierHeight = scaledRack.h / rackConfig.tiers
          for (let tier = 0; tier < rackConfig.tiers; tier++) {
            const tierY = -scaledRack.h/2 + tierHeight * (tier + 0.5)
            drawBox(x, tierY, z, scaledRack.w * 0.9, tierHeight * 0.15, scaledRack.l * 0.9, '#10B981', 0.9)
          }
        }
      }

      // Draw floor grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.beginPath()
      const gridSize = 0.5
      for (let x = -scaledRoom.w/2; x <= scaledRoom.w/2; x += gridSize) {
        const p1 = project3D(x, -scaledRoom.h/2, -scaledRoom.l/2)
        const p2 = project3D(x, -scaledRoom.h/2, scaledRoom.l/2)
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
      }
      for (let z = -scaledRoom.l/2; z <= scaledRoom.l/2; z += gridSize) {
        const p1 = project3D(-scaledRoom.w/2, -scaledRoom.h/2, z)
        const p2 = project3D(scaledRoom.w/2, -scaledRoom.h/2, z)
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
      }
      ctx.stroke()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [roomDimensions, rackConfig, layout])

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isDown: true
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseRef.current.isDown) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top
      
      const deltaX = currentX - mouseRef.current.x
      const deltaY = currentY - mouseRef.current.y
      
      cameraRef.current.rotY += deltaX * 0.01
      cameraRef.current.rotX += deltaY * 0.01
      
      // Clamp vertical rotation
      cameraRef.current.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraRef.current.rotX))
      
      mouseRef.current.x = currentX
      mouseRef.current.y = currentY
    }
  }

  const handleMouseUp = () => {
    mouseRef.current.isDown = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    cameraRef.current.zoom += e.deltaY * -0.001
    cameraRef.current.zoom = Math.max(0.5, Math.min(2, cameraRef.current.zoom))
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute top-2 left-2 text-xs text-gray-500">
        Drag to rotate • Scroll to zoom
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-gray-400">
        <Grid3x3 className="w-4 h-4" />
        3D Layout
      </div>
    </div>
  )
}
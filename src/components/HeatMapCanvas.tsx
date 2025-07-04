"use client"

import { useEffect, useRef } from 'react'
import { GridPoint } from '@/lib/lighting-design'
import type { Fixture } from '@/types/lighting'

interface HeatMapCanvasProps {
  grid?: GridPoint[]
  ppfdData?: number[][] | any[]
  width: number
  height: number
  minPPFD?: number
  maxPPFD?: number
  colorScale?: 'viridis' | 'heat' | 'grayscale'
  fixtures?: Fixture[]
  gridEnabled?: boolean
  showPAR?: boolean
  onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void
}

export function HeatMapCanvas({
  grid,
  ppfdData,
  width,
  height,
  minPPFD = 0,
  maxPPFD = 1000,
  colorScale = 'viridis',
  fixtures,
  gridEnabled,
  showPAR,
  onClick
}: HeatMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Color scale functions
  const getColor = (value: number): string => {
    const normalized = Math.max(0, Math.min(1, (value - minPPFD) / (maxPPFD - minPPFD)))
    
    switch (colorScale) {
      case 'viridis':
        return viridisScale(normalized)
      case 'heat':
        return heatScale(normalized)
      case 'grayscale':
        return grayscale(normalized)
      default:
        return viridisScale(normalized)
    }
  }

  const viridisScale = (t: number): string => {
    const r = Math.round(255 * (0.267 + 0.004 * t + 0.329 * t * t + 0.446 * t * t * t))
    const g = Math.round(255 * (0.001 + 1.375 * t - 0.810 * t * t + 0.341 * t * t * t))
    const b = Math.round(255 * (0.328 + 0.359 * t - 0.863 * t * t + 0.660 * t * t * t))
    return `rgb(${Math.min(255, Math.max(0, r))}, ${Math.min(255, Math.max(0, g))}, ${Math.min(255, Math.max(0, b))})`
  }

  const heatScale = (t: number): string => {
    if (t < 0.33) {
      return `rgb(0, 0, ${Math.round(255 * (t / 0.33))})`
    } else if (t < 0.66) {
      const normalized = (t - 0.33) / 0.33
      return `rgb(0, ${Math.round(255 * normalized)}, ${Math.round(255 * (1 - normalized))})`
    } else {
      const normalized = (t - 0.66) / 0.34
      return `rgb(${Math.round(255 * normalized)}, ${Math.round(255 * (1 - normalized))}, 0)`
    }
  }

  const grayscale = (t: number): string => {
    const value = Math.round(255 * t)
    return `rgb(${value}, ${value}, ${value})`
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Handle different data formats
    let dataToRender: { ppfd: number; x: number; y: number }[] = []

    if (grid && grid.length > 0) {
      // Original GridPoint format
      dataToRender = grid
    } else if (ppfdData) {
      // Handle 2D array format
      if (Array.isArray(ppfdData) && ppfdData.length > 0) {
        if (Array.isArray(ppfdData[0])) {
          // 2D array format
          const gridHeight = ppfdData.length
          const gridWidth = ppfdData[0].length
          
          ppfdData.forEach((row, y) => {
            row.forEach((value, x) => {
              dataToRender.push({
                ppfd: value,
                x: (x / gridWidth) * width,
                y: (y / gridHeight) * height
              })
            })
          })
        } else {
          // Flat array format
          const gridSize = Math.sqrt(ppfdData.length)
          ppfdData.forEach((value, index) => {
            const row = Math.floor(index / gridSize)
            const col = index % gridSize
            dataToRender.push({
              ppfd: value,
              x: (col / gridSize) * width,
              y: (row / gridSize) * height
            })
          })
        }
      }
    }

    if (dataToRender.length === 0) return

    // Calculate grid dimensions
    const gridSize = Math.sqrt(dataToRender.length)
    const cellWidth = width / gridSize
    const cellHeight = height / gridSize

    // Create gradient for each cell
    dataToRender.forEach((point, index) => {
      const row = Math.floor(index / gridSize)
      const col = index % gridSize
      
      const x = col * cellWidth
      const y = row * cellHeight

      // Create radial gradient for smooth transitions
      const gradient = ctx.createRadialGradient(
        x + cellWidth / 2,
        y + cellHeight / 2,
        0,
        x + cellWidth / 2,
        y + cellHeight / 2,
        cellWidth
      )

      const color = getColor(point.ppfd)
      // Convert rgb to rgba for transparency
      const colorWithAlpha = color.replace('rgb(', 'rgba(').replace(')', ', 0.5)')
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, colorWithAlpha) // Add transparency at edges

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, cellWidth, cellHeight)
    })

    // Apply smoothing
    const imageData = ctx.getImageData(0, 0, width, height)
    const smoothedData = applyGaussianBlur(imageData)
    ctx.putImageData(smoothedData, 0, 0)

  }, [grid, ppfdData, width, height, minPPFD, maxPPFD, colorScale])

  // Simple Gaussian blur for smoothing
  const applyGaussianBlur = (imageData: ImageData): ImageData => {
    const { data, width, height } = imageData
    const output = new Uint8ClampedArray(data)
    const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1]
    const kernelSum = 16

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = ((y + ky) * width + (x + kx)) * 4
            const weight = kernel[(ky + 1) * 3 + (kx + 1)]
            
            r += data[pixel] * weight
            g += data[pixel + 1] * weight
            b += data[pixel + 2] * weight
          }
        }

        const pixel = (y * width + x) * 4
        output[pixel] = r / kernelSum
        output[pixel + 1] = g / kernelSum
        output[pixel + 2] = b / kernelSum
      }
    }

    return new ImageData(output, width, height)
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 opacity-70"
      style={{ mixBlendMode: 'screen' }}
      onClick={onClick}
    />
  )
}
"use client"

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GridPoint } from '@/lib/lighting-design'
import type { Fixture } from '@/types/lighting'

interface HeatMapCanvasProps {
  grid?: GridPoint[]
  ppfdData?: number[][] | any[]
  width: number
  height: number
  minPPFD?: number
  maxPPFD?: number
  colorScale?: 'viridis' | 'heat' | 'grayscale' | 'plasma' | 'inferno'
  fixtures?: Fixture[]
  gridEnabled?: boolean
  showPAR?: boolean
  onClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void
  interpolation?: 'nearest' | 'linear' | 'cubic'
  showContours?: boolean
  animateTransitions?: boolean
}

// Vertex shader for heat map
const vertexShader = `
  attribute float intensity;
  varying float vIntensity;
  varying vec2 vUv;
  
  void main() {
    vIntensity = intensity;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader with multiple color scales
const fragmentShader = `
  uniform float minValue;
  uniform float maxValue;
  uniform int colorScale;
  uniform float opacity;
  uniform bool showContours;
  uniform float contourLevels;
  
  varying float vIntensity;
  varying vec2 vUv;
  
  vec3 viridis(float t) {
    const vec3 c0 = vec3(0.267, 0.001, 0.328);
    const vec3 c1 = vec3(0.127, 0.566, 0.551);
    const vec3 c2 = vec3(0.993, 0.906, 0.144);
    
    if (t < 0.5) {
      return mix(c0, c1, t * 2.0);
    } else {
      return mix(c1, c2, (t - 0.5) * 2.0);
    }
  }
  
  vec3 plasma(float t) {
    const vec3 c0 = vec3(0.050, 0.030, 0.528);
    const vec3 c1 = vec3(0.796, 0.138, 0.710);
    const vec3 c2 = vec3(0.940, 0.975, 0.131);
    
    if (t < 0.5) {
      return mix(c0, c1, t * 2.0);
    } else {
      return mix(c1, c2, (t - 0.5) * 2.0);
    }
  }
  
  vec3 inferno(float t) {
    const vec3 c0 = vec3(0.0, 0.0, 0.016);
    const vec3 c1 = vec3(0.722, 0.085, 0.451);
    const vec3 c2 = vec3(0.988, 0.998, 0.644);
    
    if (t < 0.5) {
      return mix(c0, c1, t * 2.0);
    } else {
      return mix(c1, c2, (t - 0.5) * 2.0);
    }
  }
  
  vec3 heat(float t) {
    if (t < 0.33) {
      return vec3(0.0, 0.0, t / 0.33);
    } else if (t < 0.66) {
      float normalized = (t - 0.33) / 0.33;
      return vec3(0.0, normalized, 1.0 - normalized);
    } else {
      float normalized = (t - 0.66) / 0.34;
      return vec3(normalized, 1.0 - normalized, 0.0);
    }
  }
  
  vec3 grayscale(float t) {
    return vec3(t, t, t);
  }
  
  void main() {
    float normalizedIntensity = (vIntensity - minValue) / (maxValue - minValue);
    normalizedIntensity = clamp(normalizedIntensity, 0.0, 1.0);
    
    vec3 color;
    if (colorScale == 0) {
      color = viridis(normalizedIntensity);
    } else if (colorScale == 1) {
      color = heat(normalizedIntensity);
    } else if (colorScale == 2) {
      color = grayscale(normalizedIntensity);
    } else if (colorScale == 3) {
      color = plasma(normalizedIntensity);
    } else if (colorScale == 4) {
      color = inferno(normalizedIntensity);
    } else {
      color = viridis(normalizedIntensity);
    }
    
    // Add contour lines if enabled
    if (showContours) {
      float contourValue = normalizedIntensity * contourLevels;
      float contourLine = fract(contourValue);
      if (contourLine < 0.02 || contourLine > 0.98) {
        color *= 0.7; // Darken for contour lines
      }
    }
    
    gl_FragColor = vec4(color, opacity);
  }
`;

// WebGL-based heat map renderer
class HeatMapRenderer {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private mesh: THREE.Mesh | null = null
  private material: THREE.ShaderMaterial
  private geometry: THREE.PlaneGeometry | null = null
  
  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    // Initialize Three.js scene
    this.scene = new THREE.Scene()
    
    // Orthographic camera for 2D view
    this.camera = new THREE.OrthographicCamera(
      -width / 2, width / 2,
      height / 2, -height / 2,
      0.1, 1000
    )
    this.camera.position.z = 10
    
    // WebGL renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    
    // Shader material
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        minValue: { value: 0 },
        maxValue: { value: 1000 },
        colorScale: { value: 0 },
        opacity: { value: 1.0 },
        showContours: { value: false },
        contourLevels: { value: 10 }
      },
      transparent: true,
      side: THREE.DoubleSide
    })
  }
  
  updateData(
    data: { ppfd: number; x: number; y: number }[],
    width: number,
    height: number,
    minPPFD: number,
    maxPPFD: number,
    colorScale: string,
    showContours: boolean
  ) {
    // Remove existing mesh
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
    }
    
    if (data.length === 0) return
    
    // Calculate grid dimensions
    const gridSize = Math.sqrt(data.length)
    const segments = Math.floor(gridSize)
    
    // Create geometry with appropriate segments
    this.geometry = new THREE.PlaneGeometry(width, height, segments - 1, segments - 1)
    
    // Create intensity attribute
    const intensities = new Float32Array(this.geometry.attributes.position.count)
    
    // Map data to vertices
    data.forEach((point, index) => {
      if (index < intensities.length) {
        intensities[index] = point.ppfd
      }
    })
    
    // Apply bicubic interpolation for smoother gradients
    const smoothIntensities = this.bicubicInterpolate(intensities, segments)
    
    this.geometry.setAttribute('intensity', new THREE.BufferAttribute(smoothIntensities, 1))
    
    // Update material uniforms
    this.material.uniforms.minValue.value = minPPFD
    this.material.uniforms.maxValue.value = maxPPFD
    this.material.uniforms.showContours.value = showContours
    
    // Map color scale
    const colorScaleMap: Record<string, number> = {
      'viridis': 0,
      'heat': 1,
      'grayscale': 2,
      'plasma': 3,
      'inferno': 4
    }
    this.material.uniforms.colorScale.value = colorScaleMap[colorScale] || 0
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }
  
  // Bicubic interpolation for smoother gradients
  private bicubicInterpolate(data: Float32Array, gridSize: number): Float32Array {
    const result = new Float32Array(data.length)
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j
        
        // Get surrounding points for interpolation
        const x = j / (gridSize - 1)
        const y = i / (gridSize - 1)
        
        // Simple bilinear interpolation (can be extended to bicubic)
        const i0 = Math.floor(y * (gridSize - 1))
        const i1 = Math.min(i0 + 1, gridSize - 1)
        const j0 = Math.floor(x * (gridSize - 1))
        const j1 = Math.min(j0 + 1, gridSize - 1)
        
        const fx = x * (gridSize - 1) - j0
        const fy = y * (gridSize - 1) - i0
        
        const v00 = data[i0 * gridSize + j0] || 0
        const v01 = data[i0 * gridSize + j1] || 0
        const v10 = data[i1 * gridSize + j0] || 0
        const v11 = data[i1 * gridSize + j1] || 0
        
        const v0 = v00 * (1 - fx) + v01 * fx
        const v1 = v10 * (1 - fx) + v11 * fx
        
        result[index] = v0 * (1 - fy) + v1 * fy
      }
    }
    
    return result
  }
  
  addFixtures(fixtures: Fixture[], width: number, height: number) {
    // Add fixture markers
    fixtures.forEach(fixture => {
      const geometry = new THREE.CircleGeometry(5, 16)
      const material = new THREE.MeshBasicMaterial({ 
        color: fixture.enabled ? 0xffd700 : 0x666666,
        transparent: true,
        opacity: 0.8
      })
      const marker = new THREE.Mesh(geometry, material)
      
      // Convert percentage to scene coordinates
      marker.position.x = (fixture.x / 100 - 0.5) * width
      marker.position.y = -(fixture.y / 100 - 0.5) * height
      marker.position.z = 1
      
      this.scene.add(marker)
    })
  }
  
  addGrid(width: number, height: number, divisions: number = 10) {
    const gridHelper = new THREE.GridHelper(
      Math.max(width, height),
      divisions,
      0x444444,
      0x222222
    )
    gridHelper.rotation.x = Math.PI / 2
    gridHelper.position.z = 0.1
    this.scene.add(gridHelper)
  }
  
  animate(progress: number) {
    if (this.material) {
      this.material.uniforms.opacity.value = progress
    }
  }
  
  render() {
    this.renderer.render(this.scene, this.camera)
  }
  
  resize(width: number, height: number) {
    this.camera.left = -width / 2
    this.camera.right = width / 2
    this.camera.top = height / 2
    this.camera.bottom = -height / 2
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }
  
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose()
    }
    this.material.dispose()
    this.renderer.dispose()
  }
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
  gridEnabled = false,
  showPAR,
  onClick,
  interpolation = 'linear',
  showContours = false,
  animateTransitions = true
}: HeatMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<HeatMapRenderer | null>(null)
  const animationRef = useRef<number>()
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Initialize WebGL renderer
    if (!rendererRef.current) {
      rendererRef.current = new HeatMapRenderer(canvas, width, height)
    }
    
    const renderer = rendererRef.current
    
    // Handle different data formats
    let dataToRender: { ppfd: number; x: number; y: number }[] = []
    
    if (grid && grid.length > 0) {
      dataToRender = grid.map(point => ({
        ppfd: point.ppfd,
        x: point.position.x,
        y: point.position.y
      }))
    } else if (ppfdData) {
      if (Array.isArray(ppfdData) && ppfdData.length > 0) {
        if (Array.isArray(ppfdData[0])) {
          // 2D array format
          const gridHeight = ppfdData.length
          const gridWidth = ppfdData[0].length
          
          ppfdData.forEach((row: any[], y: number) => {
            row.forEach((value: number, x: number) => {
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
    
    // Update heat map data
    renderer.updateData(
      dataToRender,
      width,
      height,
      minPPFD,
      maxPPFD,
      colorScale,
      showContours
    )
    
    // Add grid if enabled
    if (gridEnabled) {
      renderer.addGrid(width, height)
    }
    
    // Add fixtures if provided
    if (fixtures && fixtures.length > 0) {
      renderer.addFixtures(fixtures, width, height)
    }
    
    // Animate transitions if enabled
    if (animateTransitions && !isAnimating) {
      setIsAnimating(true)
      let progress = 0
      
      const animate = () => {
        progress += 0.05
        if (progress <= 1) {
          renderer.animate(progress)
          renderer.render()
          animationRef.current = requestAnimationFrame(animate)
        } else {
          renderer.animate(1)
          renderer.render()
          setIsAnimating(false)
        }
      }
      
      animate()
    } else {
      renderer.render()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [grid, ppfdData, width, height, minPPFD, maxPPFD, colorScale, fixtures, gridEnabled, showContours, animateTransitions])
  
  // Handle resize
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.resize(width, height)
      rendererRef.current.render()
    }
  }, [width, height])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current = null
      }
    }
  }, [])
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onClick={onClick}
        className="cursor-crosshair"
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          display: 'block'
        }}
      />
      
      {/* Color scale legend */}
      <div className="absolute bottom-2 right-2 bg-gray-800/90 backdrop-blur rounded p-2">
        <div className="text-xs text-gray-300 mb-1">PPFD (μmol/m²/s)</div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-4 rounded" style={{
            background: `linear-gradient(to right, ${
              colorScale === 'viridis' ? '#440154, #31688e, #35b779, #fde725' :
              colorScale === 'heat' ? '#000080, #00ff00, #ff0000' :
              colorScale === 'plasma' ? '#0d0887, #cc4778, #f0f921' :
              colorScale === 'inferno' ? '#000004, #b73779, #fcffa4' :
              '#000000, #ffffff'
            })`
          }} />
          <div className="flex justify-between w-24 text-xs">
            <span>{minPPFD}</span>
            <span>{maxPPFD}</span>
          </div>
        </div>
      </div>
      
      {showPAR && (
        <div className="absolute top-2 left-2 bg-gray-800/90 backdrop-blur rounded p-2">
          <div className="text-xs text-gray-300">
            <div>Rendering: WebGL</div>
            <div>Performance: High</div>
            <div>Points: {grid?.length || (ppfdData ? ppfdData.flat().length : 0)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
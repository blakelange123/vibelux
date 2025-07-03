'use client'

import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Grid,
  Box,
  Sphere,
  Cylinder,
  Line,
  Text,
  useHelper,
  GizmoHelper,
  GizmoViewport
} from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { 
  Eye, 
  EyeOff, 
  Layers, 
  Sun, 
  Grid3x3,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Settings,
  Box as BoxIcon
} from 'lucide-react'

interface RoomDimensions {
  width: number
  length: number
  height: number
}

interface Fixture {
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
  assignedTiers?: string[]
}

interface Tier {
  id: string
  name: string
  height: number // meters from floor
  benchDepth: number
  canopyHeight: number
  color: string
  visible: boolean
  enabled: boolean
}

interface Room3DWebGLProps {
  roomDimensions: RoomDimensions
  fixtures: Fixture[]
  tiers: Tier[]
  showGrid?: boolean
  showLightBeams?: boolean
  showLabels?: boolean
  showWireframe?: boolean
  onFixtureSelect?: (id: string) => void
  onFixtureMove?: (id: string, x: number, y: number, z: number) => void
}

// Room Component
function Room({ dimensions, showWireframe }: { dimensions: RoomDimensions; showWireframe: boolean }) {
  const { width, length, height } = dimensions
  
  return (
    <group>
      {/* Floor */}
      <Box args={[width, 0.1, length]} position={[0, -0.05, 0]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          wireframe={showWireframe}
        />
      </Box>
      
      {/* Walls */}
      {/* Back wall */}
      <Box args={[width, height, 0.1]} position={[0, height/2, -length/2]}>
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          wireframe={showWireframe}
        />
      </Box>
      
      {/* Front wall (transparent) */}
      <Box args={[width, height, 0.1]} position={[0, height/2, length/2]}>
        <meshStandardMaterial 
          color="#2a2a2a" 
          transparent 
          opacity={0.1}
          wireframe={showWireframe}
        />
      </Box>
      
      {/* Left wall */}
      <Box args={[0.1, height, length]} position={[-width/2, height/2, 0]}>
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          wireframe={showWireframe}
        />
      </Box>
      
      {/* Right wall */}
      <Box args={[0.1, height, length]} position={[width/2, height/2, 0]}>
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          wireframe={showWireframe}
        />
      </Box>
      
      {/* Ceiling */}
      <Box args={[width, 0.1, length]} position={[0, height, 0]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          wireframe={showWireframe}
        />
      </Box>
    </group>
  )
}

// Growing Tier Component
function GrowingTier({ tier, roomWidth, showWireframe }: { tier: Tier; roomWidth: number; showWireframe: boolean }) {
  if (!tier.visible || !tier.enabled) return null
  
  return (
    <group position={[0, tier.height, 0]}>
      {/* Bench surface */}
      <Box args={[roomWidth * 0.9, 0.05, tier.benchDepth]}>
        <meshStandardMaterial 
          color={tier.color} 
          transparent 
          opacity={0.7}
          roughness={0.5}
          wireframe={showWireframe}
        />
      </Box>
      
      {/* Canopy volume */}
      <Box 
        args={[roomWidth * 0.9, tier.canopyHeight, tier.benchDepth]} 
        position={[0, tier.canopyHeight/2, 0]}
      >
        <meshStandardMaterial 
          color={tier.color} 
          transparent 
          opacity={0.1}
          wireframe={true}
        />
      </Box>
      
      {/* Tier label */}
      <Text
        position={[roomWidth/2 - 0.5, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="white"
      >
        {tier.name}
      </Text>
    </group>
  )
}

// Light Fixture Component
function LightFixture({ 
  fixture, 
  showBeams, 
  showLabels,
  onSelect,
  isSelected 
}: { 
  fixture: Fixture
  showBeams: boolean
  showLabels: boolean
  onSelect?: () => void
  isSelected: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  return (
    <group position={[fixture.x, fixture.z, fixture.y]}>
      {/* Fixture housing */}
      <Box
        ref={meshRef}
        args={[0.6, 0.1, 0.4]}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={fixture.enabled ? '#FFD700' : '#666666'}
          emissive={fixture.enabled ? '#FFD700' : '#000000'}
          emissiveIntensity={fixture.enabled ? 0.5 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      
      {/* Selection indicator */}
      {isSelected && (
        <Box args={[0.7, 0.15, 0.5]}>
          <meshBasicMaterial color="#8B5CF6" wireframe />
        </Box>
      )}
      
      {/* Light beam visualization */}
      {showBeams && fixture.enabled && (
        <group>
          <Cylinder
            args={[0.3, 0.3 + Math.tan((fixture.model.beamAngle * Math.PI) / 360) * fixture.z, fixture.z, 8, 1, true]}
            position={[0, -fixture.z/2, 0]}
            rotation={[0, 0, 0]}
          >
            <meshBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </Cylinder>
        </group>
      )}
      
      {/* Fixture label */}
      {(showLabels || hovered) && (
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {fixture.model.brand} {fixture.model.model}
          {'\n'}{fixture.model.wattage}W • {fixture.model.ppf} PPF
        </Text>
      )}
    </group>
  )
}

// PPFD Heatmap Floor Component
function PPFDHeatmap({ 
  roomDimensions, 
  fixtures, 
  visible 
}: { 
  roomDimensions: RoomDimensions
  fixtures: Fixture[]
  visible: boolean
}) {
  const textureRef = useRef<THREE.DataTexture | null>(null)
  
  useEffect(() => {
    if (!visible) return
    
    const width = 50
    const height = 50
    const size = width * height
    const data = new Uint8Array(4 * size)
    
    // Generate PPFD heatmap data
    for (let i = 0; i < size; i++) {
      const x = (i % width) / width
      const y = Math.floor(i / width) / height
      
      let ppfd = 50 // Base ambient
      
      // Add contribution from fixtures
      fixtures.filter(f => f.enabled).forEach(fixture => {
        const fx = (fixture.x + roomDimensions.width/2) / roomDimensions.width
        const fy = (fixture.y + roomDimensions.length/2) / roomDimensions.length
        const distance = Math.sqrt((x - fx) ** 2 + (y - fy) ** 2)
        ppfd += (fixture.model.ppf / 100) * Math.exp(-distance * distance * 10)
      })
      
      // Map PPFD to color (turbo colormap)
      const normalized = Math.min(ppfd / 1000, 1)
      const color = getTurboColor(normalized)
      
      data[i * 4] = color.r * 255
      data[i * 4 + 1] = color.g * 255
      data[i * 4 + 2] = color.b * 255
      data[i * 4 + 3] = 200 // Alpha
    }
    
    const texture = new THREE.DataTexture(data, width, height)
    texture.needsUpdate = true
    textureRef.current = texture
  }, [fixtures, roomDimensions, visible])
  
  if (!visible || !textureRef.current) return null
  
  return (
    <Box 
      args={[roomDimensions.width, 0.01, roomDimensions.length]} 
      position={[0, 0.01, 0]}
    >
      <meshBasicMaterial map={textureRef.current} transparent />
    </Box>
  )
}

// Helper function for turbo colormap
function getTurboColor(t: number): { r: number; g: number; b: number } {
  const r = Math.max(0, Math.min(1, 3.54 - Math.abs(4.65 * t - 2.32)))
  const g = Math.max(0, Math.min(1, 4.9 * t - 1.08))
  const b = Math.max(0, Math.min(1, 2.36 - Math.abs(4.73 * t - 3.87)))
  return { r, g, b }
}

// Main 3D Scene Component
function Scene({ 
  roomDimensions, 
  fixtures, 
  tiers,
  showGrid,
  showLightBeams,
  showLabels,
  showWireframe,
  showHeatmap,
  onFixtureSelect
}: Room3DWebGLProps & { showHeatmap: boolean }) {
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  
  const handleFixtureSelect = (id: string) => {
    setSelectedFixture(id)
    onFixtureSelect?.(id)
  }
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={50} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, 10, -5]} intensity={0.4} />
      
      {/* Environment */}
      <Environment preset="warehouse" />
      
      {/* Grid */}
      {showGrid && (
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#444444" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#666666" 
          fadeDistance={30} 
          fadeStrength={1} 
          followCamera={false} 
        />
      )}
      
      {/* Room */}
      <Room dimensions={roomDimensions} showWireframe={showWireframe || false} />
      
      {/* Growing Tiers */}
      {tiers.map(tier => (
        <GrowingTier 
          key={tier.id} 
          tier={tier} 
          roomWidth={roomDimensions.width}
          showWireframe={showWireframe || false}
        />
      ))}
      
      {/* Light Fixtures */}
      {fixtures.map(fixture => (
        <LightFixture
          key={fixture.id}
          fixture={fixture}
          showBeams={showLightBeams || false}
          showLabels={showLabels || false}
          isSelected={selectedFixture === fixture.id}
          onSelect={() => handleFixtureSelect(fixture.id)}
        />
      ))}
      
      {/* PPFD Heatmap */}
      <PPFDHeatmap 
        roomDimensions={roomDimensions} 
        fixtures={fixtures} 
        visible={showHeatmap || false}
      />
      
      {/* Axes Helper */}
      <axesHelper args={[5]} />
      
      {/* Gizmo */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </>
  )
}

// Main Component
export function Room3DWebGL({
  roomDimensions,
  fixtures,
  tiers,
  showGrid = true,
  showLightBeams = true,
  showLabels = false,
  showWireframe = false,
  onFixtureSelect,
  onFixtureMove
}: Room3DWebGLProps) {
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [viewSettings, setViewSettings] = useState({
    grid: showGrid,
    beams: showLightBeams,
    labels: showLabels,
    wireframe: showWireframe,
    heatmap: true
  })
  
  // Export screenshot
  const exportScreenshot = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '3d-room-view.png'
      link.click()
      URL.revokeObjectURL(url)
    })
  }
  
  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene
            roomDimensions={roomDimensions}
            fixtures={fixtures}
            tiers={tiers}
            showGrid={viewSettings.grid}
            showLightBeams={viewSettings.beams}
            showLabels={viewSettings.labels}
            showWireframe={viewSettings.wireframe}
            showHeatmap={viewSettings.heatmap}
            onFixtureSelect={onFixtureSelect}
          />
        </Suspense>
      </Canvas>
      
      {/* Controls Panel */}
      <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-xl rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white mb-2">View Controls</h3>
        
        <div className="space-y-2">
          <button
            onClick={() => setViewSettings(prev => ({ ...prev, grid: !prev.grid }))}
            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
              viewSettings.grid 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Grid
          </button>
          
          <button
            onClick={() => setViewSettings(prev => ({ ...prev, beams: !prev.beams }))}
            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
              viewSettings.beams 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Sun className="w-4 h-4" />
            Light Beams
          </button>
          
          <button
            onClick={() => setViewSettings(prev => ({ ...prev, heatmap: !prev.heatmap }))}
            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
              viewSettings.heatmap 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            PPFD Heatmap
          </button>
          
          <button
            onClick={() => setViewSettings(prev => ({ ...prev, labels: !prev.labels }))}
            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
              viewSettings.labels 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            Labels
          </button>
          
          <button
            onClick={() => setViewSettings(prev => ({ ...prev, wireframe: !prev.wireframe }))}
            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
              viewSettings.wireframe 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <BoxIcon className="w-4 h-4" />
            Wireframe
          </button>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <button
            onClick={exportScreenshot}
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Image
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-xl rounded-lg px-4 py-2 text-xs text-gray-300">
        <p>Left click + drag to rotate • Right click + drag to pan • Scroll to zoom</p>
      </div>
      
      {/* Room Info */}
      <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-xl rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Room Info</h3>
        <div className="space-y-1 text-xs text-gray-300">
          <p>Dimensions: {roomDimensions.width}m × {roomDimensions.length}m × {roomDimensions.height}m</p>
          <p>Fixtures: {fixtures.length} ({fixtures.filter(f => f.enabled).length} active)</p>
          <p>Tiers: {tiers.filter(t => t.enabled).length} active</p>
        </div>
      </div>
    </div>
  )
}
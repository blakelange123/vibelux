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
  Html,
  Billboard,
  Float
} from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Layers, 
  Sun, 
  Grid3x3,
  Thermometer,
  Droplets,
  Wind,
  AlertCircle,
  Activity
} from 'lucide-react'
import { useSensorData, SensorReading } from '@/hooks/useSensorData'

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
  height: number
  benchDepth: number
  canopyHeight: number
  color: string
  visible: boolean
  enabled: boolean
}

interface SensorPosition {
  id: string
  x: number
  y: number
  z: number
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'pressure'
  zone?: string
}

interface Room3DWebGLEnhancedProps {
  roomDimensions: RoomDimensions
  fixtures: Fixture[]
  tiers: Tier[]
  sensorPositions?: SensorPosition[]
  showGrid?: boolean
  showLightBeams?: boolean
  showLabels?: boolean
  showWireframe?: boolean
  showSensorData?: boolean
  showAlerts?: boolean
  onFixtureSelect?: (id: string) => void
  onSensorSelect?: (id: string) => void
}

// Sensor icon mapping
const sensorIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  co2: Wind,
  light: Sun,
  pressure: Activity
}

// Sensor color mapping
const sensorColors = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  co2: '#10b981',
  light: '#f59e0b',
  pressure: '#8b5cf6'
}

// Enhanced Room Component with sensor zones
function EnhancedRoom({ dimensions, showWireframe }: { dimensions: RoomDimensions; showWireframe: boolean }) {
  const { width, length, height } = dimensions
  
  return (
    <group>
      {/* Floor with grid pattern for sensor placement reference */}
      <Box args={[width, 0.1, length]} position={[0, -0.05, 0]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          wireframe={showWireframe}
        />
      </Box>
      
      {/* Walls with transparent material for better visibility */}
      {/* Back wall */}
      <Box args={[width, height, 0.1]} position={[0, height/2, -length/2]}>
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.5}
          wireframe={showWireframe}
          transparent
          opacity={0.3}
        />
      </Box>
      
      {/* Front wall (transparent) */}
      <Box args={[width, height, 0.1]} position={[0, height/2, length/2]}>
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.5}
          wireframe={showWireframe}
          transparent
          opacity={0.1}
        />
      </Box>
      
      {/* Left wall */}
      <Box args={[0.1, height, length]} position={[-width/2, height/2, 0]}>
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.5}
          wireframe={showWireframe}
          transparent
          opacity={0.3}
        />
      </Box>
      
      {/* Right wall */}
      <Box args={[0.1, height, length]} position={[width/2, height/2, 0]}>
        <meshStandardMaterial 
          color="#2d3748"
          roughness={0.5}
          wireframe={showWireframe}
          transparent
          opacity={0.3}
        />
      </Box>
    </group>
  )
}

// Sensor visualization component
function SensorNode({ 
  sensor, 
  reading,
  showData,
  onSelect,
  showAlerts
}: { 
  sensor: SensorPosition
  reading?: SensorReading
  showData: boolean
  onSelect?: () => void
  showAlerts: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const color = sensorColors[sensor.type]
  const Icon = sensorIcons[sensor.type]
  
  // Check for alerts based on sensor type and value
  const hasAlert = useMemo(() => {
    if (!reading || !showAlerts) return false
    
    switch (sensor.type) {
      case 'temperature':
        return reading.value < 65 || reading.value > 85
      case 'humidity':
        return reading.value < 40 || reading.value > 70
      case 'co2':
        return reading.value > 1500
      default:
        return false
    }
  }, [reading, sensor.type, showAlerts])
  
  return (
    <group position={[sensor.x, sensor.z, sensor.y]}>
      {/* Sensor sphere */}
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.3}
        floatingRange={[-0.1, 0.1]}
      >
        <Sphere
          args={[0.15, 16, 16]}
          onClick={onSelect}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.5}
            roughness={0.3}
          />
        </Sphere>
      </Float>
      
      {/* Alert indicator */}
      {hasAlert && (
        <Billboard>
          <Float speed={4} floatIntensity={0.5}>
            <Html>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-red-500 text-white p-1 rounded-full"
              >
                <AlertCircle className="w-4 h-4" />
              </motion.div>
            </Html>
          </Float>
        </Billboard>
      )}
      
      {/* Sensor data display */}
      {(showData || hovered) && reading && (
        <Billboard>
          <Html>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-900/90 text-white p-2 rounded-lg shadow-lg ${
                hasAlert ? 'border border-red-500' : ''
              }`}
              style={{ minWidth: '120px' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs font-semibold">
                  {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}
                </span>
              </div>
              <div className="text-lg font-bold">
                {reading.value.toFixed(1)} {reading.unit}
              </div>
              {sensor.zone && (
                <div className="text-xs text-gray-400 mt-1">
                  Zone: {sensor.zone}
                </div>
              )}
            </motion.div>
          </Html>
        </Billboard>
      )}
    </group>
  )
}

// Main enhanced component
export default function Room3DWebGLEnhanced({
  roomDimensions,
  fixtures,
  tiers,
  sensorPositions = [],
  showGrid = true,
  showLightBeams = true,
  showLabels = false,
  showWireframe = false,
  showSensorData = true,
  showAlerts = true,
  onFixtureSelect,
  onSensorSelect
}: Room3DWebGLEnhancedProps) {
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'default' | 'thermal' | 'ppfd'>('default')
  
  // Get real-time sensor data
  const { latest: latestReadings, isConnected } = useSensorData({
    autoSubscribe: true,
    channels: ['sensors:environmental']
  })
  
  // Default sensor positions if none provided
  const defaultSensorPositions: SensorPosition[] = useMemo(() => {
    if (sensorPositions.length > 0) return sensorPositions
    
    // Create a grid of sensors
    const positions: SensorPosition[] = []
    const gridX = 3
    const gridY = 3
    const types: Array<'temperature' | 'humidity' | 'co2' | 'light'> = ['temperature', 'humidity', 'co2', 'light']
    
    for (let x = 0; x < gridX; x++) {
      for (let y = 0; y < gridY; y++) {
        types.forEach((type, i) => {
          positions.push({
            id: `sensor-${x}-${y}-${type}`,
            x: (x - (gridX - 1) / 2) * (roomDimensions.width / gridX),
            y: (y - (gridY - 1) / 2) * (roomDimensions.length / gridY),
            z: 1.5 + i * 0.5,
            type,
            zone: `Zone ${x * gridY + y + 1}`
          })
        })
      }
    }
    
    return positions
  }, [sensorPositions, roomDimensions])
  
  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="text-white font-semibold mb-3">3D View Controls</h3>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showGrid}
              className="rounded"
              readOnly
            />
            <Grid3x3 className="w-4 h-4" />
            Show Grid
          </label>
          
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showLightBeams}
              className="rounded"
              readOnly
            />
            <Sun className="w-4 h-4" />
            Light Beams
          </label>
          
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showSensorData}
              className="rounded"
              readOnly
            />
            <Activity className="w-4 h-4" />
            Sensor Data
          </label>
          
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showAlerts}
              className="rounded"
              readOnly
            />
            <AlertCircle className="w-4 h-4" />
            Show Alerts
          </label>
        </div>
        
        {/* Connection Status */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Sensor Legend */}
      {showSensorData && (
        <div className="absolute top-4 right-4 z-10 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h3 className="text-white font-semibold mb-3">Sensor Types</h3>
          <div className="space-y-2">
            {Object.entries(sensorIcons).map(([type, Icon]) => (
              <div key={type} className="flex items-center gap-2 text-white text-sm">
                <Icon className="w-4 h-4" style={{ color: sensorColors[type as keyof typeof sensorColors] }} />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Room */}
          <EnhancedRoom dimensions={roomDimensions} showWireframe={showWireframe} />
          
          {/* Grid */}
          {showGrid && (
            <Grid
              args={[roomDimensions.width, roomDimensions.length]}
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
          
          {/* Fixtures */}
          {fixtures.map((fixture) => (
            <group key={fixture.id} position={[fixture.x, fixture.z, fixture.y]}>
              <Box
                args={[0.6, 0.1, 0.4]}
                onClick={() => {
                  setSelectedFixture(fixture.id)
                  onFixtureSelect?.(fixture.id)
                }}
              >
                <meshStandardMaterial
                  color={fixture.enabled ? '#FFD700' : '#666666'}
                  emissive={fixture.enabled ? '#FFD700' : '#000000'}
                  emissiveIntensity={fixture.enabled ? 0.5 : 0}
                />
              </Box>
              
              {showLightBeams && fixture.enabled && (
                <Cylinder
                  args={[0.3, 0.3 + Math.tan((fixture.model.beamAngle * Math.PI) / 360) * fixture.z, fixture.z, 8, 1, true]}
                  position={[0, -fixture.z/2, 0]}
                >
                  <meshBasicMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                  />
                </Cylinder>
              )}
            </group>
          ))}
          
          {/* Sensors */}
          {defaultSensorPositions.map((sensor) => (
            <SensorNode
              key={sensor.id}
              sensor={sensor}
              reading={latestReadings[sensor.type]}
              showData={showSensorData}
              showAlerts={showAlerts}
              onSelect={() => {
                setSelectedSensor(sensor.id)
                onSensorSelect?.(sensor.id)
              }}
            />
          ))}
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
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
  Float,
  TransformControls,
  Select,
  useCursor
} from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react'
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
  Activity,
  Move,
  RotateCw,
  Trash2,
  Copy,
  Settings,
  Save,
  Download,
  Upload,
  Plus,
  Minus,
  Lightbulb,
  Power,
  Sliders,
  Target
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { 
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PPFDDataPoint {
  x: number
  y: number
  z: number
  ppfd: number
  uniformity: number
}

interface Fixture3D {
  id: string
  x: number
  y: number
  z: number
  rotation: { x: number; y: number; z: number }
  model: {
    brand: string
    model: string
    wattage: number
    ppf: number
    beamAngle: number
    spectrum?: string
  }
  enabled: boolean
  dimming: number // 0-100%
  color: string
  group?: string
}

interface FixtureGroup {
  id: string
  name: string
  color: string
  enabled: boolean
  dimming: number
}

interface ThreeDPPFDViewerEnhancedProps {
  ppfdData: PPFDDataPoint[]
  fixtures: Fixture3D[]
  roomDimensions: { width: number; height: number; depth: number }
  onFixtureUpdate?: (fixture: Fixture3D) => void
  onFixtureAdd?: (fixture: Omit<Fixture3D, 'id'>) => void
  onFixtureDelete?: (id: string) => void
  onFixtureSelect?: (id: string | null) => void
  className?: string
}

// Interactive Fixture Component
function InteractiveFixture({ 
  fixture, 
  isSelected,
  editMode,
  onUpdate,
  onSelect
}: {
  fixture: Fixture3D
  isSelected: boolean
  editMode: 'move' | 'rotate' | null
  onUpdate: (updates: Partial<Fixture3D>) => void
  onSelect: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useCursor(hovered)
  
  const effectiveIntensity = fixture.enabled ? fixture.dimming / 100 : 0
  
  return (
    <group>
      {isSelected && editMode && (
        <TransformControls
          object={meshRef}
          mode={editMode === 'move' ? 'translate' : 'rotate'}
          onChange={() => {
            if (meshRef.current) {
              onUpdate({
                x: meshRef.current.position.x,
                y: meshRef.current.position.z,
                z: meshRef.current.position.y,
                rotation: {
                  x: meshRef.current.rotation.x,
                  y: meshRef.current.rotation.y,
                  z: meshRef.current.rotation.z
                }
              })
            }
          }}
        />
      )}
      
      <group
        ref={meshRef}
        position={[fixture.x, fixture.z, fixture.y]}
        rotation={[fixture.rotation.x, fixture.rotation.y, fixture.rotation.z]}
      >
        {/* Fixture body */}
        <Box
          args={[0.6, 0.1, 0.4]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={fixture.color}
            emissive={fixture.enabled ? fixture.color : '#000000'}
            emissiveIntensity={effectiveIntensity * 0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        
        {/* Selection outline */}
        {isSelected && (
          <Box args={[0.65, 0.12, 0.45]}>
            <meshBasicMaterial
              color="#ffff00"
              wireframe
            />
          </Box>
        )}
        
        {/* Light cone */}
        {fixture.enabled && (
          <Cylinder
            args={[
              0,
              Math.tan((fixture.model.beamAngle * Math.PI) / 360) * fixture.z,
              fixture.z,
              8,
              1,
              true
            ]}
            position={[0, -fixture.z / 2, 0]}
          >
            <meshBasicMaterial
              color={fixture.color}
              transparent
              opacity={0.1 * effectiveIntensity}
              side={THREE.DoubleSide}
            />
          </Cylinder>
        )}
        
        {/* Fixture info */}
        {(isSelected || hovered) && (
          <Billboard>
            <Html>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/90 text-white p-2 rounded-lg shadow-lg whitespace-nowrap"
              >
                <div className="text-xs font-semibold">{fixture.model.brand} {fixture.model.model}</div>
                <div className="text-xs text-gray-400">{fixture.model.wattage}W • {fixture.model.ppf} PPF</div>
                {fixture.enabled && (
                  <div className="text-xs text-green-400">Dimming: {fixture.dimming}%</div>
                )}
              </motion.div>
            </Html>
          </Billboard>
        )}
      </group>
    </group>
  )
}

// Main Enhanced Component
export default function ThreeDPPFDViewerEnhanced({
  ppfdData,
  fixtures: initialFixtures,
  roomDimensions,
  onFixtureUpdate,
  onFixtureAdd,
  onFixtureDelete,
  onFixtureSelect,
  className = ''
}: ThreeDPPFDViewerEnhancedProps) {
  const [fixtures, setFixtures] = useState<Fixture3D[]>(initialFixtures)
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<'move' | 'rotate' | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [showPPFD, setShowPPFD] = useState(true)
  const [showFixtures, setShowFixtures] = useState(true)
  const [ppfdOpacity, setPpfdOpacity] = useState(0.8)
  const [groups, setGroups] = useState<FixtureGroup[]>([
    { id: 'group-1', name: 'All Fixtures', color: '#FFD700', enabled: true, dimming: 100 }
  ])
  const [selectedGroup, setSelectedGroup] = useState<string>('group-1')
  
  // Update local fixtures when props change
  useEffect(() => {
    setFixtures(initialFixtures)
  }, [initialFixtures])
  
  // Handle fixture selection
  const handleFixtureSelect = useCallback((id: string | null) => {
    setSelectedFixture(id)
    onFixtureSelect?.(id)
  }, [onFixtureSelect])
  
  // Handle fixture updates
  const handleFixtureUpdate = useCallback((id: string, updates: Partial<Fixture3D>) => {
    const fixture = fixtures.find(f => f.id === id)
    if (!fixture) return
    
    const updatedFixture = { ...fixture, ...updates }
    setFixtures(prev => prev.map(f => f.id === id ? updatedFixture : f))
    onFixtureUpdate?.(updatedFixture)
  }, [fixtures, onFixtureUpdate])
  
  // Handle group operations
  const handleGroupToggle = useCallback((groupId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, enabled: !g.enabled } : g
    ))
    
    // Update all fixtures in the group
    setFixtures(prev => prev.map(f => 
      f.group === groupId ? { ...f, enabled: !f.enabled } : f
    ))
  }, [])
  
  const handleGroupDimming = useCallback((groupId: string, dimming: number) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, dimming } : g
    ))
    
    // Update all fixtures in the group
    setFixtures(prev => prev.map(f => 
      f.group === groupId ? { ...f, dimming } : f
    ))
  }, [])
  
  // Add new fixture
  const handleAddFixture = useCallback(() => {
    const newFixture: Omit<Fixture3D, 'id'> = {
      x: roomDimensions.width / 2,
      y: roomDimensions.height / 2,
      z: roomDimensions.depth - 0.5,
      rotation: { x: 0, y: 0, z: 0 },
      model: {
        brand: 'Generic',
        model: 'LED-600',
        wattage: 600,
        ppf: 1600,
        beamAngle: 120
      },
      enabled: true,
      dimming: 100,
      color: '#FFD700',
      group: selectedGroup
    }
    
    onFixtureAdd?.(newFixture)
  }, [roomDimensions, selectedGroup, onFixtureAdd])
  
  // Delete selected fixture
  const handleDeleteFixture = useCallback(() => {
    if (selectedFixture) {
      setFixtures(prev => prev.filter(f => f.id !== selectedFixture))
      onFixtureDelete?.(selectedFixture)
      setSelectedFixture(null)
    }
  }, [selectedFixture, onFixtureDelete])
  
  // Duplicate selected fixture
  const handleDuplicateFixture = useCallback(() => {
    const fixture = fixtures.find(f => f.id === selectedFixture)
    if (!fixture) return
    
    const newFixture: Omit<Fixture3D, 'id'> = {
      ...fixture,
      x: fixture.x + 1,
      y: fixture.y + 1
    }
    
    onFixtureAdd?.(newFixture)
  }, [selectedFixture, fixtures, onFixtureAdd])
  
  // PPFD heatmap color function
  const getPPFDColor = useCallback((ppfd: number) => {
    const min = 0
    const max = 1500
    const normalized = Math.max(0, Math.min(1, (ppfd - min) / (max - min)))
    
    if (normalized < 0.25) {
      return new THREE.Color(0, 0, 1).lerp(new THREE.Color(0, 1, 1), normalized / 0.25)
    } else if (normalized < 0.5) {
      return new THREE.Color(0, 1, 1).lerp(new THREE.Color(0, 1, 0), (normalized - 0.25) / 0.25)
    } else if (normalized < 0.75) {
      return new THREE.Color(0, 1, 0).lerp(new THREE.Color(1, 1, 0), (normalized - 0.5) / 0.25)
    } else {
      return new THREE.Color(1, 1, 0).lerp(new THREE.Color(1, 0, 0), (normalized - 0.75) / 0.25)
    }
  }, [])
  
  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 ${className}`}>
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Enhanced 3D PPFD Viewer</h3>
              <p className="text-sm text-gray-400">Interactive fixture management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddFixture}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Fixture
            </Button>
            
            {selectedFixture && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicateFixture}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteFixture}
                  className="gap-2 text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Edit Mode Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Edit Mode:</span>
            <Button
              variant={editMode === 'move' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode(editMode === 'move' ? null : 'move')}
              className="gap-2"
            >
              <Move className="w-4 h-4" />
              Move
            </Button>
            <Button
              variant={editMode === 'rotate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode(editMode === 'rotate' ? null : 'rotate')}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Rotate
            </Button>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-2">
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <span className="text-sm text-gray-300">Grid</span>
            </label>
            
            <label className="flex items-center gap-2">
              <Switch
                checked={showPPFD}
                onCheckedChange={setShowPPFD}
              />
              <span className="text-sm text-gray-300">PPFD</span>
            </label>
            
            <label className="flex items-center gap-2">
              <Switch
                checked={showFixtures}
                onCheckedChange={setShowFixtures}
              />
              <span className="text-sm text-gray-300">Fixtures</span>
            </label>
          </div>
        </div>
        
        {/* Group Controls */}
        <div className="flex items-center gap-4">
          <UISelect value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select fixture group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: group.color }}
                    />
                    {group.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </UISelect>
          
          {selectedGroup && (
            <div className="flex items-center gap-4">
              <Switch
                checked={groups.find(g => g.id === selectedGroup)?.enabled || false}
                onCheckedChange={() => handleGroupToggle(selectedGroup)}
              />
              
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gray-400" />
                <Slider
                  value={[groups.find(g => g.id === selectedGroup)?.dimming || 100]}
                  onValueChange={([value]) => handleGroupDimming(selectedGroup, value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-32"
                />
                <span className="text-sm text-gray-400 w-10">
                  {groups.find(g => g.id === selectedGroup)?.dimming || 100}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="relative h-[600px]">
        <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
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
            <group>
              {/* Floor */}
              <Box args={[roomDimensions.width, 0.1, roomDimensions.height]} position={[0, -0.05, 0]}>
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
              </Box>
              
              {/* Walls */}
              <Box 
                args={[roomDimensions.width, roomDimensions.depth, 0.1]} 
                position={[0, roomDimensions.depth/2, -roomDimensions.height/2]}
              >
                <meshStandardMaterial color="#2d3748" transparent opacity={0.3} />
              </Box>
              
              <Box 
                args={[0.1, roomDimensions.depth, roomDimensions.height]} 
                position={[-roomDimensions.width/2, roomDimensions.depth/2, 0]}
              >
                <meshStandardMaterial color="#2d3748" transparent opacity={0.3} />
              </Box>
              
              <Box 
                args={[0.1, roomDimensions.depth, roomDimensions.height]} 
                position={[roomDimensions.width/2, roomDimensions.depth/2, 0]}
              >
                <meshStandardMaterial color="#2d3748" transparent opacity={0.3} />
              </Box>
            </group>
            
            {/* Grid */}
            {showGrid && (
              <Grid
                args={[roomDimensions.width, roomDimensions.height]}
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
            
            {/* PPFD Visualization */}
            {showPPFD && ppfdData.length > 0 && (
              <group>
                {ppfdData.map((point, index) => (
                  <Sphere
                    key={index}
                    args={[0.1, 8, 6]}
                    position={[point.x, point.z, point.y]}
                  >
                    <meshBasicMaterial
                      color={getPPFDColor(point.ppfd)}
                      transparent
                      opacity={ppfdOpacity}
                    />
                  </Sphere>
                ))}
              </group>
            )}
            
            {/* Fixtures */}
            {showFixtures && fixtures.map(fixture => (
              <InteractiveFixture
                key={fixture.id}
                fixture={fixture}
                isSelected={selectedFixture === fixture.id}
                editMode={selectedFixture === fixture.id ? editMode : null}
                onUpdate={(updates) => handleFixtureUpdate(fixture.id, updates)}
                onSelect={() => handleFixtureSelect(fixture.id)}
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
        
        {/* Selected Fixture Info */}
        {selectedFixture && (
          <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h4 className="text-sm font-semibold text-white mb-2">Selected Fixture</h4>
            {(() => {
              const fixture = fixtures.find(f => f.id === selectedFixture)
              if (!fixture) return null
              
              return (
                <div className="space-y-2 text-xs">
                  <div className="text-gray-300">
                    {fixture.model.brand} {fixture.model.model}
                  </div>
                  <div className="text-gray-400">
                    Position: ({fixture.x.toFixed(1)}, {fixture.y.toFixed(1)}, {fixture.z.toFixed(1)})
                  </div>
                  <div className="text-gray-400">
                    {fixture.model.wattage}W • {fixture.model.ppf} PPF
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      checked={fixture.enabled}
                      onCheckedChange={(enabled) => handleFixtureUpdate(fixture.id, { enabled })}
                    />
                    <span className="text-gray-300">Power</span>
                  </div>
                  {fixture.enabled && (
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[fixture.dimming]}
                        onValueChange={([dimming]) => handleFixtureUpdate(fixture.id, { dimming })}
                        max={100}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-gray-400 w-10">{fixture.dimming}%</span>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
        
        {/* PPFD Opacity Control */}
        {showPPFD && (
          <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">PPFD Opacity:</span>
              <Slider
                value={[ppfdOpacity]}
                onValueChange={([value]) => setPpfdOpacity(value)}
                max={1}
                min={0.1}
                step={0.1}
                className="w-32"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
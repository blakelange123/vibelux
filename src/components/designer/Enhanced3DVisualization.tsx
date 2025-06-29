"use client"
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera,
  Environment,
  ContactShadows,
  AccumulativeShadows,
  RandomizedLight,
  Float,
  Text3D,
  Center
} from '@react-three/drei'
import { 
  EffectComposer,
  Bloom,
  DepthOfField,
  SSAO,
  SMAA,
  ToneMapping
} from '@react-three/postprocessing'
import * as THREE from 'three'
import { PhotorealisticRenderer, RenderQuality } from '@/lib/rendering/PhotorealisticRenderer'
import { MaterialLibrary } from '@/lib/rendering/MaterialLibrary'
import { Fixture } from '@/components/designer/context/types'

interface Enhanced3DVisualizationProps {
  fixtures: Fixture[]
  room: {
    width: number
    length: number
    height: number
    reflectances?: {
      ceiling: number
      walls: number
      floor: number
    }
  }
  viewMode: '3d' | 'render' | 'vr'
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  showPPFD?: boolean
  showShadows?: boolean
  onViewModeChange: (mode: string) => void
}

// Quality presets
const QUALITY_PRESETS: Record<string, RenderQuality> = {
  low: {
    shadows: 'basic',
    reflections: 'none',
    antiAliasing: 'FXAA',
    ambientOcclusion: false,
    bloom: true,
    depthOfField: false,
    pathTracing: false,
    samples: 1
  },
  medium: {
    shadows: 'soft',
    reflections: 'basic',
    antiAliasing: 'TAA',
    ambientOcclusion: true,
    bloom: true,
    depthOfField: false,
    pathTracing: false,
    samples: 2
  },
  high: {
    shadows: 'soft',
    reflections: 'screen-space',
    antiAliasing: 'TAA',
    ambientOcclusion: true,
    bloom: true,
    depthOfField: true,
    pathTracing: false,
    samples: 4
  },
  ultra: {
    shadows: 'raytraced',
    reflections: 'raytraced',
    antiAliasing: 'SMAA',
    ambientOcclusion: true,
    bloom: true,
    depthOfField: true,
    pathTracing: true,
    samples: 16
  }
}

// Greenhouse structure component
function GreenhouseStructure({ room }: { room: Enhanced3DVisualizationProps['room'] }) {
  const materialLibrary = useRef(new MaterialLibrary())
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[room.width, room.length]} />
        <meshStandardMaterial 
          color="#667788" 
          roughness={0.1} 
          metalness={0}
        />
      </mesh>
      
      {/* Glass walls */}
      <mesh position={[-room.width / 2, room.height / 2, 0]}>
        <planeGeometry args={[room.height, room.length]} />
        <meshPhysicalMaterial
          color="white"
          transmission={0.95}
          thickness={0.1}
          roughness={0}
          metalness={0}
          ior={1.52}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Aluminum frame */}
      <group>
        {/* Vertical posts */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={`post-${i}`}
            position={[-room.width / 2, room.height / 2, -room.length / 2 + (i * room.length / 4)]}
            castShadow
          >
            <boxGeometry args={[0.1, room.height, 0.1]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.95} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// LED fixture with realistic geometry
function LEDFixture({ fixture, showPPFD }: { fixture: Fixture; showPPFD: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [intensity, setIntensity] = useState(1)
  
  useFrame((state) => {
    if (meshRef.current && (fixture as any).enabled) {
      // Subtle pulsing effect
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1
      setIntensity(pulse)
    }
  })
  
  return (
    <group position={[fixture.x, fixture.z || 3, fixture.y]}>
      {/* Fixture housing */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[fixture.width || 1.2, 0.15, fixture.length || 0.6]} />
        <meshStandardMaterial
          color="#404040"
          roughness={0.3}
          metalness={0.8}
          emissive={fixture.enabled ? "#ffffff" : "#000000"}
          emissiveIntensity={fixture.enabled ? intensity * 0.3 : 0}
        />
      </mesh>
      
      {/* LED panel */}
      <mesh position={[0, -0.08, 0]}>
        <planeGeometry args={[(fixture.width || 1.2) * 0.9, (fixture.length || 0.6) * 0.9]} />
        <meshBasicMaterial
          color={fixture.enabled ? "#ffffff" : "#333333"}
          transparent
          opacity={fixture.enabled ? 0.9 : 0.3}
        />
      </mesh>
      
      {/* Light source */}
      {fixture.enabled && (
        <>
          <spotLight
            intensity={fixture.model?.wattage || 100}
            angle={Math.PI / 3}
            penumbra={0.3}
            distance={10}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0005}
          />
          <pointLight
            intensity={(fixture.model?.wattage || 100) * 0.5}
            distance={5}
            color="#ff7777"
          />
        </>
      )}
      
      {/* PPFD visualization */}
      {showPPFD && fixture.enabled && (
        <Center position={[0, -1, 0]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.2}
            height={0.02}
            curveSegments={12}
          >
            {`${fixture.model?.ppfd || 400} μmol`}
            <meshBasicMaterial color="#00ff00" />
          </Text3D>
        </Center>
      )}
    </group>
  )
}

// Plant models with growth stages
function PlantCanopy({ room }: { room: Enhanced3DVisualizationProps['room'] }) {
  const plantPositions = []
  const rows = 4
  const plantsPerRow = 20
  
  for (let row = 0; row < rows; row++) {
    for (let plant = 0; plant < plantsPerRow; plant++) {
      plantPositions.push({
        x: -room.width / 2 + (row + 1) * room.width / (rows + 1),
        z: -room.length / 2 + (plant + 1) * room.length / (plantsPerRow + 1)
      })
    }
  }
  
  return (
    <group position={[0, 0.8, 0]}>
      {plantPositions.map((pos, i) => (
        <Float
          key={i}
          speed={1}
          rotationIntensity={0.1}
          floatIntensity={0.1}
          floatingRange={[0, 0.05]}
        >
          <mesh position={[pos.x, 0, pos.z]} castShadow receiveShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshPhysicalMaterial
              color="#4a7c59"
              roughness={0.4}
              metalness={0}
              transmission={0.3}
              thickness={0.5}
              clearcoat={0.1}
              clearcoatRoughness={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export function Enhanced3DVisualization({
  fixtures,
  room,
  viewMode,
  quality = 'high',
  showPPFD = true,
  showShadows = true,
  onViewModeChange
}: Enhanced3DVisualizationProps) {
  const [renderQuality, setRenderQuality] = useState(QUALITY_PRESETS[quality])
  
  return (
    <div className="w-full h-full relative">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Render Settings</h3>
        
        <div className="space-y-2">
          <label className="flex items-center text-white text-sm">
            <input
              type="checkbox"
              checked={showShadows}
              className="mr-2"
            />
            Shadows
          </label>
          
          <label className="flex items-center text-white text-sm">
            <input
              type="checkbox"
              checked={showPPFD}
              className="mr-2"
            />
            Show PPFD Values
          </label>
          
          <select
            value={quality}
            onChange={(e) => setRenderQuality(QUALITY_PRESETS[e.target.value])}
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm"
          >
            <option value="low">Low Quality (Fast)</option>
            <option value="medium">Medium Quality</option>
            <option value="high">High Quality</option>
            <option value="ultra">Ultra (Path Tracing)</option>
          </select>
        </div>
      </div>
      
      {/* Performance Monitor */}
      <div className="absolute top-4 right-4 z-10 bg-gray-900/90 backdrop-blur rounded-lg p-3 text-white text-xs">
        <div>FPS: 60</div>
        <div>Draw Calls: {fixtures.length * 3}</div>
        <div>Triangles: {fixtures.length * 1000}</div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        shadows={showShadows}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[room.width * 0.8, room.height * 0.6, room.length * 0.8]}
          fov={45}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={room.width * 2}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Environment and Lighting */}
        <Environment
          files="/hdr/greenhouse_interior_4k.hdr"
          background
          blur={0.5}
        />
        
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Scene Objects */}
        <GreenhouseStructure room={room} />
        <PlantCanopy room={room} />
        
        {/* Fixtures */}
        {fixtures.map((fixture) => (
          <LEDFixture
            key={fixture.id}
            fixture={fixture}
            showPPFD={showPPFD}
          />
        ))}
        
        {/* Advanced shadows */}
        {showShadows && renderQuality.shadows === 'soft' && (
          <AccumulativeShadows
            temporal
            frames={100}
            color="#316d39"
            colorBlend={0.5}
            alphaTest={0.9}
            scale={20}
            position={[0, 0.01, 0]}
          >
            <RandomizedLight
              amount={8}
              radius={4}
              ambient={0.5}
              intensity={1}
              position={[5, 10, -5]}
              bias={0.001}
            />
          </AccumulativeShadows>
        )}
        
        {/* Contact shadows for quick quality */}
        {showShadows && renderQuality.shadows === 'basic' && (
          <ContactShadows
            opacity={0.4}
            scale={20}
            blur={1.5}
            far={10}
            position={[0, 0.01, 0]}
          />
        )}
        
        {/* Post-processing effects */}
        <PostProcessingEffects renderQuality={renderQuality} />
      </Canvas>
    </div>
  )
}

function PostProcessingEffects({ renderQuality }: { renderQuality: RenderQuality }) {
  const hasEffects = renderQuality.ambientOcclusion || renderQuality.bloom || renderQuality.depthOfField || renderQuality.antiAliasing === 'SMAA'
  
  if (!hasEffects) return null
  
  return (
    <EffectComposer>
      <>
        <ToneMapping />
        {renderQuality.ambientOcclusion && (
          <SSAO
            samples={30}
            radius={0.4}
            intensity={30}
            worldDistanceThreshold={0.5}
            worldDistanceFalloff={2.5}
            worldProximityThreshold={0.05}
            worldProximityFalloff={1}
          />
        )}
        {renderQuality.bloom && (
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
        )}
        {renderQuality.depthOfField && (
          <DepthOfField
            focusDistance={0.01}
            focalLength={0.05}
            bokehScale={2}
            height={480}
          />
        )}
        {renderQuality.antiAliasing === 'SMAA' && <SMAA />}
      </>
    </EffectComposer>
  )
}
export default Enhanced3DVisualization

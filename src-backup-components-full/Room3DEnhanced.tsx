'use client'

import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  Lightformer,
  useGLTF,
  useTexture,
  Loader,
  PerformanceMonitor,
  Stats,
  Effects,
  Preload
} from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Vector2 } from 'three'
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { PhotorealisticRenderer } from '@/lib/rendering/photorealistic-renderer'
import { MaterialLibrary } from '@/lib/rendering/material-library'
import { BlendFunction } from 'postprocessing'

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
    spectrum?: string
    iesProfile?: string
  }
  enabled: boolean
  dimmingLevel?: number
}

interface EnhancedRoom3DProps {
  roomDimensions: RoomDimensions
  fixtures: Fixture[]
  quality: 'low' | 'medium' | 'high' | 'ultra'
  enablePathTracing?: boolean
  showPPFDOverlay?: boolean
}

// Enhanced room component with PBR materials
function EnhancedRoom({ dimensions }: { dimensions: RoomDimensions }) {
  const { width, length, height } = dimensions
  
  // Load textures
  const concreteTextures = useTexture({
    map: '/textures/concrete/diffuse.jpg',
    normalMap: '/textures/concrete/normal.jpg',
    roughnessMap: '/textures/concrete/roughness.jpg',
    aoMap: '/textures/concrete/ao.jpg'
  })
  
  const metalTextures = useTexture({
    map: '/textures/metal/diffuse.jpg',
    normalMap: '/textures/metal/normal.jpg',
    roughnessMap: '/textures/metal/roughness.jpg',
    metalnessMap: '/textures/metal/metalness.jpg'
  })
  
  // Apply texture settings
  Object.values(concreteTextures).forEach(texture => {
    if (texture instanceof THREE.Texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(4, 4)
    }
  })
  
  return (
    <group>
      {/* Floor with PBR material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          {...concreteTextures}
          roughness={0.8}
          metalness={0}
          envMapIntensity={0.5}
        />
      </mesh>
      
      {/* Walls with proper materials */}
      {/* Back wall */}
      <mesh position={[0, height/2, -length/2]} receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial
          {...metalTextures}
          color="#e0e0e0"
          roughness={0.4}
          metalness={0.8}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Glass panels for greenhouse effect */}
      <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <meshPhysicalMaterial
          color="white"
          transmission={0.95}
          thickness={0.01}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.52}
          envMapIntensity={1}
        />
      </mesh>
    </group>
  )
}

// Photometric light fixture component
function PhotometricFixture({ fixture }: { fixture: Fixture }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.SpotLight>(null)
  const [hovered, setHovered] = useState(false)
  
  // Load fixture model if available
  const { scene } = useGLTF('/models/fixtures/generic-led.glb', true)
  
  // Create photometric light
  useEffect(() => {
    if (lightRef.current && fixture.enabled) {
      // Configure light based on fixture specs
      lightRef.current.intensity = fixture.model.wattage * (fixture.dimmingLevel || 100) / 100
      lightRef.current.angle = (fixture.model.beamAngle * Math.PI) / 180
      lightRef.current.penumbra = 0.2
      lightRef.current.decay = 2
      lightRef.current.distance = 20
      
      // Set color based on spectrum
      const spectrumColors: Record<string, THREE.Color> = {
        'full-spectrum': new THREE.Color(1, 0.95, 0.9),
        'red-blue': new THREE.Color(1, 0.7, 1),
        'white-4000k': new THREE.Color(1, 0.97, 0.91),
        'white-3000k': new THREE.Color(1, 0.91, 0.83)
      }
      
      lightRef.current.color = spectrumColors[fixture.model.spectrum || 'full-spectrum'] || new THREE.Color(1, 1, 1)
    }
  }, [fixture])
  
  return (
    <group position={[fixture.x, fixture.z, fixture.y]} rotation={[0, fixture.rotation, 0]}>
      {/* Fixture housing */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[0.6, 0.1, 0.4]} />
        <meshStandardMaterial
          color={hovered ? '#FFD700' : '#C0C0C0'}
          roughness={0.3}
          metalness={0.9}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* LED emitter surface */}
      <mesh position={[0, -0.051, 0]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={fixture.enabled ? 2 : 0}
        />
      </mesh>
      
      {/* Photometric light source */}
      {fixture.enabled && (
        <spotLight
          ref={lightRef}
          position={[0, -0.1, 0]}
          target-position={[0, -10, 0]}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.1}
          shadow-camera-far={20}
          shadow-bias={-0.0005}
        />
      )}
      
      {/* Volumetric light cone (optional) */}
      {fixture.enabled && (
        <mesh position={[0, -5, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[
            Math.tan((fixture.model.beamAngle * Math.PI) / 360) * 10,
            10,
            32,
            1,
            true
          ]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

// PPFD visualization overlay
function PPFDOverlay({ fixtures, roomDimensions }: { fixtures: Fixture[]; roomDimensions: RoomDimensions }) {
  const textureRef = useRef<THREE.DataTexture>()
  const resolution = 128
  
  useEffect(() => {
    const data = new Float32Array(resolution * resolution * 4)
    
    // Calculate PPFD at each point
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const worldX = (x / resolution - 0.5) * roomDimensions.width
        const worldY = (y / resolution - 0.5) * roomDimensions.length
        
        let totalPPFD = 0
        
        fixtures.filter(f => f.enabled).forEach(fixture => {
          const dx = worldX - fixture.x
          const dy = worldY - fixture.y
          const distance = Math.sqrt(dx * dx + dy * dy + fixture.z * fixture.z)
          
          // Photometric calculation
          const angleFromNormal = Math.atan2(Math.sqrt(dx * dx + dy * dy), fixture.z)
          const beamAngle = (fixture.model.beamAngle * Math.PI) / 180
          
          if (angleFromNormal < beamAngle / 2) {
            const intensityFactor = Math.cos(angleFromNormal)
            const ppfdContribution = (fixture.model.ppf * intensityFactor) / (distance * distance * 0.1)
            totalPPFD += ppfdContribution * (fixture.dimmingLevel || 100) / 100
          }
        })
        
        // Map PPFD to color (turbo colormap)
        const normalized = Math.min(totalPPFD / 1000, 1)
        const idx = (y * resolution + x) * 4
        
        // Turbo colormap
        data[idx] = Math.max(0, Math.min(1, 3.54 - Math.abs(4.65 * normalized - 2.32)))
        data[idx + 1] = Math.max(0, Math.min(1, 4.9 * normalized - 1.08))
        data[idx + 2] = Math.max(0, Math.min(1, 2.36 - Math.abs(4.73 * normalized - 3.87)))
        data[idx + 3] = 0.7 // Alpha
      }
    }
    
    if (!textureRef.current) {
      textureRef.current = new THREE.DataTexture(data, resolution, resolution, THREE.RGBAFormat, THREE.FloatType)
    } else {
      textureRef.current.image.data = data
    }
    
    textureRef.current.needsUpdate = true
  }, [fixtures, roomDimensions])
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[roomDimensions.width, roomDimensions.length]} />
      <meshBasicMaterial
        map={textureRef.current}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// Performance monitor component
function AdaptiveQuality({ children, quality }: { children: React.ReactNode; quality: string }) {
  const [dpr, setDpr] = useState(1)
  const [enableEffects, setEnableEffects] = useState(true)
  
  return (
    <>
      <PerformanceMonitor
        onIncline={() => {
          setDpr(Math.min(2, dpr + 0.1))
          setEnableEffects(true)
        }}
        onDecline={() => {
          setDpr(Math.max(0.5, dpr - 0.1))
          if (dpr < 0.7) setEnableEffects(false)
        }}
      >
        {children}
      </PerformanceMonitor>
      {quality === 'ultra' && <Stats />}
    </>
  )
}

// Main enhanced 3D room component
export function Room3DEnhanced({
  roomDimensions,
  fixtures,
  quality = 'high',
  enablePathTracing = false,
  showPPFDOverlay = true
}: EnhancedRoom3DProps) {
  const [pathTracerReady, setPathTracerReady] = useState(false)
  
  // Quality presets
  const qualitySettings = useMemo(() => ({
    low: { shadows: false, dpr: 0.5, samples: 1, toneMapping: THREE.NoToneMapping },
    medium: { shadows: true, dpr: 1, samples: 2, toneMapping: THREE.LinearToneMapping },
    high: { shadows: true, dpr: 1.5, samples: 4, toneMapping: THREE.ACESFilmicToneMapping },
    ultra: { shadows: true, dpr: 2, samples: 8, toneMapping: THREE.ACESFilmicToneMapping }
  }), [])
  
  const settings = qualitySettings[quality]
  
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows={settings.shadows ? (quality === 'ultra' ? 'soft' : 'basic') : false}
        dpr={settings.dpr}
        camera={{ position: [10, 8, 10], fov: 50 }}
        gl={{
          antialias: quality !== 'low',
          toneMapping: settings.toneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: 'srgb'
        }}
      >
        <Suspense fallback={<Loader />}>
          <AdaptiveQuality quality={quality}>
            {/* Camera controls */}
            <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={50} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
              maxPolarAngle={Math.PI / 2}
            />
            
            {/* Environment and lighting */}
            <Environment resolution={quality === 'ultra' ? 512 : 256}>
              <Lightformer
                intensity={0.75}
                rotation-x={Math.PI / 2}
                position={[0, 5, -9]}
                scale={[10, 10, 1]}
              />
              <Lightformer
                intensity={4}
                rotation-y={Math.PI / 2}
                position={[-5, 1, -1]}
                scale={[20, 0.1, 1]}
              />
              <Lightformer
                rotation-y={-Math.PI / 2}
                position={[10, 1, 0]}
                scale={[20, 0.5, 1]}
              />
            </Environment>
            
            {/* Ambient lighting */}
            <ambientLight intensity={0.2} />
            
            {/* Room geometry */}
            <EnhancedRoom dimensions={roomDimensions} />
            
            {/* Fixtures */}
            {fixtures.map(fixture => (
              <PhotometricFixture key={fixture.id} fixture={fixture} />
            ))}
            
            {/* PPFD overlay */}
            {showPPFDOverlay && (
              <PPFDOverlay fixtures={fixtures} roomDimensions={roomDimensions} />
            )}
            
            {/* Accumulative shadows for better quality */}
            {settings.shadows && quality !== 'low' && (
              <AccumulativeShadows
                temporal
                frames={100}
                color="black"
                colorBlend={2}
                toneMapped={true}
                alphaTest={0.9}
                opacity={1}
                scale={10}
                position={[0, 0.01, 0]}
              >
                <RandomizedLight
                  amount={8}
                  radius={5}
                  ambient={0.5}
                  intensity={1}
                  position={[5, 8, -5]}
                  bias={0.001}
                />
              </AccumulativeShadows>
            )}
            
            {/* Post-processing effects */}
            {quality === 'ultra' && (
              <EffectComposer multisampling={settings.samples}>
                <Bloom
                  intensity={0.5}
                  luminanceThreshold={0.9}
                  luminanceSmoothing={0.9}
                  blendFunction={BlendFunction.ADD}
                />
                <DepthOfField
                  focusDistance={0.01}
                  focalLength={0.02}
                  bokehScale={2}
                  height={480}
                />
                <ChromaticAberration
                  blendFunction={BlendFunction.NORMAL}
                  offset={new Vector2(0.0005, 0.0005)}
                  radialModulation={false}
                  modulationOffset={0}
                />
                <Vignette
                  offset={0.3}
                  darkness={0.4}
                  blendFunction={BlendFunction.NORMAL}
                />
              </EffectComposer>
            )}
            {quality === 'high' && (
              <EffectComposer multisampling={settings.samples}>
                <Bloom
                  intensity={0.5}
                  luminanceThreshold={0.9}
                  luminanceSmoothing={0.9}
                  blendFunction={BlendFunction.ADD}
                />
              </EffectComposer>
            )}
          </AdaptiveQuality>
          
          <Preload all />
        </Suspense>
      </Canvas>
      
      {/* Quality indicator */}
      <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white">
        Quality: {quality.toUpperCase()}
      </div>
      
      {/* Path tracing toggle */}
      {quality === 'ultra' && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setPathTracerReady(!pathTracerReady)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {pathTracerReady ? 'Disable' : 'Enable'} Path Tracing
          </button>
        </div>
      )}
    </div>
  )
}
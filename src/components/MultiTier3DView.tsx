'use client';

import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Grid,
  Text,
  Box,
  Sphere,
  Cone,
  Line,
  useTexture,
  MeshReflectorMaterial,
  Float,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Eye, 
  EyeOff,
  Layers,
  Lightbulb,
  Settings,
  X,
  Camera
} from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  height: number; // feet
  benchDepth: number; // feet
  canopyHeight: number; // inches
  targetPPFD: number;
  cropType: string;
  enabled: boolean;
  visible: boolean;
  color: string;
  plantDensity: number;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting';
}

interface Fixture {
  id: string;
  x: number; // percentage
  y: number; // percentage
  z: number; // feet
  ppf: number;
  beamAngle: number;
  enabled: boolean;
  assignedTiers?: string[];
}

interface MultiTier3DViewProps {
  tiers: Tier[];
  fixtures: Fixture[];
  roomDimensions: { width: number; height: number; depth: number };
  onClose?: () => void;
  showLightBeams?: boolean;
  showShadows?: boolean;
}

// 3D Room Component
function Room({ dimensions }: { dimensions: { width: number; height: number; depth: number } }) {
  const { width, height, depth } = dimensions;
  
  return (
    <group>
      {/* Floor with reflective material */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <MeshReflectorMaterial
          color="#1F2937"
          roughness={0.8}
          metalness={0.2}
          blur={[100, 100]}
          mixBlur={0.5}
          mixStrength={10}
          depthScale={1}
          minDepthThreshold={0.85}
          resolution={512}
          mirror={0.3}
        />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      
      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, height/2, -depth/2]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      
      {/* Front wall (transparent) */}
      <mesh position={[0, height/2, depth/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#374151" transparent opacity={0.1} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-width/2, height/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[width/2, height/2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      
      {/* Grid lines on floor */}
      <Grid 
        position={[0, 0.01, 0]}
        args={[width, depth]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#374151" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#4B5563"
        fadeDistance={100}
      />
    </group>
  );
}

// 3D Tier Component
function Tier3D({ tier, roomWidth }: { tier: Tier; roomWidth: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tierHeight = tier.height;
  const canopyHeight = tier.canopyHeight / 12; // Convert inches to feet
  
  if (!tier.visible) return null;
  
  return (
    <group position={[0, tierHeight, 0]}>
      {/* Bench surface */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[roomWidth * 0.9, 0.2, tier.benchDepth]} />
        <meshStandardMaterial 
          color={tier.color} 
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Bench supports */}
      {[-roomWidth * 0.4, -roomWidth * 0.2, 0, roomWidth * 0.2, roomWidth * 0.4].map((x, i) => (
        <mesh key={i} position={[x, -tierHeight/2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, tierHeight]} />
          <meshStandardMaterial color="#4B5563" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}
      
      {/* Canopy representation */}
      {canopyHeight > 0 && (
        <group position={[0, canopyHeight/2, 0]}>
          {/* Canopy volume */}
          <mesh>
            <boxGeometry args={[roomWidth * 0.85, canopyHeight, tier.benchDepth * 0.9]} />
            <meshStandardMaterial 
              color="#10B981" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Plant representations */}
          {Array.from({ length: Math.floor(tier.plantDensity / 10) }).map((_, i) => {
            const x = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * roomWidth * 0.8;
            const z = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * tier.benchDepth * 0.8;
            const scale = 0.3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2;
            
            return (
              <Float
                key={i}
                speed={1}
                rotationIntensity={0.5}
                floatIntensity={0.5}
                floatingRange={[-0.05, 0.05]}
              >
                <mesh position={[x, 0, z]} scale={scale}>
                  <sphereGeometry args={[1, 8, 6]} />
                  <meshStandardMaterial 
                    color={tier.growthStage === 'flowering' ? '#F59E0B' : '#10B981'} 
                    roughness={0.8}
                  />
                </mesh>
              </Float>
            );
          })}
        </group>
      )}
      
      {/* Tier label */}
      <Html position={[roomWidth * 0.5, 0, 0]} center>
        <div className="bg-gray-800/90 backdrop-blur rounded px-2 py-1 text-xs">
          <div className="text-white font-medium">{tier.name}</div>
          <div className="text-gray-400">{tier.cropType} • {tier.targetPPFD} PPFD</div>
        </div>
      </Html>
    </group>
  );
}

// 3D Fixture Component with light beam
function Fixture3D({ 
  fixture, 
  roomDimensions, 
  showLightBeams, 
  tiers 
}: { 
  fixture: Fixture; 
  roomDimensions: { width: number; height: number; depth: number };
  showLightBeams: boolean;
  tiers: Tier[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  
  const x = (fixture.x / 100 - 0.5) * roomDimensions.width;
  const z = (fixture.y / 100 - 0.5) * roomDimensions.depth;
  const y = fixture.z;
  
  useFrame((state) => {
    if (meshRef.current && fixture.enabled) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  if (!fixture.enabled) return null;
  
  return (
    <group position={[x, y, z]}>
      {/* Fixture housing */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.5, 0.3, 0.8]} />
        <meshStandardMaterial 
          color="#FED570" 
          roughness={0.3}
          metalness={0.7}
          emissive="#FED570"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* LED chips */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((offset, i) => (
        <mesh key={i} position={[offset, -0.16, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.6]} />
          <meshStandardMaterial 
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
      
      {/* Actual light source */}
      <spotLight
        ref={lightRef}
        position={[0, -0.2, 0]}
        angle={fixture.beamAngle * Math.PI / 180}
        penumbra={0.3}
        intensity={fixture.ppf / 500}
        color="#FBBF24"
        castShadow
        shadow-mapSize={[512, 512]}
        target-position={[x, 0, z]}
      />
      
      {/* Light beam visualization */}
      {showLightBeams && (
        <group>
          {/* Cone representing light spread */}
          <mesh position={[0, -y/2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[
              Math.tan(fixture.beamAngle * Math.PI / 360) * y,
              y,
              16,
              1,
              true
            ]} />
            <meshStandardMaterial 
              color="#FED570"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          
          {/* Light impact circles on tiers */}
          {tiers.filter(t => t.visible && t.enabled).map(tier => {
            const tierY = tier.height;
            const distance = y - tierY;
            if (distance <= 0) return null;
            
            const radius = Math.tan(fixture.beamAngle * Math.PI / 360) * distance;
            
            return (
              <mesh 
                key={tier.id}
                position={[0, tierY - y + 0.11, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <ringGeometry args={[radius * 0.9, radius, 32]} />
                <meshStandardMaterial 
                  color={tier.color}
                  transparent
                  opacity={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })}
        </group>
      )}
      
      {/* Fixture info */}
      <Html position={[0.8, 0, 0]} center>
        <div className="bg-gray-800/80 backdrop-blur rounded px-1 py-0.5 text-xs text-white whitespace-nowrap">
          {fixture.ppf} PPF
        </div>
      </Html>
    </group>
  );
}

// Main 3D Scene
function Scene({ 
  tiers, 
  fixtures, 
  roomDimensions, 
  viewSettings 
}: { 
  tiers: Tier[]; 
  fixtures: Fixture[]; 
  roomDimensions: { width: number; height: number; depth: number };
  viewSettings: any;
}) {
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.6} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Environment for realistic reflections */}
      <Environment preset="warehouse" intensity={0.3} />
      
      {/* Room */}
      <Room dimensions={roomDimensions} />
      
      {/* Tiers */}
      {viewSettings.showTiers && tiers.map(tier => (
        <Tier3D key={tier.id} tier={tier} roomWidth={roomDimensions.width} />
      ))}
      
      {/* Fixtures */}
      {viewSettings.showFixtures && fixtures.map(fixture => (
        <Fixture3D 
          key={fixture.id} 
          fixture={fixture} 
          roomDimensions={roomDimensions}
          showLightBeams={viewSettings.showLightBeams}
          tiers={tiers}
        />
      ))}
    </>
  );
}

export function MultiTier3DView({
  tiers,
  fixtures,
  roomDimensions,
  onClose,
  showLightBeams = true,
  showShadows = true
}: MultiTier3DViewProps) {
  const [viewSettings, setViewSettings] = useState({
    showTiers: true,
    showFixtures: true,
    showLightBeams,
    showShadows,
    showGrid: true,
    wireframe: false
  });
  const [cameraView, setCameraView] = useState<'perspective' | 'top' | 'side'>('perspective');
  
  const cameraPositions = {
    perspective: [30, 20, 30] as [number, number, number],
    top: [0, 40, 0] as [number, number, number],
    side: [40, 10, 0] as [number, number, number]
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-4 max-w-7xl w-full mx-4 h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">3D Multi-Tier Visualization</h2>
              <p className="text-sm text-gray-400">
                {tiers.length} tiers • {fixtures.length} fixtures • React Three Fiber
              </p>
            </div>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewSettings(prev => ({ ...prev, showTiers: !prev.showTiers }))}
              className={`p-2 rounded ${viewSettings.showTiers ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-700 transition-colors`}
              title="Toggle Tiers"
            >
              <Layers className="w-4 h-4 text-white" />
            </button>
            
            <button
              onClick={() => setViewSettings(prev => ({ ...prev, showFixtures: !prev.showFixtures }))}
              className={`p-2 rounded ${viewSettings.showFixtures ? 'bg-yellow-600' : 'bg-gray-700'} hover:bg-yellow-700 transition-colors`}
              title="Toggle Fixtures"
            >
              <Lightbulb className="w-4 h-4 text-white" />
            </button>
            
            <button
              onClick={() => setViewSettings(prev => ({ ...prev, showLightBeams: !prev.showLightBeams }))}
              className={`p-2 rounded ${viewSettings.showLightBeams ? 'bg-orange-600' : 'bg-gray-700'} hover:bg-orange-700 transition-colors`}
              title="Toggle Light Beams"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>
            
            <button
              onClick={() => setViewSettings(prev => ({ ...prev, showShadows: !prev.showShadows }))}
              className={`p-2 rounded ${viewSettings.showShadows ? 'bg-indigo-600' : 'bg-gray-700'} hover:bg-indigo-700 transition-colors`}
              title="Toggle Shadows"
            >
              <EyeOff className="w-4 h-4 text-white" />
            </button>
            
            <div className="w-px h-6 bg-gray-600" />
            
            {/* Camera views */}
            <button
              onClick={() => setCameraView('perspective')}
              className={`px-3 py-1.5 rounded text-sm ${cameraView === 'perspective' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 transition-colors`}
            >
              3D View
            </button>
            <button
              onClick={() => setCameraView('top')}
              className={`px-3 py-1.5 rounded text-sm ${cameraView === 'top' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 transition-colors`}
            >
              Top View
            </button>
            <button
              onClick={() => setCameraView('side')}
              className={`px-3 py-1.5 rounded text-sm ${cameraView === 'side' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 transition-colors`}
            >
              Side View
            </button>
            
            {onClose && (
              <>
                <div className="w-px h-6 bg-gray-600" />
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* 3D Canvas */}
        <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-950">
          <Canvas shadows={viewSettings.showShadows} dpr={[1, 2]}>
            <PerspectiveCamera 
              makeDefault 
              position={cameraPositions[cameraView]}
              fov={50}
            />
            
            <OrbitControls 
              enablePan 
              enableZoom 
              enableRotate
              minDistance={10}
              maxDistance={100}
              maxPolarAngle={Math.PI / 2}
            />
            
            <Suspense fallback={null}>
              <Scene 
                tiers={tiers} 
                fixtures={fixtures} 
                roomDimensions={roomDimensions}
                viewSettings={viewSettings}
              />
            </Suspense>
          </Canvas>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur rounded-lg p-3">
            <p className="text-xs text-gray-300">
              Left click + drag to rotate • Right click + drag to pan • Scroll to zoom
            </p>
            <p className="text-xs text-gray-400 mt-1">
              High-performance 3D rendering with React Three Fiber
            </p>
          </div>
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium text-white">Legend</h4>
            <div className="space-y-1 text-xs">
              {tiers.map(tier => (
                <div key={tier.id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-gray-300">
                    {tier.name} ({tier.height}ft)
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                <div>Room: {roomDimensions.width} × {roomDimensions.depth} × {roomDimensions.height} ft</div>
                <div>Total PPF: {fixtures.reduce((sum, f) => sum + (f.enabled ? f.ppf : 0), 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiTier3DView;
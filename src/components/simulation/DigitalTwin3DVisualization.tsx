'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Grid,
  Text,
  Box,
  Sphere,
  Cylinder,
  Cone,
  Line,
  Html,
  useTexture,
  MeshReflectorMaterial,
  Float,
  SpotLight,
  useDepthBuffer
} from '@react-three/drei';
import * as THREE from 'three';

interface PlantProps {
  position: [number, number, number];
  stage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  health: number;
  stress: number;
}

function Plant({ position, stage, health, stress }: PlantProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Plant size and color based on stage
  const stageConfig = {
    seedling: { height: 0.3, radius: 0.1, color: '#90EE90' },
    vegetative: { height: 0.8, radius: 0.3, color: '#228B22' },
    flowering: { height: 1.2, radius: 0.4, color: '#006400' },
    harvest: { height: 1.5, radius: 0.5, color: '#8B4513' }
  };
  
  const config = stageConfig[stage];
  const healthColor = new THREE.Color(config.color).multiplyScalar(health / 100);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle swaying animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + position[2]) * 0.03;
    }
  });
  
  return (
    <group position={position}>
      {/* Plant stem */}
      <Cylinder
        ref={meshRef}
        args={[config.radius * 0.3, config.radius * 0.5, config.height]}
        position={[0, config.height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={healthColor} roughness={0.8} />
      </Cylinder>
      
      {/* Canopy */}
      {stage !== 'seedling' && (
        <Sphere
          args={[config.radius]}
          position={[0, config.height, 0]}
        >
          <meshStandardMaterial 
            color={healthColor} 
            roughness={0.7}
            emissive={stress > 50 ? 'red' : 'black'}
            emissiveIntensity={stress / 200}
          />
        </Sphere>
      )}
      
      {/* Flowers for flowering stage */}
      {stage === 'flowering' && (
        <>
          <Cone args={[0.1, 0.2]} position={[0.2, config.height + 0.2, 0]} rotation={[Math.PI, 0, 0]}>
            <meshStandardMaterial color="#FFB6C1" />
          </Cone>
          <Cone args={[0.1, 0.2]} position={[-0.2, config.height + 0.1, 0.1]} rotation={[Math.PI, 0, 0]}>
            <meshStandardMaterial color="#FFB6C1" />
          </Cone>
        </>
      )}
      
      {/* Info display on hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0, config.height + 0.5, 0]}>
          <div className="bg-gray-900 text-white p-2 rounded-lg text-xs">
            <p>Stage: {stage}</p>
            <p>Health: {health}%</p>
            <p>Stress: {stress}%</p>
          </div>
        </Html>
      )}
    </group>
  );
}

interface GrowLightProps {
  position: [number, number, number];
  intensity: number;
  spectrum: 'full' | 'red' | 'blue' | 'uv';
}

function GrowLight({ position, intensity, spectrum }: GrowLightProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  
  const spectrumColors = {
    full: '#FFFFFF',
    red: '#FF0000',
    blue: '#0000FF',
    uv: '#8B00FF'
  };
  
  useFrame((state) => {
    if (lightRef.current && targetRef.current) {
      // Simulate light movement/adjustment
      const time = state.clock.elapsedTime;
      targetRef.current.position.x = Math.sin(time * 0.1) * 0.5;
    }
  });
  
  return (
    <group position={position}>
      {/* Light fixture */}
      <Box args={[2, 0.1, 1]}>
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* LED array */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sphere key={i} args={[0.05]} position={[i * 0.25 - 0.875, -0.1, 0]}>
          <meshStandardMaterial 
            color={spectrumColors[spectrum]} 
            emissive={spectrumColors[spectrum]}
            emissiveIntensity={intensity / 100}
          />
        </Sphere>
      ))}
      
      {/* Actual light */}
      <spotLight
        ref={lightRef}
        intensity={intensity / 50}
        angle={Math.PI / 3}
        penumbra={0.5}
        color={spectrumColors[spectrum]}
        castShadow
      />
      <object3D ref={targetRef} position={[0, -5, 0]} />
    </group>
  );
}

interface SensorNodeProps {
  position: [number, number, number];
  type: 'temperature' | 'humidity' | 'co2' | 'ph';
  value: number;
}

function SensorNode({ position, type, value }: SensorNodeProps) {
  const [showValue, setShowValue] = useState(false);
  
  const sensorColors = {
    temperature: '#FF6B6B',
    humidity: '#4ECDC4',
    co2: '#95E1D3',
    ph: '#F38181'
  };
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <Box 
          args={[0.1, 0.1, 0.1]}
          onClick={() => setShowValue(!showValue)}
        >
          <meshStandardMaterial 
            color={sensorColors[type]} 
            emissive={sensorColors[type]}
            emissiveIntensity={0.5}
          />
        </Box>
        
        {showValue && (
          <Html distanceFactor={10} position={[0, 0.2, 0]}>
            <div className="bg-gray-900 text-white p-1 rounded text-xs">
              {type}: {value.toFixed(1)}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

export function DigitalTwin3DVisualization() {
  const [currentDay, setCurrentDay] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Simulate plant growth over time
  const getPlantStage = (day: number): PlantProps['stage'] => {
    if (day < 7) return 'seedling';
    if (day < 28) return 'vegetative';
    if (day < 70) return 'flowering';
    return 'harvest';
  };
  
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentDay(prev => (prev + 1) % 84);
      }, 1000); // 1 second = 1 day in simulation
      
      return () => clearInterval(interval);
    }
  }, [isPaused]);
  
  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-2">Digital Twin 3D View</h3>
        <p className="text-sm text-gray-300 mb-2">Day: {currentDay}</p>
        <p className="text-sm text-gray-300 mb-2">Stage: {getPlantStage(currentDay)}</p>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
      
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={30}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
        
        {/* Grow Room Environment */}
        <Environment preset="warehouse" />
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={40}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#101010"
            metalness={0.5}
          />
        </mesh>
        
        {/* Grid for reference */}
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#6f6f6f" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#9d9d9d" 
          fadeDistance={30} 
          fadeStrength={1} 
          followCamera={false} 
        />
        
        {/* Plants in rows */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <Plant
              key={`${row}-${col}`}
              position={[col * 2 - 5, 0, row * 2 - 3]}
              stage={getPlantStage(currentDay)}
              health={85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15}
              stress={crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30}
            />
          ))
        )}
        
        {/* Grow lights */}
        <GrowLight position={[0, 5, -3]} intensity={80} spectrum="full" />
        <GrowLight position={[0, 5, -1]} intensity={80} spectrum="full" />
        <GrowLight position={[0, 5, 1]} intensity={80} spectrum="full" />
        <GrowLight position={[0, 5, 3]} intensity={80} spectrum="full" />
        
        {/* Sensor nodes */}
        <SensorNode position={[-3, 2, -3]} type="temperature" value={24.5} />
        <SensorNode position={[3, 2, -3]} type="humidity" value={65.2} />
        <SensorNode position={[-3, 2, 3]} type="co2" value={1200} />
        <SensorNode position={[3, 2, 3]} type="ph" value={6.2} />
        
        {/* HVAC system representation */}
        <group position={[-8, 3, 0]}>
          <Box args={[1, 2, 1]}>
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </Box>
          <Text position={[0, 1.5, 0]} fontSize={0.2} color="white">
            HVAC
          </Text>
        </group>
        
        {/* Control panel */}
        <group position={[8, 2, 0]}>
          <Box args={[0.1, 2, 1.5]}>
            <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
          </Box>
          <Box args={[0.05, 0.3, 0.3]} position={[0.1, 0.5, 0]}>
            <meshStandardMaterial 
              color="#00FF00" 
              emissive="#00FF00"
              emissiveIntensity={0.5}
            />
          </Box>
        </group>
      </Canvas>
    </div>
  );
}
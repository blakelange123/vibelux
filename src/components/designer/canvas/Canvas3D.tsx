'use client';

import React, { Suspense } from 'react';
import { useDesigner } from '../context/DesignerContext';

// This component will be dynamically imported, so we need to handle the imports carefully
export default function Canvas3D() {
  const { state } = useDesigner();
  const { room } = state;
  const [Three, setThree] = React.useState<any>(null);

  React.useEffect(() => {
    // Dynamically import Three.js components
    Promise.all([
      import('@react-three/fiber'),
      import('@react-three/drei'),
      import('./Room3D'),
      import('./Objects3D')
    ]).then(([fiber, drei, room3d, objects3d]) => {
      setThree({
        Canvas: fiber.Canvas,
        OrbitControls: drei.OrbitControls,
        Grid: drei.Grid,
        Environment: drei.Environment,
        Room3D: room3d.Room3D,
        Objects3D: objects3d.Objects3D
      });
    }).catch(err => {
      console.error('Failed to load 3D components:', err);
    });
  }, []);

  if (!Three) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        Loading 3D view...
      </div>
    );
  }

  const { Canvas, OrbitControls, Grid, Environment, Room3D, Objects3D } = Three;

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [room.width, room.height, room.length],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Grid */}
          <Grid 
            position={[0, 0, 0]}
            args={[room.width, room.length]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d9d9d"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
          />
          
          {/* Room */}
          <Room3D />
          
          {/* Objects */}
          <Objects3D />
        </Suspense>
      </Canvas>
    </div>
  );
}
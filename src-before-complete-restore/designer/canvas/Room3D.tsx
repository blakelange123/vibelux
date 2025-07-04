'use client';

import React from 'react';
import { useDesigner } from '../context/DesignerContext';
import { DetailedGreenhouse3D } from '../3d/DetailedGreenhouse3D';
import * as THREE from 'three';

export function Room3D() {
  const { state } = useDesigner();
  const { room } = state;

  // Default room dimensions if not set
  if (!room) {
    return null;
  }

  // Determine if this should be rendered as a greenhouse based on room properties
  const isGreenhouse = room.height > 8 || room.width > 20 || room.length > 30;

  if (isGreenhouse) {
    return <DetailedGreenhouse3D structure={{ type: 'gable', materials: { frame: 'aluminum', glazing: 'glass' } }} />;
  }

  // Fallback to basic room for smaller spaces
  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[room.width, room.length]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Walls */}
      {/* North Wall */}
      <mesh
        position={[0, room.height / 2, -room.length / 2]}
        receiveShadow
      >
        <boxGeometry args={[room.width, room.height, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* South Wall */}
      <mesh
        position={[0, room.height / 2, room.length / 2]}
        receiveShadow
      >
        <boxGeometry args={[room.width, room.height, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* East Wall */}
      <mesh
        position={[room.width / 2, room.height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[room.length, room.height, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* West Wall */}
      <mesh
        position={[-room.width / 2, room.height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[room.length, room.height, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, room.height, 0]}
        receiveShadow
      >
        <planeGeometry args={[room.width, room.length]} />
        <meshStandardMaterial color="#333333" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
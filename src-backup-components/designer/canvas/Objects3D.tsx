'use client';

import React from 'react';
import { useDesigner } from '../context/DesignerContext';
import * as THREE from 'three';

export function Objects3D() {
  const { state } = useDesigner();
  const { objects } = state;

  return (
    <group>
      {objects.filter(obj => obj.enabled).map((obj) => {
        if (obj.type === 'fixture') {
          return (
            <group key={obj.id} position={[obj.x, obj.z || 8, obj.y]}>
              {/* Fixture body */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[obj.width || 2, obj.height || 0.5, obj.length || 4]} />
                <meshStandardMaterial 
                  color="#606060"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              
              {/* LED panel */}
              <mesh position={[0, -(obj.height || 0.5) / 2 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[(obj.width || 2) * 0.9, (obj.length || 4) * 0.9]} />
                <meshStandardMaterial 
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={0.5}
                />
              </mesh>
              
              {/* Light cone visualization */}
              <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[3, 6, 8, 1, true]} />
                <meshBasicMaterial 
                  color="#ffff00"
                  transparent
                  opacity={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        }
        
        return null;
      })}
    </group>
  );
}
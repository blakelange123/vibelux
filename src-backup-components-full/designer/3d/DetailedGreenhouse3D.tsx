'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, BufferGeometry, Material } from 'three';
import * as THREE from 'three';
import { useDesigner } from '../context/DesignerContext';

interface GreenhouseStructure {
  type: 'gable' | 'gothic' | 'venlo' | 'tunnel';
  materials: {
    frame: 'aluminum' | 'galvanized_steel' | 'steel';
    glazing: 'glass' | 'polycarbonate' | 'polyethylene';
  };
}

export function DetailedGreenhouse3D({ 
  structure = { type: 'gable', materials: { frame: 'aluminum', glazing: 'glass' } } 
}: { 
  structure?: GreenhouseStructure 
}) {
  const { state } = useDesigner();
  const { room } = state;
  const groupRef = useRef<THREE.Group>(null);

  // Create realistic materials
  const materials = useMemo(() => {
    const frameColor = structure.materials.frame === 'aluminum' ? '#C0C0C0' : '#505050';
    const frameRoughness = structure.materials.frame === 'aluminum' ? 0.1 : 0.3;
    const frameMetalness = structure.materials.frame === 'aluminum' ? 0.9 : 0.8;

    return {
      frame: new THREE.MeshStandardMaterial({
        color: frameColor,
        metalness: frameMetalness,
        roughness: frameRoughness,
        envMapIntensity: 1.0,
      }),
      glazing: new THREE.MeshPhysicalMaterial({
        color: '#F0F8FF',
        transmission: 0.9,
        thickness: 0.02,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        ior: 1.5,
        transparent: true,
        opacity: 0.1,
      }),
      foundation: new THREE.MeshStandardMaterial({
        color: '#404040',
        roughness: 0.8,
        metalness: 0.1,
      }),
      ventilation: new THREE.MeshStandardMaterial({
        color: '#606060',
        metalness: 0.7,
        roughness: 0.2,
      })
    };
  }, [structure.materials]);

  // Generate structural frame geometry
  const frameGeometry = useMemo(() => {
    const frameElements: THREE.BufferGeometry[] = [];
    const tubeRadius = 0.05; // 2 inch tube diameter
    const segments = 16;

    // Foundation perimeter
    const foundationHeight = 0.3;
    frameElements.push(
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, room.width, segments)
        .translate(0, foundationHeight / 2, -room.length / 2),
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, room.width, segments)
        .translate(0, foundationHeight / 2, room.length / 2),
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, room.length, segments)
        .rotateZ(Math.PI / 2)
        .translate(-room.width / 2, foundationHeight / 2, 0),
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, room.length, segments)
        .rotateZ(Math.PI / 2)
        .translate(room.width / 2, foundationHeight / 2, 0)
    );

    // Vertical posts every 8 feet
    const postSpacing = Math.min(8, room.width / 3);
    const numPosts = Math.ceil(room.width / postSpacing) + 1;
    
    for (let i = 0; i < numPosts; i++) {
      const x = -room.width / 2 + (i * room.width) / (numPosts - 1);
      // Front posts
      frameElements.push(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, room.height, segments)
          .translate(x, room.height / 2, -room.length / 2)
      );
      // Back posts
      frameElements.push(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, room.height, segments)
          .translate(x, room.height / 2, room.length / 2)
      );
    }

    // Roof structure based on type
    if (structure.type === 'gable') {
      // Gable roof trusses
      const peakHeight = room.height + 4;
      const numTrusses = Math.ceil(room.length / 8) + 1;
      
      for (let i = 0; i < numTrusses; i++) {
        const z = -room.length / 2 + (i * room.length) / (numTrusses - 1);
        
        // Left rafter
        const leftRafter = new THREE.CylinderGeometry(tubeRadius * 0.8, tubeRadius * 0.8, 
          Math.sqrt((room.width / 2) ** 2 + (peakHeight - room.height) ** 2), segments);
        leftRafter.rotateZ(Math.atan2(peakHeight - room.height, room.width / 2));
        leftRafter.translate(-room.width / 4, room.height + (peakHeight - room.height) / 2, z);
        frameElements.push(leftRafter);

        // Right rafter
        const rightRafter = new THREE.CylinderGeometry(tubeRadius * 0.8, tubeRadius * 0.8, 
          Math.sqrt((room.width / 2) ** 2 + (peakHeight - room.height) ** 2), segments);
        rightRafter.rotateZ(-Math.atan2(peakHeight - room.height, room.width / 2));
        rightRafter.translate(room.width / 4, room.height + (peakHeight - room.height) / 2, z);
        frameElements.push(rightRafter);

        // Ridge beam (if not end truss)
        if (i < numTrusses - 1) {
          frameElements.push(
            new THREE.CylinderGeometry(tubeRadius, tubeRadius, room.length / (numTrusses - 1), segments)
              .rotateX(Math.PI / 2)
              .translate(0, peakHeight, z + room.length / (numTrusses - 1) / 2)
          );
        }
      }
    }

    // Horizontal purlins for glazing support
    const purlinSpacing = 4;
    const numPurlins = Math.ceil(room.height / purlinSpacing);
    
    for (let i = 1; i < numPurlins; i++) {
      const height = (i * room.height) / numPurlins;
      // Front purlin
      frameElements.push(
        new THREE.CylinderGeometry(tubeRadius * 0.7, tubeRadius * 0.7, room.width, segments)
          .rotateZ(Math.PI / 2)
          .translate(0, height, -room.length / 2)
      );
      // Back purlin
      frameElements.push(
        new THREE.CylinderGeometry(tubeRadius * 0.7, tubeRadius * 0.7, room.width, segments)
          .rotateZ(Math.PI / 2)
          .translate(0, height, room.length / 2)
      );
    }

    return frameElements;
  }, [room, structure.type]);

  // Generate glazing panels
  const glazingPanels = useMemo(() => {
    const panels: { geometry: THREE.PlaneGeometry; position: [number, number, number]; rotation: [number, number, number] }[] = [];
    const panelThickness = 0.01;

    // Side walls with window frames
    const panelWidth = 4;
    const panelHeight = 3;
    const wallPanelsX = Math.ceil(room.width / panelWidth);
    const wallPanelsY = Math.ceil(room.height / panelHeight);

    // North wall panels
    for (let x = 0; x < wallPanelsX; x++) {
      for (let y = 0; y < wallPanelsY; y++) {
        const panelX = -room.width / 2 + (x + 0.5) * (room.width / wallPanelsX);
        const panelY = (y + 0.5) * (room.height / wallPanelsY);
        const actualWidth = Math.min(panelWidth, room.width / wallPanelsX);
        const actualHeight = Math.min(panelHeight, room.height / wallPanelsY);
        
        panels.push({
          geometry: new THREE.PlaneGeometry(actualWidth - 0.1, actualHeight - 0.1),
          position: [panelX, panelY, -room.length / 2 + panelThickness],
          rotation: [0, 0, 0]
        });
      }
    }

    // South wall panels
    for (let x = 0; x < wallPanelsX; x++) {
      for (let y = 0; y < wallPanelsY; y++) {
        const panelX = -room.width / 2 + (x + 0.5) * (room.width / wallPanelsX);
        const panelY = (y + 0.5) * (room.height / wallPanelsY);
        const actualWidth = Math.min(panelWidth, room.width / wallPanelsX);
        const actualHeight = Math.min(panelHeight, room.height / wallPanelsY);
        
        panels.push({
          geometry: new THREE.PlaneGeometry(actualWidth - 0.1, actualHeight - 0.1),
          position: [panelX, panelY, room.length / 2 - panelThickness],
          rotation: [0, Math.PI, 0]
        });
      }
    }

    // End wall panels
    const endPanelsZ = Math.ceil(room.length / panelWidth);
    for (let z = 0; z < endPanelsZ; z++) {
      for (let y = 0; y < wallPanelsY; y++) {
        const panelZ = -room.length / 2 + (z + 0.5) * (room.length / endPanelsZ);
        const panelY = (y + 0.5) * (room.height / wallPanelsY);
        const actualWidth = Math.min(panelWidth, room.length / endPanelsZ);
        const actualHeight = Math.min(panelHeight, room.height / wallPanelsY);
        
        // East wall
        panels.push({
          geometry: new THREE.PlaneGeometry(actualWidth - 0.1, actualHeight - 0.1),
          position: [room.width / 2 - panelThickness, panelY, panelZ],
          rotation: [0, -Math.PI / 2, 0]
        });
        
        // West wall
        panels.push({
          geometry: new THREE.PlaneGeometry(actualWidth - 0.1, actualHeight - 0.1),
          position: [-room.width / 2 + panelThickness, panelY, panelZ],
          rotation: [0, Math.PI / 2, 0]
        });
      }
    }

    return panels;
  }, [room]);

  // Ventilation system
  const ventilationComponents = useMemo(() => {
    const vents: { position: [number, number, number]; size: [number, number, number] }[] = [];
    
    // Roof vents every 16 feet
    const roofVentSpacing = 16;
    const numRoofVents = Math.floor(room.length / roofVentSpacing);
    
    for (let i = 0; i < numRoofVents; i++) {
      const z = -room.length / 2 + (i + 1) * roofVentSpacing;
      vents.push({
        position: [0, room.height + 2, z],
        size: [2, 0.5, 4]
      });
    }

    // Side wall vents
    vents.push(
      {
        position: [-room.width / 2, 1, 0],
        size: [0.2, 2, room.length * 0.8]
      },
      {
        position: [room.width / 2, 1, 0],
        size: [0.2, 2, room.length * 0.8]
      }
    );

    return vents;
  }, [room]);

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[room.width + 0.5, 0.3, room.length + 0.5]} />
        <primitive object={materials.foundation} />
      </mesh>

      {/* Structural frame */}
      {frameGeometry.map((geometry, index) => (
        <mesh key={`frame-${index}`} castShadow receiveShadow>
          <primitive object={geometry} />
          <primitive object={materials.frame} />
        </mesh>
      ))}

      {/* Glazing panels */}
      {glazingPanels.map((panel, index) => (
        <mesh 
          key={`panel-${index}`} 
          position={panel.position} 
          rotation={panel.rotation}
          castShadow
          receiveShadow
        >
          <primitive object={panel.geometry} />
          <primitive object={materials.glazing} />
        </mesh>
      ))}

      {/* Ventilation components */}
      {ventilationComponents.map((vent, index) => (
        <mesh key={`vent-${index}`} position={vent.position} castShadow>
          <boxGeometry args={vent.size} />
          <primitive object={materials.ventilation} />
        </mesh>
      ))}

      {/* Floor with drainage pattern */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[room.width, room.length]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.9}
          metalness={0.1}
          normalScale={new THREE.Vector2(0.1, 0.1)}
        />
      </mesh>

      {/* Grow bench systems (if indoor growing) */}
      <group>
        {Array.from({ length: Math.floor(room.width / 8) }, (_, i) => (
          <mesh
            key={`bench-${i}`}
            position={[-room.width / 2 + 2 + i * 8, 2.5, 0]}
            castShadow
          >
            <boxGeometry args={[6, 0.1, room.length * 0.8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
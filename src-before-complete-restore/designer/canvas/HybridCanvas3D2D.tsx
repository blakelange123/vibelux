'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { useDesigner } from '../context/DesignerContext';
import { Canvas2D } from './Canvas2D';
import { 
  Maximize, Minimize, Eye, Grid3x3, Box, 
  Sun, Play, Pause, RotateCw, Settings,
  Lightbulb, Activity, Sparkles
} from 'lucide-react';

interface HybridCanvas3D2DProps {
  className?: string;
}

export function HybridCanvas3D2D({ className = '' }: HybridCanvas3D2DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const composerRef = useRef<EffectComposer>();
  const animationIdRef = useRef<number>();

  const { state } = useDesigner();
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'split'>('split');
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [showLightRays, setShowLightRays] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: quality !== 'low',
      alpha: true,
      powerPreference: quality === 'high' ? 'high-performance' : 'default'
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = quality === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    rendererRef.current = renderer;
    
    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    }

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    if (quality === 'high') {
      // Bloom effect for light glow
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight),
        0.5, // strength
        0.4, // radius
        0.85 // threshold
      );
      composer.addPass(bloomPass);

      // SSAO for ambient occlusion
      const ssaoPass = new SSAOPass(scene, camera, mountRef.current.clientWidth, mountRef.current.clientHeight);
      ssaoPass.kernelRadius = 0.5;
      ssaoPass.minDistance = 0.001;
      ssaoPass.maxDistance = 0.1;
      composer.addPass(ssaoPass);
    }
    composerRef.current = composer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(state.room.length, state.room.width, 0x444444, 0x222222);
    gridHelper.visible = showGrid;
    scene.add(gridHelper);

    // Room geometry
    createRoom(scene);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      composerRef.current?.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [quality, showGrid]);

  // Create room geometry
  const createRoom = (scene: THREE.Scene) => {
    const roomGroup = new THREE.Group();
    roomGroup.name = 'room';

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(state.room.length, state.room.width);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(state.room.length, state.room.height),
      wallMaterial
    );
    backWall.position.z = -state.room.width / 2;
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(state.room.width, state.room.height);
    
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -state.room.length / 2;
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = state.room.length / 2;
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);

    scene.add(roomGroup);
  };

  // Update fixtures in 3D scene
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove existing fixtures
    const fixtureGroup = sceneRef.current.getObjectByName('fixtures');
    if (fixtureGroup) {
      sceneRef.current.remove(fixtureGroup);
    }

    // Create new fixture group
    const newFixtureGroup = new THREE.Group();
    newFixtureGroup.name = 'fixtures';

    // Render lighting fixtures
    state.objects.filter(obj => obj.type === 'fixture').forEach((fixture, index) => {
      const fixtureData = fixture as any;
      
      // Get fixture dimensions with proper fallback hierarchy
      let length = 1.2, width = 0.6, height = 0.1;
      
      // Priority 1: Use dimensions stored on the fixture object (already converted to feet)
      if (fixtureData.model?.dimensions) {
        length = fixtureData.model.dimensions.length || 1.2;
        width = fixtureData.model.dimensions.width || 0.6;
        height = fixtureData.model.dimensions.height || 0.1;
      }
      // Priority 2: Use DLC database dimensions (convert inches to feet)
      else if (fixtureData.model?.dlcData) {
        length = fixtureData.model.dlcData.length ? fixtureData.model.dlcData.length / 12 : 1.2;
        width = fixtureData.model.dlcData.width ? fixtureData.model.dlcData.width / 12 : 0.6;
        height = fixtureData.model.dlcData.height ? fixtureData.model.dlcData.height / 12 : 0.1;
      }
      // Priority 3: Use fixture object dimensions (legacy)
      else if (fixtureData.dimensions) {
        length = fixtureData.dimensions.length || 1.2;
        width = fixtureData.dimensions.width || 0.6;
        height = fixtureData.dimensions.height || 0.1;
      }
      // Priority 4: Use fixture object width/length/height properties
      else if (fixtureData.width || fixtureData.length || fixtureData.height) {
        length = fixtureData.length || 1.2;
        width = fixtureData.width || 0.6;
        height = fixtureData.height || 0.1;
      }

      // Get fixture color based on spectrum type
      const getFixtureColor = (spectrum?: string) => {
        switch (spectrum?.toLowerCase()) {
          case 'flowering': return 0x8b0000; // Dark red
          case 'vegetative': return 0x000080; // Navy blue
          case 'full spectrum': return 0x4b0082; // Indigo
          case 'full spectrum + far red': return 0x800080; // Purple
          default: return 0x666666; // Gray
        }
      };
      
      // Fixture housing with proper DLC dimensions
      const fixtureGeometry = new THREE.BoxGeometry(length, height, width);
      const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: getFixtureColor(fixtureData.model?.spectrum),
        metalness: 0.8,
        roughness: 0.2
      });
      
      const fixtureMesh = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixtureMesh.position.set(
        fixture.x - state.room.length / 2,
        fixture.z || state.room.height - 1,
        fixture.y - state.room.width / 2
      );
      fixtureMesh.rotation.y = (fixture.rotation || 0) * Math.PI / 180;
      fixtureMesh.castShadow = true;
      fixtureMesh.userData = { 
        type: 'fixture', 
        id: fixture.id,
        model: fixtureData.model?.name || 'Unknown',
        wattage: fixtureData.model?.wattage || 0,
        ppf: fixtureData.model?.ppf || 0
      };
      newFixtureGroup.add(fixtureMesh);

      // Add manufacturer and model label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 512;
      canvas.height = 140;
      context.fillStyle = 'rgba(0, 0, 0, 0.8)';
      context.fillRect(0, 0, 512, 140);
      context.fillStyle = 'white';
      context.font = 'bold 24px Arial';
      context.textAlign = 'center';
      
      // Brand and model
      context.fillText(fixtureData.model?.manufacturer || 'Generic', 256, 35);
      context.font = '18px Arial';
      context.fillText(fixtureData.model?.name || 'LED Fixture', 256, 60);
      
      // Technical specs
      context.font = '14px Arial';
      context.fillStyle = '#00ff00';
      const specs = `${fixtureData.model?.wattage || 0}W • ${fixtureData.model?.ppf || 0} PPF`;
      context.fillText(specs, 256, 85);
      
      // Dimensions display
      context.font = '12px Arial';
      context.fillStyle = '#ffaa00';
      const dimensionsText = `${(length * 12).toFixed(1)}" × ${(width * 12).toFixed(1)}" × ${(height * 12).toFixed(1)}"`;
      context.fillText(dimensionsText, 256, 100);
      
      // DLC certified indicator
      if (fixtureData.model?.isDLC) {
        context.fillStyle = '#00aaff';
        context.font = 'bold 12px Arial';
        context.fillText('DLC CERTIFIED', 256, 120);
      }
      
      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: labelTexture, 
        transparent: true,
        side: THREE.DoubleSide
      });
      const labelGeometry = new THREE.PlaneGeometry(2, 0.5);
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.position.copy(fixtureMesh.position);
      labelMesh.position.y += height / 2 + 0.8;
      newFixtureGroup.add(labelMesh);

      // Light source with proper beam angle and intensity
      const beamAngle = (fixtureData.model?.beamAngle || 120) * Math.PI / 180;
      const intensity = (fixtureData.model?.ppf || 1000) / 200; // Scale PPF to light intensity
      
      const light = new THREE.SpotLight(0xffffff, intensity, 20, beamAngle / 2, 0.5, 2);
      light.position.copy(fixtureMesh.position);
      light.target.position.set(
        fixtureMesh.position.x,
        0,
        fixtureMesh.position.z
      );
      light.castShadow = quality !== 'low';
      light.shadow.mapSize.width = quality === 'high' ? 2048 : 1024;
      light.shadow.mapSize.height = quality === 'high' ? 2048 : 1024;
      newFixtureGroup.add(light);
      newFixtureGroup.add(light.target);

      // LED emissive surface (actual light-emitting area)
      const emissiveMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      
      // Scale emissive area to be slightly smaller than fixture housing
      const emissiveGeometry = new THREE.PlaneGeometry(
        length * 0.85,
        width * 0.85
      );
      const emissiveMesh = new THREE.Mesh(emissiveGeometry, emissiveMaterial);
      emissiveMesh.position.copy(fixtureMesh.position);
      emissiveMesh.position.y -= height / 2 + 0.01;
      emissiveMesh.rotation.x = -Math.PI / 2;
      newFixtureGroup.add(emissiveMesh);

      // Add heat sink fins for realistic appearance
      for (let i = 0; i < Math.floor(length * 8); i++) {
        const finGeometry = new THREE.BoxGeometry(0.02, height * 1.2, width * 0.1);
        const finMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.copy(fixtureMesh.position);
        fin.position.x += (-length / 2) + (i * length / Math.floor(length * 8));
        fin.position.y += height / 2 + 0.05;
        newFixtureGroup.add(fin);
      }

      // Mounting hardware
      const mountGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
      const mountMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
      
      // Corner mounts
      const mountPositions = [
        [-length/2 + 0.1, 0, -width/2 + 0.1],
        [length/2 - 0.1, 0, -width/2 + 0.1],
        [-length/2 + 0.1, 0, width/2 - 0.1],
        [length/2 - 0.1, 0, width/2 - 0.1]
      ];

      mountPositions.forEach(([x, y, z]) => {
        const mount = new THREE.Mesh(mountGeometry, mountMaterial);
        mount.position.set(
          fixtureMesh.position.x + x,
          fixtureMesh.position.y + height / 2 + 0.25,
          fixtureMesh.position.z + z
        );
        newFixtureGroup.add(mount);
      });

      // Light rays visualization
      if (showLightRays && animationEnabled) {
        const rayCount = 8;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2;
          const rayGeometry = new THREE.CylinderGeometry(0.02, 0.5, 10, 8);
          const rayMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
          });
          const ray = new THREE.Mesh(rayGeometry, rayMaterial);
          ray.position.copy(fixtureMesh.position);
          ray.rotation.z = angle * 0.2;
          ray.name = `ray-${index}-${i}`;
          newFixtureGroup.add(ray);
        }
      }
    });

    // Render HVAC equipment
    state.objects.filter(obj => obj.type === 'equipment').forEach((equipment, index) => {
      const eqData = equipment as any;
      
      // Get equipment color based on type
      const getEquipmentColor = (category: string) => {
        switch (category) {
          case 'MiniSplit': return 0x4a90e2; // Blue
          case 'RTU': return 0x7ed321; // Green
          case 'Chiller': return 0x50e3c2; // Cyan
          case 'Heater': return 0xf5a623; // Orange
          case 'HeatPump': return 0x9013fe; // Purple
          case 'AHU': return 0x6c7b7f; // Gray
          default: return 0x666666;
        }
      };

      // Main equipment housing
      const equipmentGeometry = new THREE.BoxGeometry(
        eqData.width || 2,
        eqData.height || 1,
        eqData.length || 2
      );
      
      const equipmentMaterial = new THREE.MeshStandardMaterial({
        color: getEquipmentColor(eqData.category),
        metalness: 0.7,
        roughness: 0.3
      });
      
      const equipmentMesh = new THREE.Mesh(equipmentGeometry, equipmentMaterial);
      equipmentMesh.position.set(
        eqData.x - state.room.length / 2,
        (eqData.z || 0) + (eqData.height || 1) / 2,
        eqData.y - state.room.width / 2
      );
      equipmentMesh.rotation.y = (eqData.rotation || 0) * Math.PI / 180;
      equipmentMesh.castShadow = true;
      equipmentMesh.receiveShadow = true;
      equipmentMesh.userData = { type: 'equipment', id: equipment.id, category: eqData.category };
      newFixtureGroup.add(equipmentMesh);

      // Add equipment label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = 'rgba(0, 0, 0, 0.8)';
      context.fillRect(0, 0, 256, 64);
      context.fillStyle = 'white';
      context.font = '20px Arial';
      context.textAlign = 'center';
      context.fillText(eqData.category || 'HVAC', 128, 25);
      context.fillText(eqData.name?.split(' ').slice(-1)[0] || 'Unit', 128, 45);
      
      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: labelTexture, 
        transparent: true,
        side: THREE.DoubleSide
      });
      const labelGeometry = new THREE.PlaneGeometry(1, 0.25);
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.position.copy(equipmentMesh.position);
      labelMesh.position.y += (eqData.height || 1) / 2 + 0.5;
      newFixtureGroup.add(labelMesh);

      // Add mini-split specific visual elements
      if (eqData.category === 'MiniSplit') {
        // Indoor unit (wall-mounted)
        const indoorGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.25);
        const indoorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const indoorUnit = new THREE.Mesh(indoorGeometry, indoorMaterial);
        
        // Position on wall based on mounting location
        if (eqData.x < state.room.length * 0.25) {
          // Left wall
          indoorUnit.position.set(-state.room.length / 2 + 0.1, state.room.height - 1, eqData.y - state.room.width / 2);
        } else if (eqData.x > state.room.length * 0.75) {
          // Right wall
          indoorUnit.position.set(state.room.length / 2 - 0.1, state.room.height - 1, eqData.y - state.room.width / 2);
        } else {
          // Back wall
          indoorUnit.position.set(eqData.x - state.room.length / 2, state.room.height - 1, -state.room.width / 2 + 0.1);
        }
        
        indoorUnit.castShadow = true;
        indoorUnit.userData = { type: 'equipment', subtype: 'indoor', parentId: equipment.id };
        newFixtureGroup.add(indoorUnit);

        // Airflow visualization for mini-split
        const airflowGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const airflowMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x87ceeb, 
          transparent: true, 
          opacity: 0.3 
        });
        const airflow = new THREE.Mesh(airflowGeometry, airflowMaterial);
        airflow.position.copy(indoorUnit.position);
        airflow.position.y -= 1;
        airflow.rotation.x = Math.PI;
        newFixtureGroup.add(airflow);
      }

      // Add cooling/heating capacity indicators
      if (eqData.coolingCapacity || eqData.heatingCapacity) {
        // Blue indicator for cooling
        if (eqData.coolingCapacity) {
          const coolIndicator = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshBasicMaterial({ color: 0x0066ff })
          );
          coolIndicator.position.copy(equipmentMesh.position);
          coolIndicator.position.x -= (eqData.width || 2) / 2 + 0.2;
          coolIndicator.position.y += (eqData.height || 1) / 2;
          newFixtureGroup.add(coolIndicator);
        }
        
        // Red indicator for heating
        if (eqData.heatingCapacity) {
          const heatIndicator = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshBasicMaterial({ color: 0xff3300 })
          );
          heatIndicator.position.copy(equipmentMesh.position);
          heatIndicator.position.x += (eqData.width || 2) / 2 + 0.2;
          heatIndicator.position.y += (eqData.height || 1) / 2;
          newFixtureGroup.add(heatIndicator);
        }
      }
    });

    sceneRef.current.add(newFixtureGroup);
  }, [state.objects, showLightRays, animationEnabled, quality]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    let time = 0;
    
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      time += 0.01;

      // Update controls
      controlsRef.current?.update();

      // Animate light rays
      if (animationEnabled && showLightRays) {
        const fixtureGroup = sceneRef.current?.getObjectByName('fixtures');
        if (fixtureGroup) {
          fixtureGroup.children.forEach((child) => {
            if (child.name.startsWith('ray-')) {
              child.rotation.y = time;
              const scale = 1 + Math.sin(time * 2) * 0.1;
              child.scale.y = scale;
              ((child as THREE.Mesh).material as any).opacity = 0.05 + Math.sin(time * 3) * 0.05;
            }
          });
        }
      }

      // Render
      if (quality === 'high' && composerRef.current) {
        composerRef.current.render();
      } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animationEnabled, showLightRays, quality]);

  return (
    <div className={`relative h-full ${className}`}>
      {/* View Mode Controls */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-2 shadow-lg z-10">
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('2d')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === '2d' 
                ? 'bg-purple-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title="2D View"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === '3d' 
                ? 'bg-purple-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title="3D View"
          >
            <Box className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'split' 
                ? 'bg-purple-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            title="Split View"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 shadow-lg z-10 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAnimationEnabled(!animationEnabled)}
            className={`p-2 rounded-lg transition-all ${
              animationEnabled 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {animationEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowLightRays(!showLightRays)}
            className={`p-2 rounded-lg transition-all ${
              showLightRays 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Light Rays"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-all ${
              showGrid 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Grid"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-32">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            className="w-full mt-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="h-full flex">
        {viewMode === '2d' && (
          <div className="flex-1">
            <Canvas2D />
          </div>
        )}
        
        {viewMode === '3d' && (
          <div ref={mountRef} className="flex-1">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        )}
        
        {viewMode === 'split' && (
          <>
            <div className="flex-1 border-r border-gray-300 dark:border-gray-700">
              <Canvas2D />
            </div>
            <div ref={mountRef} className="flex-1">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </>
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-purple-600" />
          <span className="text-gray-700 dark:text-gray-300">
            {state.objects.filter(o => o.type === 'fixture').length} Fixtures
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-700 dark:text-gray-300">
            {state.room.length}m × {state.room.width}m × {state.room.height}m
          </span>
        </div>
      </div>
    </div>
  );
}
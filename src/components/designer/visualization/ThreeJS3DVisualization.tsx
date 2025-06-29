'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { useDesigner } from '../context/DesignerContext';
import { 
  Box, Eye, Grid3x3, Sun, Thermometer, Activity,
  ZoomIn, ZoomOut, RotateCcw, Camera, Download
} from 'lucide-react';

interface ThreeJS3DVisualizationProps {
  viewMode: '3d' | 'ppfd' | 'thermal' | 'layers';
  onViewModeChange: (mode: '3d' | 'ppfd' | 'thermal' | 'layers') => void;
  quality?: 'low' | 'medium' | 'high';
}

const ThreeJS3DVisualizationComponent = ({ 
  viewMode, 
  onViewModeChange,
  quality = 'medium'
}: ThreeJS3DVisualizationProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const composerRef = useRef<EffectComposer>();
  const frameIdRef = useRef<number>();

  const { state } = useDesigner();
  const [showGrid, setShowGrid] = useState(true);
  const [showLightCones, setShowLightCones] = useState(true);
  const [ppfdOverlay, setPpfdOverlay] = useState(viewMode === 'ppfd');

  // Helper function to create greenhouse structure
  const createGreenhouseStructure = (room: any) => {
    const greenhouseGroup = new THREE.Group();
    greenhouseGroup.name = 'greenhouse';
    
    // Validate dimensions
    if (!room || !room.width || !room.length || !room.height) {
      console.warn('Invalid room dimensions for greenhouse');
      return greenhouseGroup;
    }
    
    // Materials
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.7,
      roughness: 0.3
    });
    
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    
    // Base dimensions
    const wallHeight = room.height * 0.6;
    const roofHeight = room.height - wallHeight;
    
    // Create frame structure
    // Corner posts
    const postSize = 0.3;
    const postGeometry = new THREE.BoxGeometry(postSize, room.height, postSize);
    
    const cornerPositions = [
      [-room.width/2, room.height/2, -room.length/2],
      [room.width/2, room.height/2, -room.length/2],
      [-room.width/2, room.height/2, room.length/2],
      [room.width/2, room.height/2, room.length/2]
    ];
    
    cornerPositions.forEach(pos => {
      const post = new THREE.Mesh(postGeometry, frameMaterial);
      post.position.set(...pos);
      post.castShadow = true;
      greenhouseGroup.add(post);
    });
    
    // Side walls (glass panels)
    const sideWallGeometry = new THREE.PlaneGeometry(room.length, wallHeight);
    
    // Left wall
    const leftWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    leftWall.position.set(-room.width/2, wallHeight/2, 0);
    leftWall.rotation.y = Math.PI / 2;
    greenhouseGroup.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    rightWall.position.set(room.width/2, wallHeight/2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    greenhouseGroup.add(rightWall);
    
    // End walls
    const endWallGeometry = new THREE.PlaneGeometry(room.width, wallHeight);
    
    // Front wall
    const frontWall = new THREE.Mesh(endWallGeometry, glassMaterial);
    frontWall.position.set(0, wallHeight/2, room.length/2);
    greenhouseGroup.add(frontWall);
    
    // Back wall
    const backWall = new THREE.Mesh(endWallGeometry, glassMaterial);
    backWall.position.set(0, wallHeight/2, -room.length/2);
    backWall.rotation.y = Math.PI;
    greenhouseGroup.add(backWall);
    
    if (room.structureType === 'single-span') {
      // Simple peaked roof
      const roofGeometry = new THREE.PlaneGeometry(
        Math.sqrt(Math.pow(room.width/2, 2) + Math.pow(roofHeight, 2)),
        room.length
      );
      
      // Left roof slope
      const leftRoof = new THREE.Mesh(roofGeometry, glassMaterial);
      leftRoof.position.set(-room.width/4, wallHeight + roofHeight/2, 0);
      leftRoof.rotation.z = Math.atan2(roofHeight, room.width/2);
      greenhouseGroup.add(leftRoof);
      
      // Right roof slope
      const rightRoof = new THREE.Mesh(roofGeometry, glassMaterial);
      rightRoof.position.set(room.width/4, wallHeight + roofHeight/2, 0);
      rightRoof.rotation.z = -Math.atan2(roofHeight, room.width/2);
      greenhouseGroup.add(rightRoof);
      
      // Ridge beam
      const ridgeBeam = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, room.length),
        frameMaterial
      );
      ridgeBeam.position.set(0, room.height, 0);
      greenhouseGroup.add(ridgeBeam);
    } else if (room.structureType === 'gutter-connect') {
      // Gutter-connect greenhouse with multiple bays
      const bayWidth = 30;
      const numBays = Math.floor(room.width / bayWidth);
      
      for (let i = 0; i < numBays; i++) {
        const bayX = -room.width/2 + (i + 0.5) * bayWidth;
        
        // Peak for each bay
        const peakBeam = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, room.length),
          frameMaterial
        );
        peakBeam.position.set(bayX, room.height, 0);
        greenhouseGroup.add(peakBeam);
        
        // Gutter between bays
        if (i < numBays - 1) {
          const gutter = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.4, room.length),
            frameMaterial
          );
          gutter.position.set(bayX + bayWidth/2, wallHeight, 0);
          greenhouseGroup.add(gutter);
        }
      }
    }
    
    return greenhouseGroup;
  };

  // Helper function to create unistrut system
  const createUnistrustSystem = (objects: any[]) => {
    const unistrustGroup = new THREE.Group();
    unistrustGroup.name = 'unistrut';

    const unistrustObjects = objects.filter(obj => obj.type === 'unistrut');
    
    unistrustObjects.forEach(obj => {
      if (obj.subType === 'run') {
        // Create unistrut beam
        const beamGeometry = new THREE.BoxGeometry(
          obj.width || 1,
          0.135, // 1.625" in feet
          0.135
        );
        const beamMaterial = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.8,
          roughness: 0.3
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(obj.x, obj.z, obj.y);
        beam.rotation.y = (obj.rotation || 0) * Math.PI / 180;
        beam.castShadow = true;
        unistrustGroup.add(beam);
        
      } else if (obj.subType === 'hanger') {
        // Create hanger hardware
        const hangerGeometry = new THREE.CylinderGeometry(0.02, 0.02, obj.height || 2, 6);
        const hangerMaterial = new THREE.MeshStandardMaterial({
          color: 0x666666,
          metalness: 0.9,
          roughness: 0.1
        });
        const hanger = new THREE.Mesh(hangerGeometry, hangerMaterial);
        hanger.position.set(obj.x, obj.z - (obj.height || 2) / 2, obj.y);
        unistrustGroup.add(hanger);
        
        // Add connector at top
        const connectorGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1);
        const connector = new THREE.Mesh(connectorGeometry, hangerMaterial);
        connector.position.set(obj.x, obj.z, obj.y);
        unistrustGroup.add(connector);
      }
    });
    
    return unistrustGroup;
  };
  
  // If no room exists, show a message
  if (!state.room) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Create a room to view 3D visualization</p>
        </div>
      </div>
    );
  }

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: quality !== 'low',
      powerPreference: quality === 'high' ? 'high-performance' : 'default'
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = quality === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    if (quality !== 'low') {
      // Bloom for light glow
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.5, // strength
        0.4, // radius
        0.85 // threshold
      );
      composer.addPass(bloomPass);

      if (quality === 'high') {
        // SSAO for ambient occlusion
        const ssaoPass = new SSAOPass(scene, camera, width, height);
        ssaoPass.kernelRadius = 5;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        composer.addPass(ssaoPass);
      }
    }
    composerRef.current = composer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Add directional light for better greenhouse visibility
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    scene.add(directionalLight);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer || !composer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, [quality]);

  // Create/update scene objects
  useEffect(() => {
    if (!sceneRef.current || !state.room) return;

    // Clear existing room and fixtures
    const roomGroup = sceneRef.current.getObjectByName('room');
    if (roomGroup) sceneRef.current.remove(roomGroup);
    
    const fixturesGroup = sceneRef.current.getObjectByName('fixtures');
    if (fixturesGroup) sceneRef.current.remove(fixturesGroup);

    // Create room
    const newRoomGroup = new THREE.Group();
    newRoomGroup.name = 'room';

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(state.room.length, state.room.width);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: state.room.structureType && state.room.structureType !== 'indoor' ? 0x3a5f3a : 0x1a1a1a, // Green for greenhouse floor
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    newRoomGroup.add(floor);

    // Only add walls and ceiling if not a greenhouse
    if (!state.room.structureType || state.room.structureType === 'indoor') {
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
      backWall.position.y = state.room.height / 2;
      backWall.receiveShadow = true;
      newRoomGroup.add(backWall);

      // Front wall (with transparency)
      const frontWallMaterial = new THREE.MeshStandardMaterial({ 
        color: wallMaterial.color,
        roughness: wallMaterial.roughness,
        metalness: wallMaterial.metalness,
        transparent: true,
        opacity: 0.1
      });
      const frontWall = new THREE.Mesh(
        new THREE.PlaneGeometry(state.room.length, state.room.height),
        frontWallMaterial
      );
      frontWall.position.z = state.room.width / 2;
      frontWall.position.y = state.room.height / 2;
      newRoomGroup.add(frontWall);

      // Side walls
      const sideWallGeometry = new THREE.PlaneGeometry(state.room.width, state.room.height);
      
      const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.x = -state.room.length / 2;
      leftWall.position.y = state.room.height / 2;
      leftWall.receiveShadow = true;
      newRoomGroup.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.position.x = state.room.length / 2;
      rightWall.position.y = state.room.height / 2;
      rightWall.receiveShadow = true;
      newRoomGroup.add(rightWall);

      // Ceiling
      const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.95,
        metalness: 0.05
      });
      const ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = state.room.height;
      newRoomGroup.add(ceiling);
    }

    // Grid helper
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(
        Math.max(state.room.length, state.room.width), 
        20, 
        0x444444, 
        0x222222
      );
      newRoomGroup.add(gridHelper);
    }

    // Add greenhouse structure if specified
    if (state.room.structureType && state.room.structureType !== 'indoor') {
      const greenhouseGroup = createGreenhouseStructure(state.room);
      if (greenhouseGroup && greenhouseGroup.children.length > 0) {
        newRoomGroup.add(greenhouseGroup);
      } else {
        console.warn('Greenhouse group was empty or invalid');
      }
    }

    sceneRef.current.add(newRoomGroup);

    // Create unistrut system
    const unistrustGroup = createUnistrustSystem(state.objects);
    if (unistrustGroup.children.length > 0) {
      sceneRef.current.add(unistrustGroup);
    }

    // Create fixtures
    const newFixturesGroup = new THREE.Group();
    newFixturesGroup.name = 'fixtures';

    state.objects.filter(obj => obj.type === 'fixture').forEach((fixture, index) => {
      const fixtureGroup = new THREE.Group();
      
      // Fixture housing
      const housingGeometry = new THREE.BoxGeometry(
        fixture.width || 1.2,
        0.15,
        fixture.length || 0.6
      );
      const housingMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.2
      });
      const housing = new THREE.Mesh(housingGeometry, housingMaterial);
      housing.castShadow = true;
      housing.receiveShadow = true;
      fixtureGroup.add(housing);

      // LED surface (emissive)
      const ledGeometry = new THREE.PlaneGeometry(
        (fixture.width || 1.2) * 0.9,
        (fixture.length || 0.6) * 0.9
      );
      const ledMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      });
      const ledSurface = new THREE.Mesh(ledGeometry, ledMaterial);
      ledSurface.rotation.x = -Math.PI / 2;
      ledSurface.position.y = -0.08;
      fixtureGroup.add(ledSurface);

      // Light source
      const light = new THREE.SpotLight(
        0xffffff, 
        (fixture as any).model?.wattage ? (fixture as any).model.wattage / 100 : 5,
        20,
        Math.PI / 3,
        0.5,
        2
      );
      light.position.y = -0.1;
      light.target.position.set(0, -10, 0);
      light.castShadow = quality !== 'low';
      light.shadow.mapSize.width = quality === 'high' ? 2048 : 1024;
      light.shadow.mapSize.height = quality === 'high' ? 2048 : 1024;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 20;
      fixtureGroup.add(light);
      fixtureGroup.add(light.target);

      // Light cone visualization
      if (showLightCones) {
        const coneGeometry = new THREE.ConeGeometry(5, 10, 32, 1, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = Math.PI;
        cone.position.y = -5;
        fixtureGroup.add(cone);
      }

      // Position the fixture (validate position values)
      const posX = isNaN(fixture.x) ? 0 : fixture.x - state.room.length / 2;
      const posY = isNaN(fixture.z || 0) ? state.room.height - 1 : fixture.z || state.room.height - 1;
      const posZ = isNaN(fixture.y) ? 0 : fixture.y - state.room.width / 2;
      
      fixtureGroup.position.set(posX, posY, posZ);
      
      newFixturesGroup.add(fixtureGroup);
    });

    sceneRef.current.add(newFixturesGroup);

    // Add PPFD heatmap if in PPFD mode
    if (viewMode === 'ppfd' && ppfdOverlay) {
      createPPFDHeatmap();
    }

    // Add thermal visualization if in thermal mode
    if (viewMode === 'thermal') {
      createThermalVisualization();
    }

  }, [state.room, state.objects, showGrid, showLightCones, viewMode, ppfdOverlay]);

  // Create PPFD heatmap
  const createPPFDHeatmap = useCallback(() => {
    if (!sceneRef.current) return;

    const resolution = 50;
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(resolution, resolution);
    const data = imageData.data;

    // Calculate PPFD values
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const worldX = (x / resolution) * state.room.length - state.room.length / 2;
        const worldZ = (y / resolution) * state.room.width - state.room.width / 2;
        
        let totalPPFD = 0;
        state.objects.filter(obj => obj.type === 'fixture').forEach(fixture => {
          // Validate fixture position values
          const fixtureX = isNaN(fixture.x) ? 0 : fixture.x;
          const fixtureY = isNaN(fixture.y) ? 0 : fixture.y;
          const fixtureZ = isNaN(fixture.z || 0) ? state.room.height - 1 : fixture.z || state.room.height - 1;
          
          const dx = worldX - (fixtureX - state.room.length / 2);
          const dy = (state.room.workingHeight || 3) - fixtureZ;
          const dz = worldZ - (fixtureY - state.room.width / 2);
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance > 0.1 && !isNaN(distance)) {
            const ppf = (fixture as any).model?.ppf || 1000;
            const intensity = ppf / (4 * Math.PI * distance * distance);
            if (!isNaN(intensity)) {
              totalPPFD += intensity;
            }
          }
        });

        // Map PPFD to color
        const normalized = Math.min(totalPPFD / 1000, 1);
        const i = (y * resolution + x) * 4;
        
        // Gradient from blue to green to yellow to red
        if (normalized < 0.25) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 255 * (normalized * 4);
        } else if (normalized < 0.5) {
          data[i] = 0;
          data[i + 1] = 255 * ((normalized - 0.25) * 4);
          data[i + 2] = 255 * (1 - (normalized - 0.25) * 4);
        } else if (normalized < 0.75) {
          data[i] = 255 * ((normalized - 0.5) * 4);
          data[i + 1] = 255;
          data[i + 2] = 0;
        } else {
          data[i] = 255;
          data[i + 1] = 255 * (1 - (normalized - 0.75) * 4);
          data[i + 2] = 0;
        }
        data[i + 3] = 180; // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Create plane for heatmap
    const heatmapGeometry = new THREE.PlaneGeometry(state.room.length, state.room.width);
    const heatmapMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const heatmap = new THREE.Mesh(heatmapGeometry, heatmapMaterial);
    heatmap.rotation.x = -Math.PI / 2;
    heatmap.position.y = state.room.workingHeight || 3;
    heatmap.name = 'ppfdHeatmap';
    
    sceneRef.current.add(heatmap);
  }, [state.room, state.objects]);

  // Create thermal visualization
  const createThermalVisualization = () => {
    if (!sceneRef.current) return;

    // Add temperature indicators to fixtures
    state.objects.filter(obj => obj.type === 'fixture').forEach((fixture, index) => {
      const wattage = (fixture as any).model?.wattage || 600;
      const tempIndicator = new THREE.Mesh(
        new THREE.SphereGeometry(0.2),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.05 - wattage / 10000, 1, 0.5)
        })
      );
      const thermalPosX = isNaN(fixture.x) ? 0 : fixture.x - state.room.length / 2;
      const thermalPosY = isNaN(fixture.z || 0) ? state.room.height - 1 + 0.3 : (fixture.z || state.room.height - 1) + 0.3;
      const thermalPosZ = isNaN(fixture.y) ? 0 : fixture.y - state.room.width / 2;
      
      tempIndicator.position.set(thermalPosX, thermalPosY, thermalPosZ);
      tempIndicator.name = 'thermalIndicator';
      sceneRef.current!.add(tempIndicator);
    });
  };

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      // Update controls
      controlsRef.current?.update();

      // Render
      if (quality === 'low') {
        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      } else {
        composerRef.current?.render();
      }
    };

    animate();

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [quality]);

  // Camera controls
  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.zoom *= 1.2;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.zoom /= 1.2;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(15, 15, 15);
      cameraRef.current.zoom = 1;
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleScreenshot = () => {
    if (rendererRef.current) {
      const canvas = rendererRef.current.domElement;
      const link = document.createElement('a');
      link.download = `3d-view-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        {/* View Mode Selector */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 space-y-1">
          <button
            onClick={() => onViewModeChange('3d')}
            className={`w-full px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              viewMode === '3d' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Box className="w-4 h-4" />
            <span className="text-sm">3D View</span>
          </button>
          <button
            onClick={() => onViewModeChange('ppfd')}
            className={`w-full px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              viewMode === 'ppfd' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span className="text-sm">PPFD Map</span>
          </button>
          <button
            onClick={() => onViewModeChange('thermal')}
            className={`w-full px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              viewMode === 'thermal' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span className="text-sm">Thermal</span>
          </button>
        </div>

        {/* View Options */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-gray-600"
            />
            Show Grid
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showLightCones}
              onChange={(e) => setShowLightCones(e.target.checked)}
              className="rounded border-gray-600"
            />
            Show Light Cones
          </label>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 space-y-1">
        <button
          onClick={handleZoomIn}
          className="p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleScreenshot}
          className="p-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
          title="Take Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Info Panel */}
      {state.room && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-gray-400 space-y-1">
            <div>Room: {state.room.length}m × {state.room.width}m × {state.room.height}m</div>
            <div>Fixtures: {state.objects.filter(o => o.type === 'fixture').length}</div>
            <div>Quality: {quality}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export memoized component
export const ThreeJS3DVisualization = memo(ThreeJS3DVisualizationComponent);
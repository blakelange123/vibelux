'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box as ThreeBox, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { FixtureLibrary, type FixtureModel } from '../FixtureLibrary';
import {
  Grid3x3,
  Move3d,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Layers,
  Ruler,
  Square,
  Circle,
  Triangle,
  Box,
  Lightbulb,
  Camera,
  Save,
  FolderOpen,
  Download,
  Upload,
  Copy,
  Scissors,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Minimize2,
  Settings,
  Info,
  Undo,
  Redo,
  MousePointer,
  Hand,
  Crosshair,
  Sun,
  Thermometer,
  Wind,
  Droplets,
  Package,
  Users,
  Trash2,
  Edit,
  Lock,
  Unlock,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface CADObject {
  id: string;
  type: 'room' | 'fixture' | 'rack' | 'table' | 'wall' | 'door' | 'window' | 'equipment';
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  dimensions: { length: number; width: number; height: number };
  properties: Record<string, any>;
  visible: boolean;
  locked: boolean;
  selected: boolean;
  layer: string;
  material?: string;
  color?: string;
}

interface CADLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  objects: string[];
}

interface CADViewport {
  id: string;
  name: string;
  type: 'perspective' | 'top' | 'front' | 'right' | 'isometric';
  camera: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  };
  active: boolean;
}

// 3D Scene Component
function Scene3D({ objects, selectedObjects, onObjectSelect, viewportType, gridVisible, gridSize }: {
  objects: CADObject[];
  selectedObjects: string[];
  onObjectSelect: (id: string, multiSelect?: boolean) => void;
  viewportType: string;
  gridVisible: boolean;
  gridSize: number;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={viewportType === 'perspective'}
        target={[0, 0, 0]}
      />
      
      {/* Grid */}
      {gridVisible && (
        <Grid 
          args={[50, 50]} 
          cellSize={gridSize} 
          cellThickness={0.5}
          cellColor="#333333"
          sectionSize={gridSize * 5}
          sectionThickness={1}
          sectionColor="#555555"
          fadeDistance={100}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}
      
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} />
      </mesh>
      
      {/* 3D Objects */}
      {objects.map(obj => (
        <CADObject3D
          key={obj.id}
          object={obj}
          selected={selectedObjects.includes(obj.id)}
          onClick={(e) => {
            e.stopPropagation();
            onObjectSelect(obj.id, e.shiftKey);
          }}
        />
      ))}
      
      {/* Axis Helper */}
      <primitive object={new THREE.AxesHelper(5)} />
    </>
  );
}

// Individual 3D Object Component
function CADObject3D({ object, selected, onClick }: {
  object: CADObject;
  selected: boolean;
  onClick: (e: any) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const getObjectColor = (type: string) => {
    switch (type) {
      case 'room': return '#4a5568';
      case 'fixture': return '#ffd700';
      case 'equipment': return '#48bb78';
      case 'wall': return '#a0aec0';
      default: return '#718096';
    }
  };
  
  const getObjectGeometry = (obj: CADObject) => {
    switch (obj.type) {
      case 'fixture':
        return <cylinderGeometry args={[obj.dimensions.length/4, obj.dimensions.length/4, obj.dimensions.height/4, 16]} />;
      case 'equipment':
        return <sphereGeometry args={[Math.min(obj.dimensions.length, obj.dimensions.width, obj.dimensions.height)/4, 16, 16]} />;
      default:
        return <boxGeometry args={[obj.dimensions.length, obj.dimensions.height, obj.dimensions.width]} />;
    }
  };
  
  return (
    <group position={[object.position.x, object.position.y, object.position.z]}>
      {/* Main Object */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        castShadow
        receiveShadow
        scale={[object.scale.x, object.scale.y, object.scale.z]}
        rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
      >
        {getObjectGeometry(object)}
        <meshStandardMaterial 
          color={selected ? '#ff6b6b' : getObjectColor(object.type)}
          transparent={selected}
          opacity={selected ? 0.8 : 1}
          wireframe={selected}
        />
      </mesh>
      
      {/* Object Label */}
      <Text
        position={[0, object.dimensions.height/2 + 0.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {object.name}
      </Text>
      
      {/* Selection Outline */}
      {selected && (
        <mesh>
          <boxGeometry args={[
            object.dimensions.length + 0.1,
            object.dimensions.height + 0.1,
            object.dimensions.width + 0.1
          ]} />
          <meshStandardMaterial 
            color="#ff6b6b"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

export function ProfessionalCADDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'select' | 'move' | 'rotate' | 'scale' | 'draw' | 'measure'>('select');
  const [drawMode, setDrawMode] = useState<'room' | 'wall' | 'fixture' | 'equipment'>('room');
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [objects, setObjects] = useState<CADObject[]>([]);
  const [layers, setLayers] = useState<CADLayer[]>([
    { id: 'architecture', name: 'Architecture', visible: true, locked: false, color: '#ffffff', objects: [] },
    { id: 'lighting', name: 'Lighting', visible: true, locked: false, color: '#ffff00', objects: [] },
    { id: 'equipment', name: 'Equipment', visible: true, locked: false, color: '#00ff00', objects: [] },
    { id: 'dimensions', name: 'Dimensions', visible: true, locked: false, color: '#ff0000', objects: [] }
  ]);
  const [viewports, setViewports] = useState<CADViewport[]>([
    {
      id: 'perspective',
      name: 'Perspective',
      type: 'perspective',
      camera: { position: { x: 10, y: 10, z: 10 }, target: { x: 0, y: 0, z: 0 }, fov: 60 },
      active: true
    },
    {
      id: 'top',
      name: 'Top',
      type: 'top',
      camera: { position: { x: 0, y: 20, z: 0 }, target: { x: 0, y: 0, z: 0 }, fov: 60 },
      active: false
    },
    {
      id: 'front',
      name: 'Front',
      type: 'front',
      camera: { position: { x: 0, y: 0, z: 20 }, target: { x: 0, y: 0, z: 0 }, fov: 60 },
      active: false
    }
  ]);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(1); // 1 meter
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [showProperties, setShowProperties] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [precision, setPrecision] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Professional CAD toolbar tools
  const mainTools = [
    { id: 'select', icon: MousePointer, label: 'Select', shortcut: 'S' },
    { id: 'move', icon: Move3d, label: 'Move', shortcut: 'M' },
    { id: 'rotate', icon: RotateCcw, label: 'Rotate', shortcut: 'R' },
    { id: 'scale', icon: Maximize2, label: 'Scale', shortcut: 'Shift+S' },
    { id: 'draw', icon: Square, label: 'Draw', shortcut: 'D' },
    { id: 'measure', icon: Ruler, label: 'Measure', shortcut: 'Shift+M' }
  ];

  const drawingTools = [
    { id: 'room', icon: Square, label: 'Room', shortcut: 'Alt+R' },
    { id: 'wall', icon: Box, label: 'Wall', shortcut: 'Alt+W' },
    { id: 'fixture', icon: Lightbulb, label: 'Fixture', shortcut: 'Alt+F' },
    { id: 'equipment', icon: Package, label: 'Equipment', shortcut: 'Alt+E' }
  ];

  const viewTools = [
    { id: 'zoom-in', icon: ZoomIn, label: 'Zoom In', shortcut: '+' },
    { id: 'zoom-out', icon: ZoomOut, label: 'Zoom Out', shortcut: '-' },
    { id: 'zoom-fit', icon: Maximize2, label: 'Zoom Fit', shortcut: 'F' },
    { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'Space' }
  ];

  const [selectedFixture, setSelectedFixture] = useState<FixtureModel | null>(null);

  const equipmentLibrary = [
    { id: 'hvac-unit', name: 'HVAC Unit', type: 'climate', capacity: '5 ton', dimensions: '48x24x36' },
    { id: 'dehumidifier', name: 'Dehumidifier', type: 'climate', capacity: '100 pint', dimensions: '24x18x30' },
    { id: 'co2-generator', name: 'CO₂ Generator', type: 'climate', capacity: '8 burner', dimensions: '30x20x24' },
    { id: 'circulation-fan', name: 'Circulation Fan', type: 'airflow', capacity: '18 inch', dimensions: '18x18x12' },
    { id: 'exhaust-fan', name: 'Exhaust Fan', type: 'airflow', capacity: '12 inch', dimensions: '12x12x8' }
  ];

  // Initialize 3D scene
  useEffect(() => {
    const activeViewport = viewports.find(v => v.active);
    if (activeViewport?.type === 'top' && canvasRef.current) {
      initializeCADScene();
    }
  }, []);

  const initializeCADScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear and draw grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gridVisible) {
      drawGrid(ctx, canvas.offsetWidth, canvas.offsetHeight);
    }

    // Draw objects
    objects.forEach(obj => {
      if (obj.visible) {
        drawCADObject(ctx, obj);
      }
    });
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSpacing = gridSize * 20; // Scale for display
    
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= width; x += gridSpacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSpacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();

    // Draw major grid lines
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const majorSpacing = gridSpacing * 5;
    
    for (let x = 0; x <= width; x += majorSpacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += majorSpacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  };

  const drawCADObject = (ctx: CanvasRenderingContext2D, obj: CADObject) => {
    const { position, dimensions, selected, type } = obj;
    const x = position.x * 20 + 400; // Center offset
    const y = position.z * 20 + 300; // Using Z for 2D top view
    const width = dimensions.length * 20;
    const height = dimensions.width * 20;

    // Set style based on object type and selection
    ctx.strokeStyle = selected ? '#ff6b6b' : getObjectColor(type);
    ctx.lineWidth = selected ? 3 : 2;
    ctx.fillStyle = selected ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 255, 255, 0.05)';

    // Draw object
    ctx.beginPath();
    ctx.rect(x - width/2, y - height/2, width, height);
    ctx.fill();
    ctx.stroke();

    // Draw object label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(obj.name, x, y + 4);

    // Draw dimensions if selected
    if (selected) {
      drawDimensions(ctx, x, y, width, height, obj.dimensions);
    }
  };

  const drawDimensions = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, dims: any) => {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffff00';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    // Width dimension
    const topY = y - height/2 - 20;
    ctx.beginPath();
    ctx.moveTo(x - width/2, topY);
    ctx.lineTo(x + width/2, topY);
    ctx.moveTo(x - width/2, topY - 5);
    ctx.lineTo(x - width/2, topY + 5);
    ctx.moveTo(x + width/2, topY - 5);
    ctx.lineTo(x + width/2, topY + 5);
    ctx.stroke();
    
    const widthText = units === 'metric' ? `${dims.length.toFixed(precision)}m` : `${(dims.length * 3.28084).toFixed(precision)}'`;
    ctx.fillText(widthText, x, topY - 8);

    // Height dimension
    const rightX = x + width/2 + 20;
    ctx.beginPath();
    ctx.moveTo(rightX, y - height/2);
    ctx.lineTo(rightX, y + height/2);
    ctx.moveTo(rightX - 5, y - height/2);
    ctx.lineTo(rightX + 5, y - height/2);
    ctx.moveTo(rightX - 5, y + height/2);
    ctx.lineTo(rightX + 5, y + height/2);
    ctx.stroke();
    
    ctx.save();
    ctx.translate(rightX + 8, y);
    ctx.rotate(-Math.PI/2);
    const heightText = units === 'metric' ? `${dims.width.toFixed(precision)}m` : `${(dims.width * 3.28084).toFixed(precision)}'`;
    ctx.fillText(heightText, 0, 0);
    ctx.restore();
  };

  const getObjectColor = (type: string) => {
    switch (type) {
      case 'room': return '#ffffff';
      case 'fixture': return '#ffff00';
      case 'equipment': return '#00ff00';
      case 'wall': return '#cccccc';
      default: return '#888888';
    }
  };

  const addCADObject = (type: string, name: string, fixture?: FixtureModel) => {
    let dimensions = { length: 2, width: 2, height: 2.5 };
    let properties: Record<string, any> = {};
    
    if (fixture) {
      // Use fixture data to set realistic dimensions and properties
      const fixtureWidth = fixture.dlcData?.width ? fixture.dlcData.width / 12 : 2; // Convert inches to feet
      const fixtureLength = fixture.dlcData?.length ? fixture.dlcData.length / 12 : 4;
      const fixtureHeight = fixture.dlcData?.height ? fixture.dlcData.height / 12 : 0.25;
      
      dimensions = {
        length: fixtureLength,
        width: fixtureWidth,
        height: fixtureHeight
      };
      
      properties = {
        fixture: fixture,
        wattage: fixture.wattage,
        ppf: fixture.ppf,
        efficacy: fixture.efficacy,
        spectrum: fixture.spectrum,
        dlcQualified: true
      };
    }
    
    const newObject: CADObject = {
      id: `obj-${Date.now()}`,
      type: type as any,
      name: name,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions,
      properties,
      visible: true,
      locked: false,
      selected: false,
      layer: type === 'fixture' ? 'lighting' : type === 'equipment' ? 'equipment' : 'architecture'
    };

    setObjects(prev => [...prev, newObject]);
    setSelectedObjects([newObject.id]);
    
    // Update layer
    const layerId = newObject.layer;
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, objects: [...layer.objects, newObject.id] }
        : layer
    ));
  };
  
  const addFixtureFromLibrary = (fixture: FixtureModel) => {
    addCADObject('fixture', `${fixture.brand} ${fixture.model}`, fixture);
    setSelectedFixture(fixture);
  };

  const selectObject = (objectId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedObjects(prev => 
        prev.includes(objectId) 
          ? prev.filter(id => id !== objectId)
          : [...prev, objectId]
      );
    } else {
      setSelectedObjects([objectId]);
    }

    setObjects(prev => prev.map(obj => ({
      ...obj,
      selected: multiSelect 
        ? (obj.id === objectId ? !obj.selected : obj.selected)
        : obj.id === objectId
    })));
  };

  const deleteSelectedObjects = () => {
    setObjects(prev => prev.filter(obj => !selectedObjects.includes(obj.id)));
    setSelectedObjects([]);
    
    // Update layers
    setLayers(prev => prev.map(layer => ({
      ...layer,
      objects: layer.objects.filter(id => !selectedObjects.includes(id))
    })));
  };

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));

    // Update object visibility
    setObjects(prev => prev.map(obj => {
      const layer = layers.find(l => l.id === obj.layer);
      return layer?.id === layerId 
        ? { ...obj, visible: !layer.visible }
        : obj;
    }));
  };

  const exportCAD = () => {
    const cadData = {
      version: '1.0',
      units: units,
      objects: objects,
      layers: layers,
      viewports: viewports,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(cadData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facility-design-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCAD = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const cadData = JSON.parse(e.target?.result as string);
        setObjects(cadData.objects || []);
        setLayers(cadData.layers || layers);
        setViewports(cadData.viewports || viewports);
        setUnits(cadData.units || units);
        alert('CAD file imported successfully!');
      } catch (error) {
        alert('Error importing CAD file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Re-render when objects change
  useEffect(() => {
    const activeViewport = viewports.find(v => v.active);
    if (activeViewport?.type === 'top') {
      initializeCADScene();
    }
  }, [objects, gridVisible, selectedObjects, viewports]);

  return (
    <div className={`bg-gray-950 text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Professional CAD Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">Vibelux CAD Designer</h1>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 text-sm hover:bg-gray-800 rounded">File</button>
              <button className="px-3 py-1 text-sm hover:bg-gray-800 rounded">Edit</button>
              <button className="px-3 py-1 text-sm hover:bg-gray-800 rounded">View</button>
              <button className="px-3 py-1 text-sm hover:bg-gray-800 rounded">Insert</button>
              <button className="px-3 py-1 text-sm hover:bg-gray-800 rounded">Tools</button>
              <button className="px-3 py-1 text-sm hover:bg-gray-800 rounded">Analysis</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={units} 
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
            
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:bg-gray-800 rounded"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="bg-gray-900 border-b border-gray-800 p-2">
        <div className="flex items-center gap-4">
          {/* File Operations */}
          <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
            <button className="p-2 hover:bg-gray-800 rounded" title="New">
              <FolderOpen className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded" title="Save">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={exportCAD} className="p-2 hover:bg-gray-800 rounded" title="Export">
              <Download className="w-4 h-4" />
            </button>
            <label className="p-2 hover:bg-gray-800 rounded cursor-pointer" title="Import">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={importCAD} className="hidden" />
            </label>
          </div>

          {/* Edit Operations */}
          <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
            <button className="p-2 hover:bg-gray-800 rounded" title="Undo">
              <Undo className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded" title="Redo">
              <Redo className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded" title="Copy">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={deleteSelectedObjects} className="p-2 hover:bg-gray-800 rounded" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Main Tools */}
          <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
            {mainTools.map(toolItem => (
              <button
                key={toolItem.id}
                onClick={() => setTool(toolItem.id as any)}
                className={`p-2 rounded transition-colors ${
                  tool === toolItem.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
                }`}
                title={`${toolItem.label} (${toolItem.shortcut})`}
              >
                <toolItem.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Drawing Tools */}
          {tool === 'draw' && (
            <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
              {drawingTools.map(drawTool => (
                <button
                  key={drawTool.id}
                  onClick={() => setDrawMode(drawTool.id as any)}
                  className={`p-2 rounded transition-colors ${
                    drawMode === drawTool.id ? 'bg-green-600 text-white' : 'hover:bg-gray-800'
                  }`}
                  title={`${drawTool.label} (${drawTool.shortcut})`}
                >
                  <drawTool.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          {/* View Tools */}
          <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
            {viewTools.map(viewTool => (
              <button
                key={viewTool.id}
                className="p-2 hover:bg-gray-800 rounded"
                title={`${viewTool.label} (${viewTool.shortcut})`}
              >
                <viewTool.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* View Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGridVisible(!gridVisible)}
              className={`p-2 rounded ${gridVisible ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`}
              title="Toggle Grid"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`p-2 rounded ${snapToGrid ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`}
              title="Snap to Grid"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Sidebar - Object Library */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* DLC Fixture Library */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                DLC Fixture Library
              </h3>
              <div className="max-h-64 overflow-hidden">
                <FixtureLibrary 
                  onSelectFixture={addFixtureFromLibrary}
                  selectedFixtureId={selectedFixture?.id}
                  showDetails={false}
                  customFilter={(fixtures) => fixtures.slice(0, 20)} // Show top 20 efficient fixtures
                />
              </div>
            </div>

            {/* Equipment Library */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Equipment Library
              </h3>
              <div className="space-y-1">
                {equipmentLibrary.map(equipment => (
                  <button
                    key={equipment.id}
                    onClick={() => addCADObject('equipment', equipment.name)}
                    className="w-full text-left p-2 text-sm hover:bg-gray-800 rounded border border-gray-700"
                  >
                    <div className="font-medium">{equipment.name}</div>
                    <div className="text-xs text-gray-400">{equipment.capacity}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Objects */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Quick Objects</h3>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => addCADObject('room', 'Room')}
                  className="p-2 text-xs hover:bg-gray-800 rounded border border-gray-700"
                >
                  Room
                </button>
                <button
                  onClick={() => addCADObject('wall', 'Wall')}
                  className="p-2 text-xs hover:bg-gray-800 rounded border border-gray-700"
                >
                  Wall
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Design Area */}
        <div className="flex-1 flex flex-col">
          {/* Viewport Tabs */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2">
            <div className="flex gap-1">
              {viewports.map(viewport => (
                <button
                  key={viewport.id}
                  className={`px-3 py-1 text-sm rounded-t border-b-2 ${
                    viewport.active 
                      ? 'bg-gray-800 border-blue-500 text-white' 
                      : 'border-transparent hover:bg-gray-800 text-gray-400'
                  }`}
                  onClick={() => setViewports(prev => prev.map(v => ({ ...v, active: v.id === viewport.id })))}
                >
                  {viewport.name}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative bg-gray-950">
            {(() => {
              const activeViewport = viewports.find(v => v.active);
              
              if (activeViewport?.type === 'top') {
                // 2D Top View (Canvas)
                return (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onClick={(e) => {
                      // Handle canvas clicks for object selection
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect) {
                        const x = (e.clientX - rect.left - 400) / 20; // Convert to world coordinates
                        const y = (e.clientY - rect.top - 300) / 20;
                        
                        // Find clicked object
                        const clickedObject = objects.find(obj => {
                          const objX = obj.position.x;
                          const objZ = obj.position.z;
                          const halfWidth = obj.dimensions.length / 2;
                          const halfHeight = obj.dimensions.width / 2;
                          
                          return x >= objX - halfWidth && x <= objX + halfWidth &&
                                 y >= objZ - halfHeight && y <= objZ + halfHeight;
                        });
                        
                        if (clickedObject) {
                          selectObject(clickedObject.id, e.shiftKey);
                        } else {
                          setSelectedObjects([]);
                          setObjects(prev => prev.map(obj => ({ ...obj, selected: false })));
                        }
                      }
                    }}
                  />
                );
              } else {
                // 3D Views (Three.js)
                return (
                  <Canvas
                    className="w-full h-full"
                    camera={{
                      position: [
                        activeViewport?.camera.position.x || 10,
                        activeViewport?.camera.position.y || 10,
                        activeViewport?.camera.position.z || 10
                      ],
                      fov: activeViewport?.camera.fov || 60
                    }}
                    style={{ background: '#0f0f23' }}
                  >
                    <Suspense fallback={null}>
                      <Scene3D 
                        objects={objects}
                        selectedObjects={selectedObjects}
                        onObjectSelect={selectObject}
                        viewportType={activeViewport?.type || 'perspective'}
                        gridVisible={gridVisible}
                        gridSize={gridSize}
                      />
                    </Suspense>
                  </Canvas>
                );
              }
            })()}
            
            {/* Coordinate Display */}
            <div className="absolute bottom-4 left-4 bg-gray-900 px-3 py-1 rounded text-sm">
              Tool: {tool} | Grid: {gridSize}{units === 'metric' ? 'm' : 'ft'} | Objects: {objects.length}
            </div>
            
            {/* View Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="p-2 bg-gray-900 hover:bg-gray-800 rounded">
                <Monitor className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-900 hover:bg-gray-800 rounded">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers and Properties */}
        {(showLayers || showProperties) && (
          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            {/* Layers Panel */}
            {showLayers && (
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Layers
                  </h3>
                  <button
                    onClick={() => setShowLayers(false)}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {layers.map(layer => (
                    <div key={layer.id} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded">
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className="p-1"
                      >
                        {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <div 
                        className="w-3 h-3 rounded border border-gray-600"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm flex-1">{layer.name}</span>
                      <span className="text-xs text-gray-400">{layer.objects.length}</span>
                      <button className="p-1">
                        {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Properties Panel */}
            {showProperties && selectedObjects.length > 0 && (
              <div className="p-4 flex-1">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Properties
                </h3>
                
                {selectedObjects.length === 1 && (() => {
                  const obj = objects.find(o => o.id === selectedObjects[0]);
                  if (!obj) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400">Name</label>
                        <input
                          type="text"
                          value={obj.name}
                          onChange={(e) => setObjects(prev => prev.map(o => 
                            o.id === obj.id ? { ...o, name: e.target.value } : o
                          ))}
                          className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-400">Length</label>
                          <input
                            type="number"
                            value={obj.dimensions.length}
                            onChange={(e) => setObjects(prev => prev.map(o => 
                              o.id === obj.id 
                                ? { ...o, dimensions: { ...o.dimensions, length: parseFloat(e.target.value) || 0 } }
                                : o
                            ))}
                            className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Width</label>
                          <input
                            type="number"
                            value={obj.dimensions.width}
                            onChange={(e) => setObjects(prev => prev.map(o => 
                              o.id === obj.id 
                                ? { ...o, dimensions: { ...o.dimensions, width: parseFloat(e.target.value) || 0 } }
                                : o
                            ))}
                            className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Height</label>
                          <input
                            type="number"
                            value={obj.dimensions.height}
                            onChange={(e) => setObjects(prev => prev.map(o => 
                              o.id === obj.id 
                                ? { ...o, dimensions: { ...o.dimensions, height: parseFloat(e.target.value) || 0 } }
                                : o
                            ))}
                            className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                            step="0.1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-400">X</label>
                          <input
                            type="number"
                            value={obj.position.x}
                            onChange={(e) => setObjects(prev => prev.map(o => 
                              o.id === obj.id 
                                ? { ...o, position: { ...o.position, x: parseFloat(e.target.value) || 0 } }
                                : o
                            ))}
                            className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Y</label>
                          <input
                            type="number"
                            value={obj.position.y}
                            onChange={(e) => setObjects(prev => prev.map(o => 
                              o.id === obj.id 
                                ? { ...o, position: { ...o.position, y: parseFloat(e.target.value) || 0 } }
                                : o
                            ))}
                            className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Z</label>
                          <input
                            type="number"
                            value={obj.position.z}
                            onChange={(e) => setObjects(prev => prev.map(o => 
                              o.id === obj.id 
                                ? { ...o, position: { ...o.position, z: parseFloat(e.target.value) || 0 } }
                                : o
                            ))}
                            className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                            step="0.1"
                          />
                        </div>
                      </div>
                      
                      {obj.type === 'fixture' && obj.properties?.fixture && (
                        <div className="border-t border-gray-800 pt-3">
                          <h4 className="text-xs font-semibold text-gray-400 mb-2">DLC Fixture Properties</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Brand:</span>
                              <span>{obj.properties.fixture.brand}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Model:</span>
                              <span>{obj.properties.fixture.model}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>PPF Output:</span>
                              <span>{obj.properties.fixture.ppf} μmol/s</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Power Draw:</span>
                              <span>{obj.properties.fixture.wattage}W</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Efficacy:</span>
                              <span>{obj.properties.fixture.efficacy.toFixed(1)} μmol/J</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Spectrum:</span>
                              <span>{obj.properties.fixture.spectrum}</span>
                            </div>
                            {obj.properties.fixture.voltage && (
                              <div className="flex justify-between">
                                <span>Voltage:</span>
                                <span>{obj.properties.fixture.voltage}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>DLC Qualified:</span>
                              <span className="text-green-400">✓ Yes</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Ready</span>
            <span>Snap: {snapToGrid ? 'ON' : 'OFF'}</span>
            <span>Grid: {gridSize}{units === 'metric' ? 'm' : 'ft'}</span>
            <span>Precision: {precision} decimal places</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Selected: {selectedObjects.length}</span>
            <span>Total Objects: {objects.length}</span>
            <span>Active Layer: {layers.find(l => l.objects.some(id => selectedObjects.includes(id)))?.name || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
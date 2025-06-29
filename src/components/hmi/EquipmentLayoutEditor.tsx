'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Move, Grid, Save, RotateCw, ZoomIn, ZoomOut, 
  Download, Upload, Maximize2, Lock, Unlock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EquipmentPosition {
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  locked: boolean;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'warning' | 'error';
  icon: string;
}

interface EquipmentLayoutEditorProps {
  facilityId: string;
  roomId?: string;
  equipment: Equipment[];
  onSave: (positions: Record<string, EquipmentPosition>) => void;
}

export function EquipmentLayoutEditor({ 
  facilityId, 
  roomId, 
  equipment,
  onSave 
}: EquipmentLayoutEditorProps) {
  const [positions, setPositions] = useState<Record<string, EquipmentPosition>>(() => {
    // Initialize positions with grid layout
    const initialPositions: Record<string, EquipmentPosition> = {};
    equipment.forEach((eq, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      initialPositions[eq.id] = {
        id: eq.id,
        x: col * 150 + 50,
        y: row * 150 + 50,
        rotation: 0,
        width: 100,
        height: 100,
        locked: false
      };
    });
    return initialPositions;
  });

  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const gridSize = 20;

  const canvasRef = useRef<HTMLDivElement>(null);

  // Snap position to grid
  const snapPosition = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // Handle mouse down on equipment
  const handleMouseDown = (e: React.MouseEvent, equipmentId: string) => {
    if (positions[equipmentId]?.locked) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pos = positions[equipmentId];
    setSelectedEquipment(equipmentId);
    setIsDragging(true);
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - panOffset.x - pos.x,
      y: (e.clientY - rect.top) / zoom - panOffset.y - pos.y
    });
  };

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedEquipment || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapPosition((e.clientX - rect.left) / zoom - panOffset.x - dragOffset.x);
    const y = snapPosition((e.clientY - rect.top) / zoom - panOffset.y - dragOffset.y);

    setPositions(prev => ({
      ...prev,
      [selectedEquipment]: {
        ...prev[selectedEquipment],
        x,
        y
      }
    }));
  }, [isDragging, selectedEquipment, zoom, panOffset, dragOffset]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners
  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Rotate selected equipment
  const rotateEquipment = (angle: number) => {
    if (!selectedEquipment) return;
    setPositions(prev => ({
      ...prev,
      [selectedEquipment]: {
        ...prev[selectedEquipment],
        rotation: (prev[selectedEquipment].rotation + angle) % 360
      }
    }));
  };

  // Toggle lock on equipment
  const toggleLock = (equipmentId: string) => {
    setPositions(prev => ({
      ...prev,
      [equipmentId]: {
        ...prev[equipmentId],
        locked: !prev[equipmentId].locked
      }
    }));
  };

  // Auto-arrange equipment
  const autoArrange = () => {
    const updatedPositions: Record<string, EquipmentPosition> = {};
    const sortedEquipment = [...equipment].sort((a, b) => a.type.localeCompare(b.type));
    
    let currentY = 50;
    let currentType = '';
    
    sortedEquipment.forEach((eq, index) => {
      if (eq.type !== currentType) {
        currentType = eq.type;
        currentY += 50;
      }
      
      const col = index % 5;
      const row = Math.floor(index / 5);
      
      updatedPositions[eq.id] = {
        ...positions[eq.id],
        x: col * 120 + 50,
        y: currentY + row * 120,
        rotation: 0
      };
    });
    
    setPositions(updatedPositions);
  };

  // Export layout
  const exportLayout = () => {
    const dataStr = JSON.stringify(positions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `equipment-layout-${facilityId}-${roomId || 'all'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import layout
  const importLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setPositions(imported);
      } catch (error) {
        console.error('Failed to import layout:', error);
      }
    };
    reader.readAsText(file);
  };

  // Get equipment color based on status
  const getEquipmentColor = (status: Equipment['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-gray-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? 'bg-purple-50' : ''}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={snapToGrid ? 'bg-purple-50' : ''}
          >
            Snap
          </Button>
          <div className="flex items-center gap-1 ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={autoArrange}
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            Auto Arrange
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportLayout}
          >
            <Download className="w-4 h-4" />
          </Button>
          <label>
            <input
              type="file"
              accept=".json"
              onChange={importLayout}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              as="span"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </label>
          <Button
            size="sm"
            onClick={() => onSave(positions)}
          >
            <Save className="w-4 h-4 mr-1" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Selected equipment controls */}
      {selectedEquipment && (
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {equipment.find(eq => eq.id === selectedEquipment)?.name}
            </span>
            <Badge variant="outline" className="text-xs">
              X: {positions[selectedEquipment].x}, Y: {positions[selectedEquipment].y}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => rotateEquipment(-90)}
            >
              <RotateCw className="w-4 h-4 rotate-180" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => rotateEquipment(90)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleLock(selectedEquipment)}
            >
              {positions[selectedEquipment].locked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gray-100">
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-move"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: '0 0'
          }}
        >
          {/* Grid */}
          {showGrid && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <pattern
                  id="grid"
                  width={gridSize}
                  height={gridSize}
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx={1} cy={1} r={0.5} fill="#d1d5db" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Equipment */}
          {equipment.map(eq => {
            const pos = positions[eq.id];
            if (!pos) return null;

            return (
              <div
                key={eq.id}
                className={`absolute flex flex-col items-center justify-center rounded-lg border-2 transition-all cursor-move
                  ${selectedEquipment === eq.id ? 'border-purple-500 shadow-lg' : 'border-gray-300'}
                  ${pos.locked ? 'opacity-75' : ''}
                  ${isDragging && selectedEquipment === eq.id ? 'cursor-grabbing' : 'cursor-grab'}
                `}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: pos.width,
                  height: pos.height,
                  transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`
                }}
                onMouseDown={(e) => handleMouseDown(e, eq.id)}
              >
                <div className={`w-full h-full ${getEquipmentColor(eq.status)} bg-opacity-20 rounded-md flex flex-col items-center justify-center p-2`}>
                  <div className="text-2xl mb-1">{eq.icon}</div>
                  <div className="text-xs font-medium text-center">{eq.name}</div>
                  <div className="text-xs text-gray-600">{eq.type}</div>
                </div>
                {pos.locked && (
                  <Lock className="absolute top-1 right-1 w-3 h-3 text-gray-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-2 bg-gray-50 border-t text-xs text-gray-600 flex items-center justify-center gap-4">
        <span><Move className="w-3 h-3 inline" /> Drag to move</span>
        <span><RotateCw className="w-3 h-3 inline" /> Rotate selected</span>
        <span><Lock className="w-3 h-3 inline" /> Lock position</span>
        <span>Scroll to zoom</span>
      </div>
    </Card>
  );
}
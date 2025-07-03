'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { FixtureModel } from '@/components/FixtureLibrary';
import { calculatePPFDGrid, getPPFDColor, calculateDLI, type PPFDCalculationResult } from '@/lib/calculations/basic-ppfd';

interface Room {
  width: number;
  length: number;
  height: number;
  shape: 'rectangle' | 'square' | 'circle' | 'polygon';
  mountingHeight: number;
  targetPPFD: number;
  targetDLI: number;
  photoperiod: number;
  reflectances: {
    ceiling: number;
    walls: number;
    floor: number;
  };
}

interface Fixture {
  id: string;
  type: 'fixture';
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  length: number;
  height: number;
  model: FixtureModel;
  enabled: boolean;
  dimmingLevel: number;
}

interface BasicCanvas2DProps {
  room: Room;
  fixtures: Fixture[];
  selectedFixture: string | null;
  selectedFixtureModel: FixtureModel | null;
  designMode: 'place' | 'move' | 'rotate';
  gridEnabled: boolean;
  showPARMap: boolean;
  onAddFixture: (x: number, y: number) => void;
  onSelectFixture: (id: string | null) => void;
  onUpdateFixture: (id: string, updates: Partial<Fixture>) => void;
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onPPFDUpdate?: (result: PPFDCalculationResult) => void;
}

export function BasicCanvas2D({
  room,
  fixtures,
  selectedFixture,
  selectedFixtureModel,
  designMode,
  gridEnabled,
  showPARMap,
  onAddFixture,
  onSelectFixture,
  onUpdateFixture,
  showNotification,
  onPPFDUpdate
}: BasicCanvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ppfdResultRef = useRef<PPFDCalculationResult | null>(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [originalPositions, setOriginalPositions] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Convert canvas coordinates to room coordinates
  const canvasToRoom = useCallback((canvasX: number, canvasY: number) => {
    if (!room || !canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const padding = 40;
    const scaleX = (canvas.width - 2 * padding) / room.width;
    const scaleY = (canvas.height - 2 * padding) / room.length;
    const scale = Math.min(scaleX, scaleY);
    
    const roomWidth = room.width * scale;
    const roomHeight = room.length * scale;
    const offsetX = (canvas.width - roomWidth) / 2;
    const offsetY = (canvas.height - roomHeight) / 2;
    
    const roomX = (canvasX - offsetX) / scale;
    const roomY = (canvasY - offsetY) / scale;
    
    return { x: roomX, y: roomY };
  }, [room]);

  // Get fixture at position
  const getFixtureAt = useCallback((x: number, y: number) => {
    // Check fixtures in reverse order (top to bottom)
    for (let i = fixtures.length - 1; i >= 0; i--) {
      const fixture = fixtures[i];
      const halfWidth = fixture.width / 2;
      const halfLength = fixture.length / 2;
      
      if (x >= fixture.x - halfWidth && x <= fixture.x + halfWidth &&
          y >= fixture.y - halfLength && y <= fixture.y + halfLength) {
        return fixture;
      }
    }
    return null;
  }, [fixtures]);

  // Snap to grid
  const snapToGrid = useCallback((x: number, y: number) => {
    if (!gridEnabled) return { x, y };
    const gridSize = 1; // 1 foot grid
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [gridEnabled]);

  // Calculate PPFD when fixtures change
  useEffect(() => {
    if (fixtures.length > 0 && showPARMap) {
      const result = calculatePPFDGrid(room, fixtures, room.mountingHeight - 3);
      ppfdResultRef.current = result;
      
      if (onPPFDUpdate) {
        onPPFDUpdate(result);
      }
    } else {
      ppfdResultRef.current = null;
    }
  }, [fixtures, room, showPARMap, onPPFDUpdate]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !room) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale
    const padding = 40;
    const scaleX = (canvas.width - 2 * padding) / room.width;
    const scaleY = (canvas.height - 2 * padding) / room.length;
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate room position
    const roomWidth = room.width * scale;
    const roomHeight = room.length * scale;
    const offsetX = (canvas.width - roomWidth) / 2;
    const offsetY = (canvas.height - roomHeight) / 2;
    
    // Draw room background
    ctx.fillStyle = '#111827';
    ctx.fillRect(offsetX, offsetY, roomWidth, roomHeight);
    
    // Draw room outline
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, roomWidth, roomHeight);
    
    // Draw grid
    if (gridEnabled) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.5;
      
      // Vertical lines
      for (let x = 0; x <= room.width; x++) {
        const px = offsetX + x * scale;
        ctx.beginPath();
        ctx.moveTo(px, offsetY);
        ctx.lineTo(px, offsetY + roomHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= room.length; y++) {
        const py = offsetY + y * scale;
        ctx.beginPath();
        ctx.moveTo(offsetX, py);
        ctx.lineTo(offsetX + roomWidth, py);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;
    }
    
    // Draw PPFD heatmap
    if (showPARMap && ppfdResultRef.current) {
      const result = ppfdResultRef.current;
      const gridResolution = 0.5; // Must match calculation grid resolution
      const cellSize = gridResolution * scale;
      
      ctx.save();
      ctx.globalAlpha = 0.6;
      
      for (let row = 0; row < result.grid.length; row++) {
        for (let col = 0; col < result.grid[row].length; col++) {
          const ppfd = result.grid[row][col];
          if (ppfd > 0) {
            const x = offsetX + col * cellSize;
            const y = offsetY + row * cellSize;
            
            ctx.fillStyle = getPPFDColor(ppfd, 1);
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
      
      ctx.restore();
    }
    
    // Draw fixtures
    fixtures.forEach(fixture => {
      const x = offsetX + fixture.x * scale;
      const y = offsetY + fixture.y * scale;
      const width = fixture.width * scale;
      const height = fixture.length * scale;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(fixture.rotation * Math.PI / 180);
      
      // Draw fixture body
      if (fixture.enabled) {
        const opacity = fixture.dimmingLevel / 100;
        ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`;
      } else {
        ctx.fillStyle = '#4b5563';
      }
      ctx.fillRect(-width/2, -height/2, width, height);
      
      // Draw outline
      ctx.strokeStyle = fixture.id === selectedFixture ? '#fbbf24' : '#6366f1';
      ctx.lineWidth = fixture.id === selectedFixture ? 3 : 1;
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      ctx.restore();
      
      // Draw fixture label
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(fixture.model.model.substring(0, 15), x, y + height/2 + 15);
    });
    
    // Draw room dimensions
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    
    // Width label
    ctx.fillText(`${room.width} ft`, offsetX + roomWidth/2, offsetY - 10);
    
    // Height label
    ctx.save();
    ctx.translate(offsetX - 10, offsetY + roomHeight/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(`${room.length} ft`, 0, 0);
    ctx.restore();
    
    // Draw info
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Fixtures: ${fixtures.length}`, 10, 20);
    ctx.fillText(`Mode: ${designMode}`, 10, 35);
    
    // Draw PPFD stats if available
    if (ppfdResultRef.current && showPARMap) {
      const result = ppfdResultRef.current;
      ctx.fillText(`Avg PPFD: ${result.averagePPFD.toFixed(0)} μmol/m²/s`, 10, 50);
      ctx.fillText(`Min/Max: ${result.minPPFD.toFixed(0)}/${result.maxPPFD.toFixed(0)}`, 10, 65);
      ctx.fillText(`Uniformity: ${(result.uniformity * 100).toFixed(0)}%`, 10, 80);
      
      const avgDLI = calculateDLI(result.averagePPFD, room.photoperiod);
      ctx.fillText(`Avg DLI: ${avgDLI.toFixed(1)} mol/m²/day`, 10, 95);
    }
    
    // Draw PPFD color legend
    if (showPARMap && ppfdResultRef.current) {
      const legendX = canvas.width - 150;
      const legendY = 20;
      const legendWidth = 130;
      const legendHeight = 20;
      
      // Background
      ctx.fillStyle = 'rgba(31, 41, 55, 0.9)';
      ctx.fillRect(legendX - 10, legendY - 5, legendWidth + 20, 120);
      
      // Title
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PPFD (μmol/m²/s)', legendX, legendY - 5);
      
      // Color scale
      const colors = [
        { ppfd: 800, color: '#ef4444', label: '800+' },
        { ppfd: 600, color: '#fb923c', label: '600-800' },
        { ppfd: 400, color: '#fbbf24', label: '400-600' },
        { ppfd: 200, color: '#22c55e', label: '200-400' },
        { ppfd: 0, color: '#3b82f6', label: '0-200' }
      ];
      
      colors.forEach((item, index) => {
        const y = legendY + 10 + index * 20;
        
        // Color box
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, y, 15, 15);
        
        // Label
        ctx.fillStyle = 'white';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, legendX + 20, y + 11);
      });
    }
  }, [room, fixtures, selectedFixture, gridEnabled, showPARMap, designMode]);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        draw();
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Redraw when state changes
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // Handle mouse down
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!room || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const roomCoords = canvasToRoom(canvasX, canvasY);
    
    // Check if click is inside room
    if (roomCoords.x < 0 || roomCoords.x > room.width || 
        roomCoords.y < 0 || roomCoords.y > room.length) {
      return;
    }
    
    if (designMode === 'place') {
      // Place new fixture
      if (selectedFixtureModel) {
        const snappedCoords = snapToGrid(roomCoords.x, roomCoords.y);
        onAddFixture(snappedCoords.x, snappedCoords.y);
      } else {
        showNotification('warning', 'Please select a fixture model first');
      }
    } else if (designMode === 'move' || designMode === 'rotate') {
      // Select or move fixture
      const fixture = getFixtureAt(roomCoords.x, roomCoords.y);
      if (fixture) {
        onSelectFixture(fixture.id);
        
        if (designMode === 'move') {
          setIsDragging(true);
          setDragStart(roomCoords);
          setOriginalPositions({ [fixture.id]: { x: fixture.x, y: fixture.y } });
        } else if (designMode === 'rotate') {
          // Rotate by 90 degrees
          onUpdateFixture(fixture.id, { rotation: (fixture.rotation + 90) % 360 });
        }
      } else {
        onSelectFixture(null);
      }
    }
  }, [room, canvasToRoom, designMode, selectedFixtureModel, snapToGrid, onAddFixture, onSelectFixture, onUpdateFixture, getFixtureAt, showNotification]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || !selectedFixture || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const roomCoords = canvasToRoom(canvasX, canvasY);
    
    const fixture = fixtures.find(f => f.id === selectedFixture);
    if (fixture && originalPositions[fixture.id]) {
      const deltaX = roomCoords.x - dragStart.x;
      const deltaY = roomCoords.y - dragStart.y;
      
      let newX = originalPositions[fixture.id].x + deltaX;
      let newY = originalPositions[fixture.id].y + deltaY;
      
      // Snap to grid
      const snapped = snapToGrid(newX, newY);
      newX = snapped.x;
      newY = snapped.y;
      
      // Constrain to room bounds
      newX = Math.max(fixture.width/2, Math.min(room.width - fixture.width/2, newX));
      newY = Math.max(fixture.length/2, Math.min(room.length - fixture.length/2, newY));
      
      onUpdateFixture(fixture.id, { x: newX, y: newY });
    }
  }, [isDragging, dragStart, selectedFixture, canvasToRoom, fixtures, originalPositions, snapToGrid, room, onUpdateFixture]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setOriginalPositions({});
    }
  }, [isDragging]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: designMode === 'place' ? 'crosshair' : 
                  designMode === 'move' ? 'move' : 
                  designMode === 'rotate' ? 'grab' : 'default'
        }}
      />
    </div>
  );
}
'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { 
  CanvasRenderer, 
  SpatialIndex, 
  PerformanceMonitor,
  debounce,
  throttle
} from '../utils/CanvasOptimizations';

interface OptimizedCanvas2DProps {
  width: number;
  height: number;
  className?: string;
  onPerformanceUpdate?: (fps: number) => void;
}

export function OptimizedCanvas2D({ 
  width, 
  height, 
  className = '',
  onPerformanceUpdate
}: OptimizedCanvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const spatialIndexRef = useRef<SpatialIndex>(new SpatialIndex(100));
  const performanceMonitorRef = useRef<PerformanceMonitor>(new PerformanceMonitor());
  
  const { state, dispatch, selectedTool, ui } = useDesigner();
  const { objects, room, selectedObjectId } = state;
  
  // Camera state
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  
  // Mouse state for interactions
  const [mouseState, setMouseState] = useState({
    isDown: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    draggedObject: null as any
  });
  
  // Temporary objects for preview (e.g., during placement)
  const [tempObjects, setTempObjects] = useState<any[]>([]);
  
  // Layer caching keys
  const GRID_LAYER = 'grid';
  const ROOM_LAYER = 'room';
  const STATIC_OBJECTS_LAYER = 'static';
  
  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - camera.x) / camera.zoom,
      y: (screenY - camera.y) / camera.zoom
    };
  }, [camera]);
  
  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * camera.zoom + camera.x,
      y: worldY * camera.zoom + camera.y
    };
  }, [camera]);
  
  // Check if object is in viewport
  const isObjectInViewport = useCallback((obj: any) => {
    const objScreen = worldToScreen(obj.x, obj.y);
    const objWidth = (obj.width || 2) * camera.zoom;
    const objHeight = (obj.length || 2) * camera.zoom;
    
    return rendererRef.current?.isInViewport(
      objScreen.x - objWidth / 2,
      objScreen.y - objHeight / 2,
      objWidth,
      objHeight,
      0,
      0,
      width,
      height
    ) ?? true;
  }, [worldToScreen, camera.zoom, width, height]);
  
  // Rebuild spatial index when objects change
  useEffect(() => {
    const spatialIndex = spatialIndexRef.current;
    spatialIndex.clear();
    
    objects.forEach(obj => {
      const halfWidth = (obj.width || 2) / 2;
      const halfLength = (obj.length || 2) / 2;
      spatialIndex.insert(
        obj,
        obj.x - halfWidth,
        obj.y - halfLength,
        obj.width || 2,
        obj.length || 2
      );
    });
  }, [objects]);
  
  // Optimized object query at position
  const getObjectAt = useCallback((worldX: number, worldY: number) => {
    const candidates = spatialIndexRef.current.query(worldX - 1, worldY - 1, 2, 2);
    
    for (const obj of candidates) {
      if (obj.type === 'fixture' || obj.type === 'rectangle' || obj.type === 'equipment') {
        const halfWidth = (obj.width || 2) / 2;
        const halfLength = (obj.length || 2) / 2;
        if (worldX >= obj.x - halfWidth && worldX <= obj.x + halfWidth &&
            worldY >= obj.y - halfLength && worldY <= obj.y + halfLength) {
          return obj;
        }
      } else if (obj.type === 'circle') {
        const radius = obj.radius || 1;
        const distance = Math.sqrt(Math.pow(worldX - obj.x, 2) + Math.pow(worldY - obj.y, 2));
        if (distance <= radius) {
          return obj;
        }
      }
    }
    
    return null;
  }, []);
  
  // Debounced grid cache update
  const updateGridCache = useMemo(() => 
    debounce(() => {
      if (!rendererRef.current || !room || !ui.grid.enabled) return;
      
      rendererRef.current.cacheLayer(GRID_LAYER, width, height, (ctx) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const gridSize = ui.grid.size * camera.zoom;
        const offsetX = camera.x % gridSize;
        const offsetY = camera.y % gridSize;
        
        // Only draw visible grid lines
        ctx.beginPath();
        for (let x = offsetX; x < width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = offsetY; y < height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      });
    }, 100),
  [width, height, room, ui.grid, camera]);
  
  // Main render function
  const render = useCallback(() => {
    if (!rendererRef.current) return;
    
    const renderer = rendererRef.current;
    const monitor = performanceMonitorRef.current;
    
    monitor.startFrame();
    
    renderer.requestRender((ctx) => {
      // Draw cached grid layer
      if (ui.grid.enabled) {
        renderer.drawCachedLayer(GRID_LAYER, 0, 0);
      }
      
      // Draw room
      if (room) {
        const roomScreen = worldToScreen(0, 0);
        const roomWidth = room.width * camera.zoom;
        const roomLength = room.length * camera.zoom;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(roomScreen.x, roomScreen.y, roomWidth, roomLength);
      }
      
      // Batch draw visible objects
      const drawOperations: Array<(ctx: CanvasRenderingContext2D) => void> = [];
      
      // Regular objects
      objects.forEach(obj => {
        if (!isObjectInViewport(obj)) return;
        
        drawOperations.push((ctx) => {
          const pos = worldToScreen(obj.x, obj.y);
          const isSelected = obj.id === selectedObjectId;
          
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate((obj.rotation || 0) * Math.PI / 180);
          
          if (obj.type === 'fixture') {
            const w = (obj.width || 2) * camera.zoom;
            const h = (obj.length || 2) * camera.zoom;
            
            ctx.fillStyle = obj.enabled ? '#8b5cf6' : '#4b5563';
            ctx.fillRect(-w/2, -h/2, w, h);
            
            if (isSelected) {
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 2;
              ctx.strokeRect(-w/2, -h/2, w, h);
            }
          } else if (obj.type === 'equipment') {
            const w = (obj.width || 2) * camera.zoom;
            const h = (obj.length || 2) * camera.zoom;
            
            const colors: Record<string, string> = {
              hvac: '#3b82f6',
              fan: '#06b6d4',
              dehumidifier: '#0891b2',
              co2: '#10b981',
              controller: '#8b5cf6',
              electrical: '#eab308',
              irrigation: '#06b6d4',
              benching: '#22c55e'
            };
            
            ctx.fillStyle = colors[obj.equipmentType as string] || '#6b7280';
            ctx.fillRect(-w/2, -h/2, w, h);
            
            if (isSelected) {
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 2;
              ctx.strokeRect(-w/2, -h/2, w, h);
            }
          }
          
          ctx.restore();
        });
      });
      
      // Temporary objects (preview)
      tempObjects.forEach(obj => {
        drawOperations.push((ctx) => {
          const pos = worldToScreen(obj.x, obj.y);
          const w = (obj.width || 2) * camera.zoom;
          const h = (obj.length || 2) * camera.zoom;
          
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate((obj.rotation || 0) * Math.PI / 180);
          
          ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          ctx.fillRect(-w/2, -h/2, w, h);
          ctx.strokeRect(-w/2, -h/2, w, h);
          
          ctx.restore();
        });
      });
      
      // Execute all draw operations
      renderer.batchDraw(drawOperations);
      
      // Draw interaction feedback
      if (mouseState.isDragging && mouseState.draggedObject) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(mouseState.startX, mouseState.startY);
        ctx.lineTo(mouseState.currentX, mouseState.currentY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    
    monitor.endFrame();
    
    // Update performance metrics
    if (onPerformanceUpdate) {
      onPerformanceUpdate(monitor.getAverageFPS());
    }
  }, [
    ui.grid.enabled,
    room,
    objects,
    tempObjects,
    selectedObjectId,
    camera,
    mouseState,
    worldToScreen,
    isObjectInViewport,
    onPerformanceUpdate
  ]);
  
  // Throttled render updates
  const throttledRender = useMemo(() => throttle(render, 16), [render]);
  
  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const renderer = new CanvasRenderer(canvasRef.current);
    rendererRef.current = renderer;
    
    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);
  
  // Update canvas size
  useEffect(() => {
    if (!rendererRef.current || !canvasRef.current) return;
    
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    rendererRef.current.resize(width, height);
    updateGridCache();
  }, [width, height, updateGridCache]);
  
  // Trigger render on state changes
  useEffect(() => {
    rendererRef.current?.invalidate();
    throttledRender();
  }, [objects, room, selectedObjectId, camera, ui, tempObjects, throttledRender]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    
    setMouseState(prev => ({
      ...prev,
      isDown: true,
      startX: screenX,
      startY: screenY,
      currentX: screenX,
      currentY: screenY
    }));
    
    if (selectedTool === 'select' || selectedTool === 'move') {
      const obj = getObjectAt(worldPos.x, worldPos.y);
      if (obj) {
        dispatch({ type: 'SELECT_OBJECT', payload: obj.id });
        setMouseState(prev => ({ ...prev, draggedObject: obj }));
      } else {
        dispatch({ type: 'SELECT_OBJECT', payload: null });
      }
    }
  }, [selectedTool, screenToWorld, getObjectAt, dispatch]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    
    setMouseState(prev => ({
      ...prev,
      currentX: screenX,
      currentY: screenY
    }));
    
    if (mouseState.isDown && mouseState.draggedObject && selectedTool === 'move') {
      const deltaX = (screenX - mouseState.startX) / camera.zoom;
      const deltaY = (screenY - mouseState.startY) / camera.zoom;
      
      // Update object position
      dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          id: mouseState.draggedObject.id,
          updates: {
            x: mouseState.draggedObject.x + deltaX,
            y: mouseState.draggedObject.y + deltaY
          }
        }
      });
      
      setMouseState(prev => ({
        ...prev,
        startX: screenX,
        startY: screenY,
        isDragging: true
      }));
    }
  }, [mouseState, selectedTool, camera.zoom, screenToWorld, dispatch]);
  
  const handleMouseUp = useCallback(() => {
    setMouseState(prev => ({
      ...prev,
      isDown: false,
      isDragging: false,
      draggedObject: null
    }));
  }, []);
  
  // Zoom handling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, camera.zoom * zoomFactor));
    
    // Zoom towards mouse position
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldPos = screenToWorld(mouseX, mouseY);
    
    setCamera(prev => ({
      zoom: newZoom,
      x: mouseX - worldPos.x * newZoom,
      y: mouseY - worldPos.y * newZoom
    }));
    
    // Clear grid cache on zoom
    rendererRef.current?.clearLayerCache(GRID_LAYER);
    updateGridCache();
  }, [camera.zoom, screenToWorld, updateGridCache]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`${className} cursor-crosshair`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
}
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { ContourRenderingEngine } from '@/lib/calculations/contour-engine';
import { AnimationManager, HoverEffectManager, VisualEffects, Easings } from '../utils/VisualEffects';
import { ContextMenu, ContextMenuBuilder } from '../ui/ContextMenu';
import { MeasurementTool, MeasurementRenderer, MeasurementCalculator, type Measurement } from '../tools/MeasurementTool';
import { ExportImportTool } from '../tools/ExportImportTool';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { createGroup, getGroupBounds, moveGroup } from '../utils/grouping';
import { bringToFront, sendToBack } from '../utils/layering';

export function SimpleCanvas2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const isDirtyRef = useRef<boolean>(true);
  
  const { state, setRoom, addObject, dispatch, updateObject, selectObject, selectObjects, clearSelection } = useDesigner();
  const { room, objects, ui, calculations } = state;
  const { showNotification } = useNotifications();
  
  // State for drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [currentCircle, setCurrentCircle] = useState<{ x: number; y: number; radius: number } | null>(null);
  const [currentLine, setCurrentLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [showPPFDOverlay, setShowPPFDOverlay] = useState(true);
  const [ppfdOpacity, setPpfdOpacity] = useState(0.6);
  const [ppfdColorRanges, setPpfdColorRanges] = useState([
    { min: 0, max: 250, color: '#3b82f6' }, // Blue
    { min: 250, max: 500, color: '#10b981' }, // Green
    { min: 500, max: 750, color: '#f59e0b' }, // Yellow
    { min: 750, max: 1000, color: '#ef4444' }, // Red
  ]);
  const [showContours, setShowContours] = useState(false);
  const [contourEngine] = useState(() => new ContourRenderingEngine());
  const [calculationZones, setCalculationZones] = useState<Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    z: number; // Height above floor
    enabled: boolean;
    color: string;
  }>>([]); 
  const [showPPFDPanel, setShowPPFDPanel] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [zoneStart, setZoneStart] = useState<{ x: number; y: number } | null>(null);
  const [currentZone, setCurrentZone] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Object manipulation state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [draggedObjects, setDraggedObjects] = useState<{[key: string]: {x: number, y: number}}>({}); // Track original positions for undo
  
  // Visual effects state
  const animationManager = useRef(new AnimationManager());
  const hoverManager = useRef(new HoverEffectManager());
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [snapIndicators, setSnapIndicators] = useState<{ x: number; y: number; type: 'grid' | 'object' }[]>([]);
  const [successFeedback, setSuccessFeedback] = useState<{ x: number; y: number; message: string } | null>(null);
  const selectionAnimationRef = useRef(0);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: 'object' | 'canvas'; objectId?: string } | null>(null);
  const [clipboard, setClipboard] = useState<any[]>([]);
  
  // Measurement tool state
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<Measurement> | null>(null);
  const [measurementPoints, setMeasurementPoints] = useState<{x: number; y: number}[]>([]);
  
  // Properties panel and grouping state
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [objectGroups, setObjectGroups] = useState<any[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  // Export/Import state
  const [showExportImport, setShowExportImport] = useState(false);
  
  // Snap and grid system
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToObjects, setSnapToObjects] = useState(true);
  const [gridSize, setGridSize] = useState(1); // 1 foot grid
  const [showGrid, setShowGrid] = useState(true);
  const [snapThreshold] = useState(0.5); // 0.5 feet snap distance
  
  // Snap helper functions
  const snapToGridPoint = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);

  const findSnapTargets = useCallback((x: number, y: number, excludeIds: string[] = []) => {
    if (!snapToObjects) return { x, y };
    
    const snapTargets: { x: number; y: number; type: 'edge' | 'center' | 'corner' }[] = [];
    
    objects.forEach(obj => {
      if (excludeIds.includes(obj.id)) return;
      
      // Add center point
      snapTargets.push({ x: obj.x, y: obj.y, type: 'center' });
      
      // Add corners and edges for rectangular objects
      if (obj.type === 'fixture' || obj.type === 'rectangle' || obj.type === 'equipment') {
        const halfWidth = (obj.width || 2) / 2;
        const halfLength = (obj.length || (obj.type === 'fixture' ? 4 : 2)) / 2;
        
        // Corners
        snapTargets.push(
          { x: obj.x - halfWidth, y: obj.y - halfLength, type: 'corner' },
          { x: obj.x + halfWidth, y: obj.y - halfLength, type: 'corner' },
          { x: obj.x - halfWidth, y: obj.y + halfLength, type: 'corner' },
          { x: obj.x + halfWidth, y: obj.y + halfLength, type: 'corner' }
        );
        
        // Edge midpoints
        snapTargets.push(
          { x: obj.x, y: obj.y - halfLength, type: 'edge' },
          { x: obj.x, y: obj.y + halfLength, type: 'edge' },
          { x: obj.x - halfWidth, y: obj.y, type: 'edge' },
          { x: obj.x + halfWidth, y: obj.y, type: 'edge' }
        );
      }
    });
    
    // Find closest snap target
    let closestTarget = null;
    let closestDistance = snapThreshold;
    
    snapTargets.forEach(target => {
      const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTarget = target;
      }
    });
    
    return closestTarget ? { x: closestTarget.x, y: closestTarget.y } : { x, y };
  }, [snapToObjects, objects, snapThreshold]);

  const applySnapping = useCallback((x: number, y: number, excludeIds: string[] = []) => {
    // First try object snapping
    const objectSnap = findSnapTargets(x, y, excludeIds);
    if (objectSnap.x !== x || objectSnap.y !== y) {
      // Animate snap indicator
      animationManager.current.animate(
        'snapIndicator',
        { progress: 0 },
        { progress: 1 },
        300,
        Easings.easeOutQuad
      );
      setSnapIndicators([{ x: objectSnap.x, y: objectSnap.y, type: 'object' }]);
      return objectSnap;
    }
    
    // Fall back to grid snapping
    const gridSnap = snapToGridPoint(x, y);
    if (gridSnap.x !== x || gridSnap.y !== y) {
      animationManager.current.animate(
        'snapIndicator',
        { progress: 0 },
        { progress: 1 },
        300,
        Easings.easeOutQuad
      );
      setSnapIndicators([{ x: gridSnap.x, y: gridSnap.y, type: 'grid' }]);
    }
    return gridSnap;
  }, [findSnapTargets, snapToGridPoint]);
  
  // Helper functions for object manipulation
  const getObjectAt = useCallback((x: number, y: number) => {
    // Reverse iterate to get top-most object first
    const reversedObjects = [...objects].reverse();
    
    const foundObject = reversedObjects.find(obj => {
      if (obj.type === 'fixture' || obj.type === 'rectangle' || obj.type === 'equipment') {
        // Use actual object dimensions for hit detection
        const halfWidth = (obj.width || 2) / 2;
        const halfLength = (obj.length || (obj.type === 'fixture' ? 4 : 2)) / 2;
        const hit = x >= obj.x - halfWidth && x <= obj.x + halfWidth &&
               y >= obj.y - halfLength && y <= obj.y + halfLength;
        
        if (obj.type === 'equipment') {
          // Equipment click debug info would be logged here
        }
        
        return hit;
      } else if (obj.type === 'circle' || obj.type === 'hvacFan') {
        // Fans are circular, so we use the same logic as circles
        const radius = obj.type === 'hvacFan' 
          ? Math.min(obj.width || 2, obj.length || 2) / 2 
          : (obj.radius || 1);
        const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
        return distance <= radius;
      } else if (obj.type === 'unistrut') {
        // Unistrut objects might have different hit detection
        const halfWidth = (obj.width || 1) / 2;
        const halfLength = (obj.length || 1) / 2;
        return x >= obj.x - halfWidth && x <= obj.x + halfWidth &&
               y >= obj.y - halfLength && y <= obj.y + halfLength;
      }
      return false;
    });
    
    if (foundObject) {
      // Object found
    } else {
      // No object found at exact position, could search nearby objects here
    }
    
    return foundObject;
  }, [objects]);

  const getObjectsInBox = useCallback((box: { x: number; y: number; width: number; height: number }) => {
    return objects.filter(obj => {
      return obj.x >= box.x && obj.x <= box.x + box.width &&
             obj.y >= box.y && obj.y <= box.y + box.width;
    });
  }, [objects]);

  const copySelectedObjects = useCallback(() => {
    const selectedObjects = objects.filter(obj => ui.selectedObjects?.includes(obj.id));
    if (selectedObjects.length === 0) {
      showNotification('warning', 'No objects selected to copy');
      return;
    }
    
    // Store in clipboard for paste operation
    setClipboard(selectedObjects.map(obj => ({ ...obj })));

    selectedObjects.forEach((obj, index) => {
      const newObj = {
        ...obj,
        x: obj.x + 2, // Offset by 2 feet
        y: obj.y + 2,
        id: undefined // Will be auto-generated
      };
      delete (newObj as any).id; // Remove id so it gets auto-generated
      addObject(newObj);
    });

    showNotification('success', `Copied ${selectedObjects.length} object(s)`);
  }, [objects, ui.selectedObjects, addObject, showNotification]);
  
  // Paste objects from clipboard
  const pasteObjects = useCallback((atPosition?: { x: number; y: number }) => {
    if (clipboard.length === 0) {
      showNotification('warning', 'Nothing to paste');
      return;
    }
    
    // Calculate center of clipboard objects
    let centerX = 0, centerY = 0;
    clipboard.forEach(obj => {
      centerX += obj.x;
      centerY += obj.y;
    });
    centerX /= clipboard.length;
    centerY /= clipboard.length;
    
    // Determine paste position
    const pasteX = atPosition?.x || centerX + 2;
    const pasteY = atPosition?.y || centerY + 2;
    
    // Create new objects
    const newIds: string[] = [];
    clipboard.forEach((obj, index) => {
      const offsetX = obj.x - centerX;
      const offsetY = obj.y - centerY;
      
      const newObj = {
        ...obj,
        x: pasteX + offsetX,
        y: pasteY + offsetY,
        id: undefined // Will be auto-generated
      };
      delete (newObj as any).id; // Remove id so it gets auto-generated
      
      addObject(newObj);
    });
    
    showNotification('success', `Pasted ${clipboard.length} object(s)`);
  }, [clipboard, addObject, showNotification]);

  const rotateSelectedObjects = useCallback((angle: number = 90) => {
    const selectedObjects = objects.filter(obj => ui.selectedObjects?.includes(obj.id));
    if (selectedObjects.length === 0) {
      showNotification('warning', 'No objects selected to rotate');
      return;
    }

    selectedObjects.forEach(obj => {
      const newRotation = (obj.rotation || 0) + angle;
      updateObject(obj.id, { rotation: newRotation % 360 });
    });

    showNotification('success', `Rotated ${selectedObjects.length} object(s) by ${angle}°`);
  }, [objects, ui.selectedObjects, updateObject, showNotification]);
  
  // Measurement handlers
  const addMeasurement = useCallback((measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
    showNotification('success', 'Measurement added');
  }, [showNotification]);
  
  const updateMeasurement = useCallback((id: string, updates: Partial<Measurement>) => {
    setMeasurements(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);
  
  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);
  
  const calculatePixelScale = useCallback(() => {
    if (!room || !canvasRef.current) return 1;
    const canvas = canvasRef.current;
    const padding = 40;
    const scaleX = (canvas.width - 2 * padding) / room.width;
    const scaleY = (canvas.height - 2 * padding) / room.length;
    return Math.min(scaleX, scaleY);
  }, [room]);
  
  // Mark canvas as needing redraw
  const invalidate = useCallback(() => {
    isDirtyRef.current = true;
  }, []);
  
  // Optimized draw function with frame limiting
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !room) return;
    
    // Skip if not dirty
    if (!isDirtyRef.current) return;
    
    // Frame rate limiting (60 FPS)
    const now = performance.now();
    const deltaTime = now - lastRenderTimeRef.current;
    if (deltaTime < 16.67) { // 1000/60 = 16.67ms per frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(draw);
      return;
    }
    
    lastRenderTimeRef.current = now;
    isDirtyRef.current = false;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enable image smoothing for better performance
    ctx.imageSmoothingEnabled = false;
    
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
    
    // Draw room outline
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, roomWidth, roomHeight);
    
    // Draw grid with enhanced visibility
    if (showGrid) {
      ctx.strokeStyle = snapToGrid ? '#4b5563' : '#374151';
      ctx.lineWidth = 1;
      
      // Major grid lines (every gridSize)
      for (let x = 0; x <= room.width; x += gridSize) {
        const px = offsetX + x * scale;
        ctx.globalAlpha = x % (gridSize * 4) === 0 ? 0.8 : 0.4; // Emphasize every 4th line
        ctx.beginPath();
        ctx.moveTo(px, offsetY);
        ctx.lineTo(px, offsetY + roomHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= room.length; y += gridSize) {
        const py = offsetY + y * scale;
        ctx.globalAlpha = y % (gridSize * 4) === 0 ? 0.8 : 0.4;
        ctx.beginPath();
        ctx.moveTo(offsetX, py);
        ctx.lineTo(offsetX + roomWidth, py);
        ctx.stroke();
      }
      
      // Minor grid lines (every 0.5 ft) when zoomed in
      if (scale > 20) {
        ctx.strokeStyle = '#374151';
        ctx.globalAlpha = 0.2;
        for (let x = 0; x <= room.width; x += gridSize / 2) {
          if (x % gridSize !== 0) { // Skip major grid lines
            const px = offsetX + x * scale;
            ctx.beginPath();
            ctx.moveTo(px, offsetY);
            ctx.lineTo(px, offsetY + roomHeight);
            ctx.stroke();
          }
        }
        for (let y = 0; y <= room.length; y += gridSize / 2) {
          if (y % gridSize !== 0) { // Skip major grid lines
            const py = offsetY + y * scale;
            ctx.beginPath();
            ctx.moveTo(offsetX, py);
            ctx.lineTo(offsetX + roomWidth, py);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1.0;
    }
    
    // Draw PPFD heatmap overlay
    if (showPPFDOverlay && calculations?.ppfdGrid && calculations.ppfdGrid.length > 0) {
      // Create gradient for PPFD values using custom ranges
      const createPPFDColor = (ppfd: number) => {
        // Find the appropriate color range
        let color = ppfdColorRanges[0].color; // Default to first range
        
        for (const range of ppfdColorRanges) {
          if (ppfd >= range.min && ppfd < range.max) {
            color = range.color;
            break;
          } else if (ppfd >= range.max && range === ppfdColorRanges[ppfdColorRanges.length - 1]) {
            // Use last color for values above max
            color = range.color;
          }
        }
        
        // Convert hex to rgba
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${ppfdOpacity})`;
      };
      
      // Draw heatmap with smooth interpolation
      const gridRows = calculations.ppfdGrid.length;
      const gridCols = calculations.ppfdGrid[0]?.length || 0;
      
      if (gridRows > 0 && gridCols > 0) {
        const cellWidth = roomWidth / gridCols;
        const cellHeight = roomHeight / gridRows;
        
        // Create an offscreen canvas for smooth gradient
        const offCanvas = document.createElement('canvas');
        offCanvas.width = gridCols;
        offCanvas.height = gridRows;
        const offCtx = offCanvas.getContext('2d');
        
        if (offCtx) {
          // Draw low-res heatmap
          const imageData = offCtx.createImageData(gridCols, gridRows);
          const data = imageData.data;
          
          for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridCols; x++) {
              const ppfd = calculations.ppfdGrid[y]?.[x] || 0;
              const color = createPPFDColor(ppfd);
              const rgba = color.match(/\d+/g) || ['0', '0', '0', '0.6'];
              
              const idx = (y * gridCols + x) * 4;
              data[idx] = parseInt(rgba[0]);
              data[idx + 1] = parseInt(rgba[1]);
              data[idx + 2] = parseInt(rgba[2]);
              data[idx + 3] = Math.floor(parseFloat(rgba[3]) * 255);
            }
          }
          
          offCtx.putImageData(imageData, 0, 0);
          
          // Draw smoothly scaled heatmap
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(offCanvas, offsetX, offsetY, roomWidth, roomHeight);
          ctx.restore();
        }
        
        // Draw contour lines for key PPFD values
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Add contour lines at 200, 400, 600, 800 PPFD
        const contourLevels = [200, 400, 600, 800];
        const visited = new Set<string>();
        
        contourLevels.forEach(level => {
          ctx.beginPath();
          
          for (let y = 0; y < gridRows - 1; y++) {
            for (let x = 0; x < gridCols - 1; x++) {
              const key = `${x},${y}`;
              if (visited.has(key)) continue;
              
              const v1 = calculations.ppfdGrid[y]?.[x] || 0;
              const v2 = calculations.ppfdGrid[y]?.[x + 1] || 0;
              const v3 = calculations.ppfdGrid[y + 1]?.[x] || 0;
              
              // Check if contour crosses this edge
              if ((v1 <= level && v2 > level) || (v1 > level && v2 <= level)) {
                const t = (level - v1) / (v2 - v1);
                const px = offsetX + (x + t) * cellWidth;
                const py = offsetY + y * cellHeight;
                ctx.moveTo(px, py);
                ctx.lineTo(px, py + cellHeight);
              }
              
              if ((v1 <= level && v3 > level) || (v1 > level && v3 <= level)) {
                const t = (level - v1) / (v3 - v1);
                const px = offsetX + x * cellWidth;
                const py = offsetY + (y + t) * cellHeight;
                ctx.moveTo(px, py);
                ctx.lineTo(px + cellWidth, py);
              }
            }
          }
          
          ctx.stroke();
        });
        
        ctx.restore();
      }
    }
    
    // Draw calculation zones
    if (calculationZones.length > 0) {
      calculationZones.forEach(zone => {
        if (!zone.enabled) return;
        
        const zoneX = offsetX + zone.x * scale;
        const zoneY = offsetY + zone.y * scale;
        const zoneWidth = zone.width * scale;
        const zoneHeight = zone.height * scale;
        
        // Draw zone outline
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
        
        // Draw zone label with height
        ctx.fillStyle = zone.color;
        ctx.font = '12px sans-serif';
        ctx.fillText(`${zone.name} (${zone.z}ft)`, zoneX + 5, zoneY - 5);
        
        ctx.setLineDash([]);
      });
    }
    
    // Draw current zone being created
    if (isDrawingZone && currentZone) {
      const zoneX = offsetX + currentZone.x * scale;
      const zoneY = offsetY + currentZone.y * scale;
      const zoneWidth = currentZone.width * scale;
      const zoneHeight = currentZone.height * scale;
      
      ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
    }
    
    // Viewport culling bounds
    const viewBounds = {
      minX: -padding / scale,
      minY: -padding / scale,
      maxX: (canvas.width - padding) / scale,
      maxY: (canvas.height - padding) / scale
    };
    
    // Sort objects by z-index for proper layering
    const sortedObjects = [...objects].sort((a, b) => {
      const aZIndex = (a as any).zIndex || 0;
      const bZIndex = (b as any).zIndex || 0;
      return aZIndex - bZIndex;
    });
    
    // Draw objects with viewport culling
    sortedObjects.forEach((obj, i) => {
      // Skip objects outside viewport
      const objBounds = {
        minX: obj.x - (obj.width || 2) / 2,
        minY: obj.y - (obj.length || 4) / 2,
        maxX: obj.x + (obj.width || 2) / 2,
        maxY: obj.y + (obj.length || 4) / 2
      };
      
      if (objBounds.maxX < viewBounds.minX || objBounds.minX > viewBounds.maxX ||
          objBounds.maxY < viewBounds.minY || objBounds.minY > viewBounds.maxY) {
        return; // Skip rendering this object
      }
      
      if (obj.type === 'rectangle') {
        const x = offsetX + obj.x * scale;
        const y = offsetY + obj.y * scale;
        const width = (obj.width || 2) * scale;
        const height = (obj.length || 4) * scale;
        
        // Draw rectangle fill
        ctx.fillStyle = obj.fillColor || '#4b5563';
        ctx.fillRect(x - width/2, y - height/2, width, height);
        
        // Draw rectangle outline with selection highlight
        const isSelected = ui.selectedObjects?.includes(obj.id) || obj.id === ui.selectedObjectId;
        ctx.strokeStyle = isSelected ? '#fbbf24' : (obj.strokeColor || '#9ca3af');
        ctx.lineWidth = isSelected ? 3 : (obj.strokeWidth || 2);
        ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        // Draw selection handles for selected objects
        if (isSelected) {
          const handleSize = 6;
          ctx.fillStyle = '#fbbf24';
          // Top-left handle
          ctx.fillRect(x - width/2 - handleSize/2, y - height/2 - handleSize/2, handleSize, handleSize);
          // Top-right handle
          ctx.fillRect(x + width/2 - handleSize/2, y - height/2 - handleSize/2, handleSize, handleSize);
          // Bottom-left handle
          ctx.fillRect(x - width/2 - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
          // Bottom-right handle
          ctx.fillRect(x + width/2 - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
        }
      } else if (obj.type === 'circle') {
        const x = offsetX + obj.x * scale;
        const y = offsetY + obj.y * scale;
        const radius = (obj.radius || obj.width / 2) * scale;
        
        // Draw circle fill
        ctx.fillStyle = obj.fillColor || '#4b5563';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw circle outline with selection highlight
        const isSelected = ui.selectedObjects?.includes(obj.id) || obj.id === ui.selectedObjectId;
        ctx.strokeStyle = isSelected ? '#fbbf24' : (obj.strokeColor || '#9ca3af');
        ctx.lineWidth = isSelected ? 3 : (obj.strokeWidth || 2);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw selection handles for selected circles
        if (isSelected) {
          const handleSize = 6;
          ctx.fillStyle = '#fbbf24';
          // Top handle
          ctx.fillRect(x - handleSize/2, y - radius - handleSize/2, handleSize, handleSize);
          // Bottom handle
          ctx.fillRect(x - handleSize/2, y + radius - handleSize/2, handleSize, handleSize);
          // Left handle
          ctx.fillRect(x - radius - handleSize/2, y - handleSize/2, handleSize, handleSize);
          // Right handle
          ctx.fillRect(x + radius - handleSize/2, y - handleSize/2, handleSize, handleSize);
        }
      } else if (obj.type === 'line') {
        const x1 = offsetX + obj.x1 * scale;
        const y1 = offsetY + obj.y1 * scale;
        const x2 = offsetX + obj.x2 * scale;
        const y2 = offsetY + obj.y2 * scale;
        
        // Draw line with selection highlight
        const isSelected = ui.selectedObjects?.includes(obj.id) || obj.id === ui.selectedObjectId;
        ctx.strokeStyle = isSelected ? '#fbbf24' : (obj.strokeColor || '#9ca3af');
        ctx.lineWidth = isSelected ? 4 : (obj.strokeWidth || 2);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Draw selection handles for selected lines
        if (isSelected) {
          const handleSize = 6;
          ctx.fillStyle = '#fbbf24';
          // Start point handle
          ctx.fillRect(x1 - handleSize/2, y1 - handleSize/2, handleSize, handleSize);
          // End point handle
          ctx.fillRect(x2 - handleSize/2, y2 - handleSize/2, handleSize, handleSize);
        }
      } else if (obj.type === 'fixture') {
        const x = offsetX + obj.x * scale;
        const y = offsetY + obj.y * scale;
        const width = (obj.width || 2) * scale;
        const height = (obj.length || 4) * scale;
        
        // Get hover progress
        const hoverProgress = hoverManager.current.getHoverProgress(obj.id);
        const isSelected = ui.selectedObjects?.includes(obj.id) || obj.id === ui.selectedObjectId;
        
        // Draw hover glow
        if (hoverProgress > 0) {
          VisualEffects.drawGlow(
            ctx,
            x,
            y,
            Math.max(width, height) * 0.7,
            '#8b5cf6',
            hoverProgress
          );
        }
        
        // Draw light distribution pattern
        const hasIES = obj.model?.customIES?.data || obj.iesData;
        
        if (hasIES) {
          // Draw IES-based distribution pattern (more accurate)
          const iesData = obj.model?.customIES?.data || obj.iesData;
          
          // Create gradient for IES pattern
          const gradient = ctx.createRadialGradient(x, y + height/2, 0, x, y + height/2, height * 2);
          gradient.addColorStop(0, `rgba(255, 255, 100, ${0.3 + hoverProgress * 0.1})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 100, ${0.15 + hoverProgress * 0.05})`);
          gradient.addColorStop(1, `rgba(255, 255, 100, 0)`);
          
          ctx.fillStyle = gradient;
          
          // Draw more complex IES-based pattern
          ctx.beginPath();
          
          // Get beam angle from IES data if available
          const beamAngle = iesData.calculated?.beamAngle || 120;
          const fieldAngle = iesData.calculated?.fieldAngle || 150;
          
          // Draw main beam cone
          const beamSpread = Math.tan((beamAngle / 2) * Math.PI / 180) * height * 1.5;
          ctx.moveTo(x, y + height/2);
          ctx.lineTo(x - beamSpread, y + height * 1.5);
          ctx.lineTo(x + beamSpread, y + height * 1.5);
          ctx.closePath();
          ctx.fill();
          
          // Draw field cone (wider, dimmer)
          ctx.fillStyle = `rgba(255, 255, 100, ${0.05 + hoverProgress * 0.02})`;
          ctx.beginPath();
          const fieldSpread = Math.tan((fieldAngle / 2) * Math.PI / 180) * height * 2;
          ctx.moveTo(x, y + height/2);
          ctx.lineTo(x - fieldSpread, y + height * 2);
          ctx.lineTo(x + fieldSpread, y + height * 2);
          ctx.closePath();
          ctx.fill();
          
          // Add IES indicator badge
          ctx.save();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('IES', x + width/2 - 10, y - height/2 + 10);
          ctx.restore();
          
        } else {
          // Draw estimated distribution pattern (original implementation)
          ctx.fillStyle = `rgba(255, 255, 100, ${0.2 + hoverProgress * 0.1})`;
          ctx.beginPath();
          // Start from center bottom of fixture (light source)
          ctx.moveTo(x, y + height/2);
          // Expand outward to the sides and slightly downward
          ctx.lineTo(x - width * 1.2, y + height * 1.5);
          ctx.lineTo(x + width * 1.2, y + height * 1.5);
          ctx.closePath();
          ctx.fill();
          
          // Add additional side light spread for more realistic representation
          ctx.fillStyle = `rgba(255, 255, 100, ${0.1 + hoverProgress * 0.05})`;
          ctx.beginPath();
          // Wider, more gradual spread
          ctx.moveTo(x, y + height/2);
          ctx.lineTo(x - width * 2, y + height * 2.5);
          ctx.lineTo(x + width * 2, y + height * 2.5);
          ctx.closePath();  
          ctx.fill();
        }
        
        // Draw fixture with hover scale
        const hoverScale = 1 + (hoverProgress * 0.05);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(hoverScale, hoverScale);
        ctx.translate(-x, -y);
        
        // Draw fixture body
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(x - width/2, y - height/2, width, height);
        
        // Draw selection or hover outline
        if (isSelected) {
          // Animated selection outline
          const animProgress = animationManager.current.getValue(
            `selection_${obj.id}`,
            0
          );
          
          // Start animation if not running
          if (!animationManager.current.isAnimating(`selection_${obj.id}`)) {
            animationManager.current.animate(
              `selection_${obj.id}`,
              0,
              1,
              2000,
              Easings.linear
            );
          }
          
          ctx.restore(); // Restore before drawing selection outline
          VisualEffects.drawSelectionOutline(
            ctx,
            x,
            y,
            width,
            height,
            animProgress
          );
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(hoverScale, hoverScale);
          ctx.translate(-x, -y);
        } else {
          // Regular outline
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - width/2, y - height/2, width, height);
        }
        
        ctx.restore();
        
        // Draw selection handles for selected fixtures
        if (isSelected) {
          const handleSize = 6;
          ctx.fillStyle = '#fbbf24';
          // Corner handles
          ctx.fillRect(x - width/2 - handleSize/2, y - height/2 - handleSize/2, handleSize, handleSize);
          ctx.fillRect(x + width/2 - handleSize/2, y - height/2 - handleSize/2, handleSize, handleSize);
          ctx.fillRect(x - width/2 - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
          ctx.fillRect(x + width/2 - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
          
          // Rotation handle (center top)
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(x, y - height/2 - 15, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y - height/2);
          ctx.lineTo(x, y - height/2 - 11);
          ctx.stroke();
        }
        
        // Draw label with dimensions
        ctx.fillStyle = isSelected ? '#fbbf24' : 'white';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${obj.model?.model || 'Fixture'} ${i}`, x, y);
        
        // Draw dimensions for larger fixtures (when there's enough space)
        if (width > 60 && height > 40) {
          ctx.font = '8px sans-serif';
          ctx.fillStyle = isSelected ? '#fbbf24' : '#cccccc';
          const widthInches = Math.round((obj.width || 2) * 12);
          const lengthInches = Math.round((obj.length || 4) * 12);
          ctx.fillText(`${widthInches}"×${lengthInches}"`, x, y + 12);
          
          // Show wattage if available
          if (obj.model?.wattage) {
            ctx.fillText(`${obj.model.wattage}W`, x, y + 22);
          }
        }
      } else if (obj.type === 'hvacFan') {
        const x = offsetX + obj.x * scale;
        const y = offsetY + obj.y * scale;
        const radius = Math.min((obj.width || 2) * scale, (obj.length || 2) * scale) / 2;
        
        // Draw fan housing (circular)
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw fan blades
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        const bladeCount = 4;
        const bladeRadius = radius * 0.8;
        
        for (let j = 0; j < bladeCount; j++) {
          const angle = (j / bladeCount) * Math.PI * 2 + (obj.rotation || 0) * Math.PI / 180; // Use rotation property
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + Math.cos(angle) * bladeRadius,
            y + Math.sin(angle) * bladeRadius
          );
          ctx.stroke();
        }
        
        // Draw center hub
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw fan type indicator with color coding
        const fanObj = obj as any; // Type assertion to access fan properties
        let fanColor = '#3b82f6'; // Default blue
        if (fanObj.fanType === 'VAF') fanColor = '#10b981'; // Green for VAF
        else if (fanObj.fanType === 'HAF') fanColor = '#3b82f6'; // Blue for HAF
        else if (fanObj.fanType === 'Exhaust') fanColor = '#ef4444'; // Red for Exhaust
        else if (fanObj.fanType === 'Intake') fanColor = '#06b6d4'; // Cyan for Intake
        
        // Draw colored ring
        ctx.strokeStyle = fanColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw selection highlight
        const isSelected = ui.selectedObjects?.includes(obj.id) || obj.id === ui.selectedObjectId;
        if (isSelected) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Draw label
        ctx.fillStyle = isSelected ? '#fbbf24' : 'white';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${fanObj.fanType || 'FAN'}`, x, y + radius + 15);
        
        // Draw airflow indicator
        if (fanObj.airflow) {
          ctx.font = '8px sans-serif';
          ctx.fillText(`${fanObj.airflow} CFM`, x, y + radius + 25);
        }
      } else if (obj.type === 'equipment') {
        const x = offsetX + obj.x * scale;
        const y = offsetY + obj.y * scale;
        const width = (obj.width || 4) * scale;
        const height = (obj.length || 3) * scale;
        
        const equipment = obj as any;
        // Equipment rendering debug info would be logged here
        
        // Get equipment color and symbol based on category and type
        const getEquipmentVisuals = (category: string, equipmentType: string) => {
          if (equipmentType === 'dehumidifier') {
            return {
              color: '#0ea5e9', // Sky blue for dehumidifiers
              symbol: '💧',
              bgColor: '#0c4a6e' // Darker blue background
            };
          }
          
          switch (category) {
            case 'MiniSplit': 
              return { color: '#4a90e2', symbol: '❄️', bgColor: '#1e3a8a' }; // Blue
            case 'RTU': 
              return { color: '#7ed321', symbol: '🏢', bgColor: '#166534' }; // Green
            case 'Chiller': 
              return { color: '#50e3c2', symbol: '🧊', bgColor: '#134e4a' }; // Cyan
            case 'Heater': 
              return { color: '#f5a623', symbol: '🔥', bgColor: '#92400e' }; // Orange
            case 'HeatPump': 
              return { color: '#9013fe', symbol: '♻️', bgColor: '#581c87' }; // Purple
            case 'AHU': 
              return { color: '#6c7b7f', symbol: '💨', bgColor: '#374151' }; // Gray
            default: 
              return { color: '#ef4444', symbol: '❓', bgColor: '#7f1d1d' }; // Red for unknown
          }
        };

        const visuals = getEquipmentVisuals(equipment.category, equipment.equipmentType);

        // Main equipment housing with gradient
        const gradient = ctx.createLinearGradient(x - width/2, y - height/2, x + width/2, y + height/2);
        gradient.addColorStop(0, visuals.color);
        gradient.addColorStop(1, visuals.bgColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - width/2, y - height/2, width, height);
        
        // Add a bright border for visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        // Equipment bounds debug info would be logged here
        
        // Equipment frame with equipment type color
        ctx.strokeStyle = visuals.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - width/2 + 2, y - height/2 + 2, width - 4, height - 4);
        
        // Add equipment icon/symbol in center
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(visuals.symbol, x, y + 6);
        
        // Selection highlight
        const isSelected = ui.selectedObjects?.includes(obj.id) || obj.id === ui.selectedObjectId;
        if (isSelected) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.strokeRect(x - width/2 - 2, y - height/2 - 2, width + 4, height + 4);
          
          // Selection handles
          const handleSize = 6;
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x - width/2 - handleSize/2, y - height/2 - handleSize/2, handleSize, handleSize);
          ctx.fillRect(x + width/2 - handleSize/2, y - height/2 - handleSize/2, handleSize, handleSize);
          ctx.fillRect(x - width/2 - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
          ctx.fillRect(x + width/2 - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize);
        }
        
        // Equipment label with more detail
        ctx.fillStyle = isSelected ? '#fbbf24' : '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        
        // Main label
        const label = equipment.category || 'HVAC';
        ctx.fillText(label, x, y + height/2 + 15);
        
        // Capacity/tonnage label
        ctx.font = '8px sans-serif';
        if (equipment.tons) {
          ctx.fillText(`${equipment.tons} tons`, x, y + height/2 + 25);
        } else if (equipment.coolingCapacity) {
          const tons = Math.round(equipment.coolingCapacity / 12000 * 10) / 10;
          ctx.fillText(`${tons} tons`, x, y + height/2 + 25);
        }
        
        // Airflow label for applicable equipment
        if (equipment.airflow && width > 40) {
          ctx.fillText(`${equipment.airflow} CFM`, x, y + height/2 + 35);
        }
        
        // Physical dimensions label (for debugging/verification)
        if (width > 60 && height > 40) {
          ctx.font = '7px sans-serif';
          ctx.fillStyle = isSelected ? '#fbbf24' : '#cccccc';
          const physDims = equipment.physicalDimensions;
          if (physDims) {
            ctx.fillText(`${physDims.width}"×${physDims.depth}"×${physDims.height}"`, x, y + height/2 + 45);
          }
        }
      } else if (obj.type === 'unistrut') {
        const x = offsetX + obj.x * scale;
        const y = offsetY + obj.y * scale;
        const width = (obj.width || 1) * scale;
        const height = (obj.length || 0.135) * scale;
        
        const unistrut = obj as any;
        const isSelected = ui.selectedObjects?.includes(obj.id) || obj.id === ui.selectedObjectId;
        
        if (unistrut.subType === 'run') {
          // Draw unistrut run as a steel beam
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((obj.rotation || 0) * Math.PI / 180);
          
          // Main beam
          ctx.fillStyle = '#8b8b8b'; // Steel gray
          ctx.fillRect(-width/2, -height/2, width, height);
          
          // Beam edges for 3D effect
          ctx.fillStyle = '#a8a8a8';
          ctx.fillRect(-width/2, -height/2, width, 2);
          ctx.fillRect(-width/2, height/2 - 2, width, 2);
          
          // Selection highlight
          if (isSelected) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.strokeRect(-width/2 - 1, -height/2 - 1, width + 2, height + 2);
          }
          
          ctx.restore();
          
          // Label
          ctx.fillStyle = isSelected ? '#fbbf24' : '#ffffff';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${unistrut.unistrut?.size || 'P1000'}`, x, y + height/2 + 12);
          
        } else if (unistrut.subType === 'hanger') {
          // Draw hanger as a small connector
          ctx.fillStyle = '#666666';
          ctx.fillRect(x - 2, y - 2, 4, 4);
          
          // Draw hanging line to fixture if visible
          const fixture = objects.find(f => f.id === unistrut.unistrut?.fixtureId);
          if (fixture) {
            const fixtureX = offsetX + fixture.x * scale;
            const fixtureY = offsetY + fixture.y * scale;
            
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(fixtureX, fixtureY);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          
          // Selection highlight
          if (isSelected) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    });
    
    // Draw current shape being drawn with visual effects
    if (isDrawing) {
      // Animate drawing glow
      if (!animationManager.current.isAnimating('drawingGlow')) {
        animationManager.current.animate(
          'drawingGlow',
          { intensity: 0.5 },
          { intensity: 1 },
          500,
          Easings.easeInOutQuad
        );
      }
      
      const glowIntensity = animationManager.current.getValue(
        'drawingGlow',
        { intensity: 0.5 }
      ).intensity;
      
      if (currentRect && ui.selectedTool === 'rectangle') {
        const x = offsetX + currentRect.x * scale;
        const y = offsetY + currentRect.y * scale;
        const width = currentRect.width * scale;
        const height = currentRect.height * scale;
        
        // Draw glow effect
        if (width > 5 && height > 5) {
          VisualEffects.drawGlow(
            ctx,
            x + width/2,
            y + height/2,
            Math.max(width, height) * 0.5,
            '#8b5cf6',
            glowIntensity
          );
        }
        
        // Draw preview rectangle
        ctx.fillStyle = 'rgba(75, 85, 99, 0.3)';
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        
        // Draw dimensions
        if (width > 20 && height > 20) {
          ctx.fillStyle = 'white';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${currentRect.width.toFixed(1)} ft`, x + width/2, y - 5);
          ctx.save();
          ctx.translate(x - 5, y + height/2);
          ctx.rotate(-Math.PI/2);
          ctx.fillText(`${currentRect.height.toFixed(1)} ft`, 0, 0);
          ctx.restore();
        }
      } else if (currentCircle && ui.selectedTool === 'circle') {
        const x = offsetX + currentCircle.x * scale;
        const y = offsetY + currentCircle.y * scale;
        const radius = currentCircle.radius * scale;
        
        // Draw preview circle
        ctx.fillStyle = 'rgba(75, 85, 99, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw radius
        if (radius > 10) {
          ctx.fillStyle = 'white';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`r: ${currentCircle.radius.toFixed(1)} ft`, x, y - radius - 5);
        }
      } else if (currentLine && ui.selectedTool === 'line') {
        const x1 = offsetX + currentLine.x1 * scale;
        const y1 = offsetY + currentLine.y1 * scale;
        const x2 = offsetX + currentLine.x2 * scale;
        const y2 = offsetY + currentLine.y2 * scale;
        
        // Draw preview line
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw length
        const length = Math.sqrt(Math.pow(currentLine.x2 - currentLine.x1, 2) + Math.pow(currentLine.y2 - currentLine.y1, 2));
        if (length > 2) {
          ctx.fillStyle = 'white';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          ctx.fillText(`${length.toFixed(1)} ft`, midX, midY - 5);
        }
      }
    }
    
    // Draw selection box
    if (isSelecting && selectionBox) {
      const x = offsetX + selectionBox.x * scale;
      const y = offsetY + selectionBox.y * scale;
      const width = selectionBox.width * scale;
      const height = selectionBox.height * scale;
      
      // Draw selection box fill
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(x, y, width, height);
      
      // Draw selection box outline
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
    
    // Draw snap indicators
    snapIndicators.forEach((indicator, index) => {
      const snapProgress = animationManager.current.getValue(
        'snapIndicator',
        { progress: 0 }
      ).progress;
      
      if (snapProgress > 0) {
        const indicatorX = offsetX + indicator.x * scale;
        const indicatorY = offsetY + indicator.y * scale;
        VisualEffects.drawSnapIndicator(
          ctx,
          indicatorX,
          indicatorY,
          indicator.type,
          snapProgress
        );
      }
    });
    
    // Clear old indicators
    if (snapIndicators.length > 0) {
      const snapProgress = animationManager.current.getValue(
        'snapIndicator',
        { progress: 0 }
      ).progress;
      if (snapProgress >= 1) {
        setSnapIndicators([]);
      }
    }
    
    // Draw success feedback
    if (successFeedback) {
      const pulseProgress = animationManager.current.getValue(
        'successPulse',
        { progress: 0 }
      ).progress;
      
      const feedbackX = offsetX + successFeedback.x * scale;
      const feedbackY = offsetY + successFeedback.y * scale;
      
      // Draw pulse
      VisualEffects.drawPulse(
        ctx,
        feedbackX,
        feedbackY,
        30,
        '#10b981',
        pulseProgress
      );
      
      // Draw tooltip
      VisualEffects.drawTooltip(
        ctx,
        feedbackX,
        feedbackY - 20,
        successFeedback.message,
        1 - pulseProgress
      );
    }
    
    // Draw measurements
    measurements.forEach(measurement => {
      MeasurementRenderer.drawMeasurement(
        ctx,
        measurement,
        scale,
        offsetX,
        offsetY,
        false // isActive
      );
    });
    
    // Draw current measurement being created
    if (measurementMode && measurementPoints.length > 0 && currentMeasurement) {
      const tempMeasurement: Measurement = {
        id: 'temp',
        type: currentMeasurement.type || 'distance',
        points: measurementPoints,
        value: 0,
        unit: 'ft',
        visible: true,
        locked: false,
        color: currentMeasurement.color || '#fbbf24',
        timestamp: Date.now()
      };
      
      MeasurementRenderer.drawMeasurement(
        ctx,
        tempMeasurement,
        scale,
        offsetX,
        offsetY,
        true // isActive
      );
    }
    
    // Draw info
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Objects: ${objects.length}`, 10, 20);
    if (ui.selectedObjects && ui.selectedObjects.length > 0) {
      ctx.fillText(`Selected: ${ui.selectedObjects.length}`, 10, 35);
    }
    if (measurementMode) {
      ctx.fillText(`Measurement Mode`, 10, 50);
    }
  }, [room, objects, ui.selectedObjectId, ui.selectedObjects, ui.selectedTool, currentRect, currentCircle, currentLine, isDrawing, showPPFDOverlay, ppfdOpacity, calculations, ppfdColorRanges, calculationZones, currentZone, isDrawingZone, isSelecting, selectionBox, showGrid, snapToGrid, gridSize, hoveredObjectId, snapIndicators, successFeedback, measurements, measurementMode, measurementPoints, currentMeasurement]);
  
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
  
  // Redraw when state changes with optimization
  useEffect(() => {
    invalidate();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [draw, invalidate, objects, room, ui, calculations, showPPFDOverlay, showGrid, calculationZones, hoveredObjectId, snapIndicators, successFeedback]);
  
  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationManager.current.clear();
      hoverManager.current.clear();
    };
  }, []);
  
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
    
    // Debug coordinate conversion would be logged here
    
    return { x: roomX, y: roomY };
  }, [room]);

  // Handle mouse down (start drawing)
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!room || !canvasRef.current) return;
    
    // Close context menu on any click
    if (contextMenu) {
      setContextMenu(null);
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const roomCoords = canvasToRoom(canvasX, canvasY);
    
    // Check if click is inside room
    if (roomCoords.x < 0 || roomCoords.x > room.width || roomCoords.y < 0 || roomCoords.y > room.length) {
      return;
    }
    
    // Handle right click for context menu
    if (event.button === 2) {
      event.preventDefault();
      const objectAt = getObjectAt(roomCoords.x, roomCoords.y);
      
      if (objectAt) {
        // Object context menu
        if (!ui.selectedObjects?.includes(objectAt.id)) {
          selectObject(objectAt.id);
        }
        setContextMenu({ 
          x: event.clientX, 
          y: event.clientY, 
          target: 'object',
          objectId: objectAt.id
        });
      } else {
        // Canvas context menu
        setContextMenu({ 
          x: event.clientX, 
          y: event.clientY, 
          target: 'canvas'
        });
      }
      return;
    }
    
    // Debug: Log all objects when clicking
    if (event.shiftKey && event.altKey) {
      return;
    }
    
    // Handle measurement mode
    if (measurementMode && currentMeasurement) {
      const snappedCoords = applySnapping(roomCoords.x, roomCoords.y);
      setMeasurementPoints(prev => [...prev, snappedCoords]);
      
      // Check if measurement is complete
      const { type } = currentMeasurement;
      if (
        (type === 'distance' && measurementPoints.length === 1) ||
        (type === 'angle' && measurementPoints.length === 2) ||
        (type === 'radius' && measurementPoints.length === 1)
      ) {
        // Complete measurement
        const measurement: Measurement = {
          id: `measurement_${Date.now()}`,
          type: type!,
          points: [...measurementPoints, snappedCoords],
          value: 0, // Will be calculated
          unit: 'ft',
          visible: true,
          locked: false,
          color: currentMeasurement.color || '#fbbf24',
          timestamp: Date.now()
        };
        
        // Calculate value
        const scale = calculatePixelScale();
        const result = MeasurementCalculator.calculateMeasurement(type!, measurement.points, scale);
        measurement.value = result.value;
        measurement.unit = result.unit;
        
        addMeasurement(measurement);
        setMeasurementPoints([]);
        
        // Continue in measurement mode for convenience
      }
      
      return;
    }
    
    if (isDrawingZone) {
      setZoneStart(roomCoords);
      setCurrentZone({ x: roomCoords.x, y: roomCoords.y, width: 0, height: 0 });
    } else if (ui.selectedTool === 'select' || ui.selectedTool === 'move') {
      // Object selection and movement
      const objectAt = getObjectAt(roomCoords.x, roomCoords.y);
      
      if (objectAt) {
        
        // Select object if not already selected
        if (!ui.selectedObjects?.includes(objectAt.id)) {
          if (event.shiftKey) {
            // Add to selection
            const newSelection = [...(ui.selectedObjects || []), objectAt.id];
            selectObjects(newSelection);
          } else {
            // Single selection
            selectObject(objectAt.id);
          }
          
          // Force update the selected objects state
          dispatch({ 
            type: 'UPDATE_UI', 
            payload: { 
              selectedObjects: [objectAt.id],
              selectedObjectId: objectAt.id 
            } 
          });
        }
        
        // Start dragging if in move mode or select mode with object selected
        if (ui.selectedTool === 'move' || ui.selectedTool === 'select') {
          
          // Ensure the clicked object is in the selection
          const selectedIds = ui.selectedObjects?.includes(objectAt.id) 
            ? ui.selectedObjects 
            : [objectAt.id];
          
          setIsDragging(true);
          setDragStartPos(roomCoords);
          
          // Store original positions for undo
          const originalPositions: {[key: string]: {x: number, y: number}} = {};
          selectedIds.forEach(objId => {
            const obj = objects.find(o => o.id === objId);
            if (obj) {
              originalPositions[objId] = { x: obj.x, y: obj.y };
            }
          });
          setDraggedObjects(originalPositions);
        }
      } else {
        // Start selection box if no object clicked
        if (!event.shiftKey) {
          clearSelection();
        }
        setIsSelecting(true);
        setDrawStart(roomCoords);
        setSelectionBox({ x: roomCoords.x, y: roomCoords.y, width: 0, height: 0 });
      }
    } else if (ui.selectedTool === 'copy') {
      // Handle copy tool
      copySelectedObjects();
    } else if (ui.selectedTool === 'rotate') {
      // Handle rotate tool
      rotateSelectedObjects();
    } else if (ui.selectedTool === 'rectangle') {
      setIsDrawing(true);
      setDrawStart(roomCoords);
      setCurrentRect({ x: roomCoords.x, y: roomCoords.y, width: 0, height: 0 });
    } else if (ui.selectedTool === 'circle') {
      setIsDrawing(true);
      setDrawStart(roomCoords);
      setCurrentCircle({ x: roomCoords.x, y: roomCoords.y, radius: 0 });
    } else if (ui.selectedTool === 'line') {
      setIsDrawing(true);
      setDrawStart(roomCoords);
      setCurrentLine({ x1: roomCoords.x, y1: roomCoords.y, x2: roomCoords.x, y2: roomCoords.y });
    }
  }, [room, ui.selectedTool, ui.selectedObjects, canvasToRoom, isDrawingZone, getObjectAt, selectObject, selectObjects, clearSelection, copySelectedObjects, rotateSelectedObjects, measurementMode, currentMeasurement, measurementPoints, calculatePixelScale, addMeasurement, showNotification, dispatch, objects, contextMenu]);

  // Handle mouse move (drawing)
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!room || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const roomCoords = canvasToRoom(canvasX, canvasY);
    
    // Update hover state
    const objectUnderMouse = getObjectAt(roomCoords.x, roomCoords.y);
    if (objectUnderMouse?.id !== hoveredObjectId) {
      if (hoveredObjectId) {
        hoverManager.current.setHover(hoveredObjectId, false);
      }
      if (objectUnderMouse) {
        hoverManager.current.setHover(objectUnderMouse.id, true);
      }
      setHoveredObjectId(objectUnderMouse?.id || null);
      invalidate();
    }
    
    // Constrain to room bounds
    let endX = Math.max(0, Math.min(room.width, roomCoords.x));
    let endY = Math.max(0, Math.min(room.length, roomCoords.y));
    
    // Apply snapping (but not during selection box drawing)
    if (!isSelecting || isDragging) {
      const excludeIds = isDragging ? (ui.selectedObjects || []) : [];
      const snapped = applySnapping(endX, endY, excludeIds);
      endX = snapped.x;
      endY = snapped.y;
    }
    
    if (isDragging && dragStartPos && ui.selectedObjects && ui.selectedObjects.length > 0) {
      // Handle object dragging - update positions temporarily without creating undo states
      const deltaX = endX - dragStartPos.x;
      const deltaY = endY - dragStartPos.y;
      
      // Drag debug info would be logged here
      
      // Create a direct state update that bypasses the reducer's history system
      const updatedObjects = objects.map(obj => {
        if (ui.selectedObjects?.includes(obj.id)) {
          const originalPos = draggedObjects[obj.id];
          if (originalPos) {
            return {
              ...obj,
              x: originalPos.x + deltaX,
              y: originalPos.y + deltaY
            };
          } else {
          }
        }
        return obj;
      });
      
      // Update state directly without going through the reducer
      dispatch({ 
        type: 'UPDATE_OBJECTS_TEMP', 
        payload: updatedObjects 
      });
    } else if (isSelecting && drawStart) {
      // Handle selection box
      const width = endX - drawStart.x;
      const height = endY - drawStart.y;
      
      setSelectionBox({
        x: width < 0 ? endX : drawStart.x,
        y: height < 0 ? endY : drawStart.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else if (isDrawingZone && zoneStart) {
      const width = endX - zoneStart.x;
      const height = endY - zoneStart.y;
      
      setCurrentZone({
        x: width < 0 ? endX : zoneStart.x,
        y: height < 0 ? endY : zoneStart.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else if (isDrawing && drawStart) {
    
    if (ui.selectedTool === 'rectangle') {
      const width = endX - drawStart.x;
      const height = endY - drawStart.y;
      
      setCurrentRect({
        x: width < 0 ? endX : drawStart.x,
        y: height < 0 ? endY : drawStart.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else if (ui.selectedTool === 'circle') {
      const radius = Math.sqrt(Math.pow(endX - drawStart.x, 2) + Math.pow(endY - drawStart.y, 2));
      setCurrentCircle({
        x: drawStart.x,
        y: drawStart.y,
        radius: radius
      });
    } else if (ui.selectedTool === 'line') {
      setCurrentLine({
        x1: drawStart.x,
        y1: drawStart.y,
        x2: endX,
        y2: endY
      });
    }
    }
  }, [isDrawing, drawStart, room, ui.selectedTool, ui.selectedObjects, canvasToRoom, isDrawingZone, zoneStart, isDragging, dragStartPos, objects, updateObject, isSelecting, applySnapping, dispatch, draggedObjects, hoveredObjectId, invalidate]);

  // Handle mouse up (finish drawing)
  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!room) return;
    
    if (isDragging) {
      // End object dragging - commit final positions with a single undo state
      let actuallyMoved = false;
      
      // Check if any objects actually moved from their original positions
      ui.selectedObjects?.forEach(objectId => {
        const obj = objects.find(o => o.id === objectId);
        const original = draggedObjects[objectId];
        if (obj && original) {
          if (Math.abs(obj.x - original.x) > 0.01 || Math.abs(obj.y - original.y) > 0.01) {
            actuallyMoved = true;
            // Commit the final position to create a single undo state
            updateObject(objectId, { x: obj.x, y: obj.y });
          }
        }
      });
      
      if (actuallyMoved) {
        // Get center of moved objects
        let centerX = 0, centerY = 0, count = 0;
        ui.selectedObjects?.forEach(id => {
          const obj = objects.find(o => o.id === id);
          if (obj) {
            centerX += obj.x;
            centerY += obj.y;
            count++;
          }
        });
        
        if (count > 0) {
          centerX /= count;
          centerY /= count;
          
          // Animate pulse effect
          animationManager.current.animate(
            'successPulse',
            { progress: 0 },
            { progress: 1 },
            600,
            Easings.easeOutQuad,
            () => setSuccessFeedback(null)
          );
          
          setSuccessFeedback({
            x: centerX,
            y: centerY,
            message: 'Objects moved'
          });
        }
        
        showNotification('success', 'Objects moved');
      }
      
      setIsDragging(false);
      setDragStartPos(null);
      setDraggedObjects({});
    } else if (isSelecting && selectionBox && selectionBox.width > 0.5 && selectionBox.height > 0.5) {
      // End selection box and select objects within
      const objectsInBox = getObjectsInBox(selectionBox);
      if (objectsInBox.length > 0) {
        selectObjects(objectsInBox.map(obj => obj.id));
        showNotification('success', `Selected ${objectsInBox.length} object(s)`);
      }
      setIsSelecting(false);
      setSelectionBox(null);
      setDrawStart(null);
    } else if (isDrawingZone && currentZone && currentZone.width > 0.5 && currentZone.height > 0.5) {
      const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
      const newZone = {
        id: `zone_${Date.now()}`,
        name: `Zone ${calculationZones.length + 1}`,
        x: currentZone.x,
        y: currentZone.y,
        width: currentZone.width,
        height: currentZone.height,
        z: 3, // Default 3 feet above floor
        enabled: true,
        color: colors[calculationZones.length % colors.length]
      };
      setCalculationZones([...calculationZones, newZone]);
      setIsDrawingZone(false);
      setCurrentZone(null);
      setZoneStart(null);
      showNotification('success', `Zone "${newZone.name}" created`);
    } else if (isDrawing && ui.selectedTool === 'rectangle' && currentRect && currentRect.width > 0.5 && currentRect.height > 0.5) {
      // Create a rectangle object
      const rectangle = {
        type: 'rectangle' as const,
        x: currentRect.x + currentRect.width / 2, // Center position
        y: currentRect.y + currentRect.height / 2,
        z: 0,
        width: currentRect.width,
        length: currentRect.height,
        height: 0.1,
        rotation: 0,
        fillColor: '#4b5563',
        strokeColor: '#9ca3af',
        strokeWidth: 2,
        enabled: true
      };
      
      addObject(rectangle);
      showNotification('success', `Created ${currentRect.width.toFixed(1)} × ${currentRect.height.toFixed(1)} ft rectangle`);
    } else if (isDrawing && ui.selectedTool === 'circle' && currentCircle && currentCircle.radius > 0.5) {
      // Create a circle object
      const circle = {
        type: 'circle' as const,
        x: currentCircle.x,
        y: currentCircle.y,
        z: 0,
        radius: currentCircle.radius,
        width: currentCircle.radius * 2, // For compatibility with base object
        length: currentCircle.radius * 2,
        height: 0.1,
        rotation: 0,
        fillColor: '#4b5563',
        strokeColor: '#9ca3af',
        strokeWidth: 2,
        enabled: true
      };
      
      addObject(circle);
      showNotification('success', `Created circle with radius ${currentCircle.radius.toFixed(1)} ft`);
    } else if (isDrawing && ui.selectedTool === 'line' && currentLine) {
      const length = Math.sqrt(Math.pow(currentLine.x2 - currentLine.x1, 2) + Math.pow(currentLine.y2 - currentLine.y1, 2));
      if (length > 0.5) {
        // Create a line object
        const line = {
          type: 'line' as const,
          x: (currentLine.x1 + currentLine.x2) / 2, // Center position for selection
          y: (currentLine.y1 + currentLine.y2) / 2,
          z: 0,
          x1: currentLine.x1,
          y1: currentLine.y1,
          x2: currentLine.x2,
          y2: currentLine.y2,
          width: length,
          length: 0.1,
          height: 0.1,
          rotation: Math.atan2(currentLine.y2 - currentLine.y1, currentLine.x2 - currentLine.x1) * 180 / Math.PI,
          strokeColor: '#9ca3af',
          strokeWidth: 2,
          enabled: true
        };
        
        addObject(line);
        showNotification('success', `Created line ${length.toFixed(1)} ft long`);
      }
    }
    
    // Clean up all states
    setIsDrawing(false);
    setIsSelecting(false);
    setIsDragging(false);
    setDrawStart(null);
    setDragStartPos(null);
    setCurrentRect(null);
    setCurrentCircle(null);
    setCurrentLine(null);
    setSelectionBox(null);
  }, [isDrawing, currentRect, currentCircle, currentLine, room, ui.selectedTool, addObject, showNotification, isDrawingZone, currentZone, calculationZones, isDragging, isSelecting, selectionBox, getObjectsInBox, selectObjects]);

  // Handle canvas click (for placing fixtures and fans)
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    
    if (!room || !canvasRef.current || ui.selectedTool !== 'place') {
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
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
    
    // Convert click to room coordinates
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const roomX = (clickX - offsetX) / scale;
    const roomY = (clickY - offsetY) / scale;
    
    // Check if click is inside room
    if (roomX < 0 || roomX > room.width || roomY < 0 || roomY > room.length) {
      showNotification('error', 'Click inside the room to place item');
      return;
    }
    
    const selectedFixture = ui.selectedFixtureModel;
    if (!selectedFixture) {
      showNotification('error', 'Please select a fixture or fan first');
      return;
    }
    
    // Check if this is a fan or fixture based on the type property
    if (selectedFixture.type === 'hvacFan') {
      // Creating a fan object
      const fan = {
        type: 'hvacFan' as const,
        x: roomX,
        y: roomY,
        z: selectedFixture.mountType === 'ceiling' ? room.height - 1 : 3, // Ceiling mounted or floor level
        rotation: 0,
        width: selectedFixture.diameter / 12, // Convert inches to feet
        length: selectedFixture.diameter / 12,
        height: 0.5,
        enabled: true,
        fanType: selectedFixture.fanType,
        airflow: selectedFixture.airflow,
        power: selectedFixture.power,
        diameter: selectedFixture.diameter,
        mountType: selectedFixture.mountType
      };
      
      addObject(fan);
      showNotification('success', `Placed ${selectedFixture.manufacturer} ${selectedFixture.model} (${selectedFixture.fanType})`);
    } else {
      // Creating a fixture object with proper DLC dimensions
      let fixtureWidth = 2;   // default width in feet
      let fixtureLength = 4;  // default length in feet  
      let fixtureHeight = 0.5; // default height in feet
      
      // Use DLC database dimensions if available (convert inches to feet)
      if (selectedFixture.dlcData) {
        const dlcWidth = selectedFixture.dlcData.width;
        const dlcLength = selectedFixture.dlcData.length;
        const dlcHeight = selectedFixture.dlcData.height;
        
        fixtureWidth = dlcWidth ? dlcWidth / 12 : 2;
        fixtureLength = dlcLength ? dlcLength / 12 : 4;
        fixtureHeight = dlcHeight ? dlcHeight / 12 : 0.5;
        // DLC data debug info would be logged here
      } else if (selectedFixture.dimensions) {
        // Fall back to fixture dimensions if available
        fixtureWidth = selectedFixture.dimensions.width || 2;
        fixtureLength = selectedFixture.dimensions.length || 4;
        fixtureHeight = selectedFixture.dimensions.height || 0.5;
      } else {
      }
      
      const fixture = {
        type: 'fixture' as const,
        x: roomX,
        y: roomY,
        z: room.height - 3,
        rotation: 0,
        width: fixtureWidth,
        length: fixtureLength,
        height: fixtureHeight,
        enabled: true,
        model: {
          ...selectedFixture,
          // Store DLC dimensions for 3D rendering
          dimensions: {
            width: fixtureWidth,
            length: fixtureLength,
            height: fixtureHeight
          }
        },
        dimmingLevel: 100
      };
      
      addObject(fixture);
      showNotification('success', `Placed ${selectedFixture.brand} ${selectedFixture.model}`);
    }
    
    dispatch({ type: 'SET_TOOL', payload: 'select' });
  }, [room, ui.selectedTool, ui.selectedFixtureModel, addObject, showNotification, dispatch]);
  
  // Event listeners for PPFD panel control
  useEffect(() => {
    const handleHidePPFDPanel = () => {
      setShowPPFDPanel(false);
    };
    
    const handleShowPPFDPanel = () => {
      setShowPPFDPanel(true);
    };
    
    window.addEventListener('hidePPFDPanel', handleHidePPFDPanel);
    window.addEventListener('showPPFDPanel', handleShowPPFDPanel);
    
    return () => {
      window.removeEventListener('hidePPFDPanel', handleHidePPFDPanel);
      window.removeEventListener('showPPFDPanel', handleShowPPFDPanel);
    };
  }, []);
  
  // Keyboard shortcuts for PPFD overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Toggle PPFD overlay with 'H' key
      if (e.key === 'h' || e.key === 'H') {
        setShowPPFDOverlay(prev => !prev);
        showNotification('info', `PPFD heatmap ${showPPFDOverlay ? 'hidden' : 'shown'}`);
      }
      // Adjust opacity with [ and ] keys
      if (e.key === '[' && ppfdOpacity > 0.1) {
        setPpfdOpacity(prev => Math.max(0.1, prev - 0.1));
      }
      if (e.key === ']' && ppfdOpacity < 1) {
        setPpfdOpacity(prev => Math.min(1, prev + 0.1));
      }
      // Cancel zone drawing with ESC
      if (e.key === 'Escape' && isDrawingZone) {
        setIsDrawingZone(false);
        setCurrentZone(null);
        setZoneStart(null);
        showNotification('info', 'Zone drawing cancelled');
      }
      
      // Object manipulation shortcuts
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedObjects = objects.filter(obj => ui.selectedObjects?.includes(obj.id));
        if (selectedObjects.length > 0) {
          selectedObjects.forEach(obj => {
            dispatch({ type: 'DELETE_OBJECT', payload: obj.id });
          });
          clearSelection();
          showNotification('success', `Deleted ${selectedObjects.length} object(s)`);
        }
      }
      
      // Copy shortcut (Ctrl+D or Ctrl+C)
      if ((e.key === 'd' || e.key === 'c') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        copySelectedObjects();
      }
      
      // Paste shortcut (Ctrl+V)
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        pasteObjects();
      }
      
      // Rotate shortcut (R key)
      if (e.key === 'r' || e.key === 'R') {
        rotateSelectedObjects();
      }
      
      // Select all (Ctrl+A)
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (objects.length > 0) {
          selectObjects(objects.map(obj => obj.id));
          showNotification('success', `Selected all ${objects.length} objects`);
        }
      }
      
      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') {
        dispatch({ type: 'SET_TOOL', payload: 'select' });
      }
      if (e.key === 'm' || e.key === 'M') {
        dispatch({ type: 'SET_TOOL', payload: 'move' });
      }
      if (e.key === 'f' || e.key === 'F') {
        dispatch({ type: 'SET_TOOL', payload: 'place' });
      }
      
      // Debug: Select all equipment (E key)
      if (e.key === 'e' || e.key === 'E') {
        const equipmentObjects = objects.filter(obj => obj.type === 'equipment');
        if (equipmentObjects.length > 0) {
          selectObjects(equipmentObjects.map(obj => obj.id));
          showNotification('info', `Selected ${equipmentObjects.length} equipment objects`);
        }
      }
      
      // Snap shortcuts
      if (e.key === 'g' || e.key === 'G') {
        setSnapToGrid(!snapToGrid);
        showNotification('info', `Grid snap ${!snapToGrid ? 'enabled' : 'disabled'}`);
      }
      if (e.key === 's' && e.shiftKey) {
        setSnapToObjects(!snapToObjects);
        showNotification('info', `Object snap ${!snapToObjects ? 'enabled' : 'disabled'}`);
      }
      if (e.key === 'h' || e.key === 'H') {
        setShowGrid(!showGrid);
        showNotification('info', `Grid ${!showGrid ? 'shown' : 'hidden'}`);
      }
      
      // Measurement mode shortcut (Alt+M)
      if (e.key === 'm' && e.altKey) {
        e.preventDefault();
        if (measurementMode) {
          setMeasurementMode(false);
          setCurrentMeasurement(null);
          setMeasurementPoints([]);
          showNotification('info', 'Measurement mode deactivated');
        } else {
          setMeasurementMode(true);
          setCurrentMeasurement({ type: 'distance', color: '#fbbf24' });
          setMeasurementPoints([]);
          showNotification('info', 'Measurement mode activated');
        }
      }
      
      // Escape to cancel measurement
      if (e.key === 'Escape' && measurementMode) {
        setMeasurementPoints([]);
        showNotification('info', 'Measurement cancelled');
      }
      
      // Export shortcut (Ctrl+E)
      if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowExportImport(true);
      }
      
      // Import shortcut (Ctrl+I)
      if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowExportImport(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ppfdOpacity, showPPFDOverlay, showNotification, isDrawingZone, objects, ui.selectedObjects, dispatch, clearSelection, copySelectedObjects, rotateSelectedObjects, selectObjects, snapToGrid, snapToObjects, showGrid, pasteObjects, measurementMode, setMeasurementMode, setCurrentMeasurement, setMeasurementPoints, setShowExportImport]);
  
  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white overflow-auto">
        <div className="text-center max-w-4xl px-4 py-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Welcome to Vibelux Designer
          </h1>
          <p className="text-gray-400 mb-12 text-lg">Choose your growing environment to get started</p>
          
          {/* Test button to verify panel system */}
          <div className="mb-4">
            <button
              onClick={() => {
                const testRoom = {
                  width: 20,
                  length: 20,
                  height: 10,
                  ceilingHeight: 10,
                  workingHeight: 3,
                  reflectances: { ceiling: 0.8, walls: 0.5, floor: 0.2 },
                  roomType: 'cultivation',
                  windows: []
                };
                setRoom(testRoom);
                showNotification('success', 'TEST: Created 20×20 room directly');
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              TEST: Create Room Directly (No Panel)
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Indoor Room Card */}
            <div className="group">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'roomConfiguration' }));
                }}
                className="w-full p-8 bg-gradient-to-br from-purple-900/20 to-purple-800/20 hover:from-purple-900/30 hover:to-purple-800/30 border border-purple-700/50 hover:border-purple-600 rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-900/50"
              >
                <div className="flex flex-col items-center space-y-4">
                  {/* Room Icon */}
                  <div className="w-24 h-24 bg-purple-600/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                    <svg className="w-14 h-14 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Indoor Room</h3>
                    <p className="text-gray-400">Warehouse, container, or sealed room</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Climate controlled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>No natural light</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Full LED lighting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Multi-tier capable</span>
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Quick presets for indoor */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => {
                    const room = {
                      width: 40,
                      length: 40,
                      height: 10,
                      ceilingHeight: 10,
                      workingHeight: 3,
                      reflectances: { ceiling: 0.8, walls: 0.5, floor: 0.2 },
                      roomType: 'cultivation',
                      windows: []
                    };
                    setRoom(room);
                    showNotification('success', 'Created 40×40ft cultivation room');
                  }}
                  className="px-3 py-1 text-xs bg-purple-700/30 hover:bg-purple-700/50 rounded-full"
                >
                  40×40 Flower
                </button>
                <button
                  onClick={() => {
                    const room = {
                      width: 8,
                      length: 40,
                      height: 8,
                      ceilingHeight: 8,
                      workingHeight: 3,
                      reflectances: { ceiling: 0.8, walls: 0.5, floor: 0.2 },
                      roomType: 'container',
                      windows: []
                    };
                    setRoom(room);
                    showNotification('success', 'Created 8×40ft shipping container');
                  }}
                  className="px-3 py-1 text-xs bg-purple-700/30 hover:bg-purple-700/50 rounded-full"
                >
                  Shipping Container
                </button>
              </div>
            </div>
            
            {/* Greenhouse Card */}
            <div className="group">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'greenhouseConfiguration' }));
                }}
                className="w-full p-8 bg-gradient-to-br from-green-900/20 to-green-800/20 hover:from-green-900/30 hover:to-green-800/30 border border-green-700/50 hover:border-green-600 rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-green-900/50"
              >
                <div className="flex flex-col items-center space-y-4">
                  {/* Greenhouse Icon */}
                  <div className="w-24 h-24 bg-green-600/20 rounded-2xl flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                    <svg className="w-14 h-14 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v4M8 7l4-4 4 4" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Greenhouse</h3>
                    <p className="text-gray-400">Glass or poly structure</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                      <span>Natural sunlight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Supplemental LED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Gutter connect</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span>DLI optimization</span>
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Quick presets for greenhouse */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => {
                    const greenhouse = {
                      width: 30,
                      length: 96,
                      height: 14,
                      ceilingHeight: 14,
                      workingHeight: 3,
                      reflectances: { ceiling: 0.7, walls: 0.5, floor: 0.2 },
                      roomType: 'greenhouse',
                      windows: []
                    };
                    setRoom(greenhouse);
                    showNotification('success', 'Created 30×96ft greenhouse');
                  }}
                  className="px-3 py-1 text-xs bg-green-700/30 hover:bg-green-700/50 rounded-full"
                >
                  30×96 Standard
                </button>
                <button
                  onClick={() => {
                    const greenhouse = {
                      width: 42,
                      length: 144,
                      height: 16,
                      ceilingHeight: 16,
                      workingHeight: 3,
                      reflectances: { ceiling: 0.7, walls: 0.5, floor: 0.2 },
                      roomType: 'greenhouse',
                      windows: []
                    };
                    setRoom(greenhouse);
                    showNotification('success', 'Created 42×144ft gutter connect');
                  }}
                  className="px-3 py-1 text-xs bg-green-700/30 hover:bg-green-700/50 rounded-full"
                >
                  42×144 Gutter
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">
            Need custom dimensions? Click the room type above or use the status bar below
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full" ref={containerRef} style={{ minHeight: '400px' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(event) => {
          if (measurementMode && currentMeasurement) {
            const { type } = currentMeasurement;
            if ((type === 'area' || type === 'perimeter') && measurementPoints.length >= 3) {
              // Complete polygon measurement
              const measurement: Measurement = {
                id: `measurement_${Date.now()}`,
                type: type,
                points: [...measurementPoints],
                value: 0,
                unit: 'ft',
                visible: true,
                locked: false,
                color: currentMeasurement.color || '#fbbf24',
                timestamp: Date.now()
              };
              
              // Calculate value
              const scale = calculatePixelScale();
              const result = MeasurementCalculator.calculateMeasurement(type, measurement.points, scale);
              measurement.value = result.value;
              measurement.unit = result.unit;
              
              addMeasurement(measurement);
              setMeasurementPoints([]);
              showNotification('success', `${type} measurement completed`);
            }
          }
        }}
        style={{
          cursor: isDrawingZone 
            ? 'crosshair' 
            : ['place', 'rectangle', 'circle', 'line'].includes(ui.selectedTool) 
              ? 'crosshair' 
              : ui.selectedTool === 'move' 
                ? 'move'
                : ui.selectedTool === 'copy'
                  ? 'copy'
                  : ui.selectedTool === 'rotate'
                    ? 'grab'
                    : 'default',
          pointerEvents: 'auto',
          zIndex: 1,
          backgroundColor: '#1f2937'
        }}
      />
      
      {/* PPFD Overlay Controls */}
      {room && showPPFDPanel && (
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg z-10" style={{ width: '320px' }}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">PPFD Analysis</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPPFDOverlay(!showPPFDOverlay)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    showPPFDOverlay 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {showPPFDOverlay ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => {
                    // Hide panel by dispatching a custom event
                    window.dispatchEvent(new CustomEvent('hidePPFDPanel'));
                  }}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
            
            {showPPFDOverlay && (
              <div className="space-y-3">
                {/* Opacity Control */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Opacity:</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={ppfdOpacity}
                    onChange={(e) => setPpfdOpacity(parseFloat(e.target.value))}
                    className="flex-1 h-3 accent-purple-600"
                  />
                  <span className="text-xs text-gray-300 w-8">{Math.round(ppfdOpacity * 100)}%</span>
                </div>
                
                {/* Color Ranges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">PPFD Ranges (µmol/m²/s)</p>
                    <button
                      onClick={() => {
                        const newRange = {
                          min: ppfdColorRanges[ppfdColorRanges.length - 1]?.max || 1000,
                          max: ppfdColorRanges[ppfdColorRanges.length - 1]?.max + 250 || 1250,
                          color: '#9333ea'
                        };
                        setPpfdColorRanges([...ppfdColorRanges, newRange]);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      + Add Range
                    </button>
                  </div>
                  
                  {ppfdColorRanges.map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={range.color}
                        onChange={(e) => {
                          const newRanges = [...ppfdColorRanges];
                          newRanges[index].color = e.target.value;
                          setPpfdColorRanges(newRanges);
                        }}
                        className="w-6 h-6 rounded cursor-pointer"
                      />
                      <input
                        type="number"
                        value={range.min}
                        onChange={(e) => {
                          const newRanges = [...ppfdColorRanges];
                          newRanges[index].min = Number(e.target.value);
                          setPpfdColorRanges(newRanges);
                        }}
                        className="w-16 px-1 py-0.5 bg-gray-700 rounded text-xs text-white"
                      />
                      <span className="text-xs text-gray-400">-</span>
                      <input
                        type="number"
                        value={range.max}
                        onChange={(e) => {
                          const newRanges = [...ppfdColorRanges];
                          newRanges[index].max = Number(e.target.value);
                          setPpfdColorRanges(newRanges);
                        }}
                        className="w-16 px-1 py-0.5 bg-gray-700 rounded text-xs text-white"
                      />
                      {ppfdColorRanges.length > 1 && (
                        <button
                          onClick={() => {
                            setPpfdColorRanges(ppfdColorRanges.filter((_, i) => i !== index));
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Calculation Zones */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Calculation Zones</p>
                    <button
                      onClick={() => {
                        setIsDrawingZone(true);
                        setSelectedZoneId(null);
                        showNotification('info', 'Click and drag to create a zone');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      + Add Zone
                    </button>
                  </div>
                  
                  {calculationZones.length === 0 ? (
                    <p className="text-xs text-gray-500">No zones defined</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {calculationZones.map(zone => (
                        <div key={zone.id} className="space-y-1 p-2 hover:bg-gray-700 rounded">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={zone.enabled}
                              onChange={(e) => {
                                setCalculationZones(zones => 
                                  zones.map(z => z.id === zone.id ? { ...z, enabled: e.target.checked } : z)
                                );
                              }}
                              className="rounded border-gray-600 bg-gray-800 text-purple-600"
                            />
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: zone.color }}
                            />
                            <input
                              type="text"
                              value={zone.name}
                              onChange={(e) => {
                                setCalculationZones(zones => 
                                  zones.map(z => z.id === zone.id ? { ...z, name: e.target.value } : z)
                                );
                              }}
                              className="flex-1 px-1 py-0.5 bg-transparent text-xs text-white hover:bg-gray-700 rounded"
                            />
                            <button
                              onClick={() => {
                                setCalculationZones(zones => zones.filter(z => z.id !== zone.id));
                              }}
                              className="text-red-400 hover:text-red-300 text-xs px-1"
                            >
                              ×
                            </button>
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <span className="text-xs text-gray-400">Height:</span>
                            <input
                              type="number"
                              value={zone.z}
                              onChange={(e) => {
                                setCalculationZones(zones => 
                                  zones.map(z => z.id === zone.id ? { ...z, z: Number(e.target.value) } : z)
                                );
                              }}
                              className="w-16 px-1 py-0.5 bg-gray-700 rounded text-xs text-white"
                              min="0"
                              max="20"
                              step="0.5"
                            />
                            <span className="text-xs text-gray-400">ft</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                {calculations && (
                  <div className="pt-2 border-t border-gray-700 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average PPFD:</span>
                      <span className="text-white font-medium">{calculations.averagePPFD?.toFixed(0) || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min/Max:</span>
                      <span className="text-white font-medium">
                        {calculations.minPPFD?.toFixed(0) || 0} / {calculations.maxPPFD?.toFixed(0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uniformity:</span>
                      <span className="text-white font-medium">
                        {((calculations.uniformity || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={
            contextMenu.target === 'object'
              ? ContextMenuBuilder.objectMenu({
                  selectedCount: ui.selectedObjects?.length || 0,
                  canCopy: true,
                  canDelete: true,
                  canRotate: true,
                  canMove: true,
                  isLocked: false,
                  isVisible: true,
                  onCopy: () => {
                    copySelectedObjects();
                    setContextMenu(null);
                  },
                  onDelete: () => {
                    const selectedObjects = objects.filter(obj => ui.selectedObjects?.includes(obj.id));
                    selectedObjects.forEach(obj => {
                      dispatch({ type: 'DELETE_OBJECT', payload: obj.id });
                    });
                    clearSelection();
                    showNotification('success', `Deleted ${selectedObjects.length} object(s)`);
                    setContextMenu(null);
                  },
                  onRotate: () => {
                    rotateSelectedObjects();
                    setContextMenu(null);
                  },
                  onMove: () => {
                    dispatch({ type: 'SET_TOOL', payload: 'move' });
                    setContextMenu(null);
                  },
                  onProperties: () => {
                    setShowPropertiesPanel(true);
                    setContextMenu(null);
                  },
                  onGroup: () => {
                    if (ui.selectedObjectIds.length > 1) {
                      const selectedObjs = objects.filter(obj => ui.selectedObjectIds.includes(obj.id));
                      const newGroup = createGroup(selectedObjs);
                      
                      // Update objects with group ID
                      selectedObjs.forEach(obj => {
                        updateObject(obj.id, { group: newGroup.id });
                      });
                      
                      setObjectGroups([...objectGroups, newGroup]);
                      showNotification('success', `Created group with ${selectedObjs.length} objects`);
                    } else {
                      showNotification('warning', 'Select multiple objects to group');
                    }
                    setContextMenu(null);
                  },
                  onBringToFront: () => {
                    if (contextMenu?.objectId) {
                      const updatedObjects = bringToFront(objects, contextMenu.objectId);
                      // Update each object with new z-index
                      updatedObjects.forEach(obj => {
                        if (obj.id === contextMenu.objectId && (obj as any).zIndex !== undefined) {
                          updateObject(obj.id, { zIndex: (obj as any).zIndex });
                        }
                      });
                      showNotification('success', 'Brought object to front');
                    }
                    setContextMenu(null);
                  },
                  onSendToBack: () => {
                    if (contextMenu?.objectId) {
                      const updatedObjects = sendToBack(objects, contextMenu.objectId);
                      // Update each object with new z-index
                      updatedObjects.forEach(obj => {
                        if (obj.id === contextMenu.objectId && (obj as any).zIndex !== undefined) {
                          updateObject(obj.id, { zIndex: (obj as any).zIndex });
                        }
                      });
                      showNotification('success', 'Sent object to back');
                    }
                    setContextMenu(null);
                  },
                  onMeasure: () => {
                    setMeasurementMode(true);
                    setCurrentMeasurement({ type: 'distance', color: '#fbbf24' });
                    setMeasurementPoints([]);
                    setContextMenu(null);
                    showNotification('info', 'Measurement mode activated');
                  },
                  onExport: () => {
                    setShowExportImport(true);
                    setContextMenu(null);
                  }
                })
              : ContextMenuBuilder.canvasMenu({
                  canPaste: clipboard.length > 0,
                  canSelectAll: objects.length > 0,
                  onPaste: () => {
                    if (contextMenu) {
                      // Paste at context menu position
                      const roomCoords = canvasToRoom(contextMenu.x, contextMenu.y);
                      pasteObjects(roomCoords);
                    } else {
                      // Paste with default offset
                      pasteObjects();
                    }
                    setContextMenu(null);
                  },
                  onSelectAll: () => {
                    if (objects.length > 0) {
                      selectObjects(objects.map(obj => obj.id));
                      showNotification('success', `Selected all ${objects.length} objects`);
                    }
                    setContextMenu(null);
                  },
                  onAddFixture: () => {
                    dispatch({ type: 'SET_TOOL', payload: 'place' });
                    setContextMenu(null);
                  },
                  onAddEquipment: () => {
                    // Show equipment panels
                    dispatch({ type: 'TOGGLE_PANEL', payload: 'rightSidebar' });
                    showNotification('info', 'Select equipment from the right panel to place');
                    setContextMenu(null);
                  },
                  onAddShape: () => {
                    dispatch({ type: 'SET_TOOL', payload: 'rectangle' });
                    setContextMenu(null);
                  },
                  onToggleGrid: () => {
                    setShowGrid(!showGrid);
                    showNotification('info', `Grid ${!showGrid ? 'enabled' : 'disabled'}`);
                    setContextMenu(null);
                  },
                  onToggleSnap: () => {
                    setSnapToGrid(!snapToGrid);
                    showNotification('info', `Grid snap ${!snapToGrid ? 'enabled' : 'disabled'}`);
                    setContextMenu(null);
                  },
                  onImport: () => {
                    setShowExportImport(true);
                    setContextMenu(null);
                  }
                })
          }
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {/* Measurement Tool */}
      <MeasurementTool
        isActive={measurementMode}
        measurements={measurements}
        onAddMeasurement={addMeasurement}
        onUpdateMeasurement={updateMeasurement}
        onDeleteMeasurement={deleteMeasurement}
        onClose={() => {
          setMeasurementMode(false);
          setCurrentMeasurement(null);
          setMeasurementPoints([]);
        }}
        unitScale={calculatePixelScale()}
        selectedType={currentMeasurement?.type}
        selectedColor={currentMeasurement?.color}
        onTypeChange={(type) => setCurrentMeasurement(prev => ({ ...prev!, type }))}
        onColorChange={(color) => setCurrentMeasurement(prev => ({ ...prev!, color }))}
      />
      
      {/* Export/Import Tool */}
      <ExportImportTool
        isOpen={showExportImport}
        onClose={() => setShowExportImport(false)}
        measurements={measurements}
        calculationZones={calculationZones}
      />
      
      {/* Properties Panel */}
      <PropertiesPanel
        isOpen={showPropertiesPanel}
        onClose={() => setShowPropertiesPanel(false)}
      />
    </div>
  );
}
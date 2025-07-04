import { useCallback, useEffect, RefObject, useState, useRef } from 'react';
import { useDesigner } from '../context/DesignerContext';
import type { RoomObject, Fixture } from '../context/types';
import { renderPPFDGrid, drawFalseColorLegend, PPFD_COLOR_SCALES } from '../utils/falseColorRenderer';
import { getFixtureStyle, drawLightCone } from '../utils/fixtureRenderer';

interface CFDData {
  velocityField: number[][];
  temperatureField: number[][];
  pressureField: number[][];
  turbulenceField: number[][];
}

interface OverlayState {
  showPPFD: boolean;
  showCFDVelocity: boolean;
  showCFDTemperature: boolean;
  showHeatMap: boolean;
  showVectors: boolean;
  opacity: number;
}

export function useCanvas2D(
  canvasRef: RefObject<HTMLCanvasElement>,
  containerRef: RefObject<HTMLDivElement>
) {
  const { state } = useDesigner();
  const { room, objects, ui, calculations } = state;
  
  // State for overlays and CFD data
  const [overlayState, setOverlayState] = useState<OverlayState>({
    showPPFD: false,
    showCFDVelocity: false,
    showCFDTemperature: false,
    showHeatMap: false,
    showVectors: false,
    opacity: 0.7
  });
  
  const [cfdData, setCFDData] = useState<CFDData | null>(null);
  
  // Ref for resize timeout to prevent excessive calls
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stable refs for functions to prevent ResizeObserver loops
  const resizeCanvasRef = useRef<() => void>();
  const redrawRef = useRef<() => void>();
  
  // Stable refs for state to prevent redraw function recreation
  const roomRef = useRef(room);
  const objectsRef = useRef(objects);
  const uiRef = useRef(ui);
  const calculationsRef = useRef(calculations);
  const overlayStateRef = useRef(overlayState);
  
  // Update refs when state changes
  roomRef.current = room;
  objectsRef.current = objects;
  uiRef.current = ui;
  calculationsRef.current = calculations;
  overlayStateRef.current = overlayState;
  
  // Generate CFD data based on current room and fixtures
  const generateCFDData = useCallback(() => {
    if (!room?.width || !room?.length) {
      return {
        velocityField: [],
        temperatureField: [],
        pressureField: [],
        turbulenceField: []
      };
    }
    
    const fixtures = objects.filter(obj => obj.type === 'fixture') as Fixture[];
    const gridSize = 40;
    
    const velocityField = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3)
    );
    
    const temperatureField = Array(gridSize).fill(null).map((_, i) => 
      Array(gridSize).fill(null).map((_, j) => {
        // Base temperature
        let temp = 20;
        
        // Add heat from fixtures
        fixtures.forEach(fixture => {
          const x = (i / gridSize) * room.width;
          const y = (j / gridSize) * room.length;
          const distance = Math.sqrt((x - fixture.x) ** 2 + (y - fixture.y) ** 2);
          const heatContribution = (fixture.model?.wattage || 600) / (1 + distance * 0.5);
          temp += heatContribution / 100;
        });
        
        return Math.min(40, Math.max(18, temp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2));
      })
    );

    const pressureField = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => 101325 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100)
    );

    const turbulenceField = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1)
    );

    return {
      velocityField,
      temperatureField,
      pressureField,
      turbulenceField
    };
  }, [objects, room]);

  // Listen for overlay toggle events
  useEffect(() => {
    const handleOverlayToggle = (e: CustomEvent) => {
      const { type, enabled } = e.detail;
      setOverlayState(prev => ({
        ...prev,
        [type]: enabled
      }));
      
      // Generate CFD data when CFD overlays are enabled
      if ((type === 'showCFDVelocity' || type === 'showCFDTemperature') && enabled) {
        setCFDData(generateCFDData());
      }
    };

    window.addEventListener('toggleOverlay', handleOverlayToggle as EventListener);
    return () => window.removeEventListener('toggleOverlay', handleOverlayToggle as EventListener);
  }, [generateCFDData]);

  // Render CFD velocity field
  const renderCFDVelocity = useCallback((
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    roomWidth: number,
    roomHeight: number
  ) => {
    if (!cfdData) return;

    const { velocityField } = cfdData;
    const gridSize = velocityField.length;
    const cellWidth = roomWidth / gridSize;
    const cellHeight = roomHeight / gridSize;
    const maxVelocity = Math.max(...velocityField.flat());

    velocityField.forEach((row, i) => {
      row.forEach((velocity, j) => {
        const normalized = velocity / maxVelocity;
        
        // Blue to red color scale for velocity
        const r = Math.floor(normalized * 255);
        const b = Math.floor((1 - normalized) * 255);
        const color = `rgba(${r}, 0, ${b}, ${overlayState.opacity})`;

        ctx.fillStyle = color;
        ctx.fillRect(
          offsetX + i * cellWidth,
          offsetY + j * cellHeight,
          cellWidth,
          cellHeight
        );
      });
    });

    // Draw velocity vectors if enabled
    if (overlayState.showVectors) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < gridSize; i += 3) {
        for (let j = 0; j < gridSize; j += 3) {
          const velocity = velocityField[i][j];
          const angle = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * Math.PI * 2;
          const length = (velocity / maxVelocity) * 15;
          
          const x = offsetX + i * cellWidth + cellWidth / 2;
          const y = offsetY + j * cellHeight + cellHeight / 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          ctx.stroke();
        }
      }
    }
  }, [cfdData, overlayState]);

  // Render CFD temperature field
  const renderCFDTemperature = useCallback((
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    roomWidth: number,
    roomHeight: number
  ) => {
    if (!cfdData) return;

    const { temperatureField } = cfdData;
    const gridSize = temperatureField.length;
    const cellWidth = roomWidth / gridSize;
    const cellHeight = roomHeight / gridSize;
    const minTemp = Math.min(...temperatureField.flat());
    const maxTemp = Math.max(...temperatureField.flat());

    temperatureField.forEach((row, i) => {
      row.forEach((temp, j) => {
        const normalized = (temp - minTemp) / (maxTemp - minTemp);
        
        // Blue to yellow to red color scale for temperature
        let color;
        if (normalized < 0.5) {
          const g = Math.floor(normalized * 2 * 255);
          color = `rgba(0, ${g}, 255, ${overlayState.opacity})`;
        } else {
          const r = Math.floor((normalized - 0.5) * 2 * 255);
          color = `rgba(${r}, 255, ${255 - r}, ${overlayState.opacity})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(
          offsetX + i * cellWidth,
          offsetY + j * cellHeight,
          cellWidth,
          cellHeight
        );
      });
    });
  }, [cfdData, overlayState]);

  // Render heat map from fixtures
  const renderHeatMap = useCallback((
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    roomWidth: number,
    roomHeight: number,
    scale: number
  ) => {
    const fixtures = objects.filter(obj => obj.type === 'fixture') as Fixture[];
    
    fixtures.forEach(fixture => {
      const x = offsetX + fixture.x * scale;
      const y = offsetY + fixture.y * scale;
      const wattage = fixture.model?.wattage || 600;
      const radius = Math.max(30, Math.min(100, wattage / 10));
      
      // Create radial gradient for heat visualization
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 100, 0, ${overlayState.opacity})`);
      gradient.addColorStop(0.5, `rgba(255, 200, 0, ${overlayState.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }, [objects, overlayState]);

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, [canvasRef, containerRef]);
  
  // Update refs when functions change
  resizeCanvasRef.current = resizeCanvas;

  // Main drawing function - use refs to keep it stable
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('useCanvas2D: No canvas ref');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('useCanvas2D: No canvas context');
      return;
    }
    
    // Skip if canvas has no size
    if (canvas.width === 0 || canvas.height === 0) {
      console.warn('useCanvas2D: Canvas has no size', canvas.width, canvas.height);
      return;
    }
    
    // Use current values from refs to avoid dependency issues
    const currentRoom = roomRef.current;
    const currentObjects = objectsRef.current;
    const currentUI = uiRef.current;
    const currentCalculations = calculationsRef.current;
    const currentOverlayState = overlayStateRef.current;
    
    // Canvas redraw debug info would be logged here

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill with background color to make it visible
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Fill entire canvas with dark background first
    ctx.fillStyle = '#2a2a2a';  // Slightly lighter to be more visible
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    // Calculate scale
    const padding = 40;
    const scaleX = (canvas.width - 2 * padding) / currentRoom.width;
    const scaleY = (canvas.height - 2 * padding) / currentRoom.length;
    const scale = Math.min(scaleX, scaleY);

    // Center the room
    const roomWidth = currentRoom.width * scale;
    const roomHeight = currentRoom.length * scale;
    const offsetX = (canvas.width - roomWidth) / 2;
    const offsetY = (canvas.height - roomHeight) / 2;

    // Draw room background with gradient for depth
    const gradient = ctx.createLinearGradient(offsetX, offsetY, offsetX + roomWidth, offsetY + roomHeight);
    gradient.addColorStop(0, '#4a4a4a');
    gradient.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(offsetX, offsetY, roomWidth, roomHeight);

    // Draw room border with shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = '#00ff00'; // Bright green for visibility
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, roomWidth, roomHeight);
    ctx.shadowColor = 'transparent';
    
    // Add corner markers for better visibility
    ctx.fillStyle = '#00ff00';
    const markerSize = 10;
    // Top-left
    ctx.fillRect(offsetX - markerSize/2, offsetY - markerSize/2, markerSize, markerSize);
    // Top-right
    ctx.fillRect(offsetX + roomWidth - markerSize/2, offsetY - markerSize/2, markerSize, markerSize);
    // Bottom-left
    ctx.fillRect(offsetX - markerSize/2, offsetY + roomHeight - markerSize/2, markerSize, markerSize);
    // Bottom-right
    ctx.fillRect(offsetX + roomWidth - markerSize/2, offsetY + roomHeight - markerSize/2, markerSize, markerSize);
    
    // Add room dimensions text with background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(offsetX, offsetY - 25, 120, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${currentRoom.width} ft × ${currentRoom.length} ft`, offsetX + 5, offsetY - 8);

    // Draw grid if enabled
    if (currentUI.grid.enabled) {
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      
      // Vertical lines
      for (let x = 0; x <= currentRoom.width; x += currentUI.grid.size) {
        const pixelX = offsetX + x * scale;
        ctx.beginPath();
        ctx.moveTo(pixelX, offsetY);
        ctx.lineTo(pixelX, offsetY + roomHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= currentRoom.length; y += currentUI.grid.size) {
        const pixelY = offsetY + y * scale;
        ctx.beginPath();
        ctx.moveTo(offsetX, pixelY);
        ctx.lineTo(offsetX + roomWidth, pixelY);
        ctx.stroke();
      }
      
      // Reset line dash
      ctx.setLineDash([]);
    }

    // Draw overlays (order matters for layering)
    
    // 1. Heat map overlay (behind other overlays)
    if (currentOverlayState.showHeatMap) {
      renderHeatMap(ctx, offsetX, offsetY, roomWidth, roomHeight, scale);
    }
    
    // 2. CFD Temperature overlay
    if (currentOverlayState.showCFDTemperature) {
      renderCFDTemperature(ctx, offsetX, offsetY, roomWidth, roomHeight);
    }
    
    // 3. CFD Velocity overlay
    if (currentOverlayState.showCFDVelocity) {
      renderCFDVelocity(ctx, offsetX, offsetY, roomWidth, roomHeight);
    }

    // 4. PPFD heatmap if available (existing functionality)
    if ((currentUI.panels.falseColor || currentOverlayState.showPPFD) && currentCalculations.ppfdGrid.length > 0) {
      renderPPFDGrid(
        ctx,
        currentCalculations.ppfdGrid,
        offsetX,
        offsetY,
        roomWidth,
        roomHeight,
        PPFD_COLOR_SCALES.plasma,
        currentOverlayState.opacity
      );
      
      // Draw legend
      drawFalseColorLegend(
        ctx,
        canvas.width - 100,
        offsetY + 20,
        20,
        200,
        PPFD_COLOR_SCALES.plasma,
        currentCalculations.minPPFD,
        currentCalculations.maxPPFD
      );
    }

    // Draw objects
    currentObjects.forEach((obj, index) => {
      drawObject(ctx, obj, offsetX, offsetY, scale, currentUI.selectedObjectId === obj.id);
    });

    // Draw room labels
    ctx.fillStyle = '#888';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // Width label
    ctx.fillText(`${currentRoom.width} ft`, offsetX + roomWidth / 2, offsetY - 10);
    
    // Length label
    ctx.save();
    ctx.translate(offsetX - 10, offsetY + roomHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${currentRoom.length} ft`, 0, 0);
    ctx.restore();
  }, []); // Empty dependencies to keep function stable since we use refs
  
  // Update redraw ref when the function changes
  redrawRef.current = redraw;
  
  // Trigger redraw when state changes
  useEffect(() => {
    if (redrawRef.current) {
      redrawRef.current();
    }
  }, [room, objects, ui, calculations, overlayState]);

  // Helper function to draw objects
const drawObject = (
    ctx: CanvasRenderingContext2D,
    obj: RoomObject,
    offsetX: number,
    offsetY: number,
    scale: number,
    isSelected: boolean
  ) => {
    const x = offsetX + obj.x * scale;
    const y = offsetY + obj.y * scale;
    const width = obj.width * scale;
    const height = obj.length * scale;

    ctx.save();
    
    // Translate to object center and rotate
    ctx.translate(x, y);
    ctx.rotate((obj.rotation * Math.PI) / 180);

    // Draw object based on type
    switch (obj.type) {
      case 'fixture':
        drawFixture(ctx, obj as Fixture, width, height, isSelected);
        break;
      case 'plant':
        drawPlant(ctx, width, height, isSelected, obj);
        break;
      case 'bench':
        drawBench(ctx, width, height, isSelected);
        break;
      case 'rack':
        drawRack(ctx, width, height, isSelected, obj);
        break;
      case 'underCanopy':
        drawUnderCanopy(ctx, width, height, isSelected, obj);
        break;
      case 'emergencyFixture':
        drawEmergencyFixture(ctx, width, height, isSelected);
        break;
      case 'exitDoor':
        drawExitDoor(ctx, width, height, isSelected);
        break;
      case 'egressPath':
        drawEgressPath(ctx, width, height, isSelected);
        break;
      case 'hvacFan':
        drawHVACFan(ctx, width, height, isSelected, obj);
        break;
      case 'equipment':
        drawEquipment(ctx, width, height, isSelected, obj);
        break;
      case 'obstacle':
        drawObstacle(ctx, width, height, isSelected, obj);
        break;
      case 'rectangle':
        drawRectangle(ctx, width, height, isSelected, obj);
        break;
      case 'circle':
        drawCircle(ctx, width, height, isSelected, obj);
        break;
      case 'line':
        drawLine(ctx, width, height, isSelected, obj);
        break;
      case 'unistrut':
        drawUnistrut(ctx, width, height, isSelected, obj);
        break;
      case 'calculation_surface':
        drawCalculationSurface(ctx, width, height, isSelected, obj);
        break;
      default:
        drawGenericObject(ctx, width, height, isSelected);
    }

    ctx.restore();
  };

  // Helper function to draw fixtures
const drawFixture = (
    ctx: CanvasRenderingContext2D,
    fixture: Fixture,
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    // Draw realistic light cone first (behind fixture)
    if (fixture.enabled) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      drawLightCone(ctx, fixture, width, height, 1);
      ctx.restore();
    }
    
    // Get the appropriate fixture style
    const fixtureStyle = getFixtureStyle(fixture);
    
    // Draw the fixture using professional rendering
    fixtureStyle.draw(ctx, fixture, width, height, isSelected);
    
    // Add fixture info overlay for larger fixtures
    if (width > 40 && height > 30 && fixture.model) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      // PPFD value
      if (fixture.model.ppfd) {
        ctx.fillText(`${fixture.model.ppfd} PPFD`, 0, height / 2 + 15);
      }
      
      // Wattage
      if (fixture.model.wattage) {
        ctx.fillText(`${fixture.model.wattage}W`, 0, height / 2 + 25);
      }
      
      ctx.restore();
    }
  };

  // Helper function to draw plants
const drawPlant = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean,
    obj?: RoomObject
  ) => {
    const plant = obj as any;
    const variety = plant?.variety || 'lettuce';
    const growthStage = plant?.growthStage || 'vegetative';
    
    // Check if this is a rack plant (rectangular) or standalone
    const isRackPlant = obj?.group && obj.group.includes('rack-');
    
    // Plant-specific colors
    const plantColors: Record<string, { base: string; light: string; dark: string }> = {
      'lettuce': { base: '#22c55e', light: '#86efac', dark: '#15803d' },
      'hemp': { base: '#16a34a', light: '#4ade80', dark: '#166534' },
      'high-wire': { base: '#dc2626', light: '#f87171', dark: '#991b1b' }, // Red for tomatoes
      'tomato': { base: '#dc2626', light: '#f87171', dark: '#991b1b' },
      'cannabis': { base: '#059669', light: '#34d399', dark: '#064e3b' },
      'herbs': { base: '#84cc16', light: '#bef264', dark: '#4d7c0f' },
      'microgreens': { base: '#10b981', light: '#6ee7b7', dark: '#047857' }
    };
    
    const colors = plantColors[variety] || plantColors['lettuce'];
    
    if (isRackPlant) {
      // Rectangular growing area for rack systems
      
      // Base growing medium
      ctx.fillStyle = '#523620';
      ctx.fillRect(-width / 2, -height / 2, width, height);
      
      // Plant canopy fill
      ctx.fillStyle = colors.dark;
      ctx.fillRect(-width / 2 + 2, -height / 2 + 2, width - 4, height - 4);
      
      // Lighter green overlay pattern (grid of plants)
      ctx.fillStyle = colors.base;
      const plantSize = Math.min(width, height) * 0.2;
      const cols = Math.floor(width / plantSize);
      const rows = Math.floor(height / plantSize);
      const spacingX = width / cols;
      const spacingY = height / rows;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = -width / 2 + spacingX / 2 + col * spacingX;
          const y = -height / 2 + spacingY / 2 + row * spacingY;
          ctx.beginPath();
          ctx.arc(x, y, plantSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Growth stage label if available
      if (obj && (obj as any).growthStage) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        const stage = (obj as any).growthStage;
        const stageText = stage === 'seedling' ? 'S' : stage === 'vegetative' ? 'V' : 'F';
        ctx.fillText(stageText, 0, 0);
        ctx.restore();
      }
      
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
      }
    } else {
      // Variety-specific drawing for standalone plants
      const radius = Math.min(width, height) / 2;
      
      if (variety === 'high-wire' || variety === 'tomato') {
        // Draw vertical structure for high-wire plants
        ctx.strokeStyle = '#8b6f47';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, height / 2);
        ctx.stroke();
        
        // Draw tomato clusters
        ctx.fillStyle = colors.base;
        const clusterCount = 4;
        for (let i = 0; i < clusterCount; i++) {
          const y = -height / 2 + (i + 1) * (height / (clusterCount + 1));
          ctx.beginPath();
          ctx.arc(-radius * 0.3, y, radius * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(radius * 0.3, y, radius * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (variety === 'hemp' || variety === 'cannabis') {
        // Draw cannabis-style leaves
        ctx.fillStyle = colors.dark;
        const leafCount = 7;
        for (let i = 0; i < leafCount; i++) {
          const angle = (i / leafCount) * Math.PI * 2 - Math.PI / 2;
          const leafLength = radius * 0.8;
          ctx.save();
          ctx.translate(0, 0);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -leafLength / 2, radius * 0.15, leafLength / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        // Default circular plant for lettuce, herbs, microgreens
        // Base foliage
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Lighter overlay
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Individual leaves
        ctx.fillStyle = colors.light;
      const leafCount = Math.floor(radius / 3);
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const leafRadius = radius * 0.6;
        const x = Math.cos(angle) * leafRadius;
        const y = Math.sin(angle) * leafRadius;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      }
      
      // Center stem (for non high-wire plants)
      if (variety !== 'high-wire' && variety !== 'tomato') {
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Add plant variety and DLI label
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    
    // Variety name
    const varietyLabels: Record<string, string> = {
      'lettuce': 'Lettuce',
      'hemp': 'Hemp',
      'high-wire': 'High Wire',
      'tomato': 'Tomato',
      'cannabis': 'Cannabis',
      'herbs': 'Herbs',
      'microgreens': 'Microgreens'
    };
    
    const label = varietyLabels[variety] || variety;
    ctx.strokeText(label, 0, height / 2 + 12);
    ctx.fillText(label, 0, height / 2 + 12);
    
    // DLI target
    if (plant?.targetDLI) {
      ctx.font = '8px Arial';
      ctx.strokeText(`${plant.targetDLI} DLI`, 0, height / 2 + 24);
      ctx.fillText(`${plant.targetDLI} DLI`, 0, height / 2 + 24);
    }
    
    // Growth stage indicator
    if (growthStage) {
      const stageColors: Record<string, string> = {
        'seedling': '#10b981',
        'vegetative': '#3b82f6',
        'flowering': '#f59e0b',
        'harvest': '#ef4444'
      };
      
      ctx.fillStyle = stageColors[growthStage] || '#6b7280';
      ctx.fillRect(-width / 2 - 5, -height / 2 - 5, 10, 10);
    }
    
    ctx.restore();
  };

  // Helper function to draw benches
const drawBench = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    // Main bench surface
    ctx.fillStyle = '#71717a';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Bench legs/support structure
    ctx.fillStyle = '#52525b';
    const legWidth = width * 0.1;
    const legHeight = height * 0.2;
    
    // Four legs
    ctx.fillRect(-width / 2, -height / 2, legWidth, legHeight);
    ctx.fillRect(width / 2 - legWidth, -height / 2, legWidth, legHeight);
    ctx.fillRect(-width / 2, height / 2 - legHeight, legWidth, legHeight);
    ctx.fillRect(width / 2 - legWidth, height / 2 - legHeight, legWidth, legHeight);
    
    // Center support beam
    ctx.fillRect(-width / 2, -legHeight / 4, width, legHeight / 2);
    
    // Wire mesh pattern (for drainage)
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    const meshSize = Math.min(width, height) * 0.1;
    
    // Vertical lines
    for (let x = -width / 2; x <= width / 2; x += meshSize) {
      ctx.beginPath();
      ctx.moveTo(x, -height / 2);
      ctx.lineTo(x, height / 2);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -height / 2; y <= height / 2; y += meshSize) {
      ctx.beginPath();
      ctx.moveTo(-width / 2, y);
      ctx.lineTo(width / 2, y);
      ctx.stroke();
    }
    
    // Edge trim
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
  };

  // Helper function to draw vertical racks
const drawRack = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean,
    obj?: RoomObject
  ) => {
    // Enhanced rack visualization
    
    // Shadow/base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(-width / 2 + 2, -height / 2 + 2, width, height);
    
    // Main frame background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Frame structure with metallic gradient effect
    const gradient = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
    gradient.addColorStop(0, '#374151');
    gradient.addColorStop(0.5, '#6b7280');
    gradient.addColorStop(1, '#374151');
    
    // Vertical posts with gradient
    const postWidth = width * 0.08;
    ctx.fillStyle = gradient;
    ctx.fillRect(-width / 2, -height / 2, postWidth, height);
    ctx.fillRect(width / 2 - postWidth, -height / 2, postWidth, height);
    
    // Cross bracing
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + postWidth, -height / 2);
    ctx.lineTo(width / 2 - postWidth, height / 2);
    ctx.moveTo(width / 2 - postWidth, -height / 2);
    ctx.lineTo(-width / 2 + postWidth, height / 2);
    ctx.stroke();
    
    // Dynamic tier rendering based on object data
    let tierCount = 4; // Default
    if (obj && obj.customName) {
      // Extract tier info from custom name if available
      const match = obj.customName.match(/(\d+)\s*tier/i);
      if (match) tierCount = parseInt(match[1]);
    }
    
    const shelfHeight = height * 0.015;
    const tierSpacing = height / (tierCount + 1);
    
    // Draw tiers
    for (let i = 1; i <= tierCount; i++) {
      const y = -height / 2 + i * tierSpacing;
      
      // Shelf platform
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(-width / 2 + postWidth, y - shelfHeight / 2, width - 2 * postWidth, shelfHeight);
      
      // Shelf edge highlight
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-width / 2 + postWidth, y - shelfHeight / 2);
      ctx.lineTo(width / 2 - postWidth, y - shelfHeight / 2);
      ctx.stroke();
      
      // Growing area indicator
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.fillRect(-width / 2 + postWidth, y - shelfHeight / 2 - 15, width - 2 * postWidth, 12);
      
      // LED light bars
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-width / 2 + postWidth + 2, y - shelfHeight / 2 - 18, width - 2 * postWidth - 4, 2);
      
      // Tier label
      ctx.save();
      ctx.fillStyle = '#d1d5db';
      ctx.font = '8px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`T${i}`, -width / 2 + 2, y);
      ctx.restore();
    }
    
    // Rack identification
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(obj?.customName || 'RACK', 0, -height / 2 - 5);
    
    // Show capacity info if available
    if (obj?.group) {
      ctx.font = '8px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`${tierCount} tiers`, 0, height / 2 + 10);
    }
    ctx.restore();
    
    // Selection indicator
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2 - 1, -height / 2 - 1, width + 2, height + 2);
      
      // Corner indicators
      ctx.fillStyle = '#8b5cf6';
      const cornerSize = 5;
      ctx.fillRect(-width / 2 - 1, -height / 2 - 1, cornerSize, cornerSize);
      ctx.fillRect(width / 2 - cornerSize + 1, -height / 2 - 1, cornerSize, cornerSize);
      ctx.fillRect(-width / 2 - 1, height / 2 - cornerSize + 1, cornerSize, cornerSize);
      ctx.fillRect(width / 2 - cornerSize + 1, height / 2 - cornerSize + 1, cornerSize, cornerSize);
    }
  };

  // Helper function to draw under canopy lights
const drawUnderCanopy = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean,
    obj?: RoomObject
  ) => {
    const isRackLight = obj?.group && obj.group.includes('rack-');
    
    if (isRackLight) {
      // Under-canopy light for rack systems
      
      // Housing with gradient
      const gradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(0.5, '#f59e0b');
      gradient.addColorStop(1, '#fbbf24');
      ctx.fillStyle = gradient;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      
      // Reflector pattern
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(-width / 2 + 2, -height / 2 + 1, width - 4, height * 0.3);
      
      // LED array pattern
      ctx.fillStyle = '#fbbf24';
      const ledSize = Math.min(width, height) * 0.1;
      const cols = Math.floor(width / ledSize);
      const rows = 2;
      const spacingX = width / cols;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = -width / 2 + spacingX / 2 + col * spacingX;
          const y = -height / 4 + row * (height / 2);
          ctx.beginPath();
          ctx.arc(x, y, ledSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Direction indicator (shines upward)
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, -height / 2 - 5);
      ctx.lineTo(0, -height / 2 - 15);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Tier label if available
      if (obj?.customName) {
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.font = '6px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('UC', 0, 0);
        ctx.restore();
      }
    } else {
      // Standard under canopy light
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-width / 2, -height / 2, width, height);
      
      // LED strips
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      const stripCount = 5;
      for (let i = 0; i < stripCount; i++) {
        const x = -width / 2 + (i + 0.5) * (width / stripCount);
        ctx.beginPath();
        ctx.moveTo(x, -height / 2);
        ctx.lineTo(x, height / 2);
        ctx.stroke();
      }
      
      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('UC', 0, 0);
    }
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
  };

  // Helper function to draw emergency fixtures
const drawEmergencyFixture = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    // Emergency light housing
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Exit sign
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', 0, 0);
    
    // Battery indicator
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-width / 2 + 2, -height / 2 + 2, 5, 3);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
  };

  // Helper function to draw exit doors
const drawExitDoor = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    // Door frame
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Door panel
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(-width / 2 + 2, -height / 2 + 2, width - 4, height - 4);
    
    // Push bar
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(-width / 3, -2, width * 2/3, 4);
    
    // Exit sign above
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-width / 3, -height / 2 - 10, width * 2/3, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', 0, -height / 2 - 5);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
  };

  // Helper function to draw egress paths
const drawEgressPath = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    // Path outline
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.setLineDash([]);
    
    // Arrow
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, -height / 4);
    ctx.lineTo(-width / 6, height / 4);
    ctx.lineTo(0, height / 8);
    ctx.lineTo(width / 6, height / 4);
    ctx.closePath();
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText('EGRESS', 0, 0);
    ctx.fillText('EGRESS', 0, 0);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
  };

  // Helper function to draw obstacles (rectangles)
const drawObstacle = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean,
    obj?: RoomObject
  ) => {
    // Fill color - gray for obstacles
    ctx.fillStyle = 'rgba(107, 114, 128, 0.5)'; // Semi-transparent gray
    ctx.strokeStyle = '#6b7280'; // Gray border
    ctx.lineWidth = 2;
    
    // Draw rectangle
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    // Add label if custom name exists
    if (obj?.customName) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(obj.customName, 0, -5);
    }
    
    // Show dimensions when selected
    if (isSelected && obj) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${obj.width.toFixed(1)} × ${obj.length.toFixed(1)} ft`, 0, 10);
    }
    
    // Selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2 - 3, -height / 2 - 3, width + 6, height + 6);
    }
  };

  // Helper function to draw shapes (rectangle, circle)
const drawShape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean,
    obj?: RoomObject
  ) => {
    const shapeType = (obj as any)?.shapeType || 'rectangle';
    
    // Fill color
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // Semi-transparent blue
    ctx.strokeStyle = '#3b82f6'; // Blue border
    ctx.lineWidth = 2;
    
    if (shapeType === 'circle') {
      // Draw circle
      const radius = Math.min(width, height) / 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Draw rectangle
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
    
    // Selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      if (shapeType === 'circle') {
        const radius = Math.min(width, height) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(-width / 2 - 3, -height / 2 - 3, width + 6, height + 6);
      }
    }
  };
  
  // Helper function to draw generic objects
const drawGenericObject = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    ctx.fillStyle = '#475569';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
  };

  // Helper function to draw HVAC equipment
const drawEquipment = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSelected: boolean,
    obj: RoomObject
  ) => {
    const equipment = obj as any;
    
    // Equipment render debug info would be logged here
    
    // Get equipment color based on category
    const getEquipmentColor = (category: string) => {
      switch (category) {
        case 'MiniSplit': return '#4a90e2'; // Blue
        case 'RTU': return '#7ed321'; // Green
        case 'Chiller': return '#50e3c2'; // Cyan
        case 'Heater': return '#f5a623'; // Orange
        case 'HeatPump': return '#9013fe'; // Purple
        case 'AHU': return '#6c7b7f'; // Gray
        default: return '#ff0000'; // Red for debugging
      }
    };

    const color = getEquipmentColor(equipment.category);

    // Main equipment housing - make it more visible for debugging
    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Add a bright border for debugging
    ctx.strokeStyle = '#ffff00'; // Yellow border for visibility
    ctx.lineWidth = 3;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    
    // Equipment border/frame
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    // Add equipment type label
    if (width > 20 && height > 15) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = `${Math.min(width, height) * 0.15}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(equipment.category || 'HVAC', 0, -height / 4);
      
      // Add capacity info if available
      if (equipment.coolingCapacity || equipment.heatingCapacity) {
        ctx.font = `${Math.min(width, height) * 0.1}px Arial`;
        const capacity = equipment.coolingCapacity || equipment.heatingCapacity;
        const capacityText = `${Math.round(capacity / 12000)}T`;
        ctx.fillText(capacityText, 0, height / 4);
      }
    }
    
    // Add visual indicators based on equipment type
    if (equipment.category === 'MiniSplit') {
      // Indoor unit indicator (small rectangle)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-width / 4, -height / 2 + 2, width / 2, 3);
      
      // Airflow direction indicator
      ctx.strokeStyle = '#87ceeb';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      for (let i = 0; i < 3; i++) {
        const y = -height / 4 + i * (height / 8);
        ctx.beginPath();
        ctx.moveTo(-width / 3, y);
        ctx.lineTo(width / 3, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else if (equipment.category === 'RTU') {
      // Roof unit with fans
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(-width / 4, 0, width / 8, 0, Math.PI * 2);
      ctx.arc(width / 4, 0, width / 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (equipment.category === 'AHU') {
      // Air handling unit with ductwork connections
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-width / 2, 0);
      ctx.lineTo(-width / 2 - 10, 0);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2 + 10, 0);
      ctx.stroke();
    }
    
    // Cooling/heating capacity indicators
    if (equipment.coolingCapacity) {
      ctx.fillStyle = '#0066ff';
      ctx.beginPath();
      ctx.arc(-width / 2 + 5, -height / 2 + 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (equipment.heatingCapacity) {
      ctx.fillStyle = '#ff3300';
      ctx.beginPath();
      ctx.arc(width / 2 - 5, -height / 2 + 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
    }
  };


  // Set up resize observer with stable references
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use refs to avoid dependency issues
    const resizeObserver = new ResizeObserver(() => {
      // Debounce the resize to prevent excessive calls
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        if (resizeCanvasRef.current) resizeCanvasRef.current();
        if (redrawRef.current) redrawRef.current();
      }, 16); // ~60fps
    });

    resizeObserver.observe(container);
    
    // Initial setup
    if (resizeCanvasRef.current) resizeCanvasRef.current();
    if (redrawRef.current) redrawRef.current();

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []); // Empty deps to prevent infinite loops

  // Expose overlay controls
  const toggleOverlay = useCallback((type: keyof OverlayState, enabled?: boolean) => {
    setOverlayState(prev => ({
      ...prev,
      [type]: enabled !== undefined ? enabled : !prev[type]
    }));
    
    // Generate CFD data when needed
    if ((type === 'showCFDVelocity' || type === 'showCFDTemperature') && 
        (enabled !== false)) {
      setCFDData(generateCFDData());
    }
  }, [generateCFDData]);

  const setOpacity = useCallback((opacity: number) => {
    setOverlayState(prev => ({ ...prev, opacity }));
  }, []);

  // Missing helper functions that are called in drawObject
  const drawHVACFan = (ctx: CanvasRenderingContext2D, width: number, height: number, isSelected: boolean, obj?: RoomObject) => {
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, width: number, height: number, isSelected: boolean, obj: RoomObject) => {
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
    }
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, width: number, height: number, isSelected: boolean, obj: RoomObject) => {
    const radius = Math.min(width, height) / 2;
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawLine = (ctx: CanvasRenderingContext2D, width: number, height: number, isSelected: boolean, obj: RoomObject) => {
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    ctx.stroke();
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-width / 2, -2);
      ctx.lineTo(width / 2, 2);
      ctx.stroke();
    }
  };

  const drawUnistrut = (ctx: CanvasRenderingContext2D, width: number, height: number, isSelected: boolean, obj: RoomObject) => {
    ctx.fillStyle = '#71717a';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
    }
  };

  const drawCalculationSurface = (ctx: CanvasRenderingContext2D, width: number, height: number, isSelected: boolean, obj: RoomObject) => {
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
    }
  };

  // Return the hook's public interface
  return { 
    redraw, 
    overlayState, 
    toggleOverlay, 
    setOpacity,
    cfdData
  };
}


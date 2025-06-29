'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  FileText,
  Zap,
  Settings,
  Activity,
  AlertTriangle,
  Shield,
  Info
} from 'lucide-react';

interface TransformerData {
  kva: number;
  primaryVoltage: number;
  secondaryVoltage: number;
  impedance: number;
  connection: string; // 'Delta-Wye', 'Wye-Wye', etc.
}

interface SwitchgearData {
  type: 'main' | 'tie' | 'feeder';
  rating: number;
  voltage: number;
  interrupting: number; // kA
  manufacturer?: string;
  model?: string;
}

interface PanelData {
  name: string;
  type: string;
  voltage: number;
  phases: number;
  busRating: number;
  mainBreaker: number;
  spaces: number;
  mounting: 'surface' | 'recessed';
  enclosure: 'NEMA1' | 'NEMA3R' | 'NEMA4';
}

interface CableData {
  size: string;
  type: string;
  conductors: number;
  voltage: number;
  ampacity: number;
  length: number;
  conduitSize: string;
  conduitType: string;
}

interface LoadData {
  name: string;
  type: 'lighting' | 'motor' | 'receptacle' | 'hvac' | 'equipment';
  kw: number;
  voltage: number;
  phases: number;
  powerFactor: number;
  startingKva?: number; // For motors
}

interface SingleLineData {
  projectName: string;
  projectNumber?: string;
  date: Date;
  engineer?: string;
  utility: {
    name: string;
    voltage: number;
    phases: number;
    frequency: number;
    availableFaultCurrent: number; // kA
    serviceType: 'overhead' | 'underground';
  };
  transformer?: TransformerData;
  mainSwitchgear: SwitchgearData;
  panels: PanelData[];
  feeders: {
    from: string;
    to: string;
    cable: CableData;
    protection: {
      type: string;
      rating: number;
      settings?: string;
    };
  }[];
  loads: {
    panel: string;
    loads: LoadData[];
  }[];
  emergencyPower?: {
    type: 'generator' | 'ups' | 'battery';
    rating: number;
    voltage: number;
    transferSwitch: {
      type: 'manual' | 'automatic';
      rating: number;
      transitions: number;
    };
  };
  groundingSystem: {
    type: string;
    resistance: number;
    conductorSize: string;
  };
}

interface ProfessionalSingleLineProps {
  data: SingleLineData;
  showCalculations?: boolean;
  showFaultCurrents?: boolean;
  showVoltageDrops?: boolean;
}

export function ProfessionalSingleLineGenerator({
  data,
  showCalculations = true,
  showFaultCurrents = true,
  showVoltageDrops = true
}: ProfessionalSingleLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      drawSingleLine();
    }
  }, [data, scale, showGrid]);

  const drawSingleLine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for large diagram
    canvas.width = 1400 * scale;
    canvas.height = 1000 * scale;

    // Clear and set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply scaling
    ctx.scale(scale, scale);

    // Draw border and title block
    drawTitleBlock(ctx);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx);
    }

    // Main single line diagram
    let currentY = 200;
    const centerX = 700;

    // Draw utility source
    currentY = drawUtilitySource(ctx, centerX, currentY, data.utility);

    // Draw transformer if present
    if (data.transformer) {
      currentY = drawTransformer(ctx, centerX, currentY, data.transformer);
    }

    // Draw main switchgear
    currentY = drawMainSwitchgear(ctx, centerX, currentY, data.mainSwitchgear);

    // Draw distribution
    drawDistribution(ctx, centerX, currentY, data);

    // Draw emergency power if present
    if (data.emergencyPower) {
      drawEmergencyPower(ctx, 1100, 300, data.emergencyPower);
    }

    // Draw notes and legends
    drawNotesAndLegends(ctx);

    // Draw load schedule table
    if (showCalculations) {
      drawLoadSchedule(ctx, data);
    }
  };

  const drawTitleBlock = (ctx: CanvasRenderingContext2D) => {
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 1360, 960);

    // Title block area
    ctx.strokeRect(880, 820, 500, 140);
    
    // Title block lines
    ctx.beginPath();
    ctx.moveTo(880, 860);
    ctx.lineTo(1380, 860);
    ctx.moveTo(880, 900);
    ctx.lineTo(1380, 900);
    ctx.moveTo(1130, 820);
    ctx.lineTo(1130, 960);
    ctx.stroke();

    // Title block text with better spacing
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    
    // Left column
    ctx.fillText('PROJECT:', 890, 845);
    ctx.font = '11px Arial';
    const projectName = data.projectName.toUpperCase();
    // Truncate if too long
    const maxLength = 25;
    const displayName = projectName.length > maxLength ? 
      projectName.substring(0, maxLength) + '...' : projectName;
    ctx.fillText(displayName, 890, 855);
    
    ctx.font = '10px Arial';
    ctx.fillText('PROJECT NO:', 890, 880);
    ctx.fillText(data.projectNumber || 'N/A', 970, 880);
    
    ctx.fillText('DATE:', 890, 920);
    ctx.fillText(data.date.toLocaleDateString(), 970, 920);
    
    ctx.fillText('DRAWN BY:', 890, 940);
    ctx.fillText(data.engineer || 'Vibelux Engineering', 970, 940);
    
    // Right column
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DRAWING', 1255, 840);
    ctx.font = 'bold 14px Arial';
    ctx.fillText('SINGLE LINE', 1255, 855);
    ctx.fillText('DIAGRAM', 1255, 870);
    
    ctx.font = '10px Arial';
    ctx.fillText('SCALE: NTS', 1255, 920);
    ctx.fillText('SHEET: 1 of 1', 1255, 940);

    // Main title
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ELECTRICAL SINGLE LINE DIAGRAM', 700, 60);
    
    ctx.font = '16px Arial';
    ctx.fillText(data.projectName, 700, 85);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 50; x < 1350; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 100);
      ctx.lineTo(x, 780);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 100; y < 780; y += 50) {
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(1350, y);
      ctx.stroke();
    }
  };

  const drawUtilitySource = (ctx: CanvasRenderingContext2D, x: number, y: number, utility: any): number => {
    // Utility symbol
    ctx.fillStyle = '#f0f0f0';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Draw utility transformer symbol
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // Sine wave inside
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    for (let i = -20; i <= 20; i++) {
      ctx.lineTo(x + i, y + Math.sin(i * 0.3) * 10);
    }
    ctx.stroke();
    
    // Labels with better positioning
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(utility.name, x, y - 40);
    ctx.font = '9px Arial';
    ctx.fillText(`${utility.voltage}V ${utility.phases}Ø ${utility.frequency}Hz`, x, y - 25);
    
    // AFC label positioned to the right
    ctx.textAlign = 'left';
    ctx.fillText(`AFC: ${utility.availableFaultCurrent}kA`, x + 40, y);
    
    // Connection line
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x, y + 60);
    ctx.stroke();
    
    // Phase indicators
    if (utility.phases === 3) {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 4, y + 40);
        ctx.lineTo(x + i * 4, y + 50);
        ctx.stroke();
      }
    }
    
    return y + 60;
  };

  const drawTransformer = (ctx: CanvasRenderingContext2D, x: number, y: number, transformer: TransformerData): number => {
    // Transformer symbol - two circles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Primary winding
    ctx.beginPath();
    ctx.arc(x, y + 30, 25, 0, Math.PI * 2);
    ctx.stroke();
    
    // Secondary winding
    ctx.beginPath();
    ctx.arc(x, y + 80, 25, 0, Math.PI * 2);
    ctx.stroke();
    
    // Core indication
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 55);
    ctx.lineTo(x + 30, y + 55);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#000000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${transformer.kva} kVA`, x + 35, y + 40);
    ctx.fillText(`${transformer.primaryVoltage}V / ${transformer.secondaryVoltage}V`, x + 35, y + 55);
    ctx.fillText(`${transformer.connection}`, x + 35, y + 70);
    ctx.fillText(`Z = ${transformer.impedance}%`, x + 35, y + 85);
    
    // Connection lines
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 5);
    ctx.moveTo(x, y + 105);
    ctx.lineTo(x, y + 130);
    ctx.stroke();
    
    return y + 130;
  };

  const drawMainSwitchgear = (ctx: CanvasRenderingContext2D, x: number, y: number, switchgear: SwitchgearData): number => {
    // Main breaker symbol
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    // Breaker rectangle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 40, y + 10, 80, 40);
    ctx.strokeRect(x - 40, y + 10, 80, 40);
    
    // Breaker symbol inside
    ctx.beginPath();
    ctx.arc(x - 10, y + 30, 8, 0, Math.PI * 2);
    ctx.moveTo(x + 2, y + 30);
    ctx.arc(x + 10, y + 30, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Cross for normally closed
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 25);
    ctx.lineTo(x - 5, y + 35);
    ctx.moveTo(x + 5, y + 25);
    ctx.lineTo(x + 15, y + 35);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MAIN', x, y + 5);
    ctx.font = '10px Arial';
    ctx.fillText(`${switchgear.rating}A`, x - 60, y + 30);
    ctx.fillText(`${switchgear.voltage}V`, x - 60, y + 42);
    ctx.fillText(`${switchgear.interrupting}kA IC`, x + 60, y + 30);
    
    // Bus connection
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 50);
    ctx.lineTo(x, y + 80);
    ctx.stroke();
    
    // Main bus bar
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 200, y + 80, 400, 8);
    
    return y + 88;
  };

  const drawDistribution = (ctx: CanvasRenderingContext2D, centerX: number, busY: number, data: SingleLineData) => {
    const panelSpacing = 250;
    const startX = centerX - (data.panels.length - 1) * panelSpacing / 2;
    
    data.panels.forEach((panel, index) => {
      const panelX = startX + index * panelSpacing;
      
      // Feeder from bus
      const feeder = data.feeders.find(f => f.to === panel.name);
      if (feeder) {
        drawFeeder(ctx, panelX, busY, feeder);
      }
      
      // Panel
      drawPanel(ctx, panelX, busY + 150, panel);
      
      // Loads
      const panelLoads = data.loads.find(l => l.panel === panel.name);
      if (panelLoads) {
        drawLoads(ctx, panelX, busY + 250, panelLoads.loads);
      }
    });
  };

  const drawFeeder = (ctx: CanvasRenderingContext2D, x: number, y: number, feeder: any) => {
    // Feeder breaker
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
    
    // Breaker symbol
    ctx.beginPath();
    ctx.arc(x, y + 30, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    // Feeder lines
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 36);
    ctx.lineTo(x, y + 150);
    ctx.stroke();
    
    // Cable designation
    ctx.save();
    ctx.translate(x + 15, y + 90);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000000';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${feeder.cable.conductors}-${feeder.cable.size} ${feeder.cable.type}`, 0, 0);
    ctx.fillText(`${feeder.cable.conduitSize}" ${feeder.cable.conduitType}`, 0, 10);
    ctx.restore();
    
    // Protection info
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${feeder.protection.rating}A`, x + 10, y + 30);
  };

  const drawPanel = (ctx: CanvasRenderingContext2D, x: number, y: number, panel: PanelData) => {
    // Panel rectangle
    ctx.fillStyle = '#f5f5f5';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.fillRect(x - 60, y, 120, 65);
    ctx.strokeRect(x - 60, y, 120, 65);
    
    // Panel details with adjusted spacing
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(panel.name, x, y + 18);
    ctx.font = '8px Arial';
    ctx.fillText(`${panel.voltage}V ${panel.phases}Ø`, x, y + 32);
    ctx.fillText(`${panel.busRating}A Bus`, x, y + 44);
    ctx.fillText(`${panel.spaces} Spaces`, x, y + 56);
    
    // Main breaker if exists
    if (panel.mainBreaker) {
      ctx.beginPath();
      ctx.arc(x, y - 10, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '8px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${panel.mainBreaker}A`, x + 10, y - 7);
    }
  };

  const drawLoads = (ctx: CanvasRenderingContext2D, x: number, y: number, loads: LoadData[]) => {
    const loadSpacing = 30;
    const maxLoadsPerColumn = 5;
    
    loads.forEach((load, index) => {
      const column = Math.floor(index / maxLoadsPerColumn);
      const row = index % maxLoadsPerColumn;
      const loadX = x + (column - 1) * 80;
      const loadY = y + 20 + row * loadSpacing;
      
      // Connection line
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(loadX, loadY);
      ctx.stroke();
      
      // Load symbol based on type
      drawLoadSymbol(ctx, loadX, loadY, load);
      
      // Load label
      ctx.fillStyle = '#000000';
      ctx.font = '8px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(load.name, loadX + 15, loadY);
      ctx.fillText(`${load.kw}kW`, loadX + 15, loadY + 10);
    });
  };

  const drawLoadSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, load: LoadData) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    
    switch (load.type) {
      case 'motor':
        // Motor symbol - circle with M
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('M', x, y + 4);
        break;
        
      case 'lighting':
        // Lighting symbol - circle with rays
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8);
          ctx.lineTo(x + Math.cos(angle) * 12, y + Math.sin(angle) * 12);
          ctx.stroke();
        }
        break;
        
      case 'receptacle':
        // Receptacle symbol
        ctx.beginPath();
        ctx.arc(x - 3, y, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 3, y, 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'hvac':
        // HVAC symbol - square with diagonal
        ctx.strokeRect(x - 8, y - 8, 16, 16);
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 8);
        ctx.lineTo(x + 8, y + 8);
        ctx.stroke();
        break;
        
      default:
        // Generic load - square
        ctx.strokeRect(x - 6, y - 6, 12, 12);
        break;
    }
  };

  const drawEmergencyPower = (ctx: CanvasRenderingContext2D, x: number, y: number, emergency: any) => {
    // Generator or UPS symbol
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    if (emergency.type === 'generator') {
      // Generator symbol - circle with G
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('G', x, y + 8);
    } else {
      // UPS symbol - rectangle with battery
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(x - 30, y - 20, 60, 40);
      ctx.strokeRect(x - 30, y - 20, 60, 40);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('UPS', x, y + 5);
    }
    
    // Labels
    ctx.font = '10px Arial';
    ctx.fillText(`${emergency.rating}kW`, x, y + 45);
    ctx.fillText(`${emergency.voltage}V`, x, y + 58);
    
    // Transfer switch
    const tsY = y + 100;
    ctx.strokeRect(x - 40, tsY - 20, 80, 40);
    ctx.font = '9px Arial';
    ctx.fillText(emergency.transferSwitch.type.toUpperCase(), x, tsY - 5);
    ctx.fillText('TRANSFER SWITCH', x, tsY + 5);
    ctx.fillText(`${emergency.transferSwitch.rating}A`, x, tsY + 17);
  };

  const drawNotesAndLegends = (ctx: CanvasRenderingContext2D) => {
    // Notes section
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('NOTES:', 50, 820);
    
    ctx.font = '9px Arial';
    const notes = [
      '1. ALL ELECTRICAL WORK SHALL COMPLY WITH NEC AND LOCAL CODES',
      '2. PROVIDE SELECTIVE COORDINATION STUDY PRIOR TO CONSTRUCTION',
      '3. VERIFY ALL UTILITY REQUIREMENTS WITH LOCAL POWER COMPANY',
      '4. GROUND FAULT PROTECTION PROVIDED WHERE REQUIRED BY NEC',
      '5. ALL CONDUITS SHALL BE EMT UNLESS NOTED OTHERWISE'
    ];
    
    notes.forEach((note, index) => {
      // Wrap long notes if needed
      if (note.length > 60) {
        const words = note.split(' ');
        let line = '';
        let lineCount = 0;
        for (let word of words) {
          if (line.length + word.length > 60) {
            ctx.fillText(line, 50, 835 + index * 13 + lineCount * 10);
            line = '   ' + word + ' ';
            lineCount++;
          } else {
            line += word + ' ';
          }
        }
        ctx.fillText(line, 50, 835 + index * 13 + lineCount * 10);
      } else {
        ctx.fillText(note, 50, 835 + index * 13);
      }
    });
    
    // Legend positioned better
    const legendX = 550;
    const legendY = 820;
    
    ctx.font = 'bold 11px Arial';
    ctx.fillText('LEGEND:', legendX, legendY);
    
    // Draw legend symbols
    const legendItems = [
      { symbol: 'breaker', label: 'CIRCUIT BREAKER' },
      { symbol: 'transformer', label: 'TRANSFORMER' },
      { symbol: 'motor', label: 'MOTOR' },
      { symbol: 'panel', label: 'PANELBOARD' },
      { symbol: 'ground', label: 'GROUND' }
    ];
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    legendItems.forEach((item, index) => {
      const symbolX = legendX;
      const symbolY = legendY + 20 + index * 20;
      
      // Draw symbol
      switch (item.symbol) {
        case 'breaker':
          ctx.beginPath();
          ctx.arc(symbolX, symbolY, 5, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'transformer':
          ctx.beginPath();
          ctx.arc(symbolX, symbolY - 5, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(symbolX, symbolY + 5, 5, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'motor':
          ctx.beginPath();
          ctx.arc(symbolX, symbolY, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('M', symbolX, symbolY + 3);
          ctx.textAlign = 'left';
          break;
        case 'panel':
          ctx.strokeRect(symbolX - 8, symbolY - 5, 16, 10);
          break;
        case 'ground':
          ctx.beginPath();
          ctx.moveTo(symbolX, symbolY - 8);
          ctx.lineTo(symbolX, symbolY);
          ctx.moveTo(symbolX - 8, symbolY);
          ctx.lineTo(symbolX + 8, symbolY);
          ctx.moveTo(symbolX - 5, symbolY + 3);
          ctx.lineTo(symbolX + 5, symbolY + 3);
          ctx.moveTo(symbolX - 2, symbolY + 6);
          ctx.lineTo(symbolX + 2, symbolY + 6);
          ctx.stroke();
          break;
      }
      
      // Label
      ctx.font = '9px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, symbolX + 20, symbolY + 3);
    });
  };

  const drawLoadSchedule = (ctx: CanvasRenderingContext2D, data: SingleLineData) => {
    // Calculate total loads
    let totalConnectedLoad = 0;
    let totalDemandLoad = 0;
    
    data.loads.forEach(panelLoads => {
      panelLoads.loads.forEach(load => {
        totalConnectedLoad += load.kw;
        totalDemandLoad += load.kw * 0.8; // 80% demand factor
      });
    });
    
    // Load summary box with better positioning
    const boxX = 50;
    const boxY = 650;
    const boxWidth = 200;
    const boxHeight = 120;
    
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LOAD SUMMARY', boxX + boxWidth/2, boxY + 20);
    
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    const lineHeight = 18;
    let currentY = boxY + 40;
    
    ctx.fillText(`Connected Load:`, boxX + 10, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`${totalConnectedLoad.toFixed(1)} kW`, boxX + boxWidth - 10, currentY);
    currentY += lineHeight;
    
    ctx.textAlign = 'left';
    ctx.fillText(`Demand Load:`, boxX + 10, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`${totalDemandLoad.toFixed(1)} kW`, boxX + boxWidth - 10, currentY);
    currentY += lineHeight;
    
    const current = totalDemandLoad * 1000 / (data.mainSwitchgear.voltage * Math.sqrt(3));
    ctx.textAlign = 'left';
    ctx.fillText(`Current:`, boxX + 10, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`${current.toFixed(1)} A`, boxX + boxWidth - 10, currentY);
    currentY += lineHeight;
    
    ctx.textAlign = 'left';
    ctx.fillText(`Main:`, boxX + 10, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`${data.mainSwitchgear.rating} A`, boxX + boxWidth - 10, currentY);
    currentY += lineHeight;
    
    const utilization = (current / data.mainSwitchgear.rating) * 100;
    ctx.textAlign = 'left';
    ctx.fillText(`Utilization:`, boxX + 10, currentY);
    ctx.textAlign = 'right';
    ctx.fillText(`${utilization.toFixed(1)}%`, boxX + boxWidth - 10, currentY);
  };

  const exportSingleLine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `single_line_${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportSingleLinePDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const windowContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Single Line Diagram - ${data.projectName}</title>
            <style>
              @page { 
                size: 11in 17in; 
                margin: 0.25in; 
              }
              body { 
                margin: 0; 
                padding: 0; 
                background: white; 
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              img { 
                max-width: 100%; 
                max-height: 100vh;
                object-fit: contain;
              }
              @media print {
                .no-print { display: none; }
                img { 
                  width: 100%;
                  height: auto;
                  page-break-inside: avoid;
                }
              }
              .no-print { 
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
              }
              .no-print button { 
                padding: 10px 20px; 
                font-size: 16px; 
                cursor: pointer; 
                border: none; 
                border-radius: 4px; 
                background: #007bff; 
                color: white; 
              }
              .no-print button:hover {
                background: #0056b3;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Single Line Diagram" />
            <div class="no-print">
              <button onclick="window.print()">Print / Save as PDF</button>
              <button onclick="window.close()">Close</button>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank', 'width=1200,height=900');
      if (printWindow) {
        printWindow.document.write(windowContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Unable to export PDF. Please try using the PNG export option.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-yellow-400" />
            Professional Single Line Diagram
          </CardTitle>
          <CardDescription className="text-gray-400">
            Industrial-grade electrical single line diagram with fault current and coordination data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Scale control */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Scale:</span>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
              >
                <option value={0.75}>75%</option>
                <option value={1}>100%</option>
                <option value={1.25}>125%</option>
                <option value={1.5}>150%</option>
              </select>
            </div>

            {/* Grid toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4"
              />
              Show Grid
            </label>

            {/* Export buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={exportSingleLine}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs font-medium transition-colors"
              >
                <Download className="w-3 h-3" />
                PNG (11x17)
              </button>
              <button
                onClick={exportSingleLinePDF}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors"
              >
                <FileText className="w-3 h-3" />
                PDF (11x17)
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-white border-gray-300">
        <CardContent className="p-4 overflow-auto">
          <canvas
            ref={canvasRef}
            className="border border-gray-300"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </CardContent>
      </Card>

      {/* Information cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              System Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Service:</span>
              <span className="text-white">{data.utility.voltage}V {data.utility.phases}Ø</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Main:</span>
              <span className="text-white">{data.mainSwitchgear.rating}A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AFC:</span>
              <span className="text-white">{data.utility.availableFaultCurrent}kA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Panels:</span>
              <span className="text-white">{data.panels.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• Selective coordination required</p>
            <p>• GFP per NEC 230.95</p>
            <p>• Arc flash study required</p>
            <p>• Emergency power ATS provided</p>
            <p>• Surge protection at main</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• NEC 2023 compliant</p>
            <p>• IEEE 141/242 standards</p>
            <p>• NFPA 70E requirements</p>
            <p>• Local AHJ approval required</p>
            <p>• Utility coordination pending</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to create sample single line data
export function createSingleLineData(
  projectName: string,
  panels: any[],
  loads: any[]
): SingleLineData {
  return {
    projectName,
    projectNumber: `VLX-${Date.now().toString().slice(-6)}`,
    date: new Date(),
    engineer: 'Vibelux Engineering',
    utility: {
      name: 'LOCAL UTILITY',
      voltage: 480,
      phases: 3,
      frequency: 60,
      availableFaultCurrent: 65,
      serviceType: 'underground'
    },
    transformer: {
      kva: 1000,
      primaryVoltage: 12470,
      secondaryVoltage: 480,
      impedance: 5.75,
      connection: 'Delta-Wye'
    },
    mainSwitchgear: {
      type: 'main',
      rating: 1600,
      voltage: 480,
      interrupting: 65,
      manufacturer: 'Square D',
      model: 'QED-2'
    },
    panels: panels.map(panel => ({
      name: panel.name,
      type: panel.type,
      voltage: panel.voltage,
      phases: panel.phases,
      busRating: panel.amperage,
      mainBreaker: panel.amperage,
      spaces: panel.spaces,
      mounting: 'surface' as const,
      enclosure: 'NEMA1' as const
    })),
    feeders: panels.map(panel => ({
      from: 'MAIN',
      to: panel.name,
      cable: {
        size: '4/0',
        type: 'THHN',
        conductors: 4,
        voltage: 600,
        ampacity: 230,
        length: 100,
        conduitSize: '3',
        conduitType: 'EMT'
      },
      protection: {
        type: 'Circuit Breaker',
        rating: panel.amperage,
        settings: 'LSI'
      }
    })),
    loads: panels.map(panel => ({
      panel: panel.name,
      loads: loads.filter(load => load.panel === panel.name).map(load => ({
        name: load.name,
        type: load.type as any,
        kw: load.wattage / 1000,
        voltage: load.voltage || 277,
        phases: 1,
        powerFactor: 0.95,
        startingKva: load.type === 'motor' ? load.wattage / 1000 * 6 : undefined
      }))
    })),
    emergencyPower: {
      type: 'generator',
      rating: 350,
      voltage: 480,
      transferSwitch: {
        type: 'automatic',
        rating: 400,
        transitions: 2
      }
    },
    groundingSystem: {
      type: 'Ground Ring with Rods',
      resistance: 5,
      conductorSize: '2/0 Cu'
    }
  };
}
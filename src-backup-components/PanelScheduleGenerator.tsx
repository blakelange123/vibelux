'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  FileText,
  Zap,
  Settings,
  Grid3x3,
  Activity,
  AlertTriangle,
  Gauge
} from 'lucide-react';

interface Circuit {
  id: string;
  position: number; // 1-42 for typical panel
  phase: 'A' | 'B' | 'C' | 'AB' | 'BC' | 'AC' | 'ABC';
  amperage: number;
  voltage: number;
  description: string;
  load: number; // watts
  wireSize: string;
  conduitSize: string;
  length: number; // feet
  equipment: Equipment[];
}

interface Equipment {
  id: string;
  name: string;
  type: 'fixture' | 'motor' | 'receptacle' | 'hvac' | 'other';
  wattage: number;
  voltage: number;
  phase: number;
  powerFactor: number;
  x?: number;
  y?: number;
}

interface Panel {
  id: string;
  name: string;
  type: 'main' | 'sub' | 'lighting' | 'power';
  voltage: number;
  phases: number;
  amperage: number;
  spaces: number;
  location: string;
  fed_from?: string;
  circuits: Circuit[];
}

interface PanelScheduleProps {
  panels: Panel[];
  projectName: string;
  showEquipmentConnections?: boolean;
  showLoadCalculations?: boolean;
}

export function PanelScheduleGenerator({
  panels,
  projectName,
  showEquipmentConnections = true,
  showLoadCalculations = true
}: PanelScheduleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel>(panels[0]);
  const [viewMode, setViewMode] = useState<'schedule' | 'connections' | 'load-calc'>('schedule');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      drawPanelSchedule();
    }
  }, [selectedPanel, viewMode]);

  const drawPanelSchedule = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1100;
    canvas.height = viewMode === 'schedule' ? 1400 : 800;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (viewMode) {
      case 'schedule':
        drawScheduleView(ctx);
        break;
      case 'connections':
        drawConnectionsView(ctx);
        break;
      case 'load-calc':
        drawLoadCalculationsView(ctx);
        break;
    }
  };

  const drawScheduleView = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`PANEL SCHEDULE - ${selectedPanel.name}`, canvas.width / 2, 40);
    
    ctx.font = '14px Arial';
    ctx.fillText(`${projectName} - ${new Date().toLocaleDateString()}`, canvas.width / 2, 60);

    // Panel info box
    const infoX = 50;
    const infoY = 80;
    const infoWidth = canvas.width - 100;
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(infoX, infoY, infoWidth, 60);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(infoX, infoY, infoWidth, 60);

    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Panel: ${selectedPanel.name}`, infoX + 10, infoY + 20);
    ctx.fillText(`Type: ${selectedPanel.type.toUpperCase()}`, infoX + 200, infoY + 20);
    ctx.fillText(`Voltage: ${selectedPanel.voltage}V ${selectedPanel.phases}Ø`, infoX + 400, infoY + 20);
    ctx.fillText(`Main: ${selectedPanel.amperage}A`, infoX + 600, infoY + 20);
    ctx.fillText(`Location: ${selectedPanel.location}`, infoX + 10, infoY + 40);
    ctx.fillText(`Spaces: ${selectedPanel.spaces}`, infoX + 400, infoY + 40);
    if (selectedPanel.fed_from) {
      ctx.fillText(`Fed From: ${selectedPanel.fed_from}`, infoX + 600, infoY + 40);
    }

    // Draw panel schedule table
    const tableY = infoY + 80;
    const leftPanelX = 50;
    const rightPanelX = canvas.width / 2 + 25;
    const columnWidth = (canvas.width / 2 - 75) / 8;

    // Headers for left side
    drawPanelHeader(ctx, leftPanelX, tableY, columnWidth);
    
    // Headers for right side
    drawPanelHeader(ctx, rightPanelX, tableY, columnWidth);

    // Circuit rows
    const circuitsPerSide = Math.ceil(selectedPanel.spaces / 2);
    const rowHeight = 25;

    for (let i = 0; i < circuitsPerSide; i++) {
      const leftPosition = i * 2 + 1;
      const rightPosition = i * 2 + 2;
      const rowY = tableY + 40 + i * rowHeight;

      // Left side circuit
      const leftCircuit = selectedPanel.circuits.find(c => c.position === leftPosition);
      drawCircuitRow(ctx, leftPanelX, rowY, columnWidth, leftPosition, leftCircuit, 'left');

      // Right side circuit
      const rightCircuit = selectedPanel.circuits.find(c => c.position === rightPosition);
      drawCircuitRow(ctx, rightPanelX, rowY, columnWidth, rightPosition, rightCircuit, 'right');
    }

    // Draw load summary
    drawLoadSummary(ctx, 50, tableY + 40 + circuitsPerSide * rowHeight + 40);
  };

  const drawPanelHeader = (ctx: CanvasRenderingContext2D, x: number, y: number, colWidth: number) => {
    const headers = ['CKT', 'POLE', 'A', 'V', 'DESCRIPTION', 'LOAD', 'WIRE', 'CONDUIT'];
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, colWidth * headers.length, 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    
    headers.forEach((header, index) => {
      ctx.fillText(header, x + colWidth * index + colWidth / 2, y + 20);
    });
  };

  const drawCircuitRow = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    colWidth: number, 
    position: number, 
    circuit: Circuit | undefined,
    side: 'left' | 'right'
  ) => {
    // Background
    ctx.fillStyle = position % 2 === 0 ? '#f8f9fa' : '#ffffff';
    ctx.fillRect(x, y, colWidth * 8, 25);
    ctx.strokeStyle = '#dddddd';
    ctx.strokeRect(x, y, colWidth * 8, 25);

    ctx.fillStyle = '#000000';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';

    if (circuit) {
      // Circuit number
      ctx.fillText(position.toString(), x + colWidth * 0.5, y + 17);
      
      // Pole configuration
      ctx.fillText(circuit.phase.length.toString(), x + colWidth * 1.5, y + 17);
      
      // Amperage
      ctx.fillText(circuit.amperage.toString(), x + colWidth * 2.5, y + 17);
      
      // Voltage
      ctx.fillText(circuit.voltage.toString(), x + colWidth * 3.5, y + 17);
      
      // Description
      ctx.textAlign = 'left';
      ctx.fillText(circuit.description, x + colWidth * 4 + 5, y + 17);
      ctx.textAlign = 'center';
      
      // Load
      ctx.fillText(`${circuit.load}W`, x + colWidth * 5.5, y + 17);
      
      // Wire size
      ctx.fillText(circuit.wireSize, x + colWidth * 6.5, y + 17);
      
      // Conduit size
      ctx.fillText(circuit.conduitSize, x + colWidth * 7.5, y + 17);
      
      // Phase indicators
      if (circuit.phase.includes('A')) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - 10, y + 5, 5, 15);
      }
      if (circuit.phase.includes('B')) {
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(x - 10, y + 5, 5, 15);
      }
      if (circuit.phase.includes('C')) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 10, y + 5, 5, 15);
      }
    } else {
      // Empty space
      ctx.fillText(position.toString(), x + colWidth * 0.5, y + 17);
      ctx.fillText('SPACE', x + colWidth * 4.5, y + 17);
    }
  };

  const drawConnectionsView = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`EQUIPMENT CONNECTIONS - ${selectedPanel.name}`, canvas.width / 2, 40);

    // Draw panel representation
    const panelX = canvas.width / 2 - 100;
    const panelY = 80;
    const panelWidth = 200;
    const panelHeight = 300;

    // Panel outline
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Panel label
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(selectedPanel.name, panelX + panelWidth / 2, panelY - 10);
    ctx.font = '12px Arial';
    ctx.fillText(`${selectedPanel.voltage}V ${selectedPanel.phases}Ø ${selectedPanel.amperage}A`, panelX + panelWidth / 2, panelY + 20);

    // Draw circuits as connection points
    const circuitSpacing = panelHeight / (selectedPanel.spaces / 2 + 1);
    selectedPanel.circuits.forEach((circuit) => {
      const isLeftSide = circuit.position % 2 === 1;
      const row = Math.floor((circuit.position - 1) / 2);
      const circuitY = panelY + circuitSpacing * (row + 1);
      const circuitX = isLeftSide ? panelX : panelX + panelWidth;

      // Circuit breaker
      ctx.fillStyle = '#666666';
      ctx.fillRect(isLeftSide ? circuitX - 20 : circuitX, circuitY - 5, 20, 10);
      
      // Circuit label
      ctx.fillStyle = '#000000';
      ctx.font = '9px Arial';
      ctx.textAlign = isLeftSide ? 'right' : 'left';
      ctx.fillText(`${circuit.id} ${circuit.amperage}A`, isLeftSide ? circuitX - 25 : circuitX + 25, circuitY + 3);

      // Draw connections to equipment
      drawEquipmentConnections(ctx, circuit, circuitX, circuitY, isLeftSide);
    });

    // Draw equipment legend
    drawEquipmentLegend(ctx, 50, canvas.height - 150);
  };

  const drawEquipmentConnections = (
    ctx: CanvasRenderingContext2D,
    circuit: Circuit,
    startX: number,
    startY: number,
    isLeftSide: boolean
  ) => {
    const equipmentSpacing = 150;
    const baseX = isLeftSide ? startX - 300 : startX + 300;

    circuit.equipment.forEach((equipment, index) => {
      const equipX = baseX;
      const equipY = startY + (index - Math.floor(circuit.equipment.length / 2)) * 40;

      // Connection line
      ctx.strokeStyle = getPhaseColor(circuit.phase);
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(isLeftSide ? startX - 20 : startX + 20, startY);
      ctx.lineTo(equipX, equipY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Equipment symbol
      drawEquipmentSymbol(ctx, equipment, equipX, equipY);

      // Equipment label
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(equipment.name, equipX, equipY + 25);
      ctx.fillText(`${equipment.wattage}W`, equipX, equipY + 37);
    });
  };

  const drawEquipmentSymbol = (ctx: CanvasRenderingContext2D, equipment: Equipment, x: number, y: number) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    switch (equipment.type) {
      case 'fixture':
        // LED fixture symbol
        ctx.beginPath();
        ctx.rect(x - 20, y - 10, 40, 20);
        ctx.stroke();
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x - 18, y - 8, 36, 16);
        break;

      case 'motor':
        // Motor symbol (circle with M)
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('M', x, y + 5);
        break;

      case 'receptacle':
        // Receptacle symbol
        ctx.beginPath();
        ctx.arc(x - 5, y, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 5, y, 5, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'hvac':
        // HVAC symbol
        ctx.beginPath();
        ctx.rect(x - 20, y - 15, 40, 30);
        ctx.stroke();
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HVAC', x, y + 3);
        break;

      default:
        // Generic equipment
        ctx.beginPath();
        ctx.rect(x - 15, y - 15, 30, 30);
        ctx.stroke();
        break;
    }
  };

  const drawLoadCalculationsView = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`LOAD CALCULATIONS - ${selectedPanel.name}`, canvas.width / 2, 40);

    // Phase load calculations
    const phaseLoads = calculatePhaseLoads();
    const totalLoad = Object.values(phaseLoads).reduce((sum, load) => sum + load, 0);
    const demandFactor = 0.8; // 80% demand factor for lighting
    const demandLoad = totalLoad * demandFactor;

    // Load summary table
    const tableX = 100;
    const tableY = 100;
    const tableWidth = canvas.width - 200;

    // Header
    ctx.fillStyle = '#333333';
    ctx.fillRect(tableX, tableY, tableWidth, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PHASE', tableX + tableWidth * 0.1, tableY + 20);
    ctx.fillText('CONNECTED LOAD (W)', tableX + tableWidth * 0.3, tableY + 20);
    ctx.fillText('DEMAND LOAD (W)', tableX + tableWidth * 0.5, tableY + 20);
    ctx.fillText('CURRENT (A)', tableX + tableWidth * 0.7, tableY + 20);
    ctx.fillText('% IMBALANCE', tableX + tableWidth * 0.9, tableY + 20);

    // Phase rows
    let currentY = tableY + 30;
    const avgLoad = totalLoad / 3;

    ['A', 'B', 'C'].forEach((phase) => {
      const load = phaseLoads[phase] || 0;
      const demandPhaseLoad = load * demandFactor;
      const current = demandPhaseLoad / (selectedPanel.voltage / Math.sqrt(3));
      const imbalance = Math.abs((load - avgLoad) / avgLoad * 100);

      ctx.fillStyle = currentY % 60 === 0 ? '#f8f9fa' : '#ffffff';
      ctx.fillRect(tableX, currentY, tableWidth, 30);
      ctx.strokeStyle = '#dddddd';
      ctx.strokeRect(tableX, currentY, tableWidth, 30);

      ctx.fillStyle = getPhaseColor(phase);
      ctx.fillRect(tableX + 5, currentY + 10, 10, 10);

      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.fillText(`Phase ${phase}`, tableX + tableWidth * 0.1, currentY + 20);
      ctx.fillText(load.toFixed(0), tableX + tableWidth * 0.3, currentY + 20);
      ctx.fillText(demandPhaseLoad.toFixed(0), tableX + tableWidth * 0.5, currentY + 20);
      ctx.fillText(current.toFixed(1), tableX + tableWidth * 0.7, currentY + 20);
      ctx.fillText(`${imbalance.toFixed(1)}%`, tableX + tableWidth * 0.9, currentY + 20);

      currentY += 30;
    });

    // Total row
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(tableX, currentY, tableWidth, 30);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(tableX, currentY, tableWidth, 30);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('TOTAL', tableX + tableWidth * 0.1, currentY + 20);
    ctx.fillText(totalLoad.toFixed(0), tableX + tableWidth * 0.3, currentY + 20);
    ctx.fillText(demandLoad.toFixed(0), tableX + tableWidth * 0.5, currentY + 20);
    ctx.fillText((demandLoad / selectedPanel.voltage / Math.sqrt(3)).toFixed(1), tableX + tableWidth * 0.7, currentY + 20);

    // Demand factor note
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`* Demand factor: ${(demandFactor * 100).toFixed(0)}% per NEC 220.42`, tableX, currentY + 50);

    // Draw load distribution chart
    drawLoadDistributionChart(ctx, phaseLoads, tableX, currentY + 80);
  };

  const drawLoadDistributionChart = (
    ctx: CanvasRenderingContext2D, 
    phaseLoads: { [key: string]: number },
    x: number,
    y: number
  ) => {
    const chartWidth = 400;
    const chartHeight = 200;
    const maxLoad = Math.max(...Object.values(phaseLoads), selectedPanel.amperage * selectedPanel.voltage / Math.sqrt(3));

    // Chart background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(x, y, chartWidth, chartHeight);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, chartWidth, chartHeight);

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Phase Load Distribution', x + chartWidth / 2, y - 10);

    // Draw bars
    const barWidth = chartWidth / 4;
    const phases = ['A', 'B', 'C'];

    phases.forEach((phase, index) => {
      const load = phaseLoads[phase] || 0;
      const barHeight = (load / maxLoad) * (chartHeight - 40);
      const barX = x + barWidth * (index + 0.5) + barWidth / 4;
      const barY = y + chartHeight - 20 - barHeight;

      // Bar
      ctx.fillStyle = getPhaseColor(phase);
      ctx.fillRect(barX, barY, barWidth / 2, barHeight);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(barX, barY, barWidth / 2, barHeight);

      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Phase ${phase}`, barX + barWidth / 4, y + chartHeight - 5);
      ctx.fillText(`${load.toFixed(0)}W`, barX + barWidth / 4, barY - 5);
    });

    // Capacity line
    const capacityY = y + chartHeight - 20 - ((selectedPanel.amperage * selectedPanel.voltage / Math.sqrt(3)) / maxLoad) * (chartHeight - 40);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, capacityY);
    ctx.lineTo(x + chartWidth, capacityY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ff0000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Panel Capacity', x + chartWidth - 5, capacityY - 5);
  };

  const calculatePhaseLoads = (): { [key: string]: number } => {
    const loads: { [key: string]: number } = { A: 0, B: 0, C: 0 };

    selectedPanel.circuits.forEach(circuit => {
      if (circuit.phase.includes('A')) loads.A += circuit.load / circuit.phase.length;
      if (circuit.phase.includes('B')) loads.B += circuit.load / circuit.phase.length;
      if (circuit.phase.includes('C')) loads.C += circuit.load / circuit.phase.length;
    });

    return loads;
  };

  const drawLoadSummary = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const phaseLoads = calculatePhaseLoads();
    const totalLoad = Object.values(phaseLoads).reduce((sum, load) => sum + load, 0);
    const demandLoad = totalLoad * 0.8; // 80% demand factor

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x, y, 500, 120);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 500, 120);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('LOAD SUMMARY', x + 10, y + 20);

    ctx.font = '12px Arial';
    ctx.fillText(`Total Connected Load: ${totalLoad.toFixed(0)}W`, x + 10, y + 45);
    ctx.fillText(`Demand Load (80%): ${demandLoad.toFixed(0)}W`, x + 10, y + 65);
    ctx.fillText(`Total Current: ${(demandLoad / selectedPanel.voltage / Math.sqrt(3)).toFixed(1)}A`, x + 10, y + 85);
    ctx.fillText(`Panel Capacity: ${selectedPanel.amperage}A @ ${selectedPanel.voltage}V`, x + 10, y + 105);

    // Phase balance indicator
    const avgLoad = totalLoad / 3;
    const maxImbalance = Math.max(
      ...Object.entries(phaseLoads).map(([_, load]) => Math.abs(load - avgLoad) / avgLoad * 100)
    );

    ctx.fillText(`Phase Balance: `, x + 270, y + 45);
    ctx.fillStyle = maxImbalance < 10 ? '#00aa00' : maxImbalance < 20 ? '#ffaa00' : '#ff0000';
    ctx.fillText(`${maxImbalance.toFixed(1)}%`, x + 360, y + 45);
  };

  const drawEquipmentLegend = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x, y, 300, 120);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 300, 120);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('EQUIPMENT LEGEND', x + 10, y + 20);

    const symbols = [
      { type: 'fixture', label: 'LED Fixture' },
      { type: 'motor', label: 'Motor' },
      { type: 'receptacle', label: 'Receptacle' },
      { type: 'hvac', label: 'HVAC Equipment' }
    ];

    symbols.forEach((symbol, index) => {
      const symbolY = y + 40 + index * 20;
      drawEquipmentSymbol(ctx, { type: symbol.type } as Equipment, x + 30, symbolY);
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(symbol.label, x + 60, symbolY + 5);
    });
  };

  const getPhaseColor = (phase: string): string => {
    if (phase.includes('A')) return '#ff0000';
    if (phase.includes('B')) return '#0000ff';
    if (phase.includes('C')) return '#000000';
    return '#666666';
  };

  const exportSchedule = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `panel_schedule_${selectedPanel.name}_${projectName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportSchedulePDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const windowContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Panel Schedule - ${selectedPanel.name} - ${projectName}</title>
            <style>
              @page { size: landscape; margin: 0.5in; }
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: white; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { margin: 0; font-size: 24px; }
              .header p { margin: 5px 0; font-size: 14px; }
              img { max-width: 100%; height: auto; }
              .footer { margin-top: 20px; font-size: 12px; text-align: center; }
              @media print {
                .no-print { display: none; }
              }
              .no-print { margin: 20px; text-align: center; }
              .no-print button { 
                padding: 10px 20px; margin: 0 10px; font-size: 16px; 
                cursor: pointer; border: none; border-radius: 4px; 
                background: #007bff; color: white; 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PANEL SCHEDULE - ${selectedPanel.name}</h1>
              <p>Project: ${projectName} | Date: ${new Date().toLocaleDateString()}</p>
            </div>
            <img src="${dataUrl}" alt="Panel Schedule" />
            <div class="footer">
              <p>Generated by Vibelux Electrical Estimator</p>
              <p>All installations must comply with NEC and local electrical codes</p>
            </div>
            <div class="no-print">
              <button onclick="window.print()">Print / Save as PDF</button>
              <button onclick="window.close()">Close</button>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
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
      {/* Controls */}
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Grid3x3 className="w-5 h-5 text-yellow-400" />
            Panel Schedule & Equipment Connections
          </CardTitle>
          <CardDescription className="text-gray-400">
            Detailed panel schedules and equipment connection diagrams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Panel selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-300">Panel:</span>
            <select
              value={selectedPanel.id}
              onChange={(e) => {
                const panel = panels.find(p => p.id === e.target.value);
                if (panel) setSelectedPanel(panel);
              }}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              {panels.map(panel => (
                <option key={panel.id} value={panel.id}>
                  {panel.name} - {panel.type} ({panel.amperage}A)
                </option>
              ))}
            </select>
          </div>

          {/* View mode selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">View:</span>
            <div className="flex gap-1">
              {[
                { id: 'schedule', label: 'Panel Schedule', icon: Grid3x3 },
                { id: 'connections', label: 'Connections', icon: Activity },
                { id: 'load-calc', label: 'Load Calculations', icon: Gauge }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id as any)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={exportSchedule}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              PNG
            </button>
            <button
              onClick={exportSchedulePDF}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors"
            >
              <FileText className="w-3 h-3" />
              PDF
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-white border-gray-300">
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 max-w-full"
            style={{ maxHeight: '80vh' }}
          />
        </CardContent>
      </Card>

      {/* Panel information cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Panel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{selectedPanel.type.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rating:</span>
              <span className="text-white">{selectedPanel.amperage}A @ {selectedPanel.voltage}V</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phases:</span>
              <span className="text-white">{selectedPanel.phases}Ø</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Spaces:</span>
              <span className="text-white">{selectedPanel.spaces}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Used:</span>
              <span className="text-white">{selectedPanel.circuits.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              Load Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {(() => {
              const phaseLoads = calculatePhaseLoads();
              const totalLoad = Object.values(phaseLoads).reduce((sum, load) => sum + load, 0);
              const demandLoad = totalLoad * 0.8;
              const utilization = (demandLoad / (selectedPanel.amperage * selectedPanel.voltage * Math.sqrt(3))) * 100;

              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connected:</span>
                    <span className="text-white">{(totalLoad / 1000).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Demand:</span>
                    <span className="text-white">{(demandLoad / 1000).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current:</span>
                    <span className="text-white">{(demandLoad / selectedPanel.voltage / Math.sqrt(3)).toFixed(1)} A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Utilization:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        utilization > 80 ? 'text-red-400 border-red-400' : 
                        utilization > 60 ? 'text-yellow-400 border-yellow-400' : 
                        'text-green-400 border-green-400'
                      }`}
                    >
                      {utilization.toFixed(0)}%
                    </Badge>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Compliance Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• Verify wire sizes per NEC Table 310.16</p>
            <p>• Maintain 80% circuit loading max</p>
            <p>• Provide proper overcurrent protection</p>
            <p>• Balance loads across phases (±10%)</p>
            <p>• Label all circuits clearly</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Example panel data generator
export function createSamplePanel(
  name: string,
  type: 'main' | 'sub' | 'lighting' | 'power',
  amperage: number,
  spaces: number,
  fixtures: any[]
): Panel {
  const circuits: Circuit[] = [];
  let position = 1;

  // Group fixtures by area or type
  const fixtureGroups = fixtures.reduce((groups, fixture) => {
    const key = fixture.area || 'General';
    if (!groups[key]) groups[key] = [];
    groups[key].push(fixture);
    return groups;
  }, {} as { [key: string]: any[] });

  // Create circuits for each group
  Object.entries(fixtureGroups).forEach(([area, areaFixtures]) => {
    const totalWattage = (areaFixtures as any[]).reduce((sum: number, f: any) => sum + f.wattage, 0);
    const requiredCircuits = Math.ceil(totalWattage / (20 * 120 * 0.8)); // 20A circuits at 80% load

    for (let i = 0; i < requiredCircuits; i++) {
      const circuitFixtures = (areaFixtures as any[]).slice(
        i * Math.ceil((areaFixtures as any[]).length / requiredCircuits),
        (i + 1) * Math.ceil((areaFixtures as any[]).length / requiredCircuits)
      );

      const circuitLoad = circuitFixtures.reduce((sum: number, f: any) => sum + f.wattage, 0);
      
      circuits.push({
        id: `${area.substring(0, 3).toUpperCase()}-${position}`,
        position: position++,
        phase: position % 3 === 1 ? 'A' : position % 3 === 2 ? 'B' : 'C',
        amperage: 20,
        voltage: 120,
        description: `${area} Lighting ${i + 1}`,
        load: circuitLoad,
        wireSize: '#12 AWG',
        conduitSize: '3/4"',
        length: 50,
        equipment: circuitFixtures.map((f: any) => ({
          id: f.id,
          name: f.model || 'LED Fixture',
          type: 'fixture' as const,
          wattage: f.wattage,
          voltage: 120,
          phase: 1,
          powerFactor: 0.95,
          x: f.x,
          y: f.y
        }))
      });
    }
  });

  return {
    id: `panel-${Date.now()}`,
    name,
    type,
    voltage: 208,
    phases: 3,
    amperage,
    spaces,
    location: 'Electrical Room',
    circuits
  };
}
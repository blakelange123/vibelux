'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  FileText,
  Map,
  Zap,
  Eye,
  Settings,
  Layers,
  Grid3x3,
  Route
} from 'lucide-react';

interface Fixture {
  id: string;
  x: number;
  y: number;
  wattage: number;
  model: string;
  circuitId: string;
}

interface Circuit {
  id: string;
  voltage: number;
  amperage: number;
  wireGauge: string;
  fixtures: string[];
  color: string;
  panelConnection: { x: number; y: number };
}

interface ElectricalDiagramProps {
  roomWidth: number;
  roomLength: number;
  fixtures: Fixture[];
  circuits: Circuit[];
  panelLocation: { x: number; y: number };
  projectName: string;
}

export function ElectricalDiagramGenerator({
  roomWidth,
  roomLength,
  fixtures,
  circuits,
  panelLocation,
  projectName
}: ElectricalDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [diagramType, setDiagramType] = useState<'plan' | 'single-line' | 'riser'>('plan');
  const [showGrid, setShowGrid] = useState(true);
  const [showWiring, setShowWiring] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [scale, setScale] = useState(10); // pixels per foot

  useEffect(() => {
    if (typeof window !== 'undefined') {
      drawDiagram();
    }
  }, [diagramType, showGrid, showWiring, showLabels, scale]);

  const drawDiagram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = Math.max(800, roomWidth * scale + 200);
    canvas.height = Math.max(600, roomLength * scale + 200);

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = 100;
    const offsetY = 100;

    switch (diagramType) {
      case 'plan':
        drawFloorPlan(ctx, offsetX, offsetY);
        break;
      case 'single-line':
        drawSingleLineDiagram(ctx, offsetX, offsetY);
        break;
      case 'riser':
        drawRiserDiagram(ctx, offsetX, offsetY);
        break;
    }
  };

  const drawFloorPlan = (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const roomPixelWidth = roomWidth * scale;
    const roomPixelHeight = roomLength * scale;

    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`ELECTRICAL PLAN - ${projectName}`, canvas.width / 2, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Scale: 1" = ${Math.round(12/scale)}'`, canvas.width / 2, 50);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      
      // Vertical lines (every foot)
      for (let x = 0; x <= roomWidth; x++) {
        const pixelX = offsetX + x * scale;
        ctx.beginPath();
        ctx.moveTo(pixelX, offsetY);
        ctx.lineTo(pixelX, offsetY + roomPixelHeight);
        ctx.stroke();
      }
      
      // Horizontal lines (every foot)
      for (let y = 0; y <= roomLength; y++) {
        const pixelY = offsetY + y * scale;
        ctx.beginPath();
        ctx.moveTo(offsetX, pixelY);
        ctx.lineTo(offsetX + roomPixelWidth, pixelY);
        ctx.stroke();
      }
    }

    // Draw room outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, roomPixelWidth, roomPixelHeight);

    // Draw room dimensions
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${roomWidth}'`, offsetX + roomPixelWidth / 2, offsetY - 10);
    
    ctx.save();
    ctx.translate(offsetX - 15, offsetY + roomPixelHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${roomLength}'`, 0, 0);
    ctx.restore();

    // Draw electrical panel
    const panelX = offsetX + panelLocation.x * scale;
    const panelY = offsetY + panelLocation.y * scale;
    
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(panelX - 15, panelY - 10, 30, 20);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX - 15, panelY - 10, 30, 20);
    
    if (showLabels) {
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PANEL', panelX, panelY + 35);
    }

    // Draw wiring paths if enabled
    if (showWiring) {
      circuits.forEach(circuit => {
        ctx.strokeStyle = circuit.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        // Get fixtures for this circuit
        const circuitFixtures = fixtures.filter(f => f.circuitId === circuit.id);
        
        if (circuitFixtures.length > 0) {
          // Draw from panel to first fixture
          const firstFixture = circuitFixtures[0];
          const firstX = offsetX + firstFixture.x * scale;
          const firstY = offsetY + firstFixture.y * scale;
          
          ctx.beginPath();
          ctx.moveTo(panelX, panelY);
          ctx.lineTo(firstX, firstY);
          ctx.stroke();

          // Draw between fixtures in circuit
          for (let i = 1; i < circuitFixtures.length; i++) {
            const prevFixture = circuitFixtures[i - 1];
            const currentFixture = circuitFixtures[i];
            
            const prevX = offsetX + prevFixture.x * scale;
            const prevY = offsetY + prevFixture.y * scale;
            const currentX = offsetX + currentFixture.x * scale;
            const currentY = offsetY + currentFixture.y * scale;
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
          }
        }
        
        ctx.setLineDash([]);
      });
    }

    // Draw fixtures
    fixtures.forEach(fixture => {
      const x = offsetX + fixture.x * scale;
      const y = offsetY + fixture.y * scale;
      const circuit = circuits.find(c => c.id === fixture.circuitId);
      
      // Draw fixture symbol
      ctx.fillStyle = circuit ? circuit.color : '#666666';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw fixture cross
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 4, y);
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x, y + 4);
      ctx.stroke();

      if (showLabels) {
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(fixture.id, x, y + 20);
        ctx.fillText(`${fixture.wattage}W`, x, y + 30);
      }
    });

    // Draw legend
    drawLegend(ctx, canvas.width - 180, offsetY);
    
    // Draw circuit schedule
    drawCircuitSchedule(ctx, offsetX, offsetY + roomPixelHeight + 50);
  };

  const drawSingleLineDiagram = (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`SINGLE LINE DIAGRAM - ${projectName}`, canvas.width / 2, 30);

    let currentY = offsetY;
    const centerX = canvas.width / 2;

    // Draw utility connection
    ctx.fillStyle = '#f0f0f0';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.fillRect(centerX - 40, currentY, 80, 30);
    ctx.strokeRect(centerX - 40, currentY, 80, 30);
    
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('UTILITY', centerX, currentY + 20);
    currentY += 50;

    // Draw main breaker
    ctx.beginPath();
    ctx.moveTo(centerX, currentY - 20);
    ctx.lineTo(centerX, currentY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, currentY + 10, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillText('MAIN', centerX + 20, currentY + 5);
    ctx.fillText('200A', centerX + 20, currentY + 15);
    currentY += 40;

    // Draw panel
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(centerX - 50, currentY, 100, 50);
    ctx.strokeRect(centerX - 50, currentY, 100, 50);
    
    ctx.fillStyle = '#000000';
    ctx.fillText('LIGHTING PANEL', centerX, currentY + 20);
    ctx.fillText('208V 3Ø', centerX, currentY + 35);
    currentY += 70;

    // Draw branch circuits
    const circuitsPerRow = 3;
    circuits.forEach((circuit, index) => {
      const row = Math.floor(index / circuitsPerRow);
      const col = index % circuitsPerRow;
      const x = centerX - 100 + col * 100;
      const y = currentY + row * 80;

      // Circuit line from panel
      ctx.beginPath();
      ctx.moveTo(centerX, currentY - 20);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Circuit breaker
      ctx.beginPath();
      ctx.arc(x, y + 10, 6, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${circuit.amperage}A`, x + 15, y + 8);
      ctx.fillText(circuit.id, x + 15, y + 18);

      // Load box
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(x - 20, y + 25, 40, 25);
      ctx.strokeRect(x - 20, y + 25, 40, 25);
      
      ctx.fillStyle = '#000000';
      ctx.font = '8px Arial';
      ctx.fillText(`${circuit.fixtures.length} FIXTURES`, x, y + 35);
      
      const totalWatts = fixtures
        .filter(f => f.circuitId === circuit.id)
        .reduce((sum, f) => sum + f.wattage, 0);
      ctx.fillText(`${totalWatts}W`, x, y + 45);
    });
  };

  const drawRiserDiagram = (ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`RISER DIAGRAM - ${projectName}`, canvas.width / 2, 30);

    // Draw vertical riser representing the building structure
    const riserX = offsetX + 50;
    const riserWidth = 100;
    const floorHeight = 100;

    // Draw main electrical service
    ctx.fillStyle = '#f0f0f0';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Service entrance
    ctx.fillRect(riserX, offsetY, riserWidth, 60);
    ctx.strokeRect(riserX, offsetY, riserWidth, 60);
    
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MAIN SERVICE', riserX + riserWidth/2, offsetY + 30);
    ctx.fillText('200A 208V 3Ø', riserX + riserWidth/2, offsetY + 45);

    // Draw grow room level
    const roomY = offsetY + 80;
    ctx.fillStyle = '#e8f4fd';
    ctx.fillRect(riserX, roomY, riserWidth, floorHeight);
    ctx.strokeRect(riserX, roomY, riserWidth, floorHeight);
    
    ctx.fillStyle = '#000000';
    ctx.fillText('GROW ROOM', riserX + riserWidth/2, roomY + 30);
    ctx.fillText('LIGHTING PANEL', riserX + riserWidth/2, roomY + 45);

    // Draw feeder
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(riserX + riserWidth/2, offsetY + 60);
    ctx.lineTo(riserX + riserWidth/2, roomY);
    ctx.stroke();

    // Draw circuit details to the right
    const detailX = riserX + riserWidth + 50;
    let detailY = roomY + 20;

    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('CIRCUIT DETAILS:', detailX, detailY);
    detailY += 25;

    circuits.forEach(circuit => {
      ctx.font = '10px Arial';
      ctx.fillStyle = circuit.color;
      ctx.fillRect(detailX, detailY - 8, 15, 10);
      
      ctx.fillStyle = '#000000';
      ctx.fillText(`${circuit.id}: ${circuit.amperage}A, ${circuit.wireGauge} AWG`, detailX + 20, detailY);
      
      const circuitFixtures = fixtures.filter(f => f.circuitId === circuit.id);
      const totalWatts = circuitFixtures.reduce((sum, f) => sum + f.wattage, 0);
      ctx.fillText(`${circuitFixtures.length} fixtures, ${totalWatts}W`, detailX + 20, detailY + 12);
      
      detailY += 30;
    });
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, 160, 120);
    ctx.strokeRect(x, y, 160, 120);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('LEGEND', x + 10, y + 20);

    // Fixture symbol
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.arc(x + 20, y + 40, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 40);
    ctx.lineTo(x + 24, y + 40);
    ctx.moveTo(x + 20, y + 36);
    ctx.lineTo(x + 20, y + 44);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '10px Arial';
    ctx.fillText('LED FIXTURE', x + 35, y + 45);

    // Panel symbol
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x + 15, y + 55, 20, 12);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 15, y + 55, 20, 12);
    ctx.fillText('ELECTRICAL PANEL', x + 40, y + 65);

    // Wiring symbol
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 80);
    ctx.lineTo(x + 35, y + 80);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#000000';
    ctx.fillText('CIRCUIT WIRING', x + 40, y + 85);

    // Grid symbol
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 15 + i * 7, y + 95);
      ctx.lineTo(x + 15 + i * 7, y + 105);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 95 + i * 5);
      ctx.lineTo(x + 29, y + 95 + i * 5);
      ctx.stroke();
    }
    ctx.fillStyle = '#000000';
    ctx.fillText('1\' GRID', x + 40, y + 105);
  };

  const drawCircuitSchedule = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('CIRCUIT SCHEDULE', x, y);

    // Table headers
    const headers = ['Circuit', 'Breaker', 'Wire', 'Load (W)', 'Fixtures'];
    const colWidths = [60, 60, 60, 80, 60];
    let currentX = x;

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(currentX, y + 10, colWidths.reduce((a, b) => a + b), 25);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(currentX, y + 10, colWidths.reduce((a, b) => a + b), 25);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px Arial';
    headers.forEach((header, i) => {
      ctx.fillText(header, currentX + 5, y + 27);
      currentX += colWidths[i];
    });

    // Table rows
    circuits.forEach((circuit, index) => {
      const rowY = y + 35 + index * 20;
      currentX = x;

      ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
      ctx.fillRect(currentX, rowY, colWidths.reduce((a, b) => a + b), 20);
      ctx.strokeRect(currentX, rowY, colWidths.reduce((a, b) => a + b), 20);

      const circuitFixtures = fixtures.filter(f => f.circuitId === circuit.id);
      const totalWatts = circuitFixtures.reduce((sum, f) => sum + f.wattage, 0);

      const rowData = [
        circuit.id,
        `${circuit.amperage}A`,
        `#${circuit.wireGauge}`,
        `${totalWatts}W`,
        `${circuitFixtures.length}`
      ];

      ctx.fillStyle = '#000000';
      ctx.font = '9px Arial';
      rowData.forEach((data, i) => {
        ctx.fillText(data, currentX + 5, rowY + 14);
        currentX += colWidths[i];
      });
    });
  };

  const exportDiagram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `electrical_${diagramType}_${projectName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportPDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Method 1: Try using jsPDF if available (would need to be installed)
      if (typeof window !== 'undefined' && (window as any).jspdf) {
        const { jsPDF } = (window as any).jspdf;
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`electrical_${diagramType}_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        return;
      }

      // Method 2: Fallback to print-to-PDF approach
      // Create a new canvas with white background for better print quality
      const pdfCanvas = document.createElement('canvas');
      pdfCanvas.width = canvas.width;
      pdfCanvas.height = canvas.height;
      const pdfCtx = pdfCanvas.getContext('2d');
      
      if (pdfCtx) {
        // White background
        pdfCtx.fillStyle = '#ffffff';
        pdfCtx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
        
        // Copy the diagram
        pdfCtx.drawImage(canvas, 0, 0);
        
        // Convert to data URL with high quality
        const dataUrl = pdfCanvas.toDataURL('image/png', 1.0);
        
        // Determine page orientation and size
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
        const diagramTitle = diagramType === 'plan' ? 'Floor Plan' : 
                           diagramType === 'single-line' ? 'Single Line Diagram' : 
                           'Riser Diagram';
        
        // Create print-friendly HTML document
        const windowContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Electrical ${diagramTitle} - ${projectName}</title>
              <style>
                @page {
                  size: ${orientation};
                  margin: 0.5in;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                  }
                  .no-print {
                    display: none;
                  }
                }
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  background: white;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                  page-break-after: avoid;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #333;
                }
                .header p {
                  margin: 5px 0;
                  font-size: 14px;
                  color: #666;
                }
                .diagram-container {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  page-break-inside: avoid;
                }
                .diagram-container img {
                  max-width: 100%;
                  max-height: calc(100vh - 200px);
                  object-fit: contain;
                  border: 1px solid #ddd;
                }
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                  page-break-before: avoid;
                }
                .info-table {
                  margin: 20px auto;
                  border-collapse: collapse;
                  font-size: 12px;
                }
                .info-table th, .info-table td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                .info-table th {
                  background-color: #f5f5f5;
                  font-weight: bold;
                }
                .no-print {
                  margin: 20px;
                  text-align: center;
                }
                .no-print button {
                  padding: 10px 20px;
                  margin: 0 10px;
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
                .no-print button.cancel {
                  background: #6c757d;
                }
                .no-print button.cancel:hover {
                  background: #5a6268;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>ELECTRICAL ${diagramTitle.toUpperCase()}</h1>
                <p><strong>Project:</strong> ${projectName}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Scale:</strong> 1" = ${Math.round(12/scale)}'</p>
              </div>
              
              <div class="diagram-container">
                <img src="${dataUrl}" alt="Electrical ${diagramTitle}" />
              </div>
              
              ${circuits.length > 0 ? `
                <table class="info-table">
                  <thead>
                    <tr>
                      <th>Circuit</th>
                      <th>Breaker</th>
                      <th>Wire Size</th>
                      <th>Total Load</th>
                      <th>Fixtures</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${circuits.map(circuit => {
                      const circuitFixtures = fixtures.filter(f => f.circuitId === circuit.id);
                      const totalWatts = circuitFixtures.reduce((sum, f) => sum + f.wattage, 0);
                      return `
                        <tr>
                          <td>${circuit.id}</td>
                          <td>${circuit.amperage}A</td>
                          <td>#${circuit.wireGauge} AWG</td>
                          <td>${totalWatts}W</td>
                          <td>${circuitFixtures.length}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              ` : ''}
              
              <div class="footer">
                <p>Generated by Vibelux Electrical Estimator</p>
                <p>All installations must comply with NEC and local electrical codes</p>
              </div>
              
              <div class="no-print">
                <button onclick="window.print()">Print / Save as PDF</button>
                <button class="cancel" onclick="window.close()">Cancel</button>
              </div>
            </body>
          </html>
        `;
        
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (printWindow) {
          printWindow.document.write(windowContent);
          printWindow.document.close();
          
          // Auto-trigger print after a short delay
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
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
            <Map className="w-5 h-5 text-blue-400" />
            Electrical Diagrams & Installation Plans
          </CardTitle>
          <CardDescription className="text-gray-400">
            Professional electrical diagrams for contractors and inspectors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Diagram Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Type:</span>
              <div className="flex gap-1">
                {[
                  { id: 'plan', label: 'Floor Plan', icon: Grid3x3 },
                  { id: 'single-line', label: 'Single Line', icon: Route },
                  { id: 'riser', label: 'Riser', icon: Layers }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setDiagramType(id as any)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      diagramType === id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4"
                />
                Grid
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showWiring}
                  onChange={(e) => setShowWiring(e.target.checked)}
                  className="w-4 h-4"
                />
                Wiring
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="w-4 h-4"
                />
                Labels
              </label>
            </div>

            {/* Scale */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Scale:</span>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
              >
                <option value={5}>1" = 2'</option>
                <option value={10}>1" = 1'</option>
                <option value={20}>1" = 6"</option>
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={exportDiagram}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs font-medium transition-colors"
              >
                <Download className="w-3 h-3" />
                PNG
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors"
              >
                <FileText className="w-3 h-3" />
                PDF
              </button>
            </div>
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

      {/* Diagram Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Circuit Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {circuits.map(circuit => {
              const circuitFixtures = fixtures.filter(f => f.circuitId === circuit.id);
              const totalWatts = circuitFixtures.reduce((sum, f) => sum + f.wattage, 0);
              
              return (
                <div key={circuit.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: circuit.color }}
                    />
                    <span className="text-white">{circuit.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{circuit.amperage}A</Badge>
                    <Badge variant="outline" className="text-xs">{totalWatts}W</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Installation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• All wiring per NEC and local codes</p>
            <p>• Provide GFCI protection where required</p>
            <p>• Install disconnect at panel</p>
            <p>• Bond all equipment grounds</p>
            <p>• Test all circuits before energizing</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Diagram Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded-full border border-gray-400"></div>
              <span>LED Fixture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-gray-600 border border-gray-400"></div>
              <span>Electrical Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0 border-t-2 border-dashed border-red-500"></div>
              <span>Circuit Wiring</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
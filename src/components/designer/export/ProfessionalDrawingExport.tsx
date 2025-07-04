'use client';

import React, { useState, useRef } from 'react';
import { FileDown, Settings, Eye, Printer, Check } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import jsPDF from 'jspdf';
import { DrawingGenerator } from '@/lib/drawing/drawing-generator';
import { DXFExporter } from '@/lib/drawing/dxf-export';

interface DrawingSettings {
  scale: string;
  paperSize: 'LETTER' | 'LEGAL' | 'TABLOID' | 'A1' | 'A2' | 'A3' | 'A4' | 'ARCH_D' | 'ARCH_E';
  includeViews: {
    plan: boolean;
    elevation: boolean;
    electrical: boolean;
    details: boolean;
    schedule: boolean;
  };
  simplifiedView: boolean;
  multiPage: boolean;
  titleBlock: {
    projectName: string;
    projectNumber: string;
    clientName: string;
    designer: string;
    checker: string;
    date: string;
    revision: string;
    sheet: string;
  };
  dimensions: boolean;
  grid: boolean;
  legend: boolean;
  notes: string[];
  includeDXF: boolean;
}

const defaultSettings: DrawingSettings = {
  scale: '1:50',
  paperSize: 'LETTER',
  includeViews: {
    plan: true,
    elevation: false,
    electrical: true,
    details: true,
    schedule: true
  },
  titleBlock: {
    projectName: '',
    projectNumber: '',
    clientName: '',
    designer: '',
    checker: '',
    date: new Date().toISOString().split('T')[0],
    revision: 'A',
    sheet: '1 of 1'
  },
  dimensions: true,
  grid: true,
  legend: true,
  notes: [
    'All dimensions are in feet unless otherwise noted.',
    'Verify all dimensions on site before installation.',
    'Electrical work to be performed by licensed electrician.',
    'Mounting heights measured from finished floor to bottom of fixture.'
  ],
  includeDXF: false,
  simplifiedView: false,
  multiPage: false
};

interface ProfessionalDrawingExportProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ProfessionalDrawingExport({ isOpen = true, onClose }: ProfessionalDrawingExportProps) {
  const { state } = useDesigner();
  const { showNotification } = useNotifications();
  const [settings, setSettings] = useState<DrawingSettings>(defaultSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const paperSizes = {
    LETTER: { width: 216, height: 279 },
    LEGAL: { width: 216, height: 356 },
    TABLOID: { width: 279, height: 432 },
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    A2: { width: 420, height: 594 },
    A1: { width: 594, height: 841 },
    ARCH_D: { width: 610, height: 914 },
    ARCH_E: { width: 914, height: 1219 }
  };

  const generateDrawing = async () => {
    if (!state.room || state.objects.length === 0) {
      showNotification('error', 'Please create a room and add fixtures before exporting');
      return;
    }

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const size = paperSizes[settings.paperSize];
      const dpi = 300;
      
      canvas.width = (size.width / 25.4) * dpi;
      canvas.height = (size.height / 25.4) * dpi;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isSmallPaper = ['LETTER', 'LEGAL', 'A4'].includes(settings.paperSize);
      const margin = isSmallPaper ? 50 : 100;
      const titleBlockHeight = isSmallPaper ? 150 : 250;
      const availableWidth = canvas.width - (margin * 2);
      const availableHeight = canvas.height - (margin * 2) - titleBlockHeight;
      
      const roomWidthInPixels = state.room.width * dpi / 12;
      const roomLengthInPixels = state.room.length * dpi / 12;
      
      const scaleX = availableWidth / roomWidthInPixels;
      const scaleY = availableHeight / roomLengthInPixels;
      const autoScale = Math.min(scaleX, scaleY, 1);
      
      const requestedScale = parseInt(settings.scale.split(':')[1]);
      const actualScale = Math.min(requestedScale, Math.floor(1 / autoScale));
      
      if (actualScale > requestedScale * 2) {
        const sheets = Math.ceil(state.room.width / (requestedScale * availableWidth / dpi * 12)) * 
                      Math.ceil(state.room.length / (requestedScale * availableHeight / dpi * 12));
        
        if (!confirm(`This project requires approximately ${sheets} sheets at 1:${requestedScale} scale. Would you like to continue with automatic scaling to fit on one sheet (1:${actualScale})?`)) {
          setIsGenerating(false);
          return;
        }
      }

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const generator = new DrawingGenerator(ctx, {
        scale: actualScale,
        units: 'imperial',
        lineWeights: {
          border: 0.7,
          wall: 0.5,
          fixture: 0.35,
          dimension: 0.25,
          hidden: 0.25,
          centerline: 0.25
        },
        layers: {
          walls: true,
          fixtures: true,
          electrical: settings.includeViews.electrical,
          dimensions: settings.dimensions,
          hvac: false,
          text: true
        }
      });

      drawTitleBlock(ctx, canvas.width, canvas.height);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 350);

      const drawingArea = {
        x: 100,
        y: 100,
        width: canvas.width - 200,
        height: canvas.height - 450
      };

      if (settings.includeViews.plan) {
        drawPlanView(ctx, drawingArea, generator, actualScale);
      }

      if (settings.includeViews.electrical) {
        drawElectricalPlan(ctx, drawingArea, generator, actualScale);
      }

      if (settings.includeViews.schedule) {
        drawFixtureSchedule(ctx, canvas.width - 600, 100);
      }

      if (settings.legend) {
        drawLegend(ctx, 100, canvas.height - 300);
      }
      
      generator.drawScaleBar(10, canvas.height - 100);
      generator.drawNorthArrow(canvas.width - 100, 100, 2);

      const pdf = new jsPDF({
        orientation: size.width > size.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [size.width, size.height]
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, size.width, size.height);
      
      pdf.save(`${settings.titleBlock.projectName || 'lighting-plan'}-${settings.titleBlock.sheet.replace(' ', '-')}.pdf`);
      
      if (settings.includeDXF) {
        const dxfExporter = new DXFExporter();
        dxfExporter.exportDesign(state.room, state.objects);
        const dxfContent = dxfExporter.generate();
        
        const blob = new Blob([dxfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${settings.titleBlock.projectName || 'lighting-plan'}.dxf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      showNotification('success', 'Professional drawing exported successfully');
    } catch (error) {
      console.error('Error generating drawing:', error);
      showNotification('error', 'Failed to generate drawing');
    } finally {
      setIsGenerating(false);
    }
  };

  const drawTitleBlock = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const isSmallPaper = ['LETTER', 'LEGAL', 'A4'].includes(settings.paperSize);
    const blockWidth = isSmallPaper ? 400 : 600;
    const blockHeight = isSmallPaper ? 150 : 250;
    const margin = isSmallPaper ? 25 : 50;
    const x = width - blockWidth - margin;
    const y = height - blockHeight - margin;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, blockWidth, blockHeight);

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 60);
    ctx.lineTo(x + blockWidth, y + 60);
    ctx.moveTo(x + 400, y);
    ctx.lineTo(x + 400, y + blockHeight);
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(settings.titleBlock.projectName || 'LIGHTING PLAN', x + 20, y + 40);

    ctx.font = '16px Arial';
    ctx.fillText(`Project No: ${settings.titleBlock.projectNumber}`, x + 20, y + 90);
    ctx.fillText(`Client: ${settings.titleBlock.clientName}`, x + 20, y + 120);
    ctx.fillText(`Date: ${settings.titleBlock.date}`, x + 20, y + 150);

    ctx.fillText(`Scale: ${settings.scale}`, x + 420, y + 40);
    ctx.fillText(`Sheet: ${settings.titleBlock.sheet}`, x + 420, y + 70);
    ctx.fillText(`Rev: ${settings.titleBlock.revision}`, x + 420, y + 100);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Designed by: ${settings.titleBlock.designer}`, x + 20, y + 200);
    ctx.fillText(`Checked by: ${settings.titleBlock.checker}`, x + 20, y + 230);
  };

  const drawPlanView = (ctx: CanvasRenderingContext2D, area: any, generator: DrawingGenerator, actualScale: number) => {
    if (!state.room) return;

    ctx.save();
    ctx.translate(area.x + area.width / 2, area.y + area.height / 2);

    const dpi = 300;
    const scale = dpi / actualScale;
    
    const roomWidth = state.room.width * scale;
    const roomLength = state.room.length * scale;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeRect(-roomWidth / 2, -roomLength / 2, roomWidth, roomLength);

    if (settings.grid) {
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([5, 5]);

      for (let x = 0; x <= state.room.width; x += 5) {
        const px = -roomWidth / 2 + x * scale;
        ctx.beginPath();
        ctx.moveTo(px, -roomLength / 2);
        ctx.lineTo(px, roomLength / 2);
        ctx.stroke();
      }

      for (let y = 0; y <= state.room.length; y += 5) {
        const py = -roomLength / 2 + y * scale;
        ctx.beginPath();
        ctx.moveTo(-roomWidth / 2, py);
        ctx.lineTo(roomWidth / 2, py);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    state.objects.forEach(obj => {
      if (obj.type === 'fixture') {
        const x = (obj.x - state.room.width / 2) * scale;
        const y = (obj.y - state.room.length / 2) * scale;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(obj.rotation * Math.PI / 180);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'white';
        const w = obj.width * scale;
        const h = obj.length * scale;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`F${state.objects.indexOf(obj) + 1}`, 0, 0);

        ctx.restore();
      }
    });

    if (settings.dimensions) {
      drawDimensions(ctx, roomWidth, roomLength, state.room.width, state.room.length);
    }

    ctx.restore();
  };

  const drawDimensions = (ctx: CanvasRenderingContext2D, width: number, height: number, actualWidth: number, actualHeight: number) => {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';

    const dimOffset = 40;
    ctx.beginPath();
    ctx.moveTo(-width / 2, height / 2 + dimOffset);
    ctx.lineTo(width / 2, height / 2 + dimOffset);
    ctx.stroke();

    drawArrow(ctx, -width / 2, height / 2 + dimOffset, 'left');
    drawArrow(ctx, width / 2, height / 2 + dimOffset, 'right');

    ctx.textAlign = 'center';
    ctx.fillText(`${actualWidth}'`, 0, height / 2 + dimOffset + 20);

    ctx.beginPath();
    ctx.moveTo(width / 2 + dimOffset, -height / 2);
    ctx.lineTo(width / 2 + dimOffset, height / 2);
    ctx.stroke();

    drawArrow(ctx, width / 2 + dimOffset, -height / 2, 'up');
    drawArrow(ctx, width / 2 + dimOffset, height / 2, 'down');

    ctx.save();
    ctx.translate(width / 2 + dimOffset + 20, 0);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${actualHeight}'`, 0, 0);
    ctx.restore();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, direction: string) => {
    ctx.beginPath();
    switch (direction) {
      case 'left':
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y - 5);
        ctx.lineTo(x + 10, y + 5);
        break;
      case 'right':
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y - 5);
        ctx.lineTo(x - 10, y + 5);
        break;
      case 'up':
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 10);
        ctx.lineTo(x + 5, y + 10);
        break;
      case 'down':
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y - 10);
        ctx.lineTo(x + 5, y - 10);
        break;
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawElectricalPlan = (ctx: CanvasRenderingContext2D, area: any, generator: DrawingGenerator, actualScale: number) => {
    // Simplified electrical plan
  };

  const drawFixtureSchedule = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';

    ctx.font = 'bold 16px Arial';
    ctx.fillText('FIXTURE SCHEDULE', x, y - 10);

    ctx.font = '12px Arial';
    const headers = ['ID', 'Type', 'Manufacturer', 'Model', 'Watts', 'Qty'];
    const colWidths = [40, 80, 120, 120, 60, 40];
    
    let currentX = x;
    headers.forEach((header, i) => {
      ctx.fillText(header, currentX + 5, y + 20);
      currentX += colWidths[i];
    });

    ctx.beginPath();
    ctx.moveTo(x, y + 25);
    ctx.lineTo(x + colWidths.reduce((a, b) => a + b), y + 25);
    ctx.stroke();

    const fixtureGroups = new Map();
    state.objects.filter(obj => obj.type === 'fixture').forEach(fixture => {
      const key = `${fixture.model?.manufacturer || 'Unknown'}-${fixture.model?.name || 'Unknown'}`;
      if (!fixtureGroups.has(key)) {
        fixtureGroups.set(key, { fixture, count: 0 });
      }
      fixtureGroups.get(key).count++;
    });

    let rowY = y + 45;
    let fixtureId = 1;
    fixtureGroups.forEach(({ fixture, count }) => {
      currentX = x;
      const data = [
        `F${fixtureId++}`,
        'LED Linear',
        fixture.model?.manufacturer || 'N/A',
        fixture.model?.name || 'N/A',
        fixture.model?.wattage || 'N/A',
        count.toString()
      ];

      data.forEach((text, i) => {
        ctx.fillText(text, currentX + 5, rowY);
        currentX += colWidths[i];
      });

      rowY += 20;
    });
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('LEGEND', x, y);

    ctx.font = '14px Arial';
    const legendItems = [
      { symbol: '⬜', description: 'LED Linear Fixture' },
      { symbol: '⭕', description: 'Emergency Light' },
      { symbol: '➡️', description: 'Exit Sign' },
      { symbol: '---', description: 'Electrical Circuit' }
    ];

    legendItems.forEach((item, i) => {
      ctx.fillText(item.symbol, x, y + 30 + i * 25);
      ctx.fillText(item.description, x + 40, y + 30 + i * 25);
    });

    if (settings.notes.length > 0) {
      ctx.font = 'bold 16px Arial';
      ctx.fillText('NOTES', x + 300, y);
      
      ctx.font = '12px Arial';
      settings.notes.forEach((note, i) => {
        ctx.fillText(`${i + 1}. ${note}`, x + 300, y + 30 + i * 20);
      });
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Professional Drawing Export</h2>
              <p className="text-gray-400 mt-1">Generate construction-ready drawings with proper formatting</p>
            </div>
            <button
              onClick={handleClose}
              className="text-2xl text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paper Size
              </label>
              <select
                value={settings.paperSize}
                onChange={(e) => {
                  const newSize = e.target.value as any;
                  const isSmall = ['LETTER', 'LEGAL', 'A4'].includes(newSize);
                  setSettings({ 
                    ...settings, 
                    paperSize: newSize,
                    simplifiedView: isSmall ? true : settings.simplifiedView
                  });
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <optgroup label="Standard US Sizes">
                  <option value="LETTER">Letter (8.5" x 11")</option>
                  <option value="LEGAL">Legal (8.5" x 14")</option>
                  <option value="TABLOID">Tabloid (11" x 17")</option>
                </optgroup>
                <optgroup label="Architectural Sizes">
                  <option value="ARCH_D">ARCH D (24" x 36")</option>
                  <option value="ARCH_E">ARCH E (36" x 48")</option>
                </optgroup>
                <optgroup label="ISO Sizes">
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="A3">A3 (297 x 420 mm)</option>
                  <option value="A2">A2 (420 x 594 mm)</option>
                  <option value="A1">A1 (594 x 841 mm)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Drawing Scale
              </label>
              <select
                value={settings.scale}
                onChange={(e) => setSettings({ ...settings, scale: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="1:25">1:25</option>
                <option value="1:50">1:50</option>
                <option value="1:75">1:75</option>
                <option value="1:100">1:100</option>
                <option value="1:150">1:150</option>
                <option value="1:200">1:200</option>
                <option value="1:250">1:250</option>
                <option value="1:300">1:300</option>
                <option value="1:500">1:500</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Drawing Views</h3>
            <div className="space-y-2">
              {Object.entries(settings.includeViews).map(([view, enabled]) => (
                <label key={view} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      includeViews: { ...settings.includeViews, [view]: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-300 capitalize">{view} View</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Title Block</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={settings.titleBlock.projectName}
                onChange={(e) => setSettings({
                  ...settings,
                  titleBlock: { ...settings.titleBlock, projectName: e.target.value }
                })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Project Number"
                value={settings.titleBlock.projectNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  titleBlock: { ...settings.titleBlock, projectNumber: e.target.value }
                })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Client Name"
                value={settings.titleBlock.clientName}
                onChange={(e) => setSettings({
                  ...settings,
                  titleBlock: { ...settings.titleBlock, clientName: e.target.value }
                })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Designer"
                value={settings.titleBlock.designer}
                onChange={(e) => setSettings({
                  ...settings,
                  titleBlock: { ...settings.titleBlock, designer: e.target.value }
                })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.dimensions}
                  onChange={(e) => setSettings({ ...settings, dimensions: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-300">Show Dimensions</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.grid}
                  onChange={(e) => setSettings({ ...settings, grid: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-300">Show Grid</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.legend}
                  onChange={(e) => setSettings({ ...settings, legend: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-300">Include Legend</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.includeDXF}
                  onChange={(e) => setSettings({ ...settings, includeDXF: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-300">Also Export DXF File (AutoCAD)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.simplifiedView}
                  onChange={(e) => setSettings({ ...settings, simplifiedView: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-300">Simplified View (Less detail for small papers)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.multiPage}
                  onChange={(e) => setSettings({ ...settings, multiPage: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-gray-300">Allow Multi-Page Export (Split large projects)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={generateDrawing}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                Generate Drawing
              </>
            )}
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
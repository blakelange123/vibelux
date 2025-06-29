'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, BarChart3, Upload, Grid3x3, Eye, Download, Settings, Info } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { calculatePPFDAtPoint } from '../utils/calculations';

interface PanelProps {
  onClose: () => void;
}

interface PPFDPoint {
  x: number;
  y: number;
  value: number;
}

export function AdvancedPPFDMappingPanel({ onClose }: PanelProps) {
  const { state } = useDesigner();
  const { room, objects } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [resolution, setResolution] = useState(1); // feet
  const [height, setHeight] = useState(3); // calculation height in feet
  const [showContours, setShowContours] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [colorScale, setColorScale] = useState<'rainbow' | 'heat' | 'cool'>('heat');
  const [ppfdData, setPpfdData] = useState<PPFDPoint[]>([]);
  const [stats, setStats] = useState({
    min: 0,
    max: 0,
    avg: 0,
    uniformity: 0
  });

  // Calculate PPFD grid
  const calculatePPFDGrid = () => {
    const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);
    const points: PPFDPoint[] = [];
    const values: number[] = [];

    for (let x = 0; x < room.width; x += resolution) {
      for (let y = 0; y < room.length; y += resolution) {
        const ppfd = fixtures.reduce((total, fixture) => {
          return total + calculatePPFDAtPoint(
            { x, y, z: height },
            fixture as any
          );
        }, 0);
        
        points.push({ x, y, value: ppfd });
        values.push(ppfd);
      }
    }

    setPpfdData(points);

    // Calculate statistics
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const uniformity = min / avg;

      setStats({ min, max, avg, uniformity });
    }
  };

  // Render heatmap
  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas || ppfdData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale factors
    const scaleX = canvas.width / room.width;
    const scaleY = canvas.height / room.length;
    const cellWidth = resolution * scaleX;
    const cellHeight = resolution * scaleY;

    // Color scale function
    const getColor = (value: number) => {
      const normalized = (value - stats.min) / (stats.max - stats.min);
      
      if (colorScale === 'heat') {
        // Heat scale: black -> red -> yellow -> white
        const r = Math.min(255, normalized * 510);
        const g = Math.max(0, (normalized - 0.5) * 510);
        const b = Math.max(0, (normalized - 0.8) * 255 * 5);
        return `rgb(${r}, ${g}, ${b})`;
      } else if (colorScale === 'cool') {
        // Cool scale: black -> blue -> cyan -> white
        const r = Math.max(0, (normalized - 0.5) * 510);
        const g = normalized * 255;
        const b = Math.min(255, normalized * 510);
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Rainbow scale
        const hue = (1 - normalized) * 240; // 240 to 0 (blue to red)
        return `hsl(${hue}, 100%, 50%)`;
      }
    };

    // Draw heatmap
    ppfdData.forEach(point => {
      ctx.fillStyle = getColor(point.value);
      ctx.fillRect(
        point.x * scaleX,
        point.y * scaleY,
        cellWidth,
        cellHeight
      );
    });

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= room.width; x += resolution) {
        ctx.beginPath();
        ctx.moveTo(x * scaleX, 0);
        ctx.lineTo(x * scaleX, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= room.length; y += resolution) {
        ctx.beginPath();
        ctx.moveTo(0, y * scaleY);
        ctx.lineTo(canvas.width, y * scaleY);
        ctx.stroke();
      }
    }

    // Draw contours
    if (showContours) {
      const contourLevels = [100, 200, 400, 600, 800, 1000, 1200];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      
      contourLevels.forEach(level => {
        if (level >= stats.min && level <= stats.max) {
          // Simple contour drawing (would need marching squares for smooth contours)
          ctx.beginPath();
          ppfdData.forEach((point, i) => {
            if (Math.abs(point.value - level) < 50) {
              if (i === 0) {
                ctx.moveTo(point.x * scaleX, point.y * scaleY);
              } else {
                ctx.lineTo(point.x * scaleX, point.y * scaleY);
              }
            }
          });
          ctx.stroke();
        }
      });
    }

    // Draw fixtures
    objects.filter(obj => obj.type === 'fixture').forEach(fixture => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(
        (fixture.x - 1) * scaleX,
        (fixture.y - 2) * scaleY,
        2 * scaleX,
        4 * scaleY
      );
    });
  };

  // Export as image
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `ppfd_map_${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Calculate on mount and when dependencies change
  useEffect(() => {
    calculatePPFDGrid();
  }, [objects, resolution, height]);

  useEffect(() => {
    renderHeatmap();
  }, [ppfdData, showContours, showGrid, colorScale]);

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-white">Advanced PPFD Mapping</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="flex-1 flex">
        {/* Settings Panel */}
        <div className="w-64 border-r border-gray-700 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Calculation Settings
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Grid Resolution (ft)</label>
                <input
                  type="number"
                  value={resolution}
                  onChange={(e) => setResolution(Number(e.target.value))}
                  min="0.5"
                  max="5"
                  step="0.5"
                  className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Calculation Height (ft)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="0"
                  max={room.height}
                  step="0.5"
                  className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Display Options
            </h3>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                Show Grid
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showContours}
                  onChange={(e) => setShowContours(e.target.checked)}
                  className="rounded"
                />
                Show Contours
              </label>
            </div>
            
            <div className="mt-3">
              <label className="text-xs text-gray-400">Color Scale</label>
              <select
                value={colorScale}
                onChange={(e) => setColorScale(e.target.value as any)}
                className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              >
                <option value="heat">Heat Map</option>
                <option value="cool">Cool Map</option>
                <option value="rainbow">Rainbow</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Statistics
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Min PPFD:</span>
                <span className="text-white">{stats.min.toFixed(0)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max PPFD:</span>
                <span className="text-white">{stats.max.toFixed(0)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg PPFD:</span>
                <span className="text-white">{stats.avg.toFixed(0)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uniformity:</span>
                <span className="text-white">{(stats.uniformity * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={exportImage}
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Image
          </button>
        </div>

        {/* Visualization Area */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg p-4 h-full">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
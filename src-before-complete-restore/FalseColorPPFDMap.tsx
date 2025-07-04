'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Download, Palette, Info, Grid } from 'lucide-react';

interface PPFDMapProps {
  width: number;
  height: number;
  ppfdData: number[][];
  showGrid?: boolean;
  colorScale?: 'viridis' | 'heat' | 'turbo' | 'grayscale' | 'plasma';
  minPPFD?: number;
  maxPPFD?: number;
  targetPPFD?: number;
  showContours?: boolean;
  showLabels?: boolean;
  resolution?: number;
  opacity?: number;
}

export function FalseColorPPFDMap({
  width,
  height,
  ppfdData,
  showGrid = true,
  colorScale = 'turbo',
  minPPFD = 0,
  maxPPFD = 1000,
  targetPPFD = 600,
  showContours = true,
  showLabels = true,
  resolution = 50,
  opacity = 1
}: PPFDMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);

  // Color scale functions
  const getColor = (value: number, scale: string): string => {
    const normalized = (value - minPPFD) / (maxPPFD - minPPFD);
    const clamped = Math.max(0, Math.min(1, normalized));

    switch (scale) {
      case 'viridis':
        return getViridisColor(clamped);
      case 'heat':
        return getHeatColor(clamped);
      case 'turbo':
        return getTurboColor(clamped);
      case 'grayscale':
        return getGrayscaleColor(clamped);
      case 'plasma':
        return getPlasmaColor(clamped);
      default:
        return getTurboColor(clamped);
    }
  };

  const getViridisColor = (t: number): string => {
    const r = Math.floor(68 + t * (59 - 68) + t * t * (223 - 59));
    const g = Math.floor(1 + t * (104 - 1) + t * t * (168 - 104));
    const b = Math.floor(84 + t * (139 - 84) + t * t * (55 - 139));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getHeatColor = (t: number): string => {
    if (t < 0.33) {
      const r = Math.floor(t * 3 * 255);
      return `rgb(${r}, 0, 0)`;
    } else if (t < 0.66) {
      const g = Math.floor((t - 0.33) * 3 * 255);
      return `rgb(255, ${g}, 0)`;
    } else {
      const b = Math.floor((t - 0.66) * 3 * 255);
      return `rgb(255, 255, ${b})`;
    }
  };

  const getTurboColor = (t: number): string => {
    // Turbo colormap approximation
    let r, g, b;
    if (t < 0.2) {
      r = 48 + t * 5 * 107;
      g = 18 + t * 5 * 220;
      b = 59 + t * 5 * 106;
    } else if (t < 0.4) {
      r = 155 + (t - 0.2) * 5 * 100;
      g = 238 - (t - 0.2) * 5 * 80;
      b = 165 - (t - 0.2) * 5 * 100;
    } else if (t < 0.6) {
      r = 255;
      g = 158 - (t - 0.4) * 5 * 100;
      b = 65 - (t - 0.4) * 5 * 60;
    } else if (t < 0.8) {
      r = 255 - (t - 0.6) * 5 * 50;
      g = 58 + (t - 0.6) * 5 * 100;
      b = 5 + (t - 0.6) * 5 * 50;
    } else {
      r = 205 - (t - 0.8) * 5 * 80;
      g = 158 + (t - 0.8) * 5 * 80;
      b = 55 + (t - 0.8) * 5 * 100;
    }
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  };

  const getGrayscaleColor = (t: number): string => {
    const value = Math.floor(t * 255);
    return `rgb(${value}, ${value}, ${value})`;
  };

  const getPlasmaColor = (t: number): string => {
    const r = Math.floor(13 + t * (240 - 13));
    const g = Math.floor(8 + t * (124 - 8) + t * t * (67 - 124));
    const b = Math.floor(135 + t * (132 - 135) + t * t * (19 - 132));
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Draw the PPFD map
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ppfdData || ppfdData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate cell size
    const cellWidth = canvas.width / ppfdData[0].length;
    const cellHeight = canvas.height / ppfdData.length;

    // Draw PPFD values
    for (let row = 0; row < ppfdData.length; row++) {
      for (let col = 0; col < ppfdData[row].length; col++) {
        const value = ppfdData[row][col];
        const color = getColor(value, colorScale);
        
        ctx.fillStyle = color;
        ctx.fillRect(
          col * cellWidth,
          row * cellHeight,
          cellWidth,
          cellHeight
        );
      }
    }

    // Draw contour lines
    if (showContours) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      const contourLevels = [200, 400, 600, 800, 1000];
      contourLevels.forEach(level => {
        if (level >= minPPFD && level <= maxPPFD) {
          drawContourLine(ctx, ppfdData, level, cellWidth, cellHeight);
        }
      });
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x <= canvas.width; x += cellWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += cellHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw labels
    if (showLabels) {
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let row = 0; row < ppfdData.length; row += 5) {
        for (let col = 0; col < ppfdData[row].length; col += 5) {
          const value = ppfdData[row][col];
          const x = col * cellWidth + cellWidth / 2;
          const y = row * cellHeight + cellHeight / 2;
          
          // Determine text color based on background
          const brightness = value / maxPPFD;
          ctx.fillStyle = brightness > 0.5 ? '#000' : '#fff';
          
          ctx.fillText(value.toFixed(0), x, y);
        }
      }
    }
  };

  // Simple contour line drawing
  const drawContourLine = (
    ctx: CanvasRenderingContext2D,
    data: number[][],
    level: number,
    cellW: number,
    cellH: number
  ) => {
    ctx.beginPath();
    
    for (let row = 1; row < data.length; row++) {
      for (let col = 1; col < data[row].length; col++) {
        const a = data[row - 1][col - 1];
        const b = data[row - 1][col];
        const c = data[row][col - 1];
        const d = data[row][col];
        
        // Check if contour line passes through this cell
        const crosses = [
          (a < level && b >= level) || (a >= level && b < level),
          (b < level && d >= level) || (b >= level && d < level),
          (d < level && c >= level) || (d >= level && c < level),
          (c < level && a >= level) || (c >= level && a < level)
        ];
        
        if (crosses.some(c => c)) {
          // Simple line through center of cell
          ctx.moveTo(col * cellW, row * cellH);
          ctx.lineTo(col * cellW + cellW / 2, row * cellH + cellH / 2);
        }
      }
    }
    
    ctx.stroke();
  };

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !ppfdData || ppfdData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / (canvas.width / ppfdData[0].length));
    const row = Math.floor(y / (canvas.height / ppfdData.length));

    if (row >= 0 && row < ppfdData.length && col >= 0 && col < ppfdData[row].length) {
      setHoveredValue(ppfdData[row][col]);
      setHoveredPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredValue(null);
    setHoveredPosition(null);
  };

  // Export as image
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'ppfd-map.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    drawMap();
  }, [ppfdData, colorScale, showGrid, showContours, showLabels]);

  return (
    <div className="relative">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">PPFD Distribution Map</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Toggle grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => {}}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Change color scale"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={exportImage}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Export image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full"
          style={{ opacity }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Hover tooltip */}
        {hoveredValue !== null && hoveredPosition && (
          <div
            className="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm pointer-events-none z-10"
            style={{
              left: hoveredPosition.x + 10,
              top: hoveredPosition.y - 30
            }}
          >
            {hoveredValue.toFixed(0)} μmol/m²/s
          </div>
        )}
      </div>

      {/* Color scale legend */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{minPPFD} μmol/m²/s</span>
          <span>Target: {targetPPFD} μmol/m²/s</span>
          <span>{maxPPFD} μmol/m²/s</span>
        </div>
        <div className="h-6 rounded" style={{
          background: `linear-gradient(to right, ${
            Array.from({ length: 100 }, (_, i) => getColor(minPPFD + (maxPPFD - minPPFD) * i / 100, colorScale)).join(', ')
          })`
        }} />
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg flex items-start gap-2">
        <Info className="w-4 h-4 text-purple-400 mt-0.5" />
        <div className="text-sm text-gray-400">
          <p>False color visualization shows PPFD (Photosynthetic Photon Flux Density) distribution across the growing area.</p>
          <p className="mt-1">Higher values appear in warmer colors. Contour lines show equal PPFD levels.</p>
        </div>
      </div>
    </div>
  );
}
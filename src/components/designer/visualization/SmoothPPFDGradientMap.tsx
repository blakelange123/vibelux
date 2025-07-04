'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { Sun, Activity, Eye, Download, Palette, Grid3x3 } from 'lucide-react';

interface SmoothPPFDGradientMapProps {
  width?: number;
  height?: number;
  showControls?: boolean;
  className?: string;
}

export function SmoothPPFDGradientMap({ 
  width = 800, 
  height = 600, 
  showControls = true,
  className = ''
}: SmoothPPFDGradientMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useDesigner();
  const [gradientStyle, setGradientStyle] = useState<'apple-health' | 'heat' | 'spectrum' | 'contour'>('apple-health');
  const [showGrid, setShowGrid] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  // Apple Health-inspired color gradients
  const gradients = {
    'apple-health': [
      { value: 0, color: { r: 147, g: 51, b: 234 } },    // Purple (low)
      { value: 0.25, color: { r: 59, g: 130, b: 246 } }, // Blue
      { value: 0.5, color: { r: 34, g: 197, b: 94 } },   // Green (optimal)
      { value: 0.75, color: { r: 251, g: 191, b: 36 } }, // Yellow
      { value: 1, color: { r: 239, g: 68, b: 68 } }      // Red (high)
    ],
    'heat': [
      { value: 0, color: { r: 0, g: 0, b: 0 } },
      { value: 0.25, color: { r: 0, g: 0, b: 255 } },
      { value: 0.5, color: { r: 0, g: 255, b: 0 } },
      { value: 0.75, color: { r: 255, g: 255, b: 0 } },
      { value: 1, color: { r: 255, g: 0, b: 0 } }
    ],
    'spectrum': [
      { value: 0, color: { r: 75, g: 0, b: 130 } },     // Indigo
      { value: 0.2, color: { r: 0, g: 0, b: 255 } },    // Blue
      { value: 0.4, color: { r: 0, g: 255, b: 0 } },    // Green
      { value: 0.6, color: { r: 255, g: 255, b: 0 } },  // Yellow
      { value: 0.8, color: { r: 255, g: 127, b: 0 } },  // Orange
      { value: 1, color: { r: 255, g: 0, b: 0 } }       // Red
    ],
    'contour': [
      { value: 0, color: { r: 255, g: 255, b: 255 } },
      { value: 0.5, color: { r: 128, g: 128, b: 128 } },
      { value: 1, color: { r: 0, g: 0, b: 0 } }
    ]
  };

  // Calculate PPFD at a given point using inverse square law
  const calculatePPFDAtPoint = (x: number, y: number, z: number = 0): number => {
    if (!state.objects || state.objects.length === 0) return 0;

    let totalPPFD = 0;
    const fixtures = state.objects.filter(obj => obj.type === 'fixture');

    fixtures.forEach(fixture => {
      const ppf = (fixture as any).model?.ppf;
      if (!ppf) return;

      const dx = x - fixture.x;
      const dy = y - fixture.y;
      const dz = z - (fixture.z || state.room.height - 1);
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // Prevent division by zero
      if (distance < 0.1) return;

      // Simple inverse square law with beam angle consideration
      const beamAngle = (fixture as any).model?.beamAngle || 120;
      const angle = Math.atan2(Math.sqrt(dx * dx + dy * dy), Math.abs(dz)) * 180 / Math.PI;
      
      if (angle <= beamAngle / 2) {
        const intensity = ppf / (4 * Math.PI * distance * distance);
        const angleFactor = Math.cos((angle / (beamAngle / 2)) * Math.PI / 2);
        totalPPFD += intensity * angleFactor * 10000; // Convert to µmol/m²/s
      }
    });

    return totalPPFD;
  };

  // Generate smooth gradient data
  const generateGradientData = useMemo(() => {
    const resolution = 50; // Grid resolution for smooth gradients
    const data: number[][] = [];
    let maxPPFD = 0;

    for (let y = 0; y < resolution; y++) {
      data[y] = [];
      for (let x = 0; x < resolution; x++) {
        const worldX = (x / resolution) * state.room.length;
        const worldY = (y / resolution) * state.room.width;
        const ppfd = calculatePPFDAtPoint(worldX, worldY, state.room.workingHeight || 3);
        data[y][x] = ppfd;
        maxPPFD = Math.max(maxPPFD, ppfd);
      }
    }

    return { data, maxPPFD, resolution };
  }, [state.objects, state.room]);

  // Interpolate color based on gradient
  const interpolateColor = (value: number, gradient: typeof gradients['apple-health']) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    
    // Find the two colors to interpolate between
    let lowerBound = gradient[0];
    let upperBound = gradient[gradient.length - 1];
    
    for (let i = 0; i < gradient.length - 1; i++) {
      if (clampedValue >= gradient[i].value && clampedValue <= gradient[i + 1].value) {
        lowerBound = gradient[i];
        upperBound = gradient[i + 1];
        break;
      }
    }
    
    // Interpolate between colors
    const t = (clampedValue - lowerBound.value) / (upperBound.value - lowerBound.value);
    const r = Math.round(lowerBound.color.r + (upperBound.color.r - lowerBound.color.r) * t);
    const g = Math.round(lowerBound.color.g + (upperBound.color.g - lowerBound.color.g) * t);
    const b = Math.round(lowerBound.color.b + (upperBound.color.b - lowerBound.color.b) * t);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Bicubic interpolation for ultra-smooth gradients
  const bicubicInterpolate = (data: number[][], x: number, y: number): number => {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, data[0].length - 1);
    const y2 = Math.min(y1 + 1, data.length - 1);
    
    const fx = x - x1;
    const fy = y - y1;
    
    // Cubic interpolation function
    const cubic = (t: number) => {
      const a = -0.5;
      const t2 = t * t;
      const t3 = t2 * t;
      if (t < 1) {
        return (a + 2) * t3 - (a + 3) * t2 + 1;
      } else if (t < 2) {
        return a * t3 - 5 * a * t2 + 8 * a * t - 4 * a;
      }
      return 0;
    };
    
    // Get 4x4 neighborhood
    const values: number[][] = [];
    for (let j = -1; j <= 2; j++) {
      values[j + 1] = [];
      for (let i = -1; i <= 2; i++) {
        const xi = Math.max(0, Math.min(x1 + i, data[0].length - 1));
        const yi = Math.max(0, Math.min(y1 + j, data.length - 1));
        values[j + 1][i + 1] = data[yi][xi];
      }
    }
    
    // Interpolate in x direction
    const xInterpolated: number[] = [];
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let i = 0; i < 4; i++) {
        sum += values[j][i] * cubic(Math.abs(fx - (i - 1)));
      }
      xInterpolated[j] = sum;
    }
    
    // Interpolate in y direction
    let result = 0;
    for (let j = 0; j < 4; j++) {
      result += xInterpolated[j] * cubic(Math.abs(fy - (j - 1)));
    }
    
    return Math.max(0, result);
  };

  // Draw the gradient map
  const drawGradientMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { data, maxPPFD, resolution } = generateGradientData;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create smooth gradient using bicubic interpolation
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dataX = (x / width) * (resolution - 1);
        const dataY = (y / height) * (resolution - 1);
        
        // Use bicubic interpolation for smooth gradients
        const ppfd = bicubicInterpolate(data, dataX, dataY);
        const normalizedValue = ppfd / (maxPPFD || 1000);
        
        // Apply gradient
        const color = interpolateColor(normalizedValue, gradients[gradientStyle]);
        const rgb = color.match(/\d+/g);
        if (rgb) {
          const index = (y * width + x) * 4;
          pixels[index] = parseInt(rgb[0]);     // R
          pixels[index + 1] = parseInt(rgb[1]); // G
          pixels[index + 2] = parseInt(rgb[2]); // B
          pixels[index + 3] = 200;              // A (slightly transparent)
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Apply smooth blur for Apple Health-like effect
    if (gradientStyle === 'apple-health' && animationEnabled) {
      ctx.filter = 'blur(8px)';
      ctx.drawImage(canvas, 0, 0, width, height);
      ctx.filter = 'none';
      
      // Add subtle glow effect
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.1;
      ctx.drawImage(canvas, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    
    // Draw grid overlay
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      const gridSize = 10;
      for (let i = 0; i <= gridSize; i++) {
        const x = (i / gridSize) * width;
        const y = (i / gridSize) * height;
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    
    // Draw contour lines for better visualization
    if (gradientStyle === 'contour' || gradientStyle === 'apple-health') {
      const contourLevels = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      ctx.strokeStyle = gradientStyle === 'apple-health' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = gradientStyle === 'apple-health' ? 2 : 1;
      
      contourLevels.forEach(level => {
        const normalizedLevel = level / (maxPPFD || 1000);
        if (normalizedLevel > 1) return;
        
        // Simple contour line drawing (would be more complex in production)
        ctx.beginPath();
        for (let x = 0; x < width; x += 5) {
          for (let y = 0; y < height; y += 5) {
            const dataX = (x / width) * (resolution - 1);
            const dataY = (y / height) * (resolution - 1);
            const ppfd = bicubicInterpolate(data, dataX, dataY);
            
            if (Math.abs(ppfd - level) < 20) {
              ctx.moveTo(x, y);
              ctx.arc(x, y, 1, 0, Math.PI * 2);
            }
          }
        }
        ctx.stroke();
      });
    }
  };

  // Animation loop for smooth transitions
  const animate = () => {
    if (!animationEnabled) return;
    
    timeRef.current += 0.016; // 60 FPS
    drawGradientMap();
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    drawGradientMap();
    
    if (animationEnabled) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [generateGradientData, gradientStyle, showGrid, animationEnabled]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `ppfd-gradient-${gradientStyle}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl shadow-2xl"
        style={{
          background: gradientStyle === 'apple-health' 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%)' 
            : '#000'
        }}
      />
      
      {showControls && (
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            <select
              value={gradientStyle}
              onChange={(e) => setGradientStyle(e.target.value as any)}
              className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1"
            >
              <option value="apple-health">Apple Health</option>
              <option value="heat">Heat Map</option>
              <option value="spectrum">Spectrum</option>
              <option value="contour">Contour</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <Grid3x3 className="w-4 h-4" />
            Show Grid
          </label>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={animationEnabled}
              onChange={(e) => setAnimationEnabled(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <Activity className="w-4 h-4" />
            Animate
          </label>
          
          <button
            onClick={downloadImage}
            className="w-full px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Sun className="w-4 h-4 text-yellow-500" />
          <div className="text-xs">
            <div className="font-semibold">PPFD Scale</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 h-2 rounded-full" style={{
                background: `linear-gradient(to right, ${
                  gradientStyle === 'apple-health' 
                    ? '#9333ea, #3b82f6, #22c55e, #fbbf24, #ef4444'
                    : gradientStyle === 'heat'
                    ? '#000, #00f, #0f0, #ff0, #f00'
                    : gradientStyle === 'spectrum'
                    ? '#4b0082, #00f, #0f0, #ff0, #f00'
                    : '#fff, #808080, #000'
                })`
              }} />
              <span className="text-gray-600 dark:text-gray-400">0-1000 µmol/m²/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
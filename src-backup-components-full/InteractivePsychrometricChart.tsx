'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Activity, ZoomIn, ZoomOut, RotateCcw, Download, Info } from 'lucide-react';

interface PsychrometricPoint {
  dryBulbTemp: number;
  relativeHumidity: number;
  absoluteHumidity: number;
  wetBulbTemp: number;
  dewPoint: number;
  vaporPressureDeficit: number;
  enthalpy: number;
}

interface PsychrometricChartProps {
  currentPoint: PsychrometricPoint;
  cropType: 'leafy' | 'fruiting' | 'herbs' | 'ornamental';
  width?: number;
  height?: number;
  showComfortZones?: boolean;
  showGridLines?: boolean;
}

interface ComfortZone {
  name: string;
  color: string;
  opacity: number;
  tempRange: [number, number];
  rhRange: [number, number];
  points: Array<[number, number]>; // [temp, rh] pairs for polygon
}

export function InteractivePsychrometricChart({
  currentPoint,
  cropType,
  width = 800,
  height = 600,
  showComfortZones = true,
  showGridLines = true
}: PsychrometricChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, data: any} | null>(null);

  // Define comfort zones for different crop types
  const comfortZones: Record<string, ComfortZone[]> = {
    leafy: [
      {
        name: 'Optimal Zone',
        color: '#10b981',
        opacity: 0.2,
        tempRange: [18, 24],
        rhRange: [50, 70],
        points: [[18, 50], [24, 50], [24, 70], [18, 70]]
      },
      {
        name: 'Acceptable Zone',
        color: '#f59e0b',
        opacity: 0.1,
        tempRange: [16, 28],
        rhRange: [40, 80],
        points: [[16, 40], [28, 40], [28, 80], [16, 80]]
      }
    ],
    fruiting: [
      {
        name: 'Optimal Zone',
        color: '#10b981',
        opacity: 0.2,
        tempRange: [20, 28],
        rhRange: [60, 75],
        points: [[20, 60], [28, 60], [28, 75], [20, 75]]
      },
      {
        name: 'Acceptable Zone',
        color: '#f59e0b',
        opacity: 0.1,
        tempRange: [18, 32],
        rhRange: [50, 85],
        points: [[18, 50], [32, 50], [32, 85], [18, 85]]
      }
    ],
    herbs: [
      {
        name: 'Optimal Zone',
        color: '#10b981',
        opacity: 0.2,
        tempRange: [19, 26],
        rhRange: [55, 70],
        points: [[19, 55], [26, 55], [26, 70], [19, 70]]
      },
      {
        name: 'Acceptable Zone',
        color: '#f59e0b',
        opacity: 0.1,
        tempRange: [16, 30],
        rhRange: [45, 80],
        points: [[16, 45], [30, 45], [30, 80], [16, 80]]
      }
    ],
    ornamental: [
      {
        name: 'Optimal Zone',
        color: '#10b981',
        opacity: 0.2,
        tempRange: [18, 25],
        rhRange: [50, 65],
        points: [[18, 50], [25, 50], [25, 65], [18, 65]]
      },
      {
        name: 'Acceptable Zone',
        color: '#f59e0b',
        opacity: 0.1,
        tempRange: [15, 28],
        rhRange: [40, 75],
        points: [[15, 40], [28, 40], [28, 75], [15, 75]]
      }
    ]
  };

  // Chart boundaries and scales
  const chartBounds = {
    tempMin: -10,
    tempMax: 50,
    rhMin: 0,
    rhMax: 100,
    absoluteHumidityMax: 30 // g/kg
  };

  // Coordinate transformation functions
  const tempToX = (temp: number) => {
    const range = chartBounds.tempMax - chartBounds.tempMin;
    return ((temp - chartBounds.tempMin) / range) * width * scale + offset.x;
  };

  const rhToY = (rh: number) => {
    const range = chartBounds.rhMax - chartBounds.rhMin;
    return height - (((rh - chartBounds.rhMin) / range) * height * scale) + offset.y;
  };

  const xToTemp = (x: number) => {
    const adjustedX = (x - offset.x) / scale;
    const range = chartBounds.tempMax - chartBounds.tempMin;
    return (adjustedX / width) * range + chartBounds.tempMin;
  };

  const yToRh = (y: number) => {
    const adjustedY = (y - offset.y) / scale;
    const range = chartBounds.rhMax - chartBounds.rhMin;
    return chartBounds.rhMax - ((adjustedY / height) * range);
  };

  // Calculate saturation vapor pressure using Magnus formula
  const calculateSaturationPressure = (temp: number): number => {
    return 0.6108 * Math.exp(17.27 * temp / (temp + 237.3));
  };

  // Calculate absolute humidity
  const calculateAbsoluteHumidity = (temp: number, rh: number): number => {
    const vp = calculateSaturationPressure(temp) * (rh / 100);
    return 621.98 * vp / (101.325 - vp);
  };

  // Draw functions
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (!showGridLines) return;

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);

    // Temperature grid lines (vertical)
    for (let temp = chartBounds.tempMin; temp <= chartBounds.tempMax; temp += 5) {
      const x = tempToX(temp);
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Relative humidity grid lines (horizontal)
    for (let rh = chartBounds.rhMin; rh <= chartBounds.rhMax; rh += 10) {
      const y = rhToY(rh);
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    ctx.setLineDash([]);
  };

  const drawConstantHumidityLines = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;

    // Draw constant absolute humidity lines
    for (let absHumidity = 5; absHumidity <= 25; absHumidity += 5) {
      ctx.beginPath();
      let firstPoint = true;

      for (let temp = chartBounds.tempMin; temp <= chartBounds.tempMax; temp += 0.5) {
        const satPressure = calculateSaturationPressure(temp);
        const vaporPressure = (absHumidity * 101.325) / (621.98 + absHumidity);
        const rh = (vaporPressure / satPressure) * 100;

        if (rh >= chartBounds.rhMin && rh <= chartBounds.rhMax) {
          const x = tempToX(temp);
          const y = rhToY(rh);

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }
  };

  const drawConstantWetBulbLines = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Draw constant wet bulb temperature lines
    for (let wetBulb = 0; wetBulb <= 40; wetBulb += 5) {
      ctx.beginPath();
      let firstPoint = true;

      for (let temp = wetBulb; temp <= chartBounds.tempMax; temp += 0.5) {
        // Approximate wet bulb calculation
        const satPressureWet = calculateSaturationPressure(wetBulb);
        const satPressureDry = calculateSaturationPressure(temp);
        const rh = ((satPressureWet - 0.00066 * 101.325 * (temp - wetBulb)) / satPressureDry) * 100;

        if (rh >= chartBounds.rhMin && rh <= chartBounds.rhMax && temp >= chartBounds.tempMin) {
          const x = tempToX(temp);
          const y = rhToY(rh);

          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawComfortZones = (ctx: CanvasRenderingContext2D) => {
    if (!showComfortZones) return;

    const zones = comfortZones[cropType] || [];

    zones.forEach(zone => {
      ctx.fillStyle = zone.color + Math.round(zone.opacity * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      zone.points.forEach((point, index) => {
        const x = tempToX(point[0]);
        const y = rhToY(point[1]);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Add zone label
      const centerX = tempToX((zone.tempRange[0] + zone.tempRange[1]) / 2);
      const centerY = rhToY((zone.rhRange[0] + zone.rhRange[1]) / 2);
      
      ctx.fillStyle = zone.color;
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, centerX, centerY);
    });
  };

  const drawCurrentPoint = (ctx: CanvasRenderingContext2D) => {
    const x = tempToX(currentPoint.dryBulbTemp);
    const y = rhToY(currentPoint.relativeHumidity);

    // Draw point
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw crosshairs
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Add label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Current: ${currentPoint.dryBulbTemp.toFixed(1)}°C, ${currentPoint.relativeHumidity.toFixed(1)}%`, x + 15, y - 10);
  };

  const drawAxes = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#e5e7eb';

    // X-axis (temperature)
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.stroke();

    // Y-axis (relative humidity)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // Temperature labels
    ctx.textAlign = 'center';
    for (let temp = chartBounds.tempMin; temp <= chartBounds.tempMax; temp += 10) {
      const x = tempToX(temp);
      if (x >= 0 && x <= width) {
        ctx.fillText(`${temp}°C`, x, height - 5);
      }
    }

    // Relative humidity labels
    ctx.textAlign = 'right';
    for (let rh = chartBounds.rhMin; rh <= chartBounds.rhMax; rh += 20) {
      const y = rhToY(rh);
      if (y >= 0 && y <= height) {
        ctx.fillText(`${rh}%`, -5, y + 4);
      }
    }

    // Axis titles
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText('Dry Bulb Temperature (°C)', width / 2, height - 25);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Relative Humidity (%)', 0, 0);
    ctx.restore();
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw chart elements in order
    drawGrid(ctx);
    drawConstantHumidityLines(ctx);
    drawConstantWetBulbLines(ctx);
    drawComfortZones(ctx);
    drawCurrentPoint(ctx);
    drawAxes(ctx);
  };

  useEffect(() => {
    drawChart();
  }, [currentPoint, cropType, scale, offset, showComfortZones, showGridLines]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else {
      // Update hover information
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const temp = xToTemp(x);
        const rh = yToRh(y);
        
        if (temp >= chartBounds.tempMin && temp <= chartBounds.tempMax && 
            rh >= chartBounds.rhMin && rh <= chartBounds.rhMax) {
          setHoveredPoint({
            x,
            y,
            data: {
              temperature: temp,
              relativeHumidity: rh,
              absoluteHumidity: calculateAbsoluteHumidity(temp, rh)
            }
          });
        } else {
          setHoveredPoint(null);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * scaleFactor)));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const exportChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `psychrometric-chart-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev * 0.8))}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={exportChart}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Export Chart"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="text-sm text-gray-400">
          Scale: {(scale * 100).toFixed(0)}%
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        
        {/* Hover tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs pointer-events-none z-10"
            style={{
              left: hoveredPoint.x + 10,
              top: hoveredPoint.y - 60,
              transform: hoveredPoint.x > width - 120 ? 'translateX(-100%)' : 'none'
            }}
          >
            <div className="text-white">
              <div>Temp: {hoveredPoint.data.temperature.toFixed(1)}°C</div>
              <div>RH: {hoveredPoint.data.relativeHumidity.toFixed(1)}%</div>
              <div>AH: {hoveredPoint.data.absoluteHumidity.toFixed(1)} g/kg</div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-2">
          <h4 className="font-medium text-white">Chart Elements</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-500"></div>
            <span className="text-gray-400">Constant Absolute Humidity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-purple-400 border-dashed"></div>
            <span className="text-gray-400">Constant Wet Bulb Temp</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-white">Comfort Zones</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 opacity-50 rounded"></div>
            <span className="text-gray-400">Optimal Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 opacity-30 rounded"></div>
            <span className="text-gray-400">Acceptable Zone</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-white">Current Conditions</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-400">Your Environment</span>
          </div>
          <div className="text-gray-400">
            VPD: {currentPoint.vaporPressureDeficit?.toFixed(2)} kPa
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-400 text-xs">
            <strong>How to use:</strong> Drag to pan • Scroll to zoom • Hover for point data • Red point shows your current conditions
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Ruler, X, MousePointer, Square, Circle, Minus, RotateCw } from 'lucide-react';

export interface MeasurementPoint {
  x: number;
  y: number;
}

export interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'perimeter' | 'angle' | 'radius';
  points: MeasurementPoint[];
  value: number;
  unit: string;
  label?: string;
  visible: boolean;
  locked: boolean;
  color: string;
  timestamp: number;
}

interface MeasurementToolProps {
  isActive: boolean;
  measurements: Measurement[];
  onAddMeasurement: (measurement: Measurement) => void;
  onUpdateMeasurement: (id: string, updates: Partial<Measurement>) => void;
  onDeleteMeasurement: (id: string) => void;
  onClose: () => void;
  unitScale?: number; // pixels per unit (e.g., pixels per foot)
  selectedType?: Measurement['type'];
  selectedColor?: string;
  onTypeChange?: (type: Measurement['type']) => void;
  onColorChange?: (color: string) => void;
}

// Static calculation function
export class MeasurementCalculator {
  static calculateMeasurement(type: Measurement['type'], points: MeasurementPoint[], unitScale: number = 1): { value: number; unit: string } {
    switch (type) {
      case 'distance':
        if (points.length >= 2) {
          const dx = points[1].x - points[0].x;
          const dy = points[1].y - points[0].y;
          const distance = Math.sqrt(dx * dx + dy * dy) / unitScale;
          return { value: distance, unit: 'ft' };
        }
        break;
        
      case 'area':
        if (points.length >= 3) {
          // Calculate area using shoelace formula
          let area = 0;
          for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
          }
          area = Math.abs(area) / 2 / (unitScale * unitScale);
          return { value: area, unit: 'ft²' };
        }
        break;
        
      case 'perimeter':
        if (points.length >= 2) {
          let perimeter = 0;
          for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            const dx = points[j].x - points[i].x;
            const dy = points[j].y - points[i].y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
          }
          perimeter /= unitScale;
          return { value: perimeter, unit: 'ft' };
        }
        break;
        
      case 'angle':
        if (points.length >= 3) {
          // Calculate angle between three points
          const dx1 = points[0].x - points[1].x;
          const dy1 = points[0].y - points[1].y;
          const dx2 = points[2].x - points[1].x;
          const dy2 = points[2].y - points[1].y;
          
          const angle1 = Math.atan2(dy1, dx1);
          const angle2 = Math.atan2(dy2, dx2);
          let angle = (angle2 - angle1) * 180 / Math.PI;
          
          // Normalize to 0-360
          if (angle < 0) angle += 360;
          if (angle > 180) angle = 360 - angle;
          
          return { value: angle, unit: '°' };
        }
        break;
        
      case 'radius':
        if (points.length >= 2) {
          const dx = points[1].x - points[0].x;
          const dy = points[1].y - points[0].y;
          const radius = Math.sqrt(dx * dx + dy * dy) / unitScale;
          return { value: radius, unit: 'ft' };
        }
        break;
    }
    
    return { value: 0, unit: '' };
  }
}

export function MeasurementTool({
  isActive,
  measurements,
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onClose,
  unitScale = 1,
  selectedType: propSelectedType,
  selectedColor: propSelectedColor,
  onTypeChange,
  onColorChange
}: MeasurementToolProps) {
  const [selectedType, setSelectedType] = useState<Measurement['type']>(propSelectedType || 'distance');
  const [selectedColor, setSelectedColor] = useState(propSelectedColor || '#fbbf24');
  const [showAll, setShowAll] = useState(true);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  
  const measurementTypes = [
    { id: 'distance', label: 'Distance', icon: Ruler, shortcut: 'D' },
    { id: 'area', label: 'Area', icon: Square, shortcut: 'A' },
    { id: 'perimeter', label: 'Perimeter', icon: Square, shortcut: 'P' },
    { id: 'angle', label: 'Angle', icon: RotateCw, shortcut: 'G' },
    { id: 'radius', label: 'Radius', icon: Circle, shortcut: 'R' }
  ];
  
  const colors = [
    '#fbbf24', // yellow
    '#f87171', // red
    '#60a5fa', // blue
    '#34d399', // green
    '#a78bfa', // purple
    '#f472b6', // pink
    '#fde047', // bright yellow
    '#94a3b8'  // gray
  ];
  
  // Calculate measurement value based on type
  const calculateMeasurement = useCallback((type: Measurement['type'], points: MeasurementPoint[]): { value: number; unit: string } => {
    return MeasurementCalculator.calculateMeasurement(type, points, unitScale);
  }, [unitScale]);
  
  // Format measurement value for display
  const formatValue = (value: number, unit: string): string => {
    if (unit === '°') {
      return `${value.toFixed(1)}°`;
    } else if (unit === 'ft²') {
      return `${value.toFixed(2)} ft²`;
    } else {
      return `${value.toFixed(2)} ft`;
    }
  };
  
  // Toggle all measurements visibility
  const toggleAllVisibility = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
    measurements.forEach(m => {
      onUpdateMeasurement(m.id, { visible: newShowAll });
    });
  };
  
  // Delete all measurements
  const deleteAll = () => {
    if (confirm('Delete all measurements?')) {
      measurements.forEach(m => onDeleteMeasurement(m.id));
    }
  };
  
  // Export measurements
  const exportMeasurements = () => {
    const data = measurements.map(m => ({
      type: m.type,
      value: formatValue(m.value, m.unit),
      label: m.label,
      points: m.points,
      timestamp: new Date(m.timestamp).toISOString()
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurements_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (!isActive) return null;
  
  return (
    <div className="absolute top-4 left-4 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-20">
      <div className="p-4" style={{ width: '320px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Ruler className="w-5 h-5 text-yellow-400" />
            Measurement Tools
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        {/* Tool Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {measurementTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  const newType = type.id as Measurement['type'];
                  setSelectedType(newType);
                  onTypeChange?.(newType);
                }}
                className={`
                  p-2 rounded flex items-center gap-2 text-sm font-medium transition-all
                  ${selectedType === type.id 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
                title={`${type.label} (${type.shortcut})`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>
        
        {/* Color Selection */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-2">Color</label>
          <div className="flex gap-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  onColorChange?.(color);
                }}
                className={`
                  w-8 h-8 rounded transition-all
                  ${selectedColor === color ? 'ring-2 ring-white' : 'hover:scale-110'}
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-gray-900/50 rounded p-3 mb-4">
          <p className="text-xs text-gray-400">
            {selectedType === 'distance' && 'Click two points to measure distance'}
            {selectedType === 'area' && 'Click points to define area, double-click to close'}
            {selectedType === 'perimeter' && 'Click points to define shape, double-click to close'}
            {selectedType === 'angle' && 'Click three points to measure angle'}
            {selectedType === 'radius' && 'Click center then edge to measure radius'}
          </p>
        </div>
        
        {/* Measurements List */}
        {measurements.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Measurements</h4>
              <div className="flex gap-1">
                <button
                  onClick={toggleAllVisibility}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  title={showAll ? 'Hide all' : 'Show all'}
                >
                  {showAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={exportMeasurements}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteAll}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {measurements.map(m => (
                <div
                  key={m.id}
                  className={`
                    flex items-center justify-between p-2 rounded text-sm cursor-pointer
                    ${selectedMeasurement === m.id ? 'bg-gray-700' : 'hover:bg-gray-700/50'}
                  `}
                  onClick={() => setSelectedMeasurement(m.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className={`${m.visible ? 'text-white' : 'text-gray-500'}`}>
                      {m.label || formatValue(m.value, m.unit)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateMeasurement(m.id, { visible: !m.visible });
                      }}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      {m.visible ? 
                        <Eye className="w-3 h-3 text-gray-400" /> : 
                        <EyeOff className="w-3 h-3 text-gray-500" />
                      }
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMeasurement(m.id);
                      }}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tips */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Tips: Hold Shift to snap to objects • Press Esc to cancel • Double-click to finish polygons
          </p>
        </div>
      </div>
    </div>
  );
}

// Measurement renderer for canvas
export class MeasurementRenderer {
  static drawMeasurement(
    ctx: CanvasRenderingContext2D,
    measurement: Measurement,
    scale: number,
    offsetX: number,
    offsetY: number,
    isActive: boolean = false
  ) {
    if (!measurement.visible) return;
    
    ctx.save();
    
    // Set styles
    ctx.strokeStyle = measurement.color;
    ctx.fillStyle = measurement.color;
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.font = 'bold 12px sans-serif';
    
    const points = measurement.points.map(p => ({
      x: offsetX + p.x * scale,
      y: offsetY + p.y * scale
    }));
    
    switch (measurement.type) {
      case 'distance':
        this.drawDistance(ctx, points, measurement);
        break;
      case 'area':
        this.drawArea(ctx, points, measurement);
        break;
      case 'perimeter':
        this.drawPerimeter(ctx, points, measurement);
        break;
      case 'angle':
        this.drawAngle(ctx, points, measurement);
        break;
      case 'radius':
        this.drawRadius(ctx, points, measurement);
        break;
    }
    
    ctx.restore();
  }
  
  private static drawDistance(ctx: CanvasRenderingContext2D, points: MeasurementPoint[], measurement: Measurement) {
    if (points.length < 2) return;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    
    // Draw endpoints
    [points[0], points[1]].forEach(p => {
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    });
    
    // Draw label
    const midX = (points[0].x + points[1].x) / 2;
    const midY = (points[0].y + points[1].y) / 2;
    const angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
    
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const label = measurement.label || `${measurement.value.toFixed(2)} ${measurement.unit}`;
    ctx.strokeText(label, 0, -5);
    ctx.fillText(label, 0, -5);
    ctx.restore();
  }
  
  private static drawArea(ctx: CanvasRenderingContext2D, points: MeasurementPoint[], measurement: Measurement) {
    if (points.length < 3) return;
    
    // Draw filled area
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    
    // Draw outline
    ctx.globalAlpha = 1;
    ctx.stroke();
    
    // Draw vertices
    points.forEach(p => {
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    });
    
    // Draw label at centroid
    const centroid = this.calculateCentroid(points);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = measurement.label || `${measurement.value.toFixed(2)} ${measurement.unit}`;
    ctx.strokeText(label, centroid.x, centroid.y);
    ctx.fillText(label, centroid.x, centroid.y);
  }
  
  private static drawPerimeter(ctx: CanvasRenderingContext2D, points: MeasurementPoint[], measurement: Measurement) {
    if (points.length < 2) return;
    
    // Draw outline
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw vertices
    points.forEach(p => {
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    });
    
    // Draw label
    const centroid = this.calculateCentroid(points);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = measurement.label || `${measurement.value.toFixed(2)} ${measurement.unit}`;
    ctx.strokeText(label, centroid.x, centroid.y);
    ctx.fillText(label, centroid.x, centroid.y);
  }
  
  private static drawAngle(ctx: CanvasRenderingContext2D, points: MeasurementPoint[], measurement: Measurement) {
    if (points.length < 3) return;
    
    // Draw lines
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.stroke();
    
    // Draw points
    points.forEach(p => {
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    });
    
    // Draw arc
    const angle1 = Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x);
    const angle2 = Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x);
    const radius = 30;
    
    ctx.beginPath();
    ctx.arc(points[1].x, points[1].y, radius, angle1, angle2);
    ctx.stroke();
    
    // Draw label
    const midAngle = (angle1 + angle2) / 2;
    const labelX = points[1].x + Math.cos(midAngle) * (radius + 15);
    const labelY = points[1].y + Math.sin(midAngle) * (radius + 15);
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = measurement.label || `${measurement.value.toFixed(1)}${measurement.unit}`;
    ctx.strokeText(label, labelX, labelY);
    ctx.fillText(label, labelX, labelY);
  }
  
  private static drawRadius(ctx: CanvasRenderingContext2D, points: MeasurementPoint[], measurement: Measurement) {
    if (points.length < 2) return;
    
    const radius = Math.sqrt(
      Math.pow(points[1].x - points[0].x, 2) + 
      Math.pow(points[1].y - points[0].y, 2)
    );
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw radius line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    
    // Draw points
    points.forEach(p => {
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    });
    
    // Draw label
    const midX = (points[0].x + points[1].x) / 2;
    const midY = (points[0].y + points[1].y) / 2;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = measurement.label || `r = ${measurement.value.toFixed(2)} ${measurement.unit}`;
    ctx.strokeText(label, midX, midY);
    ctx.fillText(label, midX, midY);
  }
  
  private static calculateCentroid(points: MeasurementPoint[]): MeasurementPoint {
    const sum = points.reduce((acc, p) => ({
      x: acc.x + p.x,
      y: acc.y + p.y
    }), { x: 0, y: 0 });
    
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  }
}
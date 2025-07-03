'use client';

import React, { useState, useEffect } from 'react';
import { EquipmentDefinition, EquipmentType } from '@/lib/hmi/equipment-registry';

interface HMIVisualizationProps {
  equipment: EquipmentDefinition[];
  onEquipmentClick?: (equipment: EquipmentDefinition) => void;
  showTelemetry?: boolean;
  view?: '2D' | '3D';
}

// Main HMI visualization component
export function HMIVisualization({ 
  equipment, 
  onEquipmentClick,
  showTelemetry = true,
  view = '2D' // Default to 2D to avoid Three.js issues
}: HMIVisualizationProps) {
  const [is3DSupported, setIs3DSupported] = useState(false);

  useEffect(() => {
    // Check if we're in browser and WebGL is supported
    if (typeof window !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setIs3DSupported(!!gl);
      } catch (e) {
        setIs3DSupported(false);
      }
    }
  }, []);

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {view === '3D' && is3DSupported ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">3D View</div>
            <div className="text-sm text-gray-500">
              3D visualization is being loaded...
            </div>
          </div>
        </div>
      ) : (
        <HMI2DView 
          equipment={equipment}
          onEquipmentClick={onEquipmentClick}
          showTelemetry={showTelemetry}
        />
      )}
    </div>
  );
}

// 2D SVG-based view for reliable visualization
function HMI2DView({ 
  equipment, 
  onEquipmentClick,
  showTelemetry 
}: HMIVisualizationProps) {
  return (
    <svg className="w-full h-full" viewBox="0 0 1920 1080">
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {equipment.map(eq => (
        <Equipment2D
          key={eq.id}
          equipment={eq}
          onClick={() => onEquipmentClick?.(eq)}
          showTelemetry={showTelemetry}
        />
      ))}
    </svg>
  );
}

// 2D equipment component
function Equipment2D({ equipment, onClick, showTelemetry }: any) {
  const isRunning = equipment.controlPoints.find((cp: any) => cp.id === 'power')?.value || false;
  const speed = equipment.controlPoints.find((cp: any) => cp.id === 'speed')?.value || 0;
  
  const renderEquipment = () => {
    // Convert position to screen coordinates (scale and offset)
    const x = (equipment.position?.x || 0) * 50 + 960; // Center around middle
    const y = (equipment.position?.y || 0) * -50 + 540; // Flip Y and center
    
    switch (equipment.type) {
      case EquipmentType.FAN:
      case EquipmentType.EXHAUST_FAN:
        return (
          <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
            <circle r="40" fill={isRunning ? '#4ADE80' : '#6B7280'} stroke="#374151" strokeWidth="2" className="transition-colors duration-300" />
            {/* Fan blades */}
            <g 
              className={isRunning ? 'animate-spin' : ''} 
              style={{ 
                transformOrigin: 'center', 
                animationDuration: `${2 / ((speed / 100) || 1)}s` 
              }}
            >
              {[0, 72, 144, 216, 288].map(angle => (
                <rect
                  key={angle}
                  x="-5"
                  y="-35"
                  width="10"
                  height="30"
                  fill="#374151"
                  transform={`rotate(${angle})`}
                />
              ))}
            </g>
            <text y="-50" textAnchor="middle" className="fill-white text-sm font-medium">
              {equipment.name}
            </text>
            {showTelemetry && equipment.telemetry.length > 0 && (
              <text y="60" textAnchor="middle" className="fill-gray-300 text-xs">
                {equipment.telemetry[0].value.toFixed(1)} {equipment.telemetry[0].unit}
              </text>
            )}
          </g>
        );
        
      case EquipmentType.PUMP:
      case EquipmentType.DOSING_PUMP:
        return (
          <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer">
            <rect x="-30" y="-20" width="60" height="40" fill={isRunning ? '#3B82F6' : '#6B7280'} rx="5" stroke="#374151" strokeWidth="2" />
            <circle cx="0" cy="0" r="15" fill="#1F2937" />
            {isRunning && (
              <circle cx="0" cy="0" r="10" fill="none" stroke="#60A5FA" strokeWidth="2">
                <animate attributeName="r" values="10;15;10" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            <text y="-35" textAnchor="middle" className="fill-white text-sm font-medium">
              {equipment.name}
            </text>
            {showTelemetry && equipment.telemetry.length > 0 && (
              <text y="50" textAnchor="middle" className="fill-gray-300 text-xs">
                {equipment.telemetry[0].value.toFixed(1)} {equipment.telemetry[0].unit}
              </text>
            )}
          </g>
        );
        
      case EquipmentType.TANK:
        const level = equipment.telemetry.find((tp: any) => tp.id === 'level')?.value || 0;
        return (
          <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer">
            <rect x="-40" y="-60" width="80" height="120" fill="#374151" stroke="#6B7280" strokeWidth="2" rx="5" />
            <rect 
              x="-38" 
              y={58 - (level * 1.16)} 
              width="76" 
              height={level * 1.16} 
              fill="#3B82F6"
              opacity="0.8"
            >
              {level > 0 && (
                <animate attributeName="y" values={`${58 - (level * 1.16)};${56 - (level * 1.16)};${58 - (level * 1.16)}`} dur="2s" repeatCount="indefinite" />
              )}
            </rect>
            <text y="-75" textAnchor="middle" className="fill-white text-sm font-medium">
              {equipment.name}
            </text>
            <text y="0" textAnchor="middle" className="fill-white text-xs">
              {level.toFixed(0)}%
            </text>
            {showTelemetry && equipment.telemetry.length > 1 && (
              <text y="80" textAnchor="middle" className="fill-gray-300 text-xs">
                {equipment.telemetry[1].value.toFixed(1)} {equipment.telemetry[1].unit}
              </text>
            )}
          </g>
        );
        
      case EquipmentType.LED_FIXTURE:
        const dimming = equipment.controlPoints.find((cp: any) => cp.id === 'dimming')?.value || 0;
        return (
          <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer">
            <rect x="-60" y="-15" width="120" height="30" fill="#1F2937" stroke="#374151" strokeWidth="2" rx="5" />
            <rect 
              x="-55" 
              y="-10" 
              width="110" 
              height="20" 
              fill={isRunning ? '#FBBF24' : '#374151'}
              opacity={isRunning ? (dimming / 100) : 0.3}
              rx="3"
            />
            <text y="-25" textAnchor="middle" className="fill-white text-sm font-medium">
              {equipment.name}
            </text>
            {showTelemetry && equipment.telemetry.length > 0 && (
              <text y="35" textAnchor="middle" className="fill-gray-300 text-xs">
                {equipment.telemetry[0].value.toFixed(0)} {equipment.telemetry[0].unit}
              </text>
            )}
          </g>
        );

      case EquipmentType.DEHUMIDIFIER:
        return (
          <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer">
            <rect x="-50" y="-30" width="100" height="60" fill={isRunning ? '#8B5CF6' : '#6B7280'} rx="8" stroke="#374151" strokeWidth="2" />
            <rect x="-45" y="-25" width="90" height="50" fill="#1F2937" rx="5" />
            <circle cx="-20" cy="0" r="8" fill={isRunning ? '#60A5FA' : '#374151'} />
            <circle cx="20" cy="0" r="8" fill={isRunning ? '#60A5FA' : '#374151'} />
            {isRunning && (
              <g>
                <circle cx="-20" cy="0" r="5" fill="#3B82F6">
                  <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="20" cy="0" r="5" fill="#3B82F6">
                  <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
            <text y="-45" textAnchor="middle" className="fill-white text-sm font-medium">
              {equipment.name}
            </text>
            {showTelemetry && equipment.telemetry.length > 0 && (
              <text y="50" textAnchor="middle" className="fill-gray-300 text-xs">
                {equipment.telemetry[0].value.toFixed(1)} {equipment.telemetry[0].unit}
              </text>
            )}
          </g>
        );
        
      default:
        return (
          <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer">
            <rect x="-30" y="-30" width="60" height="60" fill="#6B7280" stroke="#374151" strokeWidth="2" rx="5" />
            <text y="-40" textAnchor="middle" className="fill-white text-sm font-medium">
              {equipment.name}
            </text>
            <text y="0" textAnchor="middle" className="fill-gray-300 text-xs">
              {equipment.type}
            </text>
          </g>
        );
    }
  };
  
  return renderEquipment();
}
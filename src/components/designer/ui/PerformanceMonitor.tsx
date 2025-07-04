'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Layers, Eye, EyeOff } from 'lucide-react';

interface PerformanceMonitorProps {
  fps?: number;
  objectCount?: number;
  visibleObjects?: number;
  renderTime?: number;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

export function PerformanceMonitor({
  fps = 0,
  objectCount = 0,
  visibleObjects = 0,
  renderTime = 0,
  showDetails = false,
  onToggleDetails
}: PerformanceMonitorProps) {
  const [avgFps, setAvgFps] = useState(fps);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  
  // Calculate average FPS over last 60 frames
  useEffect(() => {
    setFpsHistory(prev => {
      const newHistory = [...prev, fps].slice(-60);
      const avg = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
      setAvgFps(avg);
      return newHistory;
    });
  }, [fps]);
  
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getPerformanceStatus = () => {
    if (avgFps >= 55) return { text: 'Excellent', color: 'text-green-400' };
    if (avgFps >= 45) return { text: 'Good', color: 'text-blue-400' };
    if (avgFps >= 30) return { text: 'Fair', color: 'text-yellow-400' };
    return { text: 'Poor', color: 'text-red-400' };
  };
  
  const cullingEfficiency = objectCount > 0 
    ? Math.round((1 - visibleObjects / objectCount) * 100)
    : 0;
  
  return (
    <div className="absolute bottom-4 left-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl">
      {/* Compact View */}
      <div className="p-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <div>
            <div className={`text-sm font-mono font-bold ${getFpsColor(fps)}`}>
              {Math.round(fps)} FPS
            </div>
            {showDetails && (
              <div className="text-xs text-gray-500">
                avg: {Math.round(avgFps)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm text-gray-300">
              {visibleObjects}/{objectCount}
            </div>
            {showDetails && (
              <div className="text-xs text-gray-500">
                objects
              </div>
            )}
          </div>
        </div>
        
        {showDetails && (
          <>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-300">
                  {renderTime.toFixed(1)}ms
                </div>
                <div className="text-xs text-gray-500">
                  render
                </div>
              </div>
            </div>
            
            <div className="border-l border-gray-700 pl-4">
              <div className={`text-xs font-medium ${getPerformanceStatus().color}`}>
                {getPerformanceStatus().text}
              </div>
              <div className="text-xs text-gray-500">
                {cullingEfficiency}% culled
              </div>
            </div>
          </>
        )}
        
        <button
          onClick={onToggleDetails}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title={showDetails ? 'Hide details' : 'Show details'}
        >
          {showDetails ? (
            <EyeOff className="w-4 h-4 text-gray-400" />
          ) : (
            <Eye className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      
      {/* Performance Tips */}
      {showDetails && avgFps < 45 && (
        <div className="border-t border-gray-700 p-3">
          <div className="text-xs text-yellow-400 font-medium mb-1">Performance Tips:</div>
          <ul className="text-xs text-gray-400 space-y-1">
            {objectCount > 1000 && (
              <li>• High object count detected - consider hiding unused layers</li>
            )}
            {cullingEfficiency < 50 && objectCount > 100 && (
              <li>• Zoom in to reduce visible objects</li>
            )}
            {renderTime > 16 && (
              <li>• Complex scene - disable grid or visual effects</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
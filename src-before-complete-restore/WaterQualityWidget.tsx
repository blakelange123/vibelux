'use client';

import React from 'react';
import {
  Droplets,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity
} from 'lucide-react';

interface WaterQualityWidgetProps {
  ph?: number;
  ec?: number;
  temperature?: number;
  compact?: boolean;
  onAnalyzeClick?: () => void;
}

export function WaterQualityWidget({ 
  ph = 6.5, 
  ec = 0.5, 
  temperature = 20,
  compact = false,
  onAnalyzeClick 
}: WaterQualityWidgetProps) {
  
  // Simple quality assessment
  const getPhStatus = (value: number) => {
    if (value < 5.5 || value > 7.5) return { color: 'text-red-400', status: 'Poor', icon: AlertCircle };
    if (value < 6.0 || value > 7.0) return { color: 'text-yellow-400', status: 'Fair', icon: AlertCircle };
    return { color: 'text-green-400', status: 'Good', icon: CheckCircle };
  };

  const getEcStatus = (value: number) => {
    if (value > 1.0) return { color: 'text-red-400', status: 'High', icon: AlertCircle };
    if (value > 0.7) return { color: 'text-yellow-400', status: 'Medium', icon: AlertCircle };
    return { color: 'text-green-400', status: 'Low', icon: CheckCircle };
  };

  const phStatus = getPhStatus(ph);
  const ecStatus = getEcStatus(ec);
  const overallGood = phStatus.status === 'Good' && ecStatus.status === 'Low';

  if (compact) {
    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-1">
            <Droplets className="w-4 h-4 text-blue-400" />
            Water Quality
          </h4>
          {overallGood ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">pH:</span>
            <span className={`ml-1 font-medium ${phStatus.color}`}>{ph}</span>
          </div>
          <div>
            <span className="text-gray-500">EC:</span>
            <span className={`ml-1 font-medium ${ecStatus.color}`}>{ec}</span>
          </div>
        </div>
        {onAnalyzeClick && (
          <button
            onClick={onAnalyzeClick}
            className="mt-2 w-full text-xs text-purple-400 hover:text-purple-300"
          >
            Full Analysis →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/20 rounded-lg">
            <Droplets className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Water Quality</h3>
            <p className="text-sm text-gray-400">Current readings</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          overallGood ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'
        }`}>
          {overallGood ? 'Optimal' : 'Needs Attention'}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">pH Level</span>
            <phStatus.icon className={`w-4 h-4 ${phStatus.color}`} />
          </div>
          <p className={`text-2xl font-bold ${phStatus.color}`}>{ph}</p>
          <p className="text-xs text-gray-500 mt-1">{phStatus.status}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">EC</span>
            <ecStatus.icon className={`w-4 h-4 ${ecStatus.color}`} />
          </div>
          <p className={`text-2xl font-bold ${ecStatus.color}`}>{ec}</p>
          <p className="text-xs text-gray-500 mt-1">{ecStatus.status} Salts</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Temp</span>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-white">{temperature}°C</p>
          <p className="text-xs text-gray-500 mt-1">Normal</p>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="space-y-2 mb-4">
        {ph < 6.0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-300">pH Too Low</p>
              <p className="text-xs text-gray-400">Add pH up solution to raise to 6.0-6.5</p>
            </div>
          </div>
        )}
        {ph > 7.0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-300">pH Too High</p>
              <p className="text-xs text-gray-400">Use pH down to lower to 6.0-6.5</p>
            </div>
          </div>
        )}
        {ec > 0.7 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-300">High Salt Content</p>
              <p className="text-xs text-gray-400">Consider diluting with RO water or reducing fertilizer</p>
            </div>
          </div>
        )}
        {overallGood && (
          <div className="flex items-start gap-2 p-3 bg-green-900/20 rounded-lg border border-green-600/30">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-300">Water Quality Good</p>
              <p className="text-xs text-gray-400">Your water is in the optimal range for most crops</p>
            </div>
          </div>
        )}
      </div>

      {/* Visual pH Scale */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Acidic</span>
          <span>pH Scale</span>
          <span>Alkaline</span>
        </div>
        <div className="relative h-3 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full">
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-lg"
            style={{ left: `${((ph - 4) / 10) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>4</span>
          <span>7</span>
          <span>10</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onAnalyzeClick && (
          <button
            onClick={onAnalyzeClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Full Analysis
          </button>
        )}
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
          <Info className="w-4 h-4" />
          Learn More
        </button>
      </div>
    </div>
  );
}
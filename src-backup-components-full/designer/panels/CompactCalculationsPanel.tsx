'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Target, 
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface CalculationResults {
  averagePPFD: number;
  uniformity: number;
  dli: number;
  energyDensity: number;
  efficacy: number;
  totalFixtures: number;
  totalWattage: number;
  compliance: {
    status: 'pass' | 'warning' | 'fail';
    standard: string;
    message: string;
  };
}

interface CompactCalculationsPanelProps {
  results?: CalculationResults;
  isCalculating?: boolean;
  onCalculate?: () => void;
  onExport?: () => void;
  onViewDetails?: () => void;
}

const mockResults: CalculationResults = {
  averagePPFD: 587,
  uniformity: 0.85,
  dli: 50.7,
  energyDensity: 1.2,
  efficacy: 2.8,
  totalFixtures: 24,
  totalWattage: 4800,
  compliance: {
    status: 'pass',
    standard: 'Cannabis PPFD Requirements',
    message: 'All requirements met'
  }
};

export function CompactCalculationsPanel({ 
  results = mockResults, 
  isCalculating = false,
  onCalculate,
  onExport,
  onViewDetails
}: CompactCalculationsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['metrics', 'compliance']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getComplianceIcon = () => {
    switch (results.compliance.status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'fail': return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const getComplianceColor = () => {
    switch (results.compliance.status) {
      case 'pass': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'fail': return 'text-red-400';
    }
  };

  const metrics = [
    {
      id: 'ppfd',
      label: 'Avg PPFD',
      value: results.averagePPFD,
      unit: 'µmol/m²/s',
      icon: Target,
      color: 'text-purple-400',
      format: (val: number) => val.toFixed(0)
    },
    {
      id: 'uniformity',
      label: 'Uniformity',
      value: results.uniformity,
      unit: '',
      icon: BarChart3,
      color: 'text-blue-400',
      format: (val: number) => `${(val * 100).toFixed(0)}%`
    },
    {
      id: 'dli',
      label: 'DLI',
      value: results.dli,
      unit: 'mol/m²/d',
      icon: TrendingUp,
      color: results.dli >= 40 ? 'text-purple-400' : results.dli >= 30 ? 'text-blue-400' : results.dli >= 20 ? 'text-green-400' : 'text-yellow-400',
      format: (val: number) => val.toFixed(1)
    },
    {
      id: 'energy',
      label: 'Energy Density',
      value: results.energyDensity,
      unit: 'W/sq ft',
      icon: Zap,
      color: 'text-yellow-400',
      format: (val: number) => val.toFixed(1)
    }
  ];

  const systemInfo = [
    { label: 'Total Fixtures', value: results.totalFixtures },
    { label: 'Total Wattage', value: `${results.totalWattage}W` },
    { label: 'Efficacy', value: `${results.efficacy.toFixed(1)} µmol/J` }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Calculations</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onCalculate}
              disabled={isCalculating}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              title="Recalculate"
            >
              <RefreshCw className={`w-3 h-3 ${isCalculating ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onExport}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Export Results"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={onViewDetails}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {/* Removed timestamp to avoid hydration mismatch */}
          Ready
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Key Metrics */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('metrics')}
            className="w-full p-2 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-white">Key Metrics</span>
            {expandedSections.includes('metrics') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.includes('metrics') && (
            <div className="p-2 space-y-2 bg-gray-800/50">
              {metrics.map(metric => {
                const Icon = metric.icon;
                return (
                  <div key={metric.id} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${metric.color}`} />
                      <span className="text-xs text-gray-300">{metric.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {metric.format(metric.value)}
                      </div>
                      {metric.unit && (
                        <div className="text-xs text-gray-500">{metric.unit}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('system')}
            className="w-full p-2 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-white">System Info</span>
            {expandedSections.includes('system') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.includes('system') && (
            <div className="p-2 space-y-1 bg-gray-800/50">
              {systemInfo.map((info, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-400">{info.label}</span>
                  <span className="text-white font-medium">{info.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('compliance')}
            className="w-full p-2 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Compliance</span>
              {getComplianceIcon()}
            </div>
            {expandedSections.includes('compliance') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.includes('compliance') && (
            <div className="p-2 bg-gray-800/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Status</span>
                  <span className={`text-xs font-medium ${getComplianceColor()}`}>
                    {results.compliance.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-300">
                  <div className="font-medium mb-1">{results.compliance.standard}</div>
                  <div className="text-gray-500">{results.compliance.message}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onCalculate}
            disabled={isCalculating}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors font-medium"
          >
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>
          <button
            onClick={onViewDetails}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors"
          >
            Full Report
          </button>
        </div>
      </div>
    </div>
  );
}
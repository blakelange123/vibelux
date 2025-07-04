'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  Info,
  Settings,
  Download,
  FileText,
  Globe,
  Building,
  Zap,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { StandardsEngine, type ComplianceResult, type ProjectData, type ComplianceStandard } from './StandardsEngine';

export function StandardsCompliancePanel() {
  const [engine] = useState(() => new StandardsEngine());
  const [availableStandards, setAvailableStandards] = useState<ComplianceStandard[]>([]);
  const [selectedStandards, setSelectedStandards] = useState<string[]>(['ies-rp1', 'ashrae-901']);
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [projectData, setProjectData] = useState<ProjectData>({
    type: 'office',
    area: 1000,
    ceilingHeight: 9,
    workingPlaneHeight: 2.5,
    occupancyType: 'general-office',
    fixtures: [],
    calculations: {
      averageIlluminance: 45.2,
      minIlluminance: 30.1,
      maxIlluminance: 62.8,
      uniformityRatio: 0.67,
      diversityRatio: 2.09,
      cylindricalIlluminance: 12.5,
      luminanceRatio: 3.2,
      glareRating: 18,
      energyDensity: 0.85,
      annualEnergyUse: 3500
    },
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    }
  });

  useEffect(() => {
    const standards = engine.getAvailableStandards();
    setAvailableStandards(standards);
    
    // Run initial compliance analysis
    const results = selectedStandards.map(standardId => 
      engine.evaluateCompliance(standardId, projectData)
    );
    setComplianceResults(results);
  }, [engine, selectedStandards, projectData]);

  const toggleStandardSelection = (standardId: string) => {
    setSelectedStandards(prev => 
      prev.includes(standardId) 
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    );
  };

  const toggleResultExpansion = (standardId: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(standardId)) {
        next.delete(standardId);
      } else {
        next.add(standardId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <X className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-green-500 bg-green-500/10';
      case 'fail':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getJurisdictionIcon = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US':
        return '🇺🇸';
      case 'EU':
        return '🇪🇺';
      case 'International':
        return '🌍';
      case 'Canada':
        return '🇨🇦';
      case 'Australia':
        return '🇦🇺';
      default:
        return '🌐';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
      case 'workplace':
        return <Building className="w-4 h-4" />;
      case 'emergency':
        return <Shield className="w-4 h-4" />;
      case 'energy':
        return <Zap className="w-4 h-4" />;
      case 'outdoor':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const exportComplianceReport = () => {
    const report = {
      projectInfo: projectData,
      standards: selectedStandards,
      results: complianceResults,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const overallComplianceStatus = complianceResults.length > 0 
    ? complianceResults.every(r => r.overallStatus === 'pass') 
      ? 'pass' 
      : complianceResults.some(r => r.overallStatus === 'fail') 
        ? 'fail' 
        : 'warning'
    : 'unknown';

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              Standards Compliance
            </h2>
            <p className="text-gray-400 mt-1">Professional lighting standards verification</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </button>
            <button 
              onClick={exportComplianceReport}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
        
        {/* Overall Status */}
        <div className={`mt-4 p-4 rounded-lg border-2 ${getStatusColor(overallComplianceStatus)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(overallComplianceStatus)}
            <div>
              <div className="font-medium text-white">
                Overall Compliance Status: {overallComplianceStatus.toUpperCase()}
              </div>
              <div className="text-sm text-gray-400">
                {complianceResults.length} standards evaluated • {complianceResults.filter(r => r.overallStatus === 'pass').length} passing
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Standards Selection */}
        <div className="w-80 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Available Standards</h3>
            <p className="text-sm text-gray-400">Select standards to evaluate</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {['general', 'workplace', 'energy', 'emergency', 'outdoor'].map(category => {
              const categoryStandards = availableStandards.filter(s => s.category === category);
              if (categoryStandards.length === 0) return null;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-300 uppercase tracking-wide">
                    {getCategoryIcon(category)}
                    {category}
                  </div>
                  
                  {categoryStandards.map(standard => (
                    <label key={standard.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedStandards.includes(standard.id)}
                        onChange={() => toggleStandardSelection(standard.id)}
                        className="mt-1 text-purple-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{standard.name}</span>
                          <span className="text-xs">{getJurisdictionIcon(standard.jurisdiction)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {standard.version} • {standard.requirements.length} requirements
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance Results */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Compliance Results</h3>
            <p className="text-sm text-gray-400">Detailed evaluation results</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {complianceResults.map(result => {
              const standard = availableStandards.find(s => s.id === result.standardId);
              const isExpanded = expandedResults.has(result.standardId);
              
              return (
                <div key={result.standardId} className={`border-2 rounded-lg ${getStatusColor(result.overallStatus)}`}>
                  <button
                    onClick={() => toggleResultExpansion(result.standardId)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.overallStatus)}
                      <div>
                        <div className="font-medium text-white">{standard?.name}</div>
                        <div className="text-sm text-gray-400">
                          Score: {result.score}% • {result.requirements.filter(r => r.status === 'pass').length}/{result.requirements.length} passing
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-3">
                      <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">
                        {result.summary}
                      </div>
                      
                      {/* Requirements Details */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-white">Requirements</h4>
                        {result.requirements.map(req => (
                          <div key={req.requirementId} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(req.status)}
                              <span className="text-sm text-gray-300">{req.requirementId}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-white">
                                {typeof req.measuredValue === 'number' ? req.measuredValue.toFixed(1) : req.measuredValue}
                              </div>
                              <div className="text-xs text-gray-400">{req.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Recommendations */}
                      {result.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">Recommendations</h4>
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                              <span className="text-sm text-gray-300">{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            {complianceResults.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Standards Selected</h3>
                <p className="text-gray-400">Select standards from the left panel to begin compliance evaluation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
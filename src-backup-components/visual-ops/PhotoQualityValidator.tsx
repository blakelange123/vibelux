'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera, AlertTriangle, CheckCircle, XCircle, Info,
  Sun, Focus, Move, Maximize2, Eye, RotateCw,
  ZoomIn, Grid3x3, Flashlight, AlertCircle
} from 'lucide-react';

interface PhotoQualityValidatorProps {
  photo: string | Blob;
  reportType: string;
  onValidationComplete: (result: ValidationResult) => void;
  guidelines?: string[];
}

interface ValidationResult {
  passed: boolean;
  score: number;
  issues: QualityIssue[];
  suggestions: string[];
  metadata: PhotoMetadata;
}

interface QualityIssue {
  type: 'lighting' | 'focus' | 'framing' | 'resolution' | 'angle' | 'distance';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  impact: string;
}

interface PhotoMetadata {
  resolution: { width: number; height: number };
  fileSize: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  hasFlash: boolean;
}

export default function PhotoQualityValidator({
  photo,
  reportType,
  onValidationComplete,
  guidelines = []
}: PhotoQualityValidatorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    analyzePhoto();
  }, [photo]);

  const analyzePhoto = async () => {
    setIsAnalyzing(true);
    
    // Simulate photo analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation result
    const result: ValidationResult = {
      passed: Math.random() > 0.3, // 70% pass rate
      score: Math.floor(Math.random() * 30) + 70, // 70-100 score
      issues: generateMockIssues(reportType),
      suggestions: generateSuggestions(reportType),
      metadata: {
        resolution: { width: 1920, height: 1080 },
        fileSize: 2.5 * 1024 * 1024, // 2.5MB
        brightness: 0.65,
        contrast: 0.8,
        sharpness: 0.75,
        hasFlash: false
      }
    };
    
    setValidationResult(result);
    setIsAnalyzing(false);
    onValidationComplete(result);
  };

  const generateMockIssues = (type: string): QualityIssue[] => {
    const allIssues: QualityIssue[] = [
      {
        type: 'lighting',
        severity: 'warning',
        description: 'Image appears slightly underexposed',
        impact: 'May affect AI detection accuracy'
      },
      {
        type: 'focus',
        severity: 'critical',
        description: 'Key areas are out of focus',
        impact: 'Cannot identify pest details'
      },
      {
        type: 'distance',
        severity: 'warning',
        description: 'Subject is too far from camera',
        impact: 'Missing important detail'
      },
      {
        type: 'angle',
        severity: 'info',
        description: 'Consider multiple angles',
        impact: 'Single angle may miss issues'
      }
    ];
    
    // Return random subset
    const count = Math.floor(Math.random() * 3) + 1;
    return allIssues.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const generateSuggestions = (type: string): string[] => {
    const baseSuggestions = [
      'Use natural lighting or flash for better visibility',
      'Get closer to the subject for more detail',
      'Ensure the main issue is in focus',
      'Take multiple photos from different angles'
    ];
    
    const typeSpecific: Record<string, string[]> = {
      pest_disease: [
        'Include both top and bottom of leaves',
        'Capture any visible pests or eggs',
        'Show the pattern of damage spread'
      ],
      equipment_issue: [
        'Include model/serial numbers if visible',
        'Show the specific malfunction',
        'Capture any error messages or indicators'
      ],
      safety_hazard: [
        'Show the full extent of the hazard',
        'Include surrounding context',
        'Capture from a safe distance'
      ]
    };
    
    return [
      ...baseSuggestions.slice(0, 2),
      ...(typeSpecific[type] || []).slice(0, 2)
    ];
  };

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Acceptable';
    return 'Poor Quality';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'lighting': return <Sun className="w-4 h-4" />;
      case 'focus': return <Focus className="w-4 h-4" />;
      case 'framing': return <Maximize2 className="w-4 h-4" />;
      case 'resolution': return <Grid3x3 className="w-4 h-4" />;
      case 'angle': return <Move className="w-4 h-4" />;
      case 'distance': return <ZoomIn className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <Camera className="w-8 h-8 text-purple-500 absolute top-4 left-4" />
          </div>
          <p className="text-white mt-4 font-medium">Analyzing Photo Quality</p>
          <p className="text-sm text-gray-400 mt-1">Checking lighting, focus, and clarity...</p>
        </div>
      </div>
    );
  }

  if (!validationResult) return null;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-gray-700 ${
        validationResult.passed ? 'bg-green-900/20' : 'bg-yellow-900/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {validationResult.passed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <div>
              <h3 className="font-semibold text-white">
                Photo Quality: {getQualityLabel(validationResult.score)}
              </h3>
              <p className="text-sm text-gray-400">
                {validationResult.passed 
                  ? 'Photo meets quality standards' 
                  : 'Photo has quality issues that may affect analysis'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getQualityColor(validationResult.score)}`}>
              {validationResult.score}%
            </p>
            <p className="text-xs text-gray-500">Quality Score</p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {validationResult.issues.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Quality Issues Detected
          </h4>
          <div className="space-y-2">
            {validationResult.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 mt-0.5">
                  {getSeverityIcon(issue.severity)}
                  {getIssueIcon(issue.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{issue.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{issue.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validationResult.suggestions.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            Improvement Suggestions
          </h4>
          <ul className="space-y-2">
            {validationResult.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full p-4 hover:bg-gray-700/50 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Technical Details</span>
          <RotateCw className={`w-4 h-4 text-gray-500 transition-transform ${
            showDetails ? 'rotate-180' : ''
          }`} />
        </div>
      </button>
      
      {showDetails && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-900 rounded p-2">
              <span className="text-gray-500">Resolution</span>
              <p className="text-white">
                {validationResult.metadata.resolution.width} × {validationResult.metadata.resolution.height}
              </p>
            </div>
            <div className="bg-gray-900 rounded p-2">
              <span className="text-gray-500">File Size</span>
              <p className="text-white">
                {(validationResult.metadata.fileSize / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <div className="bg-gray-900 rounded p-2">
              <span className="text-gray-500">Brightness</span>
              <p className="text-white">{Math.round(validationResult.metadata.brightness * 100)}%</p>
            </div>
            <div className="bg-gray-900 rounded p-2">
              <span className="text-gray-500">Sharpness</span>
              <p className="text-white">{Math.round(validationResult.metadata.sharpness * 100)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Reference */}
      {guidelines.length > 0 && !validationResult.passed && (
        <div className="p-4 bg-purple-900/20 border-t border-purple-800/50">
          <h4 className="text-sm font-medium text-purple-300 mb-2">Photo Guidelines</h4>
          <ul className="space-y-1">
            {guidelines.map((guideline, index) => (
              <li key={index} className="text-xs text-purple-200 flex items-start gap-2">
                <span className="text-purple-400">•</span>
                {guideline}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
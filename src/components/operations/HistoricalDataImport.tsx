'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Database,
  Brain,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader2,
  FileText,
  BarChart3,
  Info,
  Download,
  Cloud,
  ChevronRight,
  Zap,
  Target,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { parseCSV, validateCSV, detectDelimiter } from '@/lib/csv-parser';
import * as XLSX from 'xlsx';
import { DataImportPayment } from './DataImportPayment';

interface ImportStatus {
  stage: 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
  details?: {
    recordsProcessed: number;
    totalRecords: number;
    errors: string[];
    warnings: string[];
  };
}

interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'excel' | 'json' | 'api' | 'manual';
  icon: React.ReactNode;
  description: string;
  supported: boolean;
}

interface HistoricalInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'optimization' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  impact: {
    metric: string;
    improvement: number;
    unit: string;
  };
  dataPoints: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  acknowledged?: boolean;
  importId?: string;
}

interface DataMapping {
  sourceField: string;
  vibeluxField: string;
  dataType: 'number' | 'string' | 'date' | 'boolean';
  unit?: string;
  required: boolean;
}

export function HistoricalDataImport() {
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to import your historical cultivation data'
  });

  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([]);
  const [insights, setInsights] = useState<HistoricalInsight[]>([]);
  const [showMappingWizard, setShowMappingWizard] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [hasAccess, setHasAccess] = useState(false); // Check if user has paid or has subscription

  // Data sources supported
  const dataSources: DataSource[] = [
    {
      id: 'csv',
      name: 'CSV Files',
      type: 'csv',
      icon: <FileSpreadsheet className="w-6 h-6" />,
      description: 'Environmental sensors, yield data, lab results',
      supported: true
    },
    {
      id: 'excel',
      name: 'Excel Spreadsheets',
      type: 'excel',
      icon: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
      description: 'Batch records, inventory, financial data',
      supported: true
    },
    {
      id: 'metrc',
      name: 'METRC API',
      type: 'api',
      icon: <Cloud className="w-6 h-6 text-blue-500" />,
      description: 'Compliance data, plant tracking, testing',
      supported: true
    },
    {
      id: 'sensors',
      name: 'Sensor Logs',
      type: 'json',
      icon: <Database className="w-6 h-6 text-purple-500" />,
      description: 'Trolmaster, Argus, Priva exports',
      supported: true
    },
    {
      id: 'manual',
      name: 'Manual Entry',
      type: 'manual',
      icon: <FileText className="w-6 h-6 text-gray-500" />,
      description: 'Hand-written logs, paper records',
      supported: true
    }
  ];

  // Common data mappings for cultivation data
  const commonMappings: DataMapping[] = [
    { sourceField: 'date', vibeluxField: 'timestamp', dataType: 'date', required: true },
    { sourceField: 'temperature', vibeluxField: 'environment.temperature', dataType: 'number', unit: '°F', required: false },
    { sourceField: 'humidity', vibeluxField: 'environment.humidity', dataType: 'number', unit: '%', required: false },
    { sourceField: 'co2', vibeluxField: 'environment.co2', dataType: 'number', unit: 'ppm', required: false },
    { sourceField: 'light_ppfd', vibeluxField: 'lighting.ppfd', dataType: 'number', unit: 'μmol/m²/s', required: false },
    { sourceField: 'ph', vibeluxField: 'irrigation.ph', dataType: 'number', required: false },
    { sourceField: 'ec', vibeluxField: 'irrigation.ec', dataType: 'number', unit: 'mS/cm', required: false },
    { sourceField: 'yield', vibeluxField: 'harvest.yield', dataType: 'number', unit: 'g', required: false },
    { sourceField: 'strain', vibeluxField: 'genetics.strain', dataType: 'string', required: false }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles);
    
    // Check if user has access (paid or subscription)
    if (!hasAccess) {
      setShowPayment(true);
      return;
    }
    
    processFiles(acceptedFiles);
  }, [hasAccess]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 5
  });

  // Download CSV template function
  const downloadTemplate = () => {
    const csvContent = `date,temperature,humidity,co2,light_ppfd,ph,ec,yield,strain
2024-01-01,76.5,65.2,850,400,6.1,1.8,125.5,Blue Dream
2024-01-02,75.8,63.9,820,425,6.2,1.9,0,Blue Dream
2024-01-03,77.2,66.1,880,410,6.0,1.7,0,Blue Dream`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'vibelux-data-template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Basic insight generation (placeholder for full AI implementation)
  const generateBasicInsights = (data: any[], mappings: any[]): HistoricalInsight[] => {
    const insights: HistoricalInsight[] = [];
    
    // Example: Check data completeness
    const totalFields = data.length * mappings.length;
    const filledFields = data.reduce((count, row) => {
      return count + mappings.filter(m => row[m.sourceField] != null && row[m.sourceField] !== '').length;
    }, 0);
    const completeness = (filledFields / totalFields) * 100;

    if (completeness < 80) {
      insights.push({
        id: 'data-quality-1',
        type: 'pattern',
        title: 'Data Completeness Issue',
        description: `Your data is only ${completeness.toFixed(0)}% complete. Missing data may affect analysis accuracy.`,
        confidence: 95,
        impact: {
          metric: 'Analysis Accuracy',
          improvement: completeness - 100,
          unit: '%'
        },
        dataPoints: data.length,
        dateRange: {
          start: new Date(),
          end: new Date()
        }
      });
    }

    return insights;
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setImportStatus({
      stage: 'uploading',
      progress: 10,
      message: 'Uploading files to VibeLux cloud...'
    });

    try {
      // Upload file to API
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('sourceSystem', selectedSource || 'manual');
      
      // Add facility ID if available
      const facilityId = localStorage.getItem('selectedFacilityId');
      if (facilityId) {
        formData.append('facilityId', facilityId);
      }

      const uploadResponse = await fetch('/api/data-import/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      
      if (uploadResult.success) {
        const importId = uploadResult.data.importId;
        
        setImportStatus({
          stage: 'parsing',
          progress: 30,
          message: 'Processing and analyzing your data...'
        });

        // Poll for import status
        pollImportStatus(importId);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      setImportStatus({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Error processing files. Please try again.',
        details: {
          recordsProcessed: 0,
          totalRecords: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        }
      });
    }
  };

  const pollImportStatus = async (importId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/data-import/${importId}`);
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            const importData = result.data.import;
            const insights = result.data.insights;
            
            // Update status
            setImportStatus({
              stage: importData.status as any,
              progress: importData.progress,
              message: getStatusMessage(importData.status, importData.progress),
              details: {
                recordsProcessed: importData.processedRecords,
                totalRecords: importData.totalRecords,
                errors: importData.errors || [],
                warnings: importData.warnings || []
              }
            });

            if (importData.status === 'complete') {
              // Set insights with proper typing
              setInsights(insights.map((insight: any) => ({
                id: insight.id,
                type: insight.type as 'pattern' | 'anomaly' | 'optimization' | 'correlation',
                title: insight.title,
                description: insight.description,
                confidence: insight.confidence,
                impact: {
                  metric: insight.impact.metric,
                  improvement: insight.impact.value,
                  unit: insight.impact.unit
                },
                dataPoints: insight.dataPoints,
                dateRange: {
                  start: new Date(insight.dateRange.start),
                  end: new Date(insight.dateRange.end)
                },
                acknowledged: insight.acknowledged,
                importId: importId
              })));
              
              setImportStatus(prev => ({
                ...prev,
                stage: 'complete',
                message: `Analysis complete! Found ${insights.length} key insights from your historical data.`
              }));
            } else if (importData.status === 'failed') {
              setImportStatus(prev => ({
                ...prev,
                stage: 'error',
                message: 'Import failed. Please check the errors below.'
              }));
            } else {
              // Continue polling
              setTimeout(() => checkStatus(), 2000);
            }
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        setImportStatus({
          stage: 'error',
          progress: 0,
          message: 'Failed to check import status',
          details: {
            recordsProcessed: 0,
            totalRecords: 0,
            errors: ['Connection error'],
            warnings: []
          }
        });
      }
    };

    checkStatus();
  };

  const getStatusMessage = (status: string, progress: number) => {
    switch (status) {
      case 'processing':
        return `Processing data... ${progress}% complete`;
      case 'analyzing':
        return 'Running AI analysis on your historical data...';
      case 'complete':
        return 'Analysis complete!';
      case 'failed':
        return 'Import failed. Please check the errors.';
      default:
        return 'Processing...';
    }
  };

  const applyInsightRecommendation = async (insightId: string, importId: string) => {
    try {
      const response = await fetch(`/api/data-import/${importId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          insightId,
          acknowledged: true,
          implementedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Update local state to reflect acknowledgment
        setInsights(prev => prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, acknowledged: true } 
            : insight
        ));
        
        // Show success message (you might want to add a toast notification here)
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
  };

  const readFileContent = (file: File): Promise<{ data: any[], type: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.name.endsWith('.csv')) {
            // Validate CSV first
            const validation = validateCSV(content);
            if (!validation.valid) {
              reject(new Error('Invalid CSV: ' + validation.errors.join(', ')));
              return;
            }
            
            // Parse CSV with auto-detected delimiter
            const delimiter = detectDelimiter(content);
            const data = parseCSV(content, { delimiter, headers: true, trim: true });
            resolve({ data, type: 'csv' });
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Parse Excel - need to read as ArrayBuffer instead
            reject(new Error('Excel file detected - please re-read as ArrayBuffer'));
          } else if (file.name.endsWith('.json')) {
            // Parse JSON
            const data = JSON.parse(content);
            resolve({ data: Array.isArray(data) ? data : [data], type: 'json' });
          } else {
            reject(new Error('Unsupported file type. Please use CSV, Excel, or JSON files.'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      
      // For Excel files, read as ArrayBuffer
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(firstSheet);
            resolve({ data, type: 'excel' });
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };


  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-5 h-5" />;
      case 'anomaly': return <AlertTriangle className="w-5 h-5" />;
      case 'optimization': return <Target className="w-5 h-5" />;
      case 'correlation': return <Zap className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'anomaly': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'optimization': return 'text-green-700 bg-green-50 border-green-200';
      case 'correlation': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Modal */}
      {showPayment && (
        <DataImportPayment
          onPaymentSuccess={() => {
            setShowPayment(false);
            setHasAccess(true);
            // Process files after payment
            if (uploadedFiles.length > 0) {
              processFiles(uploadedFiles);
            }
          }}
          onCancel={() => {
            setShowPayment(false);
            setUploadedFiles([]);
          }}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historical Data Import</h2>
          <p className="text-gray-600">
            Import your past cultivation data to unlock AI-powered insights immediately
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">AI Import: $9.99</p>
            <p className="text-xs text-gray-600">One-time fee</p>
          </div>
        </div>
      </div>

      {/* Import Status */}
      {importStatus.stage !== 'idle' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Import Progress</h3>
            {importStatus.stage === 'analyzing' && (
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
            )}
            {importStatus.stage === 'complete' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{importStatus.message}</span>
              <span className="text-gray-900 font-medium">{importStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${importStatus.progress}%` }}
              />
            </div>

            {importStatus.details && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Records Processed</span>
                  <span className="text-gray-900">
                    {importStatus.details.recordsProcessed.toLocaleString()} / {importStatus.details.totalRecords.toLocaleString()}
                  </span>
                </div>
                {importStatus.details.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-600 mb-1">Warnings:</p>
                    {importStatus.details.warnings.map((warning, idx) => (
                      <p key={idx} className="text-xs text-gray-600 ml-4">• {warning}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Source Selection */}
      {importStatus.stage === 'idle' && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Data Source
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {dataSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  disabled={!source.supported}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedSource === source.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-400 hover:shadow-sm'
                  } ${!source.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {source.icon}
                    {selectedSource === source.id && (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 text-left">
                    {source.name}
                  </h4>
                  <p className="text-sm text-gray-600 text-left mt-1">
                    {source.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Area */}
          {selectedSource && ['csv', 'excel', 'json'].includes(selectedSource) && (
            <div>
              {!hasAccess && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-gray-700">
                      AI-powered import requires a one-time fee of $9.99 or a Pro subscription
                    </p>
                  </div>
                </div>
              )}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-600">
                or click to browse your computer
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports CSV, Excel, and JSON files up to 100MB
              </p>
              {fileRejections.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {fileRejections[0].errors[0].message}
                </div>
              )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Generated Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              AI-Generated Insights from Your Data
            </h3>
            <span className="text-sm text-gray-600">
              {insights.length} insights found
            </span>
          </div>

          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-6 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {insight.title}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      {insight.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {insight.dataPoints.toLocaleString()} data points analyzed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(insight.dateRange.start).toLocaleDateString()} - {new Date(insight.dateRange.end).toLocaleDateString()}
                        </span>
                      </div>
                      {insight.impact && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-4 h-4 ${
                            insight.impact.improvement > 0 ? 'text-green-500' : 'text-red-500'
                          }`} />
                          <span className={`font-medium ${
                            insight.impact.improvement > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {insight.impact.improvement > 0 ? '+' : ''}{insight.impact.improvement} {insight.impact.unit} {insight.impact.metric}
                          </span>
                        </div>
                      )}
                    </div>

                    {!insight.acknowledged ? (
                      <button 
                        onClick={() => applyInsightRecommendation(insight.id, insight.importId!)}
                        className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Apply Recommendation
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Recommendation Applied</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI-Powered Notice */}
      {importStatus.stage === 'parsing' && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">AI-Powered Data Understanding</h4>
              <p className="text-sm text-gray-600 mt-1">
                Our AI intelligently understands your data format, identifies fields, 
                handles unit conversions, and cleans messy data automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      {importStatus.stage === 'idle' && !selectedSource && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-600" />
            Why Import Historical Data?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Instant ML Insights</h4>
                <p className="text-sm text-gray-600">
                  Our AI analyzes your past data to find patterns and optimization opportunities immediately
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Baseline Establishment</h4>
                <p className="text-sm text-gray-600">
                  Creates performance benchmarks specific to your facility and strains
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Anomaly Detection</h4>
                <p className="text-sm text-gray-600">
                  Identifies issues and inefficiencies you may have missed
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Predictive Models</h4>
                <p className="text-sm text-gray-600">
                  Builds accurate forecasts based on your actual historical performance
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
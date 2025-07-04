'use client';

import React, { useState } from 'react';
import { dataExporter, ExportFormat, DataType, ExportOptions } from '@/lib/export/data-exporter';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Filter,
  Settings,
  BarChart,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Database,
  TrendingUp,
  AlertTriangle,
  Zap,
  Leaf,
  Activity
} from 'lucide-react';

export function DataExportPanel() {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    dataType: 'sensor',
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      end: new Date()
    },
    filters: {},
    includeAggregations: true,
    aggregationInterval: '1h',
    includeCharts: false
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    message: string;
    filename?: string;
  } | null>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatIcons = {
    csv: <FileText className="w-5 h-5" />,
    excel: <FileSpreadsheet className="w-5 h-5" />,
    pdf: <FileText className="w-5 h-5" />,
    json: <FileJson className="w-5 h-5" />
  };

  const dataTypeInfo = {
    sensor: {
      icon: <Activity className="w-5 h-5" />,
      title: 'Sensor Data',
      description: 'Raw sensor readings with timestamps'
    },
    yield: {
      icon: <Leaf className="w-5 h-5" />,
      title: 'Yield Reports',
      description: 'Harvest data and quality metrics'
    },
    environmental: {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Environmental Summary',
      description: 'Daily averages and trends'
    },
    equipment: {
      icon: <Zap className="w-5 h-5" />,
      title: 'Equipment Usage',
      description: 'Runtime and energy consumption'
    },
    alerts: {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Alert History',
      description: 'System alerts and notifications'
    },
    cultivation: {
      icon: <Database className="w-5 h-5" />,
      title: 'Cultivation Cycles',
      description: 'Complete grow cycle analytics'
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const result = await dataExporter.exportData(exportOptions);
      
      if (result.success && result.data) {
        // Create download link
        const blob = result.data instanceof Uint8Array 
          ? new Blob([result.data], { type: getMimeType(exportOptions.format) })
          : new Blob([result.data], { type: 'text/plain' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setExportResult({
          success: true,
          message: `Exported ${result.recordCount} records (${formatFileSize(result.fileSize || 0)})`,
          filename: result.filename
        });
      } else {
        setExportResult({
          success: false,
          message: result.error || 'Export failed'
        });
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: 'An error occurred during export'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getMimeType = (format: ExportFormat): string => {
    switch (format) {
      case 'csv': return 'text/csv';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf': return 'application/pdf';
      case 'json': return 'application/json';
      default: return 'application/octet-stream';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Download className="w-8 h-8 text-purple-500" />
          Data Export
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Export your cultivation data in various formats
        </p>
      </div>

      {/* Data Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Data Type
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(dataTypeInfo).map(([type, info]) => (
            <button
              key={type}
              onClick={() => setExportOptions(prev => ({ ...prev, dataType: type as DataType }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportOptions.dataType === type
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`${
                  exportOptions.dataType === type ? 'text-purple-500' : 'text-gray-400'
                }`}>
                  {info.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {info.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {info.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Date Range
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={exportOptions.dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  start: new Date(e.target.value)
                }
              }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={exportOptions.dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  end: new Date(e.target.value)
                }
              }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
        </div>
        
        {/* Quick date presets */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setExportOptions(prev => ({
              ...prev,
              dateRange: {
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                end: new Date()
              }
            }))}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Last 7 days
          </button>
          <button
            onClick={() => setExportOptions(prev => ({
              ...prev,
              dateRange: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date()
              }
            }))}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Last 30 days
          </button>
          <button
            onClick={() => setExportOptions(prev => ({
              ...prev,
              dateRange: {
                start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                end: new Date()
              }
            }))}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Last 90 days
          </button>
        </div>
      </div>

      {/* Export Format */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export Format
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(['csv', 'excel', 'pdf', 'json'] as ExportFormat[]).map(format => (
            <button
              key={format}
              onClick={() => setExportOptions(prev => ({ ...prev, format }))}
              className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                exportOptions.format === format
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {formatIcons[format]}
              <span className="font-medium uppercase">{format}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">Advanced Options</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
            showAdvanced ? 'rotate-180' : ''
          }`} />
        </button>
        
        {showAdvanced && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Aggregations */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAggregations}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeAggregations: e.target.checked
                  }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-900 dark:text-white">Include aggregated summaries</span>
              </label>
              
              {exportOptions.includeAggregations && (
                <div className="mt-3 ml-7">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Aggregation Interval
                  </label>
                  <select
                    value={exportOptions.aggregationInterval}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      aggregationInterval: e.target.value
                    }))}
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="5m">5 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="1d">1 day</option>
                    <option value="1w">1 week</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* Include Charts (for PDF) */}
            {exportOptions.format === 'pdf' && (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeCharts: e.target.checked
                  }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-900 dark:text-white">Include visualization charts</span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-center">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export Data
            </>
          )}
        </button>
      </div>

      {/* Export Result */}
      {exportResult && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          exportResult.success
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {exportResult.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <div>
            <p className="font-medium">{exportResult.message}</p>
            {exportResult.filename && (
              <p className="text-sm opacity-75">File: {exportResult.filename}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
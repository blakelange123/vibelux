'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Database,
  Settings,
  Download,
  RefreshCw,
  Shield,
  Info,
  Edit,
  Save,
  X,
  Calculator
} from 'lucide-react';
import { EnhancedBaselineDisplay } from '../EnhancedBaselineDisplay';

interface Baseline {
  id: string;
  metricType: 'energy' | 'yield' | 'cost' | 'quality';
  value: number;
  unit: string;
  period: string;
  source: 'historical' | 'industry' | 'custom' | 'imported';
  verificationStatus: 'pending' | 'verified' | 'disputed';
  effectiveDate: Date;
  expiryDate?: Date;
  notes?: string;
}

interface DataImport {
  id: string;
  fileName: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsTotal: number;
}

export function BaselineManager() {
  const [activeTab, setActiveTab] = useState<'current' | 'detailed' | 'history' | 'import' | 'verification'>('current');
  const [editingBaseline, setEditingBaseline] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Mock data
  const [baselines, setBaselines] = useState<Baseline[]>([
    {
      id: '1',
      metricType: 'energy',
      value: 95000,
      unit: 'kWh/month',
      period: '12-month average',
      source: 'historical',
      verificationStatus: 'verified',
      effectiveDate: new Date('2024-01-01'),
      notes: 'Based on 2023 consumption data, weather normalized'
    },
    {
      id: '2',
      metricType: 'yield',
      value: 3800,
      unit: 'lbs/month',
      period: '6-month average',
      source: 'historical',
      verificationStatus: 'verified',
      effectiveDate: new Date('2024-01-01'),
      notes: 'Average yield from similar strains'
    },
    {
      id: '3',
      metricType: 'cost',
      value: 35000,
      unit: '$/month',
      period: '12-month average',
      source: 'historical',
      verificationStatus: 'pending',
      effectiveDate: new Date('2024-01-01')
    }
  ]);

  const [imports] = useState<DataImport[]>([
    {
      id: '1',
      fileName: 'QuickBooks_Export_2023.qbo',
      uploadDate: new Date('2024-01-15'),
      status: 'completed',
      recordsProcessed: 3847,
      recordsTotal: 3847
    },
    {
      id: '2',
      fileName: 'Electric_Bills_2023.pdf',
      uploadDate: new Date('2024-01-16'),
      status: 'completed',
      recordsProcessed: 12,
      recordsTotal: 12
    },
    {
      id: '3',
      fileName: 'PL_Statement_2023.xlsx',
      uploadDate: new Date('2024-01-16'),
      status: 'completed',
      recordsProcessed: 1,
      recordsTotal: 1
    }
  ]);

  const handleEditBaseline = (baselineId: string, field: string, value: any) => {
    setBaselines(prev => prev.map(baseline => 
      baseline.id === baselineId ? { ...baseline, [field]: value } : baseline
    ));
  };

  const handleSaveBaseline = (baselineId: string) => {
    setEditingBaseline(null);
    // In production, this would call an API to save the baseline
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'disputed': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'energy': return '⚡';
      case 'yield': return '🌿';
      case 'cost': return '💰';
      case 'quality': return '✨';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-500" />
            Baseline Management
          </h2>
          <p className="text-gray-400">Configure and verify performance baselines for revenue sharing</p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import Data
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-medium text-white mb-1">Financial Data Import</p>
          <p>Import your QuickBooks data or upload audited financials to establish baseline costs. We analyze 15 categories of operational expenses to accurately calculate your savings potential.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'current', label: 'Summary' },
          { id: 'detailed', label: 'Detailed Costs' },
          { id: 'history', label: 'History' },
          { id: 'import', label: 'Import' },
          { id: 'verification', label: 'Verification' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.id === 'detailed' && <Calculator className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'current' && (
        <div className="space-y-4">
          {/* Current Baselines */}
          <div className="grid gap-4">
            {baselines.map((baseline) => (
              <div key={baseline.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getMetricIcon(baseline.metricType)}</div>
                    <div>
                      <h3 className="font-semibold text-white capitalize">
                        {baseline.metricType} Baseline
                      </h3>
                      {editingBaseline === baseline.id ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="number"
                            value={baseline.value}
                            onChange={(e) => handleEditBaseline(baseline.id, 'value', parseFloat(e.target.value))}
                            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white"
                          />
                          <input
                            type="text"
                            value={baseline.unit}
                            onChange={(e) => handleEditBaseline(baseline.id, 'unit', e.target.value)}
                            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white ml-2"
                          />
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-white mt-1">
                          {baseline.value.toLocaleString()} {baseline.unit}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>{baseline.period}</span>
                        <span>•</span>
                        <span className="capitalize">{baseline.source} data</span>
                        <span>•</span>
                        <span>Effective: {baseline.effectiveDate.toLocaleDateString()}</span>
                      </div>
                      {baseline.notes && (
                        <p className="text-sm text-gray-500 mt-2">{baseline.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(baseline.verificationStatus)}`}>
                      {baseline.verificationStatus}
                    </span>
                    {editingBaseline === baseline.id ? (
                      <>
                        <button
                          onClick={() => handleSaveBaseline(baseline.id)}
                          className="p-1.5 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingBaseline(null)}
                          className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingBaseline(baseline.id)}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Baseline Summary */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="font-semibold text-white mb-4">Cost Category Summary</h3>
            <p className="text-sm text-gray-400 mb-6">Quick overview of major operational costs - click "Detailed Costs" for all 15 categories</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Energy Costs</p>
                <p className="text-xl font-bold text-yellow-400">$180,000/yr</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Labor Costs</p>
                <p className="text-xl font-bold text-purple-400">$420,000/yr</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Materials & Supplies</p>
                <p className="text-xl font-bold text-cyan-400">$116,000/yr</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Other Operating</p>
                <p className="text-xl font-bold text-gray-400">$489,000/yr</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Annual Operating Cost</p>
                  <p className="text-2xl font-bold text-red-400">$1,205,000</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Potential Annual Savings</p>
                  <p className="text-2xl font-bold text-green-400">$265,100</p>
                  <p className="text-xs text-gray-500">(22% optimization potential)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="space-y-4">
          <EnhancedBaselineDisplay facilityId="facility-001" />
        </div>
      )}

      {activeTab === 'import' && (
        <div className="space-y-4">
          {/* Import History */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">Import History</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {imports.map((importItem) => (
                <div key={importItem.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">{importItem.fileName}</p>
                      <p className="text-sm text-gray-400">
                        Uploaded {importItem.uploadDate.toLocaleDateString()} • 
                        {importItem.recordsProcessed.toLocaleString()} records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {importItem.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : importItem.status === 'processing' ? (
                      <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <button className="text-sm text-purple-400 hover:text-purple-300">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Import Instructions */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="font-semibold text-white mb-4">Accepted Financial Documents</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>QuickBooks export files (.QBO, .IIF) or detailed P&L reports</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>12 months of utility bills (electric, gas, water) in PDF or image format</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Audited financial statements or tax returns (if available)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Payroll reports showing labor costs and hours</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>All financial data is encrypted and stored securely</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-4">
          {/* Verification Status */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-6 border border-green-600/30">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="font-semibold text-white mb-2">Financial Data Verification</h3>
                <p className="text-gray-300 mb-4">
                  Baseline established from QuickBooks export and utility bills
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-gray-400">Import Date</p>
                    <p className="font-medium text-white">March 15, 2024</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Data Source</p>
                    <p className="font-medium text-white">QuickBooks Online</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Period Covered</p>
                    <p className="font-medium text-white">Jan - Dec 2023</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Baseline Report
            </button>
          </div>

          {/* Verification Requirements */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="font-semibold text-white mb-4">Required Documentation</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked readOnly className="mt-1" />
                <div>
                  <p className="font-medium text-white">QuickBooks or accounting software export</p>
                  <p className="text-sm text-gray-400">Full P&L detail for the past 12 months</p>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked readOnly className="mt-1" />
                <div>
                  <p className="font-medium text-white">Utility bills (12 months)</p>
                  <p className="text-sm text-gray-400">Electric, gas, and water bills in PDF format</p>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked readOnly className="mt-1" />
                <div>
                  <p className="font-medium text-white">Payroll summary</p>
                  <p className="text-sm text-gray-400">Total labor hours and costs by department</p>
                </div>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked readOnly className="mt-1" />
                <div>
                  <p className="font-medium text-white">Production records</p>
                  <p className="text-sm text-gray-400">Monthly yield and quality data</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Import Baseline Data</h3>
            
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300 mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500">QuickBooks exports, P&L statements, or utility bills</p>
              <p className="text-xs text-gray-600 mt-1">Supports CSV, Excel, PDF up to 50MB</p>
              <input type="file" className="hidden" accept=".csv,.xlsx,.pdf,.qbo" />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
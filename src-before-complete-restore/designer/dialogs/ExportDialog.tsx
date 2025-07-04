'use client';

import React, { useState } from 'react';
import { X, FileText, Download, Settings } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { exportToPDFWithOptions, ExportOptions } from '../utils/enhancedExportHandlers';
import { exportToExcel, exportToCAD } from '../utils/exportHandlers';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { state } = useDesigner();
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'cad'>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    includeProjectInfo: true,
    includeRoomInfo: true,
    includePerformanceMetrics: true,
    includeFixtureSchedule: true,
    includePPFDMap: true,
    includeEnergyAnalysis: true,
    includeCompliance: true,
    includeImages: true,
    projectName: 'Lighting Design Project',
    clientName: '',
    designerName: '',
    notes: ''
  });

  const handleExport = async () => {
    try {
      switch (exportFormat) {
        case 'pdf':
          await exportToPDFWithOptions(state, options);
          break;
        case 'excel':
          exportToExcel(state);
          break;
        case 'cad':
          exportToCAD(state);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-white">Export Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-4 rounded-lg border transition-all ${
                  exportFormat === 'pdf'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">PDF Report</div>
                <div className="text-xs opacity-80">Professional report</div>
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                className={`p-4 rounded-lg border transition-all ${
                  exportFormat === 'excel'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Download className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Excel</div>
                <div className="text-xs opacity-80">Data spreadsheet</div>
              </button>
              <button
                onClick={() => setExportFormat('cad')}
                className={`p-4 rounded-lg border transition-all ${
                  exportFormat === 'cad'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Settings className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">DXF/CAD</div>
                <div className="text-xs opacity-80">Technical drawing</div>
              </button>
            </div>
          </div>

          {/* PDF Options */}
          {exportFormat === 'pdf' && (
            <>
              {/* Project Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Project Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={options.projectName}
                      onChange={(e) => setOptions({ ...options, projectName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Client Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={options.clientName}
                        onChange={(e) => setOptions({ ...options, clientName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Designer Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={options.designerName}
                        onChange={(e) => setOptions({ ...options, designerName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Include Options */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Report Sections</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeProjectInfo}
                      onChange={(e) => setOptions({ ...options, includeProjectInfo: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className="text-white font-medium">Project Header</div>
                      <div className="text-xs text-gray-400">Project name, client, date</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includePerformanceMetrics}
                      onChange={(e) => setOptions({ ...options, includePerformanceMetrics: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className="text-white font-medium">Performance Metrics</div>
                      <div className="text-xs text-gray-400">PPFD, uniformity, DLI, efficacy</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeRoomInfo}
                      onChange={(e) => setOptions({ ...options, includeRoomInfo: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className="text-white font-medium">Facility Information</div>
                      <div className="text-xs text-gray-400">Room dimensions, area, reflectances</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeEnergyAnalysis}
                      onChange={(e) => setOptions({ ...options, includeEnergyAnalysis: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className="text-white font-medium">Energy Analysis</div>
                      <div className="text-xs text-gray-400">Power consumption, costs, carbon footprint</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeFixtureSchedule}
                      onChange={(e) => setOptions({ ...options, includeFixtureSchedule: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className="text-white font-medium">Fixture Schedule</div>
                      <div className="text-xs text-gray-400">Detailed list of all fixtures</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeCompliance}
                      onChange={(e) => setOptions({ ...options, includeCompliance: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <div className="text-white font-medium">Standards Compliance</div>
                      <div className="text-xs text-gray-400">Compliance status and recommendations</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project Notes (Optional)
                </label>
                <textarea
                  value={options.notes}
                  onChange={(e) => setOptions({ ...options, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Add any additional notes or comments..."
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
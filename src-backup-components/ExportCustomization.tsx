'use client';

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  BarChart3, 
  Calculator, 
  Image, 
  Users, 
  Target,
  FileDown,
  Download,
  CheckCircle2,
  Circle,
  Sparkles
} from 'lucide-react';

interface ExportSection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  required?: boolean;
}

interface ExportCustomizationProps {
  reportName: string;
  onExport: (sections: ExportSection[], format: string) => void;
  onClose: () => void;
}

export function ExportCustomization({ reportName, onExport, onClose }: ExportCustomizationProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'word'>('pdf');
  const [includeVibeluxBranding, setIncludeVibeluxBranding] = useState(true);
  const [exportSections, setExportSections] = useState<ExportSection[]>([
    {
      id: 'cover_page',
      name: 'Cover Page',
      description: 'Professional cover page with Vibelux branding and project details',
      icon: FileText,
      enabled: true,
      required: true
    },
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'High-level overview of key findings and recommendations',
      icon: Users,
      enabled: true
    },
    {
      id: 'project_details',
      name: 'Project Details',
      description: 'Facility information, project scope, and specifications',
      icon: Target,
      enabled: true
    },
    {
      id: 'calculation_summary',
      name: 'Calculation Summary',
      description: 'Technical calculations, formulas, and methodology used',
      icon: Calculator,
      enabled: true
    },
    {
      id: 'charts_visualizations',
      name: 'Charts & Visualizations',
      description: 'All graphs, heatmaps, and visual data representations',
      icon: BarChart3,
      enabled: true
    },
    {
      id: 'data_tables',
      name: 'Data Tables',
      description: 'Raw data tables and detailed numerical results',
      icon: FileText,
      enabled: true
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Actionable recommendations and optimization opportunities',
      icon: Target,
      enabled: true
    },
    {
      id: 'technical_appendices',
      name: 'Technical Appendices',
      description: 'Detailed technical specifications and additional data',
      icon: FileDown,
      enabled: false
    },
    {
      id: 'compliance_documentation',
      name: 'Compliance Documentation',
      description: 'Regulatory compliance information and certifications',
      icon: CheckCircle2,
      enabled: false
    }
  ]);

  const toggleSection = (sectionId: string) => {
    setExportSections(prev => 
      prev.map(section => 
        section.id === sectionId && !section.required
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  };

  const handleExport = () => {
    const enabledSections = exportSections.filter(section => section.enabled);
    onExport(enabledSections, selectedFormat);
  };

  const formatOptions = [
    { id: 'pdf', name: 'PDF Report', description: 'Professional PDF with high-quality formatting' },
    { id: 'excel', name: 'Excel Workbook', description: 'Spreadsheet with multiple sheets and data' },
    { id: 'word', name: 'Word Document', description: 'Editable document format' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileDown className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Export Report</h2>
                <p className="text-white/80">Customize your export options for "{reportName}"</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Format Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formatOptions.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedFormat === format.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-white font-semibold">{format.name}</div>
                  <div className="text-gray-400 text-sm mt-1">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Branding Options */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Branding Options</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  includeVibeluxBranding ? 'bg-purple-600 border-purple-600' : 'border-gray-600'
                }`}>
                  {includeVibeluxBranding && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">Include Vibelux Professional Branding</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeVibeluxBranding}
                  onChange={(e) => setIncludeVibeluxBranding(e.target.checked)}
                  className="sr-only"
                />
              </label>
              <p className="text-gray-400 text-sm mt-2 ml-8">
                Adds professional Vibelux logos, headers, and formatting to your export
              </p>
            </div>
          </div>

          {/* Section Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Report Sections</h3>
              <div className="text-sm text-gray-400">
                {exportSections.filter(s => s.enabled).length} of {exportSections.length} sections selected
              </div>
            </div>
            
            <div className="space-y-3">
              {exportSections.map(section => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className={`border rounded-lg p-4 transition-all ${
                      section.enabled 
                        ? 'border-purple-500/50 bg-purple-500/5' 
                        : 'border-gray-700 bg-gray-800/50'
                    } ${section.required ? 'opacity-75' : 'cursor-pointer hover:border-gray-600'}`}
                    onClick={() => !section.required && toggleSection(section.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        section.enabled 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-600'
                      }`}>
                        {section.enabled && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${
                            section.enabled ? 'text-purple-400' : 'text-gray-500'
                          }`} />
                          <h4 className={`font-semibold ${
                            section.enabled ? 'text-white' : 'text-gray-400'
                          }`}>
                            {section.name}
                            {section.required && (
                              <span className="ml-2 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                          </h4>
                        </div>
                        <p className="text-gray-400 text-sm">{section.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview Summary */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-3">Export Preview</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Format: <span className="text-purple-400">{formatOptions.find(f => f.id === selectedFormat)?.name}</span></div>
              <div>Sections: <span className="text-purple-400">{exportSections.filter(s => s.enabled).length}</span></div>
              <div>Branding: <span className="text-purple-400">{includeVibeluxBranding ? 'Professional' : 'Basic'}</span></div>
              <div>Estimated pages: <span className="text-purple-400">{Math.max(5, exportSections.filter(s => s.enabled).length * 2)}-{exportSections.filter(s => s.enabled).length * 4}</span></div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-800 p-6 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Professional reports powered by Vibelux
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
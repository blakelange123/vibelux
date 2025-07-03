'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText,
  Download,
  Settings,
  Check,
  X,
  Eye,
  Printer,
  Mail,
  Calendar,
  Building,
  User,
  Lightbulb,
  Calculator,
  Table,
  BarChart3,
  FileImage,
  List,
  Hash,
  Map,
  Zap,
  DollarSign,
  Clock,
  Ruler,
  Compass,
  Box,
  TreePine,
  Wind,
  Cpu,
  Power,
  Wrench,
  Sun,
  Droplets,
  Thermometer,
  AlertOctagon
} from 'lucide-react';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  order: number;
  data?: any;
  options?: {
    includeGraphs?: boolean;
    includeImages?: boolean;
    detailLevel?: 'summary' | 'detailed' | 'comprehensive';
    format?: 'table' | 'list' | 'grid';
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  settings: {
    paperSize: 'letter' | 'a4' | 'legal';
    orientation: 'portrait' | 'landscape';
    includeHeader: boolean;
    includeFooter: boolean;
    includePageNumbers: boolean;
    includeLogo: boolean;
    colorScheme: 'color' | 'grayscale';
  };
}

interface ProjectInfo {
  projectName: string;
  projectNumber?: string;
  clientName: string;
  clientContact?: string;
  designerName: string;
  designerEmail?: string;
  companyName?: string;
  date: string;
  location?: string;
  buildingType?: string;
  roomDimensions?: {
    length: number;
    width: number;
    height: number;
    area: number;
  };
}

interface LightingReportBuilderProps {
  projectData: any; // This would come from your lighting calculations
  onExport?: (format: 'pdf' | 'docx' | 'xlsx', sections: ReportSection[]) => void;
  className?: string;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  {
    id: 'title-page',
    title: 'Title Page',
    description: 'Project information and cover page',
    icon: FileText,
    enabled: true,
    order: 1,
    options: { includeImages: true }
  },
  {
    id: 'table-of-contents',
    title: 'Table of Contents',
    description: 'Automatic page numbering and section index',
    icon: List,
    enabled: true,
    order: 2
  },
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    description: 'Project overview and key metrics',
    icon: FileText,
    enabled: true,
    order: 3,
    options: { detailLevel: 'summary' }
  },
  {
    id: 'calculation-surfaces',
    title: 'Calculation Surfaces',
    description: 'Room dimensions and surface reflectances',
    icon: Map,
    enabled: true,
    order: 4,
    options: { includeGraphs: true, format: 'table' }
  },
  {
    id: 'luminaire-schedule',
    title: 'Luminaire Schedule',
    description: 'Complete fixture list with specifications',
    icon: Lightbulb,
    enabled: true,
    order: 5,
    options: { format: 'table', includeImages: true }
  },
  {
    id: 'point-by-point',
    title: 'Point-by-Point Calculations',
    description: 'Detailed illuminance values grid',
    icon: Calculator,
    enabled: true,
    order: 6,
    options: { includeGraphs: true, detailLevel: 'comprehensive' }
  },
  {
    id: 'wattage-calculations',
    title: 'Wattage & Power Density',
    description: 'Energy usage and efficiency metrics',
    icon: Zap,
    enabled: true,
    order: 7,
    options: { includeGraphs: true, format: 'table' }
  },
  {
    id: 'uniformity-analysis',
    title: 'Uniformity Analysis',
    description: 'Light distribution and uniformity ratios',
    icon: BarChart3,
    enabled: true,
    order: 8,
    options: { includeGraphs: true }
  },
  {
    id: 'photometric-data',
    title: 'Photometric Data',
    description: 'IES files and distribution curves',
    icon: FileImage,
    enabled: false,
    order: 9,
    options: { includeImages: true }
  },
  {
    id: 'roi-analysis',
    title: 'ROI & Cost Analysis',
    description: 'Return on investment and payback calculations',
    icon: DollarSign,
    enabled: true,
    order: 10,
    options: { includeGraphs: true, detailLevel: 'detailed' }
  },
  {
    id: 'compliance-report',
    title: 'Code Compliance',
    description: 'Energy codes and standards compliance',
    icon: Check,
    enabled: true,
    order: 11,
    options: { format: 'list' }
  },
  {
    id: 'maintenance-schedule',
    title: 'Maintenance Schedule',
    description: 'Recommended maintenance and lamp replacement',
    icon: Clock,
    enabled: false,
    order: 12,
    options: { format: 'table' }
  },
  {
    id: 'fixture-coordinates',
    title: 'Fixture Positioning Data',
    description: 'XYZ coordinates, mounting heights, and aiming angles',
    icon: Compass,
    enabled: true,
    order: 13,
    options: { includeGraphs: true, format: 'table', detailLevel: 'comprehensive' }
  },
  {
    id: 'room-objects',
    title: 'Room Objects & Obstructions',
    description: 'Plants, HVAC, structural elements, and furniture',
    icon: Box,
    enabled: true,
    order: 14,
    options: { includeImages: true, format: 'list' }
  },
  {
    id: 'plant-analysis',
    title: 'Horticultural Lighting Analysis',
    description: 'PPFD, DLI, and spectrum analysis for plant growth',
    icon: TreePine,
    enabled: false,
    order: 15,
    options: { includeGraphs: true, detailLevel: 'comprehensive' }
  },
  {
    id: 'environmental-factors',
    title: 'Environmental Conditions',
    description: 'Temperature, humidity, dust ratings, and IP requirements',
    icon: Thermometer,
    enabled: false,
    order: 16,
    options: { format: 'table' }
  },
  {
    id: 'electrical-layout',
    title: 'Electrical & Circuit Layout',
    description: 'Circuit assignments, load calculations, and voltage drop',
    icon: Power,
    enabled: true,
    order: 17,
    options: { includeGraphs: true, format: 'table' }
  },
  {
    id: 'control-systems',
    title: 'Control Systems & Zoning',
    description: 'Control zones, grouping, sensors, and programming',
    icon: Cpu,
    enabled: true,
    order: 18,
    options: { includeGraphs: true, detailLevel: 'detailed' }
  },
  {
    id: 'daylight-integration',
    title: 'Daylight Integration',
    description: 'Daylight harvesting zones and sensor placement',
    icon: Sun,
    enabled: false,
    order: 19,
    options: { includeGraphs: true, format: 'table' }
  },
  {
    id: 'glare-analysis',
    title: 'Visual Comfort & Glare',
    description: 'UGR calculations and glare control measures',
    icon: AlertOctagon,
    enabled: false,
    order: 20,
    options: { includeGraphs: true, detailLevel: 'detailed' }
  },
  {
    id: 'spectral-analysis',
    title: 'Spectral Power Distribution',
    description: 'Detailed spectrum analysis and color quality metrics',
    icon: Zap,
    enabled: false,
    order: 21,
    options: { includeGraphs: true, detailLevel: 'comprehensive' }
  },
  {
    id: 'emergency-lighting',
    title: 'Emergency Lighting Layout',
    description: 'Emergency fixture locations and egress calculations',
    icon: AlertOctagon,
    enabled: false,
    order: 22,
    options: { includeGraphs: true, format: 'table' }
  },
  {
    id: 'hvac-coordination',
    title: 'HVAC Coordination',
    description: 'HVAC equipment locations and clearance requirements',
    icon: Wind,
    enabled: false,
    order: 23,
    options: { includeImages: true, format: 'list' }
  },
  {
    id: 'mounting-details',
    title: 'Mounting & Installation Details',
    description: 'Detailed mounting methods and structural attachments',
    icon: Wrench,
    enabled: false,
    order: 24,
    options: { includeImages: true, detailLevel: 'comprehensive' }
  },
  {
    id: 'cfd-analysis',
    title: 'CFD Analysis',
    description: 'Computational fluid dynamics for airflow, temperature, and environmental optimization',
    icon: Wind,
    enabled: false,
    order: 25,
    options: {
      detailLevel: 'comprehensive',
      includeGraphs: true,
      format: 'table'
    }
  },
  {
    id: 'appendix',
    title: 'Appendix',
    description: 'Additional calculations and references',
    icon: FileText,
    enabled: false,
    order: 26
  }
];

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'professional-full',
    name: 'Professional Full Report',
    description: 'Comprehensive report with all calculations and analysis',
    sections: DEFAULT_SECTIONS.map(s => ({ ...s, enabled: true })),
    settings: {
      paperSize: 'letter',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeLogo: true,
      colorScheme: 'color'
    }
  },
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    description: 'Concise summary for decision makers',
    sections: DEFAULT_SECTIONS.filter(s => 
      ['title-page', 'executive-summary', 'luminaire-schedule', 'wattage-calculations', 'roi-analysis'].includes(s.id)
    ),
    settings: {
      paperSize: 'letter',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeLogo: true,
      colorScheme: 'color'
    }
  },
  {
    id: 'technical-spec',
    name: 'Technical Specification',
    description: 'Detailed technical data for contractors',
    sections: DEFAULT_SECTIONS.filter(s => 
      ['title-page', 'calculation-surfaces', 'luminaire-schedule', 'point-by-point', 'photometric-data'].includes(s.id)
    ),
    settings: {
      paperSize: 'a4',
      orientation: 'landscape',
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeLogo: false,
      colorScheme: 'grayscale'
    }
  },
  {
    id: 'energy-compliance',
    name: 'Energy Compliance Report',
    description: 'Focus on energy codes and efficiency',
    sections: DEFAULT_SECTIONS.filter(s => 
      ['title-page', 'wattage-calculations', 'compliance-report', 'roi-analysis'].includes(s.id)
    ),
    settings: {
      paperSize: 'letter',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includePageNumbers: true,
      includeLogo: true,
      colorScheme: 'color'
    }
  }
];

export default function LightingReportBuilder({
  projectData,
  onExport,
  className = ''
}: LightingReportBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    projectName: projectData?.projectName || '',
    clientName: projectData?.clientName || '',
    designerName: projectData?.designerName || '',
    date: new Date().toISOString().split('T')[0],
    roomDimensions: projectData?.roomDimensions || {
      length: 0,
      width: 0,
      height: 0,
      area: 0
    }
  });
  const [showPreview, setShowPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'xlsx'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const reorderSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const index = prev.findIndex(s => s.id === sectionId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newSections = [...prev];
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      
      return newSections.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const updateSectionOption = (sectionId: string, option: string, value: any) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, options: { ...section.options, [option]: value } }
        : section
    ));
  };

  const applyTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setSections(template.sections);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Filter enabled sections and sort by order
      const enabledSections = sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);
      
      if (onExport) {
        onExport(exportFormat, enabledSections);
      } else {
        // Default export implementation
        const response = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format: exportFormat,
            sections: enabledSections,
            projectInfo,
            projectData,
            settings: selectedTemplate.settings
          })
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${projectInfo.projectName.replace(/\s+/g, '-')}_lighting-report.${exportFormat}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Lighting Report Builder</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                showPreview ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={generateReport}
              disabled={isGenerating || !sections.some(s => s.enabled)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Report Template</label>
          <div className="grid grid-cols-4 gap-3">
            {REPORT_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <h4 className="text-sm font-medium text-white mb-1">{template.name}</h4>
                <p className="text-xs text-gray-400">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Export Format */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400">Export Format:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setExportFormat('pdf')}
              className={`px-3 py-1 rounded text-sm ${
                exportFormat === 'pdf' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setExportFormat('docx')}
              className={`px-3 py-1 rounded text-sm ${
                exportFormat === 'docx' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Word
            </button>
            <button
              onClick={() => setExportFormat('xlsx')}
              className={`px-3 py-1 rounded text-sm ${
                exportFormat === 'xlsx' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sections List */}
        <div className="w-1/2 p-6 border-r border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Report Sections</h3>
          <div className="space-y-3">
            {sections.sort((a, b) => a.order - b.order).map((section, index) => (
              <div
                key={section.id}
                className={`p-4 rounded-lg border transition-all ${
                  section.enabled
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleSection(section.id)}
                      className="mt-1 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <section.icon className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-medium text-white">{section.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400">{section.description}</p>
                      
                      {/* Section Options */}
                      {section.enabled && section.options && (
                        <div className="mt-3 space-y-2">
                          {section.options.includeGraphs !== undefined && (
                            <label className="flex items-center gap-2 text-xs text-gray-300">
                              <input
                                type="checkbox"
                                checked={section.options.includeGraphs}
                                onChange={(e) => updateSectionOption(section.id, 'includeGraphs', e.target.checked)}
                                className="w-3 h-3"
                              />
                              Include graphs and charts
                            </label>
                          )}
                          {section.options.includeImages !== undefined && (
                            <label className="flex items-center gap-2 text-xs text-gray-300">
                              <input
                                type="checkbox"
                                checked={section.options.includeImages}
                                onChange={(e) => updateSectionOption(section.id, 'includeImages', e.target.checked)}
                                className="w-3 h-3"
                              />
                              Include images
                            </label>
                          )}
                          {section.options.detailLevel && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Detail:</span>
                              <select
                                value={section.options.detailLevel}
                                onChange={(e) => updateSectionOption(section.id, 'detailLevel', e.target.value)}
                                className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white"
                              >
                                <option value="summary">Summary</option>
                                <option value="detailed">Detailed</option>
                                <option value="comprehensive">Comprehensive</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => reorderSection(section.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => reorderSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Information */}
        <div className="w-1/2 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name*</label>
                <input
                  type="text"
                  value={projectInfo.projectName}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, projectName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Number</label>
                <input
                  type="text"
                  value={projectInfo.projectNumber || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, projectNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client Name*</label>
                <input
                  type="text"
                  value={projectInfo.clientName}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client Contact</label>
                <input
                  type="text"
                  value={projectInfo.clientContact || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, clientContact: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Designer Name*</label>
                <input
                  type="text"
                  value={projectInfo.designerName}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, designerName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Designer Email</label>
                <input
                  type="email"
                  value={projectInfo.designerEmail || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, designerEmail: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={projectInfo.companyName || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date</label>
                <input
                  type="date"
                  value={projectInfo.date}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={projectInfo.location || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Building Type</label>
                <select
                  value={projectInfo.buildingType || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, buildingType: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                >
                  <option value="">Select type...</option>
                  <option value="office">Office</option>
                  <option value="retail">Retail</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="industrial">Industrial</option>
                  <option value="educational">Educational</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="residential">Residential</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Room Dimensions */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Room Dimensions</h4>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Length (ft)</label>
                  <input
                    type="number"
                    value={projectInfo.roomDimensions?.length || 0}
                    onChange={(e) => setProjectInfo(prev => ({
                      ...prev,
                      roomDimensions: {
                        ...prev.roomDimensions!,
                        length: parseFloat(e.target.value) || 0
                      }
                    }))}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width (ft)</label>
                  <input
                    type="number"
                    value={projectInfo.roomDimensions?.width || 0}
                    onChange={(e) => setProjectInfo(prev => ({
                      ...prev,
                      roomDimensions: {
                        ...prev.roomDimensions!,
                        width: parseFloat(e.target.value) || 0
                      }
                    }))}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Height (ft)</label>
                  <input
                    type="number"
                    value={projectInfo.roomDimensions?.height || 0}
                    onChange={(e) => setProjectInfo(prev => ({
                      ...prev,
                      roomDimensions: {
                        ...prev.roomDimensions!,
                        height: parseFloat(e.target.value) || 0
                      }
                    }))}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Area (sq ft)</label>
                  <input
                    type="number"
                    value={projectInfo.roomDimensions?.area || 0}
                    readOnly
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Report Settings */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Report Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Paper Size</label>
                  <select
                    value={selectedTemplate.settings.paperSize}
                    onChange={(e) => setSelectedTemplate(prev => ({
                      ...prev,
                      settings: { ...prev.settings, paperSize: e.target.value as any }
                    }))}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="letter">Letter (8.5" × 11")</option>
                    <option value="a4">A4 (210mm × 297mm)</option>
                    <option value="legal">Legal (8.5" × 14")</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Orientation</label>
                  <select
                    value={selectedTemplate.settings.orientation}
                    onChange={(e) => setSelectedTemplate(prev => ({
                      ...prev,
                      settings: { ...prev.settings, orientation: e.target.value as any }
                    }))}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.settings.includeLogo}
                    onChange={(e) => setSelectedTemplate(prev => ({
                      ...prev,
                      settings: { ...prev.settings, includeLogo: e.target.checked }
                    }))}
                    className="w-3 h-3"
                  />
                  Include company logo
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.settings.includePageNumbers}
                    onChange={(e) => setSelectedTemplate(prev => ({
                      ...prev,
                      settings: { ...prev.settings, includePageNumbers: e.target.checked }
                    }))}
                    className="w-3 h-3"
                  />
                  Include page numbers
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.settings.colorScheme === 'color'}
                    onChange={(e) => setSelectedTemplate(prev => ({
                      ...prev,
                      settings: { ...prev.settings, colorScheme: e.target.checked ? 'color' : 'grayscale' }
                    }))}
                    className="w-3 h-3"
                  />
                  Use color (uncheck for grayscale)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Report Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-white text-black p-8 rounded-lg">
              {/* Preview content would go here */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{projectInfo.projectName}</h1>
                <p className="text-lg">Lighting Design Report</p>
                <p className="text-sm text-gray-600">{projectInfo.date}</p>
              </div>
              
              <div className="border-t pt-4">
                <h2 className="text-xl font-semibold mb-2">Table of Contents</h2>
                <ol className="list-decimal list-inside space-y-1">
                  {sections
                    .filter(s => s.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <li key={section.id} className="text-sm">
                        {section.title}
                      </li>
                    ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
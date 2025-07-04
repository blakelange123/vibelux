'use client';

import React, { useState } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { generateReportHTML } from '../utils/reportGenerator';
import { 
  FileText, 
  Download, 
  Eye, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Calculator,
  Image,
  Map,
  Zap,
  Shield,
  Building,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import LightingReportBuilder from '@/components/reports/LightingReportBuilder';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'calculation' | 'compliance' | 'presentation' | 'construction' | 'energy';
  icon: React.ComponentType<any>;
  sections: ReportSection[];
  formats: ('pdf' | 'docx' | 'html' | 'xlsx')[];
  professional: boolean;
}

interface ReportSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  dataSource: string[];
  templates: string[];
}

interface ReportConfiguration {
  templateId: string;
  title: string;
  subtitle: string;
  projectInfo: ProjectInfo;
  clientInfo: ClientInfo;
  selectedSections: string[];
  format: 'pdf' | 'docx' | 'html' | 'xlsx';
  includeCalculations: boolean;
  includeCompliance: boolean;
  includeVisualizations: boolean;
  brandingOptions: BrandingOptions;
}

interface ProjectInfo {
  name: string;
  location: string;
  date: string;
  projectNumber: string;
  designer: string;
  reviewer: string;
  phase: string;
}

interface ClientInfo {
  name: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
}

interface BrandingOptions {
  companyLogo: string;
  companyName: string;
  headerColor: string;
  accentColor: string;
  watermark: boolean;
  confidential: boolean;
}

export function ProfessionalReports() {
  const { state } = useDesigner();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfiguration>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['calculation']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<'standard' | 'advanced'>('standard');

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'photometric-calculation',
      name: 'Photometric Calculation Report',
      description: 'Comprehensive lighting calculations with point-by-point analysis',
      category: 'calculation',
      icon: Calculator,
      professional: true,
      formats: ['pdf', 'docx', 'html'],
      sections: [
        {
          id: 'project-summary',
          title: 'Project Summary',
          description: 'Basic project information and scope',
          required: true,
          dataSource: ['project-info'],
          templates: ['title-page', 'executive-summary']
        },
        {
          id: 'design-criteria',
          title: 'Design Criteria',
          description: 'Standards and requirements used',
          required: true,
          dataSource: ['standards', 'requirements'],
          templates: ['criteria-table', 'standards-list']
        },
        {
          id: 'calculation-results',
          title: 'Calculation Results',
          description: 'Detailed photometric calculations',
          required: true,
          dataSource: ['calculations', 'measurements'],
          templates: ['results-table', 'statistical-summary']
        },
        {
          id: 'isolux-diagrams',
          title: 'Isolux Diagrams',
          description: 'Contour plots and false-color maps',
          required: false,
          dataSource: ['visualizations'],
          templates: ['isolux-plot', 'false-color-map']
        },
        {
          id: 'point-calculations',
          title: 'Point-by-Point Calculations',
          description: 'Detailed calculation grid',
          required: false,
          dataSource: ['grid-calculations'],
          templates: ['calculation-grid', 'point-table']
        },
        {
          id: 'fixture-schedule',
          title: 'Fixture Schedule',
          description: 'Complete listing of all fixtures',
          required: true,
          dataSource: ['fixtures'],
          templates: ['fixture-table', 'photometric-data']
        }
      ]
    },
    {
      id: 'compliance-report',
      name: 'Standards Compliance Report',
      description: 'Code compliance verification and certification',
      category: 'compliance',
      icon: Shield,
      professional: true,
      formats: ['pdf', 'docx'],
      sections: [
        {
          id: 'compliance-summary',
          title: 'Compliance Summary',
          description: 'Overall compliance status',
          required: true,
          dataSource: ['compliance-results'],
          templates: ['compliance-dashboard', 'status-summary']
        },
        {
          id: 'standards-verification',
          title: 'Standards Verification',
          description: 'Detailed verification against standards',
          required: true,
          dataSource: ['standards-check'],
          templates: ['verification-table', 'requirements-matrix']
        },
        {
          id: 'emergency-lighting',
          title: 'Emergency Lighting Compliance',
          description: 'Life safety and emergency egress analysis',
          required: false,
          dataSource: ['emergency-calculations'],
          templates: ['egress-analysis', 'emergency-schedule']
        },
        {
          id: 'energy-compliance',
          title: 'Energy Code Compliance',
          description: 'ASHRAE 90.1 and energy code verification',
          required: false,
          dataSource: ['energy-analysis'],
          templates: ['lpd-calculation', 'control-verification']
        }
      ]
    },
    {
      id: 'client-presentation',
      name: 'Client Presentation Report',
      description: 'Executive summary with visualizations for client review',
      category: 'presentation',
      icon: Eye,
      professional: true,
      formats: ['pdf', 'html'],
      sections: [
        {
          id: 'executive-overview',
          title: 'Executive Overview',
          description: 'High-level project summary',
          required: true,
          dataSource: ['project-summary'],
          templates: ['executive-page', 'key-benefits']
        },
        {
          id: 'design-concepts',
          title: 'Design Concepts',
          description: 'Lighting design approach and philosophy',
          required: true,
          dataSource: ['design-narrative'],
          templates: ['concept-description', 'design-goals']
        },
        {
          id: 'visual-renderings',
          title: 'Visual Renderings',
          description: 'Photorealistic renderings and visualizations',
          required: true,
          dataSource: ['renderings', 'visualizations'],
          templates: ['rendering-gallery', 'before-after']
        },
        {
          id: 'performance-summary',
          title: 'Performance Summary',
          description: 'Key performance metrics and benefits',
          required: true,
          dataSource: ['performance-metrics'],
          templates: ['metrics-dashboard', 'energy-savings']
        }
      ]
    },
    {
      id: 'construction-documents',
      name: 'Construction Documents',
      description: 'Detailed specifications and installation drawings',
      category: 'construction',
      icon: Building,
      professional: true,
      formats: ['pdf', 'docx'],
      sections: [
        {
          id: 'technical-specifications',
          title: 'Technical Specifications',
          description: 'Detailed fixture and control specifications',
          required: true,
          dataSource: ['specifications'],
          templates: ['spec-sheets', 'technical-requirements']
        },
        {
          id: 'installation-details',
          title: 'Installation Details',
          description: 'Mounting and wiring details',
          required: true,
          dataSource: ['installation-data'],
          templates: ['detail-drawings', 'wiring-diagrams']
        },
        {
          id: 'control-sequences',
          title: 'Control Sequences',
          description: 'Lighting control programming and sequences',
          required: false,
          dataSource: ['control-logic'],
          templates: ['sequence-diagrams', 'programming-guide']
        },
        {
          id: 'commissioning-plan',
          title: 'Commissioning Plan',
          description: 'Testing and verification procedures',
          required: true,
          dataSource: ['commissioning-procedures'],
          templates: ['test-procedures', 'acceptance-criteria']
        }
      ]
    },
    {
      id: 'energy-analysis',
      name: 'Energy Analysis Report',
      description: 'Comprehensive energy usage and savings analysis',
      category: 'energy',
      icon: Zap,
      professional: true,
      formats: ['pdf', 'xlsx'],
      sections: [
        {
          id: 'energy-summary',
          title: 'Energy Summary',
          description: 'Annual energy consumption analysis',
          required: true,
          dataSource: ['energy-calculations'],
          templates: ['energy-dashboard', 'annual-usage']
        },
        {
          id: 'cost-analysis',
          title: 'Cost Analysis',
          description: 'Operating costs and savings projections',
          required: true,
          dataSource: ['cost-data'],
          templates: ['cost-breakdown', 'roi-analysis']
        },
        {
          id: 'carbon-footprint',
          title: 'Carbon Footprint',
          description: 'Environmental impact assessment',
          required: false,
          dataSource: ['carbon-data'],
          templates: ['emissions-calculation', 'sustainability-metrics']
        },
        {
          id: 'utility-rebates',
          title: 'Utility Rebates',
          description: 'Available rebates and incentives',
          required: false,
          dataSource: ['rebate-data'],
          templates: ['rebate-summary', 'application-guide']
        }
      ]
    }
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setReportConfig({
        templateId,
        title: template.name,
        selectedSections: template.sections.filter(s => s.required).map(s => s.id),
        format: 'pdf',
        includeCalculations: true,
        includeCompliance: true,
        includeVisualizations: true,
        projectInfo: {
          name: '',
          location: '',
          date: new Date().toISOString().split('T')[0],
          projectNumber: '',
          designer: '',
          reviewer: '',
          phase: 'Design Development'
        },
        clientInfo: {
          name: '',
          contact: '',
          address: '',
          email: '',
          phone: ''
        }
      });
    }
  };

  const generateReport = async () => {
    if (!selectedTemplate || !state) return;
    
    setIsGenerating(true);
    
    try {
      // Generate actual report content
      await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for UX
      
      // Convert reportConfig to the format expected by generateReportHTML
      const reportGeneratorConfig = {
        title: reportConfig.title,
        clientName: reportConfig.clientInfo?.name,
        projectName: reportConfig.projectInfo?.name,
        templateId: reportConfig.templateId,
        format: (reportConfig.format === 'xlsx' ? 'html' : reportConfig.format || 'html') as "pdf" | "html" | "docx",
        sections: (reportConfig.selectedSections || []).map(sectionId => ({
          id: sectionId,
          enabled: true
        })),
        includeUniformity: reportConfig.includeCalculations,
        includeFixtureDetails: reportConfig.includeCalculations,
        includeCostAnalysis: reportConfig.includeCalculations,
        includeCompliance: reportConfig.includeCompliance,
        includePPFDMap: reportConfig.includeVisualizations,
        includeDLIData: reportConfig.includeCalculations,
        includeSpectralInfo: reportConfig.includeCalculations
      };
      
      const htmlContent = generateReportHTML(reportGeneratorConfig, state);
      
      let blob: Blob;
      let filename: string;
      
      if (reportConfig.format === 'pdf') {
        // For PDF, we'd need a proper PDF library like jsPDF
        // For now, generate HTML and suggest user to print to PDF
        blob = new Blob([htmlContent], { type: 'text/html' });
        filename = `${reportConfig.title || 'lighting-report'}.html`;
        
        // Show notification about PDF
        alert('PDF generation requires additional setup. The report has been generated as HTML. You can print it to PDF from your browser.');
      } else {
        // Generate HTML report
        blob = new Blob([htmlContent], { type: 'text/html' });
        filename = `${reportConfig.title || 'lighting-report'}.${reportConfig.format}`;
      }
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const categories = [
    { id: 'calculation', name: 'Calculation Reports', icon: Calculator, color: 'text-blue-400' },
    { id: 'compliance', name: 'Compliance Reports', icon: Shield, color: 'text-green-400' },
    { id: 'presentation', name: 'Client Presentations', icon: Eye, color: 'text-purple-400' },
    { id: 'construction', name: 'Construction Docs', icon: Building, color: 'text-orange-400' },
    { id: 'energy', name: 'Energy Analysis', icon: Zap, color: 'text-yellow-400' }
  ];

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header with View Toggle */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Professional Reports</h2>
            <p className="text-sm text-gray-400">Generate professional documentation</p>
          </div>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView('standard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'standard'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Standard Reports
            </button>
            <button
              onClick={() => setActiveView('advanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'advanced'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 inline mr-2" />
              Advanced Builder
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeView === 'advanced' ? (
        <div className="flex-1 overflow-hidden">
          <LightingReportBuilder
            projectData={{
              projectName: state?.settings?.projectName || 'Untitled Project',
              clientName: state?.settings?.clientName || '',
              designerName: state?.settings?.designerName || '',
              roomDimensions: state?.room ? {
                length: state.room.length,
                width: state.room.width,
                height: state.room.height,
                area: state.room.length * state.room.width
              } : undefined,
              fixtures: state?.fixtures || [],
              calculations: state?.ppfdCalculation || {},
              settings: state?.settings || {}
            }}
            onExport={async (format, sections) => {
              // Handle export with project data
              console.log('Exporting report:', format, sections);
            }}
            className="h-full"
          />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Report Templates */}
          <div className="w-80 border-r border-gray-700 flex flex-col">
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {categories.map(category => {
            const categoryTemplates = reportTemplates.filter(t => t.category === category.id);
            const isExpanded = expandedCategories.includes(category.id);
            const Icon = category.icon;
            
            return (
              <div key={category.id} className="border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${category.color}`} />
                    <span className="font-medium text-white">{category.name}</span>
                    <span className="text-xs text-gray-500">({categoryTemplates.length})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-2 bg-gray-800/50 space-y-2">
                    {categoryTemplates.map(template => {
                      const TemplateIcon = template.icon;
                      const isSelected = selectedTemplate === template.id;
                      
                      return (
                        <button
                          key={template.id}
                          onClick={() => selectTemplate(template.id)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            isSelected 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-900 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <TemplateIcon className="w-4 h-4 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm">{template.name}</div>
                              <div className="text-xs opacity-75 mt-1">{template.description}</div>
                              <div className="flex gap-1 mt-2">
                                {template.professional && (
                                  <span className="px-2 py-0.5 bg-gold-600/20 text-gold-300 text-xs rounded">
                                    Professional
                                  </span>
                                )}
                                <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded">
                                  {template.formats.join(', ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="flex-1 flex flex-col">
        {selectedTemplate ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {reportTemplates.find(t => t.id === selectedTemplate)?.name}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {reportTemplates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      // Convert reportConfig to the format expected by generateReportHTML
                      const reportGeneratorConfig = {
                        title: reportConfig.title || selectedTemplate,
                        clientName: reportConfig.clientInfo?.name,
                        projectName: reportConfig.projectInfo?.name,
                        templateId: reportConfig.templateId || selectedTemplate,
                        format: (reportConfig.format === 'xlsx' ? 'html' : reportConfig.format || 'html') as "pdf" | "html" | "docx",
                        sections: (reportConfig.selectedSections || []).map(sectionId => ({
                          id: sectionId,
                          enabled: true
                        })),
                        includeUniformity: reportConfig.includeCalculations,
                        includeFixtureDetails: reportConfig.includeCalculations,
                        includeCostAnalysis: reportConfig.includeCalculations,
                        includeCompliance: reportConfig.includeCompliance,
                        includePPFDMap: reportConfig.includeVisualizations,
                        includeDLIData: reportConfig.includeCalculations,
                        includeSpectralInfo: reportConfig.includeCalculations
                      };
                      
                      const reportHTML = generateReportHTML(reportGeneratorConfig, state);
                      const previewWindow = window.open('', '_blank', 'width=900,height=700');
                      if (previewWindow) {
                        previewWindow.document.write(reportHTML);
                        previewWindow.document.close();
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={generateReport}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Project Information */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-4">Project Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Project Number</label>
                    <input
                      type="text"
                      placeholder="e.g., 2024-001"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Designer</label>
                    <input
                      type="text"
                      placeholder="Lead designer name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Report Sections */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-4">Report Sections</h4>
                <div className="space-y-3">
                  {reportTemplates
                    .find(t => t.id === selectedTemplate)
                    ?.sections.map(section => (
                      <label key={section.id} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={section.required}
                          disabled={section.required}
                          className="mt-1 text-purple-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {section.title}
                            {section.required && (
                              <span className="ml-2 text-red-400 text-sm">*Required</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{section.description}</div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* Output Options */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-4">Output Options</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Format</label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500">
                      <option value="pdf">PDF Document</option>
                      <option value="docx">Word Document</option>
                      <option value="html">HTML Report</option>
                      <option value="xlsx">Excel Spreadsheet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quality</label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500">
                      <option value="standard">Standard Quality</option>
                      <option value="high">High Quality</option>
                      <option value="print">Print Quality</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="text-purple-600" />
                    <span className="text-sm text-gray-300">Include calculation details</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="text-purple-600" />
                    <span className="text-sm text-gray-300">Include visualizations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="text-purple-600" />
                    <span className="text-sm text-gray-300">Include raw data tables</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="text-purple-600" />
                    <span className="text-sm text-gray-300">Apply company branding</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Report Template Selected</h3>
              <p className="text-sm">Choose a report template from the left panel to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
}
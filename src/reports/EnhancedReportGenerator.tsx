'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, Download, Eye, Settings, Palette, Layout, 
  BarChart3, PieChart, TrendingUp, Image, Mail, Printer,
  CheckCircle, Clock, AlertCircle, Sparkles, Zap
} from 'lucide-react';
import { ProfessionalPDFGenerator, ProfessionalReportData } from '@/lib/professional-pdf-generator';
import { PROFESSIONAL_TEMPLATES, getTemplateById, COLOR_SCHEMES } from '@/lib/enhanced-report-templates';

interface EnhancedReportGeneratorProps {
  data: any;
  type: 'investment' | 'tco' | 'technical' | 'executive' | 'operational';
  onClose?: () => void;
}

export function EnhancedReportGenerator({ data, type, onClose }: EnhancedReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('investment_due_diligence');
  const [customization, setCustomization] = useState({
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    layout: 'corporate',
    includeBranding: true,
    includeCharts: true,
    includeAppendix: true,
    confidentialityLevel: 'confidential'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const templates = Object.values(PROFESSIONAL_TEMPLATES);
  const currentTemplate = getTemplateById(selectedTemplate);

  const handleCustomizationChange = (key: string, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const generateProfessionalReport = async (format: 'pdf' | 'preview' = 'pdf') => {
    if (!currentTemplate) return;

    setIsGenerating(true);

    try {
      // Prepare report data
      const reportData: ProfessionalReportData = {
        project: {
          name: data.project?.name || 'Investment Analysis Report',
          client: data.project?.client || 'Valued Client',
          consultant: 'VibeLux Analytics Team',
          date: new Date().toLocaleDateString(),
          location: data.project?.location || 'United States',
          type: currentTemplate.name,
          version: '1.0'
        },
        branding: {
          primaryColor: customization.primaryColor,
          secondaryColor: customization.secondaryColor,
          accentColor: customization.accentColor,
          companyName: 'VibeLux Technologies',
          website: 'www.vibelux.com',
          email: 'info@vibelux.com',
          phone: '+1 (555) 123-4567'
        },
        executiveSummary: {
          overview: generateExecutiveOverview(data, type),
          keyFindings: generateKeyFindings(data, type),
          recommendations: generateRecommendations(data, type),
          investmentSummary: generateInvestmentSummary(data, type)
        },
        technicalData: data.technical || {},
        financialData: data.financial || {},
        chartData: generateChartConfigurations(data, type)
      };

      if (format === 'preview') {
        setPreviewMode(true);
        return;
      }

      // Generate PDF
      const pdfGenerator = new ProfessionalPDFGenerator(reportData);
      const filename = `${reportData.project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdfGenerator.save(filename);

    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExecutiveOverview = (data: any, type: string): string => {
    switch (type) {
      case 'investment':
        return `This comprehensive investment due diligence report provides a detailed analysis of the financial performance, 
        risk assessment, and growth potential of the target investment opportunity. Our analysis indicates ${
          data.investmentReadiness?.overallScore > 75 ? 'strong' : 
          data.investmentReadiness?.overallScore > 50 ? 'moderate' : 'limited'
        } investment readiness with significant opportunities for value creation.`;
      
      case 'tco':
        return `This Total Cost of Ownership analysis evaluates the complete lifecycle costs of the proposed system implementation. 
        Our analysis projects a total investment of $${data.totalCost?.toLocaleString() || 'TBD'} with a payback period of 
        ${data.paybackPeriod || 'TBD'} years and an ROI of ${data.roi || 'TBD'}%.`;
      
      default:
        return 'This professional analysis report provides comprehensive insights and recommendations based on detailed evaluation of the provided data and industry best practices.';
    }
  };

  const generateKeyFindings = (data: any, type: string) => {
    const findings = [];

    if (type === 'investment') {
      findings.push({
        metric: 'Investment Readiness Score',
        value: `${data.investmentReadiness?.overallScore || 0}/100`,
        status: data.investmentReadiness?.overallScore > 75 ? 'excellent' : 
                data.investmentReadiness?.overallScore > 50 ? 'good' : 'needs_attention',
        description: 'Overall assessment of investment viability and risk factors'
      });

      findings.push({
        metric: 'Revenue Growth Rate',
        value: `${data.financialPerformance?.monthlyRevenueGrowth || 0}%`,
        status: data.financialPerformance?.monthlyRevenueGrowth > 10 ? 'excellent' : 
                data.financialPerformance?.monthlyRevenueGrowth > 5 ? 'good' : 'adequate',
        description: 'Monthly revenue growth trend analysis'
      });

      findings.push({
        metric: 'Financial Stability',
        value: `${data.investmentReadiness?.financialStability || 0}/100`,
        status: data.investmentReadiness?.financialStability > 75 ? 'excellent' : 'good',
        description: 'Balance sheet strength and cash flow predictability'
      });
    }

    if (type === 'tco') {
      findings.push({
        metric: 'Total Cost of Ownership',
        value: `$${data.totalCost?.toLocaleString() || 'TBD'}`,
        status: 'good',
        description: 'Complete 10-year lifecycle cost analysis'
      });

      findings.push({
        metric: 'Return on Investment',
        value: `${data.roi || 0}%`,
        status: data.roi > 15 ? 'excellent' : data.roi > 10 ? 'good' : 'adequate',
        description: 'Expected annual return on investment'
      });
    }

    return findings;
  };

  const generateRecommendations = (data: any, type: string): string[] => {
    const recommendations = [];

    if (type === 'investment') {
      recommendations.push('Conduct detailed due diligence on financial projections and market assumptions');
      recommendations.push('Implement robust financial monitoring and reporting systems');
      recommendations.push('Establish clear performance milestones and exit strategies');
      
      if (data.investmentReadiness?.riskFactors?.length > 0) {
        recommendations.push('Address identified risk factors before finalizing investment terms');
      }
    }

    if (type === 'tco') {
      recommendations.push('Prioritize high-impact, low-cost improvements for immediate ROI');
      recommendations.push('Implement phased rollout to minimize risk and optimize learning');
      recommendations.push('Establish baseline metrics for ongoing performance measurement');
    }

    return recommendations;
  };

  const generateInvestmentSummary = (data: any, type: string) => {
    if (type === 'investment') {
      return {
        totalCost: data.revenueSharingProjections?.estimatedInvestorReturn * 12 || 100000,
        roi: data.revenueSharingProjections?.expectedIRR || 15,
        paybackPeriod: data.revenueSharingProjections?.paybackPeriod || 3,
        energySavings: 0
      };
    }

    if (type === 'tco') {
      return {
        totalCost: data.totalCost || 500000,
        roi: data.roi || 12,
        paybackPeriod: data.paybackPeriod || 4,
        energySavings: data.energySavings || 50000
      };
    }

    return {
      totalCost: 0,
      roi: 0,
      paybackPeriod: 0,
      energySavings: 0
    };
  };

  const generateChartConfigurations = (data: any, type: string) => {
    const charts: any = {};

    if (type === 'investment' && data.financialPerformance) {
      charts['Revenue Analysis'] = {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Revenue',
            data: [100000, 110000, 120000, 115000, 135000, 150000],
            borderColor: customization.primaryColor,
            backgroundColor: customization.primaryColor + '20'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Revenue Trend Analysis'
            }
          }
        }
      };
    }

    return charts;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Enhanced Report Generator
              </h2>
              <p className="text-gray-400 mt-1">Create professional, branded reports with advanced styling</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Configuration Panel */}
          <div className="w-1/3 p-6 border-r border-gray-700 overflow-y-auto">
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Report Template</h3>
                <div className="space-y-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Scheme
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-600"
                      />
                      <input
                        type="text"
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-600"
                      />
                      <input
                        type="text"
                        value={customization.secondaryColor}
                        onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customization.accentColor}
                        onChange={(e) => handleCustomizationChange('accentColor', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-600"
                      />
                      <input
                        type="text"
                        value={customization.accentColor}
                        onChange={(e) => handleCustomizationChange('accentColor', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Color Schemes */}
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">Quick Schemes</label>
                  <div className="flex gap-2">
                    {Object.entries(COLOR_SCHEMES).map(([name, colors]) => (
                      <button
                        key={name}
                        onClick={() => {
                          handleCustomizationChange('primaryColor', colors[0]);
                          handleCustomizationChange('secondaryColor', colors[1]);
                          handleCustomizationChange('accentColor', colors[2]);
                        }}
                        className="flex rounded overflow-hidden border border-gray-600 hover:border-gray-500"
                        title={name}
                      >
                        {colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-6"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Layout Options */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Layout Options
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeBranding"
                      checked={customization.includeBranding}
                      onChange={(e) => handleCustomizationChange('includeBranding', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600"
                    />
                    <label htmlFor="includeBranding" className="text-sm text-gray-300">
                      Include Company Branding
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={customization.includeCharts}
                      onChange={(e) => handleCustomizationChange('includeCharts', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600"
                    />
                    <label htmlFor="includeCharts" className="text-sm text-gray-300">
                      Include Charts & Visualizations
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeAppendix"
                      checked={customization.includeAppendix}
                      onChange={(e) => handleCustomizationChange('includeAppendix', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600"
                    />
                    <label htmlFor="includeAppendix" className="text-sm text-gray-300">
                      Include Technical Appendix
                    </label>
                  </div>
                </div>
              </div>

              {/* Confidentiality Level */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Confidentiality</h3>
                <select
                  value={customization.confidentialityLevel}
                  onChange={(e) => handleCustomizationChange('confidentialityLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value="public">Public</option>
                  <option value="internal">Internal Use Only</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg min-h-full p-8" style={{
              fontFamily: 'Inter, sans-serif',
              color: '#1f2937'
            }}>
              {/* Preview Header */}
              <div 
                className="p-6 rounded-lg mb-6 text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">VibeLux Technologies</h1>
                    <p className="opacity-90">Professional Analysis Report</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-75">Generated</div>
                    <div className="font-medium">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                    Executive Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    This comprehensive analysis report provides detailed insights and recommendations 
                    based on thorough evaluation of the provided data. Our professional team has 
                    conducted extensive analysis using industry-standard methodologies and best practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                    Key Performance Indicators
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Overall Score', value: '85/100', status: 'excellent' },
                      { label: 'ROI', value: '15.2%', status: 'good' },
                      { label: 'Risk Level', value: 'Low', status: 'excellent' },
                      { label: 'Confidence', value: '92%', status: 'excellent' }
                    ].map((kpi, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="text-sm text-gray-600">{kpi.label}</div>
                        <div 
                          className="text-xl font-bold mt-1"
                          style={{ 
                            color: kpi.status === 'excellent' ? customization.accentColor : 
                                   kpi.status === 'good' ? customization.primaryColor : '#f59e0b'
                          }}
                        >
                          {kpi.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold mb-3" style={{ color: customization.primaryColor }}>
                    Professional Recommendations
                  </h2>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Implement comprehensive monitoring and reporting systems
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Establish clear performance milestones and success metrics
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      Develop risk mitigation strategies for identified concerns
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Template: {currentTemplate?.name} • {currentTemplate?.sections.length} sections
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => generateProfessionalReport('preview')}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            
            <button
              onClick={() => generateProfessionalReport('pdf')}
              disabled={isGenerating}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
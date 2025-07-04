"use client"

import { useState, useRef } from 'react'
import { 
  FileText, 
  Plus, 
  BarChart3, 
  PieChart, 
  LineChart,
  Download,
  Save,
  Palette,
  FileDown
} from 'lucide-react'
import { EnhancedChartRenderer } from './EnhancedChartRenderer'
import { ReportTemplates } from './ReportTemplates'
import { SalesforceIntegration } from './SalesforceIntegration'
import { ExportCustomization } from './ExportCustomization'
import { ProfessionalPDFExport } from './ProfessionalPDFExport'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { NotificationProvider, useNotifications } from './designer/context/NotificationContext'

interface ReportWidget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text' | 'image'
  title: string
  x: number
  y: number
  width: number
  height: number
  dataSource?: string
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'heatmap' | 'vector' | 'gauge' | 'scatter' | 'radar'
  config: any
}

const sampleData = {
  energy: [
    { name: 'Jan', consumption: 4000, cost: 2400, efficiency: 85 },
    { name: 'Feb', consumption: 3000, cost: 1398, efficiency: 87 },
    { name: 'Mar', consumption: 2000, cost: 9800, efficiency: 89 },
    { name: 'Apr', consumption: 2780, cost: 3908, efficiency: 91 },
    { name: 'May', consumption: 1890, cost: 4800, efficiency: 93 },
    { name: 'Jun', consumption: 2390, cost: 3800, efficiency: 94 }
  ],
  pie: [
    { name: 'Lighting', value: 35, color: '#8884d8' },
    { name: 'HVAC', value: 25, color: '#82ca9d' },
    { name: 'Water', value: 20, color: '#ffc658' },
    { name: 'Other', value: 20, color: '#ff7c7c' }
  ]
}

function EnhancedCustomReportingBuilderContent() {
  const reportRef = useRef<HTMLDivElement>(null)
  const { showNotification } = useNotifications()
  const [widgets, setWidgets] = useState<ReportWidget[]>([])
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [reportName, setReportName] = useState('New Report')
  const [showDataPanel, setShowDataPanel] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showSalesforce, setShowSalesforce] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showExportCustomization, setShowExportCustomization] = useState(false)

  const addWidget = (template: any) => {
    setSelectedTemplate(template)
    setReportName(template.name)
    
    // Add template widgets with proper positioning
    const templateWidgets = template.widgets.map((w: any, index: number) => ({
      ...w,
      id: `widget-${Date.now()}-${index}`,
      x: (w.position?.x || 0) * 8.33, // Convert from 12-column grid to percentage
      y: (w.position?.y || 0) * 10, // Convert from row-based to percentage (assuming 10 rows)
      width: (w.position?.w || 3) * 8.33, // Convert width
      height: (w.position?.h || 2) * 10 // Convert height
    }))
    
    setWidgets(templateWidgets)
  }

  const handleProfessionalExport = async (sections: any[], format: string) => {
    setGeneratingPDF(true)
    try {
      if (format === 'pdf') {
        const exporter = new ProfessionalPDFExport()
        
        const exportData = {
          reportName,
          facilityName: selectedTemplate?.category || 'Professional Cultivation Facility',
          projectDate: new Date().toLocaleDateString(),
          widgets,
          sections,
          includeVibeluxBranding: true
        }
        
        await exporter.generateReport(exportData)
        exporter.save(`${reportName}-${new Date().toISOString().split('T')[0]}.pdf`)
        
        setShowExportCustomization(false)
        showNotification('success', 'Professional PDF report generated successfully!')
      } else if (format === 'excel') {
        // Enhanced Excel export with multiple sheets
        await exportReportAsExcel(sections)
        setShowExportCustomization(false)
      } else if (format === 'word') {
        // Word export functionality
        await exportReportAsWord(sections)
        setShowExportCustomization(false)
      }
    } catch (error) {
      console.error('Error generating professional export:', error)
      showNotification('error', `Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const exportReportAsExcel = async (sections: any[]) => {
    let excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Vibelux Professional Report - ${reportName}</title>
      <style>
        .vibelux-header { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 20px; font-family: Arial; }
        .vibelux-logo { font-size: 24px; font-weight: bold; }
        .section-header { background: #f3f4f6; padding: 10px; font-weight: bold; border-bottom: 2px solid #8b5cf6; }
        .metric-card { background: #f9fafb; padding: 10px; margin: 5px; border-left: 4px solid #8b5cf6; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background: #f3f4f6; font-weight: bold; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>`
    
    // Vibelux Header
    excelContent += `
    <div class="vibelux-header">
      <div class="vibelux-logo">✦ VIBELUX</div>
      <div>Professional Cultivation Intelligence Platform</div>
      <h2>${reportName}</h2>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>`
    
    // Executive Summary (if enabled)
    if (sections.find(s => s.id === 'executive_summary')?.enabled) {
      excelContent += `
      <div class="section-header">Executive Summary</div>
      <p>This comprehensive analysis provides critical insights into facility performance, environmental optimization, and operational efficiency. The assessment covers advanced CFD airflow analysis, climate uniformity measurements, and predictive analytics to ensure optimal growing conditions.</p>`
    }
    
    // Report sections
    widgets.forEach(widget => {
      excelContent += `<div class="section-header">${widget.title}</div>`
      
      if (widget.type === 'metric' && widget.config.metric) {
        excelContent += `
        <div class="metric-card">
          <strong>Value:</strong> ${widget.config.metric.value} ${widget.config.metric.unit || ''}<br>
          <strong>Change:</strong> ${widget.config.metric.change || 0}%<br>
          ${widget.config.subtitle ? `<strong>Note:</strong> ${widget.config.subtitle}` : ''}
        </div>`
      } else if (widget.type === 'table' && widget.config.data) {
        excelContent += '<table><tr>'
        Object.keys(widget.config.data[0] || {}).forEach(key => {
          excelContent += `<th>${key.replace(/_/g, ' ')}</th>`
        })
        excelContent += '</tr>'
        widget.config.data.forEach((row: any) => {
          excelContent += '<tr>'
          Object.values(row).forEach(value => {
            excelContent += `<td>${value}</td>`
          })
          excelContent += '</tr>'
        })
        excelContent += '</table>'
      } else if (widget.type === 'chart' && widget.config.data) {
        const data = widget.config.data
        if (data.length > 0) {
          excelContent += '<table><tr>'
          Object.keys(data[0]).forEach(key => {
            excelContent += `<th>${key}</th>`
          })
          excelContent += '</tr>'
          data.forEach((row: any) => {
            excelContent += '<tr>'
            Object.values(row).forEach(value => {
              excelContent += `<td>${value}</td>`
            })
            excelContent += '</tr>'
          })
          excelContent += '</table>'
        }
      }
    })
    
    // Footer
    excelContent += `
    <div class="footer">
      <p>Generated by Vibelux Professional Platform - All rights reserved.</p>
      <p>This report contains confidential and proprietary information.</p>
    </div>
    </body></html>`
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Vibelux-${reportName}-${new Date().toISOString().split('T')[0]}.xls`
    link.click()
  }

  const exportReportAsWord = async (sections: any[]) => {
    // Similar implementation for Word export
    showNotification('info', 'Word export feature coming soon!')
  }

  const exportReport = async (format: string) => {
    try {
      if (format === 'csv') {
      // Export as CSV
      let csvContent = `${reportName}\n\n`
      
      widgets.forEach(widget => {
        csvContent += `${widget.title}\n`
        
        if (widget.type === 'metric' && widget.config.metric) {
          csvContent += `Value,${widget.config.metric.value} ${widget.config.metric.unit || ''}\n`
          csvContent += `Change,${widget.config.metric.change || 0}%\n`
        } else if (widget.type === 'table' && widget.config.data) {
          csvContent += 'Metric,Value,Target,Status\n'
          widget.config.data.forEach((row: any) => {
            csvContent += `${row.metric},${row.value},${row.target},${row.status}\n`
          })
        } else if (widget.type === 'chart' && widget.config.data) {
          const data = widget.config.data
          if (data.length > 0) {
            const headers = Object.keys(data[0]).join(',')
            csvContent += headers + '\n'
            data.forEach((row: any) => {
              const values = Object.values(row).join(',')
              csvContent += values + '\n'
            })
          }
        }
        csvContent += '\n'
      })
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${reportName}-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } else if (format === 'excel') {
      // Export as Excel (simple CSV with .xls extension for compatibility)
      let excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${reportName}</title></head>
      <body>`
      
      excelContent += `<h1>${reportName}</h1>`
      
      widgets.forEach(widget => {
        excelContent += `<h2>${widget.title}</h2>`
        
        if (widget.type === 'metric' && widget.config.metric) {
          excelContent += `<table border="1">
            <tr><td>Value</td><td>${widget.config.metric.value} ${widget.config.metric.unit || ''}</td></tr>
            <tr><td>Change</td><td>${widget.config.metric.change || 0}%</td></tr>
          </table>`
        } else if (widget.type === 'table' && widget.config.data) {
          excelContent += '<table border="1"><tr><th>Metric</th><th>Value</th><th>Target</th><th>Status</th></tr>'
          widget.config.data.forEach((row: any) => {
            excelContent += `<tr><td>${row.metric}</td><td>${row.value}</td><td>${row.target}</td><td>${row.status}</td></tr>`
          })
          excelContent += '</table>'
        } else if (widget.type === 'chart' && widget.config.data) {
          const data = widget.config.data
          if (data.length > 0) {
            excelContent += '<table border="1"><tr>'
            Object.keys(data[0]).forEach(key => {
              excelContent += `<th>${key}</th>`
            })
            excelContent += '</tr>'
            data.forEach((row: any) => {
              excelContent += '<tr>'
              Object.values(row).forEach(value => {
                excelContent += `<td>${value}</td>`
              })
              excelContent += '</tr>'
            })
            excelContent += '</table>'
          }
        }
        excelContent += '<br/>'
      })
      
      excelContent += '</body></html>'
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${reportName}-${new Date().toISOString().split('T')[0]}.xls`
      link.click()
    } else if (format === 'pdf') {
      setGeneratingPDF(true)
      try {
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        // Add title
        pdf.setFontSize(20)
        pdf.text(reportName, 20, 20)
        
        // Add widgets
        let yPosition = 40
        
        for (const widget of widgets) {
          if (widget.type === 'chart' && widget.config.data) {
            const element = document.getElementById(widget.id)
            if (element) {
              const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
              })
              
              const imgData = canvas.toDataURL('image/png')
              const imgWidth = 170
              const imgHeight = (canvas.height * imgWidth) / canvas.width
              
              if (yPosition + imgHeight > 280) {
                pdf.addPage()
                yPosition = 20
              }
              
              pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
              yPosition += imgHeight + 10
            }
          }
        }
        
        pdf.save(`${reportName}-${new Date().toISOString().split('T')[0]}.pdf`)
      } catch (error) {
        console.error('Error generating PDF:', error)
      } finally {
        setGeneratingPDF(false)
      }
    }
    } catch (error) {
      console.error('Error exporting report:', error)
      showNotification('error', `Error exporting report: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (format === 'pdf') {
        setGeneratingPDF(false)
      }
    }
  }

  const renderWidget = (widget: ReportWidget) => {
    switch (widget.type) {
      case 'chart':
        // Ensure widget.config has the required structure
        const chartConfig = {
          data: [],
          showGrid: true,
          showLegend: true,
          ...widget.config
        };
        
        // Ensure data is an array
        if (!Array.isArray(chartConfig.data)) {
          chartConfig.data = [];
        }
        
        return (
          <div className="h-full p-2">
            <EnhancedChartRenderer
              type={widget.chartType || 'line'}
              title={widget.title}
              config={chartConfig}
            />
          </div>
        )
      
      case 'table':
        return (
          <div className="h-full p-2 overflow-auto">
            <div className="bg-gray-800 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {widget.config.data && widget.config.data.length > 0 && 
                      Object.keys(widget.config.data[0]).map((key: string) => (
                        <th key={key} className="text-left p-3 font-semibold text-gray-300 capitalize">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody>
                  {widget.config.data?.map((row: any, index: number) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                      {Object.entries(row).map(([key, value]: [string, any]) => (
                        <td key={key} className="p-3 text-gray-300">
                          {key === 'status' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              value === 'excellent' ? 'bg-green-500/20 text-green-400' :
                              value === 'good' ? 'bg-blue-500/20 text-blue-400' :
                              value === 'needs_attention' ? 'bg-red-500/20 text-red-400' :
                              value === 'above' ? 'bg-green-500/20 text-green-400' :
                              value === 'below' ? 'bg-blue-500/20 text-blue-400' :
                              value === 'optimal' ? 'bg-green-500/20 text-green-400' :
                              value === 'acceptable' ? 'bg-yellow-500/20 text-yellow-400' :
                              value === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              value === 'low' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {value}
                            </span>
                          ) : key === 'priority' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              value === 'High' ? 'bg-red-500/20 text-red-400' :
                              value === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {value}
                            </span>
                          ) : key === 'impact' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              value === 'High' ? 'bg-red-500/20 text-red-400' :
                              value === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {value}
                            </span>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'metric':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: widget.config.color || '#ffffff' }}>
                {typeof widget.config.metric?.value === 'number' ? 
                  widget.config.metric.value.toLocaleString() : 
                  widget.config.metric?.value || '0'
                }
                {widget.config.metric?.unit ? ` ${widget.config.metric.unit}` : ''}
              </p>
              <p className="text-sm text-gray-400 mt-1">{widget.title}</p>
              {widget.config.metric?.change !== undefined && (
                <p className={`text-xs mt-2 flex items-center justify-center gap-1 ${
                  widget.config.metric.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {widget.config.metric.change >= 0 ? '↑' : '↓'}
                  {Math.abs(widget.config.metric.change)}%
                </p>
              )}
              {widget.config.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{widget.config.subtitle}</p>
              )}
              {widget.config.metric?.confidence && (
                <p className="text-xs text-gray-400 mt-1">
                  Confidence: {widget.config.metric.confidence}%
                </p>
              )}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (widgets.length === 0) {
    return (
      <div className="w-full">
        <ReportTemplates onSelectTemplate={addWidget} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="text-2xl font-bold bg-transparent text-white border-b border-transparent hover:border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDataPanel(!showDataPanel)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Toggle data panel"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setWidgets([])
                setReportName('New Report')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
            <button
              onClick={async () => {
                // Save functionality - store in localStorage for persistence
                const reportData = {
                  name: reportName,
                  widgets: widgets,
                  createdAt: new Date().toISOString(),
                  id: `report-${Date.now()}`
                }
                
                const savedReports = JSON.parse(localStorage.getItem('vibelux-reports') || '[]')
                savedReports.push(reportData)
                localStorage.setItem('vibelux-reports', JSON.stringify(savedReports))
                
                // Show success message
                showNotification('success', `Report "${reportName}" saved successfully!`)
                if (process.env.NODE_ENV === 'development') {
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setShowExportCustomization(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all font-semibold"
              disabled={generatingPDF}
            >
              <Download className="w-4 h-4" />
              {generatingPDF ? 'Generating...' : 'Professional Export'}
            </button>
          </div>
        </div>

        {/* Report Canvas */}
        <div ref={reportRef} className="relative bg-gray-950" style={{ minHeight: '1000px', padding: '20px' }}>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              id={widget.id}
              className="absolute bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-gray-800 hover:border-purple-500 transition-all"
              style={{
                left: `${widget.x || 0}%`,
                top: `${widget.y || 0}%`,
                width: `${widget.width || 25}%`,
                height: `${widget.height || 25}%`,
                minHeight: widget.type === 'table' ? '200px' : '150px',
                minWidth: widget.type === 'table' ? '300px' : '200px'
              }}
              onClick={() => setSelectedWidget(widget.id)}
            >
              <div className="p-3 border-b border-gray-800 bg-gray-800/50">
                <h3 className="font-semibold text-sm text-white">{widget.title}</h3>
              </div>
              <div className="h-[calc(100%-48px)]">
                {renderWidget(widget)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Salesforce Integration */}
      {showSalesforce && (
        <div className="fixed right-4 top-20 w-96 z-50 shadow-2xl">
          <SalesforceIntegration
            data={{
              reportName,
              energySavings: 25,
              roiPercentage: 85,
              fixtureCount: 100,
              totalPPFD: 650,
              coverageArea: 10000
            }}
            reportId={Date.now().toString()}
            onClose={() => setShowSalesforce(false)}
          />
        </div>
      )}

      {/* Professional Export Customization */}
      {showExportCustomization && (
        <ExportCustomization
          reportName={reportName}
          onExport={handleProfessionalExport}
          onClose={() => setShowExportCustomization(false)}
        />
      )}
    </div>
  )
}

export function EnhancedCustomReportingBuilder() {
  return (
    <NotificationProvider>
      <EnhancedCustomReportingBuilderContent />
    </NotificationProvider>
  )
}
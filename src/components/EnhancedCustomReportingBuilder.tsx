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
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { ReportTemplates } from './ReportTemplates'
import { SalesforceIntegration } from './SalesforceIntegration'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ReportWidget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text' | 'image'
  title: string
  x: number
  y: number
  width: number
  height: number
  dataSource?: string
  chartType?: 'line' | 'bar' | 'pie' | 'area'
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

export function EnhancedCustomReportingBuilder() {
  const reportRef = useRef<HTMLDivElement>(null)
  const [widgets, setWidgets] = useState<ReportWidget[]>([])
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [reportName, setReportName] = useState('New Report')
  const [showDataPanel, setShowDataPanel] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showSalesforce, setShowSalesforce] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const addWidget = (template: any) => {
    setSelectedTemplate(template)
    setReportName(template.name)
    
    // Add template widgets
    const templateWidgets = template.widgets.map((w: any, index: number) => ({
      ...w,
      id: `widget-${Date.now()}-${index}`
    }))
    
    setWidgets(templateWidgets)
  }

  const exportReport = async (format: string) => {
    if (format === 'pdf') {
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
  }

  const renderWidget = (widget: ReportWidget) => {
    switch (widget.type) {
      case 'chart':
        return (
          <div className="h-full p-2">
            {widget.chartType === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={widget.config.data || sampleData.energy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="consumption" stroke="#8884d8" />
                  <Line type="monotone" dataKey="efficiency" stroke="#82ca9d" />
                </RechartsLineChart>
              </ResponsiveContainer>
            )}
            {widget.chartType === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={widget.config.data || sampleData.energy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#8884d8" />
                  <Bar dataKey="cost" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {widget.chartType === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={widget.config.data || sampleData.pie}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(widget.config.data || sampleData.pie).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} itemStyle={{ color: '#E5E7EB' }} />
                  <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        )
      
      case 'metric':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-4xl font-bold" style={{ color: widget.config.color }}>
              {widget.config.metric?.value || '0'} {widget.config.metric?.unit || ''}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{widget.title}</p>
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
    <div className="w-full">
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
                // Save functionality
                console.log('Saving report:', reportName)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                disabled={generatingPDF}
              >
                <Download className="w-4 h-4" />
                {generatingPDF ? 'Generating...' : 'Export'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => exportReport('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
                  disabled={generatingPDF}
                >
                  <FileDown className="w-4 h-4" />
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Canvas */}
        <div ref={reportRef} className="relative bg-gray-950" style={{ minHeight: '800px' }}>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              id={widget.id}
              className="absolute bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-gray-800 hover:border-purple-500 cursor-move transition-all"
              style={{
                left: `${widget.x}%`,
                top: `${widget.y}%`,
                width: `${widget.width}%`,
                height: `${widget.height}%`
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
    </div>
  )
}
"use client"

import { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Filter, 
  BarChart3, 
  PieChart, 
  LineChart,
  Table,
  Calendar,
  Download,
  Save,
  Share2,
  Clock,
  DollarSign,
  Zap,
  Leaf,
  Eye,
  Settings,
  ChevronRight,
  X,
  Move,
  Copy,
  Trash2,
  Cloud
} from 'lucide-react'
import { SalesforceIntegration } from './SalesforceIntegration'

interface ReportWidget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text'
  title: string
  dataSource: string
  config: any
  position: { x: number; y: number; w: number; h: number }
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  widgets: ReportWidget[]
  category: string
  lastModified: Date
}

interface DataSource {
  id: string
  name: string
  type: string
  icon: React.FC<any>
  fields: string[]
}

export function CustomReportingBuilder() {
  const [activeReport, setActiveReport] = useState<ReportTemplate | null>(null)
  const [widgets, setWidgets] = useState<ReportWidget[]>([])
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [reportName, setReportName] = useState('New Report')
  const [showDataPanel, setShowDataPanel] = useState(true)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [showSalesforce, setShowSalesforce] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'pie'>('line')

  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Energy Efficiency Report',
      description: 'Track energy usage and costs across facilities',
      widgets: [],
      category: 'Energy',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24)
    },
    {
      id: '2',
      name: 'Crop Yield Analysis',
      description: 'Monitor yield trends and optimize production',
      widgets: [],
      category: 'Production',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48)
    },
    {
      id: '3',
      name: 'Monthly Operations Summary',
      description: 'Comprehensive overview of monthly performance',
      widgets: [],
      category: 'Operations',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72)
    }
  ]

  const dataSources: DataSource[] = [
    {
      id: 'energy',
      name: 'Energy Metrics',
      type: 'timeseries',
      icon: Zap,
      fields: ['power', 'energy', 'cost', 'efficiency', 'peak_demand']
    },
    {
      id: 'production',
      name: 'Production Data',
      type: 'aggregate',
      icon: Leaf,
      fields: ['yield', 'quality', 'harvest_date', 'crop_type', 'area']
    },
    {
      id: 'financial',
      name: 'Financial Data',
      type: 'aggregate',
      icon: DollarSign,
      fields: ['revenue', 'costs', 'profit', 'roi', 'payback']
    },
    {
      id: 'environmental',
      name: 'Environmental',
      type: 'timeseries',
      icon: Leaf,
      fields: ['temperature', 'humidity', 'co2', 'vpd', 'dli']
    }
  ]

  const widgetTypes = [
    { id: 'line-chart', type: 'chart', name: 'Line Chart', icon: LineChart },
    { id: 'bar-chart', type: 'chart', name: 'Bar Chart', icon: BarChart3 },
    { id: 'pie-chart', type: 'chart', name: 'Pie Chart', icon: PieChart },
    { id: 'data-table', type: 'table', name: 'Data Table', icon: Table },
    { id: 'metric-card', type: 'metric', name: 'Metric Card', icon: FileText },
    { id: 'text-block', type: 'text', name: 'Text Block', icon: FileText }
  ]

  const addWidget = (type: string) => {
    const widgetType = widgetTypes.find(w => w.id === type)
    if (!widgetType) return

    const newWidget: ReportWidget = {
      id: Date.now().toString(),
      type: widgetType.type as any,
      title: `New ${widgetType.name}`,
      dataSource: '',
      config: {},
      position: { x: 0, y: 0, w: 4, h: 3 }
    }

    setWidgets([...widgets, newWidget])
    setSelectedWidget(newWidget.id)
  }

  const updateWidget = (widgetId: string, updates: Partial<ReportWidget>) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ))
  }

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
    if (selectedWidget === widgetId) {
      setSelectedWidget(null)
    }
  }

  const duplicateWidget = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (!widget) return

    const newWidget: ReportWidget = {
      ...widget,
      id: Date.now().toString(),
      position: {
        ...widget.position,
        x: widget.position.x + 1,
        y: widget.position.y + 1
      }
    }

    setWidgets([...widgets, newWidget])
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // In a real app, this would generate and download the report
  }

  const saveReport = () => {
    // Report configuration would be saved here
    // In a real app, this would save the report configuration
  }

  const renderWidget = (widget: ReportWidget) => {
    switch (widget.type) {
      case 'chart':
        return (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{widget.title}</p>
            </div>
          </div>
        )
      case 'table':
        return (
          <div className="h-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Change</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i} className="border-b">
                    <td className="p-2">2024-01-{String(i).padStart(2, '0')}</td>
                    <td className="p-2">{(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100).toFixed(1)}</td>
                    <td className="p-2 text-green-400">+{(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'metric':
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-indigo-400">{(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000).toFixed(0)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{widget.title}</p>
          </div>
        )
      case 'text':
        return (
          <div className="h-full p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {widget.title}: Add your text content here...
            </p>
          </div>
        )
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-600" />
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowScheduler(!showScheduler)}
            className={`p-2 rounded transition-colors ${
              showScheduler 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Schedule Report"
          >
            <Clock className="w-5 h-5" />
          </button>
          <button
            onClick={saveReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={() => exportReport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Export as PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Export as Excel
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Export as CSV
              </button>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={`p-2 rounded transition-colors ${
                showShareMenu 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Share Report"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    setShowShareMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => {
                    const subject = encodeURIComponent(`VibeLux Report: ${reportName}`)
                    const body = encodeURIComponent(`Check out this VibeLux report: ${window.location.href}`)
                    window.open(`mailto:?subject=${subject}&body=${body}`)
                    setShowShareMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Email Report
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Create Public Link
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowSalesforce(!showSalesforce)}
            className={`p-2 rounded transition-colors ${
              showSalesforce 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Salesforce Integration"
          >
            <Cloud className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Panel - Widget Library */}
        <div className="w-48 border-r border-gray-700 p-4 overflow-y-auto bg-gray-800">
          <h3 className="font-semibold mb-4 text-gray-200">Widgets</h3>
          <div className="space-y-2">
            {widgetTypes.map(widget => (
              <button
                key={widget.id}
                onClick={() => addWidget(widget.id)}
                className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <widget.icon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-200">{widget.name}</span>
              </button>
            ))}
          </div>

          <h3 className="font-semibold mt-6 mb-4 text-gray-200">Data Sources</h3>
          <div className="space-y-2">
            {dataSources.map(source => (
              <div
                key={source.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                draggable
                onDragStart={() => setDraggedWidget(source.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <source.icon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm">{source.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {source.fields.slice(0, 3).map(field => (
                    <span
                      key={field}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                    >
                      {field}
                    </span>
                  ))}
                  {source.fields.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{source.fields.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mt-6 mb-4 text-gray-200">Templates</h3>
          <div className="space-y-2">
            {reportTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  setActiveReport(template)
                  setReportName(template.name)
                }}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <p className="font-medium text-sm">{template.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Report Canvas */}
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
          {widgets.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Start Building Your Report</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add widgets from the left panel to begin
                </p>
                <button
                  onClick={() => addWidget('metric-card')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add First Widget
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer ${
                    selectedWidget === widget.id ? 'ring-2 ring-indigo-600' : ''
                  }`}
                  style={{
                    gridColumn: `span ${widget.position.w}`,
                    gridRow: `span ${widget.position.h}`
                  }}
                  onClick={() => setSelectedWidget(widget.id)}
                >
                  <div className="h-full relative group">
                    {/* Widget Controls */}
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateWidget(widget.id)
                          }}
                          className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-gray-50"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteWidget(widget.id)
                          }}
                          className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-red-50 text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {renderWidget(widget)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Widget Settings */}
        {selectedWidget && (
          <div className="w-80 border-l p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Widget Settings</h3>
              <button
                onClick={() => setSelectedWidget(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const widget = widgets.find(w => w.id === selectedWidget)
              if (!widget) return null

              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={widget.title}
                      onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data Source</label>
                    <select
                      value={widget.dataSource}
                      onChange={(e) => updateWidget(widget.id, { dataSource: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select data source...</option>
                      {dataSources.map(source => (
                        <option key={source.id} value={source.id}>
                          {source.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Width</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={widget.position.w}
                          onChange={(e) => updateWidget(widget.id, {
                            position: { ...widget.position, w: Number(e.target.value) }
                          })}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Height</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={widget.position.h}
                          onChange={(e) => updateWidget(widget.id, {
                            position: { ...widget.position, h: Number(e.target.value) }
                          })}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {widget.type === 'chart' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Chart Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => setSelectedChartType('line')}
                          className={`p-2 border rounded transition-colors ${
                            selectedChartType === 'line' 
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <LineChart className="w-4 h-4 mx-auto" />
                        </button>
                        <button 
                          onClick={() => setSelectedChartType('bar')}
                          className={`p-2 border rounded transition-colors ${
                            selectedChartType === 'bar' 
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4 mx-auto" />
                        </button>
                        <button 
                          onClick={() => setSelectedChartType('pie')}
                          className={`p-2 border rounded transition-colors ${
                            selectedChartType === 'pie' 
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <PieChart className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Filters</label>
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                        showFilters 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      Add Filter
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Salesforce Integration Panel */}
      {showSalesforce && (
        <div className="fixed right-4 top-20 w-96 z-50 shadow-2xl">
          <SalesforceIntegration
            data={{
              reportName,
              projectStatus: 'In Progress',
              energySavings: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30 + 20),
              roiPercentage: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40 + 60),
              fixtureCount: widgets.filter(w => w.dataSource === 'energy').length * 50 || 100,
              totalPPFD: 650,
              coverageArea: 10000,
              annualYieldEstimate: 45000,
              implementationTimeline: '3-4 months',
              annualSavings: 125000,
              paybackPeriod: 18,
              yieldImprovement: 25,
              spectrumOptimization: 'Full Spectrum LED',
              qualityImprovement: 'A+ Grade'
            }}
            reportId={activeReport?.id || Date.now().toString()}
            onClose={() => setShowSalesforce(false)}
          />
        </div>
      )}

      {/* Schedule Report Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Schedule Report</h2>
              <button
                onClick={() => setShowScheduler(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Recipients</label>
                <input
                  type="email"
                  placeholder="Enter email addresses (comma-separated)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowScheduler(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowScheduler(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="fixed right-4 top-20 w-80 bg-white dark:bg-gray-800 rounded-xl border shadow-2xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Report Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Facility</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option value="all">All Facilities</option>
                <option value="greenhouse-a">Greenhouse A</option>
                <option value="indoor-farm-1">Indoor Farm 1</option>
                <option value="vertical-farm-b">Vertical Farm B</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Metrics</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Revenue</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Energy Usage</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Yield Data</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4 flex gap-2">
              <button 
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear
              </button>
              <button 
                onClick={() => {
                  setShowFilters(false);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
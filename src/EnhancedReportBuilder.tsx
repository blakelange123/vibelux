"use client"

import { useState, useRef, useCallback } from 'react'
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
  Cloud,
  Grid,
  Layout,
  Image,
  Type,
  Hash,
  TrendingUp,
  Database,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Hand,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Hexagon
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { EnhancedPDFReportGenerator, ComprehensiveFacilityData, REPORT_TEMPLATES } from '../lib/enhanced-pdf-report-generator'
import { AdvancedExcelExporter, EXCEL_EXPORT_PRESETS } from '../lib/advanced-excel-export'

interface ReportWidget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text' | 'image' | 'divider' | 'spacer' | 'gauge' | 'progress' | 'heatmap'
  title: string
  dataSource: string
  config: WidgetConfig
  position: { x: number; y: number; w: number; h: number }
  style: WidgetStyle
  data?: any
}

interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'area' | 'gauge'
  dataFields?: string[]
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count'
  timeRange?: string
  filters?: FilterConfig[]
  groupBy?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  showLegend?: boolean
  showGrid?: boolean
  colorScheme?: string[]
  numberFormat?: string
  dateFormat?: string
  customSql?: string
}

interface WidgetStyle {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  textColor?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  textAlign?: 'left' | 'center' | 'right'
  padding?: number
  margin?: number
  shadow?: boolean
  opacity?: number
}

interface FilterConfig {
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in'
  value: any
  logic?: 'and' | 'or'
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  widgets: ReportWidget[]
  layout: LayoutConfig
  theme: ThemeConfig
  lastModified: Date
  isPublic: boolean
  tags: string[]
}

interface LayoutConfig {
  gridSize: number
  snapToGrid: boolean
  responsiveBreakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  margins: { top: number; right: number; bottom: number; left: number }
}

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: number
}

interface DataSource {
  id: string
  name: string
  type: 'sql' | 'api' | 'csv' | 'json' | 'real-time'
  connectionString?: string
  endpoint?: string
  fields: DataField[]
  icon: React.FC<any>
  lastUpdated: Date
  refreshRate?: number
}

interface DataField {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  format?: string
  description?: string
}

export function EnhancedReportBuilder() {
  const [widgets, setWidgets] = useState<ReportWidget[]>([])
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([])
  const [reportName, setReportName] = useState('New Enhanced Report')
  const [showDataPanel, setShowDataPanel] = useState(true)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [currentTool, setCurrentTool] = useState<'select' | 'pan' | 'draw'>('select')
  const [zoom, setZoom] = useState(100)
  const [gridVisible, setGridVisible] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#10B981',
    secondaryColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter',
    borderRadius: 8
  })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Enhanced data sources with real-time capabilities
  const dataSources: DataSource[] = [
    {
      id: 'energy',
      name: 'Energy Metrics',
      type: 'real-time',
      icon: Zap,
      fields: [
        { name: 'timestamp', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
        { name: 'power_consumption', type: 'number', format: '0.00', description: 'Current power consumption in kW' },
        { name: 'energy_cost', type: 'number', format: '$0.00', description: 'Real-time energy cost' },
        { name: 'efficiency_ratio', type: 'number', format: '0.00%', description: 'Energy efficiency percentage' },
        { name: 'peak_demand', type: 'number', format: '0.00', description: 'Peak demand in kW' },
        { name: 'power_factor', type: 'number', format: '0.000', description: 'Power factor' },
        { name: 'voltage', type: 'number', format: '0.0', description: 'Line voltage' },
        { name: 'current', type: 'number', format: '0.0', description: 'Line current in amps' }
      ],
      lastUpdated: new Date(),
      refreshRate: 30000 // 30 seconds
    },
    {
      id: 'production',
      name: 'Production Analytics',
      type: 'sql',
      icon: Leaf,
      fields: [
        { name: 'harvest_date', type: 'date', format: 'YYYY-MM-DD' },
        { name: 'crop_type', type: 'string', description: 'Type of crop harvested' },
        { name: 'yield_kg', type: 'number', format: '0.00', description: 'Yield in kilograms' },
        { name: 'quality_grade', type: 'string', description: 'Quality classification' },
        { name: 'growing_cycle_days', type: 'number', description: 'Days from seed to harvest' },
        { name: 'area_m2', type: 'number', format: '0.00', description: 'Growing area in square meters' },
        { name: 'yield_per_m2', type: 'number', format: '0.00', description: 'Yield per square meter' },
        { name: 'revenue', type: 'number', format: '$0.00', description: 'Revenue from harvest' }
      ],
      lastUpdated: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 'environmental',
      name: 'Environmental Data',
      type: 'real-time',
      icon: Leaf,
      fields: [
        { name: 'timestamp', type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
        { name: 'temperature', type: 'number', format: '0.0°C', description: 'Air temperature' },
        { name: 'humidity', type: 'number', format: '0.0%', description: 'Relative humidity' },
        { name: 'co2_ppm', type: 'number', format: '0', description: 'CO2 concentration' },
        { name: 'vpd', type: 'number', format: '0.00', description: 'Vapor Pressure Deficit' },
        { name: 'dli', type: 'number', format: '0.0', description: 'Daily Light Integral' },
        { name: 'ppfd', type: 'number', format: '0', description: 'Photosynthetic Photon Flux Density' },
        { name: 'air_speed', type: 'number', format: '0.0', description: 'Air velocity in m/s' }
      ],
      lastUpdated: new Date(),
      refreshRate: 60000 // 1 minute
    },
    {
      id: 'financial',
      name: 'Financial Performance',
      type: 'sql',
      icon: DollarSign,
      fields: [
        { name: 'period', type: 'date', format: 'YYYY-MM' },
        { name: 'revenue', type: 'number', format: '$0,0.00', description: 'Monthly revenue' },
        { name: 'operating_costs', type: 'number', format: '$0,0.00', description: 'Operating expenses' },
        { name: 'energy_costs', type: 'number', format: '$0,0.00', description: 'Energy expenses' },
        { name: 'labor_costs', type: 'number', format: '$0,0.00', description: 'Labor expenses' },
        { name: 'profit_margin', type: 'number', format: '0.00%', description: 'Profit margin percentage' },
        { name: 'roi', type: 'number', format: '0.00%', description: 'Return on investment' },
        { name: 'cash_flow', type: 'number', format: '$0,0.00', description: 'Net cash flow' }
      ],
      lastUpdated: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: 'equipment',
      name: 'Equipment Status',
      type: 'real-time',
      icon: Settings,
      fields: [
        { name: 'equipment_id', type: 'string', description: 'Equipment identifier' },
        { name: 'equipment_type', type: 'string', description: 'Type of equipment' },
        { name: 'status', type: 'string', description: 'Operational status' },
        { name: 'runtime_hours', type: 'number', format: '0.0', description: 'Runtime in hours' },
        { name: 'efficiency', type: 'number', format: '0.00%', description: 'Current efficiency' },
        { name: 'maintenance_due', type: 'date', format: 'YYYY-MM-DD', description: 'Next maintenance date' },
        { name: 'fault_count', type: 'number', description: 'Number of faults' },
        { name: 'last_service', type: 'date', format: 'YYYY-MM-DD', description: 'Last service date' }
      ],
      lastUpdated: new Date(),
      refreshRate: 300000 // 5 minutes
    }
  ]

  // Enhanced widget types with more visualization options
  const widgetTypes = [
    { id: 'line-chart', type: 'chart', name: 'Line Chart', icon: LineChart, description: 'Time series and trend analysis' },
    { id: 'bar-chart', type: 'chart', name: 'Bar Chart', icon: BarChart3, description: 'Categorical data comparison' },
    { id: 'pie-chart', type: 'chart', name: 'Pie Chart', icon: PieChart, description: 'Proportional data visualization' },
    { id: 'gauge-chart', type: 'gauge', name: 'Gauge Chart', icon: TrendingUp, description: 'Single metric with target range' },
    { id: 'heatmap', type: 'heatmap', name: 'Heat Map', icon: Grid, description: '2D data density visualization' },
    { id: 'data-table', type: 'table', name: 'Data Table', icon: Table, description: 'Tabular data display' },
    { id: 'metric-card', type: 'metric', name: 'KPI Card', icon: Hash, description: 'Key performance indicator' },
    { id: 'progress-bar', type: 'progress', name: 'Progress Bar', icon: TrendingUp, description: 'Progress towards goal' },
    { id: 'text-block', type: 'text', name: 'Text Block', icon: Type, description: 'Rich text content' },
    { id: 'image', type: 'image', name: 'Image', icon: Image, description: 'Static or dynamic images' },
    { id: 'divider', type: 'divider', name: 'Divider', icon: AlignCenter, description: 'Visual separator' },
    { id: 'spacer', type: 'spacer', name: 'Spacer', icon: Square, description: 'Empty space' }
  ]

  // Professional report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'executive-dashboard',
      name: 'Executive Dashboard',
      description: 'High-level KPIs and performance overview for executives',
      category: 'Executive',
      widgets: [],
      layout: {
        gridSize: 20,
        snapToGrid: true,
        responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 },
        margins: { top: 20, right: 20, bottom: 20, left: 20 }
      },
      theme: {
        primaryColor: '#1F2937',
        secondaryColor: '#10B981',
        backgroundColor: '#F9FAFB',
        textColor: '#374151',
        fontFamily: 'Inter',
        borderRadius: 8
      },
      lastModified: new Date(),
      isPublic: true,
      tags: ['executive', 'kpi', 'overview']
    },
    {
      id: 'operations-report',
      name: 'Operations Performance Report',
      description: 'Detailed operational metrics and equipment status',
      category: 'Operations',
      widgets: [],
      layout: {
        gridSize: 15,
        snapToGrid: true,
        responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 },
        margins: { top: 15, right: 15, bottom: 15, left: 15 }
      },
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Roboto',
        borderRadius: 6
      },
      lastModified: new Date(Date.now() - 86400000),
      isPublic: true,
      tags: ['operations', 'equipment', 'performance']
    },
    {
      id: 'energy-analytics',
      name: 'Energy Analytics Dashboard',
      description: 'Comprehensive energy consumption and efficiency analysis',
      category: 'Energy',
      widgets: [],
      layout: {
        gridSize: 25,
        snapToGrid: false,
        responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 },
        margins: { top: 25, right: 25, bottom: 25, left: 25 }
      },
      theme: {
        primaryColor: '#059669',
        secondaryColor: '#DC2626',
        backgroundColor: '#ECFDF5',
        textColor: '#064E3B',
        fontFamily: 'Inter',
        borderRadius: 12
      },
      lastModified: new Date(Date.now() - 172800000),
      isPublic: false,
      tags: ['energy', 'sustainability', 'analytics']
    }
  ]

  const addWidget = useCallback((type: string) => {
    const widgetType = widgetTypes.find(w => w.id === type)
    if (!widgetType) return

    const newWidget: ReportWidget = {
      id: Date.now().toString(),
      type: widgetType.type as any,
      title: `New ${widgetType.name}`,
      dataSource: '',
      config: {
        chartType: type.includes('chart') ? type.replace('-chart', '') as any : undefined,
        showLegend: true,
        showGrid: true,
        colorScheme: [theme.primaryColor, theme.secondaryColor, '#F59E0B', '#EF4444', '#8B5CF6'],
        numberFormat: '0,0.00',
        dateFormat: 'YYYY-MM-DD'
      },
      position: { x: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8), y: 0, w: 4, h: 3 },
      style: {
        backgroundColor: theme.backgroundColor,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: theme.borderRadius,
        textColor: theme.textColor,
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'left',
        padding: 16,
        margin: 8,
        shadow: true,
        opacity: 1
      }
    }

    setWidgets(prev => [...prev, newWidget])
    setSelectedWidget(newWidget.id)
  }, [theme, widgetTypes])

  const updateWidget = useCallback((widgetId: string, updates: Partial<ReportWidget>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ))
  }, [])

  const updateWidgetConfig = useCallback((widgetId: string, configUpdates: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, config: { ...w.config, ...configUpdates } } : w
    ))
  }, [])

  const updateWidgetStyle = useCallback((widgetId: string, styleUpdates: Partial<WidgetStyle>) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, style: { ...w.style, ...styleUpdates } } : w
    ))
  }, [])

  const deleteWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
    setSelectedWidgets(prev => prev.filter(id => id !== widgetId))
    if (selectedWidget === widgetId) {
      setSelectedWidget(null)
    }
  }, [selectedWidget])

  const duplicateWidget = useCallback((widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (!widget) return

    const newWidget: ReportWidget = {
      ...widget,
      id: Date.now().toString(),
      title: `${widget.title} (Copy)`,
      position: {
        ...widget.position,
        x: widget.position.x + 1,
        y: widget.position.y + 1
      }
    }

    setWidgets(prev => [...prev, newWidget])
    setSelectedWidget(newWidget.id)
  }, [widgets])

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    
    if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      // Reorder widgets on canvas
      const newWidgets = Array.from(widgets)
      const [reorderedWidget] = newWidgets.splice(source.index, 1)
      newWidgets.splice(destination.index, 0, reorderedWidget)
      setWidgets(newWidgets)
    }
  }, [widgets])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'select') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Check if click is on a widget
      const clickedWidget = widgets.find(widget => {
        const widgetX = widget.position.x * 50
        const widgetY = widget.position.y * 50
        const widgetW = widget.position.w * 50
        const widgetH = widget.position.h * 50
        
        return x >= widgetX && x <= widgetX + widgetW && 
               y >= widgetY && y <= widgetY + widgetH
      })
      
      if (clickedWidget) {
        if (e.ctrlKey || e.metaKey) {
          // Multi-select
          setSelectedWidgets(prev => 
            prev.includes(clickedWidget.id) 
              ? prev.filter(id => id !== clickedWidget.id)
              : [...prev, clickedWidget.id]
          )
        } else {
          setSelectedWidget(clickedWidget.id)
          setSelectedWidgets([clickedWidget.id])
        }
      } else {
        setSelectedWidget(null)
        setSelectedWidgets([])
      }
    }
  }, [currentTool, widgets])

  const exportToPDF = useCallback(async () => {
    // Mock facility data for demo
    const mockData: ComprehensiveFacilityData = {
      project: {
        name: reportName,
        client: 'Demo Client',
        consultant: 'Vibelux',
        date: new Date(),
        location: 'Demo Location',
        facility: {
          type: 'greenhouse',
          area: 10000,
          zones: 4,
          crops: ['Tomatoes', 'Lettuce', 'Herbs'],
          production_method: 'hydroponic'
        }
      },
      lighting: {
        fixtures: [],
        analysis: {
          ppfd: { min: 400, max: 800, avg: 600, uniformity: 0.85, coefficient_of_variation: 15 },
          dli: { twelve_hour: 26, sixteen_hour: 35, eighteen_hour: 39, twenty_hour: 43 },
          spectral_analysis: {
            par_percentage: 95,
            blue_percentage: 20,
            green_percentage: 25,
            red_percentage: 45,
            far_red_percentage: 8,
            uv_percentage: 2,
            red_far_red_ratio: 1.2,
            blue_red_ratio: 0.44
          }
        }
      },
      environment: {
        climate_zones: [{
          name: 'Zone 1',
          temperature_range: { min: 20, max: 26 },
          humidity_range: { min: 60, max: 75 },
          co2_level: 1000,
          air_changes_per_hour: 0.5,
          vpd_target: 1.2
        }],
        hvac_system: {
          type: 'Precision HVAC',
          capacity: 50,
          efficiency_rating: 18,
          annual_energy_use: 150000
        },
        monitoring: {
          sensors: 100,
          data_points_per_day: 144000,
          alert_thresholds: {}
        }
      },
      energy: {
        lighting_load: 250,
        hvac_load: 100,
        other_loads: 50,
        total_demand: 400,
        annual_consumption: 2000000,
        energy_costs: {
          lighting: 180000,
          hvac: 72000,
          other: 36000,
          total: 288000
        },
        carbon_footprint: {
          annual_co2: 900000,
          carbon_intensity: 0.45
        }
      },
      production: {
        yield_estimates: [{
          crop_type: 'Tomatoes',
          cycles_per_year: 6,
          yield_per_cycle: 22,
          annual_yield: 132000,
          quality_grade: 'A+'
        }],
        optimization: {
          light_saturation_point: 800,
          photosynthetic_efficiency: 0.045,
          water_use_efficiency: 35,
          nutrient_use_efficiency: 0.92
        }
      },
      financial: {
        capex: {
          lighting_equipment: 500000,
          controls: 100000,
          installation: 150000,
          commissioning: 50000,
          total: 800000
        },
        opex: {
          annual_energy: 288000,
          maintenance: 40000,
          replacement_reserve: 30000,
          total: 358000
        },
        roi: {
          payback_period: 3.2,
          npv: 450000,
          irr: 0.18,
          annual_savings: 120000,
          lifetime_savings: 1800000
        }
      },
      compliance: {
        lighting_standards: {
          ies_rp_52: true,
          ashrae_90_1: true,
          energy_star: true,
          california_title_24: true
        },
        certifications: {
          leed_points: 12,
          breeam_rating: 'Excellent',
          living_building_challenge: false
        },
        safety: {
          ul_listed: true,
          ce_marked: true,
          fcc_compliant: true,
          ip_rating: 'IP65'
        }
      }
    }

    const generator = new EnhancedPDFReportGenerator(
      REPORT_TEMPLATES.COMPREHENSIVE,
      {
        companyName: 'Vibelux',
        branding: {
          primaryColor: { r: 16, g: 185, b: 129 },
          secondaryColor: { r: 99, g: 102, b: 241 }
        },
        customization: {
          includeCharts: true,
          includePhotos: false,
          includeAppendix: true
        }
      }
    )

    await generator.generateComprehensiveReport(mockData)
  }, [reportName])

  const exportToExcel = useCallback(async () => {
    // Mock facility data for demo
    const mockData: ComprehensiveFacilityData = {
      // ... (same as PDF export)
    } as any

    const exporter = new AdvancedExcelExporter(EXCEL_EXPORT_PRESETS.COMPREHENSIVE)
    await exporter.exportComprehensiveReport(mockData)
  }, [])

  const saveReport = useCallback(() => {
    const reportConfig = {
      name: reportName,
      widgets: widgets,
      theme: theme,
      lastModified: new Date()
    }
    
    // Save to localStorage for demo
    localStorage.setItem('vibelux-report-config', JSON.stringify(reportConfig))
    
  }, [reportName, widgets, theme])

  const loadTemplate = useCallback((template: ReportTemplate) => {
    setReportName(template.name)
    setTheme(template.theme)
    setWidgets(template.widgets)
    setSelectedWidget(null)
    setSelectedWidgets([])
  }, [])

  const renderWidget = useCallback((widget: ReportWidget) => {
    const style = {
      backgroundColor: widget.style.backgroundColor,
      borderColor: widget.style.borderColor,
      borderWidth: widget.style.borderWidth,
      borderRadius: widget.style.borderRadius,
      color: widget.style.textColor,
      fontSize: widget.style.fontSize,
      fontWeight: widget.style.fontWeight,
      textAlign: widget.style.textAlign,
      padding: widget.style.padding,
      margin: widget.style.margin,
      opacity: widget.style.opacity,
      boxShadow: widget.style.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
    }

    switch (widget.type) {
      case 'chart':
        return (
          <div style={style} className="h-full flex items-center justify-center border rounded">
            <div className="text-center">
              {widget.config.chartType === 'line' && <LineChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />}
              {widget.config.chartType === 'bar' && <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />}
              {widget.config.chartType === 'pie' && <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />}
              <p className="text-sm font-medium">{widget.title}</p>
              <p className="text-xs text-gray-500">{widget.config.chartType?.toUpperCase()} Chart</p>
            </div>
          </div>
        )
      case 'table':
        return (
          <div style={style} className="h-full overflow-auto border rounded">
            <div className="p-2">
              <h3 className="font-medium text-sm mb-2">{widget.title}</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-1">Metric</th>
                    <th className="text-left p-1">Value</th>
                    <th className="text-left p-1">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i} className="border-b">
                      <td className="p-1">Sample {i}</td>
                      <td className="p-1">{(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100).toFixed(1)}</td>
                      <td className="p-1 text-green-500">+{(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'metric':
        return (
          <div style={style} className="h-full flex flex-col items-center justify-center border rounded">
            <p className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              {(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">{widget.title}</p>
            <p className="text-xs text-green-500 mt-1">+{(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(1)}%</p>
          </div>
        )
      case 'gauge':
        return (
          <div style={style} className="h-full flex flex-col items-center justify-center border rounded">
            <div className="relative w-20 h-20 mb-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={theme.primaryColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                  {Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm font-medium">{widget.title}</p>
          </div>
        )
      case 'progress':
        const progress = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100
        return (
          <div style={style} className="h-full flex flex-col justify-center border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">{widget.title}</p>
              <p className="text-sm font-bold">{progress.toFixed(0)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: theme.primaryColor
                }}
              />
            </div>
          </div>
        )
      case 'heatmap':
        return (
          <div style={style} className="h-full border rounded p-2">
            <h3 className="font-medium text-sm mb-2">{widget.title}</h3>
            <div className="grid grid-cols-8 gap-1 h-full">
              {Array.from({ length: 32 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-sm"
                  style={{
                    backgroundColor: `${theme.primaryColor}${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 255).toString(16).padStart(2, '0')}`
                  }}
                />
              ))}
            </div>
          </div>
        )
      case 'text':
        return (
          <div style={style} className="h-full border rounded p-4">
            <h3 className="font-medium text-sm mb-2">{widget.title}</h3>
            <p className="text-sm text-gray-600">
              This is a text widget. You can add rich text content, markdown, or HTML here.
              Perfect for insights, explanations, or commentary.
            </p>
          </div>
        )
      case 'image':
        return (
          <div style={style} className="h-full border rounded flex items-center justify-center">
            <div className="text-center">
              <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">{widget.title}</p>
              <p className="text-xs text-gray-500">Click to add image</p>
            </div>
          </div>
        )
      case 'divider':
        return (
          <div style={style} className="h-full flex items-center">
            <div 
              className="w-full h-px"
              style={{ backgroundColor: widget.style.borderColor }}
            />
          </div>
        )
      case 'spacer':
        return (
          <div style={style} className="h-full">
            {/* Empty spacer */}
          </div>
        )
      default:
        return (
          <div style={style} className="h-full border rounded flex items-center justify-center">
            <p className="text-sm text-gray-500">Unknown widget type</p>
          </div>
        )
    }
  }, [theme])

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-600" />
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none min-w-0 flex-1"
            />
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Tool Selection */}
            <div className="flex items-center border rounded-lg p-1">
              <button
                onClick={() => setCurrentTool('select')}
                className={`p-2 rounded ${currentTool === 'select' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                title="Select Tool"
              >
                <MousePointer className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentTool('pan')}
                className={`p-2 rounded ${currentTool === 'pan' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                title="Pan Tool"
              >
                <Hand className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-2 hover:bg-gray-100 rounded-l"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm border-x">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-2 hover:bg-gray-100 rounded-r"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setGridVisible(!gridVisible)}
              className={`p-2 border rounded ${gridVisible ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Snap to Grid */}
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`p-2 border rounded ${snapToGrid ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}
              title="Snap to Grid"
            >
              <Layout className="w-4 h-4" />
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={saveReport}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={exportToPDF}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                  >
                    📄 Export as PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    📊 Export as Excel
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                    🖼️ Export as Image
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg">
                    🌐 Export as HTML
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Widget Library & Templates */}
          {showDataPanel && (
            <div className="w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Widget Library */}
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Widget Library</h3>
                <div className="grid grid-cols-2 gap-2">
                  {widgetTypes.map(widget => (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget.id)}
                      className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      title={widget.description}
                    >
                      <widget.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="text-xs text-center">{widget.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Data Sources</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dataSources.map(source => (
                    <div
                      key={source.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <source.icon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">{source.name}</span>
                        {source.type === 'real-time' && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{source.fields.length} fields available</p>
                      <div className="flex flex-wrap gap-1">
                        {source.fields.slice(0, 3).map(field => (
                          <span
                            key={field.name}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                          >
                            {field.name}
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
              </div>

              {/* Templates */}
              <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Report Templates</h3>
                <div className="space-y-2">
                  {reportTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{template.name}</p>
                        {template.isPublic && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{template.category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {template.lastModified.toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Center - Report Canvas */}
          <Droppable droppableId="canvas">
            {(provided) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative"
                onClick={handleCanvasClick}
              >
                <div
                  ref={canvasRef}
                  className="relative min-h-full"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left',
                    backgroundImage: gridVisible ? 
                      'radial-gradient(circle, #d1d5db 1px, transparent 1px)' : 'none',
                    backgroundSize: gridVisible ? '20px 20px' : 'auto'
                  }}
                >
                  {widgets.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-600">Create Your Professional Report</h3>
                        <p className="text-gray-500 mb-4">
                          Drag widgets from the left panel or use templates to get started
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => addWidget('metric-card')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Add KPI Card
                          </button>
                          <button
                            onClick={() => addWidget('line-chart')}
                            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
                          >
                            Add Chart
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-4 auto-rows-[100px] p-6">
                      {widgets.map((widget, index) => (
                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative transition-all duration-200 ${
                                selectedWidgets.includes(widget.id) 
                                  ? 'ring-2 ring-indigo-600 ring-opacity-50' 
                                  : ''
                              } ${
                                snapshot.isDragging ? 'shadow-2xl z-50' : ''
                              }`}
                              style={{
                                gridColumn: `span ${widget.position.w}`,
                                gridRow: `span ${widget.position.h}`,
                                ...provided.draggableProps.style
                              }}
                            >
                              {/* Widget Controls Overlay */}
                              {selectedWidgets.includes(widget.id) && (
                                <div className="absolute -top-2 -right-2 z-10 flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      duplicateWidget(widget.id)
                                    }}
                                    className="p-1 bg-white border rounded shadow hover:bg-gray-50"
                                    title="Duplicate"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteWidget(widget.id)
                                    }}
                                    className="p-1 bg-white border rounded shadow hover:bg-red-50 text-red-600"
                                    title="Delete"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              
                              <div className="h-full">
                                {renderWidget(widget)}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>

          {/* Right Panel - Properties */}
          {showPropertiesPanel && selectedWidget && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Properties</h3>
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
                    <div className="space-y-6">
                      {/* General Properties */}
                      <div>
                        <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">General</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                              type="text"
                              value={widget.title}
                              onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Data Source</label>
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
                        </div>
                      </div>

                      {/* Layout Properties */}
                      <div>
                        <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Layout</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400">Width</label>
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
                            <label className="text-xs text-gray-600 dark:text-gray-400">Height</label>
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

                      {/* Style Properties */}
                      <div>
                        <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Style</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Background Color</label>
                            <input
                              type="color"
                              value={widget.style.backgroundColor || '#FFFFFF'}
                              onChange={(e) => updateWidgetStyle(widget.id, { backgroundColor: e.target.value })}
                              className="w-full h-10 border rounded-lg cursor-pointer"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Text Color</label>
                            <input
                              type="color"
                              value={widget.style.textColor || '#1F2937'}
                              onChange={(e) => updateWidgetStyle(widget.id, { textColor: e.target.value })}
                              className="w-full h-10 border rounded-lg cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Font Size</label>
                            <input
                              type="range"
                              min="10"
                              max="24"
                              value={widget.style.fontSize || 14}
                              onChange={(e) => updateWidgetStyle(widget.id, { fontSize: Number(e.target.value) })}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{widget.style.fontSize || 14}px</span>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Text Alignment</label>
                            <div className="flex gap-1">
                              {['left', 'center', 'right'].map(align => (
                                <button
                                  key={align}
                                  onClick={() => updateWidgetStyle(widget.id, { textAlign: align as any })}
                                  className={`flex-1 p-2 border rounded ${
                                    widget.style.textAlign === align 
                                      ? 'bg-indigo-600 text-white' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
                                  {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
                                  {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="shadow"
                              checked={widget.style.shadow || false}
                              onChange={(e) => updateWidgetStyle(widget.id, { shadow: e.target.checked })}
                              className="rounded"
                            />
                            <label htmlFor="shadow" className="text-sm">Drop Shadow</label>
                          </div>
                        </div>
                      </div>

                      {/* Widget-specific Configuration */}
                      {widget.type === 'chart' && (
                        <div>
                          <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Chart Settings</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Chart Type</label>
                              <div className="grid grid-cols-3 gap-2">
                                {['line', 'bar', 'pie'].map(type => (
                                  <button
                                    key={type}
                                    onClick={() => updateWidgetConfig(widget.id, { chartType: type as any })}
                                    className={`p-2 border rounded hover:bg-gray-50 ${
                                      widget.config.chartType === type ? 'border-indigo-600 bg-indigo-50' : ''
                                    }`}
                                  >
                                    {type === 'line' && <LineChart className="w-4 h-4 mx-auto" />}
                                    {type === 'bar' && <BarChart3 className="w-4 h-4 mx-auto" />}
                                    {type === 'pie' && <PieChart className="w-4 h-4 mx-auto" />}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="showLegend"
                                checked={widget.config.showLegend || false}
                                onChange={(e) => updateWidgetConfig(widget.id, { showLegend: e.target.checked })}
                                className="rounded"
                              />
                              <label htmlFor="showLegend" className="text-sm">Show Legend</label>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="showGrid"
                                checked={widget.config.showGrid || false}
                                onChange={(e) => updateWidgetConfig(widget.id, { showGrid: e.target.checked })}
                                className="rounded"
                              />
                              <label htmlFor="showGrid" className="text-sm">Show Grid</label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Data Configuration */}
                      {widget.dataSource && (
                        <div>
                          <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Data Configuration</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Time Range</label>
                              <select
                                value={widget.config.timeRange || '24h'}
                                onChange={(e) => updateWidgetConfig(widget.id, { timeRange: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                              >
                                <option value="1h">Last Hour</option>
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="1y">Last Year</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">Aggregation</label>
                              <select
                                value={widget.config.aggregation || 'avg'}
                                onChange={(e) => updateWidgetConfig(widget.id, { aggregation: e.target.value as any })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                              >
                                <option value="sum">Sum</option>
                                <option value="avg">Average</option>
                                <option value="min">Minimum</option>
                                <option value="max">Maximum</option>
                                <option value="count">Count</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  )
}
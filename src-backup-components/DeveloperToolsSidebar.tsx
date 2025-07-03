"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  Calculator, 
  Thermometer, 
  Zap, 
  BarChart3, 
  Shield, 
  Leaf, 
  Camera, 
  Database,
  Code,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  ExternalLink,
  Grid,
  Wrench,
  Activity,
  DollarSign,
  FileText,
  Cpu,
  Lightbulb,
  Cloud,
  Package,
  Users,
  ClipboardCheck
} from 'lucide-react'

interface ToolCategory {
  name: string
  icon: any
  tools: {
    name: string
    path: string
    description?: string
  }[]
}

export function DeveloperToolsSidebar() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Design & Engineering'])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterByNew, setFilterByNew] = useState(false)

  const toolCategories: ToolCategory[] = [
    {
      name: 'Design & Engineering',
      icon: Grid,
      tools: [
        { name: 'Advanced Designer', path: '/design/advanced', description: 'Professional facility design' },
        { name: 'Mobile Designer', path: '/mobile-designer', description: 'Quick design on mobile' },
        { name: 'Vertical Farming Suite', path: '/vertical-farming-suite', description: 'Complete VF solution' },
        { name: 'Coverage Area Calculator', path: '/calculators/coverage-area', description: 'Fixture placement' },
        { name: 'PPFD Heat Map', path: '/calculators/ppfd-map', description: 'Light distribution' },
        { name: 'CAD Integration', path: '/lighting-tools/cad-integration', description: 'Import/export designs' }
      ]
    },
    {
      name: 'Lighting & Spectrum',
      icon: Lightbulb,
      tools: [
        { name: 'Spectrum Builder', path: '/spectrum-builder', description: 'Custom spectrum design' },
        { name: 'Spectrum Analyzer', path: '/spectrum', description: 'Analyze light quality' },
        { name: 'LPD Calculator', path: '/lighting-tools/lpd-calculator', description: 'Lighting Power Density' },
        { name: 'Photosynthetic Calculator', path: '/photosynthetic-calculator', description: 'PAR efficiency' },
        { name: 'Spectrum Optimization', path: '/lighting-tools/spectrum-optimization', description: 'Multi-channel tuning' },
        { name: 'LED Thermal Management', path: '/climate-tools?tool=led-thermal', description: 'Heat dissipation' }
      ]
    },
    {
      name: 'Environment & Climate',
      icon: Cloud,
      tools: [
        { name: 'Environmental Control', path: '/calculators/environmental-control', description: 'Climate automation' },
        { name: 'VPD Calculator', path: '/calculators/vpd', description: 'Vapor pressure deficit' },
        { name: 'Psychrometric Calculator', path: '/calculators/psychrometric', description: 'Air properties' },
        { name: 'Heat Load Calculator', path: '/calculators/heat-load', description: 'Cooling requirements' },
        { name: 'HVAC System Selector', path: '/climate-tools?tool=hvac-selector', description: 'Equipment sizing' },
        { name: 'Transpiration Model', path: '/calculators/transpiration', description: 'Plant water loss' },
        { name: 'CO2 Enrichment', path: '/calculators/co2-enrichment', description: 'Carbon dioxide' }
      ]
    },
    {
      name: 'Operations & Cultivation',
      icon: Leaf,
      tools: [
        { name: 'Unified Control Center', path: '/control-center', description: 'Complete facility automation' },
        { name: 'Cultivation Hub', path: '/cultivation', description: 'Complete grow management' },
        { name: 'HMI Control Center', path: '/operations/hmi', description: 'Real-time equipment control' },
        { name: 'Batch Management', path: '/batch', description: 'Track cultivation batches' },
        { name: 'Production Planner', path: '/calculators/production-planner', description: 'Harvest scheduling' },
        { name: 'Yield Prediction', path: '/yield-prediction', description: 'AI-powered forecasts' },
        { name: 'Nutrient Dosing', path: '/nutrient-dosing', description: 'Feeding schedules' },
        { name: 'Fertilizer Formulator', path: '/calculators/fertilizer', description: 'Custom nutrients' },
        { name: 'Schedule Manager', path: '/schedule', description: 'Automation timing' },
        { name: 'Zone Configuration', path: '/settings/zones', description: 'Configure facility zones' },
        { name: 'Water Analysis', path: '/water-analysis', description: 'Water quality testing' }
      ]
    },
    {
      name: 'Monitoring & Analytics',
      icon: Activity,
      tools: [
        { name: 'Building Management System', path: '/bms', description: 'BMS dashboard & controls' },
        { name: 'Real-time Monitoring', path: '/monitoring', description: 'Live facility data' },
        { name: 'Sensor Management', path: '/sensors', description: 'IoT device control' },
        { name: 'Analytics Dashboard', path: '/analytics', description: 'Performance insights' },
        { name: 'Reports Generator', path: '/reports', description: 'Custom reporting' },
        { name: 'Multi-Site Management', path: '/multi-site', description: 'Multiple facilities' },
        { name: 'Operations Monitor', path: '/investment/operations', description: 'Operational KPIs' }
      ]
    },
    {
      name: 'Financial & Business',
      icon: DollarSign,
      tools: [
        { name: 'Investor Dashboard', path: '/investment', description: 'Investment analytics & ROI' },
        { name: 'Insurance Dashboard', path: '/insurance', description: 'Risk assessment & coverage' },
        { name: 'ROI Calculator', path: '/calculators/roi', description: 'Return on investment' },
        { name: 'TCO Calculator', path: '/tco-calculator', description: 'Total cost of ownership' },
        { name: 'Business Modeling', path: '/business-modeling', description: 'Financial projections' },
        { name: 'Rebate Calculator', path: '/rebate-calculator', description: 'Utility incentives' },
        { name: 'Equipment Leasing', path: '/equipment-leasing', description: 'Financing options' },
        { name: 'Carbon Credits', path: '/carbon-credits', description: 'Sustainability revenue' }
      ]
    },
    {
      name: 'Advanced & AI',
      icon: Cpu,
      tools: [
        { name: 'AI Predictions', path: '/predictions', description: 'Machine learning insights' },
        { name: 'Hyperspectral Analysis', path: '/hyperspectral', description: 'Plant health imaging' },
        { name: 'Weather Adaptive', path: '/weather-adaptive', description: 'Climate-responsive control' },
        { name: 'Battery Optimization', path: '/battery-optimization', description: 'Energy storage' },
        { name: 'Automation Rules', path: '/automation', description: 'Smart facility control' },
        { name: 'PID Control', path: '/pid-control', description: 'Precision regulation' }
      ]
    },
    {
      name: 'Compliance & Regulatory',
      icon: ClipboardCheck,
      tools: [
        { name: 'Compliance Dashboard', path: '/compliance', description: 'Regulatory overview' },
        { name: 'GlobalGAP Certification', path: '/operations/compliance', description: 'GAP compliance tracking' },
        { name: 'DLC Compliance', path: '/dlc-compliance', description: 'Lighting standards' },
        { name: 'THD Compliance', path: '/thd-compliance', description: 'Total harmonic distortion' },
        { name: 'Compliance Calendar', path: '/compliance-calendar', description: 'Regulatory deadlines' },
        { name: 'US Foods Requirements', path: '/compliance/us-foods', description: 'Supplier compliance' }
      ]
    },
    {
      name: 'Workforce Management',
      icon: Users,
      tools: [
        { name: 'Workforce Dashboard', path: '/workforce', description: 'Employee management' },
        { name: 'Employee Directory', path: '/workforce/employees', description: 'Staff information' },
        { name: 'Scheduling', path: '/workforce/scheduling', description: 'Shift management' },
        { name: 'Autopilot Mode', path: '/autopilot', description: 'Automated operations' }
      ]
    },
    {
      name: 'Developer Tools',
      icon: Code,
      tools: [
        { name: 'Developer Console', path: '/developer-tools', description: 'API monitoring, logs, webhooks' },
        { name: 'API Documentation', path: '/api-docs', description: 'Interactive API explorer' },
        { name: 'Component Playground', path: '/playground', description: 'Test and preview components' },
        { name: 'Integrations', path: '/integrations', description: 'Third-party connections' },
        { name: 'Data Sync', path: '/sync', description: 'External data sources' },
        { name: 'Templates', path: '/templates', description: 'Pre-built configurations' }
      ]
    }
  ]

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    )
  }

  const filteredCategories = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0)

  const totalTools = toolCategories.reduce((acc, cat) => acc + cat.tools.length, 0)
  const filteredTools = filteredCategories.reduce((acc, cat) => acc + cat.tools.length, 0)

  return (
    <div className="w-80 bg-gray-950 border-r border-gray-700 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">All Tools</h2>
          <span className="ml-auto text-sm text-gray-400">
            {filteredTools} / {totalTools}
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-400 focus:bg-gray-700"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => {
          const Icon = category.icon
          const isExpanded = expandedCategories.includes(category.name)
          
          return (
            <div key={category.name} className="border-b border-gray-700">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-100 flex-1 text-left">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500">
                  {category.tools.length}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="pb-2">
                  {category.tools.map((tool) => (
                    <Link
                      key={tool.path}
                      href={tool.path}
                      className="group px-10 py-2 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-gray-200 group-hover:text-white font-medium">
                          {tool.name}
                        </div>
                        {tool.description && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {tool.description}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-400">Categories</p>
            <p className="text-white font-medium">{toolCategories.length}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Tools</p>
            <p className="text-white font-medium">{totalTools}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
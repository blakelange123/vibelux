"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X,
  Wifi,
  Calculator,
  Cloud,
  Package,
  Brain,
  Zap,
  Calendar,
  Activity,
  FileText,
  Building2,
  ChevronRight,
  Code,
  Database,
  Terminal,
  GitBranch,
  Settings,
  BarChart3,
  Layers,
  Leaf,
  Cpu,
  Gauge,
  Eye,
  Wrench,
  TreePine,
  Droplets,
  Camera,
  Target,
  DollarSign,
  Users,
  Battery,
  Lightbulb,
  Globe,
  Smartphone,
  Bot,
  TrendingUp,
  Shield,
  Cog,
  Network,
  Monitor,
  Truck,
  Award,
  FlaskConical,
  Microscope,
  Flame,
  Snowflake,
  Wind,
  Sun,
  TestTube
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: any
  description?: string
  badge?: string
}

interface NavSectionProps {
  title: string
  items: NavItem[]
  pathname: string
}

function NavSection({ title, items, pathname }: NavSectionProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${isActive 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 group-hover:text-gray-400">
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function DeveloperNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const designEngineering: NavItem[] = [
    {
      href: '/design/advanced',
      label: 'Design Studio',
      icon: Layers,
      description: 'Advanced lighting design platform',
      badge: 'Pro'
    },
    {
      href: '/calculators',
      label: 'Calculators',
      icon: Calculator,
      description: 'Advanced lighting calculators'
    },
    {
      href: '/fixtures',
      label: 'Fixtures',
      icon: Package,
      description: 'Fixture database & management'
    },
    {
      href: '/lighting-tools',
      label: 'Lighting Tools',
      icon: Zap,
      description: 'Professional lighting design'
    },
    {
      href: '/digital-twin',
      label: 'Digital Twin',
      icon: Cpu,
      description: 'Real-time facility simulation'
    }
  ]

  const operationsCultivation: NavItem[] = [
    {
      href: '/cultivation',
      label: 'Cultivation Hub',
      icon: Leaf,
      description: 'Complete cultivation management'
    },
    {
      href: '/operations',
      label: 'Operations Center',
      icon: Monitor,
      description: 'Facility operations & monitoring'
    },
    {
      href: '/vertical-farming-suite',
      label: 'Vertical Farming',
      icon: Building2,
      description: 'Specialized vertical farm tools'
    },
    {
      href: '/autopilot',
      label: 'AutoPilot',
      icon: Bot,
      description: 'Automated facility management'
    },
    {
      href: '/equipment',
      label: 'Equipment',
      icon: Wrench,
      description: 'Equipment tracking & management'
    },
    {
      href: '/maintenance-tracker',
      label: 'Maintenance',
      icon: Gauge,
      description: 'Predictive maintenance system'
    }
  ]

  const sensorsAnalytics: NavItem[] = [
    {
      href: '/sensors',
      label: 'Sensors',
      icon: Wifi,
      description: 'Virtual & physical sensor integration'
    },
    {
      href: '/monitoring',
      label: 'Monitoring',
      icon: Eye,
      description: 'Real-time system monitoring'
    },
    {
      href: '/climate-tools',
      label: 'Climate Tools',
      icon: Cloud,
      description: 'Environmental analysis & optimization'
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance analytics & insights'
    },
    {
      href: '/intelligence',
      label: 'Intelligence Center',
      icon: Brain,
      description: 'Business intelligence dashboard'
    },
    {
      href: '/predictions',
      label: 'AI Predictions',
      icon: Target,
      description: 'Machine learning predictions',
      badge: 'AI'
    }
  ]

  const advancedFeatures: NavItem[] = [
    {
      href: '/hyperspectral',
      label: 'Hyperspectral',
      icon: Camera,
      description: 'Advanced imaging analysis'
    },
    {
      href: '/plant-identifier',
      label: 'Plant ID',
      icon: TreePine,
      description: 'AI-powered plant identification'
    },
    {
      href: '/yield-prediction',
      label: 'Yield Prediction',
      icon: TrendingUp,
      description: 'ML-based yield forecasting'
    },
    {
      href: '/water-analysis',
      label: 'Water Analysis',
      icon: Droplets,
      description: 'Water quality management'
    },
    {
      href: '/spectrum',
      label: 'Spectrum Analysis',
      icon: Activity,
      description: 'Spectral analysis tools'
    },
    {
      href: '/thermal-management',
      label: 'Thermal Management',
      icon: Flame,
      description: 'Heat management systems'
    }
  ]

  const energySustainability: NavItem[] = [
    {
      href: '/bms',
      label: 'Energy Management',
      icon: Battery,
      description: 'Building management system'
    },
    {
      href: '/battery-optimization',
      label: 'Battery Storage',
      icon: Battery,
      description: 'Energy storage optimization'
    },
    {
      href: '/demand-response',
      label: 'Demand Response',
      icon: Zap,
      description: 'Grid optimization tools'
    },
    {
      href: '/carbon-credits',
      label: 'Carbon Credits',
      icon: Globe,
      description: 'Sustainability tracking'
    },
    {
      href: '/weather-adaptive',
      label: 'Weather Adaptive',
      icon: Sun,
      description: 'Weather-responsive lighting'
    }
  ]

  const businessTools: NavItem[] = [
    {
      href: '/investment',
      label: 'Investment Tools',
      icon: DollarSign,
      description: 'Financial modeling & ROI'
    },
    {
      href: '/facility',
      label: 'Facility Platform',
      icon: Users,
      description: 'Manage facility operations & investments'
    },
    {
      href: '/multi-site',
      label: 'Multi-site',
      icon: Building2,
      description: 'Manage multiple locations'
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: FileText,
      description: 'Generate professional reports'
    },
    {
      href: '/schedule',
      label: 'Schedule',
      icon: Calendar,
      description: 'Photoperiod & scheduling'
    },
    {
      href: '/community-forum',
      label: 'Community',
      icon: Users,
      description: 'User collaboration platform'
    }
  ]

  const developerResources: NavItem[] = [
    {
      href: '/api-docs',
      label: 'API Documentation',
      icon: Code,
      description: 'REST API reference'
    },
    {
      href: '/developer-tools',
      label: 'Dev Tools',
      icon: Terminal,
      description: 'Console & debugging'
    },
    {
      href: '/dev/analytics',
      label: 'Page Analytics',
      icon: BarChart3,
      description: 'User behavior & page usage analytics',
      badge: 'NEW'
    },
    {
      href: '/integrations',
      label: 'Integrations',
      icon: GitBranch,
      description: 'Third-party integrations'
    },
    {
      href: '/settings/api',
      label: 'API Settings',
      icon: Settings,
      description: 'API keys & webhooks'
    }
  ]

  // Listen for toggle events
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev)
    }

    window.addEventListener('toggleDeveloperNav', handleToggle)
    
    // Also expose a global function
    if (typeof window !== 'undefined') {
      (window as any).toggleDeveloperNav = () => setIsOpen(prev => !prev)
    }

    return () => {
      window.removeEventListener('toggleDeveloperNav', handleToggle)
    }
  }, [])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 shadow-2xl z-[9999] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Developer Tools</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Advanced tools for lighting design and analysis
          </p>
        </div>

        {/* Navigation */}
        <div className="h-[calc(100%-88px)] overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* Design & Engineering */}
            <NavSection 
              title="Design & Engineering"
              items={designEngineering}
              pathname={pathname}
            />

            {/* Operations & Cultivation */}
            <NavSection 
              title="Operations & Cultivation"
              items={operationsCultivation}
              pathname={pathname}
            />

            {/* Sensors & Analytics */}
            <NavSection 
              title="Sensors & Analytics"
              items={sensorsAnalytics}
              pathname={pathname}
            />

            {/* Advanced Features */}
            <NavSection 
              title="Advanced Features"
              items={advancedFeatures}
              pathname={pathname}
            />

            {/* Energy & Sustainability */}
            <NavSection 
              title="Energy & Sustainability"
              items={energySustainability}
              pathname={pathname}
            />

            {/* Business Tools */}
            <NavSection 
              title="Business Tools"
              items={businessTools}
              pathname={pathname}
            />

            {/* Developer Resources */}
            <NavSection 
              title="Developer Resources"
              items={developerResources}
              pathname={pathname}
            />

            {/* Quick Actions */}
            <div className="pt-4 pb-6 border-t border-gray-800">
              <Link
                href="/design/advanced"
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all text-center block"
              >
                Open Design Studio
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
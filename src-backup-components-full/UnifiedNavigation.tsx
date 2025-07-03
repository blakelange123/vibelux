'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Home,
  Layers,
  Activity,
  Calculator,
  ShoppingCart,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Settings,
  HelpCircle,
  LogIn,
  Info,
  Package,
  DollarSign,
  Users,
  // Design & Engineering
  Lightbulb,
  Smartphone,
  Cpu,
  FileText,
  // Operations
  Monitor,
  Leaf,
  Wrench,
  Calendar,
  Bot,
  Building2,
  // Analytics
  BarChart3,
  TrendingUp,
  Brain,
  Target,
  // Tools
  Thermometer,
  Droplets,
  Zap,
  Battery,
  Globe,
  Camera,
  // Financial
  CreditCard,
  Banknote,
  // Compliance
  Shield,
  Award,
  // Research
  FlaskConical,
  Database,
  GraduationCap
} from 'lucide-react';
import { getCurrentUserPermissions, getCurrentUserRole } from '@/lib/user-permissions';

interface NavigationProps {
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href?: string;
  icon?: any;
  children?: NavItem[];
  permission?: string;
  badge?: string;
}

const navigationStructure: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    label: 'Demo',
    href: '/demo',
    icon: Sparkles,
    badge: 'NEW'
  },
  {
    label: 'Features',
    href: '/features',
    icon: Sparkles
  },
  {
    label: 'Design Studio',
    icon: Layers,
    children: [
      { label: 'Advanced Designer', href: '/design/advanced', badge: 'Pro' },
      { label: 'Quick Design', href: '/designer' },
      { label: 'Mobile Designer', href: '/mobile-designer' },
      { label: 'Climate Integration', href: '/design/climate-integrated' },
      { label: 'Digital Twin', href: '/digital-twin' },
      { label: 'Vertical Farming Suite', href: '/vertical-farming-suite' },
      { label: 'CAD/Lighting Tools', href: '/lighting-tools' }
    ]
  },
  {
    label: 'Operations',
    icon: Monitor,
    children: [
      { label: 'Operations Center', href: '/operations' },
      { label: 'Zone Configuration', href: '/settings/zones', badge: 'Setup' },
      { label: 'HMI Control', href: '/operations/hmi', badge: 'Real-time' },
      { label: 'Cultivation Hub', href: '/cultivation' },
      { label: 'Crop Steering', href: '/cultivation/crop-steering' },
      { label: 'AutoPilot', href: '/autopilot', badge: 'AI' },
      { label: 'Automation', href: '/automation' },
      { label: 'Maintenance', href: '/maintenance-tracker' },
      { label: 'Equipment', href: '/equipment' },
      { label: 'Schedule', href: '/schedule' },
      { label: 'Multi-Site', href: '/multi-site' }
    ]
  },
  {
    label: 'Analytics & AI',
    icon: BarChart3,
    children: [
      { label: 'Performance Analytics', href: '/analytics' },
      { label: 'Financial Reports', href: '/reports' },
      { label: 'Environmental Monitoring', href: '/monitoring' },
      { label: 'AI Predictions', href: '/predictions', badge: 'AI', permission: 'canAccessPredictions' },
      { label: 'Intelligence Center', href: '/intelligence' },
      { label: 'Yield Prediction', href: '/yield-prediction' },
      { label: 'Hyperspectral Analysis', href: '/hyperspectral' },
      { label: 'Plant Identifier', href: '/plant-identifier' }
    ]
  },
  {
    label: 'Research & Analysis',
    icon: FlaskConical,
    children: [
      { label: 'Research Library', href: '/research-library', badge: 'NEW' },
      { label: 'Research Tools', href: '/research' },
      { label: 'Literature Search', href: '/research-library' },
      { label: 'Citation Analysis', href: '/research-demo', badge: 'DEMO' },
      { label: 'Experiment Designer', href: '/research/experiment-designer' },
      { label: 'Statistical Analysis', href: '/research/statistical-analysis' },
      { label: 'Data Logger', href: '/research/data-logger' }
    ]
  },
  {
    label: 'Tools & Calculators',
    icon: Calculator,
    children: [
      { label: 'All Calculators', href: '/calculators' },
      { label: 'Climate Tools', href: '/climate-tools' },
      { label: 'Spectrum Builder', href: '/spectrum-builder' },
      { label: 'Spectrum Analysis', href: '/spectrum' },
      { label: 'Light Recipes', href: '/light-recipes' },
      { label: 'Water Analysis', href: '/water-analysis' },
      { label: 'Nutrient Dosing', href: '/nutrient-dosing' },
      { label: 'Thermal Management', href: '/thermal-management' }
    ]
  },
  {
    label: 'Financial & Investment',
    icon: DollarSign,
    children: [
      { label: 'Investment Dashboard', href: '/investment' },
      { label: 'Operations Monitor', href: '/investment/operations' },
      { label: 'Cost Analysis', href: '/investment/cost-analysis' },
      { label: 'Deal Flow', href: '/investment/deal-flow' },
      { label: 'TCO Calculator', href: '/tco-calculator' },
      { label: 'Business Modeling', href: '/business-modeling' },
      { label: 'Revenue Sharing', href: '/revenue-sharing', badge: 'NEW' },
      { label: 'Rebate Calculator', href: '/rebate-calculator' },
      { label: 'Equipment Leasing', href: '/equipment-leasing' },
      { label: 'Carbon Credits', href: '/carbon-credits' }
    ]
  },
  {
    label: 'Energy & Sustainability',
    icon: Battery,
    children: [
      { label: 'Battery Optimization', href: '/battery-optimization' },
      { label: 'Demand Response', href: '/demand-response' },
      { label: 'BMS Integration', href: '/bms' },
      { label: 'Weather Adaptive', href: '/weather-adaptive' },
      { label: 'PID Control', href: '/pid-control' }
    ]
  },
  {
    label: 'Sensors & IoT',
    icon: Activity,
    children: [
      { label: 'Sensor Dashboard', href: '/sensors', permission: 'canAccessSensors' },
      { label: 'Wireless Sensors', href: '/sensors/wireless' },
      { label: 'IoT Devices', href: '/iot-devices' }
    ]
  },
  {
    label: 'Compliance',
    icon: Shield,
    children: [
      { label: 'DLC Compliance', href: '/dlc-compliance' },
      { label: 'THD Compliance', href: '/thd-compliance' }
    ]
  },
  {
    label: 'Fixtures',
    href: '/fixtures',
    icon: Package,
    permission: 'canAccessFixtures'
  },
  {
    label: 'Marketplace',
    icon: ShoppingCart,
    children: [
      { label: 'Equipment & Fixtures', href: '/marketplace' },
      { label: 'Produce Board', href: '/marketplace/produce-board', badge: 'NEW' },
      { label: 'Fresh Produce', href: '/marketplace/produce' },
      { label: 'Grower Dashboard', href: '/marketplace/produce/grower-dashboard' },
      { label: 'Create Listing', href: '/marketplace/produce/create-listing' },
      { label: 'My Orders', href: '/marketplace/produce/orders' },
      { label: 'Analytics', href: '/marketplace/produce/analytics' },
      { label: 'Buyer Network', href: '/marketplace/produce/buyers' }
    ]
  },
  {
    label: 'Pricing',
    icon: CreditCard,
    children: [
      { label: 'Traditional Plans', href: '/pricing' },
      { label: 'Revenue Sharing', href: '/pricing/revenue-sharing', badge: 'NEW' },
      { label: 'Savings Simulator', href: '/pricing/revenue-sharing/simulator', badge: 'NEW' },
      { label: 'Terms & Conditions', href: '/pricing/revenue-sharing/terms' },
      { label: 'Compare Options', href: '/pricing/compare' },
      { label: 'ROI Calculator', href: '/pricing/calculator' }
    ]
  },
  {
    label: 'Resources',
    icon: BookOpen,
    children: [
      { label: 'Resource Center', href: '/resources' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api-docs' },
      { label: 'Tutorials', href: '/tutorials' },
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Community Forum', href: '/community-forum' },
      { label: 'Developer Tools', href: '/developer-tools' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Templates', href: '/templates' }
    ]
  },
  {
    label: 'About',
    href: '/about',
    icon: Info
  }
];

function NavSection({ item, pathname, onClose, depth = 0 }: { 
  item: NavItem; 
  pathname: string; 
  onClose?: () => void;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const permissions = getCurrentUserPermissions();
  const hasPermission = !item.permission || permissions[item.permission as keyof typeof permissions];
  
  if (!hasPermission) return null;

  const isActive = item.href === pathname || item.children?.some(child => child.href === pathname);
  const Icon = item.icon;
  
  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
            isActive
              ? 'text-white bg-purple-600/20' 
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5" />}
            <span>{item.label}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <NavSection 
                key={child.href || child.label} 
                item={child} 
                pathname={pathname} 
                onClose={onClose}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link 
      href={item.href!} 
      className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
        pathname === item.href 
          ? 'text-white bg-purple-600' 
          : 'text-gray-300 hover:text-white hover:bg-gray-800'
      }`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      onClick={onClose}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5" />}
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span className="px-2 py-0.5 text-xs bg-purple-600/20 text-purple-300 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function UnifiedNavigation({ onClose }: NavigationProps) {
  const pathname = usePathname();
  const userRole = getCurrentUserRole();

  return (
    <div className="h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">VibeLux</span>
        </Link>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navigationStructure.map((item) => (
            <NavSection 
              key={item.href || item.label} 
              item={item} 
              pathname={pathname} 
              onClose={onClose}
            />
          ))}
        </div>
        
        {/* Quick Access */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Quick Access</p>
          <div className="space-y-2">
            <Link 
              href="/collaboration-demo" 
              className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
              onClick={onClose}
            >
              <Users className="w-5 h-5" />
              Collaboration Demo
            </Link>
            <Link 
              href="/playground" 
              className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
              onClick={onClose}
            >
              <Cpu className="w-5 h-5" />
              Playground
            </Link>
            <Link 
              href="/sync" 
              className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
              onClick={onClose}
            >
              <Activity className="w-5 h-5" />
              Sync Status
            </Link>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-6 pt-6 border-t border-gray-800 space-y-2">
          <Link 
            href="/settings" 
            className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <Link 
            href="/help" 
            className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </Link>
          <Link 
            href="/sign-in" 
            className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Link>
        </div>
        
        {/* CTA */}
        <div className="mt-6 mb-4">
          <Link 
            href="/dashboard" 
            className="block w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            onClick={onClose}
          >
            Get Started Free
          </Link>
        </div>
      </nav>
    </div>
  );
}
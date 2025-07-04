'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Shield } from 'lucide-react';
import { getCurrentUserPermissions, getCurrentUserRole } from '@/lib/user-permissions';

interface NavigationProps {
  onClose?: () => void;
}

export default function Navigation({ onClose }: NavigationProps) {
  const pathname = usePathname();
  const permissions = getCurrentUserPermissions();
  const userRole = getCurrentUserRole();
  
  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/fixtures', label: 'Fixtures', permission: 'canAccessFixtures' },
    { href: '/quantum-biotechnology', label: 'Quantum Biotechnology', permission: 'canAccessAdvanced' },
    { href: '/professional-reporting', label: 'Professional Reports', permission: 'canAccessReports' },
    { href: '/marketplace', label: 'B2B Marketplace' },
    { href: '/equipment/offers', label: 'Equipment Market' },
    { href: '/equipment-board', label: 'Equipment Requests' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/resources', label: 'Resources' },
    { href: '/about', label: 'About' },
    { href: '/sensors', label: 'Sensors', permission: 'canAccessSensors' },
    { href: '/sensors/wireless', label: 'Wireless Sensors' },
    { href: '/predictions', label: 'Predictions', permission: 'canAccessPredictions' },
  ];

  const toggleAdminMode = () => {
    if (typeof window !== 'undefined') {
      const current = localStorage.getItem('vibelux_admin_mode') === 'true';
      localStorage.setItem('vibelux_admin_mode', (!current).toString());
      window.location.reload(); // Refresh to apply changes
    }
  };

  return (
    <div className="h-full bg-gray-900 border-r border-gray-800">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Vibelux</span>
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
      
      {/* Navigation Links */}
      <nav className="p-4">
        <div className="space-y-2">
          {navLinks.map(link => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                pathname === link.href 
                  ? 'text-white bg-purple-600' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
              onClick={onClose} // Close sidebar when link is clicked
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Safe Features */}
        <div className="mt-8 pt-8 border-t border-gray-800 space-y-2">
          <Link 
            href="/dashboard" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/dashboard' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Dashboard
          </Link>
          <Link 
            href="/energy-dashboard" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/energy-dashboard' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Energy Dashboard
          </Link>
          <Link 
            href="/dashboard-builder" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/dashboard-builder' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Dashboard Builder
          </Link>
          <Link 
            href="/3d-visualization" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/3d-visualization' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            3D Visualization
          </Link>
          <Link 
            href="/calculators" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/calculators' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Calculators
          </Link>
          <Link 
            href="/design/advanced" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/design/advanced' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Designer
          </Link>
          <Link 
            href="/sop-library" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/sop-library' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            SOP Library
          </Link>
          <Link 
            href="/troubleshoot" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/troubleshoot' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Troubleshooting Assistant
          </Link>
          <Link 
            href="/control-center" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/control-center' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Control Center
          </Link>
          <Link 
            href="/workplace-safety" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/workplace-safety' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Workplace Safety
          </Link>
          <Link 
            href="/ipm" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/ipm' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            IPM (Pest Management)
          </Link>
          <Link 
            href="/collaboration-demo" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/collaboration-demo' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Collaboration
          </Link>
          <Link 
            href="/battery-optimization" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/battery-optimization' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Battery Storage
          </Link>
          <Link 
            href="/demand-response" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/demand-response' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Demand Response
          </Link>
          <Link 
            href="/operations" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/operations' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Operations Center
          </Link>
          <Link 
            href="/cultivation/crop-steering" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/cultivation/crop-steering' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Crop Steering
          </Link>
          <Link 
            href="/automation/blueprints" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/automation/blueprints' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Blueprints
          </Link>
          <Link 
            href="/marketplace" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/marketplace' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Marketplace
          </Link>
          <Link 
            href="/workforce" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/workforce' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Workforce
          </Link>
          <Link 
            href="/quality" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/quality' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Quality
          </Link>
          <Link 
            href="/seed-to-sale" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/seed-to-sale' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Seed-to-Sale
          </Link>
          <Link 
            href="/security" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/security' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Security
          </Link>
          <Link 
            href="/compliance-calendar" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/compliance-calendar' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Compliance
          </Link>
          <Link 
            href="/compare" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/compare' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Compare Fixtures
          </Link>
          <Link 
            href="/equipment/offers" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/equipment/offers' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Equipment Offers
          </Link>
          <Link 
            href="/equipment/matches" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/equipment/matches' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Equipment Matches
          </Link>
          <Link 
            href="/affiliates" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/affiliates' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Affiliates
          </Link>
          <Link 
            href="/monitoring/environmental-rtr" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/monitoring/environmental-rtr' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Environmental + RTR Monitor
          </Link>
          <Link 
            href="/monitoring/rtr-lighting" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/monitoring/rtr-lighting' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            RTR Lighting Control
          </Link>
          <Link 
            href="/monitoring/psi" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/monitoring/psi' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            PSI Monitor
          </Link>
          <Link 
            href="/calculators/energy-moisture-balance" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/calculators/energy-moisture-balance' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Energy & Moisture Balance
          </Link>
          <Link 
            href="/rd" 
            className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
              pathname === '/rd' 
                ? 'text-white bg-purple-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
            onClick={onClose}
          >
            Statistical Analysis & Trials
          </Link>
        </div>


        {/* Auth Links */}
        <div className="mt-6 pt-6 border-t border-gray-800 space-y-2">
          <Link 
            href="/sign-in" 
            className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            Sign In
          </Link>
          
        </div>
        
        {/* CTA Button */}
        <div className="mt-6">
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
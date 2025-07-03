'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CreditCard, TrendingUp, Calculator, BarChart3, 
  FileText, ChevronRight, Home
} from 'lucide-react';

const pricingLinks = [
  { href: '/pricing', label: 'Traditional Plans', icon: CreditCard },
  { href: '/pricing/revenue-sharing', label: 'Revenue Sharing', icon: TrendingUp },
  { href: '/pricing/revenue-sharing/simulator', label: 'Savings Simulator', icon: BarChart3 },
  { href: '/pricing/compare', label: 'Compare Options', icon: FileText },
  { href: '/pricing/calculator', label: 'ROI Calculator', icon: Calculator }
];

export default function PricingNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="py-3 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
            Pricing
          </Link>
          {pathname !== '/pricing' && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <span className="text-white">
                {pricingLinks.find(link => link.href === pathname)?.label || 'Page'}
              </span>
            </>
          )}
        </div>

        {/* Sub-navigation */}
        <div className="flex flex-wrap gap-1 pb-4">
          {pricingLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
                {link.href.includes('revenue-sharing') && !isActive && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-600/20 text-green-400 rounded">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
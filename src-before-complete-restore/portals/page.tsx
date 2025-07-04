'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Briefcase,
  Code,
  Building,
  TrendingUp,
  Store,
  HeadphonesIcon,
  UserCheck,
  Settings,
  BarChart3,
  Package,
  DollarSign,
  Truck,
  Award,
  FileText,
  Lock,
  Key,
  ChevronRight,
  Grid3x3
} from 'lucide-react';
import Link from 'next/link';

interface Portal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  access: string[];
  features: string[];
  isNew?: boolean;
  isLocked?: boolean;
}

export default function PortalsPage() {
  const { user } = useUser();
  const router = useRouter();

  const userRole = user?.publicMetadata?.role as string || 'user';
  const isAdmin = userRole === 'admin';
  const isDeveloper = userRole === 'developer';
  const isInvestor = userRole === 'investor';
  const isVendor = user?.publicMetadata?.isVendor;
  const isEnterprise = user?.publicMetadata?.subscriptionTier === 'enterprise';

  const allPortals: Portal[] = [
    // User Portals
    {
      id: 'account',
      title: 'My Account',
      description: 'Manage your profile, security settings, and account preferences',
      icon: <UserCheck className="w-6 h-6" />,
      href: '/account/profile',
      color: 'from-blue-500 to-blue-600',
      access: ['all'],
      features: ['Profile Management', 'Security Settings', 'Activity History', 'Billing']
    },
    {
      id: 'dashboard',
      title: 'Main Dashboard',
      description: 'Your primary workspace for LED design and project management',
      icon: <Grid3x3 className="w-6 h-6" />,
      href: '/dashboard',
      color: 'from-green-500 to-green-600',
      access: ['all'],
      features: ['Project Overview', 'Quick Actions', 'Analytics', 'Recent Activity']
    },
    
    // Business Portals
    {
      id: 'vendor',
      title: 'Vendor Portal',
      description: 'Manage your marketplace listings, orders, and sales analytics',
      icon: <Store className="w-6 h-6" />,
      href: '/marketplace/vendor-dashboard',
      color: 'from-purple-500 to-purple-600',
      access: ['vendor'],
      features: ['Product Listings', 'Order Management', 'Sales Analytics', 'Payouts'],
      isLocked: !isVendor
    },
    {
      id: 'affiliate',
      title: 'Affiliate Portal',
      description: 'Track your referrals, commissions, and promotional materials',
      icon: <DollarSign className="w-6 h-6" />,
      href: '/affiliate/dashboard',
      color: 'from-yellow-500 to-yellow-600',
      access: ['affiliate'],
      features: ['Commission Tracking', 'Referral Links', 'Marketing Materials', 'Payouts']
    },
    {
      id: 'enterprise',
      title: 'Enterprise Portal',
      description: 'Advanced features for multi-location management and team collaboration',
      icon: <Building className="w-6 h-6" />,
      href: '/enterprise',
      color: 'from-indigo-500 to-indigo-600',
      access: ['enterprise'],
      features: ['Multi-facility', 'Team Management', 'Custom Integrations', 'Priority Support'],
      isLocked: !isEnterprise
    },
    
    // Specialized Portals
    {
      id: 'investor',
      title: 'Investor Portal',
      description: 'Access financial reports, company metrics, and board materials',
      icon: <TrendingUp className="w-6 h-6" />,
      href: '/investor-portal',
      color: 'from-emerald-500 to-emerald-600',
      access: ['investor'],
      features: ['Financial Reports', 'Board Documents', 'Company Metrics', 'Updates'],
      isLocked: !isInvestor
    },
    {
      id: 'developer',
      title: 'Developer Portal',
      description: 'API documentation, key management, and integration tools',
      icon: <Code className="w-6 h-6" />,
      href: '/developer/api-keys',
      color: 'from-orange-500 to-orange-600',
      access: ['developer', 'admin'],
      features: ['API Keys', 'Documentation', 'Webhooks', 'SDK Downloads']
    },
    
    // Admin Portals
    {
      id: 'admin',
      title: 'Admin Portal',
      description: 'System administration, user management, and platform configuration',
      icon: <ShieldCheck className="w-6 h-6" />,
      href: '/admin',
      color: 'from-red-500 to-red-600',
      access: ['admin'],
      features: ['User Management', 'System Config', 'Audit Logs', 'Impersonation'],
      isLocked: !isAdmin
    },
    {
      id: 'analytics',
      title: 'Analytics Portal',
      description: 'Platform-wide analytics, metrics, and business intelligence',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/admin/analytics',
      color: 'from-pink-500 to-pink-600',
      access: ['admin'],
      features: ['Revenue Analytics', 'User Metrics', 'Usage Stats', 'Reports'],
      isLocked: !isAdmin
    },
    
    // Support Portals
    {
      id: 'support',
      title: 'Support Center',
      description: 'Get help, browse documentation, and contact our support team',
      icon: <HeadphonesIcon className="w-6 h-6" />,
      href: '/help',
      color: 'from-cyan-500 to-cyan-600',
      access: ['all'],
      features: ['Knowledge Base', 'Ticket System', 'Live Chat', 'Community Forum']
    },
    {
      id: 'certification',
      title: 'Training & Certification',
      description: 'Access training materials and earn professional certifications',
      icon: <Award className="w-6 h-6" />,
      href: '/training',
      color: 'from-teal-500 to-teal-600',
      access: ['all'],
      features: ['Video Courses', 'Certification Exams', 'Progress Tracking', 'Badges'],
      isNew: true
    }
  ];

  // Filter portals based on user access
  const accessiblePortals = allPortals.filter(portal => {
    if (portal.access.includes('all')) return true;
    if (portal.access.includes(userRole)) return true;
    if (portal.id === 'vendor' && isVendor) return true;
    if (portal.id === 'enterprise' && isEnterprise) return true;
    if (portal.id === 'investor' && isInvestor) return true;
    return false;
  });

  const lockedPortals = allPortals.filter(portal => portal.isLocked);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Portal Directory</h1>
          <p className="text-gray-400">Access all your specialized portals and dashboards</p>
        </div>

        {/* User Info */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-white font-medium">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Role</p>
                <p className="text-white font-medium capitalize">{userRole}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Access Level</p>
                <p className="text-white font-medium">{accessiblePortals.length} Portals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accessible Portals */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Your Portals</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessiblePortals.map((portal) => (
              <Link
                key={portal.id}
                href={portal.href}
                className="group relative bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all hover:transform hover:scale-[1.02]"
              >
                {portal.isNew && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    NEW
                  </span>
                )}
                
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {portal.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{portal.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{portal.description}</p>
                
                <div className="space-y-1 mb-4">
                  {portal.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-gray-600 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400 group-hover:text-green-300">
                    Access Portal
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Locked Portals */}
        {lockedPortals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Additional Portals</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedPortals.map((portal) => (
                <div
                  key={portal.id}
                  className="relative bg-gray-900/50 rounded-xl border border-gray-800 p-6 opacity-60"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-900 rounded-lg px-4 py-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Requires Access</span>
                    </div>
                  </div>
                  
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center mb-4 opacity-50`}>
                    {portal.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">{portal.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{portal.description}</p>
                  
                  <div className="space-y-1">
                    {portal.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Need Access to More Portals?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/contact"
              className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div>
                <p className="text-white font-medium">Become a Vendor</p>
                <p className="text-sm text-gray-400">Sell on our marketplace</p>
              </div>
              <Store className="w-5 h-5 text-gray-400" />
            </Link>
            
            <Link
              href="/pricing"
              className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div>
                <p className="text-white font-medium">Upgrade to Enterprise</p>
                <p className="text-sm text-gray-400">Advanced features</p>
              </div>
              <Building className="w-5 h-5 text-gray-400" />
            </Link>
            
            <Link
              href="/contact"
              className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div>
                <p className="text-white font-medium">Contact Sales</p>
                <p className="text-sm text-gray-400">Custom solutions</p>
              </div>
              <Briefcase className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Leaf,
  Package,
  Truck,
  FlaskConical,
  AlertTriangle,
  BarChart3,
  QrCode,
  FileText,
  Shield,
  Activity,
  Database,
  MapPin
} from 'lucide-react';

export default function SeedToSalePage() {
  const modules = [
    {
      title: 'Plant Tracking',
      description: 'Track plants from clone to harvest',
      icon: Leaf,
      href: '/seed-to-sale/plants',
      color: 'from-green-600 to-green-700',
      stats: { active: 2847, stages: 4 }
    },
    {
      title: 'Harvest Management',
      description: 'Wet weight, drying, and processing',
      icon: Package,
      href: '/seed-to-sale/harvests',
      color: 'from-orange-600 to-orange-700',
      stats: { active: 12, drying: 8 }
    },
    {
      title: 'Package Inventory',
      description: 'Package creation and tracking',
      icon: QrCode,
      href: '/seed-to-sale/packages',
      color: 'from-purple-600 to-purple-700',
      stats: { packages: 456, weight: '125.4 lbs' }
    },
    {
      title: 'Transfers',
      description: 'Manifests and transportation',
      icon: Truck,
      href: '/seed-to-sale/transfers',
      color: 'from-blue-600 to-blue-700',
      stats: { pending: 3, completed: 89 }
    },
    {
      title: 'Lab Testing',
      description: 'Sample tracking and results',
      icon: FlaskConical,
      href: '/seed-to-sale/testing',
      color: 'from-pink-600 to-pink-700',
      stats: { pending: 5, passed: '94%' }
    },
    {
      title: 'Waste Tracking',
      description: 'Destruction and disposal logs',
      icon: AlertTriangle,
      href: '/seed-to-sale/waste',
      color: 'from-red-600 to-red-700',
      stats: { ytd: '234 lbs', compliance: '100%' }
    },
    {
      title: 'State Reporting',
      description: 'METRC, BioTrack integration',
      icon: FileText,
      href: '/seed-to-sale/reporting',
      color: 'from-indigo-600 to-indigo-700',
      stats: { synced: 'Live', errors: 0 }
    },
    {
      title: 'Analytics',
      description: 'Yield tracking and insights',
      icon: BarChart3,
      href: '/seed-to-sale/analytics',
      color: 'from-teal-600 to-teal-700',
      stats: { yield: '2.1 lb/plant', cycle: '84 days' }
    }
  ];

  const recentActivity = [
    { type: 'plant', message: 'Batch B-2024-0315 moved to Flower Room 3', time: '5 min ago', icon: Leaf },
    { type: 'harvest', message: 'Harvest H-2024-0089 completed - 45.2 lbs wet weight', time: '1 hour ago', icon: Package },
    { type: 'package', message: '24 packages created from batch GSC-0312', time: '2 hours ago', icon: QrCode },
    { type: 'transfer', message: 'Transfer MAN-20240315-0023 delivered', time: '3 hours ago', icon: Truck },
    { type: 'test', message: 'Lab results received for PKG-2024-0456', time: '4 hours ago', icon: FlaskConical }
  ];

  const complianceStatus = {
    plants: { tagged: 2847, untagged: 0 },
    packages: { compliant: 456, issues: 0 },
    reporting: { current: true, lastSync: '2 min ago' },
    inventory: { verified: true, lastAudit: '2024-03-10' }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="w-10 h-10 text-green-400" />
            Seed-to-Sale Tracking
          </h1>
          <p className="text-gray-400 text-lg">
            Complete cannabis tracking from propagation to sale
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Plants</span>
              <Leaf className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-sm text-gray-500">Clone: 423 | Veg: 892 | Flower: 1,532</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Packages</span>
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold">456</div>
            <div className="text-sm text-gray-500">125.4 lbs total weight</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">State Sync</span>
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">Live</div>
            <div className="text-sm text-gray-500">Last sync: 2 min ago</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Compliance</span>
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-sm text-gray-500">All tags accounted</div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={module.href}>
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 hover:border-gray-600 transition-all cursor-pointer group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative">
                    <module.icon className="w-8 h-8 mb-4 text-gray-400 group-hover:text-white transition-colors" />
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {module.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      {Object.entries(module.stats).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">{key}: </span>
                          <span className="text-gray-300 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity and Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-700 last:border-0">
                    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Compliance Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">Plant Tags</div>
                  <div className="text-sm text-gray-400">All plants tagged</div>
                </div>
                <div className="text-green-400 font-bold">
                  {complianceStatus.plants.tagged}/{complianceStatus.plants.tagged}
                </div>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">Package Compliance</div>
                  <div className="text-sm text-gray-400">No issues found</div>
                </div>
                <div className="text-green-400 font-bold">100%</div>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">State Reporting</div>
                  <div className="text-sm text-gray-400">{complianceStatus.reporting.lastSync}</div>
                </div>
                <div className="text-green-400 font-bold">Current</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Inventory Audit</div>
                  <div className="text-sm text-gray-400">Last: {complianceStatus.inventory.lastAudit}</div>
                </div>
                <div className="text-green-400 font-bold">Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <QrCode className="w-6 h-6 text-green-400" />
              <span className="text-sm">Print Tags</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Truck className="w-6 h-6 text-blue-400" />
              <span className="text-sm">New Transfer</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Package className="w-6 h-6 text-purple-400" />
              <span className="text-sm">Create Package</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <MapPin className="w-6 h-6 text-orange-400" />
              <span className="text-sm">Move Plants</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
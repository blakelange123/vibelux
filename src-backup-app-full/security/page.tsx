'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  UserCheck,
  Camera,
  DoorOpen,
  AlertTriangle,
  Activity,
  Users,
  Key,
  Monitor,
  FileText,
  Bell,
  MapPin
} from 'lucide-react';

export default function SecurityPage() {
  const modules = [
    {
      title: 'Access Control',
      description: 'Manage doors, zones, and permissions',
      icon: DoorOpen,
      href: '/security/access-control',
      color: 'from-blue-600 to-blue-700',
      stats: { zones: 12, doors: 48 }
    },
    {
      title: 'Visitor Management',
      description: 'Check-in, badges, and host notifications',
      icon: UserCheck,
      href: '/security/visitors',
      color: 'from-green-600 to-green-700',
      stats: { today: 8, onsite: 3 }
    },
    {
      title: 'Camera Surveillance',
      description: 'Live feeds and recorded footage',
      icon: Camera,
      href: '/security/cameras',
      color: 'from-purple-600 to-purple-700',
      stats: { cameras: 64, recording: 62 }
    },
    {
      title: 'Badge Management',
      description: 'Issue and manage access badges',
      icon: Key,
      href: '/security/badges',
      color: 'from-orange-600 to-orange-700',
      stats: { active: 156, visitors: 12 }
    },
    {
      title: 'Alarms & Alerts',
      description: 'Security events and notifications',
      icon: Bell,
      href: '/security/alarms',
      color: 'from-red-600 to-red-700',
      stats: { active: 0, today: 3 }
    },
    {
      title: 'Incident Reports',
      description: 'Document and track incidents',
      icon: FileText,
      href: '/security/incidents',
      color: 'from-yellow-600 to-yellow-700',
      stats: { open: 2, ytd: 15 }
    },
    {
      title: 'Access Logs',
      description: 'Audit trail and analytics',
      icon: Activity,
      href: '/security/logs',
      color: 'from-indigo-600 to-indigo-700',
      stats: { today: 842, denied: 3 }
    },
    {
      title: 'Security Dashboard',
      description: 'Real-time monitoring and metrics',
      icon: Monitor,
      href: '/security/dashboard',
      color: 'from-teal-600 to-teal-700',
      stats: { score: '98%', issues: 1 }
    }
  ];

  const recentActivity = [
    { type: 'access', message: 'John Smith accessed Flower Room 3', time: '2 min ago', icon: DoorOpen, severity: 'info' },
    { type: 'visitor', message: 'Sarah Johnson (ABC Labs) checked in', time: '15 min ago', icon: UserCheck, severity: 'info' },
    { type: 'alarm', message: 'Door held open - Loading Dock 2', time: '45 min ago', icon: AlertTriangle, severity: 'warning' },
    { type: 'badge', message: 'New contractor badge issued to Mike Davis', time: '1 hour ago', icon: Key, severity: 'info' },
    { type: 'incident', message: 'Tailgating detected at Main Entrance', time: '2 hours ago', icon: Shield, severity: 'warning' }
  ];

  const currentStatus = {
    employeesOnSite: 42,
    visitorsOnSite: 3,
    contractorsOnSite: 5,
    alarmsActive: 0,
    doorsOpen: 2,
    zonesOccupied: 8
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="w-10 h-10 text-green-400" />
            Security & Access Control
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor facility security, manage access, and track visitors
          </p>
        </div>

        {/* Live Status */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Live Facility Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{currentStatus.employeesOnSite}</div>
              <div className="text-sm text-gray-400">Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{currentStatus.visitorsOnSite}</div>
              <div className="text-sm text-gray-400">Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{currentStatus.contractorsOnSite}</div>
              <div className="text-sm text-gray-400">Contractors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{currentStatus.alarmsActive}</div>
              <div className="text-sm text-gray-400">Active Alarms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{currentStatus.doorsOpen}</div>
              <div className="text-sm text-gray-400">Doors Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{currentStatus.zonesOccupied}</div>
              <div className="text-sm text-gray-400">Zones Active</div>
            </div>
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

        {/* Recent Activity and Zone Status */}
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
                    <div className={`p-2 rounded-lg ${
                      activity.severity === 'warning' ? 'bg-yellow-900/30' : 'bg-gray-700'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        activity.severity === 'warning' ? 'text-yellow-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zone Occupancy */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Zone Occupancy
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">Cultivation Areas</div>
                  <div className="text-sm text-gray-400">Clone, Veg, Flower Rooms</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">28/35</div>
                  <div className="text-xs text-gray-500">80% capacity</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">Processing Area</div>
                  <div className="text-sm text-gray-400">Trim, Package, Cure</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">12/15</div>
                  <div className="text-xs text-gray-500">80% capacity</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                <div>
                  <div className="font-medium">Vault</div>
                  <div className="text-sm text-gray-400">High Security Storage</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">2/4</div>
                  <div className="text-xs text-gray-500">50% capacity</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Office Areas</div>
                  <div className="text-sm text-gray-400">Admin, Conference</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">8/20</div>
                  <div className="text-xs text-gray-500">40% capacity</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <UserCheck className="w-6 h-6" />
              <span className="text-sm">Check In Visitor</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Key className="w-6 h-6" />
              <span className="text-sm">Issue Badge</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <DoorOpen className="w-6 h-6" />
              <span className="text-sm">Remote Unlock</span>
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="text-sm">Emergency Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
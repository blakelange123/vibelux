'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users,
  Calendar,
  Clock,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  DollarSign,
  Award,
  Activity,
  AlertCircle,
  TrendingUp,
  UserPlus,
  CalendarDays,
  Timer,
  FileText
} from 'lucide-react';

const modules = [
  {
    title: 'Employee Management',
    description: 'Manage employee profiles, roles, and departments',
    icon: Users,
    href: '/workforce/employees',
    color: 'from-blue-500 to-blue-600',
    stats: { employees: 42, departments: 6 }
  },
  {
    title: 'Scheduling',
    description: 'Create and manage employee schedules and shifts',
    icon: Calendar,
    href: '/workforce/scheduling',
    color: 'from-green-500 to-green-600',
    stats: { shiftsThisWeek: 168, coverage: '95%' }
  },
  {
    title: 'Time & Attendance',
    description: 'Track clock-ins, breaks, and overtime',
    icon: Clock,
    href: '/workforce/time-tracking',
    color: 'from-purple-500 to-purple-600',
    stats: { clockedIn: 18, avgHours: 7.8 }
  },
  {
    title: 'Task Management',
    description: 'Assign and track cultivation tasks',
    icon: ClipboardCheck,
    href: '/workforce/tasks',
    color: 'from-orange-500 to-orange-600',
    stats: { tasksToday: 124, completion: '87%' }
  },
  {
    title: 'Training & Certification',
    description: 'Manage employee training and compliance',
    icon: GraduationCap,
    href: '/workforce/training',
    color: 'from-pink-500 to-pink-600',
    stats: { compliant: '98%', expiringSoon: 3 }
  },
  {
    title: 'Labor Analytics',
    description: 'Track productivity and labor costs',
    icon: BarChart3,
    href: '/workforce/analytics',
    color: 'from-indigo-500 to-indigo-600',
    stats: { laborCost: '$42.5K', efficiency: '92%' }
  }
];

const quickActions = [
  { icon: UserPlus, label: 'Add Employee', href: '/workforce/employees/new' },
  { icon: CalendarDays, label: 'Create Schedule', href: '/workforce/scheduling/new' },
  { icon: Timer, label: 'View Timesheet', href: '/workforce/time-tracking/timesheet' },
  { icon: FileText, label: 'Run Reports', href: '/workforce/reports' }
];

const alerts = [
  { type: 'warning', message: '3 employees have expiring certifications this month' },
  { type: 'info', message: 'Next week\'s schedule needs 2 more cultivation techs' },
  { type: 'success', message: 'Labor efficiency up 5% from last month' }
];

export default function WorkforcePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">Workforce Management</h1>
                <p className="text-gray-400">Manage your team and optimize labor</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-600/30' :
                  alert.type === 'info' ? 'bg-blue-900/20 border border-blue-600/30' :
                  'bg-green-900/20 border border-green-600/30'
                }`}
              >
                <AlertCircle className={`w-5 h-5 ${
                  alert.type === 'warning' ? 'text-yellow-400' :
                  alert.type === 'info' ? 'text-blue-400' :
                  'text-green-400'
                }`} />
                <span className="text-sm">{alert.message}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
              >
                <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Modules */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-lg font-semibold mb-6">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={module.href}
                  className="block bg-gray-800 hover:bg-gray-750 rounded-xl p-6 transition-all hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${module.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{module.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    {Object.entries(module.stats).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-lg font-semibold mb-6">Today's Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
              <div className="text-2xl font-bold">18/22</div>
              <div className="text-sm text-gray-400">Employees Present</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="text-2xl font-bold">142.5</div>
              <div className="text-sm text-gray-400">Total Hours</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-gray-500">Projected</span>
              </div>
              <div className="text-2xl font-bold">$3,425</div>
              <div className="text-sm text-gray-400">Labor Cost</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-gray-500">Rate</span>
              </div>
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm text-gray-400">Productivity</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"
import { useState } from 'react'
import Link from 'next/link'
import {
  Leaf,
  Wifi,
  DollarSign,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Globe,
  BarChart3
} from 'lucide-react'

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: React.FC<any>
  href: string
  stats?: {
    label: string
    value: string | number
    trend?: number
  }
  color: string
  badge?: string
}

export function FeatureShowcase() {
  const features: FeatureCard[] = [
    {
      id: 'carbon',
      title: 'Carbon Credits',
      description: 'Track sustainability metrics and trade carbon credits on blockchain',
      icon: Leaf,
      href: '/carbon-credits',
      stats: { label: 'Credits Earned', value: '2,450', trend: 12 },
      color: 'green',
      badge: 'New'
    },
    {
      id: 'iot',
      title: 'IoT Management',
      description: 'Monitor and control all your connected devices from one dashboard',
      icon: Wifi,
      href: '/iot-devices',
      stats: { label: 'Devices Online', value: '24/28' },
      color: 'blue'
    },
    {
      id: 'leasing',
      title: 'Equipment Leasing',
      description: 'Calculate financing options and compare lease vs buy scenarios',
      icon: DollarSign,
      href: '/leasing',
      stats: { label: 'Avg Savings', value: '$45K', trend: 8 },
      color: 'yellow'
    },
    {
      id: 'forum',
      title: 'Community Forum',
      description: 'Connect with expert growers and share cultivation knowledge',
      icon: MessageSquare,
      href: '/forum',
      stats: { label: 'Active Members', value: '1,234' },
      color: 'pink'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      green: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      blue: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      yellow: 'from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800',
      pink: 'from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800'
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  const getIconBgColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-500/20',
      green: 'bg-green-500/20',
      blue: 'bg-blue-500/20',
      yellow: 'bg-yellow-500/20',
      pink: 'bg-pink-500/20'
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Advanced Features</h2>
        <p className="text-gray-400">Explore our latest tools for professional growers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.id}
              href={feature.href}
              className="group relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all duration-300"
            >
              {/* Badge */}
              {feature.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                    {feature.badge}
                  </span>
                </div>
              )}

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(feature.color)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative p-6">
                {/* Icon */}
                <div className={`w-12 h-12 ${getIconBgColor(feature.color)} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {feature.description}
                </p>

                {/* Stats */}
                {feature.stats && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{feature.stats.label}</span>
                      {feature.stats.trend && (
                        <span className={`text-xs flex items-center gap-1 ${
                          feature.stats.trend > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {Math.abs(feature.stats.trend)}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-100 mt-1">
                      {feature.stats.value}
                    </p>
                  </div>
                )}

                {/* Action */}
                <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-100">40+</p>
          <p className="text-xs text-gray-400">Advanced Features</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-100">5K+</p>
          <p className="text-xs text-gray-400">Active Users</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-100">30%</p>
          <p className="text-xs text-gray-400">Carbon Reduced</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-100">99.9%</p>
          <p className="text-xs text-gray-400">Uptime SLA</p>
        </div>
      </div>
    </div>
  )
}
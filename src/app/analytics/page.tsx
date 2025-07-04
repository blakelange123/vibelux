'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { generatePerformanceData, generateUsageMetrics, PerformanceData, UsageMetrics } from '@/lib/analytics-utils'

export default function Analytics() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    setPerformanceData(generatePerformanceData())
    setMetrics(generateUsageMetrics())
  }, [])

  const totalCalculations = performanceData.reduce((sum, day) => 
    sum + day.ppfdCalculations + day.heatLoadCalculations + day.vpdCalculations, 0
  )

  const averageDailyUsage = performanceData.length > 0 ? Math.round(totalCalculations / performanceData.length) : 0

  const chartData = performanceData.slice(-30) // Last 30 days

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
            <p className="text-gray-600">
              Comprehensive insights into platform usage and performance metrics
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Usage Overview</h2>
              <div className="flex space-x-2">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Calculations</div>
                <div className="text-2xl font-bold text-blue-600">{totalCalculations.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Last 30 days</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Daily Average</div>
                <div className="text-2xl font-bold text-green-600">{averageDailyUsage}</div>
                <div className="text-xs text-gray-500">Calculations per day</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Designs Created</div>
                <div className="text-2xl font-bold text-purple-600">{metrics.designsCreated.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total designs</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Energy Optimized</div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(metrics.energySaved / 1000)}k
                </div>
                <div className="text-xs text-gray-500">kWh saved</div>
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Daily Usage Trends</h3>
            
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              {/* Simple chart visualization */}
              <div className="flex items-end justify-between h-full space-x-1">
                {chartData.map((day, index) => {
                  const total = day.ppfdCalculations + day.heatLoadCalculations + day.vpdCalculations
                  const maxValue = Math.max(...chartData.map(d => d.ppfdCalculations + d.heatLoadCalculations + d.vpdCalculations))
                  const height = (total / maxValue) * 100
                  
                  return (
                    <div key={index} className="flex flex-col items-center group relative">
                      <div 
                        className="bg-blue-500 rounded-t w-4 transition-all group-hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {new Date(day.date).getDate()}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {day.date}: {total} calculations
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>Total Calculations</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator Usage Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Calculator Usage</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-gray-700">PPFD Calculator</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {performanceData.reduce((sum, day) => sum + day.ppfdCalculations, 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((performanceData.reduce((sum, day) => sum + day.ppfdCalculations, 0) / totalCalculations) * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-gray-700">Heat Load Calculator</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {performanceData.reduce((sum, day) => sum + day.heatLoadCalculations, 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((performanceData.reduce((sum, day) => sum + day.heatLoadCalculations, 0) / totalCalculations) * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                    <span className="text-gray-700">VPD Calculator</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {performanceData.reduce((sum, day) => sum + day.vpdCalculations, 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((performanceData.reduce((sum, day) => sum + day.vpdCalculations, 0) / totalCalculations) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Insights */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">High PPFD Calculator Usage</div>
                      <div className="text-sm text-blue-700">
                        PPFD calculator shows 45% usage increase this month
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-green-900">Design Tool Adoption</div>
                      <div className="text-sm text-green-700">
                        Advanced designer seeing strong adoption with 3.4k designs created
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-orange-900">Energy Impact</div>
                      <div className="text-sm text-orange-700">
                        Platform optimizations have saved 2.8M kWh across all facilities
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Admin Dashboard</div>
                  <div className="text-sm text-gray-600">System management</div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Operations</div>
                  <div className="text-sm text-gray-600">Live metrics</div>
                </div>
              </div>
            </Link>

            <Link href="/energy" className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Energy</div>
                  <div className="text-sm text-gray-600">Optimization</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
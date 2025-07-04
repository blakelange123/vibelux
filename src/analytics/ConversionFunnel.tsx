'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Users, 
  ArrowDown, 
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Filter,
  Calendar
} from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  description: string;
  totalUsers: number;
  completedUsers: number;
  conversionRate: number;
  avgTimeToComplete: number;
  dropoffReasons: Array<{
    reason: string;
    percentage: number;
  }>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topExitPages: string[];
  improvementSuggestions: string[];
}

interface FunnelAnalytics {
  totalUsers: number;
  overallConversionRate: number;
  avgFunnelCompletionTime: number;
  steps: FunnelStep[];
  realtimeUsers: Array<{
    userId: string;
    currentStep: string;
    timeInStep: number;
    device: string;
    location: string;
  }>;
}

interface ConversionFunnelProps {
  className?: string;
  funnelType?: 'signup' | 'purchase' | 'onboarding' | 'custom';
  timeRange?: '1h' | '24h' | '7d' | '30d';
  showRealtime?: boolean;
}

export default function ConversionFunnel({
  className = '',
  funnelType = 'signup',
  timeRange = '24h',
  showRealtime = true
}: ConversionFunnelProps) {
  const [funnelData, setFunnelData] = useState<FunnelAnalytics | null>(null);
  const [selectedStep, setSelectedStep] = useState<FunnelStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Generate mock funnel data
  const generateMockFunnelData = (): FunnelAnalytics => {
    const steps: FunnelStep[] = [
      {
        id: 'landing',
        name: 'Landing Page Visit',
        description: 'Users arrive on the landing page',
        totalUsers: 10000,
        completedUsers: 10000,
        conversionRate: 100,
        avgTimeToComplete: 15,
        dropoffReasons: [],
        devices: { desktop: 6000, mobile: 3500, tablet: 500 },
        topExitPages: [],
        improvementSuggestions: ['Optimize page load speed', 'Improve mobile experience']
      },
      {
        id: 'signup_form',
        name: 'Sign Up Form',
        description: 'Users click sign up and view the form',
        totalUsers: 4500,
        completedUsers: 4500,
        conversionRate: 45,
        avgTimeToComplete: 45,
        dropoffReasons: [
          { reason: 'Too many form fields', percentage: 35 },
          { reason: 'Page load timeout', percentage: 20 },
          { reason: 'Unclear value proposition', percentage: 25 },
          { reason: 'Mobile usability issues', percentage: 20 }
        ],
        devices: { desktop: 2800, mobile: 1400, tablet: 300 },
        topExitPages: ['/pricing', '/features', '/contact'],
        improvementSuggestions: ['Reduce form fields', 'Add social login options', 'Improve mobile form design']
      },
      {
        id: 'form_completion',
        name: 'Form Completion',
        description: 'Users fill out and submit the sign up form',
        totalUsers: 3200,
        completedUsers: 3200,
        conversionRate: 71.1,
        avgTimeToComplete: 120,
        dropoffReasons: [
          { reason: 'Email validation issues', percentage: 30 },
          { reason: 'Password requirements too strict', percentage: 25 },
          { reason: 'Form validation errors', percentage: 25 },
          { reason: 'Interrupted by other tasks', percentage: 20 }
        ],
        devices: { desktop: 2100, mobile: 900, tablet: 200 },
        topExitPages: ['/login', '/forgot-password'],
        improvementSuggestions: ['Simplify password requirements', 'Add real-time validation', 'Save form progress']
      },
      {
        id: 'email_verification',
        name: 'Email Verification',
        description: 'Users verify their email address',
        totalUsers: 2400,
        completedUsers: 2400,
        conversionRate: 75,
        avgTimeToComplete: 300,
        dropoffReasons: [
          { reason: 'Email not received', percentage: 40 },
          { reason: 'Forgot to check email', percentage: 30 },
          { reason: 'Email in spam folder', percentage: 20 },
          { reason: 'Link expired', percentage: 10 }
        ],
        devices: { desktop: 1600, mobile: 650, tablet: 150 },
        topExitPages: ['/resend-verification', '/support'],
        improvementSuggestions: ['Improve email deliverability', 'Add SMS verification option', 'Extend link expiry time']
      },
      {
        id: 'onboarding_start',
        name: 'Onboarding Started',
        description: 'Users begin the onboarding process',
        totalUsers: 1900,
        completedUsers: 1900,
        conversionRate: 79.2,
        avgTimeToComplete: 60,
        dropoffReasons: [
          { reason: 'Onboarding too long', percentage: 40 },
          { reason: 'Unclear instructions', percentage: 30 },
          { reason: 'Technical issues', percentage: 20 },
          { reason: 'Lost interest', percentage: 10 }
        ],
        devices: { desktop: 1300, mobile: 500, tablet: 100 },
        topExitPages: ['/dashboard', '/skip-onboarding'],
        improvementSuggestions: ['Shorten onboarding steps', 'Add progress indicator', 'Make steps optional']
      },
      {
        id: 'first_action',
        name: 'First Action Completed',
        description: 'Users complete their first meaningful action',
        totalUsers: 1450,
        completedUsers: 1450,
        conversionRate: 76.3,
        avgTimeToComplete: 180,
        dropoffReasons: [
          { reason: 'Feature too complex', percentage: 35 },
          { reason: 'No immediate value', percentage: 30 },
          { reason: 'UI confusion', percentage: 25 },
          { reason: 'Performance issues', percentage: 10 }
        ],
        devices: { desktop: 1000, mobile: 380, tablet: 70 },
        topExitPages: ['/help', '/tutorials', '/settings'],
        improvementSuggestions: ['Simplify first action', 'Add guided tutorial', 'Highlight immediate benefits']
      }
    ];

    const realtimeUsers = Array.from({ length: 25 }, (_, i) => ({
      userId: `user-${i + 1}`,
      currentStep: steps[Math.floor(Math.random() * steps.length)].id,
      timeInStep: Math.floor(Math.random() * 300) + 10,
      device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
      location: ['US', 'UK', 'DE', 'CA', 'AU'][Math.floor(Math.random() * 5)]
    }));

    return {
      totalUsers: steps[0].totalUsers,
      overallConversionRate: (steps[steps.length - 1].completedUsers / steps[0].totalUsers) * 100,
      avgFunnelCompletionTime: steps.reduce((sum, step) => sum + step.avgTimeToComplete, 0),
      steps,
      realtimeUsers
    };
  };

  useEffect(() => {
    const loadData = () => {
      const data = generateMockFunnelData();
      setFunnelData(data);
      setIsLoading(false);
    };

    loadData();
    
    // Update real-time data periodically
    if (showRealtime) {
      const interval = setInterval(() => {
        const data = generateMockFunnelData();
        setFunnelData(data);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [funnelType, timeRange, showRealtime]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStepColor = (index: number) => {
    const colors = [
      'bg-blue-600', 'bg-purple-600', 'bg-green-600', 
      'bg-yellow-600', 'bg-red-600', 'bg-indigo-600'
    ];
    return colors[index % colors.length];
  };

  const getDropoffSeverity = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading || !funnelData) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-gray-300">Loading funnel analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Conversion Funnel Analytics</h2>
          </div>
          <div className="flex items-center gap-3">
            {showRealtime && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Live</span>
              </div>
            )}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <div className="flex border border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'chart' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{funnelData.totalUsers.toLocaleString()}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Overall Conversion</span>
            </div>
            <p className="text-2xl font-bold text-white">{funnelData.overallConversionRate.toFixed(1)}%</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Avg Completion Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(funnelData.avgFunnelCompletionTime)}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Active Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{funnelData.realtimeUsers.length}</p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Funnel Visualization */}
        <div className="flex-1 p-6">
          {viewMode === 'chart' ? (
            <div className="space-y-4">
              {funnelData.steps.map((step, index) => {
                const nextStep = funnelData.steps[index + 1];
                const dropoffRate = nextStep 
                  ? ((step.completedUsers - nextStep.totalUsers) / step.completedUsers) * 100
                  : 0;
                
                return (
                  <div key={step.id} className="relative">
                    <div
                      className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                        selectedStep?.id === step.id 
                          ? 'border-purple-500 bg-purple-500/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedStep(step)}
                    >
                      {/* Progress Bar Background */}
                      <div className="h-16 bg-gray-900 relative">
                        {/* Funnel Shape */}
                        <div 
                          className={`h-full ${getStepColor(index)} flex items-center px-6 relative`}
                          style={{ 
                            width: `${(step.totalUsers / funnelData.totalUsers) * 100}%`,
                            clipPath: index === 0 ? 'none' : 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)'
                          }}
                        >
                          <div className="flex items-center justify-between w-full text-white">
                            <div>
                              <div className="font-semibold">{step.name}</div>
                              <div className="text-sm opacity-90">{step.totalUsers.toLocaleString()} users</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{step.conversionRate.toFixed(1)}%</div>
                              <div className="text-sm opacity-90">{formatTime(step.avgTimeToComplete)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Real-time indicator */}
                      {showRealtime && (
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400">
                              {funnelData.realtimeUsers.filter(u => u.currentStep === step.id).length} live
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dropoff Arrow */}
                    {nextStep && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-3 text-sm">
                          <ArrowDown className={`w-4 h-4 ${getDropoffSeverity(nextStep.conversionRate)}`} />
                          <span className={`font-medium ${getDropoffSeverity(nextStep.conversionRate)}`}>
                            {dropoffRate.toFixed(1)}% drop-off
                          </span>
                          <span className="text-gray-400">
                            ({(step.completedUsers - nextStep.totalUsers).toLocaleString()} users)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Step
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Avg Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Drop-off
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {funnelData.steps.map((step, index) => {
                    const nextStep = funnelData.steps[index + 1];
                    const dropoffRate = nextStep 
                      ? ((step.completedUsers - nextStep.totalUsers) / step.completedUsers) * 100
                      : 0;

                    return (
                      <tr 
                        key={step.id}
                        className="hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedStep(step)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{step.name}</div>
                          <div className="text-sm text-gray-400">{step.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {step.totalUsers.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getDropoffSeverity(step.conversionRate)}`}>
                            {step.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatTime(step.avgTimeToComplete)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {nextStep && (
                            <span className={`text-sm ${getDropoffSeverity(100 - dropoffRate)}`}>
                              {dropoffRate.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Step Details Panel */}
        {selectedStep && (
          <div className="w-96 border-l border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Step Analysis</h3>
              <button
                onClick={() => setSelectedStep(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Step Overview */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">{selectedStep.name}</h4>
                <p className="text-sm text-gray-400 mb-4">{selectedStep.description}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Total Users</div>
                    <div className="text-lg font-bold text-white">{selectedStep.totalUsers.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Conversion Rate</div>
                    <div className={`text-lg font-bold ${getDropoffSeverity(selectedStep.conversionRate)}`}>
                      {selectedStep.conversionRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Device Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(selectedStep.devices).map(([device, count]) => (
                    <div key={device} className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 capitalize">{device}</span>
                      <span className="text-sm text-white">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop-off Reasons */}
              {selectedStep.dropoffReasons.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Drop-off Reasons</h4>
                  <div className="space-y-2">
                    {selectedStep.dropoffReasons.map((reason, index) => (
                      <div key={index} className="bg-gray-900 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm text-white">{reason.reason}</span>
                          <span className="text-sm text-red-400">{reason.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-red-500 h-1 rounded-full"
                            style={{ width: `${reason.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Exit Pages */}
              {selectedStep.topExitPages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Top Exit Pages</h4>
                  <div className="space-y-1">
                    {selectedStep.topExitPages.map((page, index) => (
                      <div key={index} className="text-sm text-gray-400">
                        {page}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Suggestions */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Improvement Suggestions</h4>
                <div className="space-y-2">
                  {selectedStep.improvementSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-900/20 rounded">
                      <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-200">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Activity */}
              {showRealtime && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Current Activity</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {funnelData.realtimeUsers
                      .filter(user => user.currentStep === selectedStep.id)
                      .map((user, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-300">{user.userId}</span>
                          </div>
                          <div className="text-gray-400">
                            {formatTime(user.timeInStep)} • {user.device}
                          </div>
                        </div>
                      ))}
                  </div>
                  {funnelData.realtimeUsers.filter(user => user.currentStep === selectedStep.id).length === 0 && (
                    <p className="text-sm text-gray-500">No users currently in this step</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
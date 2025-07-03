'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Package,
  Users,
  Calendar,
  Bell,
  Download,
  Plus,
  ChevronRight,
  Info,
  AlertCircle,
  XCircle,
  BarChart3,
  Target,
  Zap,
  Building,
  ShoppingCart,
  ClipboardCheck,
  ThermometerSun,
  FlaskConical,
  Truck,
  RefreshCw
} from 'lucide-react';
import { FoodSafetyComplianceService } from '@/lib/food-safety/compliance-service';

interface ComplianceDashboardProps {
  facilityId: string;
  facilityType: 'cannabis' | 'produce' | 'ornamental' | 'research';
}

export function ComplianceDashboard({ facilityId, facilityType }: ComplianceDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'haccp' | 'buyers' | 'alerts' | 'reports'>('overview');
  const [mockRecallInProgress, setMockRecallInProgress] = useState(false);

  const complianceService = new FoodSafetyComplianceService();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [facilityId]);

  const loadDashboardData = async () => {
    try {
      const data = await complianceService.getComplianceDashboard(facilityId);
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load compliance dashboard:', error);
      setLoading(false);
    }
  };

  const handleMockRecall = async () => {
    setMockRecallInProgress(true);
    try {
      const result = await complianceService.performMockRecall(facilityId, {
        productName: 'Leafy Greens Mix',
        lotNumber: `LG-${new Date().toISOString().split('T')[0]}-001`,
        productionDate: new Date()
      });

      // Show results
      alert(`Mock recall completed in ${result.duration.toFixed(1)} minutes. Effectiveness: ${result.effectiveness}%`);
      
      // Refresh dashboard
      await loadDashboardData();
    } catch (error) {
      console.error('Mock recall failed:', error);
      alert('Mock recall failed. Please try again.');
    } finally {
      setMockRecallInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Food Safety Compliance Center
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time monitoring and multi-buyer compliance management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {dashboardData?.overallScore || 0}%
                </div>
                <p className="text-xs text-gray-500">Compliance Score</p>
              </div>

              <button
                onClick={handleMockRecall}
                disabled={mockRecallInProgress}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {mockRecallInProgress ? 'Running...' : 'Mock Recall'}
              </button>

              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {dashboardData?.recentAlerts?.filter((a: any) => !a.acknowledgedAt).length > 0 && (
                  <span className="absolute -mt-6 -mr-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'haccp', label: 'HACCP/CCPs', icon: ThermometerSun },
              { id: 'buyers', label: 'Buyer Compliance', icon: ShoppingCart },
              { id: 'alerts', label: 'Alerts & Tasks', icon: AlertCircle },
              { id: 'reports', label: 'Reports', icon: FileCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                  <span className="text-sm text-gray-500">Certifications</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.certifications?.filter((c: any) => c.status === 'valid').length || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">Active certifications</p>
                {dashboardData?.certifications?.some((c: any) => c.status === 'expiring_soon') && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {dashboardData.certifications.filter((c: any) => c.status === 'expiring_soon').length} expiring soon
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <ClipboardCheck className="w-8 h-8 text-blue-600" />
                  <span className="text-sm text-gray-500">Mock Recalls</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.mockRecallPerformance?.successRate?.toFixed(0) || 0}%
                </div>
                <p className="text-sm text-gray-500 mt-1">Success rate</p>
                <p className="text-xs text-gray-400 mt-2">
                  Avg: {dashboardData?.mockRecallPerformance?.averageDuration?.toFixed(0) || 0} min
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                  <span className="text-sm text-gray-500">Buyers</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.profiles?.length || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">Active buyers</p>
                <p className="text-xs text-green-600 mt-2">
                  {dashboardData?.profiles?.filter((p: any) => p.status === 'active').length || 0} approved
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <span className="text-sm text-gray-500">Active Alerts</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.recentAlerts?.filter((a: any) => !a.resolvedAt).length || 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">Require attention</p>
                {dashboardData?.recentAlerts?.some((a: any) => a.severity === 'critical') && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Critical alerts present
                  </p>
                )}
              </motion.div>
            </div>

            {/* Real-time Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Real-time CCP Monitoring
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Cold Storage Temperature', value: 36, limit: 41, unit: '°F', status: 'good' },
                    { name: 'Processing Room Temperature', value: 65, limit: 70, unit: '°F', status: 'good' },
                    { name: 'Wash Water Chlorine', value: 95, limit: '50-150', unit: 'ppm', status: 'good' },
                    { name: 'Product pH', value: 4.2, limit: '<4.6', unit: 'pH', status: 'good' }
                  ].map((ccp) => (
                    <div key={ccp.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ccp.name}</p>
                        <p className="text-xs text-gray-500">Limit: {ccp.limit} {ccp.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {ccp.value} {ccp.unit}
                        </span>
                        {ccp.status === 'good' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Upcoming Compliance Tasks
                </h3>
                <div className="space-y-3">
                  {dashboardData?.upcomingTasks?.slice(0, 5).map((task: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{task.task}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buyer Status Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Buyer Compliance Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {dashboardData?.profiles?.map((profile: any) => (
                  <div
                    key={profile.buyer}
                    className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setSelectedBuyer(profile.buyer)}
                  >
                    <div className="relative inline-flex">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        profile.status === 'active' ? 'bg-green-500' :
                        profile.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {profile.buyer.substring(0, 2).toUpperCase()}
                      </div>
                      {profile.alerts > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {profile.alerts}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                      {profile.buyer}
                    </p>
                    <p className="text-xs text-gray-500">
                      {profile.completeness}% complete
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'haccp' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-orange-600" />
                  HACCP Plan & Critical Control Points
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Update HACCP Plan
                </button>
              </div>

              {/* HACCP Flow Diagram */}
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Process Flow with CCPs</h4>
                <div className="flex items-center justify-between">
                  {[
                    { step: 'Receiving', ccp: false },
                    { step: 'Storage', ccp: true, id: 'CCP1' },
                    { step: 'Washing', ccp: true, id: 'CCP2' },
                    { step: 'Processing', ccp: false },
                    { step: 'Packaging', ccp: false },
                    { step: 'Cold Storage', ccp: true, id: 'CCP3' },
                    { step: 'Distribution', ccp: false }
                  ].map((step, index) => (
                    <React.Fragment key={step.step}>
                      <div className="text-center">
                        <div className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center ${
                          step.ccp ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {step.ccp && (
                            <span className="text-xs font-bold text-red-600 dark:text-red-400">{step.id}</span>
                          )}
                          <span className="text-xs text-gray-700 dark:text-gray-300">{step.step}</span>
                        </div>
                      </div>
                      {index < 6 && (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* CCP Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Critical Control Points</h4>
                {[
                  {
                    id: 'CCP1',
                    name: 'Cold Storage Temperature',
                    hazard: 'Biological - Pathogen Growth',
                    limit: '≤ 41°F',
                    monitoring: 'Continuous sensor monitoring',
                    frequency: 'Every 15 minutes',
                    corrective: 'Adjust temperature, segregate product if > 41°F for > 4 hours'
                  },
                  {
                    id: 'CCP2',
                    name: 'Wash Water Sanitizer',
                    hazard: 'Biological - Cross-contamination',
                    limit: '50-150 ppm chlorine',
                    monitoring: 'Test strips/digital meter',
                    frequency: 'Every 2 hours',
                    corrective: 'Adjust sanitizer levels, re-wash affected product'
                  },
                  {
                    id: 'CCP3',
                    name: 'Finished Product Storage',
                    hazard: 'Biological - Pathogen Growth',
                    limit: '≤ 35°F within 3 hours',
                    monitoring: 'Temperature data logger',
                    frequency: 'Continuous',
                    corrective: 'Rapid cooling, evaluate product safety'
                  }
                ].map((ccp) => (
                  <div key={ccp.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-sm font-medium rounded">
                            {ccp.id}
                          </span>
                          <h5 className="font-medium text-gray-900 dark:text-white">{ccp.name}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Hazard:</p>
                            <p className="text-gray-900 dark:text-white">{ccp.hazard}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Critical Limit:</p>
                            <p className="text-gray-900 dark:text-white font-medium">{ccp.limit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monitoring:</p>
                            <p className="text-gray-900 dark:text-white">{ccp.monitoring}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Frequency:</p>
                            <p className="text-gray-900 dark:text-white">{ccp.frequency}</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Corrective Action:</p>
                          <p className="text-sm text-gray-900 dark:text-white">{ccp.corrective}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buyers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {dashboardData?.profiles?.map((profile: any) => (
                <div key={profile.buyer} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        profile.status === 'active' ? 'bg-green-500' :
                        profile.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {profile.buyer.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {profile.buyer}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`font-medium ${
                            profile.status === 'active' ? 'text-green-600' :
                            profile.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                          }`}>{profile.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.completeness}%
                      </div>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full ${
                        profile.completeness >= 80 ? 'bg-green-500' :
                        profile.completeness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${profile.completeness}%` }}
                    />
                  </div>

                  {/* Key requirements */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { name: 'GFSI Certification', status: 'complete' },
                      { name: 'Insurance Certificate', status: 'complete' },
                      { name: 'Product Specifications', status: 'pending' },
                      { name: 'Audit Report', status: profile.nextAudit ? 'due' : 'complete' }
                    ].map((req) => (
                      <div key={req.name} className="flex items-center gap-2">
                        {req.status === 'complete' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : req.status === 'pending' ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-gray-700 dark:text-gray-300">{req.name}</span>
                      </div>
                    ))}
                  </div>

                  {profile.nextAudit && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Next audit: {new Date(profile.nextAudit).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Buyer
                </h3>
                <div className="space-y-4">
                  {['US Foods', 'Whole Foods', 'Sysco', 'Kroger', 'Walmart', 'Costco'].map((buyer) => (
                    <button
                      key={buyer}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{buyer}</span>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                  <button className="w-full p-3 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <span className="text-sm text-gray-500">Custom Buyer</span>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Buyer Benefits
                </h4>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Automated compliance tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Document version control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Audit preparation assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Real-time status updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Active Alerts
              </h3>
              <div className="space-y-3">
                {dashboardData?.recentAlerts?.filter((a: any) => !a.resolvedAt).map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      alert.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          alert.severity === 'critical' ? 'bg-red-500' :
                          alert.severity === 'high' ? 'bg-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}>
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                          {alert.actionItems && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Required Actions:</p>
                              {alert.actionItems.map((action: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                  <span>{action}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                          Acknowledge
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Compliance Calendar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.upcomingTasks?.map((task: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{task.task}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compliance Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Monthly Compliance Summary', type: 'monthly', icon: FileCheck },
                  { name: 'Annual Food Safety Review', type: 'annual', icon: Shield },
                  { name: 'Mock Recall Report', type: 'recall', icon: AlertTriangle },
                  { name: 'HACCP Verification', type: 'haccp', icon: ClipboardCheck },
                  { name: 'Buyer Audit Package', type: 'audit', icon: Package },
                  { name: 'Training Records Summary', type: 'training', icon: Users }
                ].map((report) => {
                  const Icon = report.icon;
                  return (
                    <div key={report.name} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-6 h-6 text-blue-600" />
                        <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        Last generated: {new Date().toLocaleDateString()}
                      </p>
                      <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Generate Report
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compliance Trends
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                {/* In production, add actual charts here */}
                <p>Compliance trend charts would appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
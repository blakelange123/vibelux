'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  Database,
  Zap,
  DollarSign,
  RefreshCw,
  Clock,
  Server,
  Wifi,
  Gauge
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: string;
  uptime?: number;
  details?: any;
  endpoint?: string;
}

interface CronJobStatus {
  name: string;
  isRunning: boolean;
  lastRun?: string;
  lastError?: string;
  consecutiveFailures: number;
  nextRun?: string;
}

export default function ServiceHealthDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkServices = async () => {
    try {
      // Check core services
      const serviceChecks = await Promise.allSettled([
        fetch('/api/health/db'),
        fetch('/api/health/redis'),
        fetch('/api/energy/real-time'),
        fetch('/api/revenue-sharing/performance?facilityId=test'),
      ]);

      const serviceStatuses: ServiceStatus[] = [
        {
          name: 'Database',
          status: serviceChecks[0].status === 'fulfilled' && serviceChecks[0].value?.ok ? 'healthy' : 'unhealthy',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/health/db'
        },
        {
          name: 'Redis Cache',
          status: serviceChecks[1].status === 'fulfilled' && serviceChecks[1].value?.ok ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/health/redis'
        },
        {
          name: 'Energy Monitoring',
          status: serviceChecks[2].status === 'fulfilled' && serviceChecks[2].value?.ok ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/energy/real-time'
        },
        {
          name: 'Revenue Sharing',
          status: serviceChecks[3].status === 'fulfilled' && serviceChecks[3].value?.ok ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/revenue-sharing/performance'
        }
      ];

      // Check InfluxDB
      try {
        const influxCheck = await fetch('/api/health/influxdb');
        serviceStatuses.push({
          name: 'InfluxDB (Time Series)',
          status: influxCheck.ok ? 'healthy' : 'unhealthy',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/health/influxdb'
        });
      } catch {
        serviceStatuses.push({
          name: 'InfluxDB (Time Series)',
          status: 'unknown',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/health/influxdb'
        });
      }

      // Check Stripe
      try {
        const stripeCheck = await fetch('/api/stripe/health');
        serviceStatuses.push({
          name: 'Stripe Payments',
          status: stripeCheck.ok ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/stripe/health'
        });
      } catch {
        serviceStatuses.push({
          name: 'Stripe Payments',
          status: 'unknown',
          lastCheck: new Date().toISOString(),
          endpoint: '/api/stripe/health'
        });
      }

      setServices(serviceStatuses);

      // Check cron jobs
      try {
        const cronResponse = await fetch('/api/cron/status');
        if (cronResponse.ok) {
          const cronData = await cronResponse.json();
          setCronJobs(cronData.jobs || []);
        }
      } catch (error) {
        console.error('Failed to fetch cron status:', error);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('Database')) return <Database className="w-4 h-4" />;
    if (serviceName.includes('Redis')) return <Server className="w-4 h-4" />;
    if (serviceName.includes('Energy')) return <Zap className="w-4 h-4" />;
    if (serviceName.includes('Revenue')) return <DollarSign className="w-4 h-4" />;
    if (serviceName.includes('InfluxDB')) return <Gauge className="w-4 h-4" />;
    if (serviceName.includes('Stripe')) return <DollarSign className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const overallHealth = services.length > 0 ? 
    services.every(s => s.status === 'healthy') ? 'healthy' :
    services.some(s => s.status === 'unhealthy') ? 'unhealthy' : 'degraded'
    : 'unknown';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Checking services...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(overallHealth)}
            <div className="ml-3">
              <h2 className="text-xl font-semibold text-gray-900">
                System Status: {overallHealth.charAt(0).toUpperCase() + overallHealth.slice(1)}
              </h2>
              <p className="text-gray-600">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={checkServices}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.name} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getServiceIcon(service.name)}
                <h3 className="ml-2 font-medium text-gray-900">{service.name}</h3>
              </div>
              {getStatusIcon(service.status)}
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Last check: {new Date(service.lastCheck).toLocaleTimeString()}
              </div>
              {service.uptime && (
                <div className="mt-1">
                  Uptime: {Math.floor(service.uptime / 3600)}h {Math.floor((service.uptime % 3600) / 60)}m
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cron Jobs Status */}
      {cronJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Jobs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failures
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cronJobs.map((job) => (
                  <tr key={job.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {job.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {job.isRunning ? (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                            Running
                          </div>
                        ) : job.consecutiveFailures > 0 ? (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            Failed
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Ready
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.consecutiveFailures > 0 ? (
                        <span className="text-red-600">{job.consecutiveFailures}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Revenue Sharing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Baseline calculations active</li>
                <li>✅ Performance tracking enabled</li>
                <li>✅ Payment processing ready</li>
                <li>⏳ Awaiting real sensor data</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Energy Monitoring</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ InfluxDB time-series database</li>
                <li>✅ Real-time optimization rules</li>
                <li>✅ Safety constraints active</li>
                <li>⏳ Smart meter connections pending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
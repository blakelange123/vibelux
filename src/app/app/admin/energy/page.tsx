'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Power, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Database,
  Brain,
  RefreshCw,
  Play,
  Pause,
  Settings,
  TrendingUp
} from 'lucide-react';

interface SystemStatus {
  initialized: boolean;
  emergencyStop: {
    active: boolean;
    lastHeartbeat: string;
    heartbeatAge: number;
  };
  stats: {
    alertsLast24h: number;
    activeConfigs: number;
    optimizationsLastHour: number;
  };
}

export default function EnergyAdminPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch system status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/energy/start');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setError('Failed to fetch system status');
    }
  };
  
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);
  
  const startSystem = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/energy/start', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Energy optimization system started successfully');
        await fetchStatus();
      } else {
        setError(data.error || 'Failed to start system');
      }
    } catch (error) {
      setError('Failed to start energy system');
    } finally {
      setIsLoading(false);
    }
  };
  
  const runDatabaseSetup = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST'
      });
      
      if (response.ok) {
        setSuccess('Database setup completed successfully');
      } else {
        setError('Database setup failed');
      }
    } catch (error) {
      setError('Failed to run database setup');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold">Energy System Admin</h1>
            <p className="text-gray-400">Monitor and control the energy optimization system</p>
          </div>
        </div>
        <Button 
          onClick={fetchStatus}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Alerts */}
      {error && (
        <Alert className="border-red-600 bg-red-900/20">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-600 bg-green-900/20">
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {/* System Status */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">System Status</span>
              <Power className={`w-5 h-5 ${status?.initialized ? 'text-green-400' : 'text-gray-500'}`} />
            </div>
            <div className="text-2xl font-bold">
              {status?.initialized ? 'Running' : 'Stopped'}
            </div>
            <Badge 
              variant={status?.initialized ? 'default' : 'secondary'}
              className="mt-2"
            >
              {status?.initialized ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Facilities</span>
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold">
              {status?.stats?.activeConfigs || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Facilities with optimization enabled
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Recent Optimizations</span>
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold">
              {status?.stats?.optimizationsLastHour || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              In the last hour
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">System Alerts</span>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold">
              {status?.stats?.alertsLast24h || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Last 24 hours
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Emergency Stop Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Emergency Stop System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Status</div>
              <Badge 
                variant={status?.emergencyStop?.active ? 'destructive' : 'default'}
                className="mt-1"
              >
                {status?.emergencyStop?.active ? 'ACTIVE - ALL LIGHTS 100%' : 'Normal Operation'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-400">Last Heartbeat</div>
              <div className="text-sm mt-1">
                {status?.emergencyStop?.lastHeartbeat 
                  ? new Date(status.emergencyStop.lastHeartbeat).toLocaleTimeString()
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Heartbeat Age</div>
              <div className="text-sm mt-1">
                {status?.emergencyStop?.heartbeatAge 
                  ? `${(status.emergencyStop.heartbeatAge / 1000).toFixed(1)}s ago`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Control Panel */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={startSystem}
              disabled={isLoading || status?.initialized}
              className="w-full"
              variant={status?.initialized ? 'secondary' : 'default'}
            >
              <Play className="w-4 h-4 mr-2" />
              {status?.initialized ? 'System Running' : 'Start System'}
            </Button>
            
            <Button
              onClick={runDatabaseSetup}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              Setup Database
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/energy-setup'}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Facilities
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium mb-3">System Information</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Claude API Model:</span>
                <span className="ml-2">Claude 3 Opus (Best)</span>
              </div>
              <div>
                <span className="text-gray-400">Optimization Interval:</span>
                <span className="ml-2">Every 5 minutes</span>
              </div>
              <div>
                <span className="text-gray-400">Revenue Share:</span>
                <span className="ml-2">20% of verified savings</span>
              </div>
              <div>
                <span className="text-gray-400">Safety Systems:</span>
                <span className="ml-2">Active with watchdog</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Documentation Links */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Documentation & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('/ENERGY_OPTIMIZATION_DEPLOYMENT.md', '_blank')}
            >
              📚 Deployment Guide
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('/api-docs', '_blank')}
            >
              🔌 API Documentation
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/dashboard'}
            >
              📊 View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
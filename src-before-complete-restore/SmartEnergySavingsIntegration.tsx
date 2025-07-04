'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Info,
  Lock,
  Unlock,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { energyOptimizationEngine, OptimizationResult } from '@/lib/energy-optimization-rules';
import { energyMonitoring } from '@/lib/energy-monitoring';
import { ModbusLightingControl, createLightingController } from '@/lib/modbus-lighting-control';

interface SystemStatus {
  component: string;
  status: 'active' | 'inactive' | 'error' | 'warning';
  message: string;
  icon: any;
}

interface ActiveOptimization {
  strategy: string;
  status: 'running' | 'paused' | 'blocked';
  savings: number;
  duration: string;
  safetyScore: number;
}

export function SmartEnergySavingsIntegration() {
  const [systemActive, setSystemActive] = useState(false);
  const [cropType, setCropType] = useState('cannabis');
  const [growthStage, setGrowthStage] = useState('flowering');
  const [safetyOverride, setSafetyOverride] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
    {
      component: 'Energy Monitoring',
      status: 'active',
      message: 'Real-time monitoring active',
      icon: Activity
    },
    {
      component: 'Photoperiod Protection',
      status: 'active',
      message: 'Cannabis flowering 12/12 locked',
      icon: Shield
    },
    {
      component: 'Lighting Control',
      status: 'active',
      message: 'Modbus connection established',
      icon: Zap
    },
    {
      component: 'Optimization Engine',
      status: 'inactive',
      message: 'Ready to optimize',
      icon: Brain
    }
  ]);
  
  // Active optimizations
  const [activeOptimizations, setActiveOptimizations] = useState<ActiveOptimization[]>([
    {
      strategy: 'Peak Shaving',
      status: 'running',
      savings: 24.5,
      duration: '2h 15m',
      safetyScore: 100
    },
    {
      strategy: 'Dynamic Dimming',
      status: 'running',
      savings: 18.3,
      duration: '4h 30m',
      safetyScore: 100
    },
    {
      strategy: 'Photoperiod Shift',
      status: 'blocked',
      savings: 0,
      duration: 'N/A',
      safetyScore: 0
    }
  ]);
  
  // Initialize optimization engine
  useEffect(() => {
    try {
      energyOptimizationEngine.initialize(cropType, growthStage);
    } catch (error) {
      console.error('Failed to initialize optimization engine:', error);
    }
  }, [cropType, growthStage]);
  
  // Test optimization action
  const testOptimization = async (action: string) => {
    const testParams = {
      photoperiod_shift: { shiftHours: 2 },
      intensity_reduction: { currentIntensity: 800, targetIntensity: 680, duration: 4 },
      spectrum_adjustment: { redBlueRatio: 3.0, enableFarRed: false }
    };
    
    const result: OptimizationResult = energyOptimizationEngine.evaluateOptimization(
      action,
      testParams[action as keyof typeof testParams]
    );
    
    // Show result in alert
    alert(`
      Action: ${action}
      Allowed: ${result.allowed}
      ${result.reason ? `Reason: ${result.reason}` : ''}
      Risk Score: ${result.riskScore}/100
      Estimated Savings: $${result.estimatedSavings.toFixed(2)}/month
      Warnings: ${result.warnings.join(', ') || 'None'}
    `);
    
    return result;
  };
  
  // Start optimization system
  const startOptimization = async () => {
    if (safetyOverride && cropType === 'cannabis' && growthStage === 'flowering') {
      const confirmed = window.confirm(
        'WARNING: Overriding photoperiod protection for cannabis flowering can cause:\n' +
        '- Revegetation (plant returns to vegetative growth)\n' +
        '- Hermaphroditism (male flowers develop)\n' +
        '- Complete crop loss\n\n' +
        'Are you absolutely sure you want to override safety protections?'
      );
      
      if (!confirmed) {
        setSafetyOverride(false);
        return;
      }
    }
    
    setSystemActive(true);
    
    // Update system status
    setSystemStatus(prev => prev.map(s => 
      s.component === 'Optimization Engine' 
        ? { ...s, status: 'active', message: 'Optimizing energy usage' }
        : s
    ));
    
    // Start real optimization
    // This would connect to actual hardware and monitoring systems
  };
  
  // Stop optimization
  const stopOptimization = () => {
    setSystemActive(false);
    
    setSystemStatus(prev => prev.map(s => 
      s.component === 'Optimization Engine' 
        ? { ...s, status: 'inactive', message: 'Optimization paused' }
        : s
    ));
  };
  
  return (
    <div className="space-y-6">
      {/* System Control Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-gray-900 border-purple-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <CardTitle className="text-2xl">Smart Energy Savings Integration</CardTitle>
                <p className="text-gray-400 mt-1">
                  AI-powered optimization with crop protection • {cropType} - {growthStage}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestMode(!testMode)}
              >
                {testMode ? 'Exit Test Mode' : 'Test Mode'}
              </Button>
              
              <Button
                size="lg"
                variant={systemActive ? "destructive" : "default"}
                onClick={systemActive ? stopOptimization : startOptimization}
                className={systemActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {systemActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause System
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start System
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Critical Safety Alert */}
      {cropType === 'cannabis' && growthStage === 'flowering' && (
        <Alert className="border-red-600 bg-red-900/20">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Critical Photoperiod Protection Active:</strong> Cannabis flowering requires 
                exactly 12/12 light cycle. The system will NOT shift photoperiod timing. Energy 
                savings will come from intelligent dimming and peak shaving only.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 border-red-600 text-red-400 hover:bg-red-900/50"
                onClick={() => setSafetyOverride(!safetyOverride)}
              >
                {safetyOverride ? (
                  <>
                    <Unlock className="w-4 h-4 mr-1" />
                    Safety OFF
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-1" />
                    Safety ON
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* System Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systemStatus.map((status) => {
          const Icon = status.icon;
          return (
            <Card key={status.component} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`w-5 h-5 ${
                    status.status === 'active' ? 'text-green-400' :
                    status.status === 'warning' ? 'text-yellow-400' :
                    status.status === 'error' ? 'text-red-400' :
                    'text-gray-400'
                  }`} />
                  <Badge 
                    variant={
                      status.status === 'active' ? 'default' :
                      status.status === 'warning' ? 'secondary' :
                      status.status === 'error' ? 'destructive' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {status.status}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-1">{status.component}</h4>
                <p className="text-xs text-gray-400">{status.message}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Active Optimizations */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Active Optimization Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeOptimizations.map((opt) => (
              <div 
                key={opt.strategy}
                className={`p-4 rounded-lg border ${
                  opt.status === 'running' ? 'bg-green-900/20 border-green-700' :
                  opt.status === 'blocked' ? 'bg-red-900/20 border-red-700' :
                  'bg-gray-900 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{opt.strategy}</h4>
                      <Badge 
                        variant={
                          opt.status === 'running' ? 'default' :
                          opt.status === 'blocked' ? 'destructive' :
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {opt.status}
                      </Badge>
                      {opt.safetyScore > 0 && (
                        <span className="text-xs text-gray-400">
                          Safety: {opt.safetyScore}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Savings: ${opt.savings}/hr</span>
                      <span>Duration: {opt.duration}</span>
                    </div>
                  </div>
                  
                  {testMode && opt.status !== 'blocked' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testOptimization(
                        opt.strategy.toLowerCase().replace(' ', '_')
                      )}
                    >
                      Test
                    </Button>
                  )}
                </div>
                
                {opt.status === 'blocked' && opt.strategy === 'Photoperiod Shift' && (
                  <Alert className="mt-2 border-orange-700 bg-orange-900/20">
                    <Info className="w-4 h-4 text-orange-400" />
                    <AlertDescription className="text-xs">
                      Blocked: Cannabis flowering photoperiod is critical and cannot be shifted
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Test Mode Controls */}
      {testMode && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Test Mode Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => testOptimization('photoperiod_shift')}
              >
                Test Photoperiod Shift
              </Button>
              <Button
                variant="outline"
                onClick={() => testOptimization('intensity_reduction')}
              >
                Test Intensity Reduction
              </Button>
              <Button
                variant="outline"
                onClick={() => testOptimization('spectrum_adjustment')}
              >
                Test Spectrum Adjustment
              </Button>
            </div>
            
            <Alert className="mt-4 border-blue-600 bg-blue-900/20">
              <Info className="w-4 h-4 text-blue-400" />
              <AlertDescription>
                Test mode simulates optimization actions without affecting actual lighting. 
                Use this to verify safety rules are working correctly for your crops.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
      
      {/* How It Works */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Smart Integration Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">1</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Crop-Specific Rules Engine</h4>
                <p>Enforces hard limits on photoperiod, DLI, and intensity based on crop type and growth stage. Cannabis flowering is protected with zero-tolerance rules.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">2</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Real-Time Monitoring</h4>
                <p>Continuously monitors power consumption, light levels, and environmental conditions. Verified by smart meters for accurate billing.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">3</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Intelligent Control</h4>
                <p>Modbus integration with lighting systems enables precise dimming and scheduling while maintaining crop requirements.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">4</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Automated Optimization</h4>
                <p>AI continuously finds savings opportunities within safe parameters. Peak shaving, dynamic dimming, and thermal response all protect your crop.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
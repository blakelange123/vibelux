'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  DollarSign,
  Clock,
  Leaf,
  Sun,
  Lock,
  Settings,
  Info,
  BarChart3,
  Activity,
  Brain,
  AlertCircle,
  CheckCheck,
  Timer,
  Gauge
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmergencyStopButton from './EmergencyStopButton';

interface CropPhotoperiodLimits {
  cropType: string;
  vegetative: { min: number; max: number; optimal: number };
  flowering: { min: number; max: number; optimal: number };
  criticalPhotoperiod: boolean; // Cannot be changed
  maxDailyShift: number; // Maximum hours to shift in a day
}

interface EnergySavingStrategy {
  id: string;
  name: string;
  description: string;
  estimatedSavings: number;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  cropSafe: boolean;
  requiredSensors: string[];
  implemented: boolean;
  active: boolean;
}

interface RealTimeSavings {
  currentPowerDraw: number;
  baselinePowerDraw: number;
  instantaneousSavings: number;
  dailySavingsProjection: number;
  monthlySavingsProjection: number;
  co2Reduction: number;
}

export function EnergySavingsProgram() {
  const [programActive, setProgramActive] = useState(false);
  const [currentCrop, setCurrentCrop] = useState('cannabis');
  const [growthStage, setGrowthStage] = useState<'vegetative' | 'flowering'>('flowering');
  const [realTimeSavings, setRealTimeSavings] = useState<RealTimeSavings>({
    currentPowerDraw: 145.2,
    baselinePowerDraw: 168.5,
    instantaneousSavings: 23.3,
    dailySavingsProjection: 28.45,
    monthlySavingsProjection: 853.50,
    co2Reduction: 12.4
  });

  // Crop-specific photoperiod protection limits
  const cropPhotoperiodLimits: Record<string, CropPhotoperiodLimits> = {
    cannabis: {
      cropType: 'Cannabis',
      vegetative: { min: 18, max: 24, optimal: 18 },
      flowering: { min: 12, max: 12, optimal: 12 }, // CRITICAL - must be exactly 12
      criticalPhotoperiod: true,
      maxDailyShift: 0 // Cannot shift flowering photoperiod
    },
    tomato: {
      cropType: 'Tomato',
      vegetative: { min: 14, max: 20, optimal: 16 },
      flowering: { min: 12, max: 20, optimal: 14 },
      criticalPhotoperiod: false,
      maxDailyShift: 2 // Can shift up to 2 hours
    },
    lettuce: {
      cropType: 'Lettuce',
      vegetative: { min: 14, max: 24, optimal: 18 },
      flowering: { min: 14, max: 24, optimal: 18 }, // Lettuce doesn't flower in production
      criticalPhotoperiod: false,
      maxDailyShift: 4 // More flexible
    },
    strawberry: {
      cropType: 'Strawberry',
      vegetative: { min: 8, max: 16, optimal: 14 },
      flowering: { min: 8, max: 12, optimal: 10 }, // Short day plant
      criticalPhotoperiod: true,
      maxDailyShift: 1
    }
  };

  // Energy saving strategies with crop safety checks
  const [strategies, setStrategies] = useState<EnergySavingStrategy[]>([
    {
      id: 'peak-shaving',
      name: 'Intelligent Peak Shaving',
      description: 'Reduces lighting by 15% during peak demand hours without affecting DLI',
      estimatedSavings: 182.50,
      riskLevel: 'low',
      cropSafe: true,
      requiredSensors: ['PAR sensor', 'Power meter'],
      implemented: true,
      active: true
    },
    {
      id: 'dynamic-dimming',
      name: 'Dynamic Dimming Control',
      description: 'Adjusts light intensity based on natural sunlight to maintain target DLI',
      estimatedSavings: 145.00,
      riskLevel: 'none',
      cropSafe: true,
      requiredSensors: ['PAR sensor', 'Weather station'],
      implemented: true,
      active: true
    },
    {
      id: 'photoperiod-shift',
      name: 'Off-Peak Photoperiod Shift',
      description: 'Shifts lighting schedule to off-peak hours while maintaining exact photoperiod',
      estimatedSavings: 210.00,
      riskLevel: growthStage === 'flowering' && currentCrop === 'cannabis' ? 'high' : 'low',
      cropSafe: growthStage === 'flowering' && currentCrop === 'cannabis' ? false : true,
      requiredSensors: ['Timer', 'Power meter'],
      implemented: true,
      active: growthStage === 'flowering' && currentCrop === 'cannabis' ? false : true
    },
    {
      id: 'temperature-response',
      name: 'Temperature-Based Dimming',
      description: 'Reduces light intensity when temperatures exceed optimal range',
      estimatedSavings: 98.00,
      riskLevel: 'low',
      cropSafe: true,
      requiredSensors: ['Temperature sensor', 'PAR sensor'],
      implemented: true,
      active: true
    },
    {
      id: 'demand-response',
      name: 'Utility Demand Response',
      description: 'Participates in utility programs for financial incentives',
      estimatedSavings: 315.00,
      riskLevel: 'medium',
      cropSafe: true,
      requiredSensors: ['Smart meter', 'Control system'],
      implemented: true,
      active: false
    }
  ]);

  // Real-time monitoring data
  const [photoperiodStatus, setPhotoperiodStatus] = useState({
    currentPhotoperiod: 12,
    targetPhotoperiod: 12,
    lightsOnTime: '08:00',
    lightsOffTime: '20:00',
    actualDLI: 28.5,
    targetDLI: 30,
    deviation: 0
  });

  // Safety checks and overrides
  const [safetyStatus, setSafetyStatus] = useState({
    photoperiodProtection: true,
    dliMaintenance: true,
    temperatureCompensation: true,
    emergencyOverride: false,
    growerOverride: false
  });

  // Calculate if a strategy is safe for current crop/stage
  const isStrategySafe = (strategy: EnergySavingStrategy): boolean => {
    const limits = cropPhotoperiodLimits[currentCrop];
    
    if (strategy.id === 'photoperiod-shift') {
      // Critical check for cannabis flowering
      if (currentCrop === 'cannabis' && growthStage === 'flowering') {
        return false; // NEVER shift photoperiod during cannabis flowering
      }
      
      // Check if crop allows shifting
      return limits.maxDailyShift > 0;
    }
    
    // All other strategies are generally safe if they maintain DLI
    return strategy.cropSafe;
  };

  // Energy usage pattern (24-hour)
  const energyUsagePattern = Array.from({ length: 24 }, (_, hour) => {
    const isLightOn = growthStage === 'flowering' 
      ? hour >= 8 && hour < 20  // 12 hours for flowering
      : hour >= 6 && hour < 24;  // 18 hours for vegetative
    
    const baseUsage = isLightOn ? 140 : 45; // Lights on vs off
    const optimizedUsage = isLightOn && programActive 
      ? baseUsage * 0.85  // 15% reduction when optimized
      : baseUsage;
    
    return {
      hour,
      baseline: baseUsage,
      optimized: optimizedUsage,
      savings: baseUsage - optimizedUsage,
      rate: hour >= 14 && hour <= 19 ? 0.18 : 0.12 // Peak vs off-peak
    };
  });

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (programActive) {
        setRealTimeSavings(prev => ({
          ...prev,
          instantaneousSavings: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
          currentPowerDraw: prev.baselinePowerDraw - (20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10)
        }));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [programActive]);

  const totalMonthlySavings = strategies
    .filter(s => s.active && isStrategySafe(s))
    .reduce((sum, s) => sum + s.estimatedSavings, 0);

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <Card className="bg-gradient-to-r from-green-900/50 to-gray-900 border-green-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Energy Savings Program</CardTitle>
                <p className="text-gray-400 mt-1">$0 upfront cost • Pay only from savings • Crop-safe optimization</p>
              </div>
            </div>
            <Button
              size="lg"
              variant={programActive ? "destructive" : "default"}
              onClick={() => setProgramActive(!programActive)}
              className={programActive ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {programActive ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Program Active
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Activate Program
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Critical Crop Protection Alert */}
      {currentCrop === 'cannabis' && growthStage === 'flowering' && (
        <Alert className="border-red-600 bg-red-900/20">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-white">
            <strong>Photoperiod Protection Active:</strong> Cannabis flowering requires exactly 12/12 light cycle. 
            System will NOT adjust photoperiod timing to protect your crop. Energy savings will come from 
            dimming and efficiency optimization only.
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time Savings Dashboard with Emergency Stop */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Current Savings</span>
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {programActive ? `${realTimeSavings.instantaneousSavings.toFixed(1)} kW` : '0 kW'}
                </div>
                <div className="text-xs text-green-400 mt-1">
                  {programActive ? '↓ 13.8% from baseline' : 'Program inactive'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Daily Projection</span>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  ${programActive ? realTimeSavings.dailySavingsProjection.toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {programActive ? `${(realTimeSavings.dailySavingsProjection * 0.2).toFixed(2)} revenue share` : 'Activate to start saving'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Monthly Projection</span>
                  <TrendingDown className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  ${programActive ? totalMonthlySavings.toFixed(0) : '0'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {programActive ? 'Verified by smart meters' : 'Based on your profile'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">CO₂ Reduction</span>
                  <Leaf className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {programActive ? `${realTimeSavings.co2Reduction.toFixed(1)} kg/day` : '0 kg/day'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Carbon credit eligible
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Emergency Stop Button */}
        <div className="md:col-span-1">
          <EmergencyStopButton />
        </div>
      </div>

      {/* Photoperiod Protection Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Crop Protection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Current Settings */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Crop Type</div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="font-medium">{cropPhotoperiodLimits[currentCrop].cropType}</span>
              </div>
              <Badge variant={growthStage === 'flowering' ? 'destructive' : 'default'} className="mt-1">
                {growthStage}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">Photoperiod</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{photoperiodStatus.currentPhotoperiod}h / day</span>
              </div>
              <div className="text-xs text-gray-500">
                {photoperiodStatus.lightsOnTime} - {photoperiodStatus.lightsOffTime}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">DLI Status</div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">{photoperiodStatus.actualDLI} mol/m²/d</span>
              </div>
              <Progress 
                value={(photoperiodStatus.actualDLI / photoperiodStatus.targetDLI) * 100} 
                className="h-2 mt-1"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">Protection Level</div>
              <div className="flex flex-col gap-1">
                <Badge 
                  variant={safetyStatus.photoperiodProtection ? "default" : "destructive"}
                  className="text-xs"
                >
                  {safetyStatus.photoperiodProtection ? '✓ Photoperiod' : '✗ Photoperiod'}
                </Badge>
                <Badge 
                  variant={safetyStatus.dliMaintenance ? "default" : "destructive"}
                  className="text-xs"
                >
                  {safetyStatus.dliMaintenance ? '✓ DLI Target' : '✗ DLI Target'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">Override Controls</div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => setSafetyStatus({...safetyStatus, growerOverride: !safetyStatus.growerOverride})}
              >
                <Lock className="w-4 h-4 mr-1" />
                {safetyStatus.growerOverride ? 'Locked' : 'Override'}
              </Button>
              {safetyStatus.growerOverride && (
                <Badge variant="destructive" className="text-xs">Manual Control</Badge>
              )}
            </div>
          </div>

          {/* Critical Warning for Cannabis Flowering */}
          {currentCrop === 'cannabis' && growthStage === 'flowering' && (
            <Alert className="mt-4 border-orange-600 bg-orange-900/20">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <AlertDescription>
                <strong>Critical Phase:</strong> Cannabis flowering photoperiod locked at 12/12. 
                Any deviation can cause revegetation or hermaphroditism. System will maintain exact timing.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Energy Optimization Strategies */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Active Optimization Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strategies.map(strategy => {
              const isSafe = isStrategySafe(strategy);
              const isActive = strategy.active && isSafe && programActive;
              
              return (
                <div 
                  key={strategy.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-green-900/20 border-green-700' 
                      : isSafe 
                        ? 'bg-gray-900 border-gray-700' 
                        : 'bg-red-900/10 border-red-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{strategy.name}</h4>
                        {!isSafe && (
                          <Badge variant="destructive" className="text-xs">
                            Blocked - Crop Protection
                          </Badge>
                        )}
                        {isActive && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{strategy.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-400">
                          Saves ${strategy.estimatedSavings}/month
                        </span>
                        <span className="text-gray-500">
                          Risk: {strategy.riskLevel}
                        </span>
                        <span className="text-gray-500">
                          Requires: {strategy.requiredSensors.join(', ')}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isActive ? "destructive" : "outline"}
                      disabled={!isSafe || !programActive}
                      onClick={() => {
                        const updated = [...strategies];
                        const index = updated.findIndex(s => s.id === strategy.id);
                        updated[index].active = !updated[index].active;
                        setStrategies(updated);
                      }}
                    >
                      {isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 24-Hour Energy Pattern */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            24-Hour Energy Optimization Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyUsagePattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9CA3AF"
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelFormatter={(hour) => `${hour}:00`}
                />
                <Area 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                  name="Baseline Usage (kW)"
                />
                <Area 
                  type="monotone" 
                  dataKey="optimized" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.5}
                  name="Optimized Usage (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm text-gray-400">Baseline Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-400">Optimized Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-400">Peak Rate Hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>How Our Energy Savings Program Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-medium">Zero Upfront Cost</h4>
              </div>
              <p className="text-sm text-gray-400 ml-13">
                No equipment purchases or installation fees. We optimize your existing systems 
                using smart controls and AI.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-medium">Crop-Safe Optimization</h4>
              </div>
              <p className="text-sm text-gray-400 ml-13">
                Our system protects critical photoperiods and maintains DLI targets. 
                Cannabis flowering cycles are never compromised.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-medium">Pay From Savings</h4>
              </div>
              <p className="text-sm text-gray-400 ml-13">
                We share 20% of verified energy savings. You keep 80% of the savings 
                with no risk and full control.
              </p>
            </div>
          </div>
          
          <Alert className="mt-6 border-blue-600 bg-blue-900/20">
            <Info className="w-4 h-4 text-blue-400" />
            <AlertDescription>
              <strong>Guaranteed Performance:</strong> Our smart meters verify actual savings. 
              If we don't save you money, you don't pay us anything. Average facilities save 
              $800-2,500 per month while maintaining or improving crop quality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
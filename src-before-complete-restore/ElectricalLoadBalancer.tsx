'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  AlertTriangle, 
  Info, 
  Plus, 
  Settings,
  Activity,
  TrendingUp,
  Trash2,
  Copy
} from 'lucide-react';
import { 
  electricalLoadBalancer, 
  type Circuit, 
  type ElectricalPanel, 
  type FixtureElectrical 
} from '@/lib/electrical-load-balancing';

interface ElectricalLoadBalancerProps {
  fixtures: Array<{
    id: string;
    wattage: number;
    voltage?: number;
    enabled: boolean;
  }>;
  defaultVoltage?: number;
  onPanelConfigChange?: (panels: ElectricalPanel[]) => void;
}

export function ElectricalLoadBalancer({ 
  fixtures, 
  defaultVoltage = 208,
  onPanelConfigChange 
}: ElectricalLoadBalancerProps) {
  const [panels, setPanels] = useState<ElectricalPanel[]>([]);
  const [showPanelConfig, setShowPanelConfig] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [wireDistance, setWireDistance] = useState(100); // feet

  // Initialize with a default panel
  useEffect(() => {
    if (panels.length === 0) {
      const defaultPanel = electricalLoadBalancer.createDefaultPanel(
        'Main Panel',
        200,
        defaultVoltage,
        defaultVoltage === 208 ? 3 : 1
      );
      setPanels([defaultPanel]);
    }
  }, []);

  // Convert fixtures to electrical format
  const fixtureElectrical: FixtureElectrical[] = fixtures
    .filter(f => f.enabled)
    .map(f => ({
      id: f.id,
      wattage: f.wattage,
      voltage: f.voltage || defaultVoltage,
      current: f.wattage / (f.voltage || defaultVoltage),
      powerFactor: 0.95
    }));

  // Run load balancing
  const balancingResult = electricalLoadBalancer.balanceLoad(fixtureElectrical, panels);
  
  // Update parent component
  useEffect(() => {
    if (onPanelConfigChange) {
      onPanelConfigChange(balancingResult.panels);
    }
  }, [balancingResult.panels]);

  const addPanel = () => {
    const newPanel = electricalLoadBalancer.createDefaultPanel(
      `Panel ${panels.length + 1}`,
      200,
      defaultVoltage,
      defaultVoltage === 208 ? 3 : 1
    );
    setPanels([...panels, newPanel]);
  };

  const removePanel = (panelId: string) => {
    setPanels(panels.filter(p => p.id !== panelId));
  };

  const getPhaseColor = (phase: 'A' | 'B' | 'C') => {
    switch (phase) {
      case 'A': return 'text-red-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 0.9) return 'bg-red-500';
    if (utilization > 0.8) return 'bg-yellow-500';
    if (utilization > 0.6) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Electrical Load Balancing
          </span>
          <button
            onClick={() => setShowPanelConfig(!showPanelConfig)}
            className="text-sm font-normal text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-4 w-4" />
          </button>
        </CardTitle>
        <CardDescription>
          Automatic load distribution across circuits and phases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">
              {(balancingResult.totalLoad / 1000).toFixed(1)} kW
            </div>
            <div className="text-xs text-gray-600">Total Load</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">
              {balancingResult.efficiency.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Utilization</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">
              {balancingResult.panels.reduce((sum, p) => sum + p.circuits.length, 0)}
            </div>
            <div className="text-xs text-gray-600">Circuits</div>
          </div>
        </div>

        {/* Phase Balance (for 3-phase) */}
        {defaultVoltage === 208 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Phase Balance</h4>
            <div className="space-y-2">
              {['A', 'B', 'C'].map(phase => {
                const load = balancingResult.loadDistribution[`phase${phase}` as keyof typeof balancingResult.loadDistribution];
                const maxLoad = Math.max(
                  balancingResult.loadDistribution.phaseA,
                  balancingResult.loadDistribution.phaseB,
                  balancingResult.loadDistribution.phaseC
                );
                const percentage = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
                
                return (
                  <div key={phase} className="flex items-center gap-3">
                    <span className={`font-medium ${getPhaseColor(phase as 'A' | 'B' | 'C')}`}>
                      Phase {phase}
                    </span>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-20 text-right">
                      {(load / 1000).toFixed(1)} kW
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warnings */}
        {balancingResult.warnings.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Electrical Warnings</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {balancingResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {balancingResult.recommendations.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Recommendations</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {balancingResult.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Panel Configuration */}
        {showPanelConfig && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Panel Configuration</h4>
              <button
                onClick={addPanel}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Panel
              </button>
            </div>
            
            {panels.map(panel => (
              <div key={panel.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{panel.name}</h5>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {panel.totalCapacity}A @ {panel.voltage}V
                    </Badge>
                    {panels.length > 1 && (
                      <button
                        onClick={() => removePanel(panel.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600">
                  {panel.phases === 3 ? '3-Phase' : 'Single Phase'} • 
                  {panel.circuits.length} circuits
                </div>
                
                <button
                  onClick={() => setSelectedPanel(selectedPanel === panel.id ? null : panel.id)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {selectedPanel === panel.id ? 'Hide' : 'Show'} Circuits
                </button>
                
                {selectedPanel === panel.id && (
                  <div className="mt-2 space-y-1">
                    {panel.circuits.map(circuit => {
                      const utilization = circuit.currentLoad / (circuit.capacity * circuit.voltage);
                      const wireGauge = electricalLoadBalancer.recommendWireGauge(circuit, wireDistance);
                      
                      return (
                        <div key={circuit.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span className={getPhaseColor(circuit.phase)}>
                              {circuit.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {circuit.capacity}A
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>
                              {circuit.connectedFixtures.length} fixtures
                            </span>
                            <div className="w-24">
                              <Progress 
                                value={utilization * 100} 
                                className={`h-2 ${getUtilizationColor(utilization)}`}
                              />
                            </div>
                            <span className="w-12 text-right">
                              {(utilization * 100).toFixed(0)}%
                            </span>
                            <Badge variant="outline" className="text-xs">
                              #{wireGauge.gauge} AWG
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            
            {/* Wire Distance Setting */}
            <div className="flex items-center gap-3 pt-3 border-t">
              <label className="text-sm text-gray-600">Wire run distance:</label>
              <input
                type="number"
                value={wireDistance}
                onChange={(e) => setWireDistance(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded text-sm"
                min="10"
                max="500"
                step="10"
              />
              <span className="text-sm text-gray-600">feet</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
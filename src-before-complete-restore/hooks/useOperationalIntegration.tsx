import { useState, useEffect, useCallback } from 'react';
import { OperationsIntegration } from '@/lib/operations-integration';

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  co2: number;
  vpd: number;
  lightIntensity: number;
  ph?: number;
  ec?: number;
  waterTemp?: number;
}

interface UseOperationalIntegrationReturn {
  currentRiskScore: number;
  activeAlerts: any[];
  pendingTasks: any[];
  operationalEfficiency: number;
  environmentalTriggers: any[];
  createTaskFromEnvironment: (envData: EnvironmentalData, room: string) => void;
  refreshData: () => void;
}

export function useOperationalIntegration(
  environmentalData: EnvironmentalData | null,
  historicalData: EnvironmentalData[] = []
): UseOperationalIntegrationReturn {
  const [riskScore, setRiskScore] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [efficiency, setEfficiency] = useState(100);
  const [triggers, setTriggers] = useState<any[]>([]);

  // Analyze environmental impact
  const analyzeEnvironment = useCallback(() => {
    if (!environmentalData) return;

    // Analyze environmental impact
    const analysis = OperationsIntegration.analyzeEnvironmentalImpact(
      environmentalData,
      historicalData
    );

    setRiskScore(analysis.riskScore);
    setTriggers(analysis.triggers);

    // Generate predictive alerts
    const predictiveAlerts = OperationsIntegration.generatePredictiveAlerts(
      environmentalData,
      historicalData,
      24
    );
    setAlerts(predictiveAlerts.alerts);

    // Calculate operational efficiency
    const targetSetpoints = {
      temperature: 75,
      humidity: 55,
      co2: 1200,
      vpd: 1.0,
      ph: 5.8,
      ec: 2.0
    };

    const efficiencyCalc = OperationsIntegration.calculateOperationalEfficiency(
      [...historicalData, environmentalData],
      targetSetpoints
    );
    setEfficiency(efficiencyCalc.efficiency);

    // Auto-create tasks from triggers
    const newTasks = analysis.triggers
      .filter(t => t.action === 'create_task')
      .map(trigger => 
        OperationsIntegration.createTaskFromTrigger(
          trigger,
          environmentalData,
          'Auto-detected'
        )
      );
    
    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks]);
    }
  }, [environmentalData, historicalData]);

  // Create task manually from environmental data
  const createTaskFromEnvironment = useCallback((envData: EnvironmentalData, room: string) => {
    const analysis = OperationsIntegration.analyzeEnvironmentalImpact(envData, historicalData);
    
    if (analysis.triggers.length > 0) {
      const task = OperationsIntegration.createTaskFromTrigger(
        analysis.triggers[0],
        envData,
        room
      );
      setTasks(prev => [...prev, task]);
    }
  }, [historicalData]);

  // Refresh all data
  const refreshData = useCallback(() => {
    analyzeEnvironment();
  }, [analyzeEnvironment]);

  // Run analysis when environmental data changes
  useEffect(() => {
    analyzeEnvironment();
  }, [environmentalData, analyzeEnvironment]);

  // Simulate periodic updates (in production, this would come from real sensors)
  useEffect(() => {
    const interval = setInterval(() => {
      if (environmentalData) {
        // Simulate small variations in environmental data
        const simulatedData: EnvironmentalData = {
          ...environmentalData,
          temperature: environmentalData.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2,
          humidity: environmentalData.humidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 3,
          co2: environmentalData.co2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50
        };
        
        analyzeEnvironment();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [environmentalData, analyzeEnvironment]);

  return {
    currentRiskScore: riskScore,
    activeAlerts: alerts,
    pendingTasks: tasks,
    operationalEfficiency: efficiency,
    environmentalTriggers: triggers,
    createTaskFromEnvironment,
    refreshData
  };
}

// Example usage component
export function OperationalIntegrationDemo() {
  // Sample environmental data (in production, this would come from sensors)
  const [envData] = useState<EnvironmentalData>({
    temperature: 78,
    humidity: 62,
    co2: 1150,
    vpd: 1.1,
    lightIntensity: 750,
    ph: 5.9,
    ec: 2.1,
    waterTemp: 68
  });

  const historicalData: EnvironmentalData[] = Array.from({ length: 24 }, (_, i) => ({
    temperature: 75 + Math.sin(i / 4) * 3,
    humidity: 55 + Math.cos(i / 3) * 5,
    co2: 1200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
    vpd: 1.0 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2,
    lightIntensity: 700 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
    ph: 5.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2,
    ec: 2.0 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2,
    waterTemp: 68 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2
  }));

  const integration = useOperationalIntegration(envData, historicalData);

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        Environmental → Operational Integration
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Risk Score</p>
          <p className="text-2xl font-bold text-white">{integration.currentRiskScore}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Efficiency</p>
          <p className="text-2xl font-bold text-white">
            {integration.operationalEfficiency.toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Active Alerts</p>
          <p className="text-2xl font-bold text-white">{integration.activeAlerts.length}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Auto Tasks</p>
          <p className="text-2xl font-bold text-white">{integration.pendingTasks.length}</p>
        </div>
      </div>

      {integration.environmentalTriggers.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
          <p className="text-sm text-yellow-300">
            {integration.environmentalTriggers.length} environmental conditions triggered operational actions
          </p>
        </div>
      )}
    </div>
  );
}
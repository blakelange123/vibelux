'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  TrendingUp,
  Target,
  Award,
  Activity,
  Settings,
  BarChart3,
  LineChart,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Thermometer,
  Droplets,
  Sun,
  Beaker
} from 'lucide-react';
import {
  ReinforcementLearningEngine,
  EnvironmentState,
  Action,
  Reward,
  TrainingEpisode
} from '@/lib/reinforcement-learning/rl-engine';

interface RLDashboardProps {
  facilityId?: string;
  onActionRecommendation?: (action: Action, confidence: number) => void;
}

export function ReinforcementLearningDashboard({ facilityId, onActionRecommendation }: RLDashboardProps) {
  const [rlEngine] = useState(() => new ReinforcementLearningEngine());
  const [isTraining, setIsTraining] = useState(false);
  const [currentState, setCurrentState] = useState<EnvironmentState | null>(null);
  const [trainingStats, setTrainingStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [lastReward, setLastReward] = useState<Reward | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [episodeStep, setEpisodeStep] = useState(0);
  const [autoMode, setAutoMode] = useState(false);

  // Initialize with mock environmental state
  useEffect(() => {
    const initialState: EnvironmentState = {
      temperature: 24.5,
      humidity: 62.0,
      co2Level: 1200,
      lightIntensity: 800,
      lightSpectrum: {
        red: 0.4,
        blue: 0.3,
        green: 0.1,
        farRed: 0.15,
        uv: 0.05
      },
      vpd: 1.1,
      soilMoisture: 0.65,
      ph: 6.1,
      ec: 1.8,
      growthStage: 'vegetative',
      plantHeight: 45.2,
      leafCount: 12,
      biomass: 125.8,
      stressLevel: 0.2,
      dayOfGrowth: 28,
      timeOfDay: 14,
      photoperiod: 18
    };

    setCurrentState(initialState);
    updateRecommendations(initialState);
  }, []);

  // Update training stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainingStats(rlEngine.getTrainingStats());
    }, 2000);

    return () => clearInterval(interval);
  }, [rlEngine]);

  const updateRecommendations = useCallback(async (state: EnvironmentState) => {
    try {
      const recs = await rlEngine.getRecommendations(state);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error updating recommendations:', error);
      // Fallback to basic recommendations
      setRecommendations([{
        action: { id: 'no_action', type: 'environmental', parameter: 'none', adjustment: 0, intensity: 0 },
        confidence: 0.1,
        expectedReward: 0,
        reasoning: 'Unable to generate recommendations at this time.'
      }]);
    }
  }, [rlEngine]);

  const simulateEnvironmentResponse = (state: EnvironmentState, action: Action): EnvironmentState => {
    const newState = { ...state };
    
    // Simulate environmental changes based on action
    if (action.type === 'environmental') {
      switch (action.parameter) {
        case 'temperature':
          newState.temperature = Math.max(15, Math.min(35, state.temperature + action.adjustment));
          break;
        case 'humidity':
          newState.humidity = Math.max(30, Math.min(90, state.humidity + action.adjustment * 100));
          break;
        case 'co2Level':
          newState.co2Level = Math.max(400, Math.min(2000, state.co2Level + action.adjustment * 1000));
          break;
      }
    } else if (action.type === 'lighting') {
      switch (action.parameter) {
        case 'lightIntensity':
          newState.lightIntensity = Math.max(0, Math.min(1200, state.lightIntensity + action.adjustment * 500));
          break;
        case 'red':
          newState.lightSpectrum.red = Math.max(0, Math.min(1, state.lightSpectrum.red + action.adjustment));
          break;
        case 'blue':
          newState.lightSpectrum.blue = Math.max(0, Math.min(1, state.lightSpectrum.blue + action.adjustment));
          break;
        case 'farRed':
          newState.lightSpectrum.farRed = Math.max(0, Math.min(1, state.lightSpectrum.farRed + action.adjustment));
          break;
      }
    } else if (action.type === 'irrigation') {
      if (action.parameter === 'soilMoisture') {
        newState.soilMoisture = Math.max(0.2, Math.min(0.9, state.soilMoisture + action.adjustment));
      }
    } else if (action.type === 'nutrition') {
      switch (action.parameter) {
        case 'ph':
          newState.ph = Math.max(5.0, Math.min(7.5, state.ph + action.adjustment));
          break;
        case 'ec':
          newState.ec = Math.max(0.5, Math.min(3.0, state.ec + action.adjustment));
          break;
      }
    }

    // Update VPD based on temperature and humidity
    const saturationVaporPressure = 0.611 * Math.exp((17.27 * newState.temperature) / (newState.temperature + 237.3));
    const actualVaporPressure = saturationVaporPressure * (newState.humidity / 100);
    newState.vpd = saturationVaporPressure - actualVaporPressure;

    // Simulate plant growth and stress response
    const idealTemp = state.growthStage === 'vegetative' ? 25 : 23;
    const idealHumidity = state.growthStage === 'vegetative' ? 62.5 : 47.5;
    const idealVpd = state.growthStage === 'vegetative' ? 1.0 : 1.25;

    const tempStress = Math.abs(newState.temperature - idealTemp) / 10;
    const humidityStress = Math.abs(newState.humidity - idealHumidity) / 50;
    const vpdStress = Math.abs(newState.vpd - idealVpd) / 2;

    newState.stressLevel = Math.min(1, (tempStress + humidityStress + vpdStress) / 3);

    // Growth simulation
    const growthFactor = 1 - newState.stressLevel;
    const dailyGrowth = growthFactor * 0.1; // Base growth rate
    newState.biomass += dailyGrowth;
    newState.plantHeight += dailyGrowth * 0.5;

    // Time progression
    newState.timeOfDay = (state.timeOfDay + 1) % 24;
    if (newState.timeOfDay === 0) {
      newState.dayOfGrowth += 1;
    }

    return newState;
  };

  const startTrainingEpisode = () => {
    if (!currentState) return;

    const episodeId = rlEngine.startEpisode(currentState);
    setCurrentEpisodeId(episodeId);
    setEpisodeStep(0);
    setIsTraining(true);
  };

  const executeAction = (action: Action) => {
    if (!currentState || !currentEpisodeId) return;

    const previousState = { ...currentState };
    const newState = simulateEnvironmentResponse(currentState, action);
    
    // Calculate reward using the RL engine's reward function
    const reward: Reward = {
      immediate: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 - 1, // Placeholder - would be calculated by RL engine
      growthRate: (newState.biomass - previousState.biomass) * 10,
      efficiency: -Math.abs(action.adjustment) * 0.5,
      quality: (previousState.stressLevel - newState.stressLevel) * 5,
      sustainability: action.intensity < 0.7 ? 1 : -1,
      total: 0
    };
    reward.total = reward.immediate + reward.growthRate + reward.efficiency + reward.quality + reward.sustainability;

    // Add step to current episode
    rlEngine.addStep(previousState, action, reward, newState);

    // Update state
    setCurrentState(newState);
    setSelectedAction(action);
    setLastReward(reward);
    setEpisodeStep(prev => prev + 1);

    // Update recommendations for new state
    updateRecommendations(newState);

    // Notify parent component
    if (onActionRecommendation) {
      onActionRecommendation(action, 0.8);
    }

    // Auto-end episode after 50 steps
    if (episodeStep >= 49) {
      endTrainingEpisode();
    }
  };

  const endTrainingEpisode = () => {
    if (!currentEpisodeId) return;

    const completedEpisode = rlEngine.endEpisode();
    setCurrentEpisodeId(null);
    setEpisodeStep(0);
    setIsTraining(false);
    setTrainingStats(rlEngine.getTrainingStats());
  };

  const autoStep = useCallback(() => {
    if (!currentState || !isTraining || !autoMode) return;

    const action = rlEngine.selectAction(currentState);
    executeAction(action);
  }, [currentState, isTraining, autoMode]);

  // Auto-step when in auto mode
  useEffect(() => {
    if (autoMode && isTraining) {
      const interval = setInterval(autoStep, 1000); // 1 action per second
      return () => clearInterval(interval);
    }
  }, [autoMode, isTraining, autoStep]);

  const exportModel = () => {
    const modelData = rlEngine.exportModel();
    const blob = new Blob([modelData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rl-model-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importModel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const modelData = e.target?.result as string;
        rlEngine.importModel(modelData);
        setTrainingStats(rlEngine.getTrainingStats());
        if (currentState) {
          updateRecommendations(currentState);
        }
      } catch (error) {
        console.error('Failed to import model:', error);
      }
    };
    reader.readAsText(file);
  };

  const resetTraining = () => {
    if (currentEpisodeId) {
      endTrainingEpisode();
    }
    // Create a new RL engine to reset all training
    setTrainingStats(null);
    setRecommendations([]);
    setSelectedAction(null);
    setLastReward(null);
  };

  const getActionIcon = (action: Action) => {
    switch (action.type) {
      case 'environmental':
        if (action.parameter.includes('temp')) return <Thermometer className="w-4 h-4" />;
        if (action.parameter.includes('humidity')) return <Droplets className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
      case 'lighting':
        return <Sun className="w-4 h-4" />;
      case 'irrigation':
        return <Droplets className="w-4 h-4" />;
      case 'nutrition':
        return <Beaker className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Reinforcement Learning Growth Optimizer</h2>
            <p className="text-gray-400">AI-powered cultivation optimization through trial and learning</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportModel}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Export Model"
          >
            <Download className="w-4 h-4 text-gray-300" />
          </button>
          <label className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-gray-300" />
            <input
              type="file"
              accept=".json"
              onChange={importModel}
              className="hidden"
            />
          </label>
          <button
            onClick={resetTraining}
            className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
            title="Reset Training"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Training Controls */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Training Controls</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={isTraining ? endTrainingEpisode : startTrainingEpisode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isTraining 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isTraining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isTraining ? 'Stop Episode' : 'Start Episode'}
          </button>

          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => setAutoMode(e.target.checked)}
              className="rounded"
            />
            Auto Mode
          </label>

          {isTraining && (
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4" />
              Step {episodeStep + 1}/50
            </div>
          )}
        </div>

        {/* Current State Display */}
        {currentState && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Temperature</div>
              <div className="text-lg font-semibold text-white">{currentState.temperature.toFixed(1)}°C</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Humidity</div>
              <div className="text-lg font-semibold text-white">{currentState.humidity.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">VPD</div>
              <div className="text-lg font-semibold text-white">{currentState.vpd.toFixed(2)} kPa</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Stress Level</div>
              <div className={`text-lg font-semibold ${
                currentState.stressLevel < 0.3 ? 'text-green-400' : 
                currentState.stressLevel < 0.7 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {(currentState.stressLevel * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Training Statistics */}
      {trainingStats && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Training Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Episodes</span>
              </div>
              <div className="text-2xl font-bold text-white">{trainingStats.totalEpisodes}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Avg Reward</span>
              </div>
              <div className="text-2xl font-bold text-white">{trainingStats.averageReward.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Best Reward</span>
              </div>
              <div className="text-2xl font-bold text-white">{trainingStats.bestReward.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Exploration</span>
              </div>
              <div className="text-2xl font-bold text-white">{(trainingStats.explorationRate * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getActionIcon(rec.action)}
                  <span className="font-medium text-white">{rec.action.id.replace(/_/g, ' ')}</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.confidence > 0.7 ? 'bg-green-600/20 text-green-400' :
                    rec.confidence > 0.4 ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {(rec.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                
                <button
                  onClick={() => executeAction(rec.action)}
                  disabled={!isTraining}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                >
                  Execute
                </button>
              </div>
              
              <p className="text-gray-400 text-sm">{rec.reasoning}</p>
              
              <div className="mt-2 text-xs text-gray-500">
                Expected Reward: {rec.expectedReward.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Action Result */}
      {selectedAction && lastReward && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Last Action Result</h3>
          
          <div className="flex items-center gap-3 mb-4">
            {getActionIcon(selectedAction)}
            <span className="font-medium text-white">{selectedAction.id.replace(/_/g, ' ')}</span>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              lastReward.total > 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
            }`}>
              {lastReward.total > 0 ? 'Positive' : 'Negative'} Outcome
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Immediate</div>
              <div className="text-sm font-semibold text-white">{lastReward.immediate.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Growth</div>
              <div className="text-sm font-semibold text-white">{lastReward.growthRate.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Efficiency</div>
              <div className="text-sm font-semibold text-white">{lastReward.efficiency.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Quality</div>
              <div className="text-sm font-semibold text-white">{lastReward.quality.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Total</div>
              <div className="text-lg font-bold text-white">{lastReward.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
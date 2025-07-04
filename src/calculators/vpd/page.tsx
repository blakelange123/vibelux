'use client';

import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  AlertCircle,
  Sprout,
  Flower,
  Leaf,
  Info,
  TrendingUp,
  TrendingDown,
  Check
} from 'lucide-react';

interface VPDResult {
  vpd: number;
  category: 'too-low' | 'optimal' | 'too-high';
  recommendation: string;
  effects: string[];
}

interface GrowthStage {
  name: string;
  icon: React.ReactNode;
  minVPD: number;
  maxVPD: number;
  description: string;
}

const GROWTH_STAGES: Record<string, GrowthStage> = {
  seedling: {
    name: 'Seedling/Clone',
    icon: <Sprout className="w-5 h-5" />,
    minVPD: 0.4,
    maxVPD: 0.8,
    description: 'Young plants need lower VPD for root development'
  },
  vegetative: {
    name: 'Vegetative',
    icon: <Leaf className="w-5 h-5" />,
    minVPD: 0.8,
    maxVPD: 1.2,
    description: 'Growing plants can handle moderate VPD'
  },
  flowering: {
    name: 'Flowering/Fruiting',
    icon: <Flower className="w-5 h-5" />,
    minVPD: 1.0,
    maxVPD: 1.5,
    description: 'Mature plants benefit from higher VPD'
  }
};

export default function VPDCalculatorPage() {
  const [temperature, setTemperature] = useState(25); // Celsius
  const [humidity, setHumidity] = useState(60); // RH%
  const [leafTemp, setLeafTemp] = useState(24); // Celsius
  const [useLeafTemp, setUseLeafTemp] = useState(false);
  const [growthStage, setGrowthStage] = useState<keyof typeof GROWTH_STAGES>('vegetative');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [result, setResult] = useState<VPDResult | null>(null);

  // Calculate saturated vapor pressure
  const calculateSVP = (temp: number): number => {
    // Magnus formula
    return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  };

  // Calculate actual vapor pressure
  const calculateAVP = (svp: number, rh: number): number => {
    return (svp * rh) / 100;
  };

  // Calculate VPD
  useEffect(() => {
    const tempToUse = useLeafTemp ? leafTemp : temperature;
    const svpLeaf = calculateSVP(tempToUse);
    const svpAir = calculateSVP(temperature);
    const avp = calculateAVP(svpAir, humidity);
    const vpd = svpLeaf - avp;

    const stage = GROWTH_STAGES[growthStage];
    let category: 'too-low' | 'optimal' | 'too-high';
    let recommendation: string;
    let effects: string[] = [];

    if (vpd < stage.minVPD) {
      category = 'too-low';
      recommendation = `Increase VPD to ${stage.minVPD}-${stage.maxVPD} kPa`;
      effects = [
        'Reduced transpiration',
        'Risk of fungal diseases',
        'Nutrient uptake issues',
        'Weak stem development'
      ];
    } else if (vpd > stage.maxVPD) {
      category = 'too-high';
      recommendation = `Decrease VPD to ${stage.minVPD}-${stage.maxVPD} kPa`;
      effects = [
        'Excessive transpiration',
        'Stomata closure',
        'Reduced photosynthesis',
        'Water stress'
      ];
    } else {
      category = 'optimal';
      recommendation = 'VPD is in the optimal range!';
      effects = [
        'Optimal transpiration',
        'Efficient nutrient uptake',
        'Maximum photosynthesis',
        'Healthy growth'
      ];
    }

    setResult({
      vpd: Math.round(vpd * 100) / 100,
      category,
      recommendation,
      effects
    });
  }, [temperature, humidity, leafTemp, useLeafTemp, growthStage]);

  // Temperature conversion helpers
  const toFahrenheit = (celsius: number) => (celsius * 9/5) + 32;
  const toCelsius = (fahrenheit: number) => (fahrenheit - 32) * 5/9;

  const displayTemp = (celsius: number) => {
    return unit === 'F' ? Math.round(toFahrenheit(celsius)) : celsius;
  };

  const handleTempChange = (value: number, setter: (val: number) => void) => {
    const celsius = unit === 'F' ? toCelsius(value) : value;
    setter(celsius);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      {/* Dark gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20 mb-4">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            VPD Calculator
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Calculate Vapor Pressure Deficit for optimal plant growth and transpiration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temperature Unit Toggle */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Temperature Unit</h3>
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setUnit('C')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      unit === 'C' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setUnit('F')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      unit === 'F' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>

            {/* Environmental Inputs */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                Environmental Conditions
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Air Temperature</span>
                    <span className="text-white font-medium">
                      {displayTemp(temperature)}°{unit}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={unit === 'F' ? 50 : 10}
                    max={unit === 'F' ? 95 : 35}
                    step="1"
                    value={displayTemp(temperature)}
                    onChange={(e) => handleTempChange(Number(e.target.value), setTemperature)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Relative Humidity</span>
                    <span className="text-white font-medium">{humidity}%</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="1"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLeafTemp}
                      onChange={(e) => setUseLeafTemp(e.target.checked)}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">Use leaf temperature (advanced)</span>
                  </label>

                  {useLeafTemp && (
                    <div className="mt-4">
                      <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span>Leaf Temperature</span>
                        <span className="text-white font-medium">
                          {displayTemp(leafTemp)}°{unit}
                        </span>
                      </label>
                      <input
                        type="range"
                        min={unit === 'F' ? 50 : 10}
                        max={unit === 'F' ? 95 : 35}
                        step="1"
                        value={displayTemp(leafTemp)}
                        onChange={(e) => handleTempChange(Number(e.target.value), setLeafTemp)}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Leaf temperature is typically 1-2°C cooler than air temperature
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Growth Stage Selection */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Growth Stage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(GROWTH_STAGES).map(([key, stage]) => (
                  <button
                    key={key}
                    onClick={() => setGrowthStage(key as keyof typeof GROWTH_STAGES)}
                    className={`p-4 rounded-lg border transition-all ${
                      growthStage === key
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {stage.icon}
                      <span className="font-medium">{stage.name}</span>
                      <span className="text-xs">
                        {stage.minVPD}-{stage.maxVPD} kPa
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {GROWTH_STAGES[growthStage].description}
              </p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* VPD Result */}
            {result && (
              <div className={`bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border ${
                result.category === 'optimal' 
                  ? 'border-green-500/50' 
                  : result.category === 'too-low'
                  ? 'border-blue-500/50'
                  : 'border-orange-500/50'
              }`}>
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-400 mb-2">Current VPD</p>
                  <p className={`text-5xl font-bold ${
                    result.category === 'optimal'
                      ? 'text-green-400'
                      : result.category === 'too-low'
                      ? 'text-blue-400'
                      : 'text-orange-400'
                  }`}>
                    {result.vpd.toFixed(2)}
                  </p>
                  <p className="text-lg text-gray-300 mt-1">kPa</p>
                </div>

                <div className={`p-4 rounded-lg mb-4 ${
                  result.category === 'optimal'
                    ? 'bg-green-500/10 text-green-400'
                    : result.category === 'too-low'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-orange-500/10 text-orange-400'
                }`}>
                  <div className="flex items-center gap-2">
                    {result.category === 'optimal' ? (
                      <Check className="w-5 h-5" />
                    ) : result.category === 'too-low' ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    <span className="font-medium">{result.recommendation}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Current Effects:</h4>
                  <ul className="space-y-2">
                    {result.effects.map((effect, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                          result.category === 'optimal'
                            ? 'bg-green-400'
                            : result.category === 'too-low'
                            ? 'bg-blue-400'
                            : 'bg-orange-400'
                        }`} />
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* How to Adjust VPD */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                How to Adjust VPD
              </h3>

              {result?.category === 'too-low' && (
                <div className="space-y-3 text-sm">
                  <p className="text-gray-400">To increase VPD:</p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      Increase temperature
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      Decrease humidity (increase ventilation)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      Improve air circulation
                    </li>
                  </ul>
                </div>
              )}

              {result?.category === 'too-high' && (
                <div className="space-y-3 text-sm">
                  <p className="text-gray-400">To decrease VPD:</p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      Decrease temperature
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      Increase humidity (misting/fogging)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      Reduce air circulation
                    </li>
                  </ul>
                </div>
              )}

              {result?.category === 'optimal' && (
                <div className="text-sm text-gray-300">
                  <p>Your VPD is perfect! Maintain current conditions for optimal growth.</p>
                </div>
              )}
            </div>

            {/* VPD Chart Reference */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Reference</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Too Low VPD</span>
                  <span className="text-blue-400 font-medium">&lt; 0.4 kPa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Seedling/Clone</span>
                  <span className="text-green-400 font-medium">0.4 - 0.8 kPa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Vegetative</span>
                  <span className="text-green-400 font-medium">0.8 - 1.2 kPa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Flowering</span>
                  <span className="text-green-400 font-medium">1.0 - 1.5 kPa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Too High VPD</span>
                  <span className="text-orange-400 font-medium">&gt; 1.5 kPa</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">Understanding VPD</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What is VPD?</h3>
              <p>
                Vapor Pressure Deficit (VPD) is the difference between the amount of moisture in the air 
                and how much moisture the air can hold when saturated. It drives transpiration and 
                affects how plants uptake water and nutrients.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Why it matters</h3>
              <p>
                VPD directly impacts plant transpiration rates, nutrient uptake, and CO₂ absorption. 
                Maintaining optimal VPD ensures healthy growth, prevents disease, and maximizes yields 
                in controlled environments.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #1f2937;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  );
}
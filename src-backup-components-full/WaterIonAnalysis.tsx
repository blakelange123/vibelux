'use client';

import React, { useState, useEffect } from 'react';
import {
  Beaker,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Calculator,
  FileDown,
  RefreshCw,
  Zap,
  Settings
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { 
  IonConcentrations, 
  WaterQualityMetrics,
  ppmToMeqL,
  meqLToPpm,
  calculateCationSum,
  calculateAnionSum,
  calculateIonBalance,
  calculateSAR,
  calculateAdjustedSAR,
  calculateRSC,
  calculateHardness,
  calculateAlkalinity,
  estimateEC,
  estimateTDS,
  calculateLSI,
  calculateRSI,
  calculateAI,
  interpretLSI,
  interpretSAR,
  calculateIWQI,
  calculateLeachingFraction,
  predictSoilEC,
  generateWaterTreatmentRecommendations,
  ionProperties
} from '@/lib/water-chemistry-calculations';

export function WaterIonAnalysis() {
  const [sampleType, setSampleType] = useState<'source' | 'runoff'>('source');
  const [ions, setIons] = useState<IonConcentrations>({
    // Default values in meq/L
    calcium: 2.5,      // 50 ppm
    magnesium: 1.0,    // 12 ppm
    potassium: 0.5,    // 20 ppm
    sodium: 1.0,       // 23 ppm
    ammonium: 0.1,     // 1.8 ppm
    iron: 0.01,        // 0.3 ppm
    manganese: 0.005,  // 0.15 ppm
    zinc: 0.002,       // 0.13 ppm
    copper: 0.001,     // 0.06 ppm
    nitrate: 2.0,      // 124 ppm
    phosphate: 0.5,    // 16 ppm as P
    sulfate: 1.5,      // 72 ppm
    chloride: 0.8,     // 28 ppm
    bicarbonate: 1.2,  // 73 ppm
    carbonate: 0.0,    // 0 ppm
    hydroxide: 0.0     // 0 ppm
  });

  const [results, setResults] = useState<WaterQualityMetrics>({
    ph: 6.5,
    ec: 1.2,
    tds: 768,
    temperature: 20,
    cationSum: 0,
    anionSum: 0,
    ionBalance: 0,
    sar: 0,
    adjustedSAR: 0,
    rsc: 0,
    hardness: 0,
    alkalinity: 0,
    langelier: 0,
    stability: 0,
    aggressiveness: 0
  });

  const [cropType, setCropType] = useState<'cannabis' | 'tomato' | 'lettuce' | 'strawberry'>('cannabis');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate results whenever ions or pH change
  useEffect(() => {
    calculateResults();
  }, [ions, results.ph, results.temperature]);

  const calculateResults = () => {
    // Calculate sums
    const cationSum = calculateCationSum(ions);
    const anionSum = calculateAnionSum(ions);
    
    // Ion balance error (%)
    const ionBalance = calculateIonBalance(cationSum, anionSum);
    
    // SAR calculations
    const sar = calculateSAR(ions.sodium, ions.calcium, ions.magnesium);
    const adjustedSAR = calculateAdjustedSAR(ions.sodium, ions.calcium, ions.magnesium, ions.bicarbonate, results.ph);
    
    // RSC and mineral content
    const rsc = calculateRSC(ions.bicarbonate, ions.carbonate, ions.calcium, ions.magnesium);
    const hardness = calculateHardness(ions.calcium, ions.magnesium);
    const alkalinity = calculateAlkalinity(ions.bicarbonate, ions.carbonate, ions.hydroxide);
    
    // EC and TDS estimation
    const ec = estimateEC(cationSum, anionSum);
    const tds = estimateTDS(ec);
    
    // Water stability indices
    const langelier = calculateLSI(results.ph, results.temperature, tds, ions.calcium, alkalinity);
    const pHs = results.ph - langelier; // Saturation pH
    const stability = calculateRSI(results.ph, pHs);
    const aggressiveness = calculateAI(results.ph, ions.calcium, alkalinity);
    
    setResults(prev => ({
      ...prev,
      cationSum,
      anionSum,
      ionBalance,
      sar,
      adjustedSAR,
      rsc,
      hardness,
      alkalinity,
      ec,
      tds,
      langelier,
      stability,
      aggressiveness
    }));
  };

  const convertToPpm = (ion: keyof typeof ionProperties, meqL: number): number => {
    return meqLToPpm(ion, meqL);
  };

  const convertToMeqL = (ion: keyof typeof ionProperties, ppm: number): number => {
    return ppmToMeqL(ion, ppm);
  };

  const getQualityIndicator = (parameter: string, value: number) => {
    switch (parameter) {
      case 'ionBalance':
        if (Math.abs(value) < 5) return { color: 'text-green-400', status: 'Excellent' };
        if (Math.abs(value) < 10) return { color: 'text-yellow-400', status: 'Good' };
        return { color: 'text-red-400', status: 'Poor' };
      
      case 'sar':
        if (value < 3) return { color: 'text-green-400', status: 'Low' };
        if (value < 6) return { color: 'text-yellow-400', status: 'Medium' };
        return { color: 'text-red-400', status: 'High' };
      
      case 'hardness':
        if (value < 60) return { color: 'text-blue-400', status: 'Soft' };
        if (value < 120) return { color: 'text-green-400', status: 'Moderate' };
        if (value < 180) return { color: 'text-yellow-400', status: 'Hard' };
        return { color: 'text-red-400', status: 'Very Hard' };
      
      default:
        return { color: 'text-gray-400', status: 'Unknown' };
    }
  };

  // Prepare data for charts
  const cationData = [
    { name: 'Ca²⁺', value: ions.calcium, ppm: convertToPpm('calcium', ions.calcium) },
    { name: 'Mg²⁺', value: ions.magnesium, ppm: convertToPpm('magnesium', ions.magnesium) },
    { name: 'K⁺', value: ions.potassium, ppm: convertToPpm('potassium', ions.potassium) },
    { name: 'Na⁺', value: ions.sodium, ppm: convertToPpm('sodium', ions.sodium) },
    { name: 'NH₄⁺', value: ions.ammonium, ppm: convertToPpm('ammonium', ions.ammonium) }
  ].filter(d => d.value > 0);

  const anionData = [
    { name: 'NO₃⁻', value: ions.nitrate, ppm: convertToPpm('nitrate', ions.nitrate) },
    { name: 'PO₄³⁻', value: ions.phosphate, ppm: convertToPpm('phosphate', ions.phosphate) },
    { name: 'SO₄²⁻', value: ions.sulfate, ppm: convertToPpm('sulfate', ions.sulfate) },
    { name: 'Cl⁻', value: ions.chloride, ppm: convertToPpm('chloride', ions.chloride) },
    { name: 'HCO₃⁻', value: ions.bicarbonate, ppm: convertToPpm('bicarbonate', ions.bicarbonate) }
  ].filter(d => d.value > 0);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Beaker className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Water Ion Analysis</h2>
            <p className="text-gray-400">Complete cation and anion balance analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="cannabis">Cannabis</option>
            <option value="tomato">Tomato</option>
            <option value="lettuce">Lettuce</option>
            <option value="strawberry">Strawberry</option>
          </select>
          <select
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value as 'source' | 'runoff')}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="source">Source Water</option>
            <option value="runoff">Runoff Water</option>
          </select>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Basic Parameters */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3">
          <label className="text-sm text-gray-400 block mb-1">pH</label>
          <input
            type="number"
            value={results.ph}
            onChange={(e) => setResults({...results, ph: Number(e.target.value)})}
            step="0.1"
            min="0"
            max="14"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <label className="text-sm text-gray-400 block mb-1">Temperature (°C)</label>
          <input
            type="number"
            value={results.temperature}
            onChange={(e) => setResults({...results, temperature: Number(e.target.value)})}
            step="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <label className="text-sm text-gray-400 block mb-1">EC (mS/cm)</label>
          <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm">
            {results.ec.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <label className="text-sm text-gray-400 block mb-1">TDS (ppm)</label>
          <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm">
            {results.tds.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Ion Balance</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className={`text-2xl font-bold ${getQualityIndicator('ionBalance', results.ionBalance).color}`}>
            {results.ionBalance.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getQualityIndicator('ionBalance', results.ionBalance).status}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">SAR</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <p className={`text-2xl font-bold ${getQualityIndicator('sar', results.sar).color}`}>
            {results.sar.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getQualityIndicator('sar', results.sar).status} Risk
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Hardness</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <p className={`text-2xl font-bold ${getQualityIndicator('hardness', results.hardness).color}`}>
            {results.hardness.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ppm CaCO₃
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">EC</span>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {results.ec.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            mS/cm
          </p>
        </div>
      </div>

      {/* Ion Input Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Cations */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">+</span> Cations
            <span className="text-sm font-normal text-gray-400">
              (Total: {results.cationSum.toFixed(2)} meq/L)
            </span>
          </h3>
          <div className="space-y-3">
            {Object.entries({
              calcium: 'Calcium (Ca²⁺)',
              magnesium: 'Magnesium (Mg²⁺)',
              potassium: 'Potassium (K⁺)',
              sodium: 'Sodium (Na⁺)',
              ammonium: 'Ammonium (NH₄⁺)'
            }).map(([key, label]) => (
              <div key={key}>
                <label className="text-sm text-gray-400 block mb-1">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={convertToPpm(key as keyof IonConcentrations, ions[key as keyof IonConcentrations])}
                    onChange={(e) => {
                      const ppm = Number(e.target.value);
                      const meqL = convertToMeqL(key as keyof IonConcentrations, ppm);
                      setIons({ ...ions, [key]: meqL });
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    placeholder="ppm"
                  />
                  <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 text-sm w-24">
                    {ions[key as keyof IonConcentrations].toFixed(3)} meq/L
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-red-400">-</span> Anions
            <span className="text-sm font-normal text-gray-400">
              (Total: {results.anionSum.toFixed(2)} meq/L)
            </span>
          </h3>
          <div className="space-y-3">
            {Object.entries({
              nitrate: 'Nitrate (NO₃⁻)',
              phosphate: 'Phosphate (PO₄³⁻)',
              sulfate: 'Sulfate (SO₄²⁻)',
              chloride: 'Chloride (Cl⁻)',
              bicarbonate: 'Bicarbonate (HCO₃⁻)'
            }).map(([key, label]) => (
              <div key={key}>
                <label className="text-sm text-gray-400 block mb-1">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={convertToPpm(key as keyof IonConcentrations, ions[key as keyof IonConcentrations])}
                    onChange={(e) => {
                      const ppm = Number(e.target.value);
                      const meqL = convertToMeqL(key as keyof IonConcentrations, ppm);
                      setIons({ ...ions, [key]: meqL });
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    placeholder="ppm"
                  />
                  <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 text-sm w-24">
                    {ions[key as keyof IonConcentrations].toFixed(3)} meq/L
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ion Distribution Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Cation Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, ppm }) => `${name}: ${ppm.toFixed(1)} ppm`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(3)} meq/L`}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Anion Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={anionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, ppm }) => `${name}: ${ppm.toFixed(1)} ppm`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {anionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(3)} meq/L`}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Water Quality Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Chemical Balance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Cation Sum:</span>
                <span className="text-white">{results.cationSum.toFixed(2)} meq/L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Anion Sum:</span>
                <span className="text-white">{results.anionSum.toFixed(2)} meq/L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ion Balance Error:</span>
                <span className={getQualityIndicator('ionBalance', results.ionBalance).color}>
                  {results.ionBalance.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Sodium Hazard</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">SAR:</span>
                <span className={getQualityIndicator('sar', results.sar).color}>
                  {results.sar.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adjusted SAR:</span>
                <span className="text-white">{results.adjustedSAR.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">RSC:</span>
                <span className="text-white">{results.rsc.toFixed(2)} meq/L</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Water Properties</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Hardness:</span>
                <span className="text-white">{results.hardness.toFixed(0)} ppm CaCO₃</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Alkalinity:</span>
                <span className="text-white">{results.alkalinity.toFixed(0)} ppm CaCO₃</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">TDS (est.):</span>
                <span className="text-white">{results.tds.toFixed(0)} ppm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Water Quality Assessment
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            {Math.abs(results.ionBalance) > 10 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <span>Ion balance error exceeds 10%. Check your water analysis data for accuracy.</span>
              </div>
            )}
            {results.sar > 6 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                <span>High SAR value indicates potential sodium hazard. Consider water treatment or blending.</span>
              </div>
            )}
            {results.hardness > 180 && (
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>Very hard water detected. May cause scaling issues in irrigation systems.</span>
              </div>
            )}
            {results.ionBalance >= -5 && results.ionBalance <= 5 && results.sar < 3 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Water quality is excellent for irrigation use.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Water Quality Indices */}
      {showAdvanced && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Water Quality Indices</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Scale Formation Potential</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Langelier Index:</span>
                  <div>
                    <span className={`font-medium ${
                      results.langelier < -0.5 ? 'text-blue-400' : 
                      results.langelier > 0.5 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {results.langelier.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {interpretLSI(results.langelier).status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ryznar Index:</span>
                  <span className="text-white">{results.stability.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Aggressive Index:</span>
                  <span className="text-white">{results.aggressiveness.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Irrigation Suitability</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Water Quality Index:</span>
                  <div>
                    <span className={`font-medium ${
                      calculateIWQI({
                        ec: results.ec,
                        na: ions.sodium,
                        cl: ions.chloride,
                        hco3: ions.bicarbonate,
                        sar: results.sar
                      }) > 70 ? 'text-green-400' :
                      calculateIWQI({
                        ec: results.ec,
                        na: ions.sodium,
                        cl: ions.chloride,
                        hco3: ions.bicarbonate,
                        sar: results.sar
                      }) > 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {calculateIWQI({
                        ec: results.ec,
                        na: ions.sodium,
                        cl: ions.chloride,
                        hco3: ions.bicarbonate,
                        sar: results.sar
                      }).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Leaching Req.:</span>
                  <span className="text-white">
                    {(calculateLeachingFraction(results.ec, cropType === 'cannabis' ? 1.5 : 2.0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Predicted Soil EC:</span>
                  <span className="text-white">
                    {predictSoilEC(results.ec, 0.15).toFixed(1)} mS/cm
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Treatment Recommendations</h4>
              <div className="space-y-1 text-sm">
                {generateWaterTreatmentRecommendations(ions, results).slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span className="text-gray-300 text-xs">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Water Quality Radar Chart */}
      {showAdvanced && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Water Quality Profile</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: 'pH', value: (results.ph - 5) / 3.5 * 100, fullMark: 100 },
                { subject: 'EC', value: Math.max(0, 100 - results.ec * 20), fullMark: 100 },
                { subject: 'SAR', value: Math.max(0, 100 - results.sar * 10), fullMark: 100 },
                { subject: 'Hardness', value: Math.min(100, results.hardness / 2), fullMark: 100 },
                { subject: 'Alkalinity', value: Math.min(100, results.alkalinity / 2), fullMark: 100 },
                { subject: 'Balance', value: Math.max(0, 100 - Math.abs(results.ionBalance) * 10), fullMark: 100 }
              ]}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Radar name="Water Quality" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Analysis
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          <FileDown className="w-4 h-4" />
          Export Analysis Report
        </button>
      </div>
    </div>
  );
}
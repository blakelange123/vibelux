'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cannabis, TrendingUp, Activity, Brain, Lightbulb,
  Download, Settings, Info, AlertTriangle, CheckCircle,
  Zap, Leaf, TreePine, Eye, Droplets, Target, Sun,
  BarChart3, Beaker, FlaskConical, Sparkles
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, AreaChart, Area, ComposedChart
} from 'recharts';

interface CannabisCompoundAnalysisProps {
  strainId?: string;
  experimentId?: string;
}

// Custom Cannabis icon component
const CannabisIcon = ({ className }: { className?: string }) => (
  <Leaf className={className} />
);

export function CannabisCompoundAnalysis({ strainId, experimentId }: CannabisCompoundAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'cannabinoids' | 'terpenes' | 'spectrum' | 'experiments'>('cannabinoids');
  const [selectedStrain, setSelectedStrain] = useState<string>('Blue Dream');
  const [timeRange, setTimeRange] = useState<'week' | 'flower' | 'full'>('flower');
  const [uvProtocol, setUvProtocol] = useState<'none' | 'continuous' | 'end-of-day' | 'pulsed'>('end-of-day');

  // Mock data for cannabinoid correlations with spectrum
  const cannabinoidCorrelations = [
    { spectrum: 'UVB 280-315nm', thc: 0.89, cbd: -0.12, cbg: 0.45, confidence: 0.95 },
    { spectrum: 'UVA 380-390nm', thc: 0.76, cbd: -0.08, cbg: 0.38, confidence: 0.88 },
    { spectrum: 'Violet 400-420nm', thc: 0.62, cbd: 0.15, cbg: 0.55, confidence: 0.82 },
    { spectrum: 'Blue 440-480nm', thc: 0.45, cbd: 0.32, cbg: 0.28, confidence: 0.75 },
    { spectrum: 'Green 520-560nm', thc: -0.18, cbd: 0.42, cbg: 0.12, confidence: 0.65 },
    { spectrum: 'Red 620-660nm', thc: 0.38, cbd: 0.55, cbg: 0.35, confidence: 0.78 },
    { spectrum: 'Far Red 700-730nm', thc: -0.22, cbd: 0.28, cbg: -0.15, confidence: 0.70 }
  ];

  // Mock data for terpene profiles
  const terpeneData = [
    { name: 'Myrcene', current: 1.2, optimal: 1.5, effects: 'Sedating, muscle relaxant', aroma: 'Earthy, musky' },
    { name: 'Limonene', current: 0.8, optimal: 1.0, effects: 'Mood elevation, stress relief', aroma: 'Citrus' },
    { name: 'Caryophyllene', current: 0.6, optimal: 0.7, effects: 'Anti-inflammatory', aroma: 'Spicy, peppery' },
    { name: 'Pinene', current: 0.4, optimal: 0.5, effects: 'Alertness, memory', aroma: 'Pine' },
    { name: 'Linalool', current: 0.3, optimal: 0.4, effects: 'Calming, anti-anxiety', aroma: 'Floral, lavender' },
    { name: 'Humulene', current: 0.2, optimal: 0.3, effects: 'Appetite suppressant', aroma: 'Woody, earthy' },
    { name: 'Terpinolene', current: 0.15, optimal: 0.2, effects: 'Uplifting, creative', aroma: 'Fruity, herbal' },
    { name: 'Ocimene', current: 0.1, optimal: 0.15, effects: 'Decongestant', aroma: 'Sweet, herbaceous' }
  ];

  // Time series data for THC development
  const thcDevelopment = [
    { week: 1, thc: 2.5, cbd: 0.8, terpenes: 0.5, uvDose: 0 },
    { week: 2, thc: 4.2, cbd: 1.0, terpenes: 0.8, uvDose: 0 },
    { week: 3, thc: 6.8, cbd: 1.2, terpenes: 1.2, uvDose: 5 },
    { week: 4, thc: 9.5, cbd: 1.3, terpenes: 1.6, uvDose: 10 },
    { week: 5, thc: 12.3, cbd: 1.4, terpenes: 2.0, uvDose: 15 },
    { week: 6, thc: 15.8, cbd: 1.5, terpenes: 2.4, uvDose: 20 },
    { week: 7, thc: 18.5, cbd: 1.6, terpenes: 2.8, uvDose: 25 },
    { week: 8, thc: 21.2, cbd: 1.7, terpenes: 3.2, uvDose: 30 }
  ];

  // UV protocol comparison
  const uvProtocolComparison = [
    { protocol: 'No UV', avgTHC: 16.5, avgTerpenes: 2.1, yieldLoss: 0 },
    { protocol: 'Continuous Low', avgTHC: 18.2, avgTerpenes: 2.4, yieldLoss: 5 },
    { protocol: 'End-of-Day', avgTHC: 21.5, avgTerpenes: 3.2, yieldLoss: 3 },
    { protocol: 'Pulsed High', avgTHC: 22.8, avgTerpenes: 3.5, yieldLoss: 8 },
    { protocol: '380-390nm Only', avgTHC: 20.3, avgTerpenes: 2.9, yieldLoss: 2 }
  ];

  // Spectrum optimization for different goals
  const spectrumOptimization = {
    maxTHC: {
      uvb280_315: 15,
      uva380_390: 25,
      violet400_420: 40,
      blue440_480: 80,
      green520_560: 15,
      red620_660: 150,
      farRed700_730: 20
    },
    maxTerpenes: {
      uvb280_315: 8,
      uva380_390: 18,
      violet400_420: 50,
      blue440_480: 100,
      green520_560: 25,
      red620_660: 120,
      farRed700_730: 35
    },
    balanced: {
      uvb280_315: 10,
      uva380_390: 20,
      violet400_420: 45,
      blue440_480: 90,
      green520_560: 20,
      red620_660: 135,
      farRed700_730: 25
    }
  };

  const renderCannabinoidsTab = () => (
    <div className="space-y-6">
      {/* Current Cannabinoid Levels */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Cannabinoid Profile</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">THC</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">21.5%</p>
            <p className="text-xs text-green-400">+2.3% from last week</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">CBD</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">1.8%</p>
            <p className="text-xs text-gray-500">Stable</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">CBG</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">0.9%</p>
            <p className="text-xs text-purple-400">+0.1% from last week</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total</span>
              <BarChart3 className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">24.2%</p>
            <p className="text-xs text-yellow-400">Premium grade</p>
          </div>
        </div>

        {/* THC Development Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={thcDevelopment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" label={{ value: 'Week of Flowering', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'Cannabinoid %', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" label={{ value: 'UV Dose (μmol/m²)', angle: 90, position: 'insideRight' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              
              <Bar yAxisId="right" dataKey="uvDose" fill="#8b5cf6" opacity={0.3} name="UV Dose" />
              <Line yAxisId="left" type="monotone" dataKey="thc" stroke="#10b981" strokeWidth={3} name="THC %" />
              <Line yAxisId="left" type="monotone" dataKey="cbd" stroke="#3b82f6" strokeWidth={2} name="CBD %" />
              <Line yAxisId="left" type="monotone" dataKey="terpenes" stroke="#f59e0b" strokeWidth={2} name="Terpenes %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spectrum Correlations */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum-Cannabinoid Correlations</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-4">Spectrum Band</th>
                <th className="text-right py-2 px-4">THC Correlation</th>
                <th className="text-right py-2 px-4">CBD Correlation</th>
                <th className="text-right py-2 px-4">CBG Correlation</th>
                <th className="text-right py-2 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {cannabinoidCorrelations.map((row, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-2 px-4 text-white flex items-center gap-2">
                    {row.spectrum.includes('UV') && <Sun className="w-4 h-4 text-purple-400" />}
                    {row.spectrum}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span className={row.thc > 0 ? 'text-green-400' : 'text-red-400'}>
                      {row.thc > 0 ? '+' : ''}{(row.thc * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span className={row.cbd > 0 ? 'text-green-400' : 'text-red-400'}>
                      {row.cbd > 0 ? '+' : ''}{(row.cbd * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span className={row.cbg > 0 ? 'text-green-400' : 'text-red-400'}>
                      {row.cbg > 0 ? '+' : ''}{(row.cbg * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${row.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs">{(row.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <Info className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">UVB Impact</h4>
            <p className="text-xs text-gray-400">
              UVB (280-315nm) shows strongest correlation with THC production (+89%), 
              triggering defensive compound synthesis
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">380-390nm Discovery</h4>
            <p className="text-xs text-gray-400">
              UVA at 380-390nm provides 76% of UVB\'s THC boost with less plant stress 
              and minimal yield loss
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Violet Synergy</h4>
            <p className="text-xs text-gray-400">
              Deep violet (400-420nm) enhances both THC and CBG production, 
              offering balanced cannabinoid profiles
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTerpenesTab = () => (
    <div className="space-y-6">
      {/* Terpene Profile Radar */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Terpene Profile Analysis</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={terpeneData.map(t => ({
                terpene: t.name,
                current: (t.current / 2) * 100,
                optimal: (t.optimal / 2) * 100
              }))}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="terpene" stroke="#9ca3af" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                <Radar name="Current Profile" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Optimal Profile" dataKey="optimal" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Terpene Details */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {terpeneData.map((terpene, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{terpene.name}</h4>
                  <span className="text-sm text-gray-400">{terpene.current}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${(terpene.current / terpene.optimal) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Effects: </span>
                    <span className="text-gray-300">{terpene.effects}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Aroma: </span>
                    <span className="text-gray-300">{terpene.aroma}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spectrum Effects on Terpenes */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum Optimization for Terpenes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blue spectrum effects */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              Blue Spectrum (440-480nm) Effects
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Myrcene</span>
                <span className="text-green-400">+15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pinene</span>
                <span className="text-green-400">+22%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Limonene</span>
                <span className="text-green-400">+18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Caryophyllene</span>
                <span className="text-yellow-400">+5%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Higher blue light promotes monoterpene synthesis
            </p>
          </div>

          {/* UV spectrum effects */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              UV Spectrum (280-400nm) Effects
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Caryophyllene</span>
                <span className="text-green-400">+28%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Humulene</span>
                <span className="text-green-400">+32%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Linalool</span>
                <span className="text-green-400">+25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Myrcene</span>
                <span className="text-red-400">-8%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              UV stress enhances sesquiterpene production
            </p>
          </div>
        </div>

        {/* Optimal Timing */}
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Terpene Enhancement Protocol</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Week 5-6 Flowering</p>
              <p className="text-gray-300">Increase blue spectrum by 20% for monoterpene boost</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Week 7-8 Flowering</p>
              <p className="text-gray-300">Add UV-A (380-390nm) 2 hours end-of-day</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Final Week</p>
              <p className="text-gray-300">48-hour darkness + cool temps for terpene preservation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpectrumTab = () => (
    <div className="space-y-6">
      {/* UV Protocol Comparison */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">UV Protocol Effectiveness</h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={uvProtocolComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="protocol" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              
              <Bar dataKey="avgTHC" fill="#10b981" name="Avg THC %" />
              <Bar dataKey="avgTerpenes" fill="#f59e0b" name="Avg Terpenes %" />
              <Bar dataKey="yieldLoss" fill="#ef4444" name="Yield Loss %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <Sparkles className="w-5 h-5 text-yellow-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Best Overall: End-of-Day</h4>
            <p className="text-xs text-gray-400">
              2-3 hours of UV at lights-off maximizes compounds with minimal stress. 
              21.5% THC with only 3% yield loss.
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <Zap className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Maximum Potency: Pulsed</h4>
            <p className="text-xs text-gray-400">
              15-minute pulses every 2 hours achieves 22.8% THC but with 8% yield reduction. 
              Best for premium small batches.
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <Target className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="text-sm font-medium text-white mb-1">Sweet Spot: 380-390nm</h4>
            <p className="text-xs text-gray-400">
              Using only 380-390nm achieves 20.3% THC with just 2% yield loss. 
              Most efficient cannabinoid boost.
            </p>
          </div>
        </div>
      </div>

      {/* Spectrum Recipes */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Optimized Spectrum Recipes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Max THC Recipe */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-green-400" />
              Maximum THC Recipe
            </h4>
            <div className="space-y-2 text-sm">
              {Object.entries(spectrumOptimization.maxTHC).map(([band, value]) => (
                <div key={band} className="flex justify-between">
                  <span className="text-gray-400">{band.replace(/_/g, '-')}</span>
                  <span className="text-gray-300">{value} μmol/m²/s</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-green-400">Expected: 23-25% THC</p>
              <p className="text-xs text-gray-400">Power: 320W/m²</p>
            </div>
          </div>

          {/* Max Terpenes Recipe */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-purple-400" />
              Maximum Terpenes Recipe
            </h4>
            <div className="space-y-2 text-sm">
              {Object.entries(spectrumOptimization.maxTerpenes).map(([band, value]) => (
                <div key={band} className="flex justify-between">
                  <span className="text-gray-400">{band.replace(/_/g, '-')}</span>
                  <span className="text-gray-300">{value} μmol/m²/s</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-purple-400">Expected: 3.5-4% Terpenes</p>
              <p className="text-xs text-gray-400">Power: 305W/m²</p>
            </div>
          </div>

          {/* Balanced Recipe */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Balanced Quality Recipe
            </h4>
            <div className="space-y-2 text-sm">
              {Object.entries(spectrumOptimization.balanced).map(([band, value]) => (
                <div key={band} className="flex justify-between">
                  <span className="text-gray-400">{band.replace(/_/g, '-')}</span>
                  <span className="text-gray-300">{value} μmol/m²/s</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-blue-400">20-22% THC, 3% Terpenes</p>
              <p className="text-xs text-gray-400">Power: 310W/m²</p>
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">Implementation Schedule</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs text-white">1</div>
              <div className="flex-1">
                <p className="text-gray-300">Vegetative: Standard full spectrum, no UV</p>
                <p className="text-xs text-gray-500">Focus on growth and structure</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-xs text-white">2</div>
              <div className="flex-1">
                <p className="text-gray-300">Flower Week 1-4: Introduce violet (400-420nm)</p>
                <p className="text-xs text-gray-500">Begin trichome development</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white">3</div>
              <div className="flex-1">
                <p className="text-gray-300">Flower Week 5-8: Add UV-A (380-390nm) end-of-day</p>
                <p className="text-xs text-gray-500">Maximize cannabinoid production</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExperimentsTab = () => (
    <div className="space-y-6">
      {/* Active Experiments */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active UV Experiments</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Experiment #127</h4>
              <span className="px-2 py-1 bg-green-600 text-xs text-white rounded">Active</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Strain:</span>
                <span className="text-gray-300">Blue Dream</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">UV Protocol:</span>
                <span className="text-gray-300">380-390nm Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-gray-300">3 hours end-of-day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Week:</span>
                <span className="text-gray-300">6 of 8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current THC:</span>
                <span className="text-green-400">19.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Experiment #128</h4>
              <span className="px-2 py-1 bg-green-600 text-xs text-white rounded">Active</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Strain:</span>
                <span className="text-gray-300">Gorilla Glue #4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">UV Protocol:</span>
                <span className="text-gray-300">Pulsed UVB + 380nm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-gray-300">15 min every 2h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Week:</span>
                <span className="text-gray-300">7 of 9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current THC:</span>
                <span className="text-green-400">24.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Results */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Strain-Specific Results</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-4">Strain</th>
                <th className="text-right py-2 px-4">Best UV Protocol</th>
                <th className="text-right py-2 px-4">Peak THC</th>
                <th className="text-right py-2 px-4">Peak Terpenes</th>
                <th className="text-right py-2 px-4">Optimal Week</th>
                <th className="text-right py-2 px-4">Trials</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-2 px-4 text-white">Blue Dream</td>
                <td className="py-2 px-4 text-right text-gray-300">380-390nm EOD</td>
                <td className="py-2 px-4 text-right text-green-400">22.3%</td>
                <td className="py-2 px-4 text-right text-purple-400">3.1%</td>
                <td className="py-2 px-4 text-right text-gray-300">Week 5-8</td>
                <td className="py-2 px-4 text-right text-gray-300">12</td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-2 px-4 text-white">Gorilla Glue #4</td>
                <td className="py-2 px-4 text-right text-gray-300">Pulsed UVB</td>
                <td className="py-2 px-4 text-right text-green-400">26.8%</td>
                <td className="py-2 px-4 text-right text-purple-400">2.8%</td>
                <td className="py-2 px-4 text-right text-gray-300">Week 6-9</td>
                <td className="py-2 px-4 text-right text-gray-300">8</td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-2 px-4 text-white">Wedding Cake</td>
                <td className="py-2 px-4 text-right text-gray-300">UVB + Violet</td>
                <td className="py-2 px-4 text-right text-green-400">24.5%</td>
                <td className="py-2 px-4 text-right text-purple-400">3.8%</td>
                <td className="py-2 px-4 text-right text-gray-300">Week 5-7</td>
                <td className="py-2 px-4 text-right text-gray-300">15</td>
              </tr>
              <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-2 px-4 text-white">Zkittlez</td>
                <td className="py-2 px-4 text-right text-gray-300">380-390nm Continuous</td>
                <td className="py-2 px-4 text-right text-green-400">19.7%</td>
                <td className="py-2 px-4 text-right text-purple-400">4.2%</td>
                <td className="py-2 px-4 text-right text-gray-300">Week 4-7</td>
                <td className="py-2 px-4 text-right text-gray-300">10</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Strain Recommendations */}
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3">AI-Generated Recommendations</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">
                  Indica-dominant strains respond better to end-of-day UV protocols, 
                  showing 15-20% higher cannabinoid increases than continuous exposure.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">
                  Strains with naturally high myrcene benefit most from 380-390nm supplementation, 
                  while caryophyllene-dominant strains prefer full UVB.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">
                  Optimal UV exposure window is 14-21 days before harvest. 
                  Earlier application increases yield loss without proportional cannabinoid gains.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <CannabisIcon className="w-8 h-8 text-green-400" />
            Cannabis Compound Analysis & Optimization
          </h2>
          <p className="text-gray-400 mt-1">
            Maximize THC, CBD, and terpene production through spectrum optimization
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Strain Selector */}
          <select
            value={selectedStrain}
            onChange={(e) => setSelectedStrain(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="Blue Dream">Blue Dream</option>
            <option value="Gorilla Glue #4">Gorilla Glue #4</option>
            <option value="Wedding Cake">Wedding Cake</option>
            <option value="Zkittlez">Zkittlez</option>
            <option value="Girl Scout Cookies">Girl Scout Cookies</option>
          </select>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="week">This Week</option>
            <option value="flower">Flowering Period</option>
            <option value="full">Full Cycle</option>
          </select>

          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-gray-400" />
          </button>

          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-green-600/20">
          <p className="text-xs text-gray-400 mb-1">Current Stage</p>
          <p className="text-lg font-bold text-white">Week 6 Flower</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-600/20">
          <p className="text-xs text-gray-400 mb-1">UV Protocol</p>
          <p className="text-lg font-bold text-white">380-390nm EOD</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-yellow-600/20">
          <p className="text-xs text-gray-400 mb-1">THC Projection</p>
          <p className="text-lg font-bold text-white">22.5-23.5%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-blue-600/20">
          <p className="text-xs text-gray-400 mb-1">Terpene Level</p>
          <p className="text-lg font-bold text-white">3.2%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-red-600/20">
          <p className="text-xs text-gray-400 mb-1">Days to Harvest</p>
          <p className="text-lg font-bold text-white">14-18</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {(['cannabinoids', 'terpenes', 'spectrum', 'experiments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'cannabinoids' && renderCannabinoidsTab()}
        {activeTab === 'terpenes' && renderTerpenesTab()}
        {activeTab === 'spectrum' && renderSpectrumTab()}
        {activeTab === 'experiments' && renderExperimentsTab()}
      </div>
    </div>
  );
}
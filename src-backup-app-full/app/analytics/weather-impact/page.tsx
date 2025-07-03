'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Cloud, Sun, Snowflake, Droplets, Wind,
  TrendingUp, TrendingDown, AlertCircle, Info, Calendar,
  BarChart3, LineChart, Activity, ThermometerSun, Download
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ComposedChart
} from 'recharts';

interface WeatherData {
  date: string;
  tavg: number;
  hdd: number;
  cdd: number;
  humidity: number;
  solarRadiation: number;
  consumption: number;
  normalizedConsumption: number;
  weatherImpact: number;
  savings: number;
}

export default function WeatherImpactPage() {
  const [timeRange, setTimeRange] = useState('12m');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'solar'>('temperature');

  useEffect(() => {
    loadWeatherData();
  }, [timeRange]);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      // Simulate loading weather impact data
      const data = generateWeatherImpactData(timeRange);
      setWeatherData(data);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeatherImpactData = (range: string): WeatherData[] => {
    const months = range === '12m' ? 12 : range === '24m' ? 24 : 36;
    const data: WeatherData[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.getMonth();
      const isWinter = month >= 10 || month <= 2;
      const isSummer = month >= 5 && month <= 8;

      const baseTemp = isWinter ? 45 : isSummer ? 75 : 60;
      const tavg = baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 - 5);
      const hdd = Math.max(0, 65 - tavg);
      const cdd = Math.max(0, tavg - 65);
      
      const baseConsumption = 100000;
      const weatherImpact = (hdd * 150) + (cdd * 200) + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 - 2500);
      const actualConsumption = baseConsumption + weatherImpact + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000 - 5000);
      const normalizedConsumption = actualConsumption - weatherImpact;
      const savings = baseConsumption - normalizedConsumption;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        tavg: Math.round(tavg),
        hdd: Math.round(hdd),
        cdd: Math.round(cdd),
        humidity: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        solarRadiation: isSummer ? 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 : 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
        consumption: Math.round(actualConsumption),
        normalizedConsumption: Math.round(normalizedConsumption),
        weatherImpact: Math.round(weatherImpact),
        savings: Math.round(savings)
      });
    }

    return data;
  };

  const calculateTotalImpact = () => {
    const totalWeatherImpact = weatherData.reduce((sum, d) => sum + Math.abs(d.weatherImpact), 0);
    const totalConsumption = weatherData.reduce((sum, d) => sum + d.consumption, 0);
    const percentImpact = totalConsumption > 0 ? (totalWeatherImpact / totalConsumption) * 100 : 0;
    
    return {
      totalImpact: totalWeatherImpact,
      percentImpact: percentImpact.toFixed(1),
      avgMonthlyImpact: Math.round(totalWeatherImpact / weatherData.length)
    };
  };

  const { totalImpact, percentImpact, avgMonthlyImpact } = calculateTotalImpact();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analytics
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Weather Impact Analysis</h1>
              <p className="text-gray-400">
                Understand how weather affects your energy consumption and savings calculations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="12m">Last 12 Months</option>
                <option value="24m">Last 24 Months</option>
                <option value="36m">Last 36 Months</option>
              </select>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Cloud className="w-8 h-8 text-blue-400" />
              <span className={`text-sm ${totalImpact > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {totalImpact > 0 ? '+' : ''}{percentImpact}%
              </span>
            </div>
            <p className="text-gray-400 text-sm">Weather Impact</p>
            <p className="text-2xl font-bold text-white">
              {(totalImpact / 1000).toFixed(0)}K kWh
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <ThermometerSun className="w-8 h-8 text-orange-400" />
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">Avg Monthly Impact</p>
            <p className="text-2xl font-bold text-white">
              {(avgMonthlyImpact / 1000).toFixed(1)}K kWh
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Snowflake className="w-8 h-8 text-cyan-400" />
              <span className="text-sm text-gray-400">HDD</span>
            </div>
            <p className="text-gray-400 text-sm">Total Heating Days</p>
            <p className="text-2xl font-bold text-white">
              {weatherData.reduce((sum, d) => sum + d.hdd, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Sun className="w-8 h-8 text-yellow-400" />
              <span className="text-sm text-gray-400">CDD</span>
            </div>
            <p className="text-gray-400 text-sm">Total Cooling Days</p>
            <p className="text-2xl font-bold text-white">
              {weatherData.reduce((sum, d) => sum + d.cdd, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Weather Normalization Chart */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Energy Consumption: Actual vs Weather-Normalized</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Normalized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-400">Weather Impact</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="weatherImpact" fill="#F97316" name="Weather Impact" />
                <Line yAxisId="left" type="monotone" dataKey="consumption" stroke="#3B82F6" name="Actual Consumption" strokeWidth={2} />
                <Line yAxisId="left" type="monotone" dataKey="normalizedConsumption" stroke="#10B981" name="Normalized Consumption" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Metrics Tabs */}
        <div className="bg-gray-900/50 rounded-xl border border-white/10">
          <div className="flex border-b border-gray-800">
            {[
              { id: 'temperature', label: 'Temperature Impact', icon: ThermometerSun },
              { id: 'humidity', label: 'Humidity Impact', icon: Droplets },
              { id: 'solar', label: 'Solar Radiation', icon: Sun }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id as any)}
                className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                  selectedMetric === tab.id
                    ? 'bg-gray-800 text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {selectedMetric === 'temperature' && (
              <div>
                <h4 className="text-white font-medium mb-4">Temperature & Degree Days Analysis</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={weatherData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis yAxisId="left" stroke="#9CA3AF" />
                      <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="right" dataKey="hdd" fill="#60A5FA" name="HDD" />
                      <Bar yAxisId="right" dataKey="cdd" fill="#F87171" name="CDD" />
                      <Line yAxisId="left" type="monotone" dataKey="tavg" stroke="#FBBF24" name="Avg Temp (°F)" strokeWidth={2} />
                      <ReferenceLine yAxisId="left" y={65} stroke="#9CA3AF" strokeDasharray="3 3" label="Base Temp" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {selectedMetric === 'humidity' && (
              <div>
                <h4 className="text-white font-medium mb-4">Humidity Impact on Energy Consumption</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weatherData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="humidity" stroke="#60A5FA" name="Humidity (%)" strokeWidth={2} />
                      <Line type="monotone" dataKey="weatherImpact" stroke="#F97316" name="Weather Impact (kWh)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">
                    Higher humidity levels require more dehumidification, especially in indoor growing environments. 
                    This increases HVAC load and energy consumption.
                  </p>
                </div>
              </div>
            )}

            {selectedMetric === 'solar' && (
              <div>
                <h4 className="text-white font-medium mb-4">Solar Radiation & Supplemental Lighting</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weatherData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="solarRadiation" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.3} name="Solar Radiation (W/m²)" />
                      <ReferenceLine y={400} stroke="#9CA3AF" strokeDasharray="3 3" label="DLI Target" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">
                    Lower solar radiation requires more supplemental lighting to maintain optimal DLI (Daily Light Integral) for plant growth. 
                    This is particularly important for greenhouse operations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Understanding Weather Normalization</h3>
              <p className="text-gray-300 mb-4">
                Weather normalization adjusts your energy consumption data to account for weather variations, 
                allowing fair comparisons between different time periods. This ensures that your energy savings 
                are due to operational improvements, not just favorable weather.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Key Concepts:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• <strong>HDD (Heating Degree Days):</strong> Days when heating is needed</li>
                    <li>• <strong>CDD (Cooling Degree Days):</strong> Days when cooling is needed</li>
                    <li>• <strong>Base Temperature:</strong> 65°F standard for degree day calculations</li>
                    <li>• <strong>Weather Impact:</strong> kWh difference due to weather</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Benefits:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Fair month-to-month comparisons</li>
                    <li>• Accurate ROI calculations</li>
                    <li>• IPMVP compliance for verification</li>
                    <li>• Removes weather from disputes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
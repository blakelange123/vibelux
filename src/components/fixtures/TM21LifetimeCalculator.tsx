'use client';

import React, { useState } from 'react';
import {
  Calculator,
  FileText,
  Thermometer,
  Clock,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  Zap,
  BarChart
} from 'lucide-react';
import { tm21Calculator, LM80TestData, TM21Result } from '@/lib/tm21-calculations';

interface LM80Input {
  temperature: number;
  testDuration: number;
  sampleSize: number;
  driveCurrent: number;
  dataPoints: string; // CSV format
}

export function TM21LifetimeCalculator() {
  const [lm80Input, setLm80Input] = useState<LM80Input>({
    temperature: 85,
    testDuration: 10000,
    sampleSize: 20,
    driveCurrent: 700,
    dataPoints: `0,100
1000,99.5
2000,99.1
3000,98.7
4000,98.3
5000,97.9
6000,97.5
7000,97.1
8000,96.7
9000,96.3
10000,95.9`
  });

  const [tm21Result, setTm21Result] = useState<TM21Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateTM21 = () => {
    try {
      setError(null);
      
      // Parse CSV data points
      const dataPoints = lm80Input.dataPoints.split('\n').map(line => {
        const [hours, lumenMaintenance] = line.split(',').map(v => parseFloat(v.trim()));
        return {
          hours,
          lumenMaintenance,
          temperature: lm80Input.temperature
        };
      });

      const lm80Data: LM80TestData = {
        testDuration: lm80Input.testDuration,
        sampleSize: lm80Input.sampleSize,
        temperature: lm80Input.temperature,
        driveCurrent: lm80Input.driveCurrent,
        dataPoints
      };

      const result = tm21Calculator.calculateTM21(lm80Data);
      setTm21Result(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    }
  };

  const downloadReport = () => {
    if (!tm21Result) return;

    const lm80Data: LM80TestData = {
      testDuration: lm80Input.testDuration,
      sampleSize: lm80Input.sampleSize,
      temperature: lm80Input.temperature,
      driveCurrent: lm80Input.driveCurrent,
      dataPoints: []
    };

    const report = tm21Calculator.generateReport(lm80Data, tm21Result);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tm21-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExampleData = () => {
    setLm80Input({
      temperature: 85,
      testDuration: 10000,
      sampleSize: 20,
      driveCurrent: 700,
      dataPoints: `0,100
1000,99.5
2000,99.1
3000,98.7
4000,98.3
5000,97.9
6000,97.5
7000,97.1
8000,96.7
9000,96.3
10000,95.9`
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">TM-21 Lifetime Calculator</h2>
            <p className="text-sm text-gray-600">LED lifetime projection based on LM-80 data</p>
          </div>
        </div>
        <button
          onClick={loadExampleData}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Load Example
        </button>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">LM-80 Test Conditions</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Temperature (°C)
            </label>
            <div className="relative">
              <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={lm80Input.temperature}
                onChange={(e) => setLm80Input({...lm80Input, temperature: Number(e.target.value)})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Duration (hours)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={lm80Input.testDuration}
                onChange={(e) => setLm80Input({...lm80Input, testDuration: Number(e.target.value)})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="6000"
              />
            </div>
            {lm80Input.testDuration < 6000 && (
              <p className="text-xs text-red-600 mt-1">Minimum 6,000 hours required</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Size
              </label>
              <input
                type="number"
                value={lm80Input.sampleSize}
                onChange={(e) => setLm80Input({...lm80Input, sampleSize: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="10"
              />
              {lm80Input.sampleSize < 10 && (
                <p className="text-xs text-red-600 mt-1">Min 10 units</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drive Current (mA)
              </label>
              <input
                type="number"
                value={lm80Input.driveCurrent}
                onChange={(e) => setLm80Input({...lm80Input, driveCurrent: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Lumen Maintenance Data</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Points (hours, % maintenance)
            </label>
            <textarea
              value={lm80Input.dataPoints}
              onChange={(e) => setLm80Input({...lm80Input, dataPoints: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
              rows={10}
              placeholder="0,100&#10;1000,99.5&#10;2000,99.1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter as CSV: hours,percentage (one per line)
            </p>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={calculateTM21}
          disabled={lm80Input.testDuration < 6000 || lm80Input.sampleSize < 10}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calculator className="w-5 h-5" />
          Calculate TM-21 Projection
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Calculation Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {tm21Result && (
        <div className="space-y-6">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">TM-21 Projection Results</h3>
            
            {/* Main Results */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">L90 Lifetime</span>
                  <TrendingDown className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {tm21Result.reportedL90.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">hours (90% output)</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">L80 Lifetime</span>
                  <TrendingDown className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {tm21Result.reportedL80.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">hours (80% output)</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-700 font-medium">L70 Lifetime</span>
                  <TrendingDown className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {tm21Result.reportedL70.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">hours (70% output)</p>
              </div>
            </div>

            {/* Notation */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Standard Notation</h4>
              <div className="space-y-1 font-mono text-sm">
                <p className="text-gray-700">{tm21Result.notation.L90}</p>
                <p className="text-gray-700">{tm21Result.notation.L80}</p>
                <p className="text-gray-700 font-bold">{tm21Result.notation.L70}</p>
              </div>
            </div>

            {/* Advanced Details */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium mb-4"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Details
            </button>

            {showAdvanced && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600">Decay Rate (α)</p>
                    <p className="font-mono font-medium">{tm21Result.alphaValue.toExponential(4)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600">Initial Flux (β)</p>
                    <p className="font-mono font-medium">{tm21Result.betaValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600">Projection Limit</p>
                    <p className="font-mono font-medium">{tm21Result.projectionLimitHours.toLocaleString()} hrs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600">Calculated L70</p>
                    <p className="font-mono font-medium">
                      {tm21Result.L70 ? `${tm21Result.L70.toLocaleString()} hrs` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Projection Limit Warning */}
                {tm21Result.L70 && tm21Result.L70 > tm21Result.projectionLimitHours && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-yellow-900 font-medium">Projection Limited</p>
                      <p className="text-yellow-700 mt-1">
                        Calculated L70 ({tm21Result.L70.toLocaleString()} hours) exceeds the 6x projection limit. 
                        Reported value is limited to {tm21Result.projectionLimitHours.toLocaleString()} hours per TM-21 standard.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Download Report */}
            <div className="flex justify-end mt-6">
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">About TM-21 Calculations</p>
            <p className="text-gray-700 mt-1">
              TM-21 is the IESNA approved method for projecting long-term lumen maintenance of LED 
              light sources using LM-80 data. Projections are limited to 6x the test duration for 
              20+ sample sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
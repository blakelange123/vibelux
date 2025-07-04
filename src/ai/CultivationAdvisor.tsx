'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Droplets,
  Thermometer,
  Sun,
  Wind,
  Leaf,
  Target,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  co2: number;
  ppfd: number;
  vpd: number;
  airflow: number;
}

interface CultivationAdvisorProps {
  currentData: EnvironmentalData;
  strain: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  historicalYield?: number[];
}

export function CultivationAdvisor({
  currentData,
  strain,
  growthStage,
  historicalYield = []
}: CultivationAdvisorProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const getAIAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/cultivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strain,
          currentConditions: {
            ...currentData,
            growthStage
          },
          yieldHistory: historicalYield
        })
      });

      if (!response.ok) throw new Error('Failed to get AI analysis');

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine environmental status
  const getParameterStatus = (param: string, value: number) => {
    const optimalRanges: Record<string, Record<string, [number, number]>> = {
      temperature: {
        seedling: [72, 78],
        vegetative: [70, 85],
        flowering: [65, 80],
        harvest: [60, 70]
      },
      humidity: {
        seedling: [65, 70],
        vegetative: [40, 70],
        flowering: [40, 50],
        harvest: [30, 40]
      },
      co2: {
        seedling: [400, 800],
        vegetative: [800, 1200],
        flowering: [800, 1200],
        harvest: [400, 600]
      },
      ppfd: {
        seedling: [100, 300],
        vegetative: [400, 600],
        flowering: [600, 900],
        harvest: [0, 100]
      },
      vpd: {
        seedling: [0.4, 0.8],
        vegetative: [0.8, 1.2],
        flowering: [1.0, 1.5],
        harvest: [1.2, 1.6]
      }
    };

    const range = optimalRanges[param]?.[growthStage];
    if (!range) return 'unknown';

    if (value < range[0]) return 'low';
    if (value > range[1]) return 'high';
    return 'optimal';
  };

  const environmentalParams = [
    { key: 'temperature', label: 'Temperature', value: currentData.temperature, unit: '°F', icon: Thermometer },
    { key: 'humidity', label: 'Humidity', value: currentData.humidity, unit: '%', icon: Droplets },
    { key: 'co2', label: 'CO₂', value: currentData.co2, unit: 'ppm', icon: Wind },
    { key: 'ppfd', label: 'Light Intensity', value: currentData.ppfd, unit: 'μmol/m²/s', icon: Sun },
    { key: 'vpd', label: 'VPD', value: currentData.vpd, unit: 'kPa', icon: Leaf }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Environmental Status */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Cultivation Advisor
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={autoMode ? "default" : "outline"}>
                {autoMode ? "Auto-Adjusting" : "Manual Mode"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoMode(!autoMode)}
              >
                {autoMode ? "Disable Auto" : "Enable Auto"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Strain & Stage Info */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Strain</p>
                <p className="font-semibold">{strain}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Growth Stage</p>
                <p className="font-semibold capitalize">{growthStage}</p>
              </div>
            </div>

            {/* Environmental Parameters */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {environmentalParams.map((param) => {
                const status = getParameterStatus(param.key, param.value);
                const Icon = param.icon;
                
                return (
                  <div
                    key={param.key}
                    className={`p-3 rounded-lg border ${
                      status === 'optimal' 
                        ? 'bg-green-900/20 border-green-700'
                        : status === 'low'
                        ? 'bg-blue-900/20 border-blue-700'
                        : status === 'high'
                        ? 'bg-red-900/20 border-red-700'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">{param.label}</span>
                      <Icon className={`w-4 h-4 ${
                        status === 'optimal' ? 'text-green-400' :
                        status === 'low' ? 'text-blue-400' :
                        status === 'high' ? 'text-red-400' :
                        'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{param.value}</span>
                      <span className="text-sm text-gray-400">{param.unit}</span>
                    </div>
                    <div className="mt-1">
                      {status === 'optimal' && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Optimal
                        </span>
                      )}
                      {status === 'low' && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Too Low
                        </span>
                      )}
                      {status === 'high' && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Too High
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Analysis Button */}
            <Button
              onClick={getAIAnalysis}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>

            {/* AI Analysis Results */}
            {analysis && (
              <div className="space-y-4 mt-6">
                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <Alert className="bg-purple-900/20 border-purple-700">
                    <Sparkles className="w-4 h-4" />
                    <AlertTitle>AI Recommendations</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 space-y-1">
                        {analysis.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Predicted Impact */}
                {analysis.insights?.predictedImpact && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-400" />
                        Predicted Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Yield Improvement</p>
                          <p className="text-lg font-bold text-green-400">
                            +{analysis.insights.predictedImpact.yieldIncrease || 12}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Quality Score</p>
                          <p className="text-lg font-bold text-blue-400">
                            +{analysis.insights.predictedImpact.qualityIncrease || 8}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {analysis.nextSteps.map((step: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-yellow-400 font-semibold">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {/* Confidence Score */}
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-400">AI Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                        style={{ width: `${(analysis.confidence || 0.85) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((analysis.confidence || 0.85) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
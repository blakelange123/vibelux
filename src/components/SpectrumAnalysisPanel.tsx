'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, Info, Zap } from 'lucide-react';

interface SpectrumData {
  blue: number;
  green: number;
  red: number;
  farRed: number;
}

interface FixtureWithSpectrum {
  id: string;
  brand: string;
  model: string;
  wattage: number;
  ppf: number;
  spectrumData?: SpectrumData;
  spectrum?: string;
}

interface SpectrumAnalysisPanelProps {
  fixtures: FixtureWithSpectrum[];
  targetCrop?: string;
}

export function SpectrumAnalysisPanel({ fixtures, targetCrop = 'General' }: SpectrumAnalysisPanelProps) {
  // Calculate combined spectrum
  const combinedSpectrum = fixtures.reduce(
    (acc, fixture) => {
      if (fixture.spectrumData) {
        acc.blue += fixture.spectrumData.blue * (fixture.ppf / 100);
        acc.green += fixture.spectrumData.green * (fixture.ppf / 100);
        acc.red += fixture.spectrumData.red * (fixture.ppf / 100);
        acc.farRed += fixture.spectrumData.farRed * (fixture.ppf / 100);
      }
      return acc;
    },
    { blue: 0, green: 0, red: 0, farRed: 0 }
  );

  const totalPPF = fixtures.reduce((sum, f) => sum + f.ppf, 0);
  const totalSpectrum = combinedSpectrum.blue + combinedSpectrum.green + combinedSpectrum.red + combinedSpectrum.farRed;

  // Calculate percentages
  const spectrumPercentages = {
    blue: totalSpectrum > 0 ? (combinedSpectrum.blue / totalSpectrum) * 100 : 0,
    green: totalSpectrum > 0 ? (combinedSpectrum.green / totalSpectrum) * 100 : 0,
    red: totalSpectrum > 0 ? (combinedSpectrum.red / totalSpectrum) * 100 : 0,
    farRed: totalSpectrum > 0 ? (combinedSpectrum.farRed / totalSpectrum) * 100 : 0
  };

  // Ideal spectrum targets by crop
  const idealSpectrums: { [key: string]: SpectrumData } = {
    'Cannabis': { blue: 20, green: 10, red: 65, farRed: 5 },
    'Lettuce': { blue: 25, green: 15, red: 55, farRed: 5 },
    'Tomatoes': { blue: 15, green: 10, red: 70, farRed: 5 },
    'General': { blue: 20, green: 15, red: 60, farRed: 5 }
  };

  const idealSpectrum = idealSpectrums[targetCrop] || idealSpectrums['General'];

  // Calculate spectrum quality score
  const calculateSpectrumScore = () => {
    const blueDiff = Math.abs(spectrumPercentages.blue - idealSpectrum.blue);
    const greenDiff = Math.abs(spectrumPercentages.green - idealSpectrum.green);
    const redDiff = Math.abs(spectrumPercentages.red - idealSpectrum.red);
    const farRedDiff = Math.abs(spectrumPercentages.farRed - idealSpectrum.farRed);
    
    const totalDiff = blueDiff + greenDiff + redDiff + farRedDiff;
    const score = Math.max(0, 100 - totalDiff * 2);
    
    return score;
  };

  const spectrumScore = calculateSpectrumScore();

  // Prepare chart data
  const chartData = [
    {
      wavelength: 'Blue\n(400-500nm)',
      current: spectrumPercentages.blue,
      ideal: idealSpectrum.blue,
    },
    {
      wavelength: 'Green\n(500-600nm)',
      current: spectrumPercentages.green,
      ideal: idealSpectrum.green,
    },
    {
      wavelength: 'Red\n(600-700nm)',
      current: spectrumPercentages.red,
      ideal: idealSpectrum.red,
    },
    {
      wavelength: 'Far Red\n(700-800nm)',
      current: spectrumPercentages.farRed,
      ideal: idealSpectrum.farRed,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (spectrumPercentages.blue < idealSpectrum.blue - 5) {
      recommendations.push({
        type: 'warning',
        message: 'Low blue light may lead to stretching and poor morphology'
      });
    } else if (spectrumPercentages.blue > idealSpectrum.blue + 10) {
      recommendations.push({
        type: 'info',
        message: 'High blue light may reduce yield efficiency'
      });
    }
    
    if (spectrumPercentages.red < idealSpectrum.red - 10) {
      recommendations.push({
        type: 'warning',
        message: 'Insufficient red light for optimal photosynthesis'
      });
    }
    
    if (spectrumPercentages.green < 5) {
      recommendations.push({
        type: 'info',
        message: 'Consider adding green light for better canopy penetration'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Spectrum Analysis
          </span>
          <Badge variant={spectrumScore >= 85 ? "default" : spectrumScore >= 70 ? "secondary" : "destructive"}>
            Score: {spectrumScore.toFixed(0)}%
          </Badge>
        </CardTitle>
        <CardDescription>
          Combined spectrum analysis for {fixtures.length} fixture{fixtures.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {spectrumPercentages.blue.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Blue</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {spectrumPercentages.green.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Green</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {spectrumPercentages.red.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Red</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {spectrumPercentages.farRed.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Far Red</div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="wavelength" />
              <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Current" />
              <Bar dataKey="ideal" fill="#10b981" name={`Ideal (${targetCrop})`} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Spectrum Quality</span>
            <div className="flex items-center gap-2">
              <Progress value={spectrumScore} className="w-32 h-2" />
              <span className={`text-sm font-medium ${getScoreColor(spectrumScore)}`}>
                {spectrumScore.toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Total PPF: {totalPPF} μmol/s</p>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <Alert key={index} variant={rec.type === 'warning' ? 'destructive' : 'default'}>
                {rec.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                <AlertDescription>{rec.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
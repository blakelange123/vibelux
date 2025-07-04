'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceLine, Area, ComposedChart 
} from 'recharts';
import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { TimeLagCorrelationEngine, COMMON_LAG_PATTERNS, generateLagAlert } from '@/lib/time-lag-correlation';
import { format } from 'date-fns';

interface SensorData {
  timestamp: Date;
  value: number;
}

interface TimeLagAnalyzerProps {
  facilityId: string;
  sensorData: {
    co2?: SensorData[];
    temperature?: SensorData[];
    light?: SensorData[];
    vpd?: SensorData[];
    irrigation?: SensorData[];
    photosynthesis?: SensorData[];
    biomassGain?: SensorData[];
    transpiration?: SensorData[];
    stomatalConductance?: SensorData[];
  };
}

export function TimeLagAnalyzer({ facilityId, sensorData }: TimeLagAnalyzerProps) {
  const [selectedInput, setSelectedInput] = useState<string>('co2');
  const [selectedOutput, setSelectedOutput] = useState<string>('photosynthesis');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  const engine = new TimeLagCorrelationEngine();

  const analyzeTimeLag = async () => {
    setIsAnalyzing(true);
    setAlerts([]);

    try {
      const inputData = sensorData[selectedInput as keyof typeof sensorData];
      const outputData = sensorData[selectedOutput as keyof typeof sensorData];

      if (!inputData || !outputData) {
        setAlerts(['Insufficient data for analysis']);
        return;
      }

      const result = engine.detectTimeLag(inputData, outputData);

      if (result) {
        setAnalysis({
          ...result,
          inputParameter: selectedInput,
          outputParameter: selectedOutput
        });

        // Check against common patterns
        const patternKey = `${selectedInput.toUpperCase()}_TO_${selectedOutput.toUpperCase()}` as keyof typeof COMMON_LAG_PATTERNS;
        if (COMMON_LAG_PATTERNS[patternKey]) {
          const alert = generateLagAlert(result, patternKey);
          setAlerts([alert]);
        }

        // Generate visualization data
        const visualizationData = generateVisualizationData(
          inputData,
          outputData,
          result.optimalLagMinutes
        );
        setAnalysis(prev => ({ ...prev, visualizationData }));
      } else {
        setAlerts(['No significant correlation found between selected parameters']);
      }
    } catch (error) {
      setAlerts(['Error analyzing time lag correlation']);
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateVisualizationData = (
    input: SensorData[],
    output: SensorData[],
    lagMinutes: number
  ) => {
    // Align data with detected lag
    const alignedData = input.map((inputPoint, index) => {
      const targetTime = new Date(inputPoint.timestamp.getTime() + lagMinutes * 60000);
      const outputPoint = output.find(o => 
        Math.abs(o.timestamp.getTime() - targetTime.getTime()) < 5 * 60000 // 5 min tolerance
      );

      return {
        time: format(inputPoint.timestamp, 'HH:mm'),
        input: inputPoint.value,
        output: outputPoint?.value || null,
        outputShifted: output[index]?.value || null // Original unshifted for comparison
      };
    }).filter(d => d.output !== null);

    return alignedData;
  };

  const getParameterLabel = (param: string): string => {
    const labels: Record<string, string> = {
      co2: 'CO₂ (ppm)',
      temperature: 'Temperature (°C)',
      light: 'Light (μmol/m²/s)',
      vpd: 'VPD (kPa)',
      irrigation: 'Irrigation (L)',
      photosynthesis: 'Photosynthesis Rate',
      biomassGain: 'Biomass Gain (g/m²)',
      transpiration: 'Transpiration (mm)',
      stomatalConductance: 'Stomatal Conductance'
    };
    return labels[param] || param;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time-Lag Correlation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parameter Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Input Parameter</label>
            <Select value={selectedInput} onValueChange={setSelectedInput}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="co2">CO₂ Concentration</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="light">Light Intensity</SelectItem>
                <SelectItem value="vpd">VPD</SelectItem>
                <SelectItem value="irrigation">Irrigation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Output Parameter</label>
            <Select value={selectedOutput} onValueChange={setSelectedOutput}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photosynthesis">Photosynthesis Rate</SelectItem>
                <SelectItem value="biomassGain">Biomass Gain</SelectItem>
                <SelectItem value="transpiration">Transpiration</SelectItem>
                <SelectItem value="stomatalConductance">Stomatal Conductance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={analyzeTimeLag} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Time Lag'}
        </Button>

        {/* Alerts */}
        {alerts.map((alert, index) => (
          <Alert key={index} variant={alert.includes('⚠️') ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alert}</AlertDescription>
          </Alert>
        ))}

        {/* Analysis Results */}
        {analysis && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{analysis.optimalLagMinutes} min</div>
                  <p className="text-xs text-muted-foreground">Optimal Lag Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{(analysis.correlation * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Correlation Strength</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{(analysis.confidence * 100).toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">Confidence Level</p>
                </CardContent>
              </Card>
            </div>

            {/* Visualization */}
            {analysis.visualizationData && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Correlation Visualization</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analysis.visualizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="input"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name={getParameterLabel(selectedInput)}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="output"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name={`${getParameterLabel(selectedOutput)} (shifted ${analysis.optimalLagMinutes}min)`}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="outputShifted"
                      stroke="#ff7300"
                      strokeDasharray="5 5"
                      name={`${getParameterLabel(selectedOutput)} (original)`}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground">
                  The green line shows the output parameter shifted by {analysis.optimalLagMinutes} minutes 
                  to align with the input parameter, demonstrating the time-lag correlation.
                </p>
              </div>
            )}

            {/* Common Patterns Reference */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Common Time-Lag Patterns</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CO₂ → Photosynthesis:</span>
                  <Badge variant="outline">~120 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Light → Biomass Gain:</span>
                  <Badge variant="outline">~360 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Irrigation → Transpiration:</span>
                  <Badge variant="outline">~30 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span>VPD → Stomatal Response:</span>
                  <Badge variant="outline">~15 minutes</Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
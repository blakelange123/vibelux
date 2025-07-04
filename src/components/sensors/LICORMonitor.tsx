'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  Download,
  Settings,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface SensorReading {
  timestamp: string;
  ppfd: number;
  quality: 'good' | 'warning' | 'error';
}

interface DLIData {
  dli: number;
  peakPPFD: number;
  avgPPFD: number;
  photoperiod: number;
  readings: number;
}

interface LICORSensor {
  id: string;
  type: string;
  name: string;
  status: string;
  lastReading: string;
  calibrationDate: string;
  location: { x: number; y: number; z: number };
}

export function LICORMonitor() {
  const [sensors, setSensors] = useState<LICORSensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>('');
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [dliData, setDliData] = useState<DLIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch sensor status
  useEffect(() => {
    fetchSensorStatus();
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchSensorStatus();
        if (selectedSensor) {
          fetchReadings(selectedSensor);
          fetchDLI(selectedSensor);
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedSensor, autoRefresh]);

  const fetchSensorStatus = async () => {
    try {
      const response = await fetch('/api/sensors/licor?action=status');
      const data = await response.json();
      setSensors(data.sensors || []);
      setIsLoading(false);
      
      // Auto-select first sensor if none selected
      if (!selectedSensor && data.sensors.length > 0) {
        setSelectedSensor(data.sensors[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch sensor status:', error);
      setIsLoading(false);
    }
  };

  const fetchReadings = async (sensorId: string) => {
    try {
      const response = await fetch(`/api/sensors/licor?action=readings&sensorId=${sensorId}`);
      const data = await response.json();
      
      // Convert to chart format
      const chartData = (data.readings || []).map((r: any) => ({
        timestamp: new Date(r.timestamp).toLocaleTimeString(),
        ppfd: r.ppfd || r.value,
        quality: r.quality
      }));
      
      setReadings(chartData.slice(-50)); // Keep last 50 readings
    } catch (error) {
      console.error('Failed to fetch readings:', error);
    }
  };

  const fetchDLI = async (sensorId: string) => {
    try {
      const response = await fetch(`/api/sensors/licor?action=dli&sensorId=${sensorId}`);
      const data = await response.json();
      setDliData(data.dli);
    } catch (error) {
      console.error('Failed to fetch DLI:', error);
    }
  };

  const simulateReading = async () => {
    try {
      await fetch('/api/sensors/licor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          data: {
            sensorId: selectedSensor,
            ppfd: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 800 + 400
          }
        })
      });
      
      // Refresh data
      fetchReadings(selectedSensor);
      fetchDLI(selectedSensor);
    } catch (error) {
      console.error('Failed to simulate reading:', error);
    }
  };

  const exportData = () => {
    // Create CSV from readings
    const csv = 'Timestamp,PPFD (μmol·m⁻²·s⁻¹),Quality\n' + 
      readings.map(r => `${r.timestamp},${r.ppfd},${r.quality}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licor-${selectedSensor}-${new Date().toISOString()}.csv`;
    a.click();
  };

  const currentPPFD = readings.length > 0 ? readings[readings.length - 1].ppfd : 0;
  const currentQuality = readings.length > 0 ? readings[readings.length - 1].quality : 'good';

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Sun className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">LI-COR Sensor Monitor</h2>
            <p className="text-sm text-gray-400">Research-grade PAR measurement</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          
          <button
            onClick={exportData}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Export data"
          >
            <Download className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading sensors...</div>
        </div>
      ) : (
        <>
          {/* Sensor Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {sensors.map((sensor) => (
              <button
                key={sensor.id}
                onClick={() => setSelectedSensor(sensor.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedSensor === sensor.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-sm font-medium">{sensor.name}</div>
                <div className="text-xs text-gray-500 mt-1">{sensor.type}</div>
                <div className="flex items-center gap-1 mt-2">
                  {sensor.status === 'active' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs">{sensor.status}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedSensor && (
            <>
              {/* Current Reading */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Current PPFD</span>
                    <Gauge className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {currentPPFD.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">μmol·m⁻²·s⁻¹</div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`w-2 h-2 rounded-full ${
                      currentQuality === 'good' ? 'bg-green-400' :
                      currentQuality === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-xs text-gray-400">Signal {currentQuality}</span>
                  </div>
                </div>

                {dliData && (
                  <>
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Today's DLI</span>
                        <Calendar className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {dliData.dli.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">mol·m⁻²·d⁻¹</div>
                      <div className="text-xs text-gray-400 mt-3">
                        {dliData.photoperiod.toFixed(1)}h photoperiod
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Peak PPFD</span>
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {dliData.peakPPFD}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">μmol·m⁻²·s⁻¹</div>
                      <div className="text-xs text-gray-400 mt-3">
                        Avg: {dliData.avgPPFD} μmol·m⁻²·s⁻¹
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Live Chart */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Live PPFD Monitoring</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings}>
                      <defs>
                        <linearGradient id="ppfdGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        label={{ 
                          value: 'PPFD (μmol·m⁻²·s⁻¹)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: '#9ca3af' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ppfd"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#ppfdGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Simulate Reading Button (for testing) */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={simulateReading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Simulate Reading (Test)
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
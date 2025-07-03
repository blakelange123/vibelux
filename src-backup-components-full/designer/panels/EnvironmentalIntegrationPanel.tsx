'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Cloud, 
  Droplets, 
  Wind, 
  Thermometer,
  Globe,
  Activity,
  TrendingUp,
  Leaf,
  Battery,
  Zap,
  Calculator,
  Download,
  ChevronRight,
  Info,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  Settings
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { EnvironmentalIntegration } from '../EnvironmentalIntegration';

interface EnvironmentalIntegrationPanelProps {
  onClose: () => void;
}

export function EnvironmentalIntegrationPanel({ onClose }: EnvironmentalIntegrationPanelProps) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  
  // Environmental data state
  const [location, setLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    state: 'NY',
    timezone: 'America/New_York',
    elevation: 10
  });
  
  const [zipCode, setZipCode] = useState('10001');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const [environmentalData, setEnvironmentalData] = useState({
    solarIrradiance: 0,
    cloudCover: 0,
    temperature: 20,
    humidity: 50,
    co2Level: 400,
    naturalDLI: 0,
    transmissionFactor: 0.7
  });
  
  const [timeOfDay, setTimeOfDay] = useState(new Date());
  const [season, setSeason] = useState('summer');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [lightingSchedule, setLightingSchedule] = useState([
    { id: '1', startTime: '06:00', endTime: '10:00', intensity: 30, name: 'Morning Ramp' },
    { id: '2', startTime: '10:00', endTime: '14:00', intensity: 100, name: 'Peak Growth' },
    { id: '3', startTime: '14:00', endTime: '18:00', intensity: 80, name: 'Afternoon' },
    { id: '4', startTime: '18:00', endTime: '22:00', intensity: 40, name: 'Evening Ramp' }
  ]);
  
  // Calculate combined lighting
  const calculateCombinedLighting = () => {
    const artificialPPFD = state.calculations.averagePPFD;
    const naturalPPFD = environmentalData.solarIrradiance * 
                       environmentalData.transmissionFactor * 
                       0.45; // Convert W/m² to PPFD
    
    const totalPPFD = artificialPPFD + naturalPPFD;
    const photoperiod = 16; // hours
    const totalDLI = (totalPPFD * photoperiod * 3.6) / 1000;
    
    return {
      artificialPPFD,
      naturalPPFD,
      totalPPFD,
      totalDLI,
      artificialContribution: artificialPPFD / (totalPPFD || 1) * 100,
      naturalContribution: naturalPPFD / (totalPPFD || 1) * 100
    };
  };
  
  const lighting = calculateCombinedLighting();
  
  // Energy and sustainability metrics
  const calculateSustainability = () => {
    const totalFixtures = state.objects.filter(obj => obj.type === 'fixture').length;
    const totalWattage = totalFixtures * 600; // Average 600W per fixture
    const artificialEnergy = totalWattage * 16 / 1000; // kWh/day
    const savedEnergy = (lighting.naturalContribution / 100) * artificialEnergy;
    const carbonSaved = savedEnergy * 0.709; // kg CO2/kWh average
    const cost = artificialEnergy * 0.12; // $0.12/kWh
    const savedCost = savedEnergy * 0.12;
    
    return {
      totalWattage,
      artificialEnergy,
      savedEnergy,
      carbonSaved,
      cost,
      savedCost,
      sustainabilityScore: Math.min(100, lighting.naturalContribution * 1.5)
    };
  };
  
  const sustainability = calculateSustainability();
  
  // Real-time recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (lighting.naturalPPFD > 300) {
      recommendations.push({
        type: 'dimming',
        message: `Dim artificial lights to ${Math.max(30, 100 - lighting.naturalContribution).toFixed(0)}% to maintain target PPFD`,
        savings: `Save ${(lighting.naturalContribution * sustainability.totalWattage / 100).toFixed(0)}W`
      });
    }
    
    if (environmentalData.cloudCover < 30 && timeOfDay.getHours() > 10 && timeOfDay.getHours() < 14) {
      recommendations.push({
        type: 'schedule',
        message: 'Consider turning off supplemental lighting during peak sun hours',
        savings: `Save up to ${(sustainability.totalWattage * 4 / 1000).toFixed(1)} kWh/day`
      });
    }
    
    if (environmentalData.temperature > 28) {
      recommendations.push({
        type: 'cooling',
        message: 'High temperature detected - reduce lighting heat load',
        savings: 'Reduce HVAC costs by 15-20%'
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();
  
  // Handle zip code search
  const searchLocation = async () => {
    if (!zipCode || zipCode.length < 5) {
      showNotification('error', 'Please enter a valid 5-digit zip code');
      return;
    }
    
    setIsLoadingLocation(true);
    
    try {
      // Try OpenWeatherMap geocoding API first
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo';
      const geocodeUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},US&appid=${apiKey}`;
      
      const response = await fetch(geocodeUrl);
      if (response.ok) {
        const data = await response.json();
        
        setLocation({
          latitude: data.coord.lat,
          longitude: data.coord.lon,
          city: data.name,
          state: 'US', // OpenWeatherMap doesn't provide state in zip endpoint
          timezone: 'America/New_York', // Would need additional API for precise timezone
          elevation: 10 // Default elevation
        });
        
        showNotification('success', `Location updated to ${data.name}`);
      } else {
        // Fallback to ZIP code database
        const zipData = {
          '10001': { lat: 40.7506, lon: -73.9971, city: 'New York', state: 'NY' },
          '90210': { lat: 34.0901, lon: -118.4065, city: 'Beverly Hills', state: 'CA' },
          '60601': { lat: 41.8853, lon: -87.6181, city: 'Chicago', state: 'IL' },
          '33101': { lat: 25.7781, lon: -80.1883, city: 'Miami', state: 'FL' },
          '98101': { lat: 47.6089, lon: -122.3352, city: 'Seattle', state: 'WA' }
        };
        
        const fallbackLocation = zipData[zipCode as keyof typeof zipData];
        if (fallbackLocation) {
          setLocation({
            latitude: fallbackLocation.lat,
            longitude: fallbackLocation.lon,
            city: fallbackLocation.city,
            state: fallbackLocation.state,
            timezone: 'America/New_York',
            elevation: 10
          });
          showNotification('success', `Location updated to ${fallbackLocation.city}, ${fallbackLocation.state}`);
        } else {
          showNotification('error', 'Could not find location for this zip code');
        }
      }
    } catch (error) {
      showNotification('error', 'Error searching for location');
      console.error('Location search error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  // Update time periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOfDay(new Date());
      // Simulate solar irradiance based on time
      const hour = new Date().getHours();
      const solarCurve = Math.max(0, Math.sin((hour - 6) * Math.PI / 12)) * 800;
      setEnvironmentalData(prev => ({
        ...prev,
        solarIrradiance: solarCurve * (1 - prev.cloudCover / 100)
      }));
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const exportAnalysis = () => {
    const report = {
      location,
      timestamp: new Date().toISOString(),
      environmental: environmentalData,
      lighting,
      sustainability,
      recommendations,
      roomData: {
        dimensions: {
          width: state.room.width,
          length: state.room.length,
          height: state.room.height
        },
        fixtureCount: state.objects.filter(obj => obj.type === 'fixture').length
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environmental_analysis_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Environmental analysis exported');
  };
  
  return (
    <div className="h-full bg-gray-900 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Environmental Integration</h2>
              <p className="text-gray-400">Optimize natural + artificial lighting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Left Column - Environmental Conditions */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Location & Time
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Project ZIP Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="Enter ZIP code"
                      className="flex-1 bg-gray-700 px-3 py-2 rounded text-sm"
                      maxLength={5}
                    />
                    <button
                      onClick={searchLocation}
                      disabled={isLoadingLocation}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors"
                    >
                      {isLoadingLocation ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Location</span>
                  <span>{location.city}, {location.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Coordinates</span>
                  <span className="text-sm">{location.latitude.toFixed(2)}°N, {Math.abs(location.longitude).toFixed(2)}°W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time</span>
                  <span>{timeOfDay.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Season</span>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="bg-gray-700 px-2 py-1 rounded text-sm"
                  >
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-400" />
                Solar Conditions
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">Solar Irradiance</span>
                    <span>{environmentalData.solarIrradiance.toFixed(0)} W/m²</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${(environmentalData.solarIrradiance / 1000) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Cloud Cover (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={environmentalData.cloudCover}
                    onChange={(e) => setEnvironmentalData(prev => ({
                      ...prev,
                      cloudCover: parseInt(e.target.value)
                    }))}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Clear</span>
                    <span>{environmentalData.cloudCover}%</span>
                    <span>Overcast</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Greenhouse Transmission</label>
                  <select
                    value={environmentalData.transmissionFactor}
                    onChange={(e) => setEnvironmentalData(prev => ({
                      ...prev,
                      transmissionFactor: parseFloat(e.target.value)
                    }))}
                    className="w-full bg-gray-700 px-3 py-2 rounded mt-1"
                  >
                    <option value={0.85}>Single Poly (85%)</option>
                    <option value={0.75}>Double Poly (75%)</option>
                    <option value={0.70}>Glass (70%)</option>
                    <option value={0.65}>Polycarbonate (65%)</option>
                    <option value={1.0}>Outdoor (100%)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-400" />
                Environmental
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Temperature</span>
                  <span>{environmentalData.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Humidity</span>
                  <span>{environmentalData.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">CO₂ Level</span>
                  <span>{environmentalData.co2Level} ppm</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Center Column - Combined Lighting Analysis */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Combined Lighting Analysis
              </h3>
              
              {/* PPFD Breakdown */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold">{lighting.totalPPFD.toFixed(0)}</span>
                  <span className="text-gray-400">µmol/m²/s</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Artificial</span>
                    <span className="ml-auto">{lighting.artificialPPFD.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Natural</span>
                    <span className="ml-auto">{lighting.naturalPPFD.toFixed(0)}</span>
                  </div>
                </div>
                
                {/* Stacked Bar */}
                <div className="mt-3 h-8 bg-gray-700 rounded-lg overflow-hidden flex">
                  <div 
                    className="bg-purple-500 h-full transition-all"
                    style={{ width: `${lighting.artificialContribution}%` }}
                  />
                  <div 
                    className="bg-yellow-500 h-full transition-all"
                    style={{ width: `${lighting.naturalContribution}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Artificial {lighting.artificialContribution.toFixed(0)}%</span>
                  <span>Natural {lighting.naturalContribution.toFixed(0)}%</span>
                </div>
              </div>
              
              {/* DLI */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total DLI</span>
                  <span className="text-xl font-semibold">{lighting.totalDLI.toFixed(1)} mol/m²/day</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-400" />
                Sustainability Metrics
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Sustainability Score</span>
                  <span className="text-2xl font-bold text-green-400">
                    {sustainability.sustainabilityScore.toFixed(0)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full transition-all"
                    style={{ width: `${sustainability.sustainabilityScore}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Energy Saved</span>
                  <span className="text-green-400">{sustainability.savedEnergy.toFixed(1)} kWh/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Carbon Reduced</span>
                  <span className="text-green-400">{sustainability.carbonSaved.toFixed(1)} kg CO₂/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cost Savings</span>
                  <span className="text-green-400">${sustainability.savedCost.toFixed(2)}/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Annual Savings</span>
                  <span className="text-green-400 font-semibold">
                    ${(sustainability.savedCost * 365).toFixed(0)}/year
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Battery className="w-5 h-5 text-blue-400" />
                Energy Usage
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Power</span>
                  <span>{sustainability.totalWattage.toLocaleString()} W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Daily Energy</span>
                  <span>{sustainability.artificialEnergy.toFixed(1)} kWh</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Daily Cost</span>
                  <span>${sustainability.cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Recommendations & Actions */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Real-time Recommendations
              </h3>
              
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm">{rec.message}</p>
                          <p className="text-xs text-green-400 mt-1">{rec.savings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Lighting conditions are optimal. No adjustments needed.
                </p>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const dimmingLevel = Math.max(30, 100 - lighting.naturalContribution);
                    state.objects
                      .filter(obj => obj.type === 'fixture')
                      .forEach(fixture => {
                        dispatch({
                          type: 'UPDATE_OBJECT',
                          payload: { 
                            id: fixture.id,
                            updates: { dimmingLevel } as any
                          }
                        });
                      });
                    showNotification('success', `All fixtures dimmed to ${dimmingLevel.toFixed(0)}%`);
                  }}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-between group"
                >
                  <span>Auto-adjust Lighting</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-between group"
                >
                  <span>Configure Schedule</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={exportAnalysis}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-between group"
                >
                  <span>Export Analysis</span>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Live Graph Preview */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                24-Hour Light Profile
              </h3>
              
              <div className="h-40 relative">
                {/* Simple SVG graph */}
                <svg className="w-full h-full">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <line
                      key={y}
                      x1="0"
                      y1={`${100 - y}%`}
                      x2="100%"
                      y2={`${100 - y}%`}
                      stroke="rgb(55, 65, 81)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Natural light curve */}
                  <path
                    d={`M 0,100 Q 25,100 30,80 T 50,20 T 70,80 Q 75,100 100,100`}
                    fill="none"
                    stroke="rgb(251, 191, 36)"
                    strokeWidth="2"
                  />
                  
                  {/* Artificial light line */}
                  <line
                    x1="20%"
                    y1="50%"
                    x2="80%"
                    y2="50%"
                    stroke="rgb(147, 51, 234)"
                    strokeWidth="2"
                  />
                </svg>
                
                {/* Legend */}
                <div className="absolute bottom-0 right-0 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-yellow-400"></div>
                    <span className="text-gray-400">Natural</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-purple-500"></div>
                    <span className="text-gray-400">Artificial</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lighting Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold">Lighting Schedule</h2>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Schedule List */}
              <div className="space-y-4 mb-6">
                {lightingSchedule.map((period, index) => (
                  <div key={period.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                        <input
                          type="text"
                          value={period.name}
                          onChange={(e) => {
                            const updated = [...lightingSchedule];
                            updated[index] = { ...period, name: e.target.value };
                            setLightingSchedule(updated);
                          }}
                          className="bg-gray-700 rounded px-3 py-2 text-white"
                          placeholder="Period name"
                        />
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={period.startTime}
                            onChange={(e) => {
                              const updated = [...lightingSchedule];
                              updated[index] = { ...period, startTime: e.target.value };
                              setLightingSchedule(updated);
                            }}
                            className="bg-gray-700 rounded px-3 py-2 text-white"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={period.endTime}
                            onChange={(e) => {
                              const updated = [...lightingSchedule];
                              updated[index] = { ...period, endTime: e.target.value };
                              setLightingSchedule(updated);
                            }}
                            className="bg-gray-700 rounded px-3 py-2 text-white"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={period.intensity}
                            onChange={(e) => {
                              const updated = [...lightingSchedule];
                              updated[index] = { ...period, intensity: Number(e.target.value) };
                              setLightingSchedule(updated);
                            }}
                            className="flex-1 accent-purple-600"
                          />
                          <span className="text-white min-w-[3ch]">{period.intensity}%</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setLightingSchedule(lightingSchedule.filter(p => p.id !== period.id));
                        }}
                        className="ml-4 p-2 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add Period Button */}
              <button
                onClick={() => {
                  const newPeriod = {
                    id: Date.now().toString(),
                    name: 'New Period',
                    startTime: '00:00',
                    endTime: '01:00',
                    intensity: 50
                  };
                  setLightingSchedule([...lightingSchedule, newPeriod]);
                }}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Time Period
              </button>
              
              {/* Schedule Preview */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">24-Hour Preview</h3>
                <div className="bg-gray-800 rounded-lg p-4 h-32 relative">
                  {/* Hour markers */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                    {[0, 6, 12, 18, 24].map(hour => (
                      <span key={hour}>{hour}:00</span>
                    ))}
                  </div>
                  
                  {/* Schedule bars */}
                  <div className="relative h-20">
                    {lightingSchedule.map((period) => {
                      const start = parseInt(period.startTime.split(':')[0]) * 60 + parseInt(period.startTime.split(':')[1]);
                      const end = parseInt(period.endTime.split(':')[0]) * 60 + parseInt(period.endTime.split(':')[1]);
                      const left = (start / 1440) * 100;
                      const width = ((end - start) / 1440) * 100;
                      const height = period.intensity;
                      
                      return (
                        <div
                          key={period.id}
                          className="absolute bottom-0 bg-purple-600 opacity-80"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                            transition: 'all 0.3s ease'
                          }}
                          title={`${period.name}: ${period.intensity}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Preset Templates */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Preset Templates</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setLightingSchedule([
                        { id: '1', startTime: '06:00', endTime: '08:00', intensity: 20, name: 'Dawn' },
                        { id: '2', startTime: '08:00', endTime: '18:00', intensity: 100, name: 'Day' },
                        { id: '3', startTime: '18:00', endTime: '20:00', intensity: 20, name: 'Dusk' },
                        { id: '4', startTime: '20:00', endTime: '06:00', intensity: 0, name: 'Night' }
                      ]);
                    }}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-center"
                  >
                    <Sun className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="font-medium">Natural Daylight</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setLightingSchedule([
                        { id: '1', startTime: '06:00', endTime: '10:00', intensity: 80, name: 'Morning' },
                        { id: '2', startTime: '10:00', endTime: '14:00', intensity: 100, name: 'Peak' },
                        { id: '3', startTime: '14:00', endTime: '18:00', intensity: 80, name: 'Afternoon' },
                        { id: '4', startTime: '18:00', endTime: '22:00', intensity: 40, name: 'Evening' }
                      ]);
                    }}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-center"
                  >
                    <Leaf className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="font-medium">Vegetative Growth</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setLightingSchedule([
                        { id: '1', startTime: '00:00', endTime: '12:00', intensity: 0, name: 'Dark' },
                        { id: '2', startTime: '12:00', endTime: '24:00', intensity: 100, name: 'Light' }
                      ]);
                    }}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-center"
                  >
                    <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="font-medium">12/12 Flowering</p>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Apply schedule to fixtures
                    showNotification('success', 'Lighting schedule applied successfully');
                    setShowScheduleModal(false);
                    
                    // Store schedule in designer state
                    dispatch({
                      type: 'UPDATE_UI',
                      payload: { lightingSchedule } as any
                    });
                  }}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Apply Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
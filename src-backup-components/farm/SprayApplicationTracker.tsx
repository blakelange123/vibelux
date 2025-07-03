'use client';

import React, { useState, useEffect } from 'react';
import {
  Droplets, Shield, Clock, MapPin, AlertTriangle, CheckCircle,
  User, Camera, FileText, Calendar, Thermometer, Wind,
  Eye, Zap, Timer, Beaker, Activity, Gauge, Hash,
  Play, Pause, StopCircle, RotateCw, XCircle, Warning
} from 'lucide-react';

interface SprayApplication {
  id: string;
  productName: string;
  activeIngredient: string;
  epaNumber: string;
  concentration: number;
  rateMixed: string;
  targetPest: string;
  applicationMethod: 'foliar' | 'soil-drench' | 'fumigation' | 'granular';
  zones: string[];
  applicator: {
    id: string;
    name: string;
    license: string;
    certifications: string[];
  };
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
  };
  ppe: PPEChecklist;
  reEntryInterval: number; // hours
  phiDays: number; // pre-harvest interval
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  photos: string[];
  notes: string;
}

interface PPEChecklist {
  respirator: { required: boolean; verified: boolean; type?: string };
  gloves: { required: boolean; verified: boolean; type?: string };
  eyeProtection: { required: boolean; verified: boolean; type?: string };
  coveralls: { required: boolean; verified: boolean; type?: string };
  boots: { required: boolean; verified: boolean; type?: string };
  apron: { required: boolean; verified: boolean; type?: string };
}

interface ChemicalProduct {
  id: string;
  name: string;
  activeIngredient: string;
  epaNumber: string;
  signalWord: 'caution' | 'warning' | 'danger';
  reEntryInterval: number;
  phiDays: number;
  requiredPPE: PPEChecklist;
  maxApplicationsPerSeason: number;
  applicationsSoFar: number;
  restrictedUse: boolean;
}

export default function SprayApplicationTracker({ 
  applicationId, 
  mode = 'new' 
}: { 
  applicationId?: string; 
  mode?: 'new' | 'edit' | 'view' 
}) {
  const [application, setApplication] = useState<SprayApplication | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ChemicalProduct | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [ppeVerified, setPpeVerified] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showWeatherAlert, setShowWeatherAlert] = useState(false);
  const [reentryZones, setReentryZones] = useState<string[]>([]);

  const availableProducts: ChemicalProduct[] = [
    {
      id: 'neem-oil-1',
      name: 'Neem Oil Concentrate',
      activeIngredient: 'Azadirachtin 0.3%',
      epaNumber: '70051-2-56872',
      signalWord: 'caution',
      reEntryInterval: 4,
      phiDays: 0,
      maxApplicationsPerSeason: 12,
      applicationsSoFar: 3,
      restrictedUse: false,
      requiredPPE: {
        respirator: { required: false, verified: false },
        gloves: { required: true, verified: false, type: 'Chemical-resistant' },
        eyeProtection: { required: true, verified: false, type: 'Safety glasses' },
        coveralls: { required: false, verified: false },
        boots: { required: false, verified: false },
        apron: { required: false, verified: false }
      }
    },
    {
      id: 'bt-spray-1',
      name: 'BT Spray (Bacillus thuringiensis)',
      activeIngredient: 'Bacillus thuringiensis 3.2%',
      epaNumber: '73049-39',
      signalWord: 'caution',
      reEntryInterval: 4,
      phiDays: 0,
      maxApplicationsPerSeason: 24,
      applicationsSoFar: 8,
      restrictedUse: false,
      requiredPPE: {
        respirator: { required: false, verified: false },
        gloves: { required: true, verified: false, type: 'Nitrile' },
        eyeProtection: { required: true, verified: false, type: 'Safety glasses' },
        coveralls: { required: false, verified: false },
        boots: { required: false, verified: false },
        apron: { required: false, verified: false }
      }
    },
    {
      id: 'spinosad-1',
      name: 'Spinosad Insecticide',
      activeIngredient: 'Spinosad 22.8%',
      epaNumber: '62719-291',
      signalWord: 'warning',
      reEntryInterval: 12,
      phiDays: 1,
      maxApplicationsPerSeason: 6,
      applicationsSoFar: 2,
      restrictedUse: false,
      requiredPPE: {
        respirator: { required: true, verified: false, type: 'N95 or better' },
        gloves: { required: true, verified: false, type: 'Chemical-resistant' },
        eyeProtection: { required: true, verified: false, type: 'Goggles' },
        coveralls: { required: true, verified: false, type: 'Chemical-resistant' },
        boots: { required: true, verified: false, type: 'Chemical-resistant' },
        apron: { required: false, verified: false }
      }
    }
  ];

  const facilitZones = [
    'Veg Room 1', 'Veg Room 2', 'Flower Room 1', 'Flower Room 2',
    'Mother Room', 'Clone Room', 'Quarantine Area'
  ];

  useEffect(() => {
    if (mode === 'new') {
      loadWeatherData();
    } else if (applicationId) {
      loadApplication();
    }
  }, [mode, applicationId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadWeatherData = async () => {
    // Mock weather data - in production, fetch from weather API
    const weather = {
      temperature: 72,
      humidity: 45,
      windSpeed: 3.2,
      windDirection: 'SW',
      conditions: 'Clear'
    };
    
    setWeatherData(weather);
    
    // Check if weather is suitable for spraying
    if (weather.windSpeed > 10 || weather.temperature > 85) {
      setShowWeatherAlert(true);
    }
  };

  const loadApplication = async () => {
    // Mock application data - in production, fetch from API
    // Implementation for edit/view modes
  };

  const handleProductSelect = (product: ChemicalProduct) => {
    setSelectedProduct(product);
    setApplication(prev => ({
      ...prev!,
      productName: product.name,
      activeIngredient: product.activeIngredient,
      epaNumber: product.epaNumber,
      reEntryInterval: product.reEntryInterval,
      phiDays: product.phiDays,
      ppe: { ...product.requiredPPE }
    }));
  };

  const handlePPEVerification = (item: keyof PPEChecklist, verified: boolean) => {
    if (!selectedProduct) return;
    
    const updatedPPE = {
      ...selectedProduct.requiredPPE,
      [item]: { ...selectedProduct.requiredPPE[item], verified }
    };
    
    setSelectedProduct({ ...selectedProduct, requiredPPE: updatedPPE });
    
    // Check if all required PPE is verified
    const allVerified = Object.entries(updatedPPE).every(([key, value]) => 
      !value.required || value.verified
    );
    setPpeVerified(allVerified);
  };

  const handleStartApplication = () => {
    if (!ppeVerified) {
      alert('Please verify all required PPE before starting application');
      return;
    }
    
    setIsRecording(true);
    setElapsedTime(0);
    
    // Set re-entry restrictions
    if (selectedProduct) {
      setReentryZones(application?.zones || []);
    }
  };

  const handleCompleteApplication = () => {
    setIsRecording(false);
    
    // Create application record
    const completedApplication: SprayApplication = {
      id: Date.now().toString(),
      ...application!,
      status: 'completed',
      startTime: new Date(Date.now() - elapsedTime * 1000),
      endTime: new Date(),
      weather: weatherData
    };
    
    // Spray application completed successfully
    
    // In production, save to database and create re-entry restrictions
  };

  const getSignalWordColor = (signalWord: string) => {
    switch (signalWord) {
      case 'danger': return 'text-red-500 bg-red-500/10';
      case 'warning': return 'text-orange-500 bg-orange-500/10';
      case 'caution': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Weather Alert */}
      {showWeatherAlert && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Warning className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-300 mb-1">Weather Advisory</h3>
              <p className="text-sm text-yellow-200">
                Current conditions may not be ideal for spraying. Wind speed: {weatherData?.windSpeed} mph
              </p>
            </div>
            <button
              onClick={() => setShowWeatherAlert(false)}
              className="text-yellow-400 hover:text-yellow-300"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplets className="w-7 h-7 text-blue-400" />
            Spray Application Tracker
          </h1>
          
          {isRecording && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-sm font-medium">Recording</span>
              </div>
              <div className="px-4 py-2 bg-gray-900 rounded-lg">
                <p className="text-2xl font-mono text-white">{formatTime(elapsedTime)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Weather */}
        {weatherData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-400 mb-1">
                <Thermometer className="w-4 h-4" />
                <span className="text-xs">Temperature</span>
              </div>
              <p className="text-lg font-semibold text-white">{weatherData.temperature}°F</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-xs">Humidity</span>
              </div>
              <p className="text-lg font-semibold text-white">{weatherData.humidity}%</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <Wind className="w-4 h-4" />
                <span className="text-xs">Wind Speed</span>
              </div>
              <p className="text-lg font-semibold text-white">{weatherData.windSpeed} mph</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-xs">Direction</span>
              </div>
              <p className="text-lg font-semibold text-white">{weatherData.windDirection}</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Selection */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Beaker className="w-5 h-5 text-green-400" />
          Select Chemical Product
        </h2>
        
        <div className="space-y-3">
          {availableProducts.map(product => (
            <button
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedProduct?.id === product.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.activeIngredient}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getSignalWordColor(product.signalWord)}`}>
                    {product.signalWord}
                  </span>
                  {product.restrictedUse && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-medium">
                      RUP
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">EPA #:</span>
                  <p className="text-gray-300">{product.epaNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500">REI:</span>
                  <p className="text-gray-300">{product.reEntryInterval}h</p>
                </div>
                <div>
                  <span className="text-gray-500">PHI:</span>
                  <p className="text-gray-300">{product.phiDays} days</p>
                </div>
                <div>
                  <span className="text-gray-500">Applications:</span>
                  <p className="text-gray-300">{product.applicationsSoFar}/{product.maxApplicationsPerSeason}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PPE Verification */}
      {selectedProduct && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            PPE Verification
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {Object.entries(selectedProduct.requiredPPE).map(([key, ppe]) => (
              <div key={key} className={`p-3 rounded-lg border ${
                ppe.required 
                  ? ppe.verified 
                    ? 'border-green-600 bg-green-600/10' 
                    : 'border-yellow-600 bg-yellow-600/10'
                  : 'border-gray-700 bg-gray-900'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    {ppe.type && <p className="text-sm text-gray-400">{ppe.type}</p>}
                    {!ppe.required && <p className="text-xs text-gray-500">Not required</p>}
                  </div>
                  
                  {ppe.required && (
                    <button
                      onClick={() => handlePPEVerification(key as keyof PPEChecklist, !ppe.verified)}
                      className={`p-2 rounded-lg transition-colors ${
                        ppe.verified
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {ppe.verified ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className={`p-3 rounded-lg border ${
            ppeVerified 
              ? 'border-green-600 bg-green-600/10' 
              : 'border-yellow-600 bg-yellow-600/10'
          }`}>
            <div className="flex items-center gap-2">
              {ppeVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              <span className={`font-medium ${ppeVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                {ppeVerified ? 'All required PPE verified' : 'Complete PPE verification before starting'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Zone Selection */}
      {selectedProduct && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-400" />
            Application Zones
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {facilitZones.map(zone => (
              <label key={zone} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const zones = application?.zones || [];
                    if (e.target.checked) {
                      setApplication(prev => ({ ...prev!, zones: [...zones, zone] }));
                    } else {
                      setApplication(prev => ({ ...prev!, zones: zones.filter(z => z !== zone) }));
                    }
                  }}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-white">{zone}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Application Controls */}
      {selectedProduct && ppeVerified && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Application Control
          </h2>
          
          <div className="space-y-4">
            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Pest/Disease</label>
                <input
                  type="text"
                  placeholder="e.g., Spider mites, Aphids"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  onChange={(e) => setApplication(prev => ({ ...prev!, targetPest: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Application Method</label>
                <select
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  onChange={(e) => setApplication(prev => ({ ...prev!, applicationMethod: e.target.value as any }))}
                >
                  <option value="">Select method...</option>
                  <option value="foliar">Foliar Spray</option>
                  <option value="soil-drench">Soil Drench</option>
                  <option value="fumigation">Fumigation</option>
                  <option value="granular">Granular Application</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Application Notes</label>
              <textarea
                placeholder="Record application details, conditions, and observations..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
                onChange={(e) => setApplication(prev => ({ ...prev!, notes: e.target.value }))}
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  onClick={handleStartApplication}
                  disabled={!application?.zones?.length || !application?.targetPest}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Application
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsRecording(false)}
                    className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                  
                  <button
                    onClick={handleCompleteApplication}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <StopCircle className="w-5 h-5" />
                    Complete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Re-entry Restrictions */}
      {reentryZones.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Active Re-entry Restrictions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reentryZones.map(zone => (
              <div key={zone} className="bg-red-900/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-red-200">{zone}</span>
                  <span className="text-sm text-red-400">
                    {selectedProduct?.reEntryInterval}h remaining
                  </span>
                </div>
                <p className="text-xs text-red-300 mt-1">
                  No entry until {new Date(Date.now() + (selectedProduct?.reEntryInterval || 0) * 60 * 60 * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
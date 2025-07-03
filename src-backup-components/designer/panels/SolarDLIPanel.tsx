'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  MapPin,
  Calculator,
  Cloud,
  Building,
  Info,
  TrendingUp,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Navigation,
  Zap,
  Search,
  Move
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  SolarDLICalculator, 
  getAvailableLocations,
  type LocationData,
  type SeasonalDLIData
} from '@/lib/solar-dli-calculator';

interface SolarDLIPanelProps {
  onClose: () => void;
}

export function SolarDLIPanel({ onClose }: SolarDLIPanelProps) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Dragging state
  const [position, setPosition] = useState({ x: 4, y: window.innerHeight - 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDocked, setIsDocked] = useState<'left' | 'right' | null>('left');
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Location and DLI state
  const [zipCode, setZipCode] = useState('90210');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [seasonalDLI, setSeasonalDLI] = useState<SeasonalDLIData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Design parameters
  const [designParams, setDesignParams] = useState({
    targetPPFD: 400, // µmol/m²/s
    photoperiod: 16, // hours
    facilityType: 'greenhouse' as 'greenhouse' | 'indoor' | 'shade-house',
    transmissionFactor: 0.70, // 70% for typical greenhouse
    cropType: 'tomatoes',
    growthStage: 'vegetative'
  });
  
  // Transmission factors for different greenhouse types
  const transmissionFactors = {
    'single-poly': 0.85,
    'double-poly': 0.75,
    'double-poly-ir': 0.72,
    'glass': 0.70,
    'low-iron-glass': 0.90,
    'diffused-glass': 0.65,
    'polycarbonate-8mm': 0.80,
    'polycarbonate-16mm': 0.65,
    'acrylic': 0.83,
    'fiberglass': 0.60,
    'shade-cloth-30': 0.70,
    'shade-cloth-50': 0.50,
    'shade-cloth-70': 0.30,
    'energy-screen': 0.55,
    'thermal-screen': 0.45,
    'aluminized-screen': 0.25,
    'indoor': 0.00
  };
  
  // Crop light requirements
  const cropRequirements = {
    // Leafy Greens
    'lettuce': { seedling: 150, vegetative: 200, flowering: 250 },
    'spinach': { seedling: 150, vegetative: 200, flowering: 250 },
    'kale': { seedling: 200, vegetative: 300, flowering: 350 },
    'arugula': { seedling: 150, vegetative: 200, flowering: 250 },
    'swiss-chard': { seedling: 200, vegetative: 250, flowering: 300 },
    // Fruiting Crops
    'tomatoes': { seedling: 250, vegetative: 400, flowering: 600 },
    'peppers': { seedling: 250, vegetative: 400, flowering: 600 },
    'cucumbers': { seedling: 250, vegetative: 400, flowering: 600 },
    'eggplant': { seedling: 250, vegetative: 400, flowering: 550 },
    'zucchini': { seedling: 200, vegetative: 350, flowering: 500 },
    // Berries
    'strawberries': { seedling: 200, vegetative: 300, flowering: 400 },
    'blueberries': { seedling: 150, vegetative: 250, flowering: 350 },
    'raspberries': { seedling: 200, vegetative: 300, flowering: 400 },
    // Herbs
    'basil': { seedling: 200, vegetative: 300, flowering: 400 },
    'cilantro': { seedling: 200, vegetative: 250, flowering: 300 },
    'parsley': { seedling: 150, vegetative: 200, flowering: 250 },
    'oregano': { seedling: 200, vegetative: 300, flowering: 350 },
    'thyme': { seedling: 200, vegetative: 300, flowering: 350 },
    'rosemary': { seedling: 250, vegetative: 350, flowering: 400 },
    'mint': { seedling: 200, vegetative: 300, flowering: 350 },
    // Specialty Crops
    'cannabis': { seedling: 300, vegetative: 500, flowering: 800 },
    'hemp': { seedling: 250, vegetative: 400, flowering: 600 },
    'microgreens': { seedling: 100, vegetative: 150, flowering: 200 },
    'wheatgrass': { seedling: 150, vegetative: 200, flowering: 250 },
    // Flowers
    'roses': { seedling: 250, vegetative: 400, flowering: 600 },
    'chrysanthemum': { seedling: 200, vegetative: 350, flowering: 500 },
    'gerbera': { seedling: 250, vegetative: 400, flowering: 600 },
    'orchids': { seedling: 150, vegetative: 200, flowering: 300 }
  };

  // Calculate target DLI based on PPFD and photoperiod
  const targetDLI = (designParams.targetPPFD * designParams.photoperiod * 3.6) / 1000;

  // Search for location by zip code
  const searchLocation = () => {
    try {
      const locationData = SolarDLICalculator.getLocationByZipCode(zipCode);
      if (locationData) {
        setLocation(locationData);
        const dliData = SolarDLICalculator.calculateSeasonalDLI(locationData);
        setSeasonalDLI(dliData);
        showNotification('success', `Location found: ${locationData.city}, ${locationData.state}`);
      } else {
        showNotification('warning', 'Location not found. Using default data.');
      }
    } catch (error) {
      console.error('Error loading location data:', error);
      showNotification('error', 'Error searching for location');
    }
  };
  
  // Load initial location data
  useEffect(() => {
    searchLocation();
  }, []);
  
  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      e.preventDefault();
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      
      // Check docking zones
      const rightEdge = window.innerWidth - (panelRef.current?.offsetWidth || 384);
      const isNearRightDock = newX > rightEdge - 50;
      const isNearLeftDock = newX < 50;
      
      if (isNearRightDock) {
        setPosition({ x: rightEdge - 28, y: newY });
        setIsDocked('right');
      } else if (isNearLeftDock) {
        setPosition({ x: 4, y: newY });
        setIsDocked('left');
      } else {
        setPosition({ x: newX, y: newY });
        setIsDocked(null);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  // Get natural DLI for selected month
  const monthlyDLI = seasonalDLI.find(d => d.month === selectedMonth);
  const naturalDLI = monthlyDLI ? monthlyDLI.averageDLI * designParams.transmissionFactor : 0;
  const supplementalDLI = Math.max(0, targetDLI - naturalDLI);
  const supplementalPPFD = supplementalDLI > 0 ? (supplementalDLI * 1000) / (designParams.photoperiod * 3.6) : 0;
  
  // Calculate energy requirements
  const fixtureEfficiency = 2.7; // µmol/J for modern LEDs
  const requiredWattage = supplementalPPFD / fixtureEfficiency;
  const dailyEnergy = (requiredWattage * designParams.photoperiod) / 1000; // kWh/m²/day
  const monthlyEnergy = dailyEnergy * 30; // kWh/m²/month
  const energyCost = monthlyEnergy * 0.12; // $0.12/kWh average
  
  // Handle geolocation
  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode to get zip code
          showNotification('info', `Location: ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
        },
        (error) => {
          showNotification('error', 'Could not get your location');
        }
      );
    }
  };
  
  // Update crop PPFD based on selection
  const updateCropRequirements = (crop: string, stage: string) => {
    const requirements = cropRequirements[crop as keyof typeof cropRequirements];
    if (requirements) {
      const ppfd = requirements[stage as keyof typeof requirements];
      setDesignParams({
        ...designParams,
        cropType: crop,
        growthStage: stage,
        targetPPFD: ppfd
      });
    }
  };

  const exportCalculations = () => {
    const report = {
      location: {
        zipCode,
        city: location?.city,
        state: location?.state,
        latitude: location?.latitude,
        longitude: location?.longitude
      },
      designParameters: {
        ...designParams,
        targetDLI
      },
      calculations: {
        naturalDLI,
        supplementalDLI,
        supplementalPPFD,
        requiredWattage,
        monthlyEnergy,
        monthlyCost: energyCost
      },
      seasonalData: seasonalDLI,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar_dli_analysis_${zipCode}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Solar DLI analysis exported');
  };
  
  // Apply supplemental lighting to design
  const applyToDesign = () => {
    // Calculate number of fixtures needed based on current room
    if (!state.room?.width || !state.room?.length) {
      showNotification('error', 'Please configure room dimensions first');
      return;
    }
    const roomArea = (state.room.width * state.room.length) / 10.764; // convert sq ft to m²
    const totalPPFRequired = supplementalPPFD * roomArea;
    const fixturesNeeded = Math.ceil(totalPPFRequired / 600); // Assuming 600 PPF per fixture
    
    showNotification('info', `You need approximately ${fixturesNeeded} fixtures for supplemental lighting`);
    
    // Could dispatch an action to automatically place fixtures
    // dispatch({ type: 'AUTO_PLACE_FIXTURES', payload: { count: fixturesNeeded, ppfd: supplementalPPFD } });
  };

  if (isMinimized) {
    return (
      <div 
        ref={panelRef}
        className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-2xl p-2 cursor-move"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.3s ease'
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 text-white hover:text-yellow-400"
        >
          <Sun className="w-5 h-5" />
          <span className="text-sm font-medium">Solar DLI Calculator</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className="fixed w-96 max-h-[80vh] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.3s ease',
        boxShadow: isDocked ? '0 0 20px rgba(168, 85, 247, 0.4)' : undefined
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-600/20 rounded-lg">
            <Sun className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="drag-handle cursor-move">
            <h3 className="text-white font-semibold">Solar DLI Calculator</h3>
            <p className="text-xs text-gray-400">NASA data-powered analysis</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            className="drag-handle p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-move"
            title="Drag to move"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Location Input */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            Location
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">ZIP Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="Enter ZIP code"
                />
                <button
                  onClick={searchLocation}
                  className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  title="Search location"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGeolocation}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  title="Use current location"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
            {location && (
              <div className="text-sm text-gray-400">
                {location.city}, {location.state} • {location.latitude.toFixed(2)}°N, {Math.abs(location.longitude).toFixed(2)}°W
              </div>
            )}
          </div>
        </div>

        {/* Natural Light Analysis */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            Natural Light Analysis
          </h4>
          
          {/* Month Selector */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <option key={i} value={i + 1}>{month}</option>
              ))}
            </select>
          </div>
          
          {/* DLI Chart */}
          {seasonalDLI.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 mb-2">
                {seasonalDLI.map((month) => (
                  <div
                    key={month.month}
                    className={`text-center cursor-pointer ${
                      month.month === selectedMonth ? 'ring-2 ring-yellow-400 rounded' : ''
                    }`}
                    onClick={() => setSelectedMonth(month.month)}
                  >
                    <div className="text-xs text-gray-500">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][month.month - 1]}
                    </div>
                    <div
                      className="h-12 bg-gradient-to-t from-gray-700 to-yellow-600 rounded"
                      style={{ height: `${(month.averageDLI / 60) * 48}px` }}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {month.averageDLI.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 text-center">
                Average DLI (mol/m²/day)
              </div>
            </div>
          )}
        </div>

        {/* Greenhouse Settings */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-green-400" />
            Facility Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Facility Type</label>
              <select
                value={designParams.facilityType}
                onChange={(e) => {
                  const type = e.target.value as typeof designParams.facilityType;
                  setDesignParams({
                    ...designParams,
                    facilityType: type,
                    transmissionFactor: type === 'indoor' ? 0 : designParams.transmissionFactor
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="greenhouse">Greenhouse</option>
                <option value="shade-house">Shade House</option>
                <option value="indoor">Indoor (No Natural Light)</option>
              </select>
            </div>
            
            {designParams.facilityType !== 'indoor' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Covering Material</label>
                <select
                  value={designParams.transmissionFactor}
                  onChange={(e) => setDesignParams({...designParams, transmissionFactor: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <optgroup label="Polyethylene">
                    <option value={0.85}>Single Polyethylene (85%)</option>
                    <option value={0.75}>Double Polyethylene (75%)</option>
                    <option value={0.72}>Double Poly IR/AC (72%)</option>
                  </optgroup>
                  <optgroup label="Glass">
                    <option value={0.70}>Standard Glass (70%)</option>
                    <option value={0.90}>Low-Iron Glass (90%)</option>
                    <option value={0.65}>Diffused Glass (65%)</option>
                  </optgroup>
                  <optgroup label="Rigid Plastics">
                    <option value={0.80}>Polycarbonate 8mm (80%)</option>
                    <option value={0.65}>Polycarbonate 16mm (65%)</option>
                    <option value={0.83}>Acrylic (83%)</option>
                    <option value={0.60}>Fiberglass (60%)</option>
                  </optgroup>
                  <optgroup label="Shade Materials">
                    <option value={0.70}>30% Shade Cloth (70%)</option>
                    <option value={0.50}>50% Shade Cloth (50%)</option>
                    <option value={0.30}>70% Shade Cloth (30%)</option>
                  </optgroup>
                  <optgroup label="Energy/Thermal Screens">
                    <option value={0.55}>Energy Screen (55%)</option>
                    <option value={0.45}>Thermal Screen (45%)</option>
                    <option value={0.25}>Aluminized Screen (25%)</option>
                  </optgroup>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Crop Requirements */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            Design Requirements
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Crop Type</label>
                <select
                  value={designParams.cropType}
                  onChange={(e) => updateCropRequirements(e.target.value, designParams.growthStage)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <optgroup label="Leafy Greens">
                    <option value="lettuce">Lettuce</option>
                    <option value="spinach">Spinach</option>
                    <option value="kale">Kale</option>
                    <option value="arugula">Arugula</option>
                    <option value="swiss-chard">Swiss Chard</option>
                  </optgroup>
                  <optgroup label="Fruiting Crops">
                    <option value="tomatoes">Tomatoes</option>
                    <option value="peppers">Peppers</option>
                    <option value="cucumbers">Cucumbers</option>
                    <option value="eggplant">Eggplant</option>
                    <option value="zucchini">Zucchini</option>
                  </optgroup>
                  <optgroup label="Berries">
                    <option value="strawberries">Strawberries</option>
                    <option value="blueberries">Blueberries</option>
                    <option value="raspberries">Raspberries</option>
                  </optgroup>
                  <optgroup label="Herbs">
                    <option value="basil">Basil</option>
                    <option value="cilantro">Cilantro</option>
                    <option value="parsley">Parsley</option>
                    <option value="oregano">Oregano</option>
                    <option value="thyme">Thyme</option>
                    <option value="rosemary">Rosemary</option>
                    <option value="mint">Mint</option>
                  </optgroup>
                  <optgroup label="Specialty Crops">
                    <option value="cannabis">Cannabis</option>
                    <option value="hemp">Hemp</option>
                    <option value="microgreens">Microgreens</option>
                    <option value="wheatgrass">Wheatgrass</option>
                  </optgroup>
                  <optgroup label="Flowers">
                    <option value="roses">Roses</option>
                    <option value="chrysanthemum">Chrysanthemum</option>
                    <option value="gerbera">Gerbera</option>
                    <option value="orchids">Orchids</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Growth Stage</label>
                <select
                  value={designParams.growthStage}
                  onChange={(e) => updateCropRequirements(designParams.cropType, e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Target PPFD (µmol/m²/s)</label>
                <input
                  type="number"
                  value={designParams.targetPPFD}
                  onChange={(e) => setDesignParams({...designParams, targetPPFD: Number(e.target.value)})}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Photoperiod (hours)</label>
                <input
                  type="number"
                  value={designParams.photoperiod}
                  onChange={(e) => setDesignParams({...designParams, photoperiod: Number(e.target.value)})}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  min="0"
                  max="24"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              Target DLI: <span className="text-white font-medium">{targetDLI.toFixed(1)} mol/m²/day</span>
            </div>
          </div>
        </div>

        {/* Supplemental Lighting Calculation */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Supplemental Lighting Requirements
          </h4>
          
          {/* DLI Breakdown */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Natural DLI:</span>
                <span className="text-green-400">{naturalDLI.toFixed(1)} mol/m²/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Target DLI:</span>
                <span className="text-white">{targetDLI.toFixed(1)} mol/m²/day</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Supplemental DLI:</span>
                <span className="text-yellow-400">{supplementalDLI.toFixed(1)} mol/m²/day</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-green-600"
                style={{ width: `${Math.min((naturalDLI / targetDLI) * 100, 100)}%` }}
              />
              <div
                className="absolute h-full bg-yellow-600"
                style={{ 
                  left: `${Math.min((naturalDLI / targetDLI) * 100, 100)}%`,
                  width: `${Math.min((supplementalDLI / targetDLI) * 100, 100 - (naturalDLI / targetDLI) * 100)}%` 
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {((naturalDLI / targetDLI) * 100).toFixed(0)}% Natural
              </div>
            </div>
            
            {/* Required PPFD */}
            {supplementalDLI > 0 && (
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Required PPFD:</span>
                  <span className="text-white font-medium">{supplementalPPFD.toFixed(0)} µmol/m²/s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Power Density:</span>
                  <span className="text-white">{requiredWattage.toFixed(0)} W/m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Energy:</span>
                  <span className="text-white">{monthlyEnergy.toFixed(0)} kWh/m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly Cost:</span>
                  <span className="text-white">${energyCost.toFixed(2)}/m²</span>
                </div>
              </div>
            )}
            
            {supplementalDLI === 0 && (
              <div className="text-sm text-green-400 text-center py-2">
                <Info className="w-4 h-4 inline mr-1" />
                Natural light meets target requirements!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {supplementalDLI > 0 && (
          <button
            onClick={applyToDesign}
            className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Apply {supplementalPPFD.toFixed(0)} PPFD to Design
          </button>
        )}
        <button
          onClick={exportCalculations}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Analysis
        </button>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf, Calendar, Droplets, Thermometer, Sun,
  TrendingUp, DollarSign, Clock, Info, Settings,
  ChevronRight, BarChart3, Zap, Target
} from 'lucide-react';
import { CROP_MODELS, LIGHT_RECIPES, CropGrowthCalculator, type CropModel, type CropGrowthStage } from '@/lib/crop-growth-models';

interface CropGrowthManagerProps {
  selectedCrop?: string;
  growArea: number;
  currentDLI?: number;
  onStageChange?: (stage: CropGrowthStage) => void;
}

export function CropGrowthManager({
  selectedCrop = 'lettuce_butterhead',
  growArea = 100,
  currentDLI = 17,
  onStageChange
}: CropGrowthManagerProps) {
  const [crop, setCrop] = useState<CropModel>(CROP_MODELS[selectedCrop]);
  const [plantingDate, setPlantingDate] = useState(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)); // 14 days ago
  const [currentStageInfo, setCurrentStageInfo] = useState<ReturnType<typeof CropGrowthCalculator.calculateCurrentStage>>();
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate days since planting
  const daysSincePlanting = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const stageInfo = CropGrowthCalculator.calculateCurrentStage(crop, daysSincePlanting);
    setCurrentStageInfo(stageInfo);
    
    if (onStageChange) {
      onStageChange(stageInfo.stage);
    }
  }, [crop, daysSincePlanting, onStageChange]);

  const expectedYield = CropGrowthCalculator.calculateExpectedYield(
    crop,
    currentDLI || 0,
    currentStageInfo?.stage.dliTarget || 17,
    growArea
  );

  const waterUsage = currentStageInfo ? 
    CropGrowthCalculator.calculateWaterUsage(
      crop,
      currentStageInfo.stage,
      crop.plantDensity * growArea
    ) : 0;

  const nutrients = currentStageInfo ?
    CropGrowthCalculator.calculateNutrientRequirements(
      crop,
      currentStageInfo.stage,
      waterUsage
    ) : null;

  const getStageProgress = (stageIndex: number) => {
    let cumulativeDays = 0;
    for (let i = 0; i < stageIndex; i++) {
      cumulativeDays += crop.stages[i].duration;
    }
    
    if (daysSincePlanting < cumulativeDays) return 0;
    if (daysSincePlanting >= cumulativeDays + crop.stages[stageIndex].duration) return 100;
    
    return ((daysSincePlanting - cumulativeDays) / crop.stages[stageIndex].duration) * 100;
  };

  const applicableRecipes = LIGHT_RECIPES.filter(recipe => 
    recipe.cropIds.includes(crop.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-500" />
          Crop Growth Management
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {showDetails ? 'Hide' : 'Show'} Details
          <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Crop Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Crop
        </label>
        <select
          value={crop.id}
          onChange={(e) => setCrop(CROP_MODELS[e.target.value])}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {Object.values(CROP_MODELS).map(model => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.scientificName})
            </option>
          ))}
        </select>
      </div>

      {/* Current Stage Info */}
      {currentStageInfo && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-green-800">
              Current Stage: {currentStageInfo.stage.name}
            </h4>
            <span className="text-sm text-green-600">
              Day {currentStageInfo.daysInStage} of {currentStageInfo.stage.duration}
            </span>
          </div>
          <div className="text-sm text-green-700">
            {currentStageInfo.daysRemaining} days remaining in this stage
          </div>
        </div>
      )}

      {/* Growth Timeline */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          Growth Timeline
        </h4>
        <div className="space-y-2">
          {crop.stages.map((stage, index) => {
            const progress = getStageProgress(index);
            const isCurrentStage = currentStageInfo?.stage.name === stage.name;
            
            return (
              <div key={index} className="relative">
                <div className="flex items-center gap-3">
                  <div className={`w-32 text-sm ${isCurrentStage ? 'font-semibold' : ''}`}>
                    {stage.name}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCurrentStage ? 'bg-green-500' : 'bg-green-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {stage.duration} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-sm text-gray-600 text-right">
          Total cycle: {crop.totalCycleDays} days
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-sm text-gray-600">Expected Yield</p>
          <p className="text-lg font-semibold">{expectedYield.toFixed(1)} kg</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-sm text-gray-600">Water/Day</p>
          <p className="text-lg font-semibold">{waterUsage.toFixed(1)} L</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Sun className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-sm text-gray-600">Target DLI</p>
          <p className="text-lg font-semibold">{currentStageInfo?.stage.dliTarget || 0}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-sm text-gray-600">Value/kg</p>
          <p className="text-lg font-semibold">${crop.economicValue}</p>
        </div>
      </div>

      {/* Stage Requirements */}
      {showDetails && currentStageInfo && (
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Current Stage Requirements
            </h5>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Light</p>
                <p className="font-semibold">{currentStageInfo.stage.ppfdTarget} μmol/m²/s</p>
                <p className="text-xs text-gray-500">{currentStageInfo.stage.photoperiod}h photoperiod</p>
              </div>
              <div>
                <p className="text-gray-600">Temperature</p>
                <p className="font-semibold">
                  {currentStageInfo.stage.temperature.day}°C day / {currentStageInfo.stage.temperature.night}°C night
                </p>
              </div>
              <div>
                <p className="text-gray-600">Humidity</p>
                <p className="font-semibold">
                  {currentStageInfo.stage.humidity.min}-{currentStageInfo.stage.humidity.max}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">CO₂</p>
                <p className="font-semibold">{currentStageInfo.stage.co2Target} ppm</p>
              </div>
              <div>
                <p className="text-gray-600">VPD</p>
                <p className="font-semibold">
                  {currentStageInfo.stage.vpd.min}-{currentStageInfo.stage.vpd.max} kPa
                </p>
              </div>
              <div>
                <p className="text-gray-600">EC/pH</p>
                <p className="font-semibold">
                  {currentStageInfo.stage.ecTarget} mS/cm @ pH {currentStageInfo.stage.phTarget}
                </p>
              </div>
            </div>

            {/* Spectrum Requirements */}
            <div className="mt-4">
              <p className="text-gray-600 mb-2">Spectrum Requirements</p>
              <div className="flex gap-1">
                <div 
                  className="h-6 bg-blue-500 flex items-center justify-center text-xs text-white"
                  style={{ width: `${currentStageInfo.stage.spectrum.blue}%` }}
                >
                  {currentStageInfo.stage.spectrum.blue}%
                </div>
                <div 
                  className="h-6 bg-green-500 flex items-center justify-center text-xs text-white"
                  style={{ width: `${currentStageInfo.stage.spectrum.green}%` }}
                >
                  {currentStageInfo.stage.spectrum.green}%
                </div>
                <div 
                  className="h-6 bg-red-500 flex items-center justify-center text-xs text-white"
                  style={{ width: `${currentStageInfo.stage.spectrum.red}%` }}
                >
                  {currentStageInfo.stage.spectrum.red}%
                </div>
                <div 
                  className="h-6 bg-red-700 flex items-center justify-center text-xs text-white"
                  style={{ width: `${currentStageInfo.stage.spectrum.farRed}%` }}
                >
                  {currentStageInfo.stage.spectrum.farRed}%
                </div>
                {currentStageInfo.stage.spectrum.uv > 0 && (
                  <div 
                    className="h-6 bg-purple-600 flex items-center justify-center text-xs text-white"
                    style={{ width: `${currentStageInfo.stage.spectrum.uv}%` }}
                  >
                    {currentStageInfo.stage.spectrum.uv}%
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Blue</span>
                <span>Green</span>
                <span>Red</span>
                <span>Far-Red</span>
                {currentStageInfo.stage.spectrum.uv > 0 && <span>UV</span>}
              </div>
            </div>
          </div>

          {/* Nutrient Requirements */}
          {nutrients && (
            <div className="p-4 bg-amber-50 rounded-lg">
              <h5 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Nutrient Solution
              </h5>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">N</p>
                  <p className="font-semibold">{nutrients.nitrogen.toFixed(0)} mg/L</p>
                </div>
                <div>
                  <p className="text-gray-600">P</p>
                  <p className="font-semibold">{nutrients.phosphorus.toFixed(0)} mg/L</p>
                </div>
                <div>
                  <p className="text-gray-600">K</p>
                  <p className="font-semibold">{nutrients.potassium.toFixed(0)} mg/L</p>
                </div>
                <div>
                  <p className="text-gray-600">Ca</p>
                  <p className="font-semibold">{nutrients.calcium.toFixed(0)} mg/L</p>
                </div>
                <div>
                  <p className="text-gray-600">Mg</p>
                  <p className="font-semibold">{nutrients.magnesium.toFixed(0)} mg/L</p>
                </div>
                <div>
                  <p className="text-gray-600">S</p>
                  <p className="font-semibold">{nutrients.sulfur.toFixed(0)} mg/L</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Light Recipes */}
      {applicableRecipes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Available Light Recipes
          </h4>
          <div className="space-y-2">
            {applicableRecipes.map(recipe => (
              <div
                key={recipe.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedRecipe === recipe.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRecipe(recipe.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{recipe.name}</h5>
                    <p className="text-sm text-gray-600">{recipe.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {recipe.energySaving > 0 ? '+' : ''}{recipe.energySaving}% energy
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      {recipe.yieldImprovement > 0 ? '+' : ''}{recipe.yieldImprovement}% yield
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Requirements */}
      {crop.specialRequirements.length > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Special Requirements
          </h5>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {crop.specialRequirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
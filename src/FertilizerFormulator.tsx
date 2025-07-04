'use client';

import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  Calculator, 
  Droplets, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  Save,
  Info,
  Plus,
  Minus,
  Target,
  FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';

interface NutrientTargets {
  N: number;
  P: number;
  K: number;
  Ca: number;
  Mg: number;
  S: number;
  Fe: number;
  Mn: number;
  B: number;
  Zn: number;
  Cu: number;
  Mo: number;
}

interface FertilizerCompound {
  id: string;
  name: string;
  formula: string;
  nutrients: Partial<NutrientTargets>;
  cost?: number; // $/kg
  solubility: number; // g/L at 20°C
}

interface WaterAnalysis extends Partial<NutrientTargets> {}

export function FertilizerFormulator() {
  // Fertilizer database based on Excel file
  const fertilizerDatabase: FertilizerCompound[] = [
    { id: 'can', name: 'Calcium Nitrate', formula: 'Ca(NO₃)₂', nutrients: { N: 15.5, Ca: 19 }, solubility: 1212 },
    { id: 'kno3', name: 'Potassium Nitrate', formula: 'KNO₃', nutrients: { N: 13, K: 38 }, solubility: 316 },
    { id: 'map', name: 'Monoammonium Phosphate', formula: 'NH₄H₂PO₄', nutrients: { N: 12, P: 27 }, solubility: 374 },
    { id: 'mkp', name: 'Monopotassium Phosphate', formula: 'KH₂PO₄', nutrients: { P: 22.7, K: 28.2 }, solubility: 226 },
    { id: 'mgso4', name: 'Magnesium Sulfate', formula: 'MgSO₄·7H₂O', nutrients: { Mg: 9.8, S: 13 }, solubility: 710 },
    { id: 'kcl', name: 'Potassium Chloride', formula: 'KCl', nutrients: { K: 50 }, solubility: 347 },
    { id: 'k2so4', name: 'Potassium Sulfate', formula: 'K₂SO₄', nutrients: { K: 43, S: 18 }, solubility: 111 },
    { id: 'fe-edta', name: 'Iron EDTA', formula: 'Fe-EDTA', nutrients: { Fe: 13 }, solubility: 100 },
    { id: 'fe-dtpa', name: 'Iron DTPA', formula: 'Fe-DTPA', nutrients: { Fe: 10 }, solubility: 80 },
    { id: 'mnso4', name: 'Manganese Sulfate', formula: 'MnSO₄·H₂O', nutrients: { Mn: 32.5, S: 19 }, solubility: 700 },
    { id: 'znso4', name: 'Zinc Sulfate', formula: 'ZnSO₄·7H₂O', nutrients: { Zn: 22.7, S: 11.1 }, solubility: 965 },
    { id: 'cuso4', name: 'Copper Sulfate', formula: 'CuSO₄·5H₂O', nutrients: { Cu: 25.5, S: 12.8 }, solubility: 203 },
    { id: 'h3bo3', name: 'Boric Acid', formula: 'H₃BO₃', nutrients: { B: 17.5 }, solubility: 49 },
    { id: 'na2mo4', name: 'Sodium Molybdate', formula: 'Na₂MoO₄·2H₂O', nutrients: { Mo: 39.7 }, solubility: 840 }
  ];

  // State
  const [tankVolume, setTankVolume] = useState(1000); // liters
  const [useInjector, setUseInjector] = useState(false);
  const [injectorRatio, setInjectorRatio] = useState(200); // 1:200
  const [cropType, setCropType] = useState('tomato');
  
  // Nutrient targets (PPM)
  const [targets, setTargets] = useState<NutrientTargets>({
    N: 150, P: 50, K: 200, Ca: 150, Mg: 50, S: 60,
    Fe: 2, Mn: 0.5, B: 0.3, Zn: 0.3, Cu: 0.05, Mo: 0.05
  });
  
  // Water analysis (existing PPM)
  const [waterAnalysis, setWaterAnalysis] = useState<WaterAnalysis>({
    Ca: 40, Mg: 10, S: 20
  });
  
  // Fertilizer amounts (grams)
  const [fertilizerAmounts, setFertilizerAmounts] = useState<Record<string, number>>({});
  
  // Calculate achieved nutrients
  const calculateAchievedNutrients = (): NutrientTargets => {
    const achieved: NutrientTargets = {
      N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0,
      Fe: 0, Mn: 0, B: 0, Zn: 0, Cu: 0, Mo: 0
    };
    
    // Add water nutrients
    Object.entries(waterAnalysis).forEach(([nutrient, value]) => {
      if (nutrient in achieved) {
        achieved[nutrient as keyof NutrientTargets] = Number(value) || 0;
      }
    });
    
    // Add fertilizer contributions
    Object.entries(fertilizerAmounts).forEach(([fertilizerId, grams]) => {
      const fertilizer = fertilizerDatabase.find(f => f.id === fertilizerId);
      if (fertilizer && grams > 0) {
        Object.entries(fertilizer.nutrients).forEach(([nutrient, percentage]) => {
          if (nutrient in achieved && percentage) {
            const volume = useInjector ? tankVolume / injectorRatio : tankVolume;
            const ppm = (grams * percentage * 10) / volume;
            achieved[nutrient as keyof NutrientTargets] += ppm;
          }
        });
      }
    });
    
    return achieved;
  };
  
  const achieved = calculateAchievedNutrients();
  
  // Calculate total cost
  const calculateTotalCost = (): number => {
    return Object.entries(fertilizerAmounts).reduce((total, [fertilizerId, grams]) => {
      const fertilizer = fertilizerDatabase.find(f => f.id === fertilizerId);
      if (fertilizer?.cost) {
        return total + (grams / 1000) * fertilizer.cost;
      }
      return total;
    }, 0);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(24);
    pdf.setTextColor(79, 70, 229); // Purple color
    pdf.text('Fertilizer Formulation Report', 20, 20);
    
    // Add date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add crop type
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Crop Type: ${cropType.charAt(0).toUpperCase() + cropType.slice(1)}`, 20, 45);
    
    // Add target nutrients section
    pdf.setFontSize(16);
    pdf.text('Target Nutrients (ppm)', 20, 60);
    
    pdf.setFontSize(12);
    let yPos = 70;
    pdf.text(`Nitrogen (N): ${targets.N} ppm`, 25, yPos);
    pdf.text(`Phosphorus (P): ${targets.P} ppm`, 25, yPos + 7);
    pdf.text(`Potassium (K): ${targets.K} ppm`, 25, yPos + 14);
    pdf.text(`Calcium (Ca): ${targets.Ca} ppm`, 100, yPos);
    pdf.text(`Magnesium (Mg): ${targets.Mg} ppm`, 100, yPos + 7);
    pdf.text(`Sulfur (S): ${targets.S} ppm`, 100, yPos + 14);
    
    // Add micronutrients
    yPos += 28;
    pdf.text(`Iron (Fe): ${targets.Fe} ppm`, 25, yPos);
    pdf.text(`Manganese (Mn): ${targets.Mn} ppm`, 25, yPos + 7);
    pdf.text(`Boron (B): ${targets.B} ppm`, 25, yPos + 14);
    pdf.text(`Zinc (Zn): ${targets.Zn} ppm`, 100, yPos);
    pdf.text(`Copper (Cu): ${targets.Cu} ppm`, 100, yPos + 7);
    pdf.text(`Molybdenum (Mo): ${targets.Mo} ppm`, 100, yPos + 14);
    
    // Add tank configuration
    yPos += 28;
    pdf.setFontSize(16);
    pdf.text('Tank Configuration', 20, yPos);
    
    pdf.setFontSize(12);
    yPos += 10;
    pdf.text(`Tank Volume: ${tankVolume} liters`, 25, yPos);
    if (useInjector) {
      pdf.text(`Using Injector: Yes (1:${injectorRatio} ratio)`, 25, yPos + 7);
      pdf.text(`Stock Solution Volume: ${(tankVolume / injectorRatio).toFixed(1)} liters`, 25, yPos + 14);
    } else {
      pdf.text(`Using Injector: No (Direct application)`, 25, yPos + 7);
    }
    
    // Add water analysis if any
    if ((waterAnalysis.Ca || 0) > 0 || (waterAnalysis.Mg || 0) > 0 || (waterAnalysis.S || 0) > 0) {
      yPos += 21;
      pdf.setFontSize(14);
      pdf.text('Water Analysis (ppm)', 25, yPos);
      pdf.setFontSize(12);
      yPos += 7;
      pdf.text(`Calcium: ${waterAnalysis.Ca} ppm`, 30, yPos);
      pdf.text(`Magnesium: ${waterAnalysis.Mg} ppm`, 30, yPos + 7);
      pdf.text(`Sulfur: ${waterAnalysis.S} ppm`, 30, yPos + 14);
    }
    
    // Add fertilizer recipe
    yPos += 28;
    pdf.setFontSize(16);
    pdf.text('Fertilizer Recipe', 20, yPos);
    
    pdf.setFontSize(12);
    yPos += 10;
    
    const multiplier = useInjector ? tankVolume / injectorRatio : tankVolume;
    
    Object.entries(fertilizerAmounts).forEach(([fertilizerId, amount]) => {
      if (amount > 0) {
        const fertilizer = fertilizerDatabase.find(f => f.id === fertilizerId);
        if (fertilizer) {
          const totalAmount = (amount * multiplier / 1000).toFixed(2);
          pdf.text(`${fertilizer.name}: ${totalAmount} g`, 25, yPos);
          yPos += 7;
        }
      }
    });
    
    // Add cost info
    const totalCost = calculateTotalCost();
    if (totalCost > 0) {
      yPos += 7;
      pdf.setFontSize(14);
      pdf.text('Cost Analysis', 20, yPos);
      pdf.setFontSize(12);
      yPos += 7;
      pdf.text(`Total Cost: $${totalCost.toFixed(2)}`, 25, yPos);
      pdf.text(`Cost per liter: $${(totalCost / tankVolume).toFixed(4)}`, 25, yPos + 7);
    }
    
    // Add achieved nutrients
    const achieved = calculateAchievedNutrients();
    yPos += 21;
    pdf.setFontSize(14);
    pdf.text('Achieved Nutrients (ppm)', 20, yPos);
    pdf.setFontSize(12);
    yPos += 7;
    pdf.text(`N: ${achieved.N.toFixed(1)} | P: ${achieved.P.toFixed(1)} | K: ${achieved.K.toFixed(1)}`, 25, yPos);
    pdf.text(`Ca: ${achieved.Ca.toFixed(1)} | Mg: ${achieved.Mg.toFixed(1)} | S: ${achieved.S.toFixed(1)}`, 25, yPos + 7);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by Vibelux Fertilizer Calculator', 20, 280);
    
    // Save the PDF
    pdf.save(`fertilizer-recipe-${cropType}-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  const handleFertilizerChange = (fertilizerId: string, delta: number) => {
    setFertilizerAmounts(prev => ({
      ...prev,
      [fertilizerId]: Math.max(0, (prev[fertilizerId] || 0) + delta)
    }));
  };
  
  // Get achievement status for a nutrient
  const getAchievementStatus = (achieved: number, target: number) => {
    const ratio = achieved / target;
    if (ratio < 0.9) return { color: 'text-yellow-400', icon: Minus, status: 'low' };
    if (ratio > 1.1) return { color: 'text-orange-400', icon: Plus, status: 'high' };
    return { color: 'text-green-400', icon: CheckCircle, status: 'optimal' };
  };

  // Preset recipes
  const presetRecipes = {
    tomato: { N: 150, P: 50, K: 200, Ca: 150, Mg: 50, S: 60, Fe: 2, Mn: 0.5, B: 0.3, Zn: 0.3, Cu: 0.05, Mo: 0.05 },
    lettuce: { N: 100, P: 30, K: 150, Ca: 100, Mg: 30, S: 40, Fe: 2, Mn: 0.5, B: 0.3, Zn: 0.3, Cu: 0.05, Mo: 0.05 },
    cannabis: { N: 180, P: 60, K: 240, Ca: 160, Mg: 60, S: 80, Fe: 3, Mn: 0.8, B: 0.5, Zn: 0.5, Cu: 0.1, Mo: 0.08 }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg shadow-green-500/20 mb-4">
          <Beaker className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Liquid Fertilizer Formulator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create precise nutrient solutions based on your water analysis and crop requirements
        </p>
      </div>

      {/* Configuration */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* System Setup */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            System Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Crop Type</label>
              <select
                value={cropType}
                onChange={(e) => {
                  setCropType(e.target.value);
                  setTargets(presetRecipes[e.target.value as keyof typeof presetRecipes]);
                }}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="tomato">Tomato</option>
                <option value="lettuce">Lettuce</option>
                <option value="cannabis">Cannabis</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Tank Volume (L)</label>
              <input
                type="number"
                value={tankVolume}
                onChange={(e) => setTankVolume(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="useInjector"
                checked={useInjector}
                onChange={(e) => setUseInjector(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
              />
              <label htmlFor="useInjector" className="text-sm text-gray-300">
                Use Injector System
              </label>
            </div>
            
            {useInjector && (
              <div>
                <label className="text-sm text-gray-400">Injector Ratio (1:X)</label>
                <input
                  type="number"
                  value={injectorRatio}
                  onChange={(e) => setInjectorRatio(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Water Analysis */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            Water Analysis (PPM)
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries({ Ca: 'Calcium', Mg: 'Magnesium', S: 'Sulfur' }).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-gray-400">{label}</label>
                <input
                  type="number"
                  value={waterAnalysis[key as keyof WaterAnalysis] || 0}
                  onChange={(e) => setWaterAnalysis({
                    ...waterAnalysis,
                    [key]: Number(e.target.value)
                  })}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-xs text-blue-400">
              <Info className="w-3 h-3 inline mr-1" />
              Enter your source water analysis to account for existing nutrients
            </p>
          </div>
        </div>

        {/* Target Nutrients */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Target Nutrients (PPM)
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(targets).map(([nutrient, target]) => {
              const achievedValue = achieved[nutrient as keyof NutrientTargets];
              const status = getAchievementStatus(achievedValue, target);
              
              return (
                <div key={nutrient} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{nutrient}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={target}
                      onChange={(e) => setTargets({
                        ...targets,
                        [nutrient]: Number(e.target.value)
                      })}
                      className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                    <span className={`text-sm font-medium ${status.color}`}>
                      {achievedValue.toFixed(1)}
                    </span>
                    <status.icon className={`w-4 h-4 ${status.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fertilizer Selection */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Fertilizer Selection</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fertilizerDatabase.map((fertilizer) => {
            const amount = fertilizerAmounts[fertilizer.id] || 0;
            
            return (
              <div key={fertilizer.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-white">{fertilizer.name}</h4>
                    <p className="text-xs text-gray-400">{fertilizer.formula}</p>
                  </div>
                  {fertilizer.cost && (
                    <span className="text-xs text-green-400">${fertilizer.cost}/kg</span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  {Object.entries(fertilizer.nutrients).map(([n, v]) => 
                    `${n}: ${v}%`
                  ).join(', ')}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFertilizerChange(fertilizer.id, -10)}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setFertilizerAmounts({
                      ...fertilizerAmounts,
                      [fertilizer.id]: Number(e.target.value)
                    })}
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                  />
                  <button
                    onClick={() => handleFertilizerChange(fertilizer.id, 10)}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-sm text-gray-400 w-8">g</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Achievement Overview */}
        <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-xl rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Nutrient Achievement
          </h3>
          
          <div className="space-y-3">
            {Object.entries(targets).map(([nutrient, target]) => {
              const achievedValue = achieved[nutrient as keyof NutrientTargets];
              const percentage = (achievedValue / target) * 100;
              const status = getAchievementStatus(achievedValue, target);
              
              return (
                <div key={nutrient}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">{nutrient}</span>
                    <span className={`text-sm font-medium ${status.color}`}>
                      {achievedValue.toFixed(1)} / {target} PPM
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        status.status === 'optimal' ? 'bg-green-500' :
                        status.status === 'low' ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 120)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Analysis & Actions */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            Cost Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-400">Batch Cost</p>
                <p className="text-2xl font-bold text-white">${calculateTotalCost().toFixed(2)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-400">Cost per Liter</p>
                <p className="text-2xl font-bold text-white">
                  ${(calculateTotalCost() / (useInjector ? tankVolume / injectorRatio : tankVolume)).toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button className="w-full py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                Save Recipe
              </button>
              <button 
                onClick={exportToPDF}
                className="w-full py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <FileDown className="w-5 h-5" />
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
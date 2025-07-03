import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff,
  Layers,
  Package,
  Activity,
  Leaf,
  Ruler,
  Settings,
  Copy,
  AlertCircle
} from 'lucide-react';

export interface RackType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  tierCount: number;
  defaultTierHeights: number[];
  canopySpacing: number;
  benchDepth: number;
  aisleWidth: number;
  isRolling: boolean;
}

export interface Tier {
  id: string;
  name: string;
  height: number; // Height from ground in feet
  benchDepth: number; // Depth of the bench in feet
  canopyHeight: number; // Height of plants on this tier in feet
  targetPPFD: number;
  cropType: string;
  enabled: boolean;
  visible: boolean;
  color: string;
  plantDensity: number; // plants per square foot
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting';
  transmittance?: number; // Light transmittance through canopy (0-1)
  canopyDensity?: number; // Canopy density percentage (0-100)
}

export interface MultiTierSystem {
  id: string;
  name: string;
  rackType: RackType;
  tiers: Tier[];
  totalHeight: number;
  footprint: { width: number; depth: number };
  aisleRequirements: { front: number; back: number; sides: number };
}

interface MultiLayerCanopyPanelProps {
  layers: Tier[];
  onLayersChange: (layers: Tier[]) => void;
  maxHeight: number;
  roomDimensions?: { width: number; height: number; depth: number };
}

// Predefined rack configurations
const RACK_PRESETS: RackType[] = [
  {
    id: 'single-bench',
    name: 'Single Bench',
    description: 'Traditional single-tier growing bench',
    icon: Package,
    tierCount: 1,
    defaultTierHeights: [30],
    canopySpacing: 0,
    benchDepth: 4,
    aisleWidth: 3,
    isRolling: false
  },
  {
    id: 'double-tier',
    name: '2-Tier Rack',
    description: 'Two-level growing system for increased density',
    icon: Layers,
    tierCount: 2,
    defaultTierHeights: [30, 60],
    canopySpacing: 24,
    benchDepth: 4,
    aisleWidth: 3,
    isRolling: false
  },
  {
    id: 'triple-tier',
    name: '3-Tier Rack',
    description: 'Three-level system for leafy greens and herbs',
    icon: Layers,
    tierCount: 3,
    defaultTierHeights: [24, 48, 72],
    canopySpacing: 18,
    benchDepth: 3.5,
    aisleWidth: 3,
    isRolling: false
  },
  {
    id: 'vertical-farm',
    name: 'Vertical Farm (5-Tier)',
    description: 'High-density vertical farming system',
    icon: Activity,
    tierCount: 5,
    defaultTierHeights: [18, 36, 54, 72, 90],
    canopySpacing: 16,
    benchDepth: 3,
    aisleWidth: 4,
    isRolling: false
  },
  {
    id: 'rolling-bench',
    name: 'Rolling Benches',
    description: 'Mobile benches for maximum space utilization',
    icon: Package,
    tierCount: 1,
    defaultTierHeights: [30],
    canopySpacing: 0,
    benchDepth: 5,
    aisleWidth: 2, // Reduced because benches can move
    isRolling: true
  },
  {
    id: 'custom',
    name: 'Custom Configuration',
    description: 'Design your own multi-tier system',
    icon: Settings,
    tierCount: 0,
    defaultTierHeights: [],
    canopySpacing: 20,
    benchDepth: 4,
    aisleWidth: 3,
    isRolling: false
  }
];

// Crop presets with recommended settings
const CROP_PRESETS = {
  'Lettuce': { canopyHeight: 6, targetPPFD: 200, plantDensity: 16 },
  'Herbs': { canopyHeight: 8, targetPPFD: 250, plantDensity: 9 },
  'Tomatoes': { canopyHeight: 24, targetPPFD: 600, plantDensity: 2.5 },
  'Cannabis': { canopyHeight: 36, targetPPFD: 800, plantDensity: 1 },
  'Strawberries': { canopyHeight: 10, targetPPFD: 350, plantDensity: 6 },
  'Microgreens': { canopyHeight: 3, targetPPFD: 150, plantDensity: 100 },
  'Leafy Greens': { canopyHeight: 8, targetPPFD: 250, plantDensity: 12 },
  'Custom': { canopyHeight: 12, targetPPFD: 400, plantDensity: 4 }
};

const TIER_COLORS = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316'  // Orange
];

export function MultiLayerCanopyPanel({ 
  layers, 
  onLayersChange, 
  maxHeight,
  roomDimensions 
}: MultiLayerCanopyPanelProps) {
  const [selectedRackType, setSelectedRackType] = useState<RackType>(RACK_PRESETS[0]);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [showPresetSelector, setShowPresetSelector] = useState(false);

  // Add a new tier
  const addTier = () => {
    const newTierId = `tier-${Date.now()}`;
    const existingHeights = layers.map(l => l.height).sort((a, b) => a - b);
    
    // Calculate suggested height for new tier
    let suggestedHeight = 30; // Default
    if (existingHeights.length > 0) {
      const lastHeight = existingHeights[existingHeights.length - 1];
      suggestedHeight = Math.min(lastHeight + 24, maxHeight - 12); // Leave room for canopy
    }

    const newTier: Tier = {
      id: newTierId,
      name: `Tier ${layers.length + 1}`,
      height: suggestedHeight,
      benchDepth: selectedRackType.benchDepth,
      canopyHeight: 12,
      targetPPFD: 400,
      cropType: 'Leafy Greens',
      enabled: true,
      visible: true,
      color: TIER_COLORS[layers.length % TIER_COLORS.length],
      plantDensity: 12,
      growthStage: 'vegetative'
    };

    onLayersChange([...layers, newTier]);
  };

  // Remove a tier
  const removeTier = (tierId: string) => {
    onLayersChange(layers.filter(l => l.id !== tierId));
  };

  // Update tier properties
  const updateTier = (tierId: string, updates: Partial<Tier>) => {
    onLayersChange(layers.map(l => 
      l.id === tierId ? { ...l, ...updates } : l
    ));
  };

  // Move tier up/down
  const moveTier = (tierId: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === tierId);
    if (index === -1) return;

    const newLayers = [...layers];
    const tier = newLayers[index];
    
    if (direction === 'up' && index < layers.length - 1) {
      // Swap heights with tier above
      const tierAbove = newLayers[index + 1];
      const tempHeight = tier.height;
      tier.height = tierAbove.height;
      tierAbove.height = tempHeight;
    } else if (direction === 'down' && index > 0) {
      // Swap heights with tier below
      const tierBelow = newLayers[index - 1];
      const tempHeight = tier.height;
      tier.height = tierBelow.height;
      tierBelow.height = tempHeight;
    }

    onLayersChange(newLayers);
  };

  // Apply rack preset
  const applyRackPreset = (preset: RackType) => {
    setSelectedRackType(preset);
    
    if (preset.id === 'custom') {
      setShowPresetSelector(false);
      return;
    }

    const newTiers: Tier[] = preset.defaultTierHeights.map((height, index) => ({
      id: `tier-${Date.now()}-${index}`,
      name: `Tier ${index + 1}`,
      height: height / 12, // Convert inches to feet
      benchDepth: preset.benchDepth,
      canopyHeight: 12,
      targetPPFD: 400 - (index * 50), // Decrease PPFD for higher tiers
      cropType: 'Leafy Greens',
      enabled: true,
      visible: true,
      color: TIER_COLORS[index % TIER_COLORS.length],
      plantDensity: 12,
      growthStage: 'vegetative'
    }));

    onLayersChange(newTiers);
    setShowPresetSelector(false);
  };

  // Calculate total system requirements
  const calculateSystemMetrics = () => {
    if (layers.length === 0) return null;

    const sortedLayers = [...layers].sort((a, b) => a.height - b.height);
    const highestTier = sortedLayers[sortedLayers.length - 1];
    const totalHeight = highestTier ? highestTier.height + highestTier.canopyHeight : 0;

    // Calculate lighting requirements for each tier
    const lightingRequirements = layers.map(tier => {
      const areaPerTier = selectedRackType.benchDepth * (roomDimensions?.width || 10);
      const totalPPF = tier.targetPPFD * areaPerTier * 0.092903; // Convert ft² to m²
      const estimatedWattage = totalPPF / 2.5; // Assuming 2.5 μmol/J efficiency
      
      return {
        tierId: tier.id,
        tierName: tier.name,
        ppfRequired: totalPPF,
        estimatedWattage,
        fixturesNeeded: Math.ceil(estimatedWattage / 600) // Assuming 600W fixtures
      };
    });

    // Check for tier conflicts
    const conflicts: string[] = [];
    sortedLayers.forEach((tier, index) => {
      // Check if tier + canopy exceeds next tier
      if (index < sortedLayers.length - 1) {
        const nextTier = sortedLayers[index + 1];
        const clearance = nextTier.height - (tier.height + tier.canopyHeight);
        if (clearance < 6) { // Minimum 6" clearance
          conflicts.push(`Insufficient clearance between ${tier.name} and ${nextTier.name} (${clearance.toFixed(1)}" < 6")`);
        }
      }

      // Check if tier exceeds room height
      if (tier.height + tier.canopyHeight > maxHeight) {
        conflicts.push(`${tier.name} exceeds room height`);
      }
    });

    return {
      totalHeight,
      tierCount: layers.length,
      totalGrowArea: layers.length * selectedRackType.benchDepth * (roomDimensions?.width || 10),
      lightingRequirements,
      conflicts
    };
  };

  const systemMetrics = calculateSystemMetrics();

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Multi-Tier Racking System
        </h3>
        <button
          onClick={() => setShowPresetSelector(!showPresetSelector)}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          Presets
        </button>
      </div>

      {/* Preset Selector */}
      {showPresetSelector && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {RACK_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyRackPreset(preset)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-left"
            >
              <div className="flex items-start gap-3">
                {React.createElement(preset.icon, { className: "w-5 h-5 text-purple-400 mt-0.5" })}
                <div>
                  <p className="text-sm font-medium text-white">{preset.name}</p>
                  <p className="text-xs text-gray-400">{preset.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Current Configuration */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Current Configuration</p>
        <p className="text-sm text-white font-medium">{selectedRackType.name}</p>
        {selectedRackType.isRolling && (
          <p className="text-xs text-blue-400 mt-1">✓ Rolling bench system for maximum space efficiency</p>
        )}
      </div>

      {/* System Metrics */}
      {systemMetrics && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="bg-gray-700/50 p-2 rounded">
            <p className="text-xs text-gray-400">Total Height</p>
            <p className="text-sm font-bold text-white">{systemMetrics.totalHeight.toFixed(1)}"</p>
          </div>
          <div className="bg-gray-700/50 p-2 rounded">
            <p className="text-xs text-gray-400">Tiers</p>
            <p className="text-sm font-bold text-white">{systemMetrics.tierCount}</p>
          </div>
          <div className="bg-gray-700/50 p-2 rounded">
            <p className="text-xs text-gray-400">Grow Area</p>
            <p className="text-sm font-bold text-white">{systemMetrics.totalGrowArea.toFixed(0)} ft²</p>
          </div>
        </div>
      )}

      {/* Conflicts/Warnings */}
      {systemMetrics?.conflicts && systemMetrics.conflicts.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400 mb-1">Configuration Issues</p>
              {systemMetrics.conflicts.map((conflict, index) => (
                <p key={index} className="text-xs text-red-300">• {conflict}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tier List */}
      <div className="space-y-2 mb-4">
        {layers
          .sort((a, b) => b.height - a.height) // Sort from top to bottom
          .map((tier, index) => (
          <div 
            key={tier.id} 
            className="bg-gray-700/50 rounded-lg p-3 border border-gray-600"
          >
            {editingTier === tier.id ? (
              // Edit Mode
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Tier Name</label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Height (inches)</label>
                    <input
                      type="number"
                      value={tier.height * 12} // Convert to inches for display
                      onChange={(e) => updateTier(tier.id, { height: Number(e.target.value) / 12 })}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Bench Depth (ft)</label>
                    <input
                      type="number"
                      value={tier.benchDepth}
                      onChange={(e) => updateTier(tier.id, { benchDepth: Number(e.target.value) })}
                      step="0.5"
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Canopy Height (inches)</label>
                    <input
                      type="number"
                      value={tier.canopyHeight}
                      onChange={(e) => updateTier(tier.id, { canopyHeight: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Crop Type</label>
                    <select
                      value={tier.cropType}
                      onChange={(e) => {
                        const crop = e.target.value;
                        const preset = CROP_PRESETS[crop as keyof typeof CROP_PRESETS];
                        updateTier(tier.id, { 
                          cropType: crop,
                          canopyHeight: preset.canopyHeight,
                          targetPPFD: preset.targetPPFD,
                          plantDensity: preset.plantDensity
                        });
                      }}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    >
                      {Object.keys(CROP_PRESETS).map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Target PPFD</label>
                    <input
                      type="number"
                      value={tier.targetPPFD}
                      onChange={(e) => updateTier(tier.id, { targetPPFD: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingTier(null)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tier.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        {tier.name}
                        <span className="text-xs text-gray-400">@ {(tier.height * 12).toFixed(0)}"</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {tier.cropType} • {tier.targetPPFD} PPFD • {tier.plantDensity} plants/ft²
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateTier(tier.id, { visible: !tier.visible })}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {tier.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => moveTier(tier.id, 'up')}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveTier(tier.id, 'down')}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      disabled={index === layers.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTier(tier.id)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeTier(tier.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tier Details */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">Bench</p>
                    <p className="text-white">{tier.benchDepth}' × {roomDimensions?.width || 10}'</p>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">Canopy</p>
                    <p className="text-white">{tier.canopyHeight}" tall</p>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">Clearance</p>
                    <p className="text-white">
                      {index > 0 
                        ? `${(layers[index - 1].height - (tier.height + tier.canopyHeight/12)).toFixed(1)}"` 
                        : 'Top tier'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Tier Button */}
      <button
        onClick={addTier}
        className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Tier
      </button>

      {/* Lighting Requirements Summary */}
      {systemMetrics && systemMetrics.lightingRequirements.length > 0 && (
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
          <p className="text-sm font-medium text-blue-400 mb-2">Lighting Requirements</p>
          <div className="space-y-1">
            {systemMetrics.lightingRequirements.map(req => (
              <p key={req.tierId} className="text-xs text-blue-300">
                {req.tierName}: ~{req.estimatedWattage.toFixed(0)}W ({req.fixturesNeeded} fixtures)
              </p>
            ))}
            <p className="text-xs text-blue-200 font-medium mt-2">
              Total: ~{systemMetrics.lightingRequirements.reduce((sum, req) => sum + req.estimatedWattage, 0).toFixed(0)}W
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
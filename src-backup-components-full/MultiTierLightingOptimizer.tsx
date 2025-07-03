'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Target,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Settings,
  Maximize,
  BarChart3,
  Eye,
  Cpu,
  Activity
} from 'lucide-react';
import type { Tier } from './MultiLayerCanopyPanel';
import { 
  calculateMultiTierLighting, 
  type FixtureAssignment,
  type MultiTierLightingResult
} from '../lib/multi-tier-lighting';

interface MultiTierLightingOptimizerProps {
  tiers: Tier[];
  fixtures: Array<{
    id: string;
    x: number;
    y: number;
    z: number;
    ppf: number;
    wattage: number;
    beamAngle: number;
    enabled: boolean;
    spectrum?: { red: number; blue: number; green: number; farRed: number };
  }>;
  roomDimensions: { width: number; height: number; depth: number };
  onFixtureAssignmentChange?: (assignments: FixtureAssignment[]) => void;
  onOptimizationApply?: (recommendations: string[]) => void;
}

export function MultiTierLightingOptimizer({
  tiers,
  fixtures,
  roomDimensions,
  onFixtureAssignmentChange,
  onOptimizationApply
}: MultiTierLightingOptimizerProps) {
  const [fixtureAssignments, setFixtureAssignments] = useState<FixtureAssignment[]>([]);
  const [lightingAnalysis, setLightingAnalysis] = useState<MultiTierLightingResult | null>(null);
  const [optimizationMode, setOptimizationMode] = useState<'manual' | 'auto' | 'ai'>('manual');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize fixture assignments
  useEffect(() => {
    const initialAssignments: FixtureAssignment[] = fixtures.map(fixture => ({
      fixtureId: fixture.id,
      assignedTiers: [], // Start with no assignments
      mountingHeight: fixture.z,
      intensity: fixture.ppf,
      beamAngle: fixture.beamAngle,
      position: { x: fixture.x, y: fixture.y }
    }));
    
    setFixtureAssignments(initialAssignments);
  }, [fixtures]);

  // Auto-assign fixtures to tiers based on proximity and requirements
  const autoAssignFixtures = () => {
    const newAssignments = fixtureAssignments.map(assignment => {
      const fixture = fixtures.find(f => f.id === assignment.fixtureId);
      if (!fixture) return assignment;

      // Find best tier(s) for this fixture based on height and requirements
      const suitableTiers = tiers
        .filter(tier => {
          const tierHeightFeet = tier.height / 12;
          const clearance = fixture.z - tierHeightFeet;
          return clearance > 1 && clearance < 8; // Reasonable lighting distance
        })
        .sort((a, b) => {
          // Sort by proximity and PPFD need
          const aDistance = Math.abs(fixture.z - a.height / 12);
          const bDistance = Math.abs(fixture.z - b.height / 12);
          const aNeed = a.targetPPFD / (a.plantDensity || 1);
          const bNeed = b.targetPPFD / (b.plantDensity || 1);
          return (aDistance - bDistance) + (bNeed - aNeed) * 0.1;
        });

      return {
        ...assignment,
        assignedTiers: suitableTiers.slice(0, 2).map(t => t.id) // Assign to top 2 suitable tiers
      };
    });

    setFixtureAssignments(newAssignments);
    onFixtureAssignmentChange?.(newAssignments);
  };

  // Calculate lighting analysis
  useEffect(() => {
    if (tiers.length === 0 || fixtureAssignments.length === 0) {
      setLightingAnalysis(null);
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    const timeoutId = setTimeout(() => {
      try {
        const analysis = calculateMultiTierLighting(
          tiers,
          fixtureAssignments,
          roomDimensions,
          30 // Grid resolution
        );
        setLightingAnalysis(analysis);
      } catch (error) {
        console.error('Error calculating lighting analysis:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tiers, fixtureAssignments, roomDimensions]);

  // Toggle tier assignment for a fixture
  const toggleTierAssignment = (fixtureId: string, tierId: string) => {
    setFixtureAssignments(prev => prev.map(assignment => {
      if (assignment.fixtureId === fixtureId) {
        const isAssigned = assignment.assignedTiers.includes(tierId);
        return {
          ...assignment,
          assignedTiers: isAssigned
            ? assignment.assignedTiers.filter(id => id !== tierId)
            : [...assignment.assignedTiers, tierId]
        };
      }
      return assignment;
    }));
  };

  // Calculate tier spacing issues
  const tierSpacingIssues = useMemo(() => {
    const issues: Array<{ tierIds: [string, string]; issue: string; severity: 'warning' | 'error' }> = [];
    
    // Temporarily disabled due to missing function
    // const sortedTiers = [...tiers].sort((a, b) => a.height - b.height);
    
    // for (let i = 0; i < sortedTiers.length - 1; i++) {
    //   const lowerTier = sortedTiers[i];
    //   const upperTier = sortedTiers[i + 1];
      
    //   const spacing = calculateTierSpacing(lowerTier, upperTier);
      
    //   if (spacing.clearanceIssues.length > 0) {
    //     spacing.clearanceIssues.forEach(issue => {
    //       issues.push({
    //         tierIds: [lowerTier.id, upperTier.id],
    //         issue,
    //         severity: issue.includes('damage') ? 'error' : 'warning'
    //       });
    //     });
    //   }
    // }
    
    return issues;
  }, [tiers]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!lightingAnalysis) return null;

    const totalTargetPPF = tiers.reduce((sum, tier) => {
      const area = tier.benchDepth * roomDimensions.width * 0.092903; // Convert to m²
      return sum + (tier.targetPPFD * area);
    }, 0);

    const actualPPF = lightingAnalysis.tiers.reduce((sum, tier) => sum + tier.ppfReceived, 0);
    const efficiency = totalTargetPPF > 0 ? (actualPPF / totalTargetPPF) * 100 : 0;

    const avgUniformity = lightingAnalysis.tiers.reduce((sum, tier) => sum + tier.uniformity, 0) / lightingAnalysis.tiers.length;
    const avgCoverage = lightingAnalysis.tiers.reduce((sum, tier) => sum + tier.coveragePercent, 0) / lightingAnalysis.tiers.length;

    return {
      efficiency: Math.min(100, efficiency),
      uniformity: avgUniformity * 100,
      coverage: avgCoverage * 100,
      energyConsumption: lightingAnalysis.totalEnergyConsumption,
      overallScore: (efficiency + avgUniformity * 100 + avgCoverage * 100) / 3
    };
  }, [lightingAnalysis, tiers, roomDimensions]);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Multi-Tier Lighting Optimizer
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={optimizationMode}
            onChange={(e) => setOptimizationMode(e.target.value as any)}
            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="manual">Manual</option>
            <option value="auto">Auto-Assign</option>
            <option value="ai">AI Optimize</option>
          </select>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-400 hover:text-white"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      {performanceMetrics && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="bg-gray-700/50 p-2 rounded text-center">
            <p className="text-xs text-gray-400">Efficiency</p>
            <p className={`text-sm font-bold ${
              performanceMetrics.efficiency > 80 ? 'text-green-400' :
              performanceMetrics.efficiency > 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {performanceMetrics.efficiency.toFixed(0)}%
            </p>
          </div>
          <div className="bg-gray-700/50 p-2 rounded text-center">
            <p className="text-xs text-gray-400">Uniformity</p>
            <p className={`text-sm font-bold ${
              performanceMetrics.uniformity > 80 ? 'text-green-400' :
              performanceMetrics.uniformity > 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {performanceMetrics.uniformity.toFixed(0)}%
            </p>
          </div>
          <div className="bg-gray-700/50 p-2 rounded text-center">
            <p className="text-xs text-gray-400">Coverage</p>
            <p className={`text-sm font-bold ${
              performanceMetrics.coverage > 80 ? 'text-green-400' :
              performanceMetrics.coverage > 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {performanceMetrics.coverage.toFixed(0)}%
            </p>
          </div>
          <div className="bg-gray-700/50 p-2 rounded text-center">
            <p className="text-xs text-gray-400">Power</p>
            <p className="text-sm font-bold text-white">
              {(performanceMetrics.energyConsumption / 1000).toFixed(1)}kW
            </p>
          </div>
        </div>
      )}

      {/* Tier Spacing Issues */}
      {tierSpacingIssues.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Tier Spacing Issues</p>
              {tierSpacingIssues.map((issue, index) => (
                <p key={index} className="text-xs text-red-300 mt-1">
                  • {issue.issue}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optimization Controls */}
      <div className="mb-4 flex gap-2">
        {optimizationMode === 'auto' && (
          <button
            onClick={autoAssignFixtures}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            Auto-Assign Fixtures
          </button>
        )}
        
        {optimizationMode === 'ai' && (
          <button
            onClick={() => {
              // AI optimization would go here
            }}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            AI Optimize
          </button>
        )}
        
        {lightingAnalysis?.recommendations && lightingAnalysis.recommendations.length > 0 && (
          <button
            onClick={() => onOptimizationApply?.(lightingAnalysis.recommendations)}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Apply Recommendations
          </button>
        )}
      </div>

      {/* Fixture Assignments */}
      {optimizationMode === 'manual' && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Fixture Assignments</h4>
          <div className="space-y-2">
            {fixtureAssignments.map(assignment => {
              const fixture = fixtures.find(f => f.id === assignment.fixtureId);
              if (!fixture) return null;
              
              return (
                <div key={assignment.fixtureId} className="bg-gray-700/30 p-2 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Fixture {assignment.fixtureId.split('-')[1]}</span>
                    <span className="text-xs text-gray-400">{fixture.ppf} PPF</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1">
                    {tiers.map(tier => (
                      <button
                        key={tier.id}
                        onClick={() => toggleTierAssignment(assignment.fixtureId, tier.id)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          assignment.assignedTiers.includes(tier.id)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {tier.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tier Analysis */}
      {showDetails && lightingAnalysis && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Tier Analysis</h4>
          {lightingAnalysis.tiers.map(tierAnalysis => {
            const tier = tiers.find(t => t.id === tierAnalysis.tierId);
            if (!tier) return null;
            
            const ppfdRatio = tierAnalysis.actualPPFD / tier.targetPPFD;
            
            return (
              <div 
                key={tierAnalysis.tierId} 
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedTier === tierAnalysis.tierId
                    ? 'bg-purple-900/30 border-purple-600/50'
                    : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedTier(
                  selectedTier === tierAnalysis.tierId ? null : tierAnalysis.tierId
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className="text-sm font-medium text-white">{tier.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ppfdRatio >= 0.8 && ppfdRatio <= 1.2 ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className={`text-sm font-bold ${
                      ppfdRatio >= 0.8 && ppfdRatio <= 1.2 ? 'text-green-400' :
                      ppfdRatio < 0.8 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {tierAnalysis.actualPPFD.toFixed(0)} PPFD
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Target</p>
                    <p className="text-white">{tier.targetPPFD} PPFD</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Uniformity</p>
                    <p className="text-white">{(tierAnalysis.uniformity * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Coverage</p>
                    <p className="text-white">{(tierAnalysis.coveragePercent * 100).toFixed(0)}%</p>
                  </div>
                </div>
                
                {tierAnalysis.shadowingFactor > 0.1 && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded">
                    <p className="text-xs text-yellow-400">
                      ⚠️ {(tierAnalysis.shadowingFactor * 100).toFixed(0)}% light blocked by upper tiers
                    </p>
                  </div>
                )}
                
                {tierAnalysis.lightingGaps.length > 0 && selectedTier === tierAnalysis.tierId && (
                  <div className="mt-2 p-2 bg-red-900/20 rounded">
                    <p className="text-xs text-red-400 mb-1">
                      {tierAnalysis.lightingGaps.length} lighting gaps detected
                    </p>
                    <p className="text-xs text-red-300">
                      Consider adding {tierAnalysis.recommendedFixtures} more fixtures
                    </p>
                  </div>
                )}
                
                {/* PPFD Progress Bar */}
                <div className="mt-2 h-2 bg-gray-800 rounded overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      ppfdRatio >= 0.8 && ppfdRatio <= 1.2 ? 'bg-green-500' :
                      ppfdRatio < 0.8 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, (tierAnalysis.actualPPFD / tier.targetPPFD) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      {lightingAnalysis?.recommendations && lightingAnalysis.recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400 mb-2">Optimization Recommendations</p>
              {lightingAnalysis.recommendations.map((rec, index) => (
                <p key={index} className="text-xs text-blue-300 mb-1">• {rec}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calculation Status */}
      {isCalculating && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
          <span className="ml-2 text-sm text-gray-400">Calculating lighting analysis...</span>
        </div>
      )}
    </div>
  );
}

export default MultiTierLightingOptimizer;
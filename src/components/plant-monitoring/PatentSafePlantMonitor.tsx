'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, BarChart3, TrendingUp, Users, 
  Lightbulb, Settings, RefreshCw, AlertCircle,
  CheckCircle, ThumbsUp, ThumbsDown, Eye
} from 'lucide-react';

/**
 * Patent-Safe Plant Monitoring System
 * 
 * This implementation avoids IUNU patents by:
 * 1. Using zone-based monitoring instead of individual plant tracking
 * 2. Providing advisory recommendations instead of automated control
 * 3. Requiring human approval for all decisions
 * 4. Focusing on environmental optimization rather than plant identification
 */

interface ZoneMetrics {
  zoneId: string;
  zoneName: string;
  area: number; // square feet
  plantCount: number; // estimated count, not tracked individually
  environmentalConditions: {
    avgTemperature: number;
    avgHumidity: number;
    avgPPFD: number;
    avgCO2: number;
    avgVPD: number;
  };
  aggregateHealth: {
    healthScore: number; // 0-100, zone-wide estimate
    growthRate: number; // zone average
    biomassEstimate: number; // total zone biomass
  };
  recommendations: EnvironmentalRecommendation[];
  lastUpdated: Date;
}

interface EnvironmentalRecommendation {
  id: string;
  type: 'lighting' | 'temperature' | 'humidity' | 'co2' | 'irrigation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  suggestedChange: string;
  expectedBenefit: string;
  requiresApproval: boolean;
  approved?: boolean;
  implementedBy?: string;
  implementedAt?: Date;
}

interface UserDecision {
  recommendationId: string;
  decision: 'approve' | 'reject' | 'modify';
  notes?: string;
  modifiedParameters?: Record<string, any>;
  timestamp: Date;
  userId: string;
}

export function PatentSafePlantMonitor() {
  const [zones, setZones] = useState<ZoneMetrics[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneMetrics | null>(null);
  const [pendingRecommendations, setPendingRecommendations] = useState<EnvironmentalRecommendation[]>([]);
  const [userDecisions, setUserDecisions] = useState<UserDecision[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'recommendations' | 'history'>('overview');

  // Mock data - in real implementation, this would come from zone-based sensors
  useEffect(() => {
    const mockZones: ZoneMetrics[] = [
      {
        zoneId: 'zone-001',
        zoneName: 'Vegetative Zone A',
        area: 400,
        plantCount: 240, // Estimated count
        environmentalConditions: {
          avgTemperature: 24.5,
          avgHumidity: 65,
          avgPPFD: 350,
          avgCO2: 800,
          avgVPD: 1.2
        },
        aggregateHealth: {
          healthScore: 82,
          growthRate: 1.3,
          biomassEstimate: 45.2
        },
        recommendations: [
          {
            id: 'rec-001',
            type: 'lighting',
            priority: 'medium',
            description: 'Zone showing below-optimal PPFD levels during peak hours',
            suggestedChange: 'Increase light intensity by 15% during 10AM-2PM',
            expectedBenefit: 'Estimated 8-12% improvement in growth rate',
            requiresApproval: true,
            approved: undefined
          }
        ],
        lastUpdated: new Date()
      },
      {
        zoneId: 'zone-002',
        zoneName: 'Flowering Zone B',
        area: 600,
        plantCount: 180,
        environmentalConditions: {
          avgTemperature: 22.8,
          avgHumidity: 55,
          avgPPFD: 650,
          avgCO2: 1200,
          avgVPD: 1.0
        },
        aggregateHealth: {
          healthScore: 91,
          growthRate: 0.8,
          biomassEstimate: 78.5
        },
        recommendations: [],
        lastUpdated: new Date()
      }
    ];

    setZones(mockZones);
    
    // Extract pending recommendations
    const pending = mockZones.flatMap(zone => 
      zone.recommendations.filter(rec => rec.approved === undefined)
    );
    setPendingRecommendations(pending);
  }, []);

  const handleRecommendationDecision = (
    recommendationId: string, 
    decision: 'approve' | 'reject' | 'modify',
    notes?: string,
    modifiedParams?: Record<string, any>
  ) => {
    const newDecision: UserDecision = {
      recommendationId,
      decision,
      notes,
      modifiedParameters: modifiedParams,
      timestamp: new Date(),
      userId: 'current-user' // In real app, get from auth context
    };

    setUserDecisions(prev => [...prev, newDecision]);

    // Update the recommendation status
    setPendingRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, approved: decision === 'approve' }
          : rec
      )
    );

    // Update zones
    setZones(prev => prev.map(zone => ({
      ...zone,
      recommendations: zone.recommendations.map(rec =>
        rec.id === recommendationId
          ? { ...rec, approved: decision === 'approve' }
          : rec
      )
    })));
  };

  const getZoneHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Zone-Based Environmental Monitor</CardTitle>
                  <CardDescription className="text-gray-400">
                    Advisory system for environmental optimization - Human-approved decisions only
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">
                  Patent-Safe Implementation
                </Badge>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Navigation */}
        <div className="flex gap-2">
          {['overview', 'recommendations', 'history'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <>
            {/* Zone Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {zones.map(zone => (
                <Card 
                  key={zone.zoneId} 
                  className={`bg-gray-900/60 backdrop-blur-xl border-gray-800 cursor-pointer transition-all hover:border-blue-500/50 ${
                    selectedZone?.zoneId === zone.zoneId ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{zone.zoneName}</CardTitle>
                      <Badge className={`${getZoneHealthColor(zone.aggregateHealth.healthScore)} bg-gray-800`}>
                        Health: {zone.aggregateHealth.healthScore}%
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      {zone.area} sq ft • ~{zone.plantCount} plants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Avg Temperature</p>
                        <p className="text-white font-medium">{zone.environmentalConditions.avgTemperature}°C</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Avg PPFD</p>
                        <p className="text-white font-medium">{zone.environmentalConditions.avgPPFD} μmol/m²/s</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Growth Rate</p>
                        <p className="text-white font-medium">{zone.aggregateHealth.growthRate} cm/day</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Recommendations</p>
                        <p className="text-blue-400 font-medium">{zone.recommendations.length} pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Zone Details */}
            {selectedZone && (
              <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Zone Details: {selectedZone.zoneName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Environmental Conditions</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Temperature:</span>
                          <span className="text-white">{selectedZone.environmentalConditions.avgTemperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Humidity:</span>
                          <span className="text-white">{selectedZone.environmentalConditions.avgHumidity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">PPFD:</span>
                          <span className="text-white">{selectedZone.environmentalConditions.avgPPFD}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Zone Performance</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Health Score:</span>
                          <span className={getZoneHealthColor(selectedZone.aggregateHealth.healthScore)}>
                            {selectedZone.aggregateHealth.healthScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Growth Rate:</span>
                          <span className="text-white">{selectedZone.aggregateHealth.growthRate} cm/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Biomass:</span>
                          <span className="text-white">{selectedZone.aggregateHealth.biomassEstimate} kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {viewMode === 'recommendations' && (
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Pending Recommendations</CardTitle>
              <CardDescription className="text-gray-400">
                Advisory suggestions requiring human approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRecommendations.map(recommendation => (
                  <div key={recommendation.id} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getPriorityColor(recommendation.priority)} border`}>
                            {recommendation.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {recommendation.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-white">{recommendation.description}</h4>
                        <p className="text-sm text-gray-400 mt-1">{recommendation.suggestedChange}</p>
                        <p className="text-sm text-green-400 mt-1">Expected: {recommendation.expectedBenefit}</p>
                      </div>
                    </div>
                    
                    {recommendation.approved === undefined && (
                      <div className="flex gap-2 pt-3 border-t border-gray-700">
                        <button
                          onClick={() => handleRecommendationDecision(recommendation.id, 'approve')}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRecommendationDecision(recommendation.id, 'reject', 'Manual review required')}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleRecommendationDecision(recommendation.id, 'modify', 'Modified parameters')}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Modify
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {pendingRecommendations.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-400">No pending recommendations</p>
                    <p className="text-sm text-gray-500">All zones are performing optimally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'history' && (
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Decision History</CardTitle>
              <CardDescription className="text-gray-400">
                Record of all user decisions and implementations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userDecisions.map((decision, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          decision.decision === 'approve' ? 'bg-green-500/20 text-green-400' :
                          decision.decision === 'reject' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {decision.decision.toUpperCase()}
                        </span>
                        <span className="text-gray-300 ml-2">Recommendation {decision.recommendationId}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {decision.timestamp.toLocaleString()}
                      </span>
                    </div>
                    {decision.notes && (
                      <p className="text-sm text-gray-400 mt-2">{decision.notes}</p>
                    )}
                  </div>
                ))}

                {userDecisions.length === 0 && (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No decisions recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Shield,
  Microscope,
  Leaf,
  Eye,
  ClipboardList,
  Download,
  Plus,
  X
} from 'lucide-react';
import {
  TomatoIPMManager,
  TOMATO_IPM_THRESHOLDS,
  NURSERY_QUALITY_STANDARDS,
  IPMScoutingRecord,
  IPMAlert
} from '@/lib/tomato-ipm-thresholds';

export default function TomatoIPMDashboard() {
  const [scoutingRecords, setScoutingRecords] = useState<IPMScoutingRecord[]>([]);
  const [currentScouting, setCurrentScouting] = useState({
    pestType: 'whitefly',
    count: 0,
    location: '',
    plantsScouted: 100,
    scoutingMethod: 'Yellow sticky cards',
    severity: 'none' as const,
    notes: ''
  });
  const [nurseryQuality, setNurseryQuality] = useState({
    whitefly: 0,
    thrips: 0,
    hasVisibleDiseases: false
  });
  const [alerts, setAlerts] = useState<IPMAlert[]>([]);
  const [overallScore, setOverallScore] = useState<any>(null);

  useEffect(() => {
    // Calculate alerts and overall score when scouting records change
    const newAlerts = TomatoIPMManager.generateIPMAlerts(scoutingRecords);
    const score = TomatoIPMManager.calculateOverallIPMScore(scoutingRecords);
    
    setAlerts(newAlerts);
    setOverallScore(score);
  }, [scoutingRecords]);

  const addScoutingRecord = () => {
    const newRecord: IPMScoutingRecord = {
      date: new Date(),
      ...currentScouting,
      followUpRequired: currentScouting.count > (TOMATO_IPM_THRESHOLDS[currentScouting.pestType]?.actionThreshold || 0)
    };

    setScoutingRecords(prev => [...prev, newRecord]);
    
    // Reset form
    setCurrentScouting(prev => ({
      ...prev,
      count: 0,
      location: '',
      notes: ''
    }));
  };

  const removeScoutingRecord = (index: number) => {
    setScoutingRecords(prev => prev.filter((_, i) => i !== index));
  };

  const validateNursery = () => {
    return TomatoIPMManager.validateNurseryQuality(
      nurseryQuality.whitefly,
      nurseryQuality.thrips,
      nurseryQuality.hasVisibleDiseases
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400 bg-green-900/30';
      case 'watch': return 'text-yellow-400 bg-yellow-900/30';
      case 'action': return 'text-orange-400 bg-orange-900/30';
      case 'critical': return 'text-red-400 bg-red-900/30';
      case 'excellent': return 'text-green-400 bg-green-900/30';
      case 'good': return 'text-blue-400 bg-blue-900/30';
      case 'needs_attention': return 'text-orange-400 bg-orange-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getPestChartData = () => {
    const pestCounts = scoutingRecords.reduce((acc, record) => {
      acc[record.pestType] = (acc[record.pestType] || 0) + record.count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(pestCounts).map(([pest, count]) => ({
      name: pest.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      count,
      threshold: TOMATO_IPM_THRESHOLDS[pest]?.actionThreshold || 0
    }));
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-xl p-6 border border-green-600/30">
        <div className="flex items-center gap-3 mb-4">
          <Bug className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-green-400">🍅 Tomato IPM Dashboard</h1>
            <p className="text-green-300">Advanced Dutch Research integrated pest management thresholds</p>
          </div>
        </div>
        
        {overallScore && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className={`text-2xl font-bold ${getStatusColor(overallScore.status)}`}>
                {overallScore.overallScore}
              </div>
              <div className="text-sm text-gray-400">Overall IPM Score</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className={`text-lg font-medium ${getStatusColor(overallScore.status)}`}>
                {overallScore.status.toUpperCase()}
              </div>
              <div className="text-sm text-gray-400">System Status</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-red-400">
                {alerts.filter(a => !a.resolved).length}
              </div>
              <div className="text-sm text-gray-400">Active Alerts</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-blue-400">
                {scoutingRecords.length}
              </div>
              <div className="text-sm text-gray-400">Scout Records</div>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="scouting" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full bg-gray-800">
          <TabsTrigger value="scouting" className="data-[state=active]:bg-green-600">
            <Microscope className="w-4 h-4 mr-2" />
            Scouting
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="data-[state=active]:bg-green-600">
            <Target className="w-4 h-4 mr-2" />
            Thresholds
          </TabsTrigger>
          <TabsTrigger value="nursery" className="data-[state=active]:bg-green-600">
            <Shield className="w-4 h-4 mr-2" />
            Nursery QC
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Scouting Tab */}
        <TabsContent value="scouting" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Scouting Form */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Scouting Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-300">Pest Type</Label>
                    <select
                      value={currentScouting.pestType}
                      onChange={(e) => setCurrentScouting(prev => ({ 
                        ...prev, 
                        pestType: e.target.value,
                        scoutingMethod: TOMATO_IPM_THRESHOLDS[e.target.value]?.monitoringMethod || prev.scoutingMethod
                      }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      {Object.entries(TOMATO_IPM_THRESHOLDS).map(([key, threshold]) => (
                        <option key={key} value={key}>{threshold.pestName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Count</Label>
                    <Input
                      type="number"
                      value={currentScouting.count}
                      onChange={(e) => setCurrentScouting(prev => ({ ...prev, count: Number(e.target.value) }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <span className="text-xs text-gray-400">
                      {TOMATO_IPM_THRESHOLDS[currentScouting.pestType]?.thresholdUnit}
                    </span>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Location</Label>
                    <Input
                      value={currentScouting.location}
                      onChange={(e) => setCurrentScouting(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Greenhouse A, Section 3"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Plants Scouted</Label>
                    <Input
                      type="number"
                      value={currentScouting.plantsScouted}
                      onChange={(e) => setCurrentScouting(prev => ({ ...prev, plantsScouted: Number(e.target.value) }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-300">Scouting Method</Label>
                  <Input
                    value={currentScouting.scoutingMethod}
                    onChange={(e) => setCurrentScouting(prev => ({ ...prev, scoutingMethod: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Severity</Label>
                  <select
                    value={currentScouting.severity}
                    onChange={(e) => setCurrentScouting(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="none">None</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
                
                <div>
                  <Label className="text-gray-300">Notes</Label>
                  <textarea
                    value={currentScouting.notes}
                    onChange={(e) => setCurrentScouting(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-20"
                    placeholder="Additional observations..."
                  />
                </div>
                
                <Button
                  onClick={addScoutingRecord}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Add Scouting Record
                </Button>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Recent Scouting Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scoutingRecords.slice(-10).reverse().map((record, index) => {
                    const evaluation = TomatoIPMManager.evaluatePestLevel(record.pestType, record.count, record.scoutingMethod);
                    return (
                      <div key={index} className={`p-3 rounded-lg border ${getStatusColor(evaluation.status)} border-current/30`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{TOMATO_IPM_THRESHOLDS[record.pestType]?.pestName}</span>
                            <Badge className={`${getStatusColor(evaluation.status)} text-xs`}>
                              {evaluation.status.toUpperCase()}
                            </Badge>
                          </div>
                          <button
                            onClick={() => removeScoutingRecord(scoutingRecords.length - 1 - index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>Count: {record.count} {TOMATO_IPM_THRESHOLDS[record.pestType]?.thresholdUnit}</div>
                          <div>Location: {record.location}</div>
                          <div>Date: {record.date.toLocaleDateString()}</div>
                          <div>Score: {evaluation.score}/100</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          {alerts.filter(a => !a.resolved).length > 0 && (
            <Card className="bg-red-900/20 border-red-600/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Active IPM Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.filter(a => !a.resolved).map((alert, index) => (
                    <Alert key={alert.id} className="border-red-600/30 bg-red-900/30">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <AlertDescription>
                        <div className="font-medium text-red-400 mb-2">
                          {TOMATO_IPM_THRESHOLDS[alert.pestType]?.pestName} - {alert.alertLevel.toUpperCase()}
                        </div>
                        <div className="text-red-300 text-sm mb-2">
                          Current count: {alert.currentCount} (Threshold exceeded by: {alert.thresholdExceeded})
                        </div>
                        <div className="text-red-300 text-sm">
                          <strong>Actions:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {alert.recommendedActions.slice(0, 3).map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(TOMATO_IPM_THRESHOLDS).map(([key, threshold]) => (
              <Card key={key} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Bug className="w-5 h-5" />
                    {threshold.pestName}
                  </CardTitle>
                  {threshold.scientificName && (
                    <p className="text-gray-400 italic text-sm">{threshold.scientificName}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-gray-300">Action Threshold:</strong>
                      <div className="text-white">{threshold.thresholdValue} {threshold.thresholdUnit}</div>
                    </div>
                    <div>
                      <strong className="text-gray-300">Monitoring:</strong>
                      <div className="text-white">{threshold.frequency}</div>
                    </div>
                    <div>
                      <strong className="text-gray-300">Method:</strong>
                      <div className="text-white">{threshold.monitoringMethod}</div>
                    </div>
                    <div>
                      <strong className="text-gray-300">Severity:</strong>
                      <Badge className={`${threshold.severity === 'critical' ? 'bg-red-600' : 
                        threshold.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'}`}>
                        {threshold.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-gray-300">Target Level:</strong>
                    <div className="text-white text-sm">{threshold.targetLevel}</div>
                  </div>
                  
                  <div>
                    <strong className="text-gray-300">Control Measures:</strong>
                    <ul className="list-disc list-inside text-white text-sm mt-1 space-y-1">
                      {threshold.controlMeasures.slice(0, 3).map((measure, index) => (
                        <li key={index}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Nursery Quality Control Tab */}
        <TabsContent value="nursery" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Nursery Quality Control - Advanced Dutch Research Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">White Fly Count</Label>
                  <Input
                    type="number"
                    value={nurseryQuality.whitefly}
                    onChange={(e) => setNurseryQuality(prev => ({ ...prev, whitefly: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-xs text-gray-400">Threshold: &lt;{NURSERY_QUALITY_STANDARDS.whitefly.threshold} per sticky card/week</span>
                </div>
                
                <div>
                  <Label className="text-gray-300">Thrips Count</Label>
                  <Input
                    type="number"
                    value={nurseryQuality.thrips}
                    onChange={(e) => setNurseryQuality(prev => ({ ...prev, thrips: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-xs text-gray-400">Threshold: &lt;{NURSERY_QUALITY_STANDARDS.thrips.threshold} per sticky card/week</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={nurseryQuality.hasVisibleDiseases}
                    onChange={(e) => setNurseryQuality(prev => ({ ...prev, hasVisibleDiseases: e.target.checked }))}
                    className="rounded border-gray-600"
                  />
                  <Label className="text-gray-300">Visible Diseases Present</Label>
                </div>
              </div>
              
              {(() => {
                const validation = validateNursery();
                return (
                  <div className={`p-4 rounded-lg border ${validation.passed ? 
                    'bg-green-900/30 border-green-600/30 text-green-300' : 
                    'bg-red-900/30 border-red-600/30 text-red-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validation.passed ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      <span className="font-medium">
                        {validation.passed ? 'PASSED - Plants Approved' : 'FAILED - Reject Delivery'}
                      </span>
                    </div>
                    <div>Quality Score: {validation.score}/100</div>
                    <div>Rejection Rate: {validation.rejectionRate}%</div>
                    {validation.issues.length > 0 && (
                      <div className="mt-2">
                        <strong>Issues:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {validation.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {scoutingRecords.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Pest Count vs Thresholds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getPestChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                        <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#EF4444" name="Current Count" />
                        <Bar dataKey="threshold" fill="#F59E0B" name="Action Threshold" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {overallScore && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-green-400">IPM Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(overallScore.pestScores).map(([pest, score], index) => (
                        <div key={pest} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300 capitalize">
                              {pest.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <span className="text-white font-medium">{score}/100</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                      
                      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                        <h4 className="text-green-400 font-medium mb-2">Priority Recommendations</h4>
                        <ul className="space-y-1">
                          {overallScore.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-1">
                              <span className="text-green-400 mt-0.5">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
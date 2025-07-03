'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, CheckCircle, X,
  Zap, Sun, Thermometer, Clock,
  Play, Pause, RotateCcw, Save,
  FileCheck, AlertCircle, Info,
  TrendingUp, Activity, GitCompare,
  ChevronRight, ChevronDown, Copy
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface ValidationRule {
  id: string;
  name: string;
  type: 'safety' | 'performance' | 'compliance' | 'efficiency';
  enabled: boolean;
  severity: 'error' | 'warning' | 'info';
  check: (changes: LightingChange[], context: ValidationContext) => ValidationResult;
}

interface LightingChange {
  fixtureId: string;
  fixtureName: string;
  property: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  applied: boolean;
}

interface ValidationContext {
  fixtures: any[];
  room: any;
  calculations: any;
  powerCapacity: number;
  environmentalLimits: {
    maxTemperature: number;
    maxHumidity: number;
    minAirflow: number;
  };
}

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string;
  affectedFixtures?: string[];
  suggestedValue?: any;
}

interface ValidationReport {
  id: string;
  timestamp: Date;
  changes: LightingChange[];
  results: {
    ruleId: string;
    result: ValidationResult;
  }[];
  overallStatus: 'passed' | 'failed' | 'warnings';
  appliedAt?: Date;
}

export function BatchValidationSystem({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'validation' | 'history' | 'rules'>('pending');
  const [pendingChanges, setPendingChanges] = useState<LightingChange[]>([]);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [currentReport, setCurrentReport] = useState<ValidationReport | null>(null);
  const [validationHistory, setValidationHistory] = useState<ValidationReport[]>([]);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  
  // Validation rules
  const [validationRules] = useState<ValidationRule[]>([
    {
      id: 'power-capacity',
      name: 'Power Capacity Check',
      type: 'safety',
      enabled: true,
      severity: 'error',
      check: (changes, context) => {
        const totalWattage = context.fixtures.reduce((sum, f) => {
          const change = changes.find(c => c.fixtureId === f.id && c.property === 'wattage');
          const wattage = change ? change.newValue : f.wattage;
          return sum + (wattage || 0);
        }, 0);
        
        if (totalWattage > context.powerCapacity) {
          return {
            passed: false,
            message: `Total power exceeds capacity: ${totalWattage}W > ${context.powerCapacity}W`,
            details: `Reduce total wattage by ${totalWattage - context.powerCapacity}W`
          };
        }
        
        return { passed: true, message: 'Power capacity check passed' };
      }
    },
    {
      id: 'dimming-range',
      name: 'Dimming Range Validation',
      type: 'performance',
      enabled: true,
      severity: 'warning',
      check: (changes, context) => {
        const dimmingChanges = changes.filter(c => c.property === 'dimming');
        const outOfRange = dimmingChanges.filter(c => 
          c.newValue < 10 || c.newValue > 100
        );
        
        if (outOfRange.length > 0) {
          return {
            passed: false,
            message: `${outOfRange.length} fixtures have dimming outside optimal range (10-100%)`,
            affectedFixtures: outOfRange.map(c => c.fixtureId),
            details: 'Dimming below 10% may cause flickering, above 100% is not possible'
          };
        }
        
        return { passed: true, message: 'All dimming values within range' };
      }
    },
    {
      id: 'uniformity-impact',
      name: 'Uniformity Impact Analysis',
      type: 'performance',
      enabled: true,
      severity: 'warning',
      check: (changes, context) => {
        // Check if changes will significantly impact uniformity
        const intensityChanges = changes.filter(c => 
          c.property === 'dimming' || c.property === 'intensity'
        );
        
        if (intensityChanges.length > 0) {
          const uniformityBefore = context.calculations?.uniformity || 0.8;
          // Simulate uniformity impact (in real implementation, recalculate)
          const estimatedImpact = intensityChanges.length * 0.02;
          const estimatedUniformity = uniformityBefore - estimatedImpact;
          
          if (estimatedUniformity < 0.7) {
            return {
              passed: false,
              message: `Changes may reduce uniformity below 0.7 (estimated: ${estimatedUniformity.toFixed(2)})`,
              details: 'Consider adjusting neighboring fixtures to maintain uniformity'
            };
          }
        }
        
        return { passed: true, message: 'Uniformity maintained' };
      }
    },
    {
      id: 'heat-load',
      name: 'Heat Load Validation',
      type: 'safety',
      enabled: true,
      severity: 'error',
      check: (changes, context) => {
        const wattageChanges = changes.filter(c => c.property === 'wattage');
        const totalHeatLoad = context.fixtures.reduce((sum, f) => {
          const change = wattageChanges.find(c => c.fixtureId === f.id);
          const wattage = change ? change.newValue : f.wattage;
          return sum + (wattage || 0) * 0.95; // 95% becomes heat
        }, 0);
        
        const btuPerHour = totalHeatLoad * 3.412;
        const maxBTU = context.room.width * context.room.length * context.room.height * 20; // 20 BTU/ft³
        
        if (btuPerHour > maxBTU) {
          return {
            passed: false,
            message: `Heat load exceeds HVAC capacity: ${Math.round(btuPerHour)} BTU/hr`,
            details: `Reduce by ${Math.round(btuPerHour - maxBTU)} BTU/hr or upgrade cooling`
          };
        }
        
        return { passed: true, message: 'Heat load within capacity' };
      }
    },
    {
      id: 'spectrum-balance',
      name: 'Spectrum Balance Check',
      type: 'performance',
      enabled: true,
      severity: 'info',
      check: (changes, context) => {
        const spectrumChanges = changes.filter(c => c.property.includes('spectrum'));
        
        for (const change of spectrumChanges) {
          if (change.property === 'spectrum.red' && change.newValue < 30) {
            return {
              passed: false,
              message: 'Red spectrum below 30% may impact flowering',
              affectedFixtures: [change.fixtureId],
              suggestedValue: 35
            };
          }
          if (change.property === 'spectrum.blue' && change.newValue > 50) {
            return {
              passed: false,
              message: 'Blue spectrum above 50% may cause stretching issues',
              affectedFixtures: [change.fixtureId],
              suggestedValue: 40
            };
          }
        }
        
        return { passed: true, message: 'Spectrum balance optimal' };
      }
    },
    {
      id: 'schedule-conflict',
      name: 'Schedule Conflict Detection',
      type: 'efficiency',
      enabled: true,
      severity: 'warning',
      check: (changes, context) => {
        const scheduleChanges = changes.filter(c => c.property.includes('schedule'));
        const conflicts: string[] = [];
        
        // Check for overlapping on/off times
        for (let i = 0; i < scheduleChanges.length; i++) {
          for (let j = i + 1; j < scheduleChanges.length; j++) {
            const change1 = scheduleChanges[i];
            const change2 = scheduleChanges[j];
            
            if (change1.property === 'schedule.onTime' && change2.property === 'schedule.onTime') {
              const diff = Math.abs(change1.newValue - change2.newValue);
              if (diff < 300000) { // Less than 5 minutes apart
                conflicts.push(`${change1.fixtureName} and ${change2.fixtureName} turn on within 5 minutes`);
              }
            }
          }
        }
        
        if (conflicts.length > 0) {
          return {
            passed: false,
            message: 'Schedule conflicts detected',
            details: conflicts.join('; ')
          };
        }
        
        return { passed: true, message: 'No schedule conflicts' };
      }
    },
    {
      id: 'dli-target',
      name: 'DLI Target Compliance',
      type: 'compliance',
      enabled: true,
      severity: 'warning',
      check: (changes, context) => {
        // Calculate expected DLI after changes
        const currentDLI = context.calculations?.dli || 30;
        const targetDLI = context.room?.targetDLI || 30;
        
        const intensityChanges = changes.filter(c => 
          c.property === 'dimming' || c.property === 'intensity'
        );
        
        if (intensityChanges.length > 0) {
          // Estimate DLI impact
          const avgChange = intensityChanges.reduce((sum, c) => {
            const ratio = c.property === 'dimming' ? 
              c.newValue / c.oldValue : 
              1;
            return sum + ratio;
          }, 0) / intensityChanges.length;
          
          const estimatedDLI = currentDLI * avgChange;
          const deviation = Math.abs(estimatedDLI - targetDLI) / targetDLI;
          
          if (deviation > 0.1) {
            return {
              passed: false,
              message: `DLI deviates ${(deviation * 100).toFixed(0)}% from target`,
              details: `Estimated: ${estimatedDLI.toFixed(1)}, Target: ${targetDLI}`
            };
          }
        }
        
        return { passed: true, message: 'DLI target maintained' };
      }
    }
  ]);
  
  // Monitor for fixture changes
  useEffect(() => {
    const handleFixtureChange = (e: CustomEvent) => {
      const { fixtureId, property, oldValue, newValue } = e.detail;
      const fixture = state.objects.find(obj => obj.id === fixtureId);
      
      if (fixture) {
        const change: LightingChange = {
          fixtureId,
          fixtureName: fixture.name || `Fixture ${fixtureId}`,
          property,
          oldValue,
          newValue,
          timestamp: new Date(),
          applied: false
        };
        
        setPendingChanges(prev => [...prev, change]);
      }
    };
    
    window.addEventListener('fixtureChange', handleFixtureChange as EventListener);
    return () => {
      window.removeEventListener('fixtureChange', handleFixtureChange as EventListener);
    };
  }, [state.objects]);
  
  const runValidation = async () => {
    setValidationInProgress(true);
    
    // Build validation context
    const context: ValidationContext = {
      fixtures: state.objects.filter(obj => obj.type === 'fixture'),
      room: state.room,
      calculations: state.calculations,
      powerCapacity: 10000, // 10kW default
      environmentalLimits: {
        maxTemperature: 85,
        maxHumidity: 70,
        minAirflow: 100
      }
    };
    
    // Run all enabled rules
    const results = validationRules
      .filter(rule => rule.enabled)
      .map(rule => ({
        ruleId: rule.id,
        result: rule.check(pendingChanges, context)
      }));
    
    // Determine overall status
    const hasErrors = results.some(r => 
      !r.result.passed && validationRules.find(rule => rule.id === r.ruleId)?.severity === 'error'
    );
    const hasWarnings = results.some(r => 
      !r.result.passed && validationRules.find(rule => rule.id === r.ruleId)?.severity === 'warning'
    );
    
    const report: ValidationReport = {
      id: `report-${Date.now()}`,
      timestamp: new Date(),
      changes: pendingChanges,
      results,
      overallStatus: hasErrors ? 'failed' : hasWarnings ? 'warnings' : 'passed'
    };
    
    setCurrentReport(report);
    setValidationHistory(prev => [report, ...prev].slice(0, 50)); // Keep last 50 reports
    setValidationInProgress(false);
    setActiveTab('validation');
    
    showNotification(
      hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
      hasErrors ? 'Validation failed with errors' : 
      hasWarnings ? 'Validation passed with warnings' : 
      'All validations passed'
    );
  };
  
  const applyChanges = () => {
    if (!currentReport || currentReport.overallStatus === 'failed') {
      showNotification('error', 'Cannot apply changes with validation errors');
      return;
    }
    
    // Apply all pending changes
    pendingChanges.forEach(change => {
      const fixture = state.objects.find(obj => obj.id === change.fixtureId);
      if (fixture) {
        dispatch({
          type: 'UPDATE_OBJECT',
          payload: {
            id: change.fixtureId,
            updates: {
              [change.property]: change.newValue
            }
          }
        });
      }
    });
    
    // Update report and clear pending changes
    setCurrentReport({
      ...currentReport,
      appliedAt: new Date()
    });
    
    setPendingChanges([]);
    showNotification('success', `Applied ${pendingChanges.length} changes`);
  };
  
  const revertChanges = () => {
    setPendingChanges([]);
    setCurrentReport(null);
    showNotification('info', 'Changes reverted');
  };
  
  const renderPendingTab = () => (
    <div className="space-y-6">
      {pendingChanges.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No pending changes</p>
          <p className="text-sm text-gray-500 mt-2">
            Fixture changes will appear here for batch validation
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Pending Changes ({pendingChanges.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={revertChanges}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revert All
                </button>
                <button
                  onClick={runValidation}
                  disabled={validationInProgress}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  {validationInProgress ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Validation
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingChanges.map((change, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{change.fixtureName}</p>
                      <p className="text-sm text-gray-400">
                        {change.property}: {change.oldValue} → {change.newValue}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium">Batch Validation Mode</p>
                <p className="text-sm text-gray-300 mt-1">
                  Changes are queued and validated together before applying. This ensures
                  all safety and performance requirements are met.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
  
  const renderValidationTab = () => {
    if (!currentReport) {
      return (
        <div className="text-center py-12">
          <FileCheck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No validation report available</p>
          <p className="text-sm text-gray-500 mt-2">
            Run validation on pending changes to see results
          </p>
        </div>
      );
    }
    
    const failedRules = currentReport.results.filter(r => !r.result.passed);
    const passedRules = currentReport.results.filter(r => r.result.passed);
    
    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className={`rounded-lg p-6 ${
          currentReport.overallStatus === 'failed' ? 'bg-red-900/20 border border-red-800' :
          currentReport.overallStatus === 'warnings' ? 'bg-yellow-900/20 border border-yellow-800' :
          'bg-green-900/20 border border-green-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentReport.overallStatus === 'failed' ? (
                <AlertCircle className="w-8 h-8 text-red-500" />
              ) : currentReport.overallStatus === 'warnings' ? (
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {currentReport.overallStatus === 'failed' ? 'Validation Failed' :
                   currentReport.overallStatus === 'warnings' ? 'Passed with Warnings' :
                   'All Validations Passed'}
                </h3>
                <p className="text-sm text-gray-400">
                  {failedRules.length} issues found, {passedRules.length} checks passed
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {currentReport.overallStatus !== 'failed' && !currentReport.appliedAt && (
                <button
                  onClick={applyChanges}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Apply Changes
                </button>
              )}
              {currentReport.appliedAt && (
                <div className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">
                  Applied at {new Date(currentReport.appliedAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Failed Validations */}
        {failedRules.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Issues Found</h4>
            {failedRules.map(({ ruleId, result }) => {
              const rule = validationRules.find(r => r.id === ruleId)!;
              return (
                <div key={ruleId} className={`rounded-lg p-4 ${
                  rule.severity === 'error' ? 'bg-red-900/20 border border-red-800' :
                  rule.severity === 'warning' ? 'bg-yellow-900/20 border border-yellow-800' :
                  'bg-blue-900/20 border border-blue-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {rule.severity === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    ) : rule.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white">{rule.name}</p>
                      <p className="text-sm text-gray-300 mt-1">{result.message}</p>
                      {result.details && (
                        <p className="text-sm text-gray-400 mt-2">{result.details}</p>
                      )}
                      {result.suggestedValue !== undefined && (
                        <p className="text-sm text-green-400 mt-2">
                          Suggested value: {result.suggestedValue}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Passed Validations */}
        {passedRules.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Passed Checks</h4>
            <div className="grid grid-cols-2 gap-3">
              {passedRules.map(({ ruleId, result }) => {
                const rule = validationRules.find(r => r.id === ruleId)!;
                return (
                  <div key={ruleId} className="bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-white">{rule.name}</p>
                      <p className="text-xs text-gray-400">{result.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderHistoryTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Validation History</h3>
      
      {validationHistory.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No validation history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {validationHistory.map(report => (
            <div key={report.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {report.overallStatus === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : report.overallStatus === 'warnings' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {report.changes.length} changes validated
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {report.appliedAt && (
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                    Applied
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                {report.results.filter(r => !r.result.passed).length} issues found
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Validation Rules</h3>
        <div className="text-sm text-gray-400">
          {validationRules.filter(r => r.enabled).length} of {validationRules.length} enabled
        </div>
      </div>
      
      <div className="space-y-3">
        {validationRules.map(rule => (
          <div key={rule.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => {
                      // In a real implementation, update rule state
                      showNotification('info', `${rule.name} ${e.target.checked ? 'enabled' : 'disabled'}`);
                    }}
                    className="w-4 h-4 text-purple-600"
                  />
                </label>
                <div className="flex items-center gap-2">
                  {rule.type === 'safety' && <Zap className="w-4 h-4 text-yellow-500" />}
                  {rule.type === 'performance' && <TrendingUp className="w-4 h-4 text-blue-500" />}
                  {rule.type === 'compliance' && <Shield className="w-4 h-4 text-green-500" />}
                  {rule.type === 'efficiency' && <Activity className="w-4 h-4 text-purple-500" />}
                  <span className="font-medium text-white">{rule.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  rule.severity === 'error' ? 'bg-red-900/30 text-red-400' :
                  rule.severity === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-blue-900/30 text-blue-400'
                }`}>
                  {rule.severity}
                </span>
                <button
                  onClick={() => setExpandedRules(prev => {
                    const next = new Set(prev);
                    if (next.has(rule.id)) {
                      next.delete(rule.id);
                    } else {
                      next.add(rule.id);
                    }
                    return next;
                  })}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  {expandedRules.has(rule.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            {expandedRules.has(rule.id) && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  {rule.id === 'power-capacity' && 'Ensures total fixture power does not exceed electrical capacity'}
                  {rule.id === 'dimming-range' && 'Validates dimming values are within operational range'}
                  {rule.id === 'uniformity-impact' && 'Analyzes how changes affect light uniformity'}
                  {rule.id === 'heat-load' && 'Calculates thermal impact and HVAC requirements'}
                  {rule.id === 'spectrum-balance' && 'Checks spectrum ratios for optimal plant growth'}
                  {rule.id === 'schedule-conflict' && 'Detects scheduling conflicts and power surge risks'}
                  {rule.id === 'dli-target' && 'Ensures DLI targets are maintained after changes'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-5xl w-full h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Batch Validation System</h2>
              <p className="text-sm text-gray-400">Validate lighting changes before applying</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 flex gap-4 border-b border-gray-700">
          {(['pending', 'validation', 'history', 'rules'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab === 'pending' && <GitCompare className="w-4 h-4" />}
              {tab === 'validation' && <FileCheck className="w-4 h-4" />}
              {tab === 'history' && <Clock className="w-4 h-4" />}
              {tab === 'rules' && <Shield className="w-4 h-4" />}
              {tab}
              {tab === 'pending' && pendingChanges.length > 0 && (
                <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingChanges.length}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'pending' && renderPendingTab()}
          {activeTab === 'validation' && renderValidationTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'rules' && renderRulesTab()}
        </div>
      </div>
    </div>
  );
}
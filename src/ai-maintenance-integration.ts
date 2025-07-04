// AI Maintenance Integration Service
// Combines lifetime tracking with AI predictive maintenance

import { Equipment, LifetimeAnalysis, equipmentManager } from './equipment-manager';
import { runtimeMonitor } from './equipment-runtime-monitor';

export interface AIMaintenancePrediction {
  equipmentId: string;
  equipmentName: string;
  // Combined health score (0-100)
  overallHealthScore: number;
  // Failure probability considering lifetime and other factors
  failureProbability: number;
  // Days to predicted failure
  daysToFailure: number | null;
  // Lifetime-specific data
  lifetimeAnalysis: LifetimeAnalysis | null;
  // AI-enhanced predictions
  predictions: {
    component: string;
    probability: number;
    timeframe: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost: number;
    reason: string;
  }[];
  // AI recommendations
  recommendations: {
    action: string;
    urgency: 'immediate' | 'soon' | 'scheduled' | 'monitor';
    cost: number;
    savings: number;
    description: string;
    lifetimeExtension?: number; // Additional hours if action taken
  }[];
  // Anomaly detection
  anomalies: {
    metric: string;
    value: number;
    expected: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
  }[];
}

export class AIMaintenanceService {
  // Machine learning model weights (in production, these would be trained)
  private readonly modelWeights = {
    lifetime: 0.35,        // 35% weight on lifetime data
    usagePattern: 0.25,    // 25% weight on usage patterns
    maintenance: 0.20,     // 20% weight on maintenance history
    environment: 0.10,     // 10% weight on environmental factors
    performance: 0.10      // 10% weight on performance metrics
  };

  // Failure probability thresholds
  private readonly failureThresholds = {
    critical: 0.80,    // >80% probability
    high: 0.60,        // 60-80% probability
    medium: 0.40,      // 40-60% probability
    low: 0.20          // 20-40% probability
  };

  // Generate AI-enhanced maintenance prediction for equipment
  generatePrediction(equipment: Equipment): AIMaintenancePrediction {
    const lifetimeAnalysis = equipmentManager.getLifetimeAnalysis(equipment.id);
    
    // Calculate component scores
    const lifetimeScore = this.calculateLifetimeScore(lifetimeAnalysis);
    const usageScore = this.calculateUsageScore(equipment);
    const maintenanceScore = this.calculateMaintenanceScore(equipment);
    const environmentScore = this.calculateEnvironmentScore(equipment);
    const performanceScore = this.calculatePerformanceScore(equipment);

    // Calculate overall health score (inverse of failure risk)
    const overallHealthScore = Math.round(
      (1 - (
        lifetimeScore * this.modelWeights.lifetime +
        usageScore * this.modelWeights.usagePattern +
        maintenanceScore * this.modelWeights.maintenance +
        environmentScore * this.modelWeights.environment +
        performanceScore * this.modelWeights.performance
      )) * 100
    );

    // Calculate failure probability
    const failureProbability = 100 - overallHealthScore;

    // Predict days to failure
    const daysToFailure = this.predictDaysToFailure(
      equipment,
      lifetimeAnalysis,
      failureProbability
    );

    // Generate component-level predictions
    const predictions = this.generateComponentPredictions(
      equipment,
      lifetimeAnalysis,
      failureProbability
    );

    // Generate AI recommendations
    const recommendations = this.generateRecommendations(
      equipment,
      lifetimeAnalysis,
      predictions,
      failureProbability
    );

    // Detect anomalies
    const anomalies = this.detectAnomalies(equipment, lifetimeAnalysis);

    return {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      overallHealthScore,
      failureProbability,
      daysToFailure,
      lifetimeAnalysis,
      predictions,
      recommendations,
      anomalies
    };
  }

  // Calculate lifetime-based failure score (0-1, higher = worse)
  private calculateLifetimeScore(analysis: LifetimeAnalysis | null): number {
    if (!analysis) return 0.5; // Default if no lifetime data

    // Use exponential curve for lifetime degradation
    const percentageUsed = analysis.percentageUsed / 100;
    
    if (percentageUsed >= 1.0) return 1.0; // Expired
    if (percentageUsed >= 0.9) return 0.85; // Critical
    if (percentageUsed >= 0.75) return 0.65; // Warning
    
    // Exponential degradation curve
    return Math.pow(percentageUsed, 2);
  }

  // Calculate usage pattern score
  private calculateUsageScore(equipment: Equipment): number {
    const recentUsage = equipment.usage.dailyHours.slice(-30);
    if (recentUsage.length === 0) return 0.3;

    const avgUsage = recentUsage.reduce((a, b) => a + b, 0) / recentUsage.length;
    const maxUsage = Math.max(...recentUsage);
    
    // High variance in usage patterns indicates stress
    const variance = recentUsage.reduce((sum, hours) => {
      return sum + Math.pow(hours - avgUsage, 2);
    }, 0) / recentUsage.length;

    const varianceScore = Math.min(variance / 100, 1);
    const overuseScore = Math.min(maxUsage / 24, 1);

    return (varianceScore * 0.3 + overuseScore * 0.7);
  }

  // Calculate maintenance history score
  private calculateMaintenanceScore(equipment: Equipment): number {
    const maintenanceHistory = equipment.maintenance.history;
    const daysSinceLastMaintenance = equipment.maintenance.nextDue
      ? (equipment.maintenance.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      : 180; // Default to 6 months if no data

    // Overdue maintenance increases failure risk
    if (daysSinceLastMaintenance < 0) {
      return Math.min(1.0, Math.abs(daysSinceLastMaintenance) / 30);
    }

    // Recent unscheduled maintenance indicates problems
    const recentUnscheduled = maintenanceHistory.filter(m => 
      m.type === 'unscheduled' || m.type === 'emergency'
    ).length;

    return Math.min(recentUnscheduled * 0.2, 1.0);
  }

  // Calculate environmental score (simplified)
  private calculateEnvironmentScore(equipment: Equipment): number {
    // In production, this would use actual sensor data
    // For now, use equipment type heuristics
    switch (equipment.type) {
      case 'lighting':
        // LEDs are sensitive to heat
        return 0.3;
      case 'hvac':
        // HVAC works harder in extreme conditions
        return 0.4;
      case 'pump':
        // Pumps sensitive to cavitation, pressure
        return 0.5;
      default:
        return 0.2;
    }
  }

  // Calculate performance score
  private calculatePerformanceScore(equipment: Equipment): number {
    const efficiency = equipment.specifications.efficiency || 100;
    const degradation = (100 - efficiency) / 100;
    
    // Power consumption anomaly detection
    const expectedPower = equipment.specifications.power || 0;
    const powerVariance = 0.1; // 10% variance threshold
    
    return Math.min(degradation + powerVariance, 1.0);
  }

  // Predict days to failure using multiple factors
  private predictDaysToFailure(
    equipment: Equipment,
    lifetimeAnalysis: LifetimeAnalysis | null,
    failureProbability: number
  ): number | null {
    if (failureProbability < 20) return null; // Too low to predict

    // Start with lifetime-based prediction
    let daysToFailure = lifetimeAnalysis?.remainingDays || 365;

    // Adjust based on failure probability
    const probabilityFactor = 1 - (failureProbability / 100);
    daysToFailure *= probabilityFactor;

    // Adjust based on maintenance schedule
    if (equipment.maintenance.nextDue) {
      const daysToMaintenance = Math.max(0,
        (equipment.maintenance.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      // If maintenance is overdue, reduce days to failure
      if (daysToMaintenance < 0) {
        daysToFailure *= 0.7;
      }
    }

    return Math.max(0, Math.round(daysToFailure));
  }

  // Generate component-level failure predictions
  private generateComponentPredictions(
    equipment: Equipment,
    lifetimeAnalysis: LifetimeAnalysis | null,
    overallFailureProbability: number
  ): AIMaintenancePrediction['predictions'] {
    const predictions: AIMaintenancePrediction['predictions'] = [];

    // Lifetime-based predictions
    if (lifetimeAnalysis && lifetimeAnalysis.status !== 'healthy') {
      predictions.push({
        component: `${equipment.type} Core Components`,
        probability: Math.min(95, lifetimeAnalysis.percentageUsed),
        timeframe: `${lifetimeAnalysis.remainingDays} days`,
        impact: lifetimeAnalysis.status === 'critical' ? 'critical' : 'high',
        estimatedCost: this.estimateReplacementCost(equipment),
        reason: `Component at ${lifetimeAnalysis.percentageUsed}% of rated lifetime`
      });
    }

    // Type-specific predictions
    switch (equipment.type) {
      case 'lighting':
        if (overallFailureProbability > 40) {
          predictions.push({
            component: 'LED Driver',
            probability: overallFailureProbability * 0.7,
            timeframe: '2-4 weeks',
            impact: 'high',
            estimatedCost: equipment.cost.purchase * 0.15,
            reason: 'Driver degradation detected from power consumption patterns'
          });
        }
        break;

      case 'hvac':
        if (overallFailureProbability > 50) {
          predictions.push({
            component: 'Compressor',
            probability: overallFailureProbability * 0.6,
            timeframe: '4-6 weeks',
            impact: 'critical',
            estimatedCost: equipment.cost.purchase * 0.4,
            reason: 'Efficiency degradation indicates compressor wear'
          });
        }
        break;

      case 'pump':
        if (overallFailureProbability > 45) {
          predictions.push({
            component: 'Bearings',
            probability: overallFailureProbability * 0.8,
            timeframe: '3-5 weeks',
            impact: 'high',
            estimatedCost: equipment.cost.purchase * 0.2,
            reason: 'Vibration patterns suggest bearing wear'
          });
        }
        break;
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  // Generate AI recommendations
  private generateRecommendations(
    equipment: Equipment,
    lifetimeAnalysis: LifetimeAnalysis | null,
    predictions: AIMaintenancePrediction['predictions'],
    failureProbability: number
  ): AIMaintenancePrediction['recommendations'] {
    const recommendations: AIMaintenancePrediction['recommendations'] = [];

    // Lifetime extension recommendations
    if (lifetimeAnalysis && lifetimeAnalysis.status === 'warning') {
      recommendations.push({
        action: 'Implement Lifetime Extension Protocol',
        urgency: 'soon',
        cost: equipment.cost.purchase * 0.05,
        savings: equipment.cost.purchase * 0.3,
        description: 'Reduce operating hours and optimize usage patterns to extend lifetime by 15-20%',
        lifetimeExtension: lifetimeAnalysis.expectedLifetime * 0.15
      });
    }

    // Critical lifetime recommendations
    if (lifetimeAnalysis && lifetimeAnalysis.status === 'critical') {
      recommendations.push({
        action: 'Schedule Replacement',
        urgency: 'soon',
        cost: equipment.cost.purchase,
        savings: equipment.cost.purchase * 0.5,
        description: `Equipment at ${lifetimeAnalysis.percentageUsed}% lifetime. Plan replacement to avoid emergency failure`,
        lifetimeExtension: 0
      });
    }

    // Predictive maintenance based on failure probability
    if (failureProbability > 60) {
      recommendations.push({
        action: 'Perform Comprehensive Inspection',
        urgency: 'immediate',
        cost: 200,
        savings: predictions[0]?.estimatedCost || 1000,
        description: 'AI detects high failure risk. Immediate inspection can prevent costly breakdown'
      });
    }

    // Component-specific recommendations
    predictions.forEach(prediction => {
      if (prediction.probability > 70) {
        recommendations.push({
          action: `Replace ${prediction.component}`,
          urgency: prediction.impact === 'critical' ? 'immediate' : 'soon',
          cost: prediction.estimatedCost,
          savings: prediction.estimatedCost * 3,
          description: `${prediction.reason}. Proactive replacement prevents downtime`
        });
      }
    });

    // Usage optimization
    if (equipment.usage.dailyHours.slice(-7).some(h => h > 20)) {
      recommendations.push({
        action: 'Optimize Usage Schedule',
        urgency: 'scheduled',
        cost: 0,
        savings: equipment.cost.purchase * 0.1,
        description: 'Reduce continuous operation periods to prevent overheating and extend lifetime',
        lifetimeExtension: lifetimeAnalysis?.expectedLifetime ? lifetimeAnalysis.expectedLifetime * 0.1 : undefined
      });
    }

    return recommendations.sort((a, b) => {
      const urgencyOrder = { immediate: 0, soon: 1, scheduled: 2, monitor: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  // Detect anomalies in equipment metrics
  private detectAnomalies(
    equipment: Equipment,
    lifetimeAnalysis: LifetimeAnalysis | null
  ): AIMaintenancePrediction['anomalies'] {
    const anomalies: AIMaintenancePrediction['anomalies'] = [];

    // Lifetime anomaly
    if (lifetimeAnalysis) {
      const expectedUsageRate = lifetimeAnalysis.expectedLifetime / (5 * 365 * 24); // 5 year design life
      const actualUsageRate = lifetimeAnalysis.totalHours / 
        ((Date.now() - equipment.purchaseDate.getTime()) / (1000 * 60 * 60));
      
      if (actualUsageRate > expectedUsageRate * 1.2) {
        anomalies.push({
          metric: 'Usage Rate',
          value: actualUsageRate,
          expected: expectedUsageRate,
          deviation: ((actualUsageRate - expectedUsageRate) / expectedUsageRate) * 100,
          severity: actualUsageRate > expectedUsageRate * 1.5 ? 'high' : 'medium'
        });
      }
    }

    // Power consumption anomaly
    if (equipment.specifications.power) {
      const currentPower = equipment.specifications.power * 1.1; // Simulated current draw
      const expectedPower = equipment.specifications.power;
      const deviation = ((currentPower - expectedPower) / expectedPower) * 100;
      
      if (deviation > 10) {
        anomalies.push({
          metric: 'Power Consumption',
          value: currentPower,
          expected: expectedPower,
          deviation,
          severity: deviation > 20 ? 'high' : deviation > 15 ? 'medium' : 'low'
        });
      }
    }

    return anomalies;
  }

  // Estimate replacement cost based on equipment type and age
  private estimateReplacementCost(equipment: Equipment): number {
    const baseCost = equipment.cost.purchase;
    const age = (Date.now() - equipment.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Adjust for inflation and technology improvements
    const inflationFactor = Math.pow(1.03, age); // 3% annual inflation
    const techDiscount = equipment.type === 'lighting' ? 0.8 : 0.95; // LED prices drop faster
    
    return Math.round(baseCost * inflationFactor * techDiscount);
  }

  // Get all equipment with AI predictions
  getAllPredictions(): AIMaintenancePrediction[] {
    const allEquipment = Array.from(equipmentManager['equipment'].values());
    return allEquipment.map(eq => this.generatePrediction(eq));
  }

  // Get critical alerts based on AI analysis
  getCriticalAlerts(): {
    id: string;
    equipmentName: string;
    severity: 'warning' | 'critical';
    message: string;
    action: string;
  }[] {
    const predictions = this.getAllPredictions();
    const alerts: any[] = [];

    predictions.forEach(pred => {
      // Lifetime alerts
      if (pred.lifetimeAnalysis) {
        if (pred.lifetimeAnalysis.status === 'critical' || pred.lifetimeAnalysis.status === 'expired') {
          alerts.push({
            id: `lifetime-${pred.equipmentId}`,
            equipmentName: pred.equipmentName,
            severity: 'critical',
            message: `Equipment at ${pred.lifetimeAnalysis.percentageUsed}% of rated lifetime`,
            action: 'Schedule immediate replacement'
          });
        } else if (pred.lifetimeAnalysis.status === 'warning') {
          alerts.push({
            id: `lifetime-${pred.equipmentId}`,
            equipmentName: pred.equipmentName,
            severity: 'warning',
            message: `Equipment approaching end of life (${pred.lifetimeAnalysis.remainingDays} days remaining)`,
            action: 'Plan replacement within 3 months'
          });
        }
      }

      // Failure prediction alerts
      if (pred.failureProbability > 70) {
        alerts.push({
          id: `failure-${pred.equipmentId}`,
          equipmentName: pred.equipmentName,
          severity: pred.failureProbability > 85 ? 'critical' : 'warning',
          message: `${pred.failureProbability}% failure probability within ${pred.daysToFailure || 'N/A'} days`,
          action: pred.recommendations[0]?.action || 'Perform inspection'
        });
      }

      // Anomaly alerts
      pred.anomalies.forEach(anomaly => {
        if (anomaly.severity === 'high') {
          alerts.push({
            id: `anomaly-${pred.equipmentId}-${anomaly.metric}`,
            equipmentName: pred.equipmentName,
            severity: 'warning',
            message: `${anomaly.metric} anomaly detected: ${anomaly.deviation.toFixed(1)}% deviation`,
            action: 'Investigate unusual operating conditions'
          });
        }
      });
    });

    return alerts;
  }
}

// Create singleton instance
export const aiMaintenanceService = new AIMaintenanceService();
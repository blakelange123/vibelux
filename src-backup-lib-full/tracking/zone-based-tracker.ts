// Enhanced Privacy-First Zone-Based Tracking System
// QR code entry/exit with optional biometric integration

import { v4 as uuidv4 } from 'uuid';

export type TrackingMode = 'zone-based' | 'continuous' | 'manual' | 'disabled';
export type DataSharingLevel = 'none' | 'aggregated' | 'supervisor' | 'full';
export type ExertionLevel = 'light' | 'moderate' | 'vigorous';
export type WorkType = 'harvesting' | 'transplanting' | 'pruning' | 'scouting' | 'cleaning' | 'general';

export interface WorkZone {
  id: string;
  name: string;
  type: 'greenhouse' | 'room' | 'section' | 'tray' | 'row' | 'station';
  location: {
    facility: string;
    area: string;
    coordinates?: { lat: number; lng: number };
  };
  qrCode: string;
  capacity: number;
  workTypes: WorkType[];
  expectedProductivity?: {
    plantsPerHour: number;
    qualityThreshold: number;
  };
}

export interface BiometricData {
  timestamp: Date;
  heartRate?: number;
  activeCalories?: number;
  steps?: number;
  workoutType?: WorkType;
  exertionLevel?: ExertionLevel;
  stressLevel?: number; // 0-100 based on HRV
  oxygenSaturation?: number;
  bodyTemperature?: number;
  restingHeartRate?: number;
}

export interface WorkSession {
  id: string;
  userId: string;
  zoneId: string;
  workType: WorkType;
  entryTime: Date;
  exitTime?: Date;
  duration?: number; // minutes
  
  // Productivity metrics
  plantsProcessed?: number;
  qualityScore?: number; // 0-100
  avgTimePerPlant?: number; // seconds
  issuesReported?: number;
  
  // Biometric data (if enabled)
  biometrics?: BiometricData[];
  avgHeartRate?: number;
  caloriesBurned?: number;
  peakExertion?: ExertionLevel;
  breaksSuggested?: number;
  breaksActuallyTaken?: number;
  
  // Privacy settings for this session
  dataSharing: DataSharingLevel;
  includeInAnalytics: boolean;
  
  // Session notes
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'tired' | 'stressed';
  challenges?: string[];
}

export interface EnhancedPrivacySettings {
  // Core tracking preferences
  trackingMode: TrackingMode;
  enableQRZoneEntry: boolean;
  enableBiometrics: boolean;
  enableProductivityTracking: boolean;
  
  // Data sharing controls
  dataSharing: DataSharingLevel;
  shareWithSupervisors: boolean;
  shareWithPeers: boolean;
  shareAggregatedData: boolean;
  
  // Biometric controls
  biometricDataTypes: {
    heartRate: boolean;
    calories: boolean;
    steps: boolean;
    stress: boolean;
    temperature: boolean;
    oxygenSaturation: boolean;
  };
  
  // Productivity controls
  allowProductivityComparisons: boolean;
  includeInTeamBenchmarks: boolean;
  enablePerformanceInsights: boolean;
  
  // Privacy preferences
  dataRetentionDays: number;
  allowPersonalDashboard: boolean;
  enableHealthInsights: boolean;
  autoDeleteAfterRetention: boolean;
  
  // Break & wellness
  enableBreakSuggestions: boolean;
  enableHealthAlerts: boolean;
  maxDailyHours: number;
  requiredBreakInterval: number; // minutes
  
  // Consent & control
  consentVersion: string;
  consentDate: Date;
  canWithdrawConsent: boolean;
  canExportData: boolean;
  canDeleteData: boolean;
}

export interface PersonalInsights {
  // Daily summary
  dailyStats: {
    date: Date;
    totalWorkTime: number;
    zonesWorked: string[];
    plantsProcessed: number;
    avgProductivity: number;
    caloriesBurned: number;
    steps: number;
    avgHeartRate: number;
    peakHeartRate: number;
    stressLevel: number;
    mood: string;
  };
  
  // Weekly trends
  weeklyTrends: {
    productivityTrend: 'improving' | 'stable' | 'declining';
    fitnessProgress: number; // % change
    stressLevels: number[];
    bestPerformanceDay: string;
    recommendedRestDay?: string;
  };
  
  // Health insights
  healthInsights: {
    avgDailyCalories: number;
    cardioFitnessScore: number;
    recoveryScore: number;
    sleepQualityImpact?: number;
    hydrationReminders: boolean;
    postureAlerts: boolean;
  };
  
  // Performance insights
  performanceInsights: {
    bestProductivityZones: string[];
    optimalWorkingHours: string[];
    qualityVsSpeedBalance: number;
    improvementSuggestions: string[];
    skillDevelopmentAreas: string[];
  };
}

export class ZoneBasedTracker {
  private workZones: Map<string, WorkZone> = new Map();
  private activeSessions: Map<string, WorkSession> = new Map();
  private userSettings: Map<string, EnhancedPrivacySettings> = new Map();
  private biometricBuffer: Map<string, BiometricData[]> = new Map();
  
  constructor() {
    this.initializeDefaultZones();
  }
  
  // Initialize default work zones
  private initializeDefaultZones(): void {
    const defaultZones: WorkZone[] = [
      {
        id: 'greenhouse-a',
        name: 'Greenhouse A',
        type: 'greenhouse',
        location: { facility: 'Main Farm', area: 'North Wing' },
        qrCode: 'VBX-ZONE-GHA',
        capacity: 20,
        workTypes: ['harvesting', 'scouting', 'pruning'],
        expectedProductivity: { plantsPerHour: 45, qualityThreshold: 85 }
      },
      {
        id: 'tray-section-b12',
        name: 'Tray Section B12',
        type: 'tray',
        location: { facility: 'Main Farm', area: 'Greenhouse B' },
        qrCode: 'VBX-ZONE-B12',
        capacity: 4,
        workTypes: ['transplanting', 'harvesting'],
        expectedProductivity: { plantsPerHour: 60, qualityThreshold: 90 }
      },
      {
        id: 'processing-station-1',
        name: 'Processing Station 1',
        type: 'station',
        location: { facility: 'Main Farm', area: 'Processing' },
        qrCode: 'VBX-ZONE-PS1',
        capacity: 6,
        workTypes: ['general', 'cleaning'],
        expectedProductivity: { plantsPerHour: 80, qualityThreshold: 95 }
      }
    ];
    
    defaultZones.forEach(zone => this.workZones.set(zone.id, zone));
  }
  
  // Scan QR code to enter/exit work zone
  public async scanQRZoneEntry(
    qrCode: string,
    userId: string,
    workType: WorkType,
    notes?: string
  ): Promise<{ success: boolean; session?: WorkSession; message: string }> {
    const zone = Array.from(this.workZones.values()).find(z => z.qrCode === qrCode);
    if (!zone) {
      return { success: false, message: 'Invalid QR code or zone not found' };
    }
    
    const userSettings = this.userSettings.get(userId);
    if (!userSettings?.enableQRZoneEntry) {
      return { success: false, message: 'Zone tracking not enabled for this user' };
    }
    
    // Check if user has active session
    const activeSession = Array.from(this.activeSessions.values())
      .find(s => s.userId === userId && !s.exitTime);
    
    if (activeSession) {
      // Exit current session
      return this.exitZone(userId, notes);
    } else {
      // Enter new zone
      return this.enterZone(zone.id, userId, workType, notes);
    }
  }
  
  // Enter work zone
  private async enterZone(
    zoneId: string,
    userId: string,
    workType: WorkType,
    notes?: string
  ): Promise<{ success: boolean; session?: WorkSession; message: string }> {
    const zone = this.workZones.get(zoneId);
    if (!zone) {
      return { success: false, message: 'Zone not found' };
    }
    
    const userSettings = this.userSettings.get(userId);
    if (!userSettings) {
      return { success: false, message: 'User settings not found' };
    }
    
    const session: WorkSession = {
      id: uuidv4(),
      userId,
      zoneId,
      workType,
      entryTime: new Date(),
      dataSharing: userSettings.dataSharing,
      includeInAnalytics: userSettings.shareAggregatedData,
      biometrics: userSettings.enableBiometrics ? [] : undefined,
      notes
    };
    
    this.activeSessions.set(session.id, session);
    
    // Start biometric monitoring if enabled
    if (userSettings.enableBiometrics) {
      this.startBiometricMonitoring(userId, session.id);
    }
    
    return {
      success: true,
      session,
      message: `Entered ${zone.name} for ${workType} work`
    };
  }
  
  // Exit work zone
  private async exitZone(
    userId: string,
    notes?: string
  ): Promise<{ success: boolean; session?: WorkSession; message: string }> {
    const activeSession = Array.from(this.activeSessions.values())
      .find(s => s.userId === userId && !s.exitTime);
    
    if (!activeSession) {
      return { success: false, message: 'No active session found' };
    }
    
    const exitTime = new Date();
    const duration = Math.round((exitTime.getTime() - activeSession.entryTime.getTime()) / 60000); // minutes
    
    // Finalize session
    activeSession.exitTime = exitTime;
    activeSession.duration = duration;
    if (notes) activeSession.notes = (activeSession.notes || '') + '; ' + notes;
    
    // Process biometric data if enabled
    const userSettings = this.userSettings.get(userId);
    if (userSettings?.enableBiometrics && activeSession.biometrics) {
      this.processBiometricData(activeSession);
    }
    
    // Stop biometric monitoring
    this.stopBiometricMonitoring(userId);
    
    const zone = this.workZones.get(activeSession.zoneId);
    return {
      success: true,
      session: activeSession,
      message: `Exited ${zone?.name || 'zone'} after ${duration} minutes`
    };
  }
  
  // Apple Watch biometric integration
  public async connectAppleWatch(userId: string): Promise<boolean> {
    // In a real implementation, this would connect to Apple HealthKit
    try {
      // Request HealthKit permissions
      const permissions = {
        read: [
          'heartRate',
          'activeEnergyBurned',
          'stepCount',
          'heartRateVariability',
          'oxygenSaturation',
          'bodyTemperature'
        ]
      };
      
      // Mock Apple HealthKit connection
      console.log('Requesting Apple HealthKit permissions:', permissions);
      
      return true;
    } catch (error) {
      console.error('Failed to connect Apple Watch:', error);
      return false;
    }
  }
  
  // Start biometric monitoring
  private startBiometricMonitoring(userId: string, sessionId: string): void {
    const userSettings = this.userSettings.get(userId);
    if (!userSettings?.enableBiometrics) return;
    
    // Initialize biometric buffer
    this.biometricBuffer.set(userId, []);
    
    // Start periodic data collection (every 30 seconds)
    const interval = setInterval(async () => {
      const biometricData = await this.collectBiometricData(userId, userSettings);
      if (biometricData) {
        const buffer = this.biometricBuffer.get(userId) || [];
        buffer.push(biometricData);
        this.biometricBuffer.set(userId, buffer);
        
        // Check for health alerts
        this.checkHealthAlerts(userId, biometricData);
      }
    }, 30000); // 30 seconds
    
    // Store interval ID for cleanup
    (this as any)[`interval_${userId}`] = interval;
  }
  
  // Stop biometric monitoring
  private stopBiometricMonitoring(userId: string): void {
    const interval = (this as any)[`interval_${userId}`];
    if (interval) {
      clearInterval(interval);
      delete (this as any)[`interval_${userId}`];
    }
    
    // Clear buffer
    this.biometricBuffer.delete(userId);
  }
  
  // Collect biometric data from Apple Watch
  private async collectBiometricData(
    userId: string,
    settings: EnhancedPrivacySettings
  ): Promise<BiometricData | null> {
    try {
      // Mock Apple HealthKit data collection
      // In reality, this would query HealthKit APIs
      const data: BiometricData = {
        timestamp: new Date(),
        ...(settings.biometricDataTypes.heartRate && { 
          heartRate: 70 + Math.random() * 50 // 70-120 bpm
        }),
        ...(settings.biometricDataTypes.calories && { 
          activeCalories: Math.random() * 10 // calories in last 30s
        }),
        ...(settings.biometricDataTypes.steps && { 
          steps: Math.floor(Math.random() * 20) // steps in last 30s
        }),
        ...(settings.biometricDataTypes.stress && { 
          stressLevel: Math.random() * 100 // 0-100 stress score
        })
      };
      
      return data;
    } catch (error) {
      console.error('Failed to collect biometric data:', error);
      return null;
    }
  }
  
  // Process biometric data for session
  private processBiometricData(session: WorkSession): void {
    if (!session.biometrics || session.biometrics.length === 0) return;
    
    const heartRates = session.biometrics
      .filter(b => b.heartRate)
      .map(b => b.heartRate!);
    
    const calories = session.biometrics
      .filter(b => b.activeCalories)
      .reduce((sum, b) => sum + (b.activeCalories || 0), 0);
    
    // Calculate session averages
    if (heartRates.length > 0) {
      session.avgHeartRate = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length);
    }
    
    session.caloriesBurned = Math.round(calories);
    
    // Determine peak exertion
    const maxHeartRate = Math.max(...heartRates);
    if (maxHeartRate > 140) session.peakExertion = 'vigorous';
    else if (maxHeartRate > 110) session.peakExertion = 'moderate';
    else session.peakExertion = 'light';
  }
  
  // Check for health alerts
  private checkHealthAlerts(userId: string, data: BiometricData): void {
    const userSettings = this.userSettings.get(userId);
    if (!userSettings?.enableHealthAlerts) return;
    
    const alerts: string[] = [];
    
    // Heart rate alerts
    if (data.heartRate && data.heartRate > 160) {
      alerts.push('High heart rate detected. Consider taking a break.');
    }
    
    // Stress level alerts
    if (data.stressLevel && data.stressLevel > 80) {
      alerts.push('High stress level detected. Consider breathing exercises.');
    }
    
    // Send alerts if any
    if (alerts.length > 0) {
      this.sendHealthAlerts(userId, alerts);
    }
  }
  
  // Send health alerts to user
  private sendHealthAlerts(userId: string, alerts: string[]): void {
    // In reality, this would send push notifications or in-app alerts
    console.log(`Health alerts for user ${userId}:`, alerts);
  }
  
  // Update user privacy settings
  public updatePrivacySettings(
    userId: string,
    settings: Partial<EnhancedPrivacySettings>
  ): void {
    const currentSettings = this.userSettings.get(userId) || this.getDefaultPrivacySettings();
    const updatedSettings = { ...currentSettings, ...settings };
    this.userSettings.set(userId, updatedSettings);
  }
  
  // Get default privacy settings
  public getDefaultPrivacySettings(): EnhancedPrivacySettings {
    return {
      trackingMode: 'zone-based',
      enableQRZoneEntry: true,
      enableBiometrics: false,
      enableProductivityTracking: true,
      
      dataSharing: 'aggregated',
      shareWithSupervisors: false,
      shareWithPeers: false,
      shareAggregatedData: true,
      
      biometricDataTypes: {
        heartRate: false,
        calories: false,
        steps: false,
        stress: false,
        temperature: false,
        oxygenSaturation: false
      },
      
      allowProductivityComparisons: true,
      includeInTeamBenchmarks: true,
      enablePerformanceInsights: true,
      
      dataRetentionDays: 90,
      allowPersonalDashboard: true,
      enableHealthInsights: false,
      autoDeleteAfterRetention: true,
      
      enableBreakSuggestions: true,
      enableHealthAlerts: false,
      maxDailyHours: 8,
      requiredBreakInterval: 120,
      
      consentVersion: '2.0',
      consentDate: new Date(),
      canWithdrawConsent: true,
      canExportData: true,
      canDeleteData: true
    };
  }
  
  // Generate personal insights
  public generatePersonalInsights(userId: string, days: number = 7): PersonalInsights | null {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === userId && s.exitTime)
      .filter(s => {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        return s.entryTime >= daysAgo;
      });
    
    if (userSessions.length === 0) return null;
    
    // Calculate daily stats
    const today = new Date();
    const todaySessions = userSessions.filter(s => 
      s.entryTime.toDateString() === today.toDateString()
    );
    
    const dailyStats = {
      date: today,
      totalWorkTime: todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      zonesWorked: [...new Set(todaySessions.map(s => s.zoneId))],
      plantsProcessed: todaySessions.reduce((sum, s) => sum + (s.plantsProcessed || 0), 0),
      avgProductivity: todaySessions.length > 0 
        ? todaySessions.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / todaySessions.length 
        : 0,
      caloriesBurned: todaySessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0),
      steps: 0, // Would be calculated from biometric data
      avgHeartRate: todaySessions.filter(s => s.avgHeartRate).length > 0
        ? todaySessions.reduce((sum, s) => sum + (s.avgHeartRate || 0), 0) / todaySessions.filter(s => s.avgHeartRate).length
        : 0,
      peakHeartRate: Math.max(...todaySessions.map(s => s.avgHeartRate || 0)),
      stressLevel: 0, // Would be calculated from biometric data
      mood: 'good' // Would come from user input
    };
    
    return {
      dailyStats,
      weeklyTrends: {
        productivityTrend: 'stable',
        fitnessProgress: 5.2,
        stressLevels: [20, 25, 30, 28, 22, 18, 24],
        bestPerformanceDay: 'Tuesday'
      },
      healthInsights: {
        avgDailyCalories: dailyStats.caloriesBurned,
        cardioFitnessScore: 78,
        recoveryScore: 85,
        hydrationReminders: true,
        postureAlerts: true
      },
      performanceInsights: {
        bestProductivityZones: ['greenhouse-a'],
        optimalWorkingHours: ['8:00 AM - 12:00 PM'],
        qualityVsSpeedBalance: 85,
        improvementSuggestions: [
          'Consider taking more frequent breaks',
          'Your productivity peaks in morning hours'
        ],
        skillDevelopmentAreas: ['harvesting efficiency']
      }
    };
  }
  
  // Export user data (GDPR compliance)
  public exportUserData(userId: string): any {
    const userSettings = this.userSettings.get(userId);
    if (!userSettings?.canExportData) {
      throw new Error('Data export not permitted for this user');
    }
    
    const userSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === userId);
    
    return {
      userId,
      settings: userSettings,
      sessions: userSessions,
      exportDate: new Date(),
      dataRetentionDays: userSettings.dataRetentionDays
    };
  }
  
  // Delete user data (GDPR compliance)
  public deleteUserData(userId: string): boolean {
    const userSettings = this.userSettings.get(userId);
    if (!userSettings?.canDeleteData) {
      return false;
    }
    
    // Delete all user sessions
    const sessionIds = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .map(([id, _]) => id);
    
    sessionIds.forEach(id => this.activeSessions.delete(id));
    
    // Delete user settings
    this.userSettings.delete(userId);
    
    // Clear biometric buffer
    this.biometricBuffer.delete(userId);
    
    return true;
  }
}
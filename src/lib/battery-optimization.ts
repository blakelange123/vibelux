// Battery optimization for continuous GPS tracking
interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface TrackingMode {
  name: string;
  locationUpdateInterval: number; // milliseconds
  highAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  description: string;
}

export class BatteryOptimizer {
  private battery: any = null;
  private currentMode: TrackingMode;
  private onModeChangeCallback?: (mode: TrackingMode) => void;
  private onBatteryChangeCallback?: (battery: BatteryInfo) => void;

  // Predefined tracking modes optimized for different battery levels
  private readonly trackingModes: Record<string, TrackingMode> = {
    // High accuracy, frequent updates (good battery)
    precision: {
      name: 'Precision Mode',
      locationUpdateInterval: 5000, // 5 seconds
      highAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      description: 'Maximum accuracy and frequent updates'
    },
    
    // Balanced accuracy and battery (normal battery)
    balanced: {
      name: 'Balanced Mode',
      locationUpdateInterval: 15000, // 15 seconds
      highAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
      description: 'Good accuracy with moderate battery usage'
    },
    
    // Battery saving mode (low battery)
    economy: {
      name: 'Economy Mode',
      locationUpdateInterval: 60000, // 1 minute
      highAccuracy: false,
      timeout: 30000,
      maximumAge: 60000,
      description: 'Basic tracking with maximum battery savings'
    },
    
    // Critical battery mode (very low battery)
    emergency: {
      name: 'Emergency Mode',
      locationUpdateInterval: 300000, // 5 minutes
      highAccuracy: false,
      timeout: 60000,
      maximumAge: 300000,
      description: 'Minimal tracking for emergency use only'
    }
  };

  constructor() {
    this.currentMode = this.trackingModes.balanced; // Default mode
    this.initializeBatteryAPI();
  }

  /**
   * Initialize Battery API if available
   */
  private async initializeBatteryAPI(): Promise<void> {
    try {
      if ('getBattery' in navigator) {
        this.battery = await (navigator as any).getBattery();
        this.setupBatteryEventListeners();
        this.optimizeForBatteryLevel();
      } else {
      }
    } catch (error) {
      console.warn('Failed to initialize Battery API:', error);
    }
  }

  /**
   * Setup battery event listeners
   */
  private setupBatteryEventListeners(): void {
    if (!this.battery) return;

    const handleBatteryChange = () => {
      this.optimizeForBatteryLevel();
      this.notifyBatteryChange();
    };

    this.battery.addEventListener('levelchange', handleBatteryChange);
    this.battery.addEventListener('chargingchange', handleBatteryChange);
  }

  /**
   * Optimize tracking mode based on battery level and charging status
   */
  private optimizeForBatteryLevel(): void {
    if (!this.battery) return;

    const level = this.battery.level;
    const charging = this.battery.charging;
    let newMode: TrackingMode;

    if (charging) {
      // When charging, use higher accuracy modes
      if (level > 0.5) {
        newMode = this.trackingModes.precision;
      } else {
        newMode = this.trackingModes.balanced;
      }
    } else {
      // When not charging, prioritize battery saving
      if (level > 0.5) {
        newMode = this.trackingModes.balanced;
      } else if (level > 0.2) {
        newMode = this.trackingModes.economy;
      } else {
        newMode = this.trackingModes.emergency;
      }
    }

    if (newMode !== this.currentMode) {
      const previousMode = this.currentMode;
      this.currentMode = newMode;
      
      
      this.onModeChangeCallback?.(newMode);
    }
  }

  /**
   * Get current tracking mode
   */
  getCurrentMode(): TrackingMode {
    return this.currentMode;
  }

  /**
   * Force a specific tracking mode (overrides automatic optimization)
   */
  setTrackingMode(modeName: keyof typeof this.trackingModes): void {
    const mode = this.trackingModes[modeName];
    if (mode) {
      this.currentMode = mode;
      this.onModeChangeCallback?.(mode);
    }
  }

  /**
   * Get current battery information
   */
  getBatteryInfo(): BatteryInfo | null {
    if (!this.battery) return null;

    return {
      level: this.battery.level,
      charging: this.battery.charging,
      chargingTime: this.battery.chargingTime,
      dischargingTime: this.battery.dischargingTime
    };
  }

  /**
   * Check if device should enter power saving mode
   */
  shouldUsePowerSavingMode(): boolean {
    if (!this.battery) return false;
    
    // Use power saving if battery is below 20% and not charging
    return this.battery.level < 0.2 && !this.battery.charging;
  }

  /**
   * Get recommended update interval based on current conditions
   */
  getRecommendedUpdateInterval(): number {
    return this.currentMode.locationUpdateInterval;
  }

  /**
   * Get recommended geolocation options
   */
  getRecommendedGeoOptions(): PositionOptions {
    return {
      enableHighAccuracy: this.currentMode.highAccuracy,
      timeout: this.currentMode.timeout,
      maximumAge: this.currentMode.maximumAge
    };
  }

  /**
   * Subscribe to mode changes
   */
  onModeChange(callback: (mode: TrackingMode) => void): void {
    this.onModeChangeCallback = callback;
  }

  /**
   * Subscribe to battery changes
   */
  onBatteryChange(callback: (battery: BatteryInfo) => void): void {
    this.onBatteryChangeCallback = callback;
  }

  /**
   * Notify subscribers of battery changes
   */
  private notifyBatteryChange(): void {
    const batteryInfo = this.getBatteryInfo();
    if (batteryInfo && this.onBatteryChangeCallback) {
      this.onBatteryChangeCallback(batteryInfo);
    }
  }

  /**
   * Calculate estimated tracking time remaining
   */
  getEstimatedTrackingTime(): string {
    if (!this.battery || this.battery.charging) {
      return 'Unknown (charging or battery info unavailable)';
    }

    const level = this.battery.level;
    const dischargingTime = this.battery.dischargingTime;

    // If we have discharge time from the API
    if (dischargingTime && dischargingTime !== Infinity) {
      const hours = Math.floor(dischargingTime / 3600);
      const minutes = Math.floor((dischargingTime % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }

    // Rough estimate based on tracking mode and battery level
    const baseHours = {
      precision: 8,    // High power usage
      balanced: 12,    // Medium power usage
      economy: 20,     // Low power usage
      emergency: 40    // Very low power usage
    };

    const estimatedHours = (baseHours[this.currentMode.name.toLowerCase().split(' ')[0] as keyof typeof baseHours] || 12) * level;
    
    if (estimatedHours < 1) {
      return `${Math.round(estimatedHours * 60)}m`;
    } else {
      return `${Math.round(estimatedHours)}h`;
    }
  }

  /**
   * Get power usage recommendations
   */
  getPowerSavingRecommendations(): string[] {
    const recommendations: string[] = [];
    const batteryInfo = this.getBatteryInfo();

    if (!batteryInfo) {
      return ['Battery information unavailable'];
    }

    if (batteryInfo.level < 0.5 && !batteryInfo.charging) {
      recommendations.push('Consider switching to Economy Mode to extend battery life');
    }

    if (batteryInfo.level < 0.2) {
      recommendations.push('Battery critically low - switch to Emergency Mode');
      recommendations.push('Consider connecting a charger or power bank');
    }

    if (this.currentMode.name === 'Precision Mode' && batteryInfo.level < 0.3) {
      recommendations.push('Precision Mode uses significant battery - consider Balanced Mode');
    }

    if (recommendations.length === 0) {
      recommendations.push('Battery level is good for current tracking mode');
    }

    return recommendations;
  }

  /**
   * Enable wake lock to prevent screen from turning off during tracking
   */
  async enableWakeLock(): Promise<WakeLockSentinel | null> {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        return wakeLock;
      }
    } catch (error) {
      console.warn('Failed to enable wake lock:', error);
    }
    return null;
  }

  /**
   * Get available tracking modes
   */
  getAvailableModes(): TrackingMode[] {
    return Object.values(this.trackingModes);
  }
}

// Background sync optimization for when app is not active
export class BackgroundSyncOptimizer {
  private isVisible = !document.hidden;
  private backgroundInterval: NodeJS.Timeout | null = null;

  constructor(private batteryOptimizer: BatteryOptimizer) {
    this.setupVisibilityListeners();
  }

  /**
   * Setup page visibility listeners
   */
  private setupVisibilityListeners(): void {
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      
      if (this.isVisible) {
        this.handleForeground();
      } else {
        this.handleBackground();
      }
    });
  }

  /**
   * Handle app coming to foreground
   */
  private handleForeground(): void {
    
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
      this.backgroundInterval = null;
    }
  }

  /**
   * Handle app going to background
   */
  private handleBackground(): void {
    
    // In background, use less frequent updates to save battery
    const currentMode = this.batteryOptimizer.getCurrentMode();
    const backgroundInterval = Math.max(currentMode.locationUpdateInterval * 2, 60000); // At least 1 minute
    
    this.backgroundInterval = setInterval(() => {
      // Background location update logic would go here
    }, backgroundInterval);
  }

  /**
   * Check if app is currently visible
   */
  isAppVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
      this.backgroundInterval = null;
    }
  }
}
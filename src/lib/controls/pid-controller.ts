/**
 * PID Controller for Light Intensity Stabilization
 * Maintains consistent PPFD levels through dynamic dimming control
 */

export interface PIDConfig {
  kp: number // Proportional gain
  ki: number // Integral gain
  kd: number // Derivative gain
  setpoint: number // Target PPFD value
  outputMin: number // Minimum dimming level (%)
  outputMax: number // Maximum dimming level (%)
  integralWindupGuard: number // Prevent integral windup
  deadband: number // Acceptable error range
  sampleTime: number // Control loop interval (ms)
}

export interface PIDState {
  lastError: number
  integral: number
  lastTime: number
  lastOutput: number
}

export class PIDController {
  protected config: PIDConfig
  protected state: PIDState
  protected isEnabled: boolean = false

  constructor(config: Partial<PIDConfig> = {}) {
    this.config = {
      kp: 2.0,
      ki: 0.5,
      kd: 0.1,
      setpoint: 500, // Default 500 µmol/m²/s
      outputMin: 10,
      outputMax: 100,
      integralWindupGuard: 50,
      deadband: 5, // ±5 µmol/m²/s acceptable
      sampleTime: 1000, // 1 second
      ...config
    }
    
    this.state = {
      lastError: 0,
      integral: 0,
      lastTime: Date.now(),
      lastOutput: 50
    }
  }

  /**
   * Update PID controller with new sensor reading
   * Returns new dimming level percentage
   */
  update(currentPPFD: number): number {
    if (!this.isEnabled) {
      return this.state.lastOutput
    }

    const now = Date.now()
    const dt = (now - this.state.lastTime) / 1000 // Convert to seconds
    
    // Skip if not enough time has passed
    if (dt < this.config.sampleTime / 1000) {
      return this.state.lastOutput
    }

    // Calculate error
    const error = this.config.setpoint - currentPPFD
    
    // Check deadband
    if (Math.abs(error) < this.config.deadband) {
      this.state.lastTime = now
      return this.state.lastOutput
    }

    // Proportional term
    const P = this.config.kp * error

    // Integral term with anti-windup
    this.state.integral += error * dt
    this.state.integral = Math.max(
      -this.config.integralWindupGuard,
      Math.min(this.config.integralWindupGuard, this.state.integral)
    )
    const I = this.config.ki * this.state.integral

    // Derivative term (filtered to reduce noise)
    const dError = (error - this.state.lastError) / dt
    const D = this.config.kd * dError

    // Calculate output
    let output = this.state.lastOutput + P + I + D
    
    // Constrain output
    output = Math.max(
      this.config.outputMin,
      Math.min(this.config.outputMax, output)
    )

    // Update state
    this.state.lastError = error
    this.state.lastTime = now
    this.state.lastOutput = output

    return output
  }

  /**
   * Reset controller state
   */
  reset(): void {
    this.state = {
      lastError: 0,
      integral: 0,
      lastTime: Date.now(),
      lastOutput: 50
    }
  }

  /**
   * Enable/disable controller
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.reset()
    }
  }

  /**
   * Update setpoint
   */
  setSetpoint(setpoint: number): void {
    this.config.setpoint = setpoint
    // Reset integral to prevent bump
    this.state.integral = 0
  }

  /**
   * Tune controller parameters
   */
  tune(params: Partial<Pick<PIDConfig, 'kp' | 'ki' | 'kd'>>): void {
    Object.assign(this.config, params)
    // Reset integral when tuning changes
    this.state.integral = 0
  }

  /**
   * Get current controller status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      setpoint: this.config.setpoint,
      lastOutput: this.state.lastOutput,
      error: this.state.lastError,
      integral: this.state.integral,
      config: this.config
    }
  }
}

/**
 * Auto-tuning using Ziegler-Nichols method
 */
export class PIDAutoTuner {
  private controller: PIDController
  private oscillations: number[] = []
  private peaks: { time: number; value: number }[] = []
  private isRunning: boolean = false
  private startTime: number = 0

  constructor(controller: PIDController) {
    this.controller = controller
  }

  /**
   * Start auto-tuning process
   */
  start(): void {
    this.isRunning = true
    this.startTime = Date.now()
    this.oscillations = []
    this.peaks = []
    
    // Start with P-only control
    this.controller.tune({ kp: 1, ki: 0, kd: 0 })
  }

  /**
   * Update auto-tuner with new measurement
   */
  update(currentPPFD: number): boolean {
    if (!this.isRunning) return false

    const output = this.controller.update(currentPPFD)
    
    // Detect oscillations
    if (this.peaks.length > 0) {
      const lastPeak = this.peaks[this.peaks.length - 1]
      if (Math.abs(currentPPFD - lastPeak.value) > 10) {
        this.peaks.push({ time: Date.now(), value: currentPPFD })
        
        if (this.peaks.length > 2) {
          const period = this.peaks[this.peaks.length - 1].time - 
                        this.peaks[this.peaks.length - 2].time
          this.oscillations.push(period)
        }
      }
    } else {
      this.peaks.push({ time: Date.now(), value: currentPPFD })
    }

    // Check if we have enough data
    if (this.oscillations.length >= 3) {
      this.calculateParameters()
      return true
    }

    // Increase gain if no oscillations after 30 seconds
    if (Date.now() - this.startTime > 30000 && this.oscillations.length === 0) {
      const currentKp = this.controller.getStatus().config.kp
      this.controller.tune({ kp: currentKp * 1.5, ki: 0, kd: 0 })
    }

    return false
  }

  /**
   * Calculate PID parameters using Ziegler-Nichols
   */
  private calculateParameters(): void {
    // Calculate average oscillation period
    const avgPeriod = this.oscillations.reduce((a, b) => a + b) / 
                     this.oscillations.length / 1000 // Convert to seconds
    
    const criticalGain = this.controller.getStatus().config.kp
    
    // Ziegler-Nichols PID parameters
    const kp = 0.6 * criticalGain
    const ki = 2 * kp / avgPeriod
    const kd = kp * avgPeriod / 8
    
    this.controller.tune({ kp, ki, kd })
    this.isRunning = false
  }

  /**
   * Stop auto-tuning
   */
  stop(): void {
    this.isRunning = false
  }

  /**
   * Get tuning results
   */
  getResults() {
    return {
      isComplete: !this.isRunning && this.oscillations.length >= 3,
      parameters: this.controller.getStatus().config,
      oscillations: this.oscillations.length
    }
  }
}

/**
 * Multi-zone PID coordination
 */
export class MultiZonePIDController {
  private zones: Map<string, {
    controller: PIDController
    sensors: string[]
    weight: number
  }> = new Map()

  /**
   * Add a control zone
   */
  addZone(
    zoneId: string, 
    config: Partial<PIDConfig>, 
    sensors: string[],
    weight: number = 1
  ): void {
    this.zones.set(zoneId, {
      controller: new PIDController(config),
      sensors,
      weight
    })
  }

  /**
   * Update all zones with sensor readings
   */
  updateAll(sensorReadings: Map<string, number>): Map<string, number> {
    const outputs = new Map<string, number>()
    
    for (const [zoneId, zone] of this.zones) {
      // Calculate average PPFD for zone
      let totalPPFD = 0
      let count = 0
      
      for (const sensorId of zone.sensors) {
        const reading = sensorReadings.get(sensorId)
        if (reading !== undefined) {
          totalPPFD += reading
          count++
        }
      }
      
      if (count > 0) {
        const avgPPFD = totalPPFD / count
        const output = zone.controller.update(avgPPFD)
        outputs.set(zoneId, output)
      }
    }
    
    return outputs
  }

  /**
   * Get zone status
   */
  getZoneStatus(zoneId: string) {
    const zone = this.zones.get(zoneId)
    if (!zone) return null
    
    return {
      ...zone.controller.getStatus(),
      sensors: zone.sensors,
      weight: zone.weight
    }
  }

  /**
   * Enable/disable all zones
   */
  setAllEnabled(enabled: boolean): void {
    for (const zone of this.zones.values()) {
      zone.controller.setEnabled(enabled)
    }
  }
}

/**
 * Adaptive PID that adjusts parameters based on system response
 */
export class AdaptivePIDController extends PIDController {
  private performanceHistory: {
    time: number
    error: number
    settlingTime: number
    overshoot: number
  }[] = []
  
  private adaptationRate: number = 0.01
  private adaptationEnabled: boolean = true

  /**
   * Update with adaptation
   */
  update(currentPPFD: number): number {
    const output = super.update(currentPPFD)
    
    if (this.adaptationEnabled) {
      this.evaluatePerformance(currentPPFD)
      this.adaptParameters()
    }
    
    return output
  }

  /**
   * Evaluate control performance
   */
  private evaluatePerformance(currentPPFD: number): void {
    const error = Math.abs(this.config.setpoint - currentPPFD)
    const time = Date.now()
    
    // Track performance metrics
    this.performanceHistory.push({
      time,
      error,
      settlingTime: 0, // Calculate based on error threshold
      overshoot: Math.max(0, currentPPFD - this.config.setpoint)
    })
    
    // Keep only recent history (last 100 samples)
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift()
    }
  }

  /**
   * Adapt PID parameters based on performance
   */
  private adaptParameters(): void {
    if (this.performanceHistory.length < 10) return
    
    // Calculate average error and overshoot
    const recentHistory = this.performanceHistory.slice(-10)
    const avgError = recentHistory.reduce((sum, h) => sum + h.error, 0) / 10
    const avgOvershoot = recentHistory.reduce((sum, h) => sum + h.overshoot, 0) / 10
    
    const { kp, ki, kd } = this.config
    
    // Adapt proportional gain
    if (avgError > this.config.deadband * 2) {
      // Increase Kp if steady-state error is high
      this.config.kp = kp * (1 + this.adaptationRate)
    } else if (avgOvershoot > this.config.deadband) {
      // Decrease Kp if overshoot is high
      this.config.kp = kp * (1 - this.adaptationRate)
    }
    
    // Adapt integral gain
    if (avgError > this.config.deadband && avgOvershoot < this.config.deadband) {
      // Increase Ki for persistent error without overshoot
      this.config.ki = ki * (1 + this.adaptationRate)
    }
    
    // Adapt derivative gain
    if (avgOvershoot > this.config.deadband * 2) {
      // Increase Kd to reduce overshoot
      this.config.kd = kd * (1 + this.adaptationRate)
    }
    
    // Constrain parameters to reasonable ranges
    this.config.kp = Math.max(0.1, Math.min(10, this.config.kp))
    this.config.ki = Math.max(0, Math.min(2, this.config.ki))
    this.config.kd = Math.max(0, Math.min(1, this.config.kd))
  }

  /**
   * Enable/disable adaptation
   */
  setAdaptationEnabled(enabled: boolean): void {
    this.adaptationEnabled = enabled
  }

  /**
   * Get adaptation metrics
   */
  getAdaptationMetrics() {
    if (this.performanceHistory.length === 0) return null
    
    const avgError = this.performanceHistory.reduce((sum, h) => sum + h.error, 0) / 
                    this.performanceHistory.length
    const maxOvershoot = Math.max(...this.performanceHistory.map(h => h.overshoot))
    
    return {
      averageError: avgError,
      maxOvershoot,
      currentParameters: {
        kp: this.config.kp,
        ki: this.config.ki,
        kd: this.config.kd
      },
      adaptationEnabled: this.adaptationEnabled
    }
  }
}
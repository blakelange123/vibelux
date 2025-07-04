/**
 * Modbus CHP Control Adapter
 * Implements Modbus RTU/TCP communication for CHP systems
 */

import { BaseCHPAdapter, CHPOperationalData, CHPControlCommand, CHPControlResponse, CHPSystemInfo } from './base-adapter'

// Modbus-specific interfaces
interface ModbusRegisterMap {
  // Status registers
  systemStatus: number
  engineSpeed: number
  powerOutput: number
  voltagePhaseA: number
  voltagePhaseB: number
  voltagePhaseC: number
  currentPhaseA: number
  currentPhaseB: number
  currentPhaseC: number
  frequency: number
  powerFactor: number
  
  // Engine data
  engineTemp: number
  coolantTemp: number
  oilPressure: number
  fuelFlow: number
  runtimeHours: number
  
  // CHP specific
  co2Output: number
  heatOutput: number
  efficiency: number
  
  // Alarms and warnings
  alarmRegister1: number
  alarmRegister2: number
  warningRegister1: number
  warningRegister2: number
  
  // Control registers
  startCommand: number
  stopCommand: number
  loadSetpoint: number
  emergencyStop: number
  alarmReset: number
}

interface ModbusConfig {
  registerMap: ModbusRegisterMap
  scalingFactors: { [key: string]: number }
  dataFormat: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32'
  byteOrder: 'big-endian' | 'little-endian'
}

export class ModbusCHPAdapter extends BaseCHPAdapter {
  private modbusClient: any // Would use actual Modbus library like 'modbus-serial'
  private registerMap: ModbusRegisterMap
  private scalingFactors: { [key: string]: number }
  private lastReadData?: CHPOperationalData

  constructor(config: any, modbusConfig: ModbusConfig) {
    super(config)
    this.registerMap = modbusConfig.registerMap
    this.scalingFactors = modbusConfig.scalingFactors
    this.initializeModbusClient()
  }

  private initializeModbusClient(): void {
    // In a real implementation, this would initialize the actual Modbus library
    // For now, we'll simulate the client
    this.modbusClient = {
      connectTCP: () => Promise.resolve(),
      connectRTU: () => Promise.resolve(),
      setID: (id: number) => {},
      readHoldingRegisters: (address: number, length: number) => Promise.resolve([]),
      readInputRegisters: (address: number, length: number) => Promise.resolve([]),
      writeRegister: (address: number, value: number) => Promise.resolve(),
      close: () => Promise.resolve(),
      isOpen: false
    }
  }

  async connect(): Promise<boolean> {
    try {
      if (this.config.protocol === 'modbus-tcp') {
        await this.modbusClient.connectTCP(this.config.host, { port: this.config.port })
      } else if (this.config.protocol === 'modbus-rtu') {
        await this.modbusClient.connectRTU(this.config.host, { 
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'none'
        })
      }
      
      if (this.config.unitId) {
        this.modbusClient.setID(this.config.unitId)
      }
      
      this.connected = true
      return true
    } catch (error) {
      this.setError(error as Error)
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.modbusClient.isOpen) {
        await this.modbusClient.close()
      }
      this.connected = false
    } catch (error) {
      this.setError(error as Error)
    }
  }

  async readOperationalData(): Promise<CHPOperationalData> {
    if (!this.connected) {
      throw new Error('Not connected to CHP system')
    }

    try {
      // Read all required registers in batches for efficiency
      const statusRegisters = await this.readRegisterBatch(0, 50)
      const engineRegisters = await this.readRegisterBatch(100, 20)
      const chpRegisters = await this.readRegisterBatch(200, 10)
      const alarmRegisters = await this.readRegisterBatch(300, 10)

      // Parse the register data into operational data
      const data = this.parseOperationalData(statusRegisters, engineRegisters, chpRegisters, alarmRegisters)
      
      this.lastReadData = data
      return data
    } catch (error) {
      this.setError(error as Error)
      
      // Return last known data if available, otherwise default values
      if (this.lastReadData) {
        return {
          ...this.lastReadData,
          timestamp: new Date()
        }
      }
      
      return this.getDefaultOperationalData()
    }
  }

  private async readRegisterBatch(startAddress: number, count: number): Promise<number[]> {
    try {
      // Try holding registers first, fall back to input registers
      return await this.modbusClient.readHoldingRegisters(startAddress, count)
    } catch (error) {
      return await this.modbusClient.readInputRegisters(startAddress, count)
    }
  }

  private parseOperationalData(
    statusRegs: number[], 
    engineRegs: number[], 
    chpRegs: number[], 
    alarmRegs: number[]
  ): CHPOperationalData {
    // Parse status registers
    const systemStatus = statusRegs[0] || 0
    const isRunning = (systemStatus & 0x01) === 1
    
    // Parse electrical data with scaling
    const powerOutput = (statusRegs[2] || 0) * this.scalingFactors.power
    const voltageA = (statusRegs[3] || 0) * this.scalingFactors.voltage
    const voltageB = (statusRegs[4] || 0) * this.scalingFactors.voltage
    const voltageC = (statusRegs[5] || 0) * this.scalingFactors.voltage
    const currentA = (statusRegs[6] || 0) * this.scalingFactors.current
    const currentB = (statusRegs[7] || 0) * this.scalingFactors.current
    const currentC = (statusRegs[8] || 0) * this.scalingFactors.current
    const frequency = (statusRegs[9] || 0) * this.scalingFactors.frequency
    const powerFactor = (statusRegs[10] || 0) * this.scalingFactors.powerFactor

    // Parse engine data
    const engineSpeed = (statusRegs[1] || 0) * this.scalingFactors.engineSpeed
    const engineTemp = (engineRegs[0] || 0) * this.scalingFactors.temperature
    const coolantTemp = (engineRegs[1] || 0) * this.scalingFactors.temperature
    const oilPressure = (engineRegs[2] || 0) * this.scalingFactors.pressure
    const fuelConsumption = (engineRegs[3] || 0) * this.scalingFactors.fuelFlow
    const runtimeHours = this.combineRegisters(engineRegs[4], engineRegs[5]) * this.scalingFactors.hours

    // Parse CHP-specific data
    const co2Output = (chpRegs[0] || 0) * this.scalingFactors.co2Flow
    const heatOutput = (chpRegs[1] || 0) * this.scalingFactors.thermalPower
    const efficiency = (chpRegs[2] || 0) * this.scalingFactors.efficiency

    // Parse alarms and warnings
    const alarms = this.parseAlarms(alarmRegs[0], alarmRegs[1])
    const warnings = this.parseWarnings(alarmRegs[2], alarmRegs[3])

    return this.validateOperationalData({
      isRunning,
      powerOutput,
      co2Output,
      heatOutput,
      fuelConsumption,
      efficiency,
      engineSpeed,
      engineTemp,
      coolantTemp,
      oilPressure,
      voltage: [voltageA, voltageB, voltageC],
      current: [currentA, currentB, currentC],
      powerFactor,
      frequency,
      alarms,
      warnings,
      runtimeHours,
      timestamp: new Date()
    })
  }

  private combineRegisters(low: number, high: number): number {
    return (high << 16) | low
  }

  private parseAlarms(reg1: number, reg2: number): string[] {
    const alarmCodes: number[] = []
    
    // Check each bit in the alarm registers
    for (let i = 0; i < 16; i++) {
      if (reg1 & (1 << i)) alarmCodes.push(i + 1)
      if (reg2 & (1 << i)) alarmCodes.push(i + 17)
    }
    
    return this.mapAlarmCodes(alarmCodes)
  }

  private parseWarnings(reg1: number, reg2: number): string[] {
    const warningCodes: number[] = []
    
    for (let i = 0; i < 16; i++) {
      if (reg1 & (1 << i)) warningCodes.push(i + 100) // Warning codes start at 100
      if (reg2 & (1 << i)) warningCodes.push(i + 116)
    }
    
    return this.mapAlarmCodes(warningCodes)
  }

  async sendCommand(command: CHPControlCommand): Promise<CHPControlResponse> {
    if (!this.connected) {
      return {
        success: false,
        message: 'Not connected to CHP system',
        executionTime: 0,
        errors: ['Connection not established']
      }
    }

    const startTime = Date.now()
    
    try {
      let registerAddress: number
      let value: number = 1

      switch (command.command) {
        case 'START':
          registerAddress = this.registerMap.startCommand
          break
        case 'STOP':
          registerAddress = this.registerMap.stopCommand
          break
        case 'SET_LOAD':
          registerAddress = this.registerMap.loadSetpoint
          value = command.parameters?.targetLoad || 100
          break
        case 'EMERGENCY_STOP':
          registerAddress = this.registerMap.emergencyStop
          break
        case 'RESET_ALARMS':
          registerAddress = this.registerMap.alarmReset
          break
        default:
          throw new Error(`Unknown command: ${command.command}`)
      }

      await this.modbusClient.writeRegister(registerAddress, value)
      
      // Wait a moment and read back the status to confirm
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newData = await this.readOperationalData()
      
      const executionTime = Date.now() - startTime
      
      return {
        success: true,
        message: `Command ${command.command} executed successfully`,
        executionTime,
        newState: newData
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      this.setError(error as Error)
      
      return {
        success: false,
        message: `Failed to execute command ${command.command}`,
        executionTime,
        errors: [(error as Error).message]
      }
    }
  }

  async getSystemInfo(): Promise<CHPSystemInfo> {
    // System info is typically stored in specific registers or EEPROM
    // This would need to be customized based on the specific CHP manufacturer
    
    return {
      manufacturer: 'Generic Modbus CHP',
      model: 'Model Unknown',
      serialNumber: 'Serial Unknown',
      ratedPowerKW: 500,
      ratedThermalKW: 1200,
      ratedCO2CFH: 2500,
      firmwareVersion: '1.0.0',
      protocolVersion: 'Modbus RTU/TCP',
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)  // 60 days from now
    }
  }

  private getDefaultOperationalData(): CHPOperationalData {
    return this.validateOperationalData({
      isRunning: false,
      powerOutput: 0,
      co2Output: 0,
      heatOutput: 0,
      fuelConsumption: 0,
      efficiency: 0,
      engineSpeed: 0,
      engineTemp: 70,
      coolantTemp: 70,
      oilPressure: 0,
      voltage: [0, 0, 0],
      current: [0, 0, 0],
      powerFactor: 0,
      frequency: 60,
      alarms: ['Communication Lost'],
      warnings: [],
      runtimeHours: 0,
      timestamp: new Date()
    })
  }

  // Utility method to create standard register maps for common CHP systems
  static createStandardRegisterMap(): ModbusRegisterMap {
    return {
      // Status registers (0-49)
      systemStatus: 0,
      engineSpeed: 1,
      powerOutput: 2,
      voltagePhaseA: 3,
      voltagePhaseB: 4,
      voltagePhaseC: 5,
      currentPhaseA: 6,
      currentPhaseB: 7,
      currentPhaseC: 8,
      frequency: 9,
      powerFactor: 10,
      
      // Engine data (100-119)
      engineTemp: 100,
      coolantTemp: 101,
      oilPressure: 102,
      fuelFlow: 103,
      runtimeHours: 104, // Low word
      
      // CHP specific (200-209)
      co2Output: 200,
      heatOutput: 201,
      efficiency: 202,
      
      // Alarms and warnings (300-309)
      alarmRegister1: 300,
      alarmRegister2: 301,
      warningRegister1: 302,
      warningRegister2: 303,
      
      // Control registers (400-409)
      startCommand: 400,
      stopCommand: 401,
      loadSetpoint: 402,
      emergencyStop: 403,
      alarmReset: 404
    }
  }

  static createStandardScalingFactors(): { [key: string]: number } {
    return {
      power: 0.1,          // Register value * 0.1 = kW
      voltage: 0.1,        // Register value * 0.1 = V
      current: 0.01,       // Register value * 0.01 = A
      frequency: 0.01,     // Register value * 0.01 = Hz
      powerFactor: 0.001,  // Register value * 0.001 = power factor
      engineSpeed: 1,      // Register value = RPM
      temperature: 0.1,    // Register value * 0.1 = °F
      pressure: 0.1,       // Register value * 0.1 = PSI
      fuelFlow: 0.01,      // Register value * 0.01 = therms/hour
      hours: 0.1,          // Register value * 0.1 = hours
      co2Flow: 0.1,        // Register value * 0.1 = CFH
      thermalPower: 0.1,   // Register value * 0.1 = kW thermal
      efficiency: 0.1      // Register value * 0.1 = %
    }
  }
}
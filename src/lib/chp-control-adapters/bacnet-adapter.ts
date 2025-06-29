/**
 * BACnet CHP Control Adapter
 * Implements BACnet IP/MSTP communication for CHP systems
 */

import { BaseCHPAdapter, CHPOperationalData, CHPControlCommand, CHPControlResponse, CHPSystemInfo } from './base-adapter'

// BACnet-specific interfaces
interface BACnetObjectMap {
  // Analog Input objects for readings
  powerOutput: { type: 'analogInput', instance: number }
  voltagePhaseA: { type: 'analogInput', instance: number }
  voltagePhaseB: { type: 'analogInput', instance: number }
  voltagePhaseC: { type: 'analogInput', instance: number }
  currentPhaseA: { type: 'analogInput', instance: number }
  currentPhaseB: { type: 'analogInput', instance: number }
  currentPhaseC: { type: 'analogInput', instance: number }
  frequency: { type: 'analogInput', instance: number }
  powerFactor: { type: 'analogInput', instance: number }
  engineSpeed: { type: 'analogInput', instance: number }
  engineTemp: { type: 'analogInput', instance: number }
  coolantTemp: { type: 'analogInput', instance: number }
  oilPressure: { type: 'analogInput', instance: number }
  fuelFlow: { type: 'analogInput', instance: number }
  co2Output: { type: 'analogInput', instance: number }
  heatOutput: { type: 'analogInput', instance: number }
  efficiency: { type: 'analogInput', instance: number }
  runtimeHours: { type: 'analogInput', instance: number }
  
  // Binary Input objects for status
  engineRunning: { type: 'binaryInput', instance: number }
  systemReady: { type: 'binaryInput', instance: number }
  alarmActive: { type: 'binaryInput', instance: number }
  warningActive: { type: 'binaryInput', instance: number }
  
  // Binary Output objects for control
  startCommand: { type: 'binaryOutput', instance: number }
  stopCommand: { type: 'binaryOutput', instance: number }
  emergencyStop: { type: 'binaryOutput', instance: number }
  alarmReset: { type: 'binaryOutput', instance: number }
  
  // Analog Output objects for setpoints
  loadSetpoint: { type: 'analogOutput', instance: number }
  
  // Multi-state objects for complex status
  systemState: { type: 'multiStateInput', instance: number }
  operatingMode: { type: 'multiStateOutput', instance: number }
}

interface BACnetConfig {
  deviceId: number
  objectMap: BACnetObjectMap
  maxAPDU: number
  segmentation: boolean
  broadcastAddress?: string
}

export class BACnetCHPAdapter extends BaseCHPAdapter {
  private bacnetClient: any // Would use actual BACnet library like 'node-bacnet'
  private deviceId: number
  private objectMap: BACnetObjectMap
  private lastReadData?: CHPOperationalData

  constructor(config: any, bacnetConfig: BACnetConfig) {
    super(config)
    this.deviceId = bacnetConfig.deviceId
    this.objectMap = bacnetConfig.objectMap
    this.initializeBACnetClient(bacnetConfig)
  }

  private initializeBACnetClient(bacnetConfig: BACnetConfig): void {
    // In a real implementation, this would initialize the actual BACnet library
    // For now, we'll simulate the client
    this.bacnetClient = {
      on: (event: string, callback: Function) => {},
      readProperty: (deviceId: number, objectType: number, objectInstance: number, propertyId: number) => 
        Promise.resolve({ value: 0 }),
      writeProperty: (deviceId: number, objectType: number, objectInstance: number, propertyId: number, value: any) => 
        Promise.resolve(),
      deviceCommunicationControl: (deviceId: number, timeDuration: number, enableDisable: number) => 
        Promise.resolve(),
      whoIs: () => {},
      close: () => {}
    }
    
    // Set up event handlers
    this.bacnetClient.on('iAm', (deviceId: number, maxAPDU: number, segmentation: number, vendorId: number) => {
    })
    
    this.bacnetClient.on('error', (error: Error) => {
      this.setError(error)
    })
  }

  async connect(): Promise<boolean> {
    try {
      // Send Who-Is to discover devices
      this.bacnetClient.whoIs()
      
      // Wait for device response
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Test communication by reading a simple property
      const testRead = await this.readBACnetProperty(
        this.objectMap.systemReady.type,
        this.objectMap.systemReady.instance,
        'presentValue'
      )
      
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
      this.bacnetClient.close()
      this.connected = false
    } catch (error) {
      this.setError(error as Error)
    }
  }

  async readOperationalData(): Promise<CHPOperationalData> {
    if (!this.connected) {
      throw new Error('Not connected to BACnet CHP system')
    }

    try {
      // Read all properties in parallel for efficiency
      const readings = await Promise.all([
        // Binary status readings
        this.readBACnetProperty(this.objectMap.engineRunning.type, this.objectMap.engineRunning.instance, 'presentValue'),
        
        // Electrical readings
        this.readBACnetProperty(this.objectMap.powerOutput.type, this.objectMap.powerOutput.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.voltagePhaseA.type, this.objectMap.voltagePhaseA.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.voltagePhaseB.type, this.objectMap.voltagePhaseB.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.voltagePhaseC.type, this.objectMap.voltagePhaseC.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.currentPhaseA.type, this.objectMap.currentPhaseA.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.currentPhaseB.type, this.objectMap.currentPhaseB.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.currentPhaseC.type, this.objectMap.currentPhaseC.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.frequency.type, this.objectMap.frequency.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.powerFactor.type, this.objectMap.powerFactor.instance, 'presentValue'),
        
        // Engine readings
        this.readBACnetProperty(this.objectMap.engineSpeed.type, this.objectMap.engineSpeed.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.engineTemp.type, this.objectMap.engineTemp.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.coolantTemp.type, this.objectMap.coolantTemp.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.oilPressure.type, this.objectMap.oilPressure.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.fuelFlow.type, this.objectMap.fuelFlow.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.runtimeHours.type, this.objectMap.runtimeHours.instance, 'presentValue'),
        
        // CHP-specific readings
        this.readBACnetProperty(this.objectMap.co2Output.type, this.objectMap.co2Output.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.heatOutput.type, this.objectMap.heatOutput.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.efficiency.type, this.objectMap.efficiency.instance, 'presentValue'),
        
        // Alarm status
        this.readBACnetProperty(this.objectMap.alarmActive.type, this.objectMap.alarmActive.instance, 'presentValue'),
        this.readBACnetProperty(this.objectMap.warningActive.type, this.objectMap.warningActive.instance, 'presentValue')
      ])

      // Parse the readings into operational data
      const data = this.parseOperationalData(readings)
      
      this.lastReadData = data
      return data
    } catch (error) {
      this.setError(error as Error)
      
      // Return last known data if available
      if (this.lastReadData) {
        return {
          ...this.lastReadData,
          timestamp: new Date()
        }
      }
      
      return this.getDefaultOperationalData()
    }
  }

  private async readBACnetProperty(
    objectType: string, 
    objectInstance: number, 
    propertyId: string
  ): Promise<any> {
    const objectTypeMap: { [key: string]: number } = {
      'analogInput': 0,
      'analogOutput': 1,
      'analogValue': 2,
      'binaryInput': 3,
      'binaryOutput': 4,
      'binaryValue': 5,
      'multiStateInput': 13,
      'multiStateOutput': 14,
      'multiStateValue': 19
    }

    const propertyIdMap: { [key: string]: number } = {
      'presentValue': 85,
      'statusFlags': 111,
      'units': 117,
      'description': 28,
      'objectName': 77
    }

    const objectTypeId = objectTypeMap[objectType]
    const propertyIdNum = propertyIdMap[propertyId]

    if (objectTypeId === undefined || propertyIdNum === undefined) {
      throw new Error(`Invalid BACnet object type or property: ${objectType}.${propertyId}`)
    }

    const result = await this.bacnetClient.readProperty(
      this.deviceId,
      objectTypeId,
      objectInstance,
      propertyIdNum
    )

    return result.value
  }

  private parseOperationalData(readings: any[]): CHPOperationalData {
    const [
      isRunning, powerOutput, voltageA, voltageB, voltageC,
      currentA, currentB, currentC, frequency, powerFactor,
      engineSpeed, engineTemp, coolantTemp, oilPressure, fuelFlow, runtimeHours,
      co2Output, heatOutput, efficiency, alarmActive, warningActive
    ] = readings

    // Generate alarm and warning messages based on status
    const alarms: string[] = []
    const warnings: string[] = []

    if (alarmActive) {
      alarms.push('System Alarm Active')
    }

    if (warningActive) {
      warnings.push('System Warning Active')
    }

    // Additional alarm detection based on operating parameters
    if (isRunning) {
      if (engineTemp > 220) alarms.push('High Engine Temperature')
      if (coolantTemp > 190) alarms.push('High Coolant Temperature')
      if (oilPressure < 30) alarms.push('Low Oil Pressure')
      if (frequency < 59 || frequency > 61) warnings.push('Frequency Out of Range')
      if (powerFactor < 0.8) warnings.push('Low Power Factor')
    }

    return this.validateOperationalData({
      isRunning: Boolean(isRunning),
      powerOutput: Number(powerOutput) || 0,
      co2Output: Number(co2Output) || 0,
      heatOutput: Number(heatOutput) || 0,
      fuelConsumption: Number(fuelFlow) || 0,
      efficiency: Number(efficiency) || 0,
      engineSpeed: Number(engineSpeed) || 0,
      engineTemp: Number(engineTemp) || 0,
      coolantTemp: Number(coolantTemp) || 0,
      oilPressure: Number(oilPressure) || 0,
      voltage: [Number(voltageA) || 0, Number(voltageB) || 0, Number(voltageC) || 0],
      current: [Number(currentA) || 0, Number(currentB) || 0, Number(currentC) || 0],
      powerFactor: Number(powerFactor) || 0,
      frequency: Number(frequency) || 60,
      alarms,
      warnings,
      runtimeHours: Number(runtimeHours) || 0,
      timestamp: new Date()
    })
  }

  async sendCommand(command: CHPControlCommand): Promise<CHPControlResponse> {
    if (!this.connected) {
      return {
        success: false,
        message: 'Not connected to BACnet CHP system',
        executionTime: 0,
        errors: ['Connection not established']
      }
    }

    const startTime = Date.now()

    try {
      let objectType: string
      let objectInstance: number
      let value: any

      switch (command.command) {
        case 'START':
          objectType = this.objectMap.startCommand.type
          objectInstance = this.objectMap.startCommand.instance
          value = true
          break
        case 'STOP':
          objectType = this.objectMap.stopCommand.type
          objectInstance = this.objectMap.stopCommand.instance
          value = true
          break
        case 'SET_LOAD':
          objectType = this.objectMap.loadSetpoint.type
          objectInstance = this.objectMap.loadSetpoint.instance
          value = command.parameters?.targetLoad || 100
          break
        case 'EMERGENCY_STOP':
          objectType = this.objectMap.emergencyStop.type
          objectInstance = this.objectMap.emergencyStop.instance
          value = true
          break
        case 'RESET_ALARMS':
          objectType = this.objectMap.alarmReset.type
          objectInstance = this.objectMap.alarmReset.instance
          value = true
          break
        default:
          throw new Error(`Unknown command: ${command.command}`)
      }

      await this.writeBACnetProperty(objectType, objectInstance, 'presentValue', value)

      // Wait a moment and read back the status to confirm
      await new Promise(resolve => setTimeout(resolve, 2000))
      const newData = await this.readOperationalData()

      const executionTime = Date.now() - startTime

      return {
        success: true,
        message: `BACnet command ${command.command} executed successfully`,
        executionTime,
        newState: newData
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      this.setError(error as Error)

      return {
        success: false,
        message: `Failed to execute BACnet command ${command.command}`,
        executionTime,
        errors: [(error as Error).message]
      }
    }
  }

  private async writeBACnetProperty(
    objectType: string,
    objectInstance: number,
    propertyId: string,
    value: any
  ): Promise<void> {
    const objectTypeMap: { [key: string]: number } = {
      'analogOutput': 1,
      'binaryOutput': 4,
      'multiStateOutput': 14
    }

    const propertyIdMap: { [key: string]: number } = {
      'presentValue': 85
    }

    const objectTypeId = objectTypeMap[objectType]
    const propertyIdNum = propertyIdMap[propertyId]

    if (objectTypeId === undefined || propertyIdNum === undefined) {
      throw new Error(`Invalid BACnet object type or property for writing: ${objectType}.${propertyId}`)
    }

    await this.bacnetClient.writeProperty(
      this.deviceId,
      objectTypeId,
      objectInstance,
      propertyIdNum,
      value
    )
  }

  async getSystemInfo(): Promise<CHPSystemInfo> {
    try {
      // Read device information from BACnet device object
      const deviceName = await this.readBACnetProperty('device', this.deviceId, 'objectName')
      const modelName = await this.readBACnetProperty('device', this.deviceId, 'modelName')
      const firmwareRevision = await this.readBACnetProperty('device', this.deviceId, 'firmwareRevision')
      
      return {
        manufacturer: 'BACnet CHP System',
        model: modelName || 'Unknown Model',
        serialNumber: deviceName || `Device-${this.deviceId}`,
        ratedPowerKW: 500,
        ratedThermalKW: 1200,
        ratedCO2CFH: 2500,
        firmwareVersion: firmwareRevision || 'Unknown',
        protocolVersion: 'BACnet/IP',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    } catch (error) {
      return {
        manufacturer: 'BACnet CHP System',
        model: 'Communication Error',
        serialNumber: `Device-${this.deviceId}`,
        ratedPowerKW: 500,
        ratedThermalKW: 1200,
        ratedCO2CFH: 2500,
        firmwareVersion: 'Unknown',
        protocolVersion: 'BACnet/IP',
        lastMaintenance: new Date(),
        nextMaintenance: new Date()
      }
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
      alarms: ['BACnet Communication Lost'],
      warnings: [],
      runtimeHours: 0,
      timestamp: new Date()
    })
  }

  // Utility method to create standard BACnet object maps
  static createStandardObjectMap(): BACnetObjectMap {
    return {
      // Analog Input objects (0-99)
      powerOutput: { type: 'analogInput', instance: 0 },
      voltagePhaseA: { type: 'analogInput', instance: 1 },
      voltagePhaseB: { type: 'analogInput', instance: 2 },
      voltagePhaseC: { type: 'analogInput', instance: 3 },
      currentPhaseA: { type: 'analogInput', instance: 4 },
      currentPhaseB: { type: 'analogInput', instance: 5 },
      currentPhaseC: { type: 'analogInput', instance: 6 },
      frequency: { type: 'analogInput', instance: 7 },
      powerFactor: { type: 'analogInput', instance: 8 },
      engineSpeed: { type: 'analogInput', instance: 10 },
      engineTemp: { type: 'analogInput', instance: 11 },
      coolantTemp: { type: 'analogInput', instance: 12 },
      oilPressure: { type: 'analogInput', instance: 13 },
      fuelFlow: { type: 'analogInput', instance: 14 },
      co2Output: { type: 'analogInput', instance: 15 },
      heatOutput: { type: 'analogInput', instance: 16 },
      efficiency: { type: 'analogInput', instance: 17 },
      runtimeHours: { type: 'analogInput', instance: 18 },
      
      // Binary Input objects (0-99)
      engineRunning: { type: 'binaryInput', instance: 0 },
      systemReady: { type: 'binaryInput', instance: 1 },
      alarmActive: { type: 'binaryInput', instance: 2 },
      warningActive: { type: 'binaryInput', instance: 3 },
      
      // Binary Output objects (0-99)
      startCommand: { type: 'binaryOutput', instance: 0 },
      stopCommand: { type: 'binaryOutput', instance: 1 },
      emergencyStop: { type: 'binaryOutput', instance: 2 },
      alarmReset: { type: 'binaryOutput', instance: 3 },
      
      // Analog Output objects (0-99)
      loadSetpoint: { type: 'analogOutput', instance: 0 },
      
      // Multi-state objects (0-99)
      systemState: { type: 'multiStateInput', instance: 0 },
      operatingMode: { type: 'multiStateOutput', instance: 0 }
    }
  }
}
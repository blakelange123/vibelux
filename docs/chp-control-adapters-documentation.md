# CHP Control System Adapters Documentation

## Overview

The CHP Control System Adapters provide a unified interface for integrating with various Combined Heat and Power (CHP) systems from different manufacturers. This modular architecture supports multiple communication protocols and provides real-time monitoring, control, and data collection capabilities.

## Architecture

### Core Components

1. **Base Adapter** (`base-adapter.ts`)
   - Abstract base class defining the standard interface
   - Common functionality like health checks, error handling, and data validation
   - Standard data structures and type definitions

2. **Protocol-Specific Adapters**
   - **Modbus Adapter** (`modbus-adapter.ts`): Modbus RTU/TCP communication
   - **BACnet Adapter** (`bacnet-adapter.ts`): BACnet IP/MSTP communication  
   - **API Adapter** (`api-adapter.ts`): RESTful HTTP/HTTPS communication
   - **OPC-UA Adapter** (planned): OPC-UA industrial protocol

3. **Adapter Factory** (`adapter-factory.ts`)
   - Factory pattern for creating appropriate adapters
   - Configuration management for different manufacturers
   - Connection pooling and adapter lifecycle management

4. **Adapter Manager** (`adapter-factory.ts`)
   - High-level interface for managing multiple CHP units
   - Health monitoring and alerting
   - Event-driven architecture for real-time updates

## Supported Protocols

### Modbus RTU/TCP
- **Use Case**: Industrial CHP systems (Caterpillar, Cummins)
- **Features**: Register mapping, scaling factors, alarm parsing
- **Port**: Typically 502 for TCP
- **Configuration**: Register maps and scaling factors per manufacturer

### BACnet IP/MSTP
- **Use Case**: Building automation integration (GE, Honeywell)
- **Features**: Object mapping, property reading/writing, event handling
- **Port**: Typically 47808 for IP
- **Configuration**: Device ID and object instance mapping

### REST API
- **Use Case**: Modern web-enabled CHP systems (Clarke Energy)
- **Features**: HTTP/HTTPS, authentication, rate limiting, WebSocket support
- **Port**: 80/443 or custom
- **Configuration**: Endpoint mapping and authentication

## Quick Start

### Basic Usage

```typescript
import { CHPAdapters } from '@/lib/chp-control-adapters'

// Connect to a Caterpillar CHP via Modbus TCP
const adapter = await CHPAdapters.createForManufacturer(
  'caterpillar',
  'CG132-8',
  '192.168.1.100',
  502
)

// Read operational data
const data = await adapter.readOperationalData()
console.log(`Power Output: ${data.powerOutput} kW`)
console.log(`Engine Running: ${data.isRunning}`)

// Send control command
const response = await adapter.sendCommand({
  command: 'START',
  timestamp: new Date(),
  operatorId: 'user123'
})
```

### Multi-Unit Management

```typescript
import { CHPAdapterManager } from '@/lib/chp-control-adapters'

const manager = new CHPAdapterManager()

// Add multiple CHP units
await manager.addCHPUnit('unit-1', {
  type: 'modbus-tcp',
  connection: {
    host: '192.168.1.100',
    port: 502,
    protocol: 'modbus-tcp',
    timeout: 5000,
    retryAttempts: 3
  }
})

await manager.addCHPUnit('unit-2', {
  type: 'api',
  connection: {
    host: '192.168.1.101',
    port: 80,
    protocol: 'api',
    timeout: 10000,
    retryAttempts: 3,
    authentication: {
      username: 'admin',
      password: 'password'
    }
  },
  specific: {
    api: {
      baseUrl: 'http://192.168.1.101',
      endpoints: {
        status: '/api/status',
        control: '/api/control',
        systemInfo: '/api/info',
        alarms: '/api/alarms',
        maintenance: '/api/maintenance'
      },
      authType: 'basic'
    }
  }
})

// Get data from all units
const allData = await manager.getAllOperationalData()
```

## Manufacturer-Specific Configurations

### Caterpillar
```typescript
const config = CHPAdapterFactory.createConfigForManufacturer(
  'caterpillar',
  'CG132-8',
  {
    host: '192.168.1.100',
    port: 502,
    protocol: 'modbus-tcp',
    timeout: 5000,
    retryAttempts: 3
  }
)
// Uses Modbus TCP with 1:1 power scaling
```

### GE Jenbacher
```typescript
const config = CHPAdapterFactory.createConfigForManufacturer(
  'ge',
  'JGS420',
  {
    host: '192.168.1.101',
    port: 47808,
    protocol: 'bacnet',
    timeout: 5000,
    retryAttempts: 3
  }
)
// Uses BACnet IP with standard object mapping
```

### Clarke Energy
```typescript
const config = CHPAdapterFactory.createConfigForManufacturer(
  'clarke',
  'TCG2032',
  {
    host: '192.168.1.102',
    port: 80,
    protocol: 'api',
    timeout: 10000,
    retryAttempts: 3,
    authentication: {
      username: 'operator',
      password: 'secure123'
    }
  }
)
// Uses REST API with basic authentication
```

## Data Structures

### CHPOperationalData
```typescript
interface CHPOperationalData {
  isRunning: boolean
  powerOutput: number        // kW electrical
  co2Output: number         // CFH CO2 production
  heatOutput: number        // kW thermal
  fuelConsumption: number   // therms/hour
  efficiency: number        // %
  engineSpeed: number       // RPM
  engineTemp: number        // °F
  coolantTemp: number       // °F
  oilPressure: number       // PSI
  voltage: [number, number, number]  // Phase A, B, C
  current: [number, number, number]  // Phase A, B, C
  powerFactor: number
  frequency: number         // Hz
  alarms: string[]
  warnings: string[]
  runtimeHours: number
  timestamp: Date
}
```

### CHPControlCommand
```typescript
interface CHPControlCommand {
  command: 'START' | 'STOP' | 'SET_LOAD' | 'EMERGENCY_STOP' | 'RESET_ALARMS'
  parameters?: {
    targetLoad?: number     // % of rated capacity
    timeout?: number        // seconds
    force?: boolean
  }
  timestamp: Date
  operatorId?: string
  reason?: string
}
```

## Error Handling and Reliability

### Connection Management
- Automatic reconnection with exponential backoff
- Connection pooling to prevent resource exhaustion
- Health checks with configurable intervals
- Graceful degradation when communication fails

### Data Validation
- Range checking for all sensor readings
- Timestamp validation and stale data detection
- Alarm code mapping and standardization
- Data quality scoring and confidence levels

### Error Recovery
```typescript
// Automatic retry with exponential backoff
const adapter = await CHPAdapterFactory.createAdapter(config)
const connected = await adapter.connectWithRetry() // Built-in retry logic

// Health monitoring with alerts
const manager = new CHPAdapterManager()
manager.on('unitError', (event) => {
  console.error(`CHP Unit ${event.unitId} error: ${event.error}`)
  // Implement alerting logic
})

manager.on('alerts', (event) => {
  console.warn(`CHP Unit ${event.unitId} alerts: ${event.alerts.join(', ')}`)
})
```

## Integration with Vibelux Platform

### Real-Time Updates
```typescript
// Integration with CHPDecisionEngine component
import { CHPAdapterManager } from '@/lib/chp-control-adapters'

class CHPIntegrationService {
  private manager: CHPAdapterManager
  
  constructor() {
    this.manager = new CHPAdapterManager()
    this.setupEventHandlers()
  }
  
  private setupEventHandlers(): void {
    this.manager.on('healthCheck', async (results) => {
      // Update database with latest operational data
      await this.updateDatabaseWithOperationalData(results)
      
      // Trigger CHP decision re-evaluation
      await this.triggerCHPDecisionUpdate()
    })
  }
  
  async updateDatabaseWithOperationalData(results: any): Promise<void> {
    for (const [unitId, data] of Object.entries(results)) {
      await database.insertCHPOperationalData({
        chpUnitId: unitId,
        ...data,
        timestamp: new Date()
      })
    }
  }
}
```

### API Integration
```typescript
// Update existing CHP API to use real hardware adapters
// /src/app/api/energy/chp/decision/route.ts

import { CHPAdapterManager } from '@/lib/chp-control-adapters'

const chpManager = new CHPAdapterManager()

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get real-time data from actual CHP hardware
    const operationalData = await chpManager.getAllOperationalData()
    
    // Calculate economic decisions based on real hardware status
    const decisions = {}
    for (const [unitId, data] of Object.entries(operationalData)) {
      if (!data.error) {
        decisions[unitId] = calculateCHPDecision(data, marketConditions)
      }
    }

    return NextResponse.json({
      operationalData,
      decisions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error reading CHP hardware:', error)
    return NextResponse.json({ error: 'Hardware communication failed' }, { status: 500 })
  }
}
```

## Configuration Examples

### Modbus TCP Configuration
```typescript
const modbusConfig: CHPAdapterConfig = {
  type: 'modbus-tcp',
  connection: {
    host: '192.168.1.100',
    port: 502,
    protocol: 'modbus-tcp',
    unitId: 1,
    timeout: 5000,
    retryAttempts: 3
  },
  specific: {
    modbus: {
      registerMap: {
        systemStatus: 0,
        engineSpeed: 1,
        powerOutput: 2,
        voltagePhaseA: 3,
        // ... additional registers
      },
      scalingFactors: {
        power: 0.1,
        voltage: 0.1,
        current: 0.01,
        temperature: 0.1
      },
      dataFormat: 'uint16',
      byteOrder: 'big-endian'
    }
  }
}
```

### BACnet IP Configuration
```typescript
const bacnetConfig: CHPAdapterConfig = {
  type: 'bacnet-ip',
  connection: {
    host: '192.168.1.101',
    port: 47808,
    protocol: 'bacnet',
    timeout: 5000,
    retryAttempts: 3
  },
  specific: {
    bacnet: {
      deviceId: 1001,
      objectMap: {
        powerOutput: { type: 'analogInput', instance: 0 },
        engineSpeed: { type: 'analogInput', instance: 1 },
        engineRunning: { type: 'binaryInput', instance: 0 },
        startCommand: { type: 'binaryOutput', instance: 0 }
        // ... additional objects
      },
      maxAPDU: 1476,
      segmentation: true
    }
  }
}
```

### API Configuration
```typescript
const apiConfig: CHPAdapterConfig = {
  type: 'api',
  connection: {
    host: '192.168.1.102',
    port: 443,
    protocol: 'api',
    timeout: 10000,
    retryAttempts: 3,
    authentication: {
      apiKey: 'your-api-key-here'
    },
    encryption: {
      enabled: true,
      protocol: 'tls'
    }
  },
  specific: {
    api: {
      baseUrl: 'https://192.168.1.102',
      endpoints: {
        status: '/api/v1/engine/status',
        control: '/api/v1/engine/control',
        systemInfo: '/api/v1/system/info',
        alarms: '/api/v1/alarms/current',
        maintenance: '/api/v1/maintenance/schedule'
      },
      authType: 'api-key',
      rateLimiting: {
        requestsPerMinute: 120,
        burstLimit: 20
      }
    }
  }
}
```

## Testing and Development

### Connection Testing
```typescript
import { CHPTestUtilities } from '@/lib/chp-control-adapters'

// Test connection to CHP system
const testResult = await CHPTestUtilities.testConnection(config)
if (testResult.success) {
  console.log('Connection successful!')
  console.log('System Info:', testResult.systemInfo)
  console.log('Sample Data:', testResult.sampleData)
} else {
  console.error('Connection failed:', testResult.message)
}
```

### Simulated Data for Development
```typescript
// Generate simulated CHP data for testing
const simulatedData = CHPTestUtilities.createSimulatedData()
console.log('Simulated Power Output:', simulatedData.powerOutput)
```

### Health Monitoring Setup
```typescript
import { CHPHealthMonitor } from '@/lib/chp-control-adapters'

const healthMonitor = new CHPHealthMonitor(manager)

// Configure alert thresholds
healthMonitor.setAlertThreshold('engineTemp', 230) // °F
healthMonitor.setAlertThreshold('responseTime', 3000) // ms

// Handle alerts
manager.on('alerts', (event) => {
  // Send notifications, log alerts, trigger maintenance requests
  console.log(`ALERT: Unit ${event.unitId} - ${event.alerts.join(', ')}`)
})
```

## Security Considerations

### Authentication
- Support for multiple authentication methods (Basic, Bearer, API Key, OAuth2)
- Secure credential storage and management
- Certificate-based authentication for industrial protocols

### Network Security
- TLS/SSL encryption for API communications
- Network segmentation recommendations
- Firewall configuration guidelines

### Access Control
- Role-based command authorization
- Audit logging of all control actions
- Operator identification and tracking

## Performance Optimization

### Connection Pooling
- Reuse existing connections when possible
- Automatic connection cleanup and resource management
- Configurable connection timeouts and retry policies

### Data Caching
- Intelligent caching of static system information
- Rate limiting to prevent API overload
- Batch operations for efficiency

### Scalability
- Asynchronous operations throughout
- Event-driven architecture for real-time updates
- Horizontal scaling support for multiple facilities

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check network connectivity
   - Verify firewall settings
   - Adjust timeout values in configuration

2. **Authentication Failures**
   - Verify credentials are correct
   - Check authentication method compatibility
   - Ensure API keys have proper permissions

3. **Data Parsing Errors**
   - Verify register maps for Modbus systems
   - Check object instance mappings for BACnet
   - Validate API response formats

4. **Performance Issues**
   - Optimize polling intervals
   - Implement data caching
   - Check network latency

### Logging and Diagnostics
```typescript
// Enable detailed logging
const adapter = await CHPAdapterFactory.createAdapter(config)

// Monitor health status
const health = await adapter.healthCheck()
console.log('Adapter Health:', health)

// Check last error
const lastError = adapter.getLastError()
if (lastError) {
  console.error('Last Error:', lastError.message)
}
```

## Future Enhancements

### Planned Features
1. **OPC-UA Protocol Support** - For advanced industrial systems
2. **Predictive Maintenance Integration** - AI-driven maintenance scheduling
3. **Advanced Analytics** - Performance trending and optimization recommendations
4. **Mobile Device Support** - React Native adapters for mobile monitoring
5. **Edge Computing** - Local processing capabilities for reduced latency

### API Evolution
- RESTful API versioning strategy
- GraphQL endpoint for flexible data querying
- WebSocket streaming for real-time data feeds
- Webhook support for event notifications

This adapter framework provides a robust, scalable foundation for integrating CHP systems into the Vibelux platform while maintaining flexibility for future enhancements and new manufacturer support.
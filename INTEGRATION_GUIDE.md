# Vibelux Device Integration Guide

## Overview
Vibelux provides comprehensive integration capabilities for connecting and controlling all your cultivation equipment through industry-standard protocols.

## Supported Protocols

### 1. BACnet/IP
- **Purpose**: Building automation systems, HVAC, lighting controllers
- **Port**: 47808 (standard)
- **Features**:
  - Auto-discovery of BACnet devices
  - Read/write to analog, binary, and multi-state points
  - Trend logging and scheduling
  - Alarm management

### 2. Modbus TCP/RTU
- **Purpose**: PLCs, irrigation controllers, power meters
- **Port**: 502 (TCP)
- **Features**:
  - Register mapping
  - Coil and holding register access
  - Multi-device polling
  - Data type conversion

### 3. MQTT
- **Purpose**: IoT sensors, wireless devices, custom integrations
- **Port**: 1883 (standard), 8883 (TLS)
- **Features**:
  - Topic subscription
  - Real-time data streaming
  - Bi-directional communication
  - QoS levels support

### 4. OPC UA
- **Purpose**: Industrial equipment, SCADA systems
- **Port**: 4840 (standard)
- **Features**:
  - Secure authentication
  - Complex data structures
  - Historical data access
  - Method calls

### 5. REST API
- **Purpose**: Cloud services, third-party platforms
- **Features**:
  - JSON data format
  - Webhook support
  - OAuth2 authentication
  - Rate limiting

## Connection Setup

### Quick Start
1. Navigate to `/integration` in Vibelux
2. Click "Add Connection"
3. Select your protocol type
4. Enter connection details:
   - IP Address
   - Port
   - Authentication credentials (if required)
5. Test connection
6. Auto-discover devices

### BACnet Example Configuration
```
IP Address: 192.168.1.100
Port: 47808
Device Instance: 1234
Max APDU: 1476
Segmentation: Both
```

### Modbus Example Configuration
```
IP Address: 192.168.1.201
Port: 502
Unit ID: 1
Register Map: Custom or Standard
Timeout: 1000ms
```

## Device Mapping

### Automatic Point Discovery
Vibelux automatically discovers available data points for most protocols:
- BACnet: Object list enumeration
- Modbus: Register scanning
- MQTT: Topic discovery
- OPC UA: Node browsing

### Manual Point Configuration
For custom devices, you can manually map points:
1. Select device
2. Click "Configure Points"
3. Add point with:
   - Name
   - Address/Object ID
   - Data type
   - Units
   - Read/Write permissions
   - Scaling factors

## Data Flow

### Real-time Monitoring
- All connected points update in real-time
- Configurable poll rates (1-60 seconds)
- Data buffering for network interruptions
- Automatic reconnection

### Control Commands
- Direct write to equipment
- Safety interlocks
- Command confirmation
- Audit logging

### Historical Data
- Automatic trend logging
- Configurable retention periods
- Export capabilities
- Analytics integration

## Common Device Types

### HVAC Equipment
- **Air Handlers**: Temperature, humidity, fan speed control
- **Chillers**: Setpoints, status, alarms
- **VAV Boxes**: Damper position, airflow
- **Exhaust Fans**: Speed control, status

### Lighting Systems
- **LED Drivers**: Dimming levels, spectrum control
- **Photoperiod Controllers**: Schedule management
- **Light Sensors**: PPFD, DLI measurements

### Irrigation
- **Pump Controllers**: Flow rate, pressure
- **Valve Actuators**: Open/close control
- **Fertigation Systems**: EC, pH, dosing rates
- **Tank Monitors**: Level sensors

### Environmental Sensors
- **Temperature/Humidity**: Multi-zone monitoring
- **CO2 Sensors**: PPM levels
- **Light Sensors**: PAR, spectrum analysis
- **Airflow**: Velocity, pressure differential

## Security

### Network Security
- VPN support for remote connections
- TLS/SSL encryption
- Certificate-based authentication
- IP whitelisting

### Access Control
- Role-based permissions
- Device-level security
- Point-level write protection
- Audit trails

## Troubleshooting

### Connection Issues
1. Verify network connectivity (ping test)
2. Check firewall rules
3. Confirm port availability
4. Validate credentials

### Data Issues
1. Check point addressing
2. Verify data types
3. Confirm scaling factors
4. Review poll rates

### Performance
1. Optimize poll rates
2. Implement data filtering
3. Use batch reads
4. Enable compression

## Best Practices

1. **Network Segmentation**: Keep automation networks separate
2. **Redundancy**: Configure backup connections
3. **Monitoring**: Set up connection health alerts
4. **Documentation**: Maintain device inventory
5. **Testing**: Use simulation mode before production
6. **Backup**: Export configurations regularly

## API Integration

For custom integrations, use the Vibelux API:

```javascript
// Example: Send data to Vibelux
const response = await fetch('https://api.vibelux.com/v1/data', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    deviceId: 'sensor-001',
    timestamp: new Date().toISOString(),
    data: {
      temperature: 24.5,
      humidity: 65.2,
      co2: 850
    }
  })
});
```

## Support

For integration assistance:
- Documentation: `/integration` dashboard
- Community Forum: `/community-forum`
- Support Email: support@vibelux.com
- API Docs: `/api-docs`
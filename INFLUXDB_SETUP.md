# InfluxDB Setup for Vibelux

## Overview
Vibelux uses InfluxDB 3 Enterprise for storing time-series sensor data. This provides high-performance storage and querying for millions of sensor readings.

## Installation Complete ✅
InfluxDB 3 Enterprise has been installed at: `~/.influxdb/influxdb3`

## Configuration Files
- **Config**: `influxdb-config.toml` - Main configuration file
- **Data Directory**: `influxdb-data/` - Where all data is stored
- **Start Script**: `start-influxdb.sh` - Starts the InfluxDB server
- **Init Script**: `init-influxdb.sh` - Creates databases and tables

## Database Structure

### Database: `vibelux_sensors`

#### Tables:
1. **temperature** - Temperature sensor readings
2. **humidity** - Humidity sensor readings  
3. **co2** - CO2 sensor readings
4. **light** - Light intensity and spectrum data
5. **ph** - pH sensor readings
6. **ec** - Electrical conductivity readings
7. **hourly_avg** - Hourly aggregated averages
8. **daily_summary** - Daily summary statistics

## Quick Start

### 1. Start InfluxDB
```bash
./start-influxdb.sh
```

### 2. Initialize Database (first time only)
```bash
./init-influxdb.sh
```

### 3. Test Connection
```bash
npm run test:influxdb
# or
npx tsx test-influxdb.ts
```

### 4. Stop InfluxDB
```bash
kill $(cat influxdb.pid)
```

## API Endpoints
- **HTTP API**: http://localhost:8086
- **Health Check**: http://localhost:8086/health
- **Query API**: http://localhost:8086/api/v3/query

## Environment Variables
Add these to your `.env.local`:
```env
INFLUXDB_URL=http://localhost:8086
INFLUXDB_DATABASE=vibelux_sensors
INFLUXDB_TOKEN=
INFLUXDB_ADMIN_USER=vibelux_admin
INFLUXDB_ADMIN_PASSWORD=vibelux_secure_password_2024
```

## Usage in Vibelux

### Recording Sensor Data
```typescript
import { recordSensorReading } from '@/lib/timeseries/influxdb-client';

// Record a temperature reading
await recordSensorReading(
  'flower_room_a',     // roomId
  'temp_sensor_1',     // sensorId
  'temperature',       // measurement type
  75.5,               // value
  '°F',               // unit
  100                 // quality (0-100)
);
```

### Querying Data
```typescript
import { getSensorHistory } from '@/lib/timeseries/influxdb-client';

// Get last 24 hours of temperature data
const history = await getSensorHistory(
  'flower_room_a',
  'temperature',
  24
);
```

### Batch Writing
```typescript
import { getTimeSeriesDB } from '@/lib/timeseries/influxdb-client';

const tsdb = getTimeSeriesDB();
const dataPoints = [
  {
    measurement: 'temperature',
    tags: { room_id: 'room1', sensor_id: 'sensor1' },
    fields: { value: 75.5, unit: '°F', quality: 100 },
    timestamp: new Date()
  },
  // ... more points
];

await tsdb.writeBatch(dataPoints);
```

## Data Retention Policies

Based on subscription tier:
- **Free**: 7 days
- **Hobbyist**: 30 days
- **Professional**: 180 days
- **Enterprise**: Unlimited

## Performance Considerations

1. **Batch Writes**: Always batch sensor writes when possible (up to 5000 points)
2. **Aggregation**: Use pre-aggregated tables for dashboard queries
3. **Indexing**: Tables are indexed by time, room_id, and sensor_id
4. **Compression**: InfluxDB 3 uses Apache Arrow for efficient storage

## Monitoring

Check InfluxDB logs:
```bash
tail -f influxdb.log
```

Check database size:
```bash
du -sh influxdb-data/
```

## Backup & Recovery

### Backup
```bash
tar -czf influxdb-backup-$(date +%Y%m%d).tar.gz influxdb-data/
```

### Restore
```bash
tar -xzf influxdb-backup-20240320.tar.gz
```

## Troubleshooting

### Connection Refused
- Check if InfluxDB is running: `ps aux | grep influxdb3`
- Check logs: `tail -f influxdb.log`
- Verify port 8086 is available: `lsof -i :8086`

### Permission Denied
- Ensure data directory has correct permissions
- Check file ownership: `ls -la influxdb-data/`

### High Memory Usage
- Adjust cache settings in `influxdb-config.toml`
- Implement data retention policies
- Use continuous queries for aggregation

## Next Steps

1. **Production Setup**:
   - Enable authentication tokens
   - Set up SSL/TLS
   - Configure retention policies
   - Set up continuous queries
   - Enable clustering for HA

2. **Integration**:
   - Connect hardware sensors
   - Set up WebSocket streaming
   - Implement real-time dashboards
   - Configure alerts based on thresholds

3. **Scaling**:
   - Add read replicas
   - Implement sharding
   - Use InfluxDB Cloud for managed service
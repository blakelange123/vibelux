# Energy Savings Program - Production Readiness Checklist

## ✅ COMPLETED COMPONENTS

### 1. Core Energy Optimization System
- ✅ **EnergySavingsProgram.tsx** - Main UI with real-time monitoring
- ✅ **energy-optimization-rules.ts** - Crop-specific safety rules engine
- ✅ **SmartEnergySavingsIntegration.tsx** - System integration component
- ✅ **energy-monitoring.ts** - Energy monitoring and verification
- ✅ **modbus-lighting-control.ts** - Hardware control interface

### 2. Safety Features
- ✅ Photoperiod protection (cannabis 12/12 hard lock)
- ✅ DLI maintenance algorithms
- ✅ Temperature-based dimming
- ✅ Crop-specific constraints database
- ✅ Manual override controls with warnings

### 3. Existing Infrastructure
- ✅ Energy API integration (src/lib/integrations/energy-api.ts)
- ✅ WebSocket server for real-time updates
- ✅ InfluxDB client for time-series data
- ✅ Revenue sharing baseline system
- ✅ Smart meter integration framework

## ❌ MISSING FOR PRODUCTION

### 1. Environment Variables (.env)
```bash
# Energy API Configuration
ENERGY_API_KEY=your_eia_api_key_here
ENERGY_ZONE=NYISO  # or CAISO, ERCOT, etc.

# InfluxDB Configuration
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your_influxdb_token
INFLUXDB_ORG=vibelux
INFLUXDB_BUCKET=energy_monitoring

# Modbus Configuration
MODBUS_GATEWAY_URL=ws://localhost:8080
MODBUS_GATEWAY_API_KEY=your_gateway_key

# Utility Rate APIs (Optional but recommended)
OPENEI_API_KEY=your_openei_key  # For utility rate database
GENABILITY_API_KEY=your_genability_key  # For real-time rates
```

### 2. Real-Time Energy Rate Integration
Need to implement one of these:
- **OpenEI Utility Rate Database API** (free, comprehensive)
- **Genability API** (paid, real-time pricing)
- **Local utility API** (varies by region)

### 3. Hardware Integration
- ❌ Actual Modbus gateway implementation
- ❌ Smart meter data collection service
- ❌ Sensor polling service
- ❌ Control system failover logic

### 4. Database Schema
```sql
-- Energy monitoring tables
CREATE TABLE energy_readings (
  id UUID PRIMARY KEY,
  facility_id UUID NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  power_kw DECIMAL(10,3),
  energy_kwh DECIMAL(12,3),
  power_factor DECIMAL(3,2),
  voltage DECIMAL(6,2),
  current DECIMAL(8,2),
  cost_rate DECIMAL(6,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE energy_baselines (
  id UUID PRIMARY KEY,
  facility_id UUID NOT NULL,
  crop_type VARCHAR(100),
  growth_stage VARCHAR(50),
  baseline_kwh_daily DECIMAL(10,2),
  baseline_cost_daily DECIMAL(10,2),
  established_date DATE,
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE optimization_events (
  id UUID PRIMARY KEY,
  facility_id UUID NOT NULL,
  strategy VARCHAR(100),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  energy_saved_kwh DECIMAL(10,3),
  cost_saved DECIMAL(10,2),
  safety_score INTEGER,
  crop_impact VARCHAR(255)
);
```

### 5. Background Services
```typescript
// src/services/energy-optimization-service.ts
export class EnergyOptimizationService {
  // Runs every 5 minutes
  async optimizeLighting() {
    // 1. Get current energy rates
    // 2. Check crop constraints
    // 3. Apply safe optimizations
    // 4. Log results
  }
}

// src/services/meter-polling-service.ts
export class MeterPollingService {
  // Runs every 1 minute
  async pollMeters() {
    // 1. Read smart meters
    // 2. Store in InfluxDB
    // 3. Calculate real-time savings
    // 4. Broadcast updates
  }
}
```

### 6. Testing Requirements
- ❌ Integration tests with mock hardware
- ❌ Crop safety validation tests
- ❌ Energy savings calculation tests
- ❌ Failover scenario tests

## 🚀 DEPLOYMENT STEPS

### 1. Infrastructure Setup
```bash
# 1. Deploy InfluxDB
docker run -d \
  --name influxdb \
  -p 8086:8086 \
  -v influxdb-data:/var/lib/influxdb2 \
  influxdb:2.7

# 2. Deploy Modbus Gateway (if using)
docker run -d \
  --name modbus-gateway \
  -p 8080:8080 \
  vibelux/modbus-gateway:latest

# 3. Configure environment variables
cp .env.example .env
# Edit .env with production values
```

### 2. API Keys Required
1. **EIA API Key** (Free)
   - Register at: https://www.eia.gov/opendata/register.php
   - Used for wholesale energy prices

2. **OpenEI API Key** (Free, Recommended)
   - Register at: https://openei.org/services/
   - Provides utility rate schedules

3. **Smart Meter Access**
   - Contact local utility for API access
   - Or use meter data management provider

### 3. Verification Steps
```typescript
// Run these checks before going live
async function verifyProductionReadiness() {
  // 1. Test energy API connection
  const rates = await energyAPI.getCurrentRates();
  assert(rates.rate > 0, 'Energy rates not available');
  
  // 2. Test crop protection
  const result = energyOptimizationEngine.evaluateOptimization(
    'photoperiod_shift',
    { shiftHours: 2, crop: 'cannabis', stage: 'flowering' }
  );
  assert(!result.allowed, 'Cannabis flowering protection failed!');
  
  // 3. Test hardware communication
  const controller = createLightingController('modbus-generic', config);
  const connected = await controller.connect();
  assert(connected, 'Cannot connect to lighting system');
  
  // 4. Test monitoring
  const savings = await energyMonitoring.calculateVerifiedSavings(
    facilityId,
    new Date(),
    new Date()
  );
  assert(savings.confidence > 80, 'Monitoring confidence too low');
}
```

## 🔧 PRODUCTION CONFIGURATION

### 1. Create Production Energy Service
```typescript
// src/services/production-energy-service.ts
import { energyAPI } from '@/lib/integrations/energy-api';
import { energyOptimizationEngine } from '@/lib/energy-optimization-rules';
import { energyMonitoring } from '@/lib/energy-monitoring';
import { createLightingController } from '@/lib/modbus-lighting-control';

export class ProductionEnergyService {
  private controller: any;
  private isRunning = false;
  
  async initialize() {
    // Connect to hardware
    this.controller = createLightingController('modbus-generic', {
      type: 'TCP',
      host: process.env.MODBUS_HOST,
      tcpPort: 502,
      slaveId: 1
    });
    
    await this.controller.connect();
    
    // Start optimization loop
    this.startOptimization();
  }
  
  private async startOptimization() {
    this.isRunning = true;
    
    while (this.isRunning) {
      try {
        // 1. Get current rates
        const rates = await energyAPI.getCurrentRates();
        const forecast = await energyAPI.getEnergyForecast();
        
        // 2. Get current state
        const currentState = {
          time: { hour: new Date().getHours() },
          grid: { peakRate: rates.rate > 0.15 ? 1 : 0 },
          environment: { temperature: await this.getTemperature() }
        };
        
        // 3. Apply safe optimizations
        const actions = energyOptimizationEngine.applyRules(currentState);
        
        for (const action of actions) {
          if (action.type === 'dim') {
            await this.controller.setZoneDimming(0, action.value);
          }
        }
        
        // 4. Log results
        await energyMonitoring.ingestEnergyReading({
          facilityId: process.env.FACILITY_ID,
          deviceId: 'main',
          timestamp: new Date(),
          sensorType: 'energy-meter',
          metrics: {
            instantaneousPower: await this.getPowerDraw(),
            totalEnergy: 0,
            powerFactor: 0.95,
            voltage: 240,
            current: await this.getCurrent(),
            frequency: 60
          },
          cost: { rate: rates.rate }
        });
        
      } catch (error) {
        console.error('Optimization error:', error);
      }
      
      // Wait 5 minutes
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }
}
```

### 2. Add to Main Application
```typescript
// src/app/api/services/start/route.ts
import { ProductionEnergyService } from '@/services/production-energy-service';

const energyService = new ProductionEnergyService();

export async function POST() {
  try {
    await energyService.initialize();
    return NextResponse.json({ status: 'started' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## ⚠️ CRITICAL WARNINGS

1. **NEVER** disable photoperiod protection for cannabis flowering
2. **ALWAYS** verify crop type before applying optimizations
3. **TEST** with simulated data before connecting real hardware
4. **MONITOR** first 48 hours closely after deployment
5. **BACKUP** manual control must always be available

## 📊 SUCCESS METRICS

Track these KPIs after launch:
- Energy savings: Target 15-25% reduction
- Crop quality: Zero negative impact
- System uptime: >99.5%
- User satisfaction: >90%
- Revenue share collected: 20% of verified savings

## 🚨 EMERGENCY PROCEDURES

If crops show stress:
1. Immediately disable all optimizations
2. Revert to manual control
3. Document incident with timestamps
4. Review optimization logs
5. Adjust safety parameters before restarting
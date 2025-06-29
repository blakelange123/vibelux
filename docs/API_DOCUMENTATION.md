# Vibelux API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [SDKs & Libraries](#sdks--libraries)
7. [Webhooks](#webhooks)
8. [Best Practices](#best-practices)

---

## Authentication

### API Key Authentication

All API requests require authentication using an API key in the Authorization header:

```http
Authorization: Bearer vx_live_1234567890abcdef
```

#### Getting Your API Key

1. **Dashboard Method**
   ```
   Navigate to: Settings > API > Generate Key
   ```

2. **Programmatic Method**
   ```bash
   curl -X POST https://api.vibelux.com/v1/auth/api-keys \
     -H "Authorization: Bearer <session_token>" \
     -H "Content-Type: application/json" \
     -d '{"name": "My API Key", "scopes": ["read", "write"]}'
   ```

#### API Key Scopes

| Scope | Description |
|-------|-------------|
| `read` | Read access to all resources |
| `write` | Create and update resources |
| `delete` | Delete resources |
| `admin` | Administrative operations |

### OAuth 2.0 (Enterprise)

For enterprise integrations, use OAuth 2.0 with PKCE:

```javascript
// OAuth Configuration
const config = {
  clientId: 'vx_client_1234567890',
  redirectUri: 'https://yourapp.com/callback',
  scope: 'read write projects sensors',
  responseType: 'code',
  codeChallenge: generateCodeChallenge(),
  codeChallengeMethod: 'S256'
};
```

---

## Rate Limiting

Rate limits are enforced per API key based on your subscription tier:

| Tier | Requests/Hour | Burst Limit |
|------|---------------|-------------|
| Free | 100 | 10 |
| Starter | 1,000 | 50 |
| Professional | 5,000 | 100 |
| Business | 10,000 | 200 |
| Enterprise | Unlimited | 500 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 3600
```

### Handling Rate Limits

```javascript
const makeRequest = async (url, options) => {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('X-RateLimit-Retry-After');
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeRequest(url, options);
  }
  
  return response;
};
```

---

## API Endpoints

### Base URL
```
Production: https://api.vibelux.com/v1
Sandbox: https://sandbox-api.vibelux.com/v1
```

### Projects

#### List Projects
```http
GET /projects
```

**Parameters:**
- `limit` (integer): Number of results (1-100, default: 20)
- `offset` (integer): Pagination offset
- `facility_id` (string): Filter by facility

**Response:**
```json
{
  "data": [
    {
      "id": "proj_1234567890",
      "name": "Cannabis Flowering Room A",
      "description": "4000 sq ft flowering room optimization",
      "facility_id": "fac_0987654321",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-16T14:22:00Z",
      "status": "active",
      "metadata": {
        "area_sqft": 4000,
        "crop_type": "cannabis",
        "growth_stage": "flowering"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

#### Create Project
```http
POST /projects
```

**Request Body:**
```json
{
  "name": "New Growing Room",
  "description": "Lettuce production optimization",
  "facility_id": "fac_0987654321",
  "metadata": {
    "area_sqft": 2000,
    "crop_type": "leafy_greens",
    "target_ppfd": 250
  }
}
```

#### Get Project
```http
GET /projects/{project_id}
```

#### Update Project
```http
PUT /projects/{project_id}
```

#### Delete Project
```http
DELETE /projects/{project_id}
```

### Fixtures

#### List DLC Fixtures
```http
GET /fixtures
```

**Parameters:**
- `manufacturer` (string): Filter by manufacturer
- `min_efficacy` (number): Minimum efficacy (μmol/J)
- `max_wattage` (number): Maximum wattage
- `min_price` (number): Minimum price
- `max_price` (number): Maximum price
- `spectrum_type` (string): full_spectrum, broad_spectrum, targeted

**Response:**
```json
{
  "data": [
    {
      "id": "fix_fluence_spydrx_plus",
      "manufacturer": "Fluence",
      "model": "SPYDR 2x",
      "sku": "FSP2X-685W-120",
      "specifications": {
        "power_watts": 685,
        "efficacy_umol_j": 2.6,
        "ppfd_center": 1420,
        "beam_angle": 120,
        "spectrum": {
          "red_660nm": 0.25,
          "blue_450nm": 0.15,
          "white_phosphor": 0.55,
          "far_red_730nm": 0.05
        }
      },
      "photometric_data": {
        "ies_file_url": "https://cdn.vibelux.com/ies/fluence_spydr2x.ies",
        "polar_plot_url": "https://cdn.vibelux.com/plots/fluence_spydr2x.png"
      },
      "pricing": {
        "msrp_usd": 1299.00,
        "available_at": [
          {
            "vendor": "Growers House",
            "price": 1199.00,
            "url": "https://growershouse.com/fluence-spydr-2x"
          }
        ]
      },
      "certifications": {
        "dlc_qualified": true,
        "dlc_premium": true,
        "etl_listed": true
      }
    }
  ]
}
```

#### Get Fixture Details
```http
GET /fixtures/{fixture_id}
```

#### Fixture Recommendations
```http
POST /fixtures/recommendations
```

**Request Body:**
```json
{
  "area_length": 20,
  "area_width": 10,
  "mounting_height": 8,
  "target_ppfd": 600,
  "crop_type": "cannabis",
  "budget_max": 15000,
  "preferences": {
    "manufacturer": "fluence",
    "spectrum_type": "full_spectrum",
    "dimming_required": true
  }
}
```

### Calculations

#### PPFD Calculation
```http
POST /calculations/ppfd
```

**Request Body:**
```json
{
  "fixtures": [
    {
      "id": "fix_fluence_spydrx_plus",
      "position": {"x": 5, "y": 5, "z": 8},
      "power_level": 100,
      "tilt_angle": 0
    }
  ],
  "calculation_area": {
    "length": 10,
    "width": 10,
    "grid_resolution": 0.5
  },
  "calculation_height": 2.0
}
```

**Response:**
```json
{
  "calculation_id": "calc_1234567890",
  "results": {
    "grid_data": [
      {"x": 0, "y": 0, "ppfd": 245.6},
      {"x": 0.5, "y": 0, "ppfd": 312.8},
      {"x": 1.0, "y": 0, "ppfd": 389.2}
    ],
    "statistics": {
      "min_ppfd": 145.2,
      "max_ppfd": 687.3,
      "avg_ppfd": 425.8,
      "uniformity_ratio": 0.74,
      "cv_percentage": 18.5
    },
    "energy_analysis": {
      "total_power_w": 2740,
      "total_ppfd_m2": 42.58,
      "system_efficacy": 2.4
    }
  }
}
```

#### DLI Calculation
```http
POST /calculations/dli
```

#### Heat Load Analysis
```http
POST /calculations/heat-load
```

#### VPD Calculation
```http
POST /calculations/vpd
```

### Sensors

#### Get Sensor Readings
```http
GET /sensors/readings
```

**Parameters:**
- `facility_id` (string): Facility identifier
- `sensor_type` (string): temperature, humidity, co2, ppfd, vpd
- `start_time` (ISO8601): Start of time range
- `end_time` (ISO8601): End of time range
- `interval` (string): minute, hour, day

**Response:**
```json
{
  "data": [
    {
      "timestamp": "2024-01-15T14:30:00Z",
      "facility_id": "fac_0987654321",
      "zone_id": "zone_flowering_a",
      "readings": {
        "temperature_c": 24.5,
        "humidity_rh": 65.2,
        "co2_ppm": 1200,
        "ppfd_umol": 645,
        "vpd_kpa": 1.15
      },
      "quality_flags": {
        "calibration_status": "valid",
        "data_quality": "good",
        "anomaly_detected": false
      }
    }
  ]
}
```

#### Submit Sensor Data
```http
POST /sensors/readings
```

**Request Body:**
```json
{
  "facility_id": "fac_0987654321",
  "readings": [
    {
      "sensor_id": "temp_001",
      "timestamp": "2024-01-15T14:30:00Z",
      "value": 24.5,
      "unit": "celsius"
    },
    {
      "sensor_id": "humid_001",
      "timestamp": "2024-01-15T14:30:00Z",
      "value": 65.2,
      "unit": "percent_rh"
    }
  ]
}
```

### Machine Learning

#### Yield Prediction
```http
POST /ml/yield-prediction
```

**Request Body:**
```json
{
  "facility_id": "fac_0987654321",
  "crop_type": "cannabis",
  "strain": "gorilla_glue_4",
  "environmental_data": {
    "avg_temperature": 24.5,
    "avg_humidity": 65,
    "avg_co2": 1200,
    "avg_ppfd": 650,
    "photoperiod_hours": 12
  },
  "cultivation_parameters": {
    "planting_density": 4.0,
    "growth_medium": "coco_coir",
    "nutrient_schedule": "aggressive",
    "training_method": "scrog"
  }
}
```

**Response:**
```json
{
  "prediction_id": "pred_1234567890",
  "model_version": "v2.1.0",
  "confidence_score": 0.87,
  "predictions": {
    "yield_per_plant_grams": 85.4,
    "yield_per_sqft_grams": 341.6,
    "harvest_date": "2024-03-15",
    "quality_score": 8.2
  },
  "factors": {
    "light_contribution": 0.35,
    "environment_contribution": 0.28,
    "genetics_contribution": 0.22,
    "cultivation_contribution": 0.15
  }
}
```

#### Model Training Data
```http
POST /ml/training-data
```

### Reports

#### Generate Report
```http
POST /reports/generate
```

**Request Body:**
```json
{
  "template": "photometric_analysis",
  "project_id": "proj_1234567890",
  "parameters": {
    "include_3d_visualization": true,
    "include_cost_analysis": true,
    "custom_branding": {
      "company_name": "Green Valley Farms",
      "logo_url": "https://example.com/logo.png"
    }
  },
  "format": "pdf"
}
```

**Response:**
```json
{
  "report_id": "rpt_1234567890",
  "status": "generating",
  "estimated_completion": "2024-01-15T15:05:00Z",
  "download_url": null
}
```

#### Get Report Status
```http
GET /reports/{report_id}
```

### Marketplace

#### List Produce Listings
```http
GET /marketplace/produce
```

#### Create Produce Listing
```http
POST /marketplace/produce
```

#### Submit Order
```http
POST /marketplace/orders
```

### Analytics

#### Usage Statistics
```http
GET /analytics/usage
```

#### Performance Metrics
```http
GET /analytics/performance
```

---

## Data Models

### Project Model
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  facility_id: string;
  owner_id: string;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  metadata: {
    area_sqft?: number;
    crop_type?: string;
    growth_stage?: string;
    target_ppfd?: number;
    target_dli?: number;
  };
}
```

### Fixture Model
```typescript
interface Fixture {
  id: string;
  manufacturer: string;
  model: string;
  sku: string;
  specifications: {
    power_watts: number;
    efficacy_umol_j: number;
    ppfd_center: number;
    beam_angle: number;
    spectrum: SpectrumData;
    dimensions: {
      length_mm: number;
      width_mm: number;
      height_mm: number;
      weight_kg: number;
    };
  };
  photometric_data: {
    ies_file_url?: string;
    polar_plot_url?: string;
    spectral_plot_url?: string;
  };
  pricing: {
    msrp_usd: number;
    available_at: VendorListing[];
  };
  certifications: {
    dlc_qualified: boolean;
    dlc_premium: boolean;
    etl_listed: boolean;
    ul_listed: boolean;
  };
}
```

### Sensor Reading Model
```typescript
interface SensorReading {
  id: string;
  facility_id: string;
  sensor_id: string;
  timestamp: string;
  sensor_type: 'temperature' | 'humidity' | 'co2' | 'ppfd' | 'vpd';
  value: number;
  unit: string;
  quality_flags: {
    calibration_status: 'valid' | 'expired' | 'invalid';
    data_quality: 'good' | 'questionable' | 'bad';
    anomaly_detected: boolean;
  };
}
```

### Calculation Result Model
```typescript
interface CalculationResult {
  id: string;
  calculation_type: 'ppfd' | 'dli' | 'heat_load' | 'vpd';
  project_id?: string;
  input_parameters: Record<string, any>;
  results: {
    grid_data?: GridPoint[];
    statistics?: Statistics;
    recommendations?: Recommendation[];
  };
  created_at: string;
  calculation_time_ms: number;
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary service issue |

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "The request contains invalid parameters",
    "details": {
      "field": "target_ppfd",
      "issue": "Value must be between 50 and 2000"
    },
    "request_id": "req_1234567890",
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_API_KEY` | API key is invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | API key lacks required permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests in time window |
| `INVALID_PARAMETERS` | Request parameters are invalid |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `CALCULATION_ERROR` | Error in lighting calculation |
| `SERVICE_UNAVAILABLE` | External service temporarily unavailable |

### Error Handling Best Practices

```javascript
const handleApiError = (error) => {
  switch (error.code) {
    case 'RATE_LIMIT_EXCEEDED':
      // Implement exponential backoff
      return retryWithBackoff(request);
    
    case 'INVALID_API_KEY':
      // Refresh or regenerate API key
      return refreshApiKey();
    
    case 'CALCULATION_ERROR':
      // Validate input parameters
      return validateAndRetry(request);
    
    default:
      // Log error and notify user
      console.error('API Error:', error);
      throw new Error(error.message);
  }
};
```

---

## SDKs & Libraries

### JavaScript/TypeScript SDK

#### Installation
```bash
npm install @vibelux/sdk
```

#### Basic Usage
```typescript
import { VibeluxClient } from '@vibelux/sdk';

const client = new VibeluxClient({
  apiKey: 'vx_live_1234567890abcdef',
  environment: 'production' // or 'sandbox'
});

// List projects
const projects = await client.projects.list({
  limit: 20,
  facility_id: 'fac_0987654321'
});

// Create calculation
const calculation = await client.calculations.ppfd({
  fixtures: [
    {
      id: 'fix_fluence_spydrx_plus',
      position: { x: 5, y: 5, z: 8 },
      power_level: 100
    }
  ],
  calculation_area: {
    length: 10,
    width: 10,
    grid_resolution: 0.5
  }
});
```

### Python SDK

#### Installation
```bash
pip install vibelux-python
```

#### Basic Usage
```python
from vibelux import VibeluxClient

client = VibeluxClient(
    api_key='vx_live_1234567890abcdef',
    environment='production'
)

# List fixtures
fixtures = client.fixtures.list(
    manufacturer='fluence',
    min_efficacy=2.0
)

# Generate yield prediction
prediction = client.ml.predict_yield(
    facility_id='fac_0987654321',
    crop_type='cannabis',
    environmental_data={
        'avg_temperature': 24.5,
        'avg_humidity': 65,
        'avg_ppfd': 650
    }
)
```

### PHP SDK

#### Installation
```bash
composer require vibelux/php-sdk
```

#### Basic Usage
```php
use Vibelux\Client;

$client = new Client([
    'api_key' => 'vx_live_1234567890abcdef',
    'environment' => 'production'
]);

// Create project
$project = $client->projects()->create([
    'name' => 'New Growing Room',
    'facility_id' => 'fac_0987654321',
    'metadata' => [
        'area_sqft' => 2000,
        'crop_type' => 'leafy_greens'
    ]
]);

// Get sensor readings
$readings = $client->sensors()->readings([
    'facility_id' => 'fac_0987654321',
    'start_time' => '2024-01-15T00:00:00Z',
    'end_time' => '2024-01-15T23:59:59Z'
]);
```

---

## Webhooks

### Webhook Configuration

Configure webhooks to receive real-time notifications:

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/vibelux",
  "events": [
    "calculation.completed",
    "sensor.reading.anomaly",
    "project.updated"
  ],
  "secret": "webhook_secret_key_12345"
}
```

### Webhook Events

#### Available Events

| Event | Description |
|-------|-------------|
| `calculation.completed` | PPFD/DLI calculation finished |
| `calculation.failed` | Calculation encountered error |
| `sensor.reading.new` | New sensor data received |
| `sensor.reading.anomaly` | Anomalous reading detected |
| `project.created` | New project created |
| `project.updated` | Project modified |
| `report.generated` | Report generation completed |
| `ml.prediction.completed` | ML prediction finished |

#### Webhook Payload Format

```json
{
  "id": "evt_1234567890",
  "type": "calculation.completed",
  "created": 1640995200,
  "data": {
    "calculation_id": "calc_1234567890",
    "project_id": "proj_0987654321",
    "status": "completed",
    "results": {
      "avg_ppfd": 425.8,
      "uniformity_ratio": 0.74
    }
  }
}
```

### Webhook Security

#### Signature Verification

```javascript
const crypto = require('crypto');

const verifyWebhook = (payload, signature, secret) => {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(computedSignature, 'hex')
  );
};

// Express.js example
app.post('/webhooks/vibelux', (req, res) => {
  const signature = req.headers['x-vibelux-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }
  
  // Process webhook event
  handleWebhookEvent(req.body);
  res.status(200).send('OK');
});
```

---

## Best Practices

### API Usage Guidelines

#### 1. Authentication Security
- Store API keys securely (environment variables, not code)
- Regenerate keys regularly (quarterly recommended)
- Use scoped keys with minimal required permissions
- Monitor API key usage for anomalies

#### 2. Rate Limiting
- Implement exponential backoff for rate limit errors
- Cache frequently accessed data locally
- Use webhooks instead of polling for real-time updates
- Batch requests when possible

#### 3. Error Handling
- Always check HTTP status codes
- Implement retry logic for transient errors
- Log errors with request IDs for debugging
- Provide meaningful error messages to end users

#### 4. Data Optimization
- Use pagination for large datasets
- Request only required fields when available
- Implement local caching for static data
- Compress large payloads when possible

### Integration Patterns

#### 1. Sensor Data Integration
```javascript
// Efficient sensor data submission
const submitSensorBatch = async (readings) => {
  const batchSize = 100;
  const batches = chunk(readings, batchSize);
  
  const results = await Promise.allSettled(
    batches.map(batch => 
      client.sensors.submitReadings({ readings: batch })
    )
  );
  
  const failed = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);
  
  if (failed.length > 0) {
    console.error('Failed batches:', failed);
    // Implement retry logic
  }
};
```

#### 2. Calculation Pipeline
```javascript
// Efficient calculation workflow
const runLightingAnalysis = async (projectId) => {
  try {
    // Start calculation
    const calculation = await client.calculations.ppfd({
      project_id: projectId,
      // ... parameters
    });
    
    // Poll for completion or use webhook
    const result = await pollForCompletion(calculation.id);
    
    // Generate report
    const report = await client.reports.generate({
      template: 'photometric_analysis',
      calculation_id: calculation.id
    });
    
    return { calculation: result, report };
  } catch (error) {
    handleCalculationError(error);
  }
};
```

#### 3. Real-time Data Processing
```javascript
// WebSocket connection for real-time data
const connectRealtime = () => {
  const ws = new WebSocket('wss://api.vibelux.com/v1/realtime');
  
  ws.on('message', (data) => {
    const event = JSON.parse(data);
    
    switch (event.type) {
      case 'sensor.reading':
        updateDashboard(event.data);
        break;
      case 'calculation.progress':
        updateProgressBar(event.data.progress);
        break;
      case 'alert.triggered':
        showAlert(event.data);
        break;
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    // Implement reconnection logic
    setTimeout(connectRealtime, 5000);
  });
};
```

### Performance Optimization

#### 1. Caching Strategy
```javascript
// Implement intelligent caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = async (key, fetchFunction) => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Usage
const fixtures = await getCachedData(
  'fixtures_fluence',
  () => client.fixtures.list({ manufacturer: 'fluence' })
);
```

#### 2. Parallel Processing
```javascript
// Process multiple calculations concurrently
const runMultipleCalculations = async (configurations) => {
  const calculations = await Promise.allSettled(
    configurations.map(config => 
      client.calculations.ppfd(config)
    )
  );
  
  const successful = calculations
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
  
  const failed = calculations
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);
  
  return { successful, failed };
};
```

### Testing

#### Unit Testing Example
```javascript
// Jest testing example
const { VibeluxClient } = require('@vibelux/sdk');

describe('Vibelux API Integration', () => {
  let client;
  
  beforeEach(() => {
    client = new VibeluxClient({
      apiKey: 'test_key',
      environment: 'sandbox'
    });
  });
  
  test('should calculate PPFD correctly', async () => {
    const result = await client.calculations.ppfd({
      fixtures: [
        {
          id: 'test_fixture',
          position: { x: 5, y: 5, z: 8 },
          power_level: 100
        }
      ],
      calculation_area: {
        length: 10,
        width: 10,
        grid_resolution: 1.0
      }
    });
    
    expect(result.results.statistics.avg_ppfd).toBeGreaterThan(0);
    expect(result.results.statistics.uniformity_ratio).toBeLessThanOrEqual(1);
  });
});
```

---

*Last Updated: December 2024*
*API Version: v1*

For technical support or questions about the API, contact: api-support@vibelux.com
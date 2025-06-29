# Weather-Normalized Energy Savings Calculation

## Overview
Weather normalization is critical for accurate energy savings calculations in controlled environment agriculture (CEA). Without it, you might incorrectly attribute weather-related energy changes to your efficiency improvements.

## Why Weather Normalization Matters

### The Problem
- A cold winter requires more heating → higher energy use
- A hot summer requires more cooling → higher energy use
- Comparing January to July usage directly would be meaningless
- Year-over-year weather variations can mask real savings

### The Solution
Weather normalization adjusts energy consumption data to account for weather variations, allowing true "apples-to-apples" comparisons.

## How VibeLux Calculates Weather-Normalized Savings

### 1. Data Collection

#### Weather Data Sources
- **NOAA Weather Stations**: Historical temperature, humidity, solar radiation
- **Degree Days**: Heating Degree Days (HDD) and Cooling Degree Days (CDD)
- **Location-Specific**: Based on facility ZIP code
- **Hourly Resolution**: For precise calculations

#### Energy Data Sources
- **Utility Bills**: Monthly kWh consumption
- **IoT Sensors**: Real-time power monitoring
- **Sub-Metering**: Zone-specific consumption

### 2. Baseline Establishment

```typescript
// Baseline Calculation Process
interface BaselineData {
  period: DateRange;
  energyConsumption: number; // kWh
  weatherData: {
    avgTemperature: number;
    hdd: number; // Heating Degree Days
    cdd: number; // Cooling Degree Days
    humidity: number;
    solarRadiation: number;
  };
  productionData: {
    sqft: number;
    cropType: string;
    yieldWeight: number;
  };
}
```

#### Baseline Period Selection
- **Minimum**: 12 months of historical data
- **Preferred**: 24-36 months for seasonal variations
- **Pre-Upgrade**: Data before efficiency improvements

#### Regression Analysis
VibeLux uses multiple regression to establish the relationship between energy use and weather:

```
Energy (kWh) = β₀ + β₁(HDD) + β₂(CDD) + β₃(Production) + ε

Where:
- β₀ = Base load (lighting, equipment)
- β₁ = Heating sensitivity coefficient
- β₂ = Cooling sensitivity coefficient
- β₃ = Production intensity coefficient
- ε = Error term
```

### 3. Weather Normalization Process

#### Step 1: Calculate Degree Days
```typescript
// Heating Degree Days (HDD)
const calculateHDD = (dailyAvgTemp: number, baseTemp: number = 65) => {
  return Math.max(0, baseTemp - dailyAvgTemp);
};

// Cooling Degree Days (CDD)
const calculateCDD = (dailyAvgTemp: number, baseTemp: number = 65) => {
  return Math.max(0, dailyAvgTemp - baseTemp);
};
```

#### Step 2: Apply Regression Model
```typescript
const normalizedConsumption = (
  actualConsumption: number,
  currentWeather: WeatherData,
  baselineWeather: WeatherData,
  regressionCoefficients: Coefficients
) => {
  // Weather adjustment factor
  const hddAdjustment = (baselineWeather.hdd - currentWeather.hdd) * coefficients.heating;
  const cddAdjustment = (baselineWeather.cdd - currentWeather.cdd) * coefficients.cooling;
  
  // Normalized consumption
  return actualConsumption + hddAdjustment + cddAdjustment;
};
```

#### Step 3: Calculate Savings
```typescript
const weatherNormalizedSavings = {
  baseline: normalizedBaselineConsumption,
  actual: normalizedActualConsumption,
  savings: normalizedBaselineConsumption - normalizedActualConsumption,
  savingsPercent: ((normalizedBaselineConsumption - normalizedActualConsumption) / normalizedBaselineConsumption) * 100
};
```

### 4. Advanced Adjustments

#### Humidity Impact (CEA-Specific)
Controlled environment agriculture is particularly sensitive to humidity:

```typescript
const humidityAdjustment = (currentRH: number, baselineRH: number) => {
  // Dehumidification load increases exponentially
  const dehumidFactor = 0.015; // kWh per % RH difference
  return (currentRH - baselineRH) * dehumidFactor * facilityVolume;
};
```

#### Solar Radiation (Greenhouse-Specific)
For greenhouses with supplemental lighting:

```typescript
const solarAdjustment = (solarRadiation: number) => {
  // Less solar = more supplemental lighting needed
  const lightingThreshold = 400; // W/m² DLI target
  const supplementalNeed = Math.max(0, lightingThreshold - solarRadiation);
  return supplementalNeed * greenhouseArea * lightingEfficiency;
};
```

### 5. Verification Against Baseline

#### Multi-Point Verification
1. **Utility Bill Verification**: Compare calculated savings against actual utility bills
2. **IoT Sensor Verification**: Real-time data validates calculations
3. **Statistical Confidence**: R² value must exceed 0.75 for valid model

#### Uncertainty Analysis
```typescript
const confidenceInterval = {
  savings: calculatedSavings,
  uncertainty: standardError * 1.96, // 95% confidence
  lowerBound: calculatedSavings - (standardError * 1.96),
  upperBound: calculatedSavings + (standardError * 1.96)
};
```

## Real-World Example

### Scenario: Cannabis Cultivation Facility
- **Location**: Sacramento, CA
- **Size**: 10,000 sq ft
- **Baseline Period**: Jan 2023 - Dec 2023
- **Improvement**: LED upgrade + HVAC optimization (Jan 2024)

#### Baseline Analysis
```
Monthly Average (2023):
- Energy Use: 125,000 kWh
- HDD: 150 (winter average)
- CDD: 250 (summer average)
- Production: 500 lbs/month
```

#### Regression Results
```
Energy = 80,000 + 150(HDD) + 200(CDD) + 50(Production)
R² = 0.87 (strong correlation)
```

#### February 2024 Analysis
```
Actual Consumption: 95,000 kWh
Weather: Unusually warm (HDD: 100, CDD: 0)

Without Weather Normalization:
Savings = 125,000 - 95,000 = 30,000 kWh (24%)

With Weather Normalization:
- Expected consumption (warm February): 115,000 kWh
- Weather-normalized savings: 20,000 kWh (16%)
- Weather impact: 10,000 kWh
```

## IPMVP Compliance

VibeLux follows the International Performance Measurement and Verification Protocol (IPMVP):

### Option C - Whole Facility
- Measures total facility energy use
- Continuous measurements throughout reporting period
- Regression analysis for weather adjustments
- Suitable for comprehensive retrofits

### Key Requirements Met
1. **Measurement Boundary**: Entire facility
2. **Baseline Period**: Minimum 12 months
3. **Variables**: Weather, production, occupancy
4. **Accuracy**: ±10% at 90% confidence level

## Benefits of Weather Normalization

### For Growers
- **Fair Comparisons**: Compare any month to any other month
- **Accurate ROI**: True savings from investments
- **Performance Tracking**: Separate weather from operational changes

### For Investors
- **Risk Mitigation**: Weather variations don't affect returns
- **Predictable Income**: Normalized savings = stable revenue share
- **Verification**: Third-party verifiable methodology

### For Disputes
- **Objective Data**: Remove weather as a dispute factor
- **Clear Documentation**: Regression models provide transparency
- **Industry Standard**: IPMVP compliance ensures acceptability

## Technical Implementation

### Database Schema
```sql
-- Weather data storage
CREATE TABLE weather_data (
  id UUID PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id),
  date DATE,
  avg_temperature DECIMAL,
  min_temperature DECIMAL,
  max_temperature DECIMAL,
  hdd DECIMAL,
  cdd DECIMAL,
  humidity DECIMAL,
  solar_radiation DECIMAL,
  created_at TIMESTAMP
);

-- Regression models
CREATE TABLE baseline_models (
  id UUID PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id),
  model_type VARCHAR(50), -- 'energy_weather'
  coefficients JSONB, -- {intercept, hdd_coef, cdd_coef, etc}
  r_squared DECIMAL,
  standard_error DECIMAL,
  valid_from DATE,
  valid_to DATE
);
```

### API Integration
```typescript
// Weather data fetching
const fetchWeatherData = async (location: Coordinates, date: Date) => {
  const noaaResponse = await fetch(`https://api.weather.gov/points/${location.lat},${location.lon}`);
  const weatherData = await noaaResponse.json();
  
  return {
    temperature: weatherData.properties.temperature.value,
    humidity: weatherData.properties.relativeHumidity.value,
    // Calculate degree days
    hdd: calculateHDD(weatherData.properties.temperature.value),
    cdd: calculateCDD(weatherData.properties.temperature.value)
  };
};
```

## Continuous Improvement

### Machine Learning Enhancement
VibeLux continuously improves its models using ML:

1. **Pattern Recognition**: Identify non-linear relationships
2. **Anomaly Detection**: Flag unusual consumption patterns
3. **Predictive Modeling**: Forecast future consumption
4. **Adaptive Baselines**: Update models as facilities change

### Future Enhancements
- **Real-time weather integration**: Minute-by-minute adjustments
- **Crop-specific models**: Different crops have different sensitivities
- **Multi-facility benchmarking**: Compare normalized performance
- **Climate change adaptation**: Adjust baselines for changing weather patterns

## Conclusion

Weather normalization ensures that energy savings calculations reflect true operational improvements rather than weather variations. This creates a fair, transparent, and verifiable system for all parties involved in the revenue-sharing model.
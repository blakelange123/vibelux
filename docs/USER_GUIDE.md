# Vibelux User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Lighting Design](#lighting-design)
4. [Calculators & Tools](#calculators--tools)
5. [Plant Management](#plant-management)
6. [Statistical Analysis](#statistical-analysis)
7. [IoT & Sensors](#iot--sensors)
8. [Reports & Analytics](#reports--analytics)
9. [Marketplace](#marketplace)
10. [Settings & Preferences](#settings--preferences)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Account Setup

1. **Sign Up**
   - Visit [vibelux.com](https://vibelux.com)
   - Click "Get Started Free"
   - Choose your authentication method (email, Google, GitHub)
   - Complete profile setup

2. **Subscription Selection**
   - **Free Explorer**: Basic calculations, 1 project, 50 fixtures
   - **Hobbyist ($9/mo)**: Advanced DLI calc, 5 projects, 500 DLC fixtures
   - **Professional ($79/mo)**: AI Assistant, 3D visualization, team sharing
   - **Enterprise ($299/mo)**: ML predictions, IoT integration, unlimited API

3. **First Project Creation**
   - Navigate to Dashboard
   - Click "New Project"
   - Enter project name and description
   - Select facility type (greenhouse, indoor farm, research lab)

### Dashboard Overview

Your dashboard provides access to all Vibelux features:

#### Quick Stats Panel
- **Active Projects**: Currently working projects
- **Energy Savings**: Month-over-month improvements
- **Yield Predictions**: ML-powered forecasts
- **System Health**: Sensor and equipment status

#### Navigation Menu
- **Design**: Lighting layout and optimization tools
- **Calculators**: PPFD, DLI, VPD, heat load calculations
- **Analytics**: Performance tracking and insights
- **Fixtures**: LED product database and specifications
- **Marketplace**: Buy/sell produce and equipment
- **Settings**: Account and facility management

---

## Lighting Design

### Basic Designer

**Purpose**: Create 2D lighting layouts with PPFD calculations

1. **Room Setup**
   ```
   Navigate to: Design > Basic Designer
   ```
   - Enter room dimensions (length × width × height)
   - Set mounting height for fixtures
   - Choose units (metric/imperial)

2. **Fixture Selection**
   - Browse DLC-certified LED fixtures (2,400+ options)
   - Filter by:
     - Manufacturer (Fluence, Philips, OSRAM, etc.)
     - Wattage range
     - Efficacy (μmol/J)
     - Price range
   - View detailed specifications and IES files

3. **Layout Creation**
   - Drag fixtures onto canvas
   - Use grid snap for precise positioning
   - Adjust fixture spacing and orientation
   - Set dimming levels (0-100%)

4. **Analysis Tools**
   - **PPFD Heatmap**: Visual light distribution
   - **Uniformity Ratio**: CV calculation (target: <10%)
   - **DLI Maps**: Daily light integral distribution
   - **Energy Analysis**: Power consumption and efficiency

### Advanced Designer

**Purpose**: 3D visualization with advanced optimization

1. **3D Room Modeling**
   ```
   Navigate to: Design > Advanced Designer
   ```
   - Import CAD files or create 3D geometry
   - Add obstacles (HVAC, walkways, structures)
   - Define plant canopy zones
   - Set environmental parameters

2. **Multi-Tier Systems**
   - Configure vertical farming racks
   - Set tier spacing and dimensions
   - Calculate inter-tier light interference
   - Optimize for maximum production density

3. **Spectrum Optimization**
   - Select target crops from 150+ profiles
   - Adjust growth stage requirements
   - Fine-tune spectral ratios (R:FR, B:R ratios)
   - Apply research-backed recommendations

4. **Advanced Features**
   - **Ray Tracing**: Photorealistic light simulation
   - **Shadow Analysis**: Identify dark zones
   - **Thermal Modeling**: Heat generation mapping
   - **Cost Optimization**: ROI and payback analysis

### AI Design Assistant

**Purpose**: Automated design generation and optimization

1. **Natural Language Input**
   ```
   Example: "Design a 1000 sq ft cannabis flowering room with 
   target PPFD of 800 μmol/m²/s using Fluence fixtures"
   ```

2. **AI Recommendations**
   - Fixture selection based on requirements
   - Optimal spacing and layout suggestions
   - Energy efficiency improvements
   - Cost optimization recommendations

3. **Iterative Refinement**
   - Request design modifications
   - Compare multiple layout options
   - Validate against regulations and standards
   - Export final designs

---

## Calculators & Tools

### PPFD Calculator

**Purpose**: Calculate photosynthetic photon flux density

1. **Input Parameters**
   - Fixture specifications (power, efficacy, beam angle)
   - Mounting height and spacing
   - Target area dimensions

2. **Calculation Methods**
   - **Point-by-Point**: Precise grid calculations
   - **Zone Average**: Area-weighted averages
   - **Inverse Square**: Distance-based calculations

3. **Results Interpretation**
   - **Target PPFD Ranges**:
     - Propagation: 100-200 μmol/m²/s
     - Vegetative: 200-400 μmol/m²/s
     - Flowering: 400-800 μmol/m²/s
     - High-light crops: 800-1200 μmol/m²/s

### DLI Optimizer

**Purpose**: Calculate Daily Light Integral requirements

1. **Crop-Specific DLI Targets**
   ```
   Access: Calculators > DLI Calculator
   ```
   - **Leafy Greens**: 12-17 mol/m²/day
   - **Herbs**: 14-20 mol/m²/day
   - **Fruiting Crops**: 20-30 mol/m²/day
   - **Cannabis**: 35-65 mol/m²/day

2. **Photoperiod Optimization**
   - Calculate required PPFD for target DLI
   - Optimize for energy costs (time-of-use rates)
   - Balance efficiency vs. fixture costs

3. **Seasonal Adjustments**
   - Supplement natural sunlight
   - Account for changing day lengths
   - Optimize for year-round production

### VPD Calculator

**Purpose**: Vapor Pressure Deficit optimization

1. **Environmental Inputs**
   - Air temperature (°C/°F)
   - Relative humidity (%)
   - Leaf temperature differential

2. **VPD Calculation**
   ```
   Formula: VPD = SVP(air) - SVP(leaf) × RH/100
   ```

3. **Crop-Specific Ranges**
   - **Propagation**: 0.4-0.8 kPa
   - **Vegetative**: 0.8-1.2 kPa
   - **Flowering**: 1.0-1.5 kPa

### Heat Load Calculator

**Purpose**: HVAC sizing and thermal management

1. **Heat Sources**
   - LED fixture heat generation
   - Environmental loads (solar, occupancy)
   - Equipment heat (pumps, fans)
   - Plant transpiration (cooling effect)

2. **Calculations**
   - Sensible heat load (BTU/hr)
   - Latent heat load (moisture removal)
   - Peak demand sizing
   - Energy consumption estimates

3. **HVAC Recommendations**
   - Equipment sizing guidelines
   - Efficiency ratings (SEER/EER)
   - Integration with lighting controls

---

## Plant Management

### Crop Profiles

**Purpose**: Optimize growing conditions for specific crops

1. **Pre-built Profiles** (150+ crops available)
   ```
   Navigate to: Plant Management > Crop Profiles
   ```
   - Cannabis strains (Indica, Sativa, Hybrid)
   - Leafy greens (lettuce, spinach, kale)
   - Herbs (basil, cilantro, parsley)
   - Fruiting crops (tomatoes, peppers, strawberries)
   - Microgreens (25+ varieties)

2. **Growth Stage Management**
   - **Germination**: Temperature, humidity, minimal light
   - **Seedling**: Low PPFD, controlled environment
   - **Vegetative**: Increased light, nutrient uptake
   - **Flowering/Fruiting**: Peak light, environmental stress

3. **Environmental Setpoints**
   - Temperature ranges (day/night)
   - Humidity levels (VPD targets)
   - CO₂ concentrations
   - Photoperiod schedules

### Plant Health Monitoring

1. **Visual Assessment Tools**
   - Deficiency identification guides
   - Pest identification database
   - Disease symptom analysis

2. **Biometric Tracking**
   - Plant height measurements
   - Leaf area index (LAI)
   - Biomass accumulation
   - Yield predictions

3. **AI-Powered Diagnosis**
   - Upload plant photos for analysis
   - Automated deficiency detection
   - Treatment recommendations
   - Progress tracking

---

## Statistical Analysis

### Experimental Design

**Purpose**: Design scientifically rigorous growing trials

1. **Trial Setup Wizard**
   ```
   Navigate to: Analytics > Statistical Trials
   ```
   - Define research question
   - Select experimental design type:
     - **Completely Randomized Design (CRD)**
     - **Randomized Complete Block Design (RCBD)**
     - **Factorial Design**
     - **Split-plot Design**

2. **Treatment Configuration**
   - Define factors and levels
   - Set replication requirements
   - Configure blocking strategies
   - Calculate required sample sizes

3. **Randomization**
   - Automatic treatment randomization
   - Block randomization for controlled variables
   - Stratified sampling for population studies

### Data Collection

1. **Measurement Protocols**
   - Standardized data collection forms
   - Mobile-friendly data entry
   - Photo documentation integration
   - Timestamp automation

2. **Quality Control**
   - Data validation rules
   - Outlier detection
   - Missing data handling
   - Measurement uncertainty quantification

### Statistical Analysis

1. **ANOVA (Analysis of Variance)**
   - One-way ANOVA for single factor studies
   - Two-way ANOVA for factorial designs
   - Repeated measures ANOVA for time series
   - Mixed-effects models for complex designs

2. **Post-hoc Testing**
   - Tukey's HSD test
   - Bonferroni correction
   - Duncan's multiple range test
   - Dunnett's test for control comparisons

3. **Results Interpretation**
   - Statistical significance testing (p-values)
   - Effect size calculations (Cohen's d, η²)
   - Confidence intervals
   - Power analysis

### Report Generation

1. **Publication-Ready Reports**
   - APA-style statistical reporting
   - Professional graphs and charts
   - Methods section generation
   - Results tables with annotations

2. **Export Formats**
   - PDF reports with embedded charts
   - Excel files with raw data
   - R/SAS code generation
   - LaTeX format for publications

---

## IoT & Sensors

### Sensor Integration

**Purpose**: Real-time environmental monitoring

1. **Supported Sensor Types**
   ```
   Access: IoT > Sensor Dashboard
   ```
   - **Environmental**: Temperature, humidity, CO₂, light
   - **Plant Monitoring**: Stem diameter, leaf temperature
   - **Substrate**: pH, EC, moisture, temperature
   - **Energy**: Power consumption, demand monitoring

2. **Auto-Discovery Setup**
   - Connect sensors to network
   - Run auto-discovery scan
   - Configure sensor parameters
   - Set calibration schedules

3. **Data Collection**
   - Real-time streaming data
   - Configurable sampling rates
   - Data validation and filtering
   - Historical data storage

### Alerts & Automation

1. **Threshold Alerts**
   - Set min/max limits for parameters
   - Configure alert recipients
   - Choose notification methods (email, SMS, app)
   - Set alert priority levels

2. **Automation Rules**
   - **If-Then Logic**: "If temperature > 28°C, then increase ventilation"
   - **Time-based**: Scheduled lighting and irrigation
   - **Conditional**: Multi-parameter decision making
   - **Safety Overrides**: Emergency shutdown conditions

### Data Analytics

1. **Trend Analysis**
   - Historical trend visualization
   - Correlation analysis between parameters
   - Seasonal pattern recognition
   - Anomaly detection

2. **Performance Metrics**
   - Environmental stability scoring
   - Energy efficiency tracking
   - Yield correlation analysis
   - Equipment performance monitoring

---

## Reports & Analytics

### Standard Reports

1. **Photometric Reports**
   ```
   Navigate to: Reports > Lighting Analysis
   ```
   - **16-Section Professional Report**:
     - Executive summary
     - Project specifications
     - Calculation methodology
     - Fixture schedule
     - PPFD distribution maps
     - Uniformity analysis
     - Energy consumption
     - ROI analysis
     - Compliance verification
     - Recommendations
     - Appendices

2. **Environmental Reports**
   - Daily environmental summaries
   - Weekly trend analysis
   - Monthly performance reviews
   - Annual energy assessments

3. **Yield Analysis Reports**
   - Harvest tracking and documentation
   - Yield per square foot calculations
   - Quality metrics assessment
   - Comparative analysis vs. targets

### Custom Report Builder

1. **Template Selection**
   - Choose from 25+ professional templates
   - Customize branding and logos
   - Select report sections
   - Configure data sources

2. **Data Visualization**
   - Interactive charts and graphs
   - PPFD heatmaps and contour plots
   - Trend lines and regression analysis
   - Comparative bar charts

3. **Export Options**
   - PDF with vector graphics
   - Excel with raw data tables
   - PowerPoint presentation format
   - Web-based interactive reports

### Business Intelligence

1. **KPI Dashboards**
   - Real-time facility performance
   - Energy efficiency trends
   - Production metrics
   - Financial performance

2. **Predictive Analytics**
   - ML-powered yield forecasting
   - Equipment maintenance predictions
   - Energy optimization recommendations
   - Market price predictions

---

## Marketplace

### Produce Trading

**Purpose**: Connect growers with buyers for fresh produce

1. **Seller Dashboard**
   ```
   Navigate to: Marketplace > Sell Produce
   ```
   - List available products with photos
   - Set competitive pricing
   - Manage inventory levels
   - Track order fulfillment

2. **Buyer Interface**
   - Browse verified grower listings
   - Filter by location, price, quality metrics
   - Place orders with delivery scheduling
   - Rate and review growers

3. **Quality Assurance**
   - IoT-verified growing conditions
   - Third-party quality certifications
   - Photo documentation requirements
   - Customer feedback systems

### Equipment Exchange

1. **New Equipment Sales**
   - Browse LED fixtures and growing equipment
   - Compare specifications and pricing
   - Read reviews and ratings
   - Direct manufacturer connections

2. **Used Equipment Marketplace**
   - List surplus equipment for sale
   - Certified refurbishment programs
   - Warranty and support options
   - Trade-in value assessments

---

## Settings & Preferences

### Account Management

1. **Profile Settings**
   ```
   Navigate to: Settings > Profile
   ```
   - Update personal information
   - Change password/authentication
   - Set communication preferences
   - Configure privacy settings

2. **Subscription Management**
   - View current plan and usage
   - Upgrade/downgrade subscription
   - Manage billing information
   - Download invoices and receipts

### Facility Configuration

1. **Multi-Facility Management**
   - Add new growing facilities
   - Configure facility-specific settings
   - Assign user roles and permissions
   - Set environmental defaults

2. **Team Management**
   - Invite team members
   - Assign roles (Admin, Manager, Operator, Viewer)
   - Set access permissions
   - Track user activity

### Integration Settings

1. **API Configuration**
   - Generate API keys
   - Configure webhooks
   - Set rate limits
   - Monitor API usage

2. **Third-Party Integrations**
   - Connect to climate control systems
   - Integrate with ERP software
   - Link financial systems
   - Configure sensor networks

---

## Troubleshooting

### Common Issues

#### Login Problems
- **Can't remember password**: Use "Forgot Password" link
- **Account locked**: Contact support after 5 failed attempts
- **SSO issues**: Verify organization domain settings

#### Design Tool Issues
- **Slow 3D rendering**: Enable hardware acceleration in browser
- **Missing fixtures**: Check DLC database updates
- **Calculation errors**: Verify input units and parameters

#### Sensor Connectivity
- **Offline sensors**: Check network connectivity and power
- **Inaccurate readings**: Perform sensor calibration
- **Missing data**: Verify data transmission intervals

### Performance Optimization

1. **Browser Requirements**
   - Chrome 90+ (recommended)
   - Firefox 88+
   - Safari 14+
   - Edge 90+

2. **Hardware Recommendations**
   - RAM: 8GB minimum, 16GB recommended
   - Graphics: WebGL 2.0 compatible GPU
   - Network: Stable broadband connection

### Support Resources

1. **Help Center**
   - Video tutorials and walkthroughs
   - FAQ database
   - Community forums
   - Best practices guides

2. **Contact Support**
   - **Email**: support@vibelux.com
   - **Phone**: 1-800-VIBELUX
   - **Live Chat**: Available 8 AM - 6 PM PST
   - **Emergency**: 24/7 for Enterprise customers

3. **Training Resources**
   - **Webinar Schedule**: Weekly feature demonstrations
   - **Certification Program**: Professional grower certification
   - **Custom Training**: On-site training for Enterprise customers

---

## Appendix

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Project | Ctrl/Cmd + N |
| Save Project | Ctrl/Cmd + S |
| Copy Fixture | Ctrl/Cmd + C |
| Paste Fixture | Ctrl/Cmd + V |
| Undo | Ctrl/Cmd + Z |
| Redo | Ctrl/Cmd + Y |
| Zoom In | Ctrl/Cmd + + |
| Zoom Out | Ctrl/Cmd + - |
| Fit to Screen | Ctrl/Cmd + 0 |

### Units & Conversions

#### Light Measurements
- **PPFD**: μmol/m²/s (micromoles per square meter per second)
- **DLI**: mol/m²/day (moles per square meter per day)
- **Conversion**: DLI = PPFD × hours × 0.0036

#### Environmental Units
- **Temperature**: °C (Celsius) or °F (Fahrenheit)
- **Humidity**: %RH (Relative Humidity percentage)
- **VPD**: kPa (kilopascals)
- **CO₂**: ppm (parts per million)

#### Energy Units
- **Power**: W (watts), kW (kilowatts)
- **Energy**: kWh (kilowatt-hours)
- **Efficacy**: μmol/J (micromoles per joule)

---

*Last Updated: December 2024*
*Version: 2.1*

For the most current information and feature updates, visit [docs.vibelux.com](https://docs.vibelux.com)
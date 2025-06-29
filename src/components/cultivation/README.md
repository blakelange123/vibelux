# Vibelux Industrial Operations Components

## Overview
This directory contains industrial-grade cultivation control components inspired by professional systems like AeroFarms. These components provide real-time monitoring and control capabilities for commercial cultivation facilities.

## Components

### 1. RecipeControlSystem.tsx
**Purpose**: Day-by-day grow recipe management with setpoint control
**Key Features**:
- Visual graph showing pH, EC, Temperature, Humidity, and CO2 targets across grow cycles
- Interactive day-by-day parameter adjustment with up/down arrows
- Multi-parameter visualization with real-time editing
- A/B dosing percentage controls
- Recipe import/export functionality
- Professional data visualization with area charts

### 2. MultiLevelRackControl.tsx
**Purpose**: Individual control for multi-tier growing systems
**Key Features**:
- Independent control for each rack level (L05A, L04A, etc.)
- Valve control modes: OFF/AUTO/HAND
- Cycle timing configuration (short cycle, end time, dry start)
- Real-time status monitoring per level
- System-wide metrics aggregation
- Visual status indicators with color coding

### 3. IrrigationControlPanel.tsx
**Purpose**: Comprehensive irrigation system monitoring and control
**Key Features**:
- Dual tank management (A/B) with visual fill levels
- Real-time flow rate and pressure monitoring
- pH/EC monitoring per tank
- Auto-refill configuration with limits
- E-stop functionality
- Drain and refill controls
- GPM flow visualization
- Manual/Auto refill modes

### 4. HVACSystemDashboard.tsx
**Purpose**: Climate control and environmental management
**Key Features**:
- Individual HVAC unit monitoring and control
- Real-time temperature/humidity tracking
- Chiller system management
- CO2 injection control (24hr/lights_on/manual modes)
- Fan speed and compressor status
- Power consumption tracking
- 24-hour climate trend visualization
- Multi-zone monitoring

## Integration with Operations Center

The Operations Center (`/operations`) provides a unified interface combining all these components:

### Dashboard Features:
- **System Overview**: Real-time status of all subsystems
- **Zone Monitoring**: 8-zone environmental tracking
- **Key Metrics**: DLI, water efficiency, VPD, energy usage
- **Alarm Management**: Centralized alert system
- **Tab Navigation**: Easy switching between control interfaces

## Design Principles

### 1. **Industrial UI Design**
- Dark theme optimized for 24/7 monitoring
- High contrast for critical information
- Status-based color coding (green/yellow/red)
- Compact information density

### 2. **Real-time Updates**
- Simulated data streams with realistic variations
- Visual feedback for system states
- Animated indicators for active processes

### 3. **Professional Controls**
- Mode selection buttons (OFF/AUTO/HAND)
- Precise numerical inputs
- Visual gauges and progress indicators
- Hierarchical information organization

## Key Learnings from AeroFarms Interface

### 1. **Information Hierarchy**
- Critical metrics prominently displayed
- Secondary information in collapsible sections
- Color coding for quick status assessment

### 2. **Control Paradigms**
- Three-state controls (OFF/AUTO/MANUAL)
- Enable/disable toggles separate from mode selection
- Grouped controls for related functions

### 3. **Data Visualization**
- Line graphs for trends over time
- Numerical displays for current values
- Progress bars for capacity/levels
- Status indicators for system health

### 4. **Professional Features**
- Recipe-based growing schedules
- Multi-layer rack management
- Integrated climate control
- Predictive maintenance alerts

## Usage

```tsx
// Import components
import { RecipeControlSystem } from '@/components/cultivation/RecipeControlSystem';
import { MultiLevelRackControl } from '@/components/cultivation/MultiLevelRackControl';
import { IrrigationControlPanel } from '@/components/cultivation/IrrigationControlPanel';
import { HVACSystemDashboard } from '@/components/cultivation/HVACSystemDashboard';

// Use in your application
<RecipeControlSystem />
<MultiLevelRackControl />
<IrrigationControlPanel />
<HVACSystemDashboard />
```

## Future Enhancements

1. **Data Persistence**: Connect to real database for historical data
2. **IoT Integration**: Real sensor data feeds
3. **Alert System**: SMS/email notifications for critical events
4. **Predictive Analytics**: ML-based failure prediction
5. **Mobile Responsiveness**: Tablet-optimized layouts
6. **Export Functionality**: Data export to CSV/Excel
7. **Multi-facility Support**: Manage multiple locations
8. **Compliance Reporting**: Automated regulatory reports

## Technical Stack

- **React/Next.js**: Component framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **Lucide Icons**: Consistent iconography
- **Real-time Simulation**: setInterval-based updates

## Best Practices

1. **Performance**: Use React.memo for heavy components
2. **State Management**: Consider Redux/Zustand for complex state
3. **Error Handling**: Implement try-catch for critical operations
4. **Accessibility**: Add ARIA labels for screen readers
5. **Testing**: Unit tests for control logic
6. **Documentation**: Inline comments for complex calculations
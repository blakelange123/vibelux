# Component Consolidation Plan

## Current State: 687 Components → Target: 400-450 Components

### Phase 1: Dashboard Consolidation (22 → 3 components)
**Impact: -19 components**

#### Create UnifiedDashboard.tsx
```typescript
interface DashboardProps {
  type: 'admin' | 'operations' | 'analytics' | 'financial' | 'sustainability';
  userRole: UserRole;
  facilityId?: string;
}

export function UnifiedDashboard({ type, userRole, facilityId }: DashboardProps) {
  const DashboardComponent = useMemo(() => {
    switch (type) {
      case 'admin': return AdminDashboardContent;
      case 'operations': return OperationsDashboardContent;
      case 'analytics': return AnalyticsDashboardContent;
      case 'financial': return FinancialDashboardContent;
      case 'sustainability': return SustainabilityDashboardContent;
      default: return DefaultDashboardContent;
    }
  }, [type]);

  return (
    <DashboardLayout>
      <DashboardComponent userRole={userRole} facilityId={facilityId} />
    </DashboardLayout>
  );
}
```

#### Consolidate these files:
- AdminAIOperationsDashboard.tsx
- AdminFinancialDashboard.tsx  
- AdminMapDashboard.tsx
- AdminSecurityDashboard.tsx
- AdvancedAnalyticsDashboard.tsx
- AIUsageDashboard.tsx
- AlertDashboard.tsx
- BusinessIntelligenceDashboard.tsx
- ComplianceDashboard.tsx
- CostTrackingDashboard.tsx
- EnergyMonitoringDashboard.tsx
- EquipmentDashboard.tsx
- FinancialDashboard.tsx
- IndustrySpecificDashboard.tsx
- IntegrationsDashboard.tsx
- MarketplaceDashboard.tsx
- OperationsDashboard.tsx
- PerformanceDashboard.tsx
- ReferralDashboard.tsx
- RevenueSharingDashboard.tsx
- SustainabilityDashboard.tsx

### Phase 2: Calculator Consolidation (15 → 2 components)
**Impact: -13 components**

#### Create CalculatorSuite.tsx
```typescript
interface CalculatorSuiteProps {
  category: 'environmental' | 'financial' | 'electrical' | 'photosynthetic';
  defaultCalculator?: string;
}

export function CalculatorSuite({ category, defaultCalculator }: CalculatorSuiteProps) {
  const [activeCalculator, setActiveCalculator] = useState(defaultCalculator);
  
  const calculators = useMemo(() => {
    switch (category) {
      case 'environmental':
        return {
          dli: AdvancedDLICalculator,
          heat: AdvancedHeatLoadCalculator,
          co2: CO2EnrichmentCalculator,
          psychrometric: PsychrometricCalculator,
          transpiration: TranspirationCalculator
        };
      case 'financial':
        return {
          roi: AdvancedROICalculator,
          tco: TCOCalculator,
          energy: EnergyCostCalculator,
          ghg: GHGEmissionsCalculator
        };
      // ... other categories
    }
  }, [category]);

  return (
    <CalculatorLayout>
      <CalculatorTabs 
        calculators={Object.keys(calculators)}
        active={activeCalculator}
        onChange={setActiveCalculator}
      />
      <CalculatorContent>
        {calculators[activeCalculator]}
      </CalculatorContent>
    </CalculatorLayout>
  );
}
```

### Phase 3: Panel System Consolidation (20+ → 5 components)
**Impact: -15+ components**

#### Create ModularPanelSystem.tsx
```typescript
interface PanelSystemProps {
  type: 'design' | 'analysis' | 'control' | 'monitoring';
  availablePanels: string[];
  layout: 'tabs' | 'accordion' | 'grid';
}

export function ModularPanelSystem({ type, availablePanels, layout }: PanelSystemProps) {
  const [activePanels, setActivePanels] = useState<string[]>([]);
  
  const panelComponents = useMemo(() => ({
    // Design panels
    'cfd-analysis': CFDAnalysisPanel,
    'dli-optimizer': DLIOptimizerPanel,
    'spectrum-analysis': SpectrumAnalysisPanel,
    
    // Control panels  
    'led-control': LEDControlPanel,
    'environmental': EnvironmentalControllerPanel,
    'emergency-lighting': EmergencyLightingPanel,
    
    // Analysis panels
    'electrical-estimator': ElectricalEstimatorPanel,
    'monte-carlo': MonteCarloRayTracingPanel,
    
    // Monitoring panels
    'sensor-monitor': RealTimeSensorPanel,
    'plant-health': PlantHealthMonitor
  }), []);

  return (
    <PanelSystemLayout layout={layout}>
      <PanelSelector 
        available={availablePanels}
        active={activePanels}
        onChange={setActivePanels}
      />
      <PanelContainer>
        {activePanels.map(panelId => {
          const PanelComponent = panelComponents[panelId];
          return PanelComponent ? <PanelComponent key={panelId} /> : null;
        })}
      </PanelContainer>
    </PanelSystemLayout>
  );
}
```

### Phase 4: Duplicate Elimination
**Impact: -15 exact duplicates**

#### Remove exact duplicates:
- AdvancedAnalyticsDashboard (duplicate)
- AdvancedDesigner (duplicate) 
- AdvancedPPFDMapping (duplicate)
- AIAssistant (duplicate)
- BIMImportDialog (duplicate)
- CFDAnalysisPanel (duplicate)
- EmergencyLightingPanel (duplicate)
- And 8 others...

### Phase 5: Oversized Component Refactoring
**Target: Components >1500 lines**

#### Break down large components:
1. **SimpleCanvas2D.tsx (2949 lines)**
   - Split into: CanvasCore, CanvasTools, CanvasInteractions
   
2. **CropPlanningSimulator.tsx (2308 lines)**
   - Split into: PlanningCore, SimulationEngine, ResultsDisplay
   
3. **FixtureLibraryDialog.tsx (1876 lines)**
   - Split into: LibraryBrowser, FixtureDetails, SearchFilters

## Expected Results:
- **Before: 687 components**
- **After: 400-450 components** 
- **Reduction: 35-40%**
- **Bundle size reduction: ~20-25%**
- **Maintenance improvement: Significant**
- **Developer experience: Much better**

## Implementation Timeline:
- **Week 1-2**: Dashboard consolidation
- **Week 3**: Calculator consolidation  
- **Week 4**: Panel system consolidation
- **Week 5**: Duplicate elimination
- **Week 6**: Large component refactoring
- **Week 7**: Testing and optimization

## Risk Mitigation:
- Maintain all existing functionality
- Preserve component APIs initially
- Gradual migration with feature flags
- Comprehensive testing at each phase
- Rollback plan for each consolidation
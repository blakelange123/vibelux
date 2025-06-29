# Vibelux App Backup Manifest
Generated: January 6, 2025

## Project Overview
Vibelux is a Next.js 15.3.3 application for horticultural lighting calculations and design tools.

## Key Technologies
- Next.js 15.3.3 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Clerk Authentication
- Canvas-based visualizations
- DLC Fixtures Integration

## Completed Features

### 1. Core Infrastructure
- ✅ React 18 compatibility fixes (hydration issues resolved)
- ✅ Middleware configuration for Next.js 15.3.3
- ✅ Glassmorphic UI design system
- ✅ Dark theme implementation

### 2. AI Assistant System
- ✅ Smart crop-specific responses
- ✅ Credit deduction system based on subscription tiers
- ✅ OpenAI integration
- ✅ Project context awareness

### 3. Calculator Suite
#### Existing Calculators:
- PPFD Calculator
- DLI Calculator
- Coverage Area Calculator
- Wattage Calculator
- PAR Map Viewer
- Energy Cost Calculator
- CO₂ Calculator
- ROI Calculator

#### New Calculators Added:
- **CO₂ Enrichment Calculator** (`/src/components/CO2EnrichmentCalculator.tsx`)
  - Room volume calculations
  - Air exchange considerations
  - Cost analysis
  - Photosynthesis boost calculations
  
- **Coverage Area Calculator** (`/src/components/CoverageAreaCalculator.tsx`)
  - Visual grid layout
  - Fixture spacing optimization
  - Support for different room shapes
  
- **ROI Calculator** (`/src/components/ROICalculator.tsx`)
  - LED upgrade analysis
  - Payback period calculations
  - NPV and annual savings
  - 5-year projections

### 4. PPFD Heat Map Calculator Enhancements
- ✅ DLC fixtures integration with search
- ✅ Asymmetric beam angle support (QB: 150°×135°, SB: 120°)
- ✅ Signify TopLighting Force presets
- ✅ Custom fixture creation
- ✅ Real-time heat map visualization
- ✅ Power metrics and uniformity analysis

### 5. Navigation & Organization
- ✅ Calculator dropdown menu
- ✅ Categorized calculator sections
- ✅ Quick access to all tools

## File Structure

### Key Configuration Files
- `/src/middleware.ts` - Clerk auth middleware
- `/package.json` - Dependencies and scripts
- `/tailwind.config.ts` - Tailwind configuration
- `/tsconfig.json` - TypeScript configuration

### Components
- `/src/components/Navigation.tsx` - Main navigation
- `/src/components/AIAssistant.tsx` - AI chat interface
- `/src/components/CO2EnrichmentCalculator.tsx`
- `/src/components/CoverageAreaCalculator.tsx`
- `/src/components/ROICalculator.tsx`
- `/src/components/PPFDCalculator.tsx`
- `/src/components/DLICalculator.tsx`
- `/src/components/WattageCalculator.tsx`
- `/src/components/MachineLearningPredictions.tsx`

### Pages (App Router)
- `/src/app/page.tsx` - Homepage
- `/src/app/dashboard/page.tsx` - User dashboard
- `/src/app/predictions/page.tsx` - ML predictions
- `/src/app/calculators/page.tsx` - Calculator hub
- `/src/app/calculators/ppfd-map/page.tsx` - PPFD heat map
- `/src/app/calculators/[calculator]/page.tsx` - Individual calculators
- `/src/app/design/page.tsx` - Design studio
- `/src/app/fixtures/page.tsx` - DLC fixtures browser

### API Routes
- `/src/app/api/ai-assistant/route.ts` - AI chat endpoint
- `/src/app/api/fixtures/route.ts` - DLC fixtures data
- `/src/app/api/predictions/route.ts` - ML predictions

### Utilities
- `/src/lib/lighting-calculations.ts` - Core calculation functions
- `/src/lib/fixtures-data.ts` - DLC fixture utilities
- `/src/lib/dlc-fixtures-parser.ts` - CSV parser for DLC data

## Design System

### Colors
- Primary: Purple (#7C3AED)
- Background: Gray-950 (#030712)
- Surface: Gray-900/800 with transparency
- Accent: Blue, Green for metrics

### UI Patterns
- Glassmorphic cards with backdrop-blur
- Dark gradient backgrounds
- Consistent border styling (gray-700/800)
- Hover states with smooth transitions

## Recent Updates Summary

1. **React Hydration Fix**: Downgraded React Three packages for compatibility
2. **Middleware Update**: Async/await pattern for Next.js 15.3.3
3. **Predictions Page**: Complete redesign with glassmorphic UI
4. **Calculator Suite**: Added 3 new calculators with enhanced navigation
5. **PPFD Heat Map**: DLC integration with asymmetric beam support

## Backup Instructions

1. **Code Backup**: 
   ```bash
   git add .
   git commit -m "Backup: Complete calculator suite with DLC integration"
   git push origin main
   ```

2. **Database Backup**: Ensure any Clerk user data is backed up through Clerk dashboard

3. **Environment Variables**: Keep a secure copy of:
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - OPENAI_API_KEY
   - Any other API keys

## Known Issues & Future Considerations

1. **DLC Data**: Currently using CSV file in public directory - consider database migration
2. **Performance**: Heat map calculations could be optimized for larger rooms
3. **Mobile**: Some calculators need responsive design improvements
4. **Testing**: Add unit tests for calculation functions

## Dependencies to Note
Key packages that required specific versions:
- React: 18.3.1 (not 19.x due to compatibility)
- @react-three/fiber: ^8.0.0
- @react-three/drei: ^9.0.0
- Next.js: 15.3.3
- @clerk/nextjs: Latest

## Support Information
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Documentation: https://docs.anthropic.com/en/docs/claude-code
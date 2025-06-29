# Changelog

All notable changes to the Vibelux App project.

## [January 6, 2025] - Major Update

### Added
- **CO₂ Enrichment Calculator**: Comprehensive tool for calculating CO₂ requirements based on room volume, air exchanges, and target levels
- **Coverage Area Calculator**: Visual fixture layout optimization with spacing recommendations
- **ROI Calculator**: LED upgrade analysis with payback period, NPV, and 5-year projections
- **DLC Fixtures Integration**: Full integration with DLC qualified fixtures database
- **Asymmetric Beam Angle Support**: PPFD calculator now supports QB (150°×135°) and SB (120°) beam patterns
- **Signify Fixture Presets**: Quick access to TopLighting Force QB and SB models
- **Calculator Navigation Dropdown**: Easy access to all calculators from main navigation

### Changed
- **PPFD Heat Map Calculator**: Complete rewrite with DLC integration and enhanced UI
- **Predictions Page**: Redesigned with glassmorphic UI matching dashboard theme
- **Calculator Organization**: Categorized into Basic, Financial, Environmental, and Plant Science sections
- **Middleware**: Updated to async/await pattern for Next.js 15.3.3 compatibility

### Fixed
- **React Hydration Issues**: Resolved by downgrading React Three packages to v8/v9
- **Hamburger Menu**: Fixed click handler not working due to hydration mismatch
- **AI Assistant Button**: Fixed non-responsive button issue
- **Middleware Error**: Fixed "Cannot find the middleware module" error
- **Design Studio**: Fixed length dimension input and layout issues

### Technical
- **React Version**: Locked to 18.3.1 for compatibility
- **Next.js**: Using 15.3.3 with App Router
- **Authentication**: Clerk integration with proper middleware configuration
- **Styling**: Consistent glassmorphic design with dark theme

## [Previous Updates]

### AI Assistant Enhancements
- Added crop-specific intelligence
- Implemented credit deduction system
- OpenAI integration with streaming responses
- Project context awareness

### Design System
- Glassmorphic UI components
- Dark gradient backgrounds
- Consistent color scheme (Purple/Blue/Gray)
- Smooth transitions and hover states

### Performance
- Optimized canvas rendering for heat maps
- Efficient DLC fixture search with pagination
- Lazy loading for calculator components
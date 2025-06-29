# Dev Tools Layout Fix

## Problem
When browser developer tools are open, the advanced designer interface was experiencing layout issues where elements would overflow or not display properly due to reduced viewport height.

## Root Cause
The designer was using `h-screen` (height: 100vh) which doesn't account for the dynamic viewport changes when dev tools are opened/closed. When dev tools open, the available viewport height is reduced but the layout was still trying to use the full original viewport height.

## Solution Implemented

### 1. CSS Viewport Fixes
- Added CSS custom properties `--vh` and `--real-vh` for dynamic viewport height
- Created responsive utility classes:
  - `.h-screen-safe` - Safe height with fallback
  - `.designer-container` - Specialized container for designer layout
  - Media queries for dev tools scenarios (< 700px height)

### 2. JavaScript Viewport Handler
Created `/src/lib/viewport-utils.ts` with:
- `initViewportHandler()` - Dynamically updates viewport properties
- Dev tools detection based on viewport dimensions
- Automatic CSS class application for responsive behavior
- Resize and orientation change listeners

### 3. Component Updates
- **AdvancedDesigner.tsx**: Updated to use `h-screen-safe designer-container` classes
- **LayoutWrapper.tsx**: Integrated viewport handler initialization
- **globals.css**: Added comprehensive CSS fixes for various viewport scenarios

### 4. Responsive Behavior
- **Normal viewport**: Standard full-height layout
- **Dev tools open** (< 700px height): 
  - Adjusts layout to available space
  - Tool palette repositions to absolute positioning
  - Sidebar becomes collapsible on narrow viewports
- **Mobile**: Sidebar becomes overlay with slide-in animation

## Key Features
- **Automatic Detection**: Detects when dev tools are likely open
- **Dynamic Adjustment**: Updates layout in real-time as viewport changes
- **Cross-Browser Support**: Uses CSS custom properties with fallbacks
- **Mobile Responsive**: Handles orientation changes and mobile viewports
- **Performance Optimized**: Throttled resize events and efficient DOM updates

## Files Modified
1. `/src/components/designer/AdvancedDesigner.tsx` - Layout container classes
2. `/src/components/LayoutWrapper.tsx` - Viewport handler integration  
3. `/src/app/globals.css` - CSS viewport fixes and responsive styles
4. `/src/lib/viewport-utils.ts` - Viewport detection and management utility

## CSS Classes Added
- `.h-screen-safe` - Safe viewport height
- `.designer-container` - Designer-specific container
- `.designer-canvas` - Canvas area styling
- `.designer-sidebar` - Sidebar responsive behavior
- `.dev-tools-mode` - Applied when dev tools detected
- `.tool-palette-fixed` - Alternative positioning for tool palette

## Browser Support
- Modern browsers with CSS custom properties support
- Graceful fallback to standard `100vh` for older browsers
- Works with Chrome, Firefox, Safari, Edge dev tools

## Usage
The fix is automatically active when the advanced designer loads. No manual configuration required. The layout will automatically adapt when:
- Browser dev tools are opened/closed
- Browser window is resized
- Device orientation changes
- Viewport becomes constrained

## Testing
To test the fix:
1. Open `/design/advanced`
2. Open browser dev tools (F12)
3. Resize dev tools panel
4. Verify layout adapts properly without overflow
5. Close dev tools and verify layout returns to normal

The designer interface should now work smoothly regardless of dev tools state.
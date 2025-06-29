# Greenhouse NaN Error Fix

## Problem
THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN when creating TubeGeometry for greenhouse ribs.

## Solution
Replaced TubeGeometry with a segmented cylinder approach:
- Each rib is built from multiple small cylinder segments
- This avoids the NaN issues with TubeGeometry on certain curve configurations
- Provides the same visual result with better stability

## Alternative Approach (if issues persist)
If you still see NaN errors, you can disable the ribs temporarily by commenting out the rib creation section in ThreeJS3DVisualization.tsx (lines 96-140).

## Testing
1. Clear browser cache and refresh
2. Create a room with greenhouse dimensions (30×96×14 ft)
3. The 3D view should show the greenhouse without errors

## What the greenhouse includes:
- Transparent glazing panels (using MeshPhysicalMaterial)
- Arched or peaked roof structure
- Sidewalls and end walls
- Structural posts (for gutter-connect)
- Grid floor
- Proper lighting and shadows

## If you want a simpler greenhouse without ribs:
Set `showStructuralDetails` to false in the component state, or simply comment out the rib generation code.
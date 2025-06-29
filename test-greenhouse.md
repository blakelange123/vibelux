# Greenhouse 3D Rendering Test

## Changes Made:

1. **Fixed Room Type Detection**
   - Updated `RoomConfigurationPanel` to automatically set `structureType` for large rooms
   - Rooms with height > 8ft, width > 20ft, or length > 30ft are now detected as greenhouses
   - Automatically sets structure type to 'single-span' for smaller greenhouses, 'gutter-connect' for length > 100ft

2. **Fixed Type Definitions**
   - Added missing greenhouse properties to Room interface in types.ts
   - Added structureType, gutterHeight, glazingType, etc.

3. **Enhanced Greenhouse Rendering**
   - Fixed glazingMaterial scope issue in ThreeJS3DVisualization
   - Used MeshPhysicalMaterial for realistic glass appearance
   - Added detailed structure for single-span greenhouses:
     - Arched roof with proper geometry
     - Structural ribs with metallic appearance
     - Sidewalls and end walls with glazing
   - Enhanced gutter-connect greenhouses:
     - Peaked roof sections
     - Structural posts every 20ft
     - Complete wall enclosure
   - Removed regular room walls when greenhouse structure is present

4. **Improved Lighting**
   - Increased ambient light intensity
   - Added directional light for better visibility
   - Enabled shadows on structural elements

## Testing Instructions:

1. Go to /design/advanced
2. Create a new room with dimensions:
   - Width: 30ft
   - Length: 96ft  
   - Height: 14ft
3. The 3D view should now show a detailed greenhouse structure instead of a black box

## Expected Result:
- Greenhouse with transparent/translucent glazing
- Visible structural frame (gray/metallic)
- Proper arched or peaked roof depending on size
- No black box appearance
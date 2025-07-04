// HVAC Movement Debug Helper
// Run this in the browser console to debug HVAC movement issues

export const debugHVACMovement = () => {
  // Get the designer state from the window (if exposed)
  const getDesignerState = () => {
    // Try to find the state through React DevTools or exposed globals
    const stateElement = document.querySelector('[data-designer-state]');
    if (stateElement) {
      return JSON.parse(stateElement.getAttribute('data-designer-state') || '{}');
    }
    
    // Alternative: Look for React fiber
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const reactKey = Object.keys(canvas).find(key => key.startsWith('__react'));
      if (reactKey && (canvas as any)[reactKey]) {
        const fiber = (canvas as any)[reactKey];
        // Traverse up to find designer context
        let current = fiber;
        while (current) {
          if (current.memoizedProps?.value?.objects) {
            return current.memoizedProps.value;
          }
          current = current.return;
        }
      }
    }
    
    return null;
  };

  const state = getDesignerState();
  
  if (state) {
    const equipment = state.objects?.filter((obj: any) => obj.type === 'equipment') || [];
    
    equipment.forEach((eq: any, index: number) => {
      // Equipment debug info would be logged here
    });
  }

  // Manual debugging steps
  /*
  🔧 MANUAL DEBUGGING STEPS:
  1. In React DevTools, find the DesignerProvider component
  2. Look at its state.objects array
  3. Filter for objects with type === 'equipment'
  4. Check their x, y, width, and length properties

  🔧 QUICK TEST:
  1. Press 'E' key to select all equipment
  2. If equipment gets selected (yellow outline), the objects exist
  3. Try using arrow keys to move them
  4. Or press 'M' for move mode and try dragging

  🔧 COORDINATE TEST:
  1. Note the room dimensions (shown in status bar)
  2. Check if equipment x,y are within room bounds
  3. Equipment at center would be at (roomWidth/2, roomLength/2)
  */
};

// Export for use in console
(window as any).debugHVAC = debugHVACMovement;
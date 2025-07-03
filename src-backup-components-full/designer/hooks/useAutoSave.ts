import { useEffect, useRef } from 'react';
import { useDesigner } from '../context/DesignerContext';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'vibelux_designer_autosave';

export function useAutoSave() {
  const { state } = useDesigner();
  const lastSaveRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const saveState = () => {
      try {
        // Create a serializable version of state (exclude functions, etc.)
        const stateToSave = {
          room: state.room,
          objects: state.objects,
          ui: {
            selectedTool: state.ui.selectedTool,
            selectedObjectType: state.ui.selectedObjectType,
            viewMode: state.ui.viewMode,
            grid: state.ui.grid,
            measurement: state.ui.measurement
          },
          savedAt: new Date().toISOString()
        };

        const serialized = JSON.stringify(stateToSave);
        
        // Only save if state has changed
        if (serialized !== lastSaveRef.current) {
          localStorage.setItem(STORAGE_KEY, serialized);
          lastSaveRef.current = serialized;
          
          // Also update session storage for sensor integration
          sessionStorage.setItem('currentDesign', JSON.stringify({
            room: state.room,
            fixtures: state.objects.filter(obj => obj.type === 'fixture'),
            summary: {
              expectedPPFD: 600, // This would be calculated from actual design
              uniformityEstimate: '>0.8'
            }
          }));
          
          // Emit design update event
          window.dispatchEvent(new CustomEvent('designUpdated', { 
            detail: {
              room: state.room,
              fixtures: state.objects.filter(obj => obj.type === 'fixture')
            }
          }));
        }
      } catch (e) {
        // Failed to auto-save - fail silently
      }
    };

    // Set up interval for periodic saves
    intervalRef.current = setInterval(saveState, AUTO_SAVE_INTERVAL);

    // Save immediately on mount
    saveState();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty deps - we access state through closure

  // Function to restore auto-saved state
  const restoreAutoSave = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Failed to restore auto-save
    }
    return null;
  };

  return { restoreAutoSave };
}
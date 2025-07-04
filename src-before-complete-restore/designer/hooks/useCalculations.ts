import { useEffect, useRef } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { calculatePPFDGrid, calculateUniformity, calculateDLI } from '../utils/calculations';
import type { Fixture } from '../context/types';

export function useCalculations() {
  const { state, dispatch } = useDesigner();
  const { room, objects } = state;
  const calculationTimeoutRef = useRef<NodeJS.Timeout>();
  const lastStateRef = useRef({ room, objects });

  useEffect(() => {
    // Skip calculations if room is null
    if (!room) {
      return;
    }

    // Check if room or objects have actually changed
    const hasChanged = 
      JSON.stringify(lastStateRef.current.room) !== JSON.stringify(room) ||
      JSON.stringify(lastStateRef.current.objects) !== JSON.stringify(objects);

    if (!hasChanged) {
      return;
    }

    // Update the last state reference
    lastStateRef.current = { room, objects };

    // Clear any pending calculations
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }

    // Set calculating state
    dispatch({ type: 'UPDATE_CALCULATIONS', payload: { isCalculating: true } });

    // Debounce calculations by 100ms for more responsive updates
    calculationTimeoutRef.current = setTimeout(() => {
      // Get only fixtures that are enabled
      const fixtures = objects.filter((obj): obj is Fixture => 
        obj.type === 'fixture' && obj.enabled
      );

      // Calculate PPFD grid
      const ppfdGrid = calculatePPFDGrid(fixtures, room);
      
      // Calculate metrics
      const flatGrid = ppfdGrid.flat();
      const nonZeroValues = flatGrid.filter(v => v > 0);
      
      const uniformityMetrics = calculateUniformity(ppfdGrid);
      const averagePPFD = nonZeroValues.length > 0 
        ? nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length 
        : 0;
      const minPPFD = Math.min(...(nonZeroValues.length > 0 ? nonZeroValues : [0]));
      const maxPPFD = Math.max(...(nonZeroValues.length > 0 ? nonZeroValues : [0]));
      const dli = calculateDLI(averagePPFD, 16); // Assuming 16 hour photoperiod

      // Update calculations in state
      dispatch({
        type: 'UPDATE_CALCULATIONS',
        payload: {
          ppfdGrid,
          uniformity: uniformityMetrics.minAvgRatio, // Keep backward compatibility
          uniformityMetrics,
          averagePPFD,
          minPPFD,
          maxPPFD,
          dli,
          isCalculating: false
        }
      });
    }, 100);

    // Cleanup function
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [room, objects, dispatch]);

  // Return calculation utilities
  return {
    recalculate: () => {
      // Force a recalculation by clearing the last state
      lastStateRef.current = { 
        room: {
          width: 0,
          length: 0,
          height: 0,
          ceilingHeight: 0,
          workingHeight: 0,
          reflectances: { ceiling: 0, walls: 0, floor: 0 },
          roomType: '',
          windows: []
        }, 
        objects: [] 
      };
    },
    isCalculating: state.calculations.isCalculating
  };
}
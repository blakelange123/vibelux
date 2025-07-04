import { useEffect, useState, useCallback } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { designerEvents, DesignerEventType } from '../events/DesignerEventSystem';
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data';

export interface AIRecommendation {
  type: 'fixture' | 'layout' | 'optimization' | 'equipment';
  message: string;
  priority: 'high' | 'medium' | 'low';
  action?: () => void;
}

export function useAIIntegration() {
  const { state, dispatch, addObject, updateObject, updateRoom } = useDesigner();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Subscribe to designer events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Listen for calculation completions
    unsubscribers.push(
      designerEvents.on('calculation.completed', (event) => {
        analyzeDesign(event.payload);
      })
    );

    // Listen for object additions
    unsubscribers.push(
      designerEvents.on('object.added', (event) => {
        if (event.source === 'user') {
          // Don't analyze AI-created objects to avoid loops
          setTimeout(() => analyzeDesign(), 500);
        }
      })
    );

    // Listen for room updates
    unsubscribers.push(
      designerEvents.on('room.updated', (event) => {
        if (event.source === 'user') {
          setTimeout(() => analyzeDesign(), 500);
        }
      })
    );

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Analyze current design and generate recommendations
  const analyzeDesign = useCallback(async (calculationResults?: any) => {
    if (isAnalyzing || !state.room) return;
    
    setIsAnalyzing(true);
    const newRecommendations: AIRecommendation[] = [];

    try {
      // Get current metrics
      const fixtures = state.objects.filter(o => o.type === 'fixture');
      const avgPPFD = calculationResults?.averagePPFD || state.calculations.averagePPFD || 0;
      const uniformity = calculationResults?.uniformity || state.calculations.uniformity || 0;
      const targetPPFD = (state.room as any).targetPPFD || 500;

      // Check if room needs fixtures
      if (fixtures.length === 0) {
        newRecommendations.push({
          type: 'fixture',
          message: 'No fixtures detected. Would you like me to suggest an optimal layout?',
          priority: 'high',
          action: () => suggestOptimalLayout()
        });
      }

      // Check PPFD levels
      if (avgPPFD > 0 && avgPPFD < targetPPFD * 0.8) {
        const deficit = targetPPFD - avgPPFD;
        const additionalFixtures = Math.ceil(deficit / 200); // Rough estimate
        
        newRecommendations.push({
          type: 'fixture',
          message: `PPFD is ${avgPPFD.toFixed(0)} but target is ${targetPPFD}. Consider adding ${additionalFixtures} more fixtures.`,
          priority: 'high',
          action: () => addMoreFixtures(additionalFixtures)
        });
      } else if (avgPPFD > targetPPFD * 1.2) {
        newRecommendations.push({
          type: 'optimization',
          message: `PPFD (${avgPPFD.toFixed(0)}) exceeds target by 20%. Consider dimming fixtures to save energy.`,
          priority: 'medium',
          action: () => optimizeDimming(targetPPFD)
        });
      }

      // Check uniformity
      if (uniformity > 0 && uniformity < 0.7) {
        newRecommendations.push({
          type: 'layout',
          message: `Uniformity is ${(uniformity * 100).toFixed(0)}%. Redistribute fixtures for better coverage.`,
          priority: 'medium',
          action: () => redistributeFixtures()
        });
      }

      // Check for environmental equipment
      const hasHVAC = state.objects.some(o => o.type === 'equipment' && o.equipmentType === 'hvac');
      const roomArea = state.room.width * state.room.length;
      
      if (!hasHVAC && roomArea > 200) {
        const tonnage = Math.ceil(roomArea * fixtures.length * 3.5 / 12000); // BTU calculation
        newRecommendations.push({
          type: 'equipment',
          message: `Room needs HVAC. Recommend ${tonnage} ton AC unit for heat management.`,
          priority: 'medium',
          action: () => addHVAC(tonnage)
        });
      }

      // Check for circulation fans
      const hasFans = state.objects.some(o => o.type === 'equipment' && o.equipmentType === 'fan');
      if (!hasFans && roomArea > 100) {
        newRecommendations.push({
          type: 'equipment',
          message: 'Add circulation fans for better air movement and temperature uniformity.',
          priority: 'low',
          action: () => addCirculationFans()
        });
      }

      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error analyzing design:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [state, isAnalyzing]);

  // Suggest optimal fixture layout
  const suggestOptimalLayout = useCallback(() => {
    if (!state.room) return;

    const { width, length } = state.room;
    const targetPPFD = (state.room as any).targetPPFD || 500;
    
    // Calculate optimal spacing (typically 4-6 ft for cannabis)
    const spacing = targetPPFD > 600 ? 4 : 5;
    const cols = Math.floor(width / spacing);
    const rows = Math.floor(length / spacing);
    
    // Find suitable fixture from DLC database
    const suitableFixture = dlcFixturesDatabase.find(f => 
      f.ppf && f.ppf > targetPPFD * 3 && f.ppf < targetPPFD * 5
    ) || dlcFixturesDatabase[0];

    // Create array of fixtures
    const startX = (width - (cols - 1) * spacing) / 2;
    const startY = (length - (rows - 1) * spacing) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        addObject({
          type: 'fixture',
          x: startX + col * spacing,
          y: startY + row * spacing,
          z: state.room.workingHeight || 3,
          rotation: 0,
          width: 4,
          length: 2,
          height: 0.5,
          enabled: true,
          model: {
            name: suitableFixture.model,
            wattage: suitableFixture.wattage,
            ppf: suitableFixture.ppf || 1800,
            beamAngle: 120,
            manufacturer: suitableFixture.brand,
            efficacy: suitableFixture.efficacy || 2.8
          },
          dimmingLevel: 100
        });
      }
    }

    dispatch({ type: 'RECALCULATE' });
  }, [state.room, addObject, dispatch]);

  // Add more fixtures intelligently
  const addMoreFixtures = useCallback((count: number) => {
    if (!state.room) return;

    const existingFixtures = state.objects.filter(o => o.type === 'fixture');
    if (existingFixtures.length === 0) {
      suggestOptimalLayout();
      return;
    }

    // Find gaps in coverage
    const { width, length } = state.room;
    const gridSize = 2; // 2ft grid
    const coverageMap = new Array(Math.ceil(length / gridSize))
      .fill(0)
      .map(() => new Array(Math.ceil(width / gridSize)).fill(0));

    // Mark covered areas
    existingFixtures.forEach(fixture => {
      const coverage = 6; // 6ft radius coverage
      const startX = Math.max(0, Math.floor((fixture.x - coverage) / gridSize));
      const endX = Math.min(coverageMap[0].length, Math.ceil((fixture.x + coverage) / gridSize));
      const startY = Math.max(0, Math.floor((fixture.y - coverage) / gridSize));
      const endY = Math.min(coverageMap.length, Math.ceil((fixture.y + coverage) / gridSize));

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          coverageMap[y][x]++;
        }
      }
    });

    // Find lowest coverage areas
    const gaps: { x: number; y: number; coverage: number }[] = [];
    for (let y = 0; y < coverageMap.length; y++) {
      for (let x = 0; x < coverageMap[y].length; x++) {
        gaps.push({ x: x * gridSize, y: y * gridSize, coverage: coverageMap[y][x] });
      }
    }
    gaps.sort((a, b) => a.coverage - b.coverage);

    // Use the same fixture model as existing
    const modelFixture = existingFixtures[0];

    // Add fixtures to lowest coverage areas
    for (let i = 0; i < Math.min(count, gaps.length); i++) {
      const gap = gaps[i];
      addObject({
        type: 'fixture',
        x: gap.x,
        y: gap.y,
        z: state.room.workingHeight || 3,
        rotation: 0,
        width: modelFixture.width,
        length: modelFixture.length,
        height: modelFixture.height,
        enabled: true,
        model: modelFixture.model,
        dimmingLevel: 100
      });
    }

    dispatch({ type: 'RECALCULATE' });
  }, [state, addObject, suggestOptimalLayout, dispatch]);

  // Optimize dimming levels
  const optimizeDimming = useCallback((targetPPFD: number) => {
    const fixtures = state.objects.filter(o => o.type === 'fixture');
    const currentAvgPPFD = state.calculations.averagePPFD;
    
    if (currentAvgPPFD > 0) {
      const dimmingFactor = targetPPFD / currentAvgPPFD;
      const newDimmingLevel = Math.round(100 * dimmingFactor);

      fixtures.forEach(fixture => {
        updateObject(fixture.id, { dimmingLevel: newDimmingLevel });
      });

      dispatch({ type: 'RECALCULATE' });
    }
  }, [state, updateObject, dispatch]);

  // Redistribute fixtures for better uniformity
  const redistributeFixtures = useCallback(() => {
    if (!state.room) return;

    const fixtures = state.objects.filter(o => o.type === 'fixture');
    if (fixtures.length === 0) return;

    const { width, length } = state.room;
    
    // Calculate optimal grid
    const aspectRatio = width / length;
    const totalFixtures = fixtures.length;
    const cols = Math.round(Math.sqrt(totalFixtures * aspectRatio));
    const rows = Math.ceil(totalFixtures / cols);

    // Calculate spacing
    const xSpacing = width / (cols + 1);
    const ySpacing = length / (rows + 1);

    // Redistribute fixtures
    let fixtureIndex = 0;
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        if (fixtureIndex < fixtures.length) {
          updateObject(fixtures[fixtureIndex].id, {
            x: col * xSpacing,
            y: row * ySpacing
          });
          fixtureIndex++;
        }
      }
    }

    dispatch({ type: 'RECALCULATE' });
  }, [state, updateObject, dispatch]);

  // Add HVAC system
  const addHVAC = useCallback((tonnage: number) => {
    if (!state.room) return;

    addObject({
      type: 'equipment',
      equipmentType: 'hvac',
      x: state.room.width - 4,
      y: state.room.length - 4,
      z: 0,
      rotation: 0,
      width: 4,
      length: 4,
      height: 3,
      enabled: true,
      customName: `${tonnage} Ton AC Unit`,
      specs: {
        tonnage,
        btu: tonnage * 12000,
        power: tonnage * 1200 // Watts
      }
    });
  }, [state.room, addObject]);

  // Add circulation fans
  const addCirculationFans = useCallback(() => {
    if (!state.room) return;

    const { width, length } = state.room;
    const fanSpacing = 15; // 15 ft spacing
    const cols = Math.floor(width / fanSpacing);
    const rows = Math.floor(length / fanSpacing);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        addObject({
          type: 'equipment',
          equipmentType: 'fan',
          x: (col + 0.5) * fanSpacing,
          y: (row + 0.5) * fanSpacing,
          z: state.room.height - 2,
          rotation: row % 2 === 0 ? 0 : 45, // Alternate angles
          width: 2,
          length: 2,
          height: 1,
          enabled: true,
          customName: '16" Circulation Fan',
          specs: {
            diameter: 16,
            cfm: 2000,
            power: 50
          }
        });
      }
    }
  }, [state.room, addObject]);

  // Execute AI command directly
  const executeAICommand = useCallback(async (command: string) => {
    try {
      const response = await fetch('/api/ai-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: command,
          mode: 'parse',
          currentState: {
            room: state.room,
            objects: state.objects,
            calculations: state.calculations
          }
        })
      });

      if (!response.ok) throw new Error('Failed to execute command');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error executing AI command:', error);
      throw error;
    }
  }, [state]);

  return {
    recommendations,
    isAnalyzing,
    analyzeDesign,
    executeAICommand,
    // Expose action functions for direct use
    actions: {
      suggestOptimalLayout,
      addMoreFixtures,
      optimizeDimming,
      redistributeFixtures,
      addHVAC,
      addCirculationFans
    }
  };
}
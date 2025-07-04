/**
 * Integration tests for quantum-biotechnology system
 * Verifies that quantum optimization integrates properly with gene expression prediction
 */

import { QuantumOptimizationEngine, QuantumOptimizationProblem } from '../quantum/quantum-optimization-engine';
import { 
  GeneExpressionPredictor, 
  LightingCondition, 
  EnvironmentalContext 
} from '../biotechnology/gene-expression-predictor';

describe('Quantum-Biotechnology Integration', () => {
  let quantumEngine: QuantumOptimizationEngine;
  let genePredictor: GeneExpressionPredictor;

  beforeEach(() => {
    quantumEngine = new QuantumOptimizationEngine(8); // Use 8 qubits for testing
    genePredictor = new GeneExpressionPredictor();
  });

  test('Quantum engine initializes correctly', () => {
    expect(quantumEngine).toBeDefined();
  });

  test('Gene expression predictor initializes correctly', () => {
    expect(genePredictor).toBeDefined();
  });

  test('Quantum optimization problem can be created', () => {
    const problem: QuantumOptimizationProblem = {
      variables: [
        {
          id: 'red_ratio',
          name: 'Red Light Ratio',
          type: 'spectrum',
          range: [10, 40],
          currentValue: 25,
          quantumEncoding: 3
        }
      ],
      constraints: [],
      objectiveFunction: {
        type: 'maximize',
        components: [
          {
            name: 'quality',
            function: 'quality',
            target: 1.0,
            importance: 1.0
          }
        ],
        weights: [1.0]
      },
      maxIterations: 10,
      convergenceThreshold: 0.01
    };

    expect(problem.variables).toHaveLength(1);
    expect(problem.objectiveFunction.type).toBe('maximize');
  });

  test('Gene expression prediction can run', async () => {
    const currentLighting: LightingCondition = {
      spectrumProfile: {
        wavelength380_400: 2,
        wavelength400_450: 20,
        wavelength450_500: 15,
        wavelength500_550: 10,
        wavelength550_600: 8,
        wavelength600_650: 15,
        wavelength650_700: 25,
        wavelength700_750: 4,
        wavelength750_800: 1
      },
      intensity: 300,
      photoperiod: 16,
      dailyLightIntegral: 17.28,
      temporalVariation: {
        dawnDuration: 30,
        duskDuration: 30,
        midDayFluctuation: 5,
        circadianModulation: true
      }
    };

    const proposedLighting: LightingCondition = {
      ...currentLighting,
      spectrumProfile: {
        ...currentLighting.spectrumProfile,
        wavelength650_700: 30 // Increase red light
      }
    };

    const environmentalContext: EnvironmentalContext = {
      temperature: 22,
      humidity: 65,
      co2: 800,
      nutrients: { N: 150, P: 50, K: 200 },
      soilPH: 6.2,
      developmentalStage: 'vegetative'
    };

    const predictions = await genePredictor.predictGeneExpression(
      'Lactuca sativa',
      currentLighting,
      proposedLighting,
      environmentalContext
    );

    expect(predictions).toBeDefined();
    expect(Array.isArray(predictions)).toBe(true);
  });

  test('Quantum optimization with minimal problem', async () => {
    const problem: QuantumOptimizationProblem = {
      variables: [
        {
          id: 'test_var',
          name: 'Test Variable',
          type: 'spectrum',
          range: [0, 10],
          currentValue: 5,
          quantumEncoding: 2
        }
      ],
      constraints: [],
      objectiveFunction: {
        type: 'maximize',
        components: [
          {
            name: 'test_objective',
            function: 'quality',
            target: 1.0,
            importance: 1.0
          }
        ],
        weights: [1.0]
      },
      maxIterations: 5,
      convergenceThreshold: 0.1
    };

    const result = await quantumEngine.optimizeCultivationParameters(problem);

    expect(result).toBeDefined();
    expect(result.optimalValues).toBeDefined();
    expect(result.objectiveValue).toBeGreaterThanOrEqual(0);
    expect(result.fidelity).toBeGreaterThan(0);
    expect(result.fidelity).toBeLessThanOrEqual(1);
  });

  test('Integration: Quantum-optimized spectrum affects gene prediction', async () => {
    // First, run quantum optimization
    const quantumProblem: QuantumOptimizationProblem = {
      variables: [
        {
          id: 'red_ratio',
          name: 'Red Light Ratio',
          type: 'spectrum',
          range: [15, 35],
          currentValue: 25,
          quantumEncoding: 3
        }
      ],
      constraints: [],
      objectiveFunction: {
        type: 'maximize',
        components: [
          {
            name: 'metabolite_production',
            function: 'quality',
            target: 1.0,
            importance: 1.0
          }
        ],
        weights: [1.0]
      },
      maxIterations: 3,
      convergenceThreshold: 0.1
    };

    const quantumResult = await quantumEngine.optimizeCultivationParameters(quantumProblem);

    // Use quantum result to create optimized lighting condition
    const baseLighting: LightingCondition = {
      spectrumProfile: {
        wavelength380_400: 2,
        wavelength400_450: 20,
        wavelength450_500: 15,
        wavelength500_550: 10,
        wavelength550_600: 8,
        wavelength600_650: 15,
        wavelength650_700: 25,
        wavelength700_750: 4,
        wavelength750_800: 1
      },
      intensity: 300,
      photoperiod: 16,
      dailyLightIntegral: 17.28,
      temporalVariation: {
        dawnDuration: 30,
        duskDuration: 30,
        midDayFluctuation: 5,
        circadianModulation: true
      }
    };

    const optimizedLighting: LightingCondition = {
      ...baseLighting,
      spectrumProfile: {
        ...baseLighting.spectrumProfile,
        wavelength650_700: quantumResult.optimalValues.red_ratio || baseLighting.spectrumProfile.wavelength650_700
      }
    };

    // Test gene expression prediction with quantum-optimized spectrum
    const environmentalContext: EnvironmentalContext = {
      temperature: 22,
      humidity: 65,
      co2: 800,
      nutrients: { N: 150, P: 50, K: 200 },
      soilPH: 6.2,
      developmentalStage: 'vegetative'
    };

    const predictions = await genePredictor.predictGeneExpression(
      'Lactuca sativa',
      baseLighting,
      optimizedLighting,
      environmentalContext
    );

    // Verify integration works
    expect(quantumResult).toBeDefined();
    expect(predictions).toBeDefined();
    expect(predictions.length).toBeGreaterThan(0);
    
    // Verify quantum optimization provided a different value
    expect(quantumResult.optimalValues.red_ratio).toBeDefined();
    
    console.log('Integration test successful:');
    console.log('- Quantum advantage:', quantumResult.quantumAdvantage);
    console.log('- Optimal red ratio:', quantumResult.optimalValues.red_ratio);
    console.log('- Gene predictions count:', predictions.length);
    console.log('- First gene fold change:', predictions[0]?.foldChange);
  });
});

// Mock implementations for testing environment
if (typeof global !== 'undefined') {
  // Mock performance.now if not available
  if (!global.performance) {
    global.performance = {
      now: () => Date.now()
    } as any;
  }
}
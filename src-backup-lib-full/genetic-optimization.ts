/**
 * AI-Powered Fixture Placement Optimization using Genetic Algorithms
 * Professional-grade lighting design optimization with evolutionary computation
 */

import { Vector3D, LightSource, Surface, SimulationParameters, IlluminanceResult } from './monte-carlo-raytracing';
import { MonteCarloRaytracer } from './monte-carlo-raytracing';

export interface OptimizationConstraints {
  maxFixtures: number;
  minFixtures: number;
  targetPPFD: number;
  uniformityTarget: number; // 0-1
  energyBudget: number; // Watts
  installationHeight: { min: number; max: number };
  excludedZones: { x: number; y: number; width: number; height: number }[];
  fixtureSpacing: { min: number; max: number };
}

export interface FixtureTemplate {
  id: string;
  name: string;
  lumens: number;
  watts: number;
  beamAngle: number;
  fieldAngle: number;
  cost: number;
  dimensions: { width: number; length: number; height: number };
  photometricData?: any;
}

export interface OptimizationObjectives {
  uniformity: number; // Weight 0-1
  energyEfficiency: number; // Weight 0-1
  cost: number; // Weight 0-1
  coverage: number; // Weight 0-1
  maintenance: number; // Weight 0-1
}

export interface FixtureGene {
  x: number;
  y: number;
  z: number;
  fixtureTypeId: string;
  rotation: number; // 0-360 degrees
  enabled: boolean;
}

export interface Individual {
  genes: FixtureGene[];
  fitness: number;
  objectives: {
    uniformity: number;
    energyEfficiency: number;
    cost: number;
    coverage: number;
    ppfdDeviation: number;
    constraintViolations: number;
  };
  simulationResults?: IlluminanceResult[];
}

export interface OptimizationProgress {
  generation: number;
  bestFitness: number;
  averageFitness: number;
  convergenceRate: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
}

export interface OptimizationResult {
  bestIndividual: Individual;
  allGenerations: Individual[][];
  convergenceHistory: number[];
  finalStats: {
    totalFixtures: number;
    totalWattage: number;
    totalCost: number;
    averagePPFD: number;
    uniformityRatio: number;
    energyEfficiency: number;
    coveragePercentage: number;
  };
}

export class GeneticLightingOptimizer {
  private raytracer: MonteCarloRaytracer;
  private roomDimensions: { width: number; length: number; height: number };
  private measurementGrid: Vector3D[];
  private surfaces: Surface[];
  
  constructor(
    roomDimensions: { width: number; length: number; height: number },
    surfaces: Surface[] = []
  ) {
    this.raytracer = new MonteCarloRaytracer();
    this.roomDimensions = roomDimensions;
    this.surfaces = surfaces;
    this.measurementGrid = this.generateMeasurementGrid();
    
    // Add room surfaces to raytracer
    surfaces.forEach(surface => this.raytracer.addSurface(surface));
  }

  /**
   * Generate measurement grid for fitness evaluation
   */
  private generateMeasurementGrid(resolution: number = 1.0): Vector3D[] {
    const points: Vector3D[] = [];
    const stepX = Math.max(0.5, this.roomDimensions.width / Math.floor(this.roomDimensions.width / resolution));
    const stepY = Math.max(0.5, this.roomDimensions.length / Math.floor(this.roomDimensions.length / resolution));
    const measurementHeight = 0.75; // 30 inches from floor
    
    for (let x = stepX / 2; x < this.roomDimensions.width; x += stepX) {
      for (let y = stepY / 2; y < this.roomDimensions.length; y += stepY) {
        points.push({ x, y, z: measurementHeight });
      }
    }
    
    return points;
  }

  /**
   * Run genetic algorithm optimization
   */
  public async optimize(
    fixtureTemplates: FixtureTemplate[],
    constraints: OptimizationConstraints,
    objectives: OptimizationObjectives,
    options: {
      populationSize?: number;
      generations?: number;
      mutationRate?: number;
      crossoverRate?: number;
      elitismRate?: number;
      convergenceThreshold?: number;
    } = {},
    onProgress?: (progress: OptimizationProgress) => void
  ): Promise<OptimizationResult> {
    
    const {
      populationSize = 50,
      generations = 100,
      mutationRate = 0.1,
      crossoverRate = 0.8,
      elitismRate = 0.2,
      convergenceThreshold = 0.001
    } = options;

    const startTime = Date.now();
    let population = this.initializePopulation(populationSize, fixtureTemplates, constraints);
    const convergenceHistory: number[] = [];
    const allGenerations: Individual[][] = [];
    
    // Evaluate initial population
    await this.evaluatePopulation(population, constraints, objectives);
    population.sort((a, b) => b.fitness - a.fitness);
    
    let bestFitness = population[0].fitness;
    let convergenceCount = 0;
    
    for (let generation = 0; generation < generations; generation++) {
      // Store generation for analysis
      allGenerations.push(JSON.parse(JSON.stringify(population)));
      
      // Selection and reproduction
      const newPopulation = await this.evolvePopulation(
        population,
        constraints,
        objectives,
        {
          mutationRate,
          crossoverRate,
          elitismRate,
          fixtureTemplates
        }
      );
      
      population = newPopulation;
      const currentBestFitness = population[0].fitness;
      convergenceHistory.push(currentBestFitness);
      
      // Check for convergence
      if (Math.abs(currentBestFitness - bestFitness) < convergenceThreshold) {
        convergenceCount++;
        if (convergenceCount >= 10) {
          console.log(`Converged after ${generation + 1} generations`);
          break;
        }
      } else {
        convergenceCount = 0;
      }
      
      bestFitness = currentBestFitness;
      
      // Report progress
      if (onProgress) {
        const elapsedTime = Date.now() - startTime;
        const avgFitness = population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length;
        const estimatedTimeRemaining = generation > 0 
          ? (elapsedTime / (generation + 1)) * (generations - generation - 1)
          : 0;
        
        onProgress({
          generation: generation + 1,
          bestFitness: currentBestFitness,
          averageFitness: avgFitness,
          convergenceRate: convergenceCount / 10,
          elapsedTime,
          estimatedTimeRemaining
        });
      }
    }
    
    const bestIndividual = population[0];
    
    // Calculate final statistics
    const finalStats = this.calculateFinalStatistics(bestIndividual, fixtureTemplates);
    
    return {
      bestIndividual,
      allGenerations,
      convergenceHistory,
      finalStats
    };
  }

  /**
   * Initialize random population
   */
  private initializePopulation(
    size: number,
    fixtureTemplates: FixtureTemplate[],
    constraints: OptimizationConstraints
  ): Individual[] {
    const population: Individual[] = [];
    
    for (let i = 0; i < size; i++) {
      const individual = this.createRandomIndividual(fixtureTemplates, constraints);
      population.push(individual);
    }
    
    return population;
  }

  /**
   * Create a random individual
   */
  private createRandomIndividual(
    fixtureTemplates: FixtureTemplate[],
    constraints: OptimizationConstraints
  ): Individual {
    const genes: FixtureGene[] = [];
    const numFixtures = Math.floor(
      constraints.minFixtures + 
      Math.random() * (constraints.maxFixtures - constraints.minFixtures)
    );
    
    for (let i = 0; i < numFixtures; i++) {
      const gene = this.createRandomGene(fixtureTemplates, constraints);
      genes.push(gene);
    }
    
    return {
      genes,
      fitness: 0,
      objectives: {
        uniformity: 0,
        energyEfficiency: 0,
        cost: 0,
        coverage: 0,
        ppfdDeviation: 0,
        constraintViolations: 0
      }
    };
  }

  /**
   * Create a random gene
   */
  private createRandomGene(
    fixtureTemplates: FixtureTemplate[],
    constraints: OptimizationConstraints
  ): FixtureGene {
    let x, y;
    let validPosition = false;
    let attempts = 0;
    
    // Find valid position avoiding excluded zones
    do {
      x = Math.random() * this.roomDimensions.width;
      y = Math.random() * this.roomDimensions.length;
      
      validPosition = !constraints.excludedZones.some(zone => 
        x >= zone.x && x <= zone.x + zone.width &&
        y >= zone.y && y <= zone.y + zone.height
      );
      
      attempts++;
    } while (!validPosition && attempts < 100);
    
    const z = constraints.installationHeight.min + 
      Math.random() * (constraints.installationHeight.max - constraints.installationHeight.min);
    
    const fixtureTypeId = fixtureTemplates[Math.floor(Math.random() * fixtureTemplates.length)].id;
    const rotation = Math.random() * 360;
    
    return {
      x: x || this.roomDimensions.width / 2,
      y: y || this.roomDimensions.length / 2,
      z,
      fixtureTypeId,
      rotation,
      enabled: true
    };
  }

  /**
   * Evaluate population fitness
   */
  private async evaluatePopulation(
    population: Individual[],
    constraints: OptimizationConstraints,
    objectives: OptimizationObjectives
  ): Promise<void> {
    const simulationPromises = population.map(individual => 
      this.evaluateIndividual(individual, constraints, objectives)
    );
    
    await Promise.all(simulationPromises);
  }

  /**
   * Evaluate individual fitness
   */
  private async evaluateIndividual(
    individual: Individual,
    constraints: OptimizationConstraints,
    objectives: OptimizationObjectives
  ): Promise<void> {
    // Convert genes to light sources
    const lightSources = this.genesToLightSources(individual.genes);
    
    // Clear previous light sources
    this.raytracer.clearScene();
    this.surfaces.forEach(surface => this.raytracer.addSurface(surface));
    
    // Add new light sources
    lightSources.forEach(light => this.raytracer.addLightSource(light));
    
    try {
      // Run simulation
      const simulationParams: SimulationParameters = {
        rayCount: 10000, // Reduced for speed during optimization
        maxBounces: 5,
        wavelengthRange: [380, 780],
        spectralResolution: 20,
        convergenceThreshold: 0.05,
        importanceSampling: true,
        adaptiveSampling: false
      };
      
      const results = await this.raytracer.runSimulation(this.measurementGrid, simulationParams);
      individual.simulationResults = results;
      
      // Calculate objectives
      const objectiveScores = this.calculateObjectives(individual, constraints, results);
      individual.objectives = objectiveScores;
      
      // Calculate weighted fitness
      individual.fitness = this.calculateWeightedFitness(objectiveScores, objectives);
      
    } catch (error) {
      console.error('Simulation error:', error);
      individual.fitness = 0;
      individual.objectives = {
        uniformity: 0,
        energyEfficiency: 0,
        cost: 0,
        coverage: 0,
        ppfdDeviation: 1,
        constraintViolations: 1
      };
    }
  }

  /**
   * Convert genes to light sources
   */
  private genesToLightSources(genes: FixtureGene[]): LightSource[] {
    return genes
      .filter(gene => gene.enabled)
      .map((gene, index) => ({
        id: `fixture_${index}`,
        position: { x: gene.x, y: gene.y, z: gene.z },
        direction: { x: 0, y: 0, z: -1 }, // Downward
        beamAngle: 60, // Default beam angle
        powerDistribution: {
          wavelengths: [400, 500, 600, 700],
          values: [0.2, 0.3, 0.3, 0.2]
        },
        totalLumens: 5000, // Default lumens
        photometricDistribution: [[0, 1.0], [60, 0.5], [90, 0.1]]
      }));
  }

  /**
   * Calculate objective scores
   */
  private calculateObjectives(
    individual: Individual,
    constraints: OptimizationConstraints,
    results: IlluminanceResult[]
  ): Individual['objectives'] {
    if (results.length === 0) {
      return {
        uniformity: 0,
        energyEfficiency: 0,
        cost: 0,
        coverage: 0,
        ppfdDeviation: 1,
        constraintViolations: 1
      };
    }
    
    // Calculate uniformity (coefficient of variation)
    const illuminanceValues = results.map(r => r.illuminance);
    const mean = illuminanceValues.reduce((sum, val) => sum + val, 0) / illuminanceValues.length;
    const variance = illuminanceValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / illuminanceValues.length;
    const stdDev = Math.sqrt(variance);
    const uniformity = mean > 0 ? 1 - (stdDev / mean) : 0; // Higher is better
    
    // Calculate coverage (percentage of points meeting minimum PPFD)
    const minPPFD = constraints.targetPPFD * 0.7; // 70% of target as minimum
    const adequatePoints = illuminanceValues.filter(val => val >= minPPFD).length;
    const coverage = adequatePoints / illuminanceValues.length;
    
    // Calculate PPFD deviation from target
    const ppfdDeviation = Math.abs(mean - constraints.targetPPFD) / constraints.targetPPFD;
    
    // Calculate energy efficiency (lumens per watt for active fixtures)
    const activeFixtures = individual.genes.filter(g => g.enabled).length;
    const totalWattage = activeFixtures * 50; // Assume 50W per fixture
    const totalLumens = activeFixtures * 5000; // Assume 5000lm per fixture
    const energyEfficiency = totalWattage > 0 ? totalLumens / totalWattage / 100 : 0; // Normalized
    
    // Calculate cost efficiency
    const totalCost = activeFixtures * 500; // Assume $500 per fixture
    const costEfficiency = 1 - Math.min(1, totalCost / (constraints.energyBudget * 10)); // Normalized
    
    // Calculate constraint violations
    let violations = 0;
    if (activeFixtures > constraints.maxFixtures) violations += 0.5;
    if (activeFixtures < constraints.minFixtures) violations += 0.5;
    if (totalWattage > constraints.energyBudget) violations += 0.5;
    
    // Check fixture spacing constraints
    const spacing = this.checkFixtureSpacing(individual.genes, constraints.fixtureSpacing);
    if (!spacing.valid) violations += 0.3;
    
    return {
      uniformity: Math.max(0, Math.min(1, uniformity)),
      energyEfficiency: Math.max(0, Math.min(1, energyEfficiency)),
      cost: Math.max(0, Math.min(1, costEfficiency)),
      coverage: Math.max(0, Math.min(1, coverage)),
      ppfdDeviation: Math.max(0, Math.min(1, 1 - ppfdDeviation)),
      constraintViolations: Math.max(0, Math.min(1, 1 - violations))
    };
  }

  /**
   * Check fixture spacing constraints
   */
  private checkFixtureSpacing(
    genes: FixtureGene[],
    spacingConstraints: { min: number; max: number }
  ): { valid: boolean; violations: number } {
    const activeGenes = genes.filter(g => g.enabled);
    let violations = 0;
    
    for (let i = 0; i < activeGenes.length; i++) {
      for (let j = i + 1; j < activeGenes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(activeGenes[i].x - activeGenes[j].x, 2) +
          Math.pow(activeGenes[i].y - activeGenes[j].y, 2)
        );
        
        if (distance < spacingConstraints.min) violations++;
        if (distance > spacingConstraints.max) violations++;
      }
    }
    
    return {
      valid: violations === 0,
      violations
    };
  }

  /**
   * Calculate weighted fitness score
   */
  private calculateWeightedFitness(
    objectives: Individual['objectives'],
    weights: OptimizationObjectives
  ): number {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    if (totalWeight === 0) return 0;
    
    return (
      objectives.uniformity * weights.uniformity +
      objectives.energyEfficiency * weights.energyEfficiency +
      objectives.cost * weights.cost +
      objectives.coverage * weights.coverage +
      objectives.constraintViolations * 0.5 + // Always penalize violations
      objectives.ppfdDeviation * 0.3 // Always consider PPFD accuracy
    ) / (totalWeight + 0.8);
  }

  /**
   * Evolve population through selection, crossover, and mutation
   */
  private async evolvePopulation(
    population: Individual[],
    constraints: OptimizationConstraints,
    objectives: OptimizationObjectives,
    evolutionParams: {
      mutationRate: number;
      crossoverRate: number;
      elitismRate: number;
      fixtureTemplates: FixtureTemplate[];
    }
  ): Promise<Individual[]> {
    const newPopulation: Individual[] = [];
    const eliteCount = Math.floor(population.length * evolutionParams.elitismRate);
    
    // Elitism: Keep best individuals
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push(JSON.parse(JSON.stringify(population[i])));
    }
    
    // Generate offspring through crossover and mutation
    while (newPopulation.length < population.length) {
      // Tournament selection
      const parent1 = this.tournamentSelection(population, 3);
      const parent2 = this.tournamentSelection(population, 3);
      
      // Crossover
      let offspring1, offspring2;
      if (Math.random() < evolutionParams.crossoverRate) {
        [offspring1, offspring2] = this.crossover(parent1, parent2);
      } else {
        offspring1 = JSON.parse(JSON.stringify(parent1));
        offspring2 = JSON.parse(JSON.stringify(parent2));
      }
      
      // Mutation
      this.mutate(offspring1, evolutionParams.mutationRate, evolutionParams.fixtureTemplates, constraints);
      this.mutate(offspring2, evolutionParams.mutationRate, evolutionParams.fixtureTemplates, constraints);
      
      newPopulation.push(offspring1, offspring2);
    }
    
    // Trim to exact population size
    newPopulation.length = population.length;
    
    // Evaluate new population
    await this.evaluatePopulation(newPopulation, constraints, objectives);
    
    // Sort by fitness
    newPopulation.sort((a, b) => b.fitness - a.fitness);
    
    return newPopulation;
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(population: Individual[], tournamentSize: number): Individual {
    const tournament: Individual[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    
    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0];
  }

  /**
   * Crossover operation
   */
  private crossover(parent1: Individual, parent2: Individual): [Individual, Individual] {
    const offspring1: Individual = JSON.parse(JSON.stringify(parent1));
    const offspring2: Individual = JSON.parse(JSON.stringify(parent2));
    
    // Uniform crossover: randomly swap genes
    const maxGenes = Math.max(parent1.genes.length, parent2.genes.length);
    
    for (let i = 0; i < maxGenes; i++) {
      if (Math.random() < 0.5) {
        // Swap genes if both exist
        if (i < parent1.genes.length && i < parent2.genes.length) {
          [offspring1.genes[i], offspring2.genes[i]] = [offspring2.genes[i], offspring1.genes[i]];
        }
        // Or add/remove genes
        else if (i < parent1.genes.length) {
          offspring2.genes.push(JSON.parse(JSON.stringify(parent1.genes[i])));
        } else if (i < parent2.genes.length) {
          offspring1.genes.push(JSON.parse(JSON.stringify(parent2.genes[i])));
        }
      }
    }
    
    return [offspring1, offspring2];
  }

  /**
   * Mutation operation
   */
  private mutate(
    individual: Individual,
    mutationRate: number,
    fixtureTemplates: FixtureTemplate[],
    constraints: OptimizationConstraints
  ): void {
    // Position mutation
    for (const gene of individual.genes) {
      if (Math.random() < mutationRate) {
        gene.x += (Math.random() - 0.5) * 2; // ±1 meter
        gene.x = Math.max(0, Math.min(this.roomDimensions.width, gene.x));
      }
      
      if (Math.random() < mutationRate) {
        gene.y += (Math.random() - 0.5) * 2; // ±1 meter
        gene.y = Math.max(0, Math.min(this.roomDimensions.length, gene.y));
      }
      
      if (Math.random() < mutationRate) {
        gene.z += (Math.random() - 0.5) * 0.5; // ±0.25 meter
        gene.z = Math.max(constraints.installationHeight.min, 
                         Math.min(constraints.installationHeight.max, gene.z));
      }
      
      // Fixture type mutation
      if (Math.random() < mutationRate * 0.5) {
        gene.fixtureTypeId = fixtureTemplates[Math.floor(Math.random() * fixtureTemplates.length)].id;
      }
      
      // Enable/disable mutation
      if (Math.random() < mutationRate * 0.3) {
        gene.enabled = !gene.enabled;
      }
      
      // Rotation mutation
      if (Math.random() < mutationRate) {
        gene.rotation += (Math.random() - 0.5) * 90; // ±45 degrees
        gene.rotation = (gene.rotation + 360) % 360;
      }
    }
    
    // Add/remove fixture mutation
    if (Math.random() < mutationRate * 0.2) {
      if (individual.genes.length < constraints.maxFixtures && Math.random() < 0.7) {
        // Add fixture
        const newGene = this.createRandomGene(fixtureTemplates, constraints);
        individual.genes.push(newGene);
      } else if (individual.genes.length > constraints.minFixtures) {
        // Remove fixture
        const randomIndex = Math.floor(Math.random() * individual.genes.length);
        individual.genes.splice(randomIndex, 1);
      }
    }
  }

  /**
   * Calculate final statistics
   */
  private calculateFinalStatistics(
    individual: Individual,
    fixtureTemplates: FixtureTemplate[]
  ): OptimizationResult['finalStats'] {
    const activeFixtures = individual.genes.filter(g => g.enabled);
    const totalFixtures = activeFixtures.length;
    const totalWattage = totalFixtures * 50; // Simplified
    const totalCost = totalFixtures * 500; // Simplified
    
    const results = individual.simulationResults || [];
    const averagePPFD = results.length > 0 
      ? results.reduce((sum, r) => sum + r.illuminance, 0) / results.length 
      : 0;
    
    const illuminanceValues = results.map(r => r.illuminance);
    const minIlluminance = Math.min(...illuminanceValues);
    const maxIlluminance = Math.max(...illuminanceValues);
    const uniformityRatio = maxIlluminance > 0 ? minIlluminance / maxIlluminance : 0;
    
    const energyEfficiency = totalWattage > 0 ? (totalFixtures * 5000) / totalWattage : 0;
    const coveragePercentage = individual.objectives.coverage * 100;
    
    return {
      totalFixtures,
      totalWattage,
      totalCost,
      averagePPFD,
      uniformityRatio,
      energyEfficiency,
      coveragePercentage
    };
  }

  /**
   * Get optimization recommendations
   */
  public getOptimizationRecommendations(result: OptimizationResult): string[] {
    const recommendations: string[] = [];
    const { bestIndividual, finalStats } = result;
    
    if (finalStats.uniformityRatio < 0.7) {
      recommendations.push('Consider increasing fixture count or adjusting placement for better uniformity');
    }
    
    if (finalStats.energyEfficiency < 80) {
      recommendations.push('Energy efficiency could be improved with higher-efficacy fixtures');
    }
    
    if (finalStats.coveragePercentage < 90) {
      recommendations.push('Increase fixture count or lumens to improve coverage');
    }
    
    if (bestIndividual.objectives.constraintViolations < 0.8) {
      recommendations.push('Some constraints are violated - review spacing and budget limits');
    }
    
    return recommendations;
  }
}
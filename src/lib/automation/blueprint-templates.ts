export interface BlueprintTemplate {
  id: string;
  name: string;
  description: string;
  category: 'cannabis' | 'vegetables' | 'herbs' | 'general';
  cropType?: string;
  phases: BlueprintPhase[];
  equipment: string[];
  estimatedDuration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdBy: string;
  rating: number;
  uses: number;
}

export interface BlueprintPhase {
  name: string;
  duration: number; // days
  description: string;
  environment: {
    temperature: { day: number; night: number };
    humidity: { day: number; night: number };
    co2: number;
    lightIntensity: number;
    photoperiod: number;
  };
  irrigation: {
    frequency: string;
    amount: string;
    nutrients: {
      ec: number;
      ph: number;
      recipe: string;
    };
  };
  tasks: BlueprintTask[];
  alerts: BlueprintAlert[];
}

export interface BlueprintTask {
  day: number;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
}

export interface BlueprintAlert {
  condition: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export class BlueprintTemplateLibrary {
  private templates: Map<string, BlueprintTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  public getTemplates(filters?: {
    category?: string;
    cropType?: string;
    difficulty?: string;
    search?: string;
  }): BlueprintTemplate[] {
    let templates = Array.from(this.templates.values());

    if (filters) {
      if (filters.category) {
        templates = templates.filter(t => t.category === filters.category);
      }
      if (filters.cropType) {
        templates = templates.filter(t => t.cropType === filters.cropType);
      }
      if (filters.difficulty) {
        templates = templates.filter(t => t.difficulty === filters.difficulty);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(search) || 
          t.description.toLowerCase().includes(search)
        );
      }
    }

    return templates.sort((a, b) => b.rating - a.rating);
  }

  public getTemplate(id: string): BlueprintTemplate | undefined {
    return this.templates.get(id);
  }

  public createCustomTemplate(template: Omit<BlueprintTemplate, 'id' | 'rating' | 'uses'>): BlueprintTemplate {
    const newTemplate: BlueprintTemplate = {
      ...template,
      id: `CUSTOM-${Date.now()}`,
      rating: 0,
      uses: 0
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  private initializeTemplates(): void {
    // Cannabis - Sea of Green (SOG)
    this.templates.set('cannabis-sog', {
      id: 'cannabis-sog',
      name: 'Cannabis Sea of Green (SOG)',
      description: 'High-density cultivation with minimal veg time for maximum turnover',
      category: 'cannabis',
      cropType: 'Cannabis',
      phases: [
        {
          name: 'Clone/Seedling',
          duration: 7,
          description: 'Root development and establishment',
          environment: {
            temperature: { day: 75, night: 70 },
            humidity: { day: 70, night: 70 },
            co2: 400,
            lightIntensity: 200,
            photoperiod: 18
          },
          irrigation: {
            frequency: '2-3 times daily',
            amount: '50-100ml per plant',
            nutrients: {
              ec: 0.8,
              ph: 5.8,
              recipe: 'Clone/Seedling Formula'
            }
          },
          tasks: [
            { day: 1, name: 'Transplant clones', description: 'Plant rooted clones into final containers', priority: 'high', estimatedTime: 120 },
            { day: 3, name: 'Check root development', description: 'Ensure proper root establishment', priority: 'medium', estimatedTime: 30 },
            { day: 7, name: 'Prepare for flip', description: 'Final check before flowering', priority: 'high', estimatedTime: 60 }
          ],
          alerts: [
            { condition: 'humidity < 60', message: 'Low humidity may stress young plants', severity: 'warning' },
            { condition: 'temperature > 80', message: 'High temperature can slow root development', severity: 'warning' }
          ]
        },
        {
          name: 'Flowering - Stretch',
          duration: 21,
          description: 'Initial flowering phase with vertical growth',
          environment: {
            temperature: { day: 78, night: 68 },
            humidity: { day: 55, night: 55 },
            co2: 1000,
            lightIntensity: 600,
            photoperiod: 12
          },
          irrigation: {
            frequency: '4-6 times daily',
            amount: '200-400ml per plant',
            nutrients: {
              ec: 2.0,
              ph: 6.0,
              recipe: 'Bloom Transition Formula'
            }
          },
          tasks: [
            { day: 7, name: 'Defoliation', description: 'Remove lower fan leaves', priority: 'medium', estimatedTime: 180 },
            { day: 14, name: 'Support installation', description: 'Install trellis or stakes', priority: 'high', estimatedTime: 120 },
            { day: 21, name: 'Final defoliation', description: 'Remove remaining fan leaves blocking bud sites', priority: 'medium', estimatedTime: 180 }
          ],
          alerts: [
            { condition: 'stretch > 200%', message: 'Excessive stretch detected', severity: 'info' }
          ]
        },
        {
          name: 'Flowering - Bulk',
          duration: 35,
          description: 'Main flower development phase',
          environment: {
            temperature: { day: 77, night: 65 },
            humidity: { day: 45, night: 45 },
            co2: 1200,
            lightIntensity: 800,
            photoperiod: 12
          },
          irrigation: {
            frequency: '3-5 times daily',
            amount: '300-500ml per plant',
            nutrients: {
              ec: 2.4,
              ph: 6.2,
              recipe: 'Bloom Peak Formula'
            }
          },
          tasks: [
            { day: 7, name: 'Pest inspection', description: 'Thorough IPM check', priority: 'high', estimatedTime: 60 },
            { day: 21, name: 'Begin flush planning', description: 'Test trichomes and plan harvest', priority: 'medium', estimatedTime: 30 }
          ],
          alerts: [
            { condition: 'humidity > 55', message: 'High humidity risk for bud rot', severity: 'critical' },
            { condition: 'pm_risk > 70', message: 'Conditions favorable for powdery mildew', severity: 'warning' }
          ]
        }
      ],
      equipment: ['LED Lights', 'HVAC', 'Irrigation System', 'CO2 System'],
      estimatedDuration: 63,
      difficulty: 'intermediate',
      tags: ['high-density', 'fast-turnover', 'commercial'],
      createdBy: 'Vibelux Team',
      rating: 4.8,
      uses: 1250
    });

    // Lettuce - Vertical NFT
    this.templates.set('lettuce-nft', {
      id: 'lettuce-nft',
      name: 'Lettuce Vertical NFT System',
      description: 'Optimized for vertical NFT hydroponic lettuce production',
      category: 'vegetables',
      cropType: 'Lettuce',
      phases: [
        {
          name: 'Germination',
          duration: 7,
          description: 'Seed germination in nursery',
          environment: {
            temperature: { day: 68, night: 65 },
            humidity: { day: 80, night: 80 },
            co2: 400,
            lightIntensity: 100,
            photoperiod: 16
          },
          irrigation: {
            frequency: 'Misting 4x daily',
            amount: 'Light mist',
            nutrients: {
              ec: 0.5,
              ph: 5.8,
              recipe: 'Seedling Solution'
            }
          },
          tasks: [
            { day: 1, name: 'Sow seeds', description: 'Plant seeds in rockwool cubes', priority: 'high', estimatedTime: 60 },
            { day: 4, name: 'Check germination', description: 'Verify germination rate', priority: 'medium', estimatedTime: 15 }
          ],
          alerts: []
        },
        {
          name: 'Transplant & Growth',
          duration: 21,
          description: 'Main growth phase in NFT channels',
          environment: {
            temperature: { day: 72, night: 65 },
            humidity: { day: 65, night: 70 },
            co2: 600,
            lightIntensity: 250,
            photoperiod: 14
          },
          irrigation: {
            frequency: 'Continuous flow',
            amount: '1-2L/min per channel',
            nutrients: {
              ec: 1.8,
              ph: 5.8,
              recipe: 'Lettuce Growth Formula'
            }
          },
          tasks: [
            { day: 1, name: 'Transplant to NFT', description: 'Move seedlings to production channels', priority: 'high', estimatedTime: 120 },
            { day: 7, name: 'System check', description: 'Verify flow rates and pH', priority: 'medium', estimatedTime: 30 },
            { day: 14, name: 'Spacing adjustment', description: 'Adjust plant spacing if needed', priority: 'low', estimatedTime: 45 }
          ],
          alerts: [
            { condition: 'flow_rate < 0.5', message: 'Low flow rate detected', severity: 'critical' },
            { condition: 'temperature > 75', message: 'High temp may cause bolting', severity: 'warning' }
          ]
        }
      ],
      equipment: ['LED Lights', 'NFT System', 'Nutrient Dosing', 'Climate Control'],
      estimatedDuration: 28,
      difficulty: 'beginner',
      tags: ['hydroponic', 'vertical-farming', 'leafy-greens'],
      createdBy: 'Vibelux Team',
      rating: 4.7,
      uses: 890
    });

    // Tomato - Dutch Greenhouse Method
    this.templates.set('tomato-dutch', {
      id: 'tomato-dutch',
      name: 'Tomato Dutch Greenhouse Method',
      description: 'High-wire tomato production using Dutch cultivation techniques',
      category: 'vegetables',
      cropType: 'Tomato',
      phases: [
        {
          name: 'Propagation',
          duration: 21,
          description: 'Seed to transplant-ready seedlings',
          environment: {
            temperature: { day: 75, night: 68 },
            humidity: { day: 75, night: 80 },
            co2: 400,
            lightIntensity: 150,
            photoperiod: 16
          },
          irrigation: {
            frequency: '2-3 times daily',
            amount: 'As needed',
            nutrients: {
              ec: 1.5,
              ph: 5.5,
              recipe: 'Tomato Seedling Mix'
            }
          },
          tasks: [
            { day: 1, name: 'Sow seeds', description: 'Plant in propagation trays', priority: 'high', estimatedTime: 45 },
            { day: 10, name: 'Transplant to blocks', description: 'Move to rockwool blocks', priority: 'high', estimatedTime: 120 },
            { day: 21, name: 'Pre-transplant prep', description: 'Harden off plants', priority: 'medium', estimatedTime: 30 }
          ],
          alerts: []
        },
        {
          name: 'Vegetative Growth',
          duration: 35,
          description: 'Establishment and early growth',
          environment: {
            temperature: { day: 73, night: 62 },
            humidity: { day: 70, night: 75 },
            co2: 800,
            lightIntensity: 400,
            photoperiod: 18
          },
          irrigation: {
            frequency: '6-10 times daily',
            amount: '100-200ml per event',
            nutrients: {
              ec: 2.5,
              ph: 5.8,
              recipe: 'Tomato Vegetative Formula'
            }
          },
          tasks: [
            { day: 1, name: 'Transplant to slabs', description: 'Plant in production media', priority: 'high', estimatedTime: 180 },
            { day: 7, name: 'Install support wires', description: 'Set up high-wire system', priority: 'high', estimatedTime: 240 },
            { day: 14, name: 'First lowering', description: 'Begin plant lowering routine', priority: 'medium', estimatedTime: 120 },
            { day: 21, name: 'Remove suckers', description: 'Prune side shoots', priority: 'medium', estimatedTime: 180 }
          ],
          alerts: [
            { condition: 'stem_growth < 15cm/week', message: 'Slow growth detected', severity: 'info' }
          ]
        },
        {
          name: 'Production',
          duration: 200,
          description: 'Continuous harvest phase',
          environment: {
            temperature: { day: 75, night: 64 },
            humidity: { day: 65, night: 70 },
            co2: 1000,
            lightIntensity: 600,
            photoperiod: 16
          },
          irrigation: {
            frequency: '8-16 times daily',
            amount: '150-300ml per event',
            nutrients: {
              ec: 3.0,
              ph: 5.8,
              recipe: 'Tomato Generative Formula'
            }
          },
          tasks: [
            { day: 7, name: 'Weekly maintenance', description: 'Lower plants, remove leaves, harvest', priority: 'high', estimatedTime: 480 },
            { day: 30, name: 'Plant balance check', description: 'Assess generative/vegetative balance', priority: 'medium', estimatedTime: 60 }
          ],
          alerts: [
            { condition: 'brix < 4.5', message: 'Low fruit quality detected', severity: 'warning' }
          ]
        }
      ],
      equipment: ['HPS/LED Lights', 'Heating System', 'CO2 System', 'High-Wire System'],
      estimatedDuration: 256,
      difficulty: 'advanced',
      tags: ['greenhouse', 'high-wire', 'year-round', 'commercial'],
      createdBy: 'Vibelux Team',
      rating: 4.9,
      uses: 567
    });

    // Basil - Continuous Harvest
    this.templates.set('basil-continuous', {
      id: 'basil-continuous',
      name: 'Basil Continuous Harvest',
      description: 'Perpetual harvest basil production system',
      category: 'herbs',
      cropType: 'Basil',
      phases: [
        {
          name: 'Establishment',
          duration: 21,
          description: 'From seed to first harvest',
          environment: {
            temperature: { day: 75, night: 68 },
            humidity: { day: 60, night: 65 },
            co2: 400,
            lightIntensity: 300,
            photoperiod: 16
          },
          irrigation: {
            frequency: '3-4 times daily',
            amount: '50-150ml per plant',
            nutrients: {
              ec: 1.5,
              ph: 6.0,
              recipe: 'Herb Vegetative Mix'
            }
          },
          tasks: [
            { day: 1, name: 'Direct seed', description: 'Sow seeds in final containers', priority: 'high', estimatedTime: 60 },
            { day: 14, name: 'Thin seedlings', description: 'Remove excess plants', priority: 'medium', estimatedTime: 45 },
            { day: 21, name: 'First pinch', description: 'Pinch tips to promote branching', priority: 'high', estimatedTime: 90 }
          ],
          alerts: []
        },
        {
          name: 'Production',
          duration: 60,
          description: 'Continuous harvest every 2 weeks',
          environment: {
            temperature: { day: 77, night: 70 },
            humidity: { day: 55, night: 60 },
            co2: 600,
            lightIntensity: 400,
            photoperiod: 14
          },
          irrigation: {
            frequency: '4-6 times daily',
            amount: '100-250ml per plant',
            nutrients: {
              ec: 2.0,
              ph: 6.0,
              recipe: 'Herb Production Mix'
            }
          },
          tasks: [
            { day: 14, name: 'Harvest', description: 'Cut stems above node pairs', priority: 'high', estimatedTime: 120 },
            { day: 28, name: 'Harvest', description: 'Second harvest round', priority: 'high', estimatedTime: 120 },
            { day: 42, name: 'Harvest & assess', description: 'Third harvest and plant health check', priority: 'high', estimatedTime: 150 }
          ],
          alerts: [
            { condition: 'flower_buds', message: 'Remove flower buds to maintain quality', severity: 'info' }
          ]
        }
      ],
      equipment: ['LED Lights', 'Ebb & Flow System', 'Climate Control'],
      estimatedDuration: 81,
      difficulty: 'beginner',
      tags: ['herbs', 'continuous-harvest', 'quick-turn'],
      createdBy: 'Vibelux Team',
      rating: 4.6,
      uses: 445
    });

    // General - IPM Program
    this.templates.set('general-ipm', {
      id: 'general-ipm',
      name: 'Integrated Pest Management Program',
      description: 'Comprehensive IPM schedule for any crop',
      category: 'general',
      phases: [
        {
          name: 'Prevention',
          duration: 7,
          description: 'Establish preventive measures',
          environment: {
            temperature: { day: 75, night: 68 },
            humidity: { day: 50, night: 55 },
            co2: 400,
            lightIntensity: 0,
            photoperiod: 0
          },
          irrigation: {
            frequency: 'N/A',
            amount: 'N/A',
            nutrients: {
              ec: 0,
              ph: 0,
              recipe: 'N/A'
            }
          },
          tasks: [
            { day: 1, name: 'Install sticky traps', description: 'Place yellow and blue sticky traps', priority: 'high', estimatedTime: 30 },
            { day: 2, name: 'Beneficial release', description: 'Release predatory mites', priority: 'high', estimatedTime: 45 },
            { day: 7, name: 'Baseline inspection', description: 'Document initial pest levels', priority: 'high', estimatedTime: 60 }
          ],
          alerts: []
        }
      ],
      equipment: ['Sticky Traps', 'Microscope', 'Spray Equipment'],
      estimatedDuration: 7,
      difficulty: 'intermediate',
      tags: ['ipm', 'pest-control', 'all-crops'],
      createdBy: 'Vibelux Team',
      rating: 4.5,
      uses: 2100
    });
  }
}
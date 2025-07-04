/**
 * VibeLux Automation Level Assessment
 * Based on OnePointOne Vertical Farming Automation Framework
 */

export interface AutomationCapability {
  level: number;
  name: string;
  description: string;
  categories: {
    coreCultivation: AutomationStatus;
    prePostGrowth: AutomationStatus;
    logisticsInspection: AutomationStatus;
    maintenanceServicing: AutomationStatus;
    marketIntelligence: AutomationStatus;
  };
  currentBarriers: string[];
  nextSteps: string[];
}

export interface AutomationStatus {
  status: 'not_implemented' | 'partial' | 'implemented' | 'advanced';
  capabilities: string[];
  vibeluxFeatures: string[];
  gaps: string[];
}

export class VibeLuxAutomationAssessment {
  private currentCapabilities: Map<number, AutomationCapability>;

  constructor() {
    this.currentCapabilities = new Map();
    this.initializeAssessment();
  }

  public getCurrentLevel(): number {
    // Return highest fully implemented level
    for (let level = 6; level >= 1; level--) {
      const capability = this.currentCapabilities.get(level);
      if (capability && this.isLevelFullyImplemented(capability)) {
        return level;
      }
    }
    return 1;
  }

  public getDetailedAssessment(): AutomationCapability[] {
    return Array.from(this.currentCapabilities.values()).sort((a, b) => a.level - b.level);
  }

  public getRoadmapToLevel(targetLevel: number): {
    currentLevel: number;
    targetLevel: number;
    requiredDevelopments: string[];
    estimatedTimeMonths: number;
    priorityOrder: string[];
  } {
    const currentLevel = this.getCurrentLevel();
    const requiredDevelopments: string[] = [];
    const priorityOrder: string[] = [];

    for (let level = currentLevel + 1; level <= targetLevel; level++) {
      const capability = this.currentCapabilities.get(level);
      if (capability) {
        requiredDevelopments.push(...capability.nextSteps);
        priorityOrder.push(...capability.currentBarriers);
      }
    }

    return {
      currentLevel,
      targetLevel,
      requiredDevelopments: [...new Set(requiredDevelopments)],
      estimatedTimeMonths: (targetLevel - currentLevel) * 6, // 6 months per level
      priorityOrder: [...new Set(priorityOrder)]
    };
  }

  private initializeAssessment(): void {
    // Level 1: No Automation
    this.currentCapabilities.set(1, {
      level: 1,
      name: 'No automation',
      description: 'All processes within the vertical farm are managed by human decision-making and labor',
      categories: {
        coreCultivation: {
          status: 'implemented',
          capabilities: ['Manual environmental monitoring', 'Human decision-making'],
          vibeluxFeatures: ['Manual dashboard monitoring', 'Basic sensor readings'],
          gaps: []
        },
        prePostGrowth: {
          status: 'implemented',
          capabilities: ['Manual seeding', 'Manual harvesting'],
          vibeluxFeatures: ['Manual tracking systems', 'Basic inventory'],
          gaps: []
        },
        logisticsInspection: {
          status: 'implemented',
          capabilities: ['Visual inspection', 'Manual quality control'],
          vibeluxFeatures: ['Photo documentation', 'Manual logs'],
          gaps: []
        },
        maintenanceServicing: {
          status: 'implemented',
          capabilities: ['Scheduled maintenance', 'Reactive repairs'],
          vibeluxFeatures: ['Maintenance scheduling', 'Issue tracking'],
          gaps: []
        },
        marketIntelligence: {
          status: 'implemented',
          capabilities: ['Manual market research', 'Basic reporting'],
          vibeluxFeatures: ['Sales reporting', 'Cost tracking'],
          gaps: []
        }
      },
      currentBarriers: [],
      nextSteps: ['Implement basic growth automation']
    });

    // Level 2: Basic Growth Automation  
    this.currentCapabilities.set(2, {
      level: 2,
      name: 'Basic growth automation',
      description: 'All subsystems that relate directly to plant life support can maintain cycles and set points without human input',
      categories: {
        coreCultivation: {
          status: 'implemented',
          capabilities: ['Automated lighting cycles', 'Climate control', 'Irrigation scheduling'],
          vibeluxFeatures: [
            'Smart lighting controller with photoperiod automation',
            'HVAC integration with temperature/humidity control',
            'Automated irrigation with EC/pH monitoring',
            'Environmental data logging and alerts'
          ],
          gaps: []
        },
        prePostGrowth: {
          status: 'partial',
          capabilities: ['Manual seeding', 'Manual harvesting'],
          vibeluxFeatures: ['Seed tracking', 'Harvest scheduling'],
          gaps: ['Automated seeding systems', 'Robotic harvesting']
        },
        logisticsInspection: {
          status: 'partial',
          capabilities: ['Scheduled inspections'],
          vibeluxFeatures: ['Inspection reminders', 'Photo capture'],
          gaps: ['Automated image analysis']
        },
        maintenanceServicing: {
          status: 'partial',
          capabilities: ['Preventive maintenance schedules'],
          vibeluxFeatures: ['Equipment monitoring', 'Maintenance tracking'],
          gaps: ['Predictive maintenance']
        },
        marketIntelligence: {
          status: 'partial',
          capabilities: ['Basic analytics'],
          vibeluxFeatures: ['Yield tracking', 'Cost analysis'],
          gaps: ['Market prediction', 'Price optimization']
        }
      },
      currentBarriers: [],
      nextSteps: ['Implement conveyor automation', 'Add basic robotics']
    });

    // Level 3: Conveyor Automation
    this.currentCapabilities.set(3, {
      level: 3,
      name: 'Conveyor automation',
      description: 'The start and end phases of the plant\'s life cycle are automated using non-intelligent machines',
      categories: {
        coreCultivation: {
          status: 'implemented',
          capabilities: ['Advanced environmental control', 'Nutrient automation'],
          vibeluxFeatures: [
            'Physics-informed RL engine for environmental optimization',
            'Automated nutrient dosing with real-time adjustments',
            'Multi-zone climate control with VPD optimization',
            'CO2 injection based on growth stage and light levels'
          ],
          gaps: []
        },
        prePostGrowth: {
          status: 'implemented',
          capabilities: ['Automated seeding', 'Automated harvesting', 'Packaging systems'],
          vibeluxFeatures: [
            'Seed planting automation with precision placement',
            'Harvest timing optimization based on plant analysis',
            'Automated packaging with quality sorting',
            'Batch tracking through entire lifecycle'
          ],
          gaps: []
        },
        logisticsInspection: {
          status: 'implemented',
          capabilities: ['Basic computer vision', 'Quality sorting'],
          vibeluxFeatures: [
            'Computer vision for plant health monitoring',
            'Automated quality grading and sorting',
            'Defect detection and removal systems',
            'Packaging automation with weight verification'
          ],
          gaps: []
        },
        maintenanceServicing: {
          status: 'partial',
          capabilities: ['Automated cleaning cycles'],
          vibeluxFeatures: ['Cleaning schedules', 'System status monitoring'],
          gaps: ['Self-diagnostic systems', 'Automated repairs']
        },
        marketIntelligence: {
          status: 'partial',
          capabilities: ['Data collection'],
          vibeluxFeatures: ['Analytics dashboard', 'Yield predictions'],
          gaps: ['Market intelligence', 'Dynamic pricing']
        }
      },
      currentBarriers: ['Limited maintenance automation', 'Basic market intelligence'],
      nextSteps: ['Implement adaptive plant monitoring', 'Add predictive maintenance']
    });

    // Level 4: Adaptive Automation - CURRENT TARGET
    this.currentCapabilities.set(4, {
      level: 4,
      name: 'Adaptive automation',
      description: 'Humans have no physical interactions with the plants, which are moved, fed, monitored and inspected by machines and computers able to adaptively respond to plant needs',
      categories: {
        coreCultivation: {
          status: 'implemented',
          capabilities: ['AI-driven environmental control', 'Adaptive nutrient management'],
          vibeluxFeatures: [
            'Physics-informed RL engine with adaptive learning',
            'Real-time digital twin with predictive modeling',
            'Automated environmental responses to plant stress',
            'Claude AI integration for intelligent decision making',
            'Multi-objective optimization (yield, quality, efficiency)'
          ],
          gaps: []
        },
        prePostGrowth: {
          status: 'implemented', 
          capabilities: ['Intelligent seeding', 'Adaptive harvesting'],
          vibeluxFeatures: [
            'AI-optimized seeding based on market demand',
            'Computer vision-guided selective harvesting',
            'Adaptive packaging based on quality metrics',
            'Intelligent storage and logistics optimization'
          ],
          gaps: []
        },
        logisticsInspection: {
          status: 'implemented',
          capabilities: ['Advanced phenotyping', 'Predictive quality assessment'],
          vibeluxFeatures: [
            'Advanced computer vision with LAI, biomass estimation',
            'Multi-spectral imaging for stress detection',
            'Nutrient deficiency analysis through leaf color',
            'Harvest readiness prediction with quality scoring',
            'Automated plant movement and inspection systems'
          ],
          gaps: []
        },
        maintenanceServicing: {
          status: 'partial',
          capabilities: ['Predictive maintenance', 'Self-diagnosis'],
          vibeluxFeatures: [
            'Equipment health monitoring with anomaly detection',
            'Predictive failure analysis using sensor data',
            'Automated maintenance scheduling'
          ],
          gaps: ['Automated repair robots', 'Self-healing systems']
        },
        marketIntelligence: {
          status: 'partial',
          capabilities: ['Market analysis', 'Demand prediction'],
          vibeluxFeatures: [
            'Yield forecasting with market integration',
            'Price optimization algorithms',
            'Demand-driven production planning'
          ],
          gaps: ['Real-time market integration', 'Dynamic crop selection']
        }
      },
      currentBarriers: [
        'Automated maintenance robotics not fully implemented',
        'Limited real-time market intelligence integration'
      ],
      nextSteps: [
        'Implement autonomous maintenance robots',
        'Integrate real-time market data feeds',
        'Develop self-healing system capabilities'
      ]
    });

    // Level 5: System Automation
    this.currentCapabilities.set(5, {
      level: 5,
      name: 'System automation',
      description: 'Humans are only responsible for defining the outputs of the self-sufficient system; all farm operations are automated, including required input refills, servicing and maintenance operations',
      categories: {
        coreCultivation: {
          status: 'advanced',
          capabilities: ['Fully autonomous environmental management'],
          vibeluxFeatures: [
            'Self-optimizing environmental systems',
            'Autonomous resource management',
            'Continuous learning from all facilities'
          ],
          gaps: []
        },
        prePostGrowth: {
          status: 'advanced',
          capabilities: ['Fully autonomous production cycle'],
          vibeluxFeatures: [
            'Autonomous seeding, growing, harvesting cycle',
            'Self-optimizing production schedules'
          ],
          gaps: []
        },
        logisticsInspection: {
          status: 'advanced',
          capabilities: ['Autonomous quality control', 'Self-inspection'],
          vibeluxFeatures: [
            'Fully automated inspection and quality systems',
            'Self-monitoring production quality'
          ],
          gaps: []
        },
        maintenanceServicing: {
          status: 'not_implemented',
          capabilities: ['Fully autonomous maintenance'],
          vibeluxFeatures: [],
          gaps: [
            'Autonomous repair robots',
            'Self-healing system architecture',
            'Automated supply chain management',
            'Robotic facility maintenance'
          ]
        },
        marketIntelligence: {
          status: 'partial',
          capabilities: ['Autonomous market response'],
          vibeluxFeatures: ['Market-driven production optimization'],
          gaps: ['Fully autonomous market operations']
        }
      },
      currentBarriers: [
        'No autonomous maintenance robotics',
        'Limited autonomous repair capabilities',
        'Requires significant robotics infrastructure investment'
      ],
      nextSteps: [
        'Develop autonomous maintenance robot fleet',
        'Implement self-healing infrastructure',
        'Create autonomous supply chain management'
      ]
    });

    // Level 6: Full Automation
    this.currentCapabilities.set(6, {
      level: 6,
      name: 'Full automation',
      description: 'The only humans involved are customers; farm responds automatically to the demand of the market, and coordinates logistics and delivery without human decision-making and labor',
      categories: {
        coreCultivation: {
          status: 'not_implemented',
          capabilities: ['Fully autonomous market-responsive cultivation'],
          vibeluxFeatures: [],
          gaps: ['Market-demand responsive cultivation', 'Autonomous crop selection']
        },
        prePostGrowth: {
          status: 'not_implemented',
          capabilities: ['Market-demand driven production'],
          vibeluxFeatures: [],
          gaps: ['Autonomous market-driven planning']
        },
        logisticsInspection: {
          status: 'not_implemented',
          capabilities: ['Autonomous customer delivery'],
          vibeluxFeatures: [],
          gaps: ['Autonomous logistics and delivery']
        },
        maintenanceServicing: {
          status: 'not_implemented',
          capabilities: ['Fully autonomous facility management'],
          vibeluxFeatures: [],
          gaps: ['Complete facility self-management']
        },
        marketIntelligence: {
          status: 'not_implemented',
          capabilities: ['Autonomous market participation'],
          vibeluxFeatures: [],
          gaps: [
            'Real-time market API integration',
            'Autonomous pricing and sales',
            'Direct customer delivery systems',
            'Autonomous business operations'
          ]
        }
      },
      currentBarriers: [
        'Requires full robotics automation',
        'Market integration not implemented',
        'Delivery automation not available',
        'Regulatory constraints on autonomous business operations'
      ],
      nextSteps: [
        'Long-term vision requiring substantial infrastructure',
        'Regulatory framework development needed',
        'Full logistics automation required'
      ]
    });
  }

  private isLevelFullyImplemented(capability: AutomationCapability): boolean {
    const categories = Object.values(capability.categories);
    return categories.every(cat => 
      cat.status === 'implemented' || cat.status === 'advanced'
    );
  }

  public getCompetitorComparison(): {
    vibelux: number;
    competitors: { name: string; level: number; strengths: string[] }[];
  } {
    return {
      vibelux: this.getCurrentLevel(),
      competitors: [
        {
          name: 'Team Koala/Koidra',
          level: 4,
          strengths: [
            'Physics-informed RL (similar to VibeLux)',
            'Commercial greenhouse deployments',
            'Proven ROI in tomato production'
          ]
        },
        {
          name: 'Priva',
          level: 3,
          strengths: [
            'Established HVAC automation',
            'Strong European market presence',
            'Integrated climate solutions'
          ]
        },
        {
          name: 'Autogrow',
          level: 3,
          strengths: [
            'Wireless sensor networks',
            'Easy installation and setup',
            'Strong mobile app interface'
          ]
        },
        {
          name: 'Argus Controls',
          level: 3,
          strengths: [
            'Mature environmental control',
            'Reliable hardware systems',
            'Wide industry adoption'
          ]
        }
      ]
    };
  }
}

// Export singleton instance
export const vibeluxAutomationAssessment = new VibeLuxAutomationAssessment();
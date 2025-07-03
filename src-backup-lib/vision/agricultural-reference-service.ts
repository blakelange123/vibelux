// Agricultural Reference Service
// Educational tool for identifying common issues - NOT automated monitoring
// Uses established APIs to avoid patent conflicts

interface DiseaseReference {
  name: string;
  symptoms: string[];
  generalTreatments: string[];
  preventionTips: string[];
  educationalLinks: string[];
}

export class AgriculturalReferenceService {
  private kindwiseApiKey: string;
  
  constructor() {
    this.kindwiseApiKey = process.env.KINDWISE_API_KEY || '';
  }
  
  // Educational reference lookup - user-initiated, not automated
  async lookupSymptoms(imageUrl: string, userDescription: string): Promise<{
    possibleIssues: DiseaseReference[];
    generalAdvice: string[];
    disclaimer: string;
  }> {
    // Option 1: Use Kindwise API (commercial, patent-safe)
    if (this.kindwiseApiKey) {
      return this.lookupWithKindwise(imageUrl, userDescription);
    }
    
    // Option 2: Use Claude for general agricultural advice
    return this.lookupWithClaude(imageUrl, userDescription);
  }
  
  private async lookupWithKindwise(imageUrl: string, description: string): Promise<any> {
    try {
      // Call Kindwise crop.health API
      const response = await fetch('https://api.kindwise.com/v1/crop/health', {
        method: 'POST',
        headers: {
          'Api-Key': this.kindwiseApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: [imageUrl],
          crop: 'cannabis', // or user-specified crop
          include_disease_description: true,
          include_cause: true
        })
      });
      
      const result = await response.json();
      
      // Format as educational reference, not diagnosis
      return {
        possibleIssues: result.diseases?.map((d: any) => ({
          name: d.name,
          symptoms: d.description ? [d.description] : [],
          generalTreatments: d.treatment || [],
          preventionTips: d.prevention || [],
          educationalLinks: []
        })) || [],
        generalAdvice: [
          'This is educational information only',
          'Consult with a qualified agronomist for specific advice',
          'Local regulations may affect treatment options'
        ],
        disclaimer: 'This tool provides general agricultural information and should not be used as the sole basis for crop management decisions.'
      };
    } catch (error) {
      console.error('Kindwise API error:', error);
      return this.getFallbackResponse();
    }
  }
  
  private async lookupWithClaude(imageUrl: string, description: string): Promise<any> {
    // Use Claude as a general agricultural reference
    // Careful to frame as educational, not diagnostic
    
    const prompt = `
      As an agricultural reference guide, provide general information about plant health issues 
      that might cause the symptoms described: "${description}". 
      
      Please provide:
      1. Common issues that cause these symptoms
      2. General prevention tips
      3. Basic care recommendations
      
      This is for educational purposes only. Do not provide specific diagnoses or treatment plans.
    `;
    
    // Call Claude API here
    
    return {
      possibleIssues: [],
      generalAdvice: [
        'Review general plant care guidelines',
        'Ensure proper environmental conditions',
        'Consider consulting with local agricultural extension services'
      ],
      disclaimer: 'This is general agricultural information for educational purposes only.'
    };
  }
  
  // Reference library - static educational content
  async getCommonIssuesReference(): Promise<{
    categories: Array<{
      name: string;
      commonIssues: DiseaseReference[];
    }>;
  }> {
    return {
      categories: [
        {
          name: 'Environmental Stress',
          commonIssues: [
            {
              name: 'Heat Stress',
              symptoms: ['Wilting', 'Leaf curl', 'Brown edges'],
              generalTreatments: ['Improve ventilation', 'Adjust temperature'],
              preventionTips: ['Monitor temperature regularly', 'Ensure proper air flow'],
              educationalLinks: ['https://extension.edu/heat-stress-plants']
            }
          ]
        },
        {
          name: 'Nutrient Issues',
          commonIssues: [
            {
              name: 'General Nutrient Deficiency',
              symptoms: ['Yellowing leaves', 'Slow growth'],
              generalTreatments: ['Review feeding schedule', 'Check pH levels'],
              preventionTips: ['Regular soil/media testing', 'Balanced nutrition'],
              educationalLinks: ['https://extension.edu/plant-nutrition']
            }
          ]
        }
      ]
    };
  }
  
  // IPM Educational Resources - Not automated detection
  async getIPMResources(): Promise<{
    preventionStrategies: string[];
    culturalControls: string[];
    biologicalControls: string[];
    resources: Array<{
      title: string;
      url: string;
      type: 'guide' | 'video' | 'course';
    }>;
  }> {
    return {
      preventionStrategies: [
        'Maintain clean growing areas',
        'Quarantine new plants',
        'Regular scouting schedules',
        'Proper plant spacing'
      ],
      culturalControls: [
        'Optimize environmental conditions',
        'Remove plant debris',
        'Rotate cultivation areas',
        'Use resistant varieties'
      ],
      biologicalControls: [
        'Beneficial insects',
        'Microbial inoculants',
        'Companion planting',
        'Natural predators'
      ],
      resources: [
        {
          title: 'IPM Principles for Controlled Environment Agriculture',
          url: 'https://extension.edu/ipm-basics',
          type: 'guide'
        },
        {
          title: 'Biological Control in Greenhouses',
          url: 'https://biocontrol.edu/greenhouse',
          type: 'course'
        }
      ]
    };
  }
  
  private getFallbackResponse(): any {
    return {
      possibleIssues: [],
      generalAdvice: [
        'Unable to process image at this time',
        'Consider manual inspection',
        'Consult with agricultural professionals'
      ],
      disclaimer: 'Service temporarily unavailable. Please try again later.'
    };
  }
}

// Compliance Photo Documentation - For record keeping only
export class CompliancePhotoService {
  // Simple photo documentation for compliance records
  // No automated counting or tracking
  async documentForCompliance(imageUrl: string, metadata: {
    location: string;
    purpose: 'inspection' | 'incident' | 'maintenance' | 'training';
    description: string;
    takenBy: string;
  }): Promise<{
    recordId: string;
    timestamp: Date;
    stored: boolean;
    metadata: any;
  }> {
    const recordId = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simple storage for compliance documentation
    // No analysis or automated processing
    
    return {
      recordId,
      timestamp: new Date(),
      stored: true,
      metadata: {
        ...metadata,
        imageUrl,
        purpose: metadata.purpose,
        disclaimer: 'Photo stored for compliance documentation only'
      }
    };
  }
  
  // Manual counting helper - requires human verification
  async assistManualCount(imageUrl: string): Promise<{
    instructions: string[];
    template: {
      date: Date;
      countedBy: string;
      roomId: string;
      counts: {
        immature: number;
        mature: number;
        total: number;
      };
      verified: boolean;
      notes: string;
    };
  }> {
    return {
      instructions: [
        'Manually count all plants visible in the image',
        'Categorize as immature (vegetative) or mature (flowering)',
        'Record counts in the template below',
        'Have a second person verify the count',
        'Save this record for compliance'
      ],
      template: {
        date: new Date(),
        countedBy: '',
        roomId: '',
        counts: {
          immature: 0,
          mature: 0,
          total: 0
        },
        verified: false,
        notes: ''
      }
    };
  }
}

// Export service instances
export const agriculturalReferenceService = new AgriculturalReferenceService();
export const compliancePhotoService = new CompliancePhotoService();
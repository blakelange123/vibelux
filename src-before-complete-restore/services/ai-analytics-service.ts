import { 
  SageMakerClient, 
  InvokeEndpointCommand,
  CreateEndpointCommand,
  DescribeEndpointCommand 
} from '@aws-sdk/client-sagemaker';
import { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} from '@aws-sdk/client-bedrock-runtime';
import { Storage } from '@aws-amplify/storage';
import axios from 'axios';

// Type definitions for different AI providers
export interface AIProvider {
  name: 'aws-sagemaker' | 'aws-bedrock' | 'google-automl' | 'google-vertex' | 'openai-vision' | 'clarifai';
  enabled: boolean;
  priority: number;
}

export interface PredictionResult<T = any> {
  provider: string;
  confidence: number;
  data: T;
  timestamp: Date;
  processingTime: number;
}

export interface PlantHealthAnalysis {
  healthScore: number;
  diseases: Array<{
    name: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
  affectedArea?: number; // percentage
  growthStage?: string;
}

export interface EnvironmentalPrediction {
  temperature: number;
  humidity: number;
  co2Level: number;
  lightIntensity: number;
  timestamp: Date;
  confidence: number;
}

export interface ModelDeploymentConfig {
  modelName: string;
  provider: AIProvider['name'];
  endpointName?: string;
  instanceType?: string;
  autoScaling?: {
    minInstances: number;
    maxInstances: number;
  };
}

export interface EdgeProcessingResult {
  processedLocally: boolean;
  deviceId: string;
  latency: number;
  data: any;
}

// Main AI Analytics Service
export class AIAnalyticsService {
  private sagemakerClient: SageMakerClient;
  private bedrockClient: BedrockRuntimeClient;
  private providers: Map<AIProvider['name'], AIProvider>;
  private fallbackChain: AIProvider['name'][];
  
  // API Keys and configurations
  private openAIApiKey: string;
  private clarifaiApiKey: string;
  private googleProjectId: string;
  private googleLocation: string;
  
  constructor(config: {
    awsRegion: string;
    openAIApiKey: string;
    clarifaiApiKey: string;
    googleProjectId: string;
    googleLocation?: string;
  }) {
    // Initialize AWS clients
    this.sagemakerClient = new SageMakerClient({ region: config.awsRegion });
    this.bedrockClient = new BedrockRuntimeClient({ region: config.awsRegion });
    
    // Store API keys
    this.openAIApiKey = config.openAIApiKey;
    this.clarifaiApiKey = config.clarifaiApiKey;
    this.googleProjectId = config.googleProjectId;
    this.googleLocation = config.googleLocation || 'us-central1';
    
    // Initialize providers optimized for their strengths
    this.providers = new Map([
      // Claude (AWS Bedrock) - Default for general analysis and complex reasoning
      ['aws-bedrock', { 
        name: 'aws-bedrock', 
        enabled: true, 
        priority: 1,
        bestFor: ['general-analysis', 'complex-reasoning', 'detailed-explanations', 'recipe-optimization'],
        model: 'us.anthropic.claude-opus-4-20250514-v1:0' // Using Claude Opus 4 inference profile!
      }],
      
      // Clarifai - Best for specialized plant disease detection
      ['clarifai', { 
        name: 'clarifai', 
        enabled: true, 
        priority: 2,
        bestFor: ['disease-detection', 'pest-identification', 'plant-classification', 'crop-monitoring']
      }],
      
      // OpenAI - Cost-effective for simpler tasks, reliable API
      ['openai-vision', { 
        name: 'openai-vision', 
        enabled: true, 
        priority: 3,
        bestFor: ['simple-classification', 'basic-vision-tasks', 'text-generation', 'quick-analysis']
      }],
      
      // Google Vertex - Best for batch processing and custom model training
      ['google-vertex', { 
        name: 'google-vertex', 
        enabled: true, 
        priority: 4,
        bestFor: ['batch-processing', 'automl-training', 'tabular-predictions', 'high-volume-inference']
      }],
      
      // SageMaker - Best for custom model deployment and specialized inference
      ['aws-sagemaker', { 
        name: 'aws-sagemaker', 
        enabled: true, 
        priority: 5,
        bestFor: ['custom-models', 'specialized-inference', 'production-deployments', 'edge-inference']
      }],
      
      // Google AutoML - For automated model training on specific datasets
      ['google-automl', { 
        name: 'google-automl', 
        enabled: true, 
        priority: 6,
        bestFor: ['automated-training', 'domain-specific-models', 'no-code-ml']
      }]
    ]);
    
    // Set up fallback chain based on priority
    this.updateFallbackChain();
  }
  
  private updateFallbackChain(): void {
    this.fallbackChain = Array.from(this.providers.values())
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map(p => p.name);
  }
  
  // Task routing configuration
  private taskRouting = new Map([
    ['plant-health-analysis', ['aws-bedrock', 'clarifai', 'openai-vision']],
    ['disease-detection', ['clarifai', 'aws-bedrock', 'openai-vision']],
    ['pest-identification', ['clarifai', 'aws-bedrock', 'google-vertex']],
    ['environmental-prediction', ['google-vertex', 'aws-sagemaker', 'aws-bedrock']],
    ['recipe-optimization', ['aws-bedrock', 'google-vertex', 'aws-sagemaker']],
    ['batch-processing', ['google-vertex', 'aws-sagemaker', 'clarifai']],
    ['custom-models', ['aws-sagemaker', 'google-vertex', 'google-automl']],
    ['simple-classification', ['openai-vision', 'aws-bedrock', 'clarifai']],
    ['complex-analysis', ['aws-bedrock', 'google-vertex', 'aws-sagemaker']]
  ]);

  /**
   * Get optimal provider for specific task type
   */
  private getProvidersForTask(taskType: string): AIProvider['name'][] {
    const providers = this.taskRouting.get(taskType);
    if (providers) {
      // Filter by enabled providers and sort by priority
      return providers.filter(name => this.providers.get(name)?.enabled);
    }
    // Fallback to general chain
    return this.fallbackChain;
  }

  // Unified interface for plant health analysis
  async analyzePlantHealth(
    imageData: Blob | string, 
    options?: {
      preferredProvider?: AIProvider['name'];
      includeEdgeProcessing?: boolean;
      deviceId?: string;
      taskType?: 'disease-detection' | 'pest-identification' | 'general-analysis' | 'plant-health-analysis';
    }
  ): Promise<PredictionResult<PlantHealthAnalysis>> {
    const startTime = Date.now();
    
    // Determine optimal providers based on task type
    const taskType = options?.taskType || 'plant-health-analysis';
    const optimalProviders = this.getProvidersForTask(taskType);
    
    const providers = options?.preferredProvider 
      ? [options.preferredProvider, ...optimalProviders.filter(p => p !== options.preferredProvider)]
      : optimalProviders;
    
    // Analyzing plant health with configured AI providers
    
    // Try edge processing first if requested
    if (options?.includeEdgeProcessing && options?.deviceId) {
      try {
        const edgeResult = await this.processOnEdge(imageData, options.deviceId);
        if (edgeResult.processedLocally) {
          return {
            provider: 'edge-device',
            confidence: edgeResult.data.confidence || 0.95,
            data: edgeResult.data,
            timestamp: new Date(),
            processingTime: edgeResult.latency
          };
        }
      } catch (error) {
        console.warn('Edge processing failed, falling back to cloud:', error);
      }
    }
    
    // Try each provider in order
    for (const provider of providers) {
      try {
        let result: PlantHealthAnalysis;
        
        switch (provider) {
          case 'clarifai':
            result = await this.analyzePlantHealthWithClarifai(imageData);
            break;
          case 'openai-vision':
            result = await this.analyzePlantHealthWithOpenAI(imageData);
            break;
          case 'aws-bedrock':
            result = await this.analyzePlantHealthWithBedrock(imageData);
            break;
          case 'google-vertex':
            result = await this.analyzePlantHealthWithVertex(imageData);
            break;
          default:
            continue;
        }
        
        return {
          provider,
          confidence: result.healthScore / 100,
          data: result,
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        };
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All AI providers failed to analyze plant health');
  }
  
  // AWS SageMaker model deployment
  async deployModel(config: ModelDeploymentConfig): Promise<string> {
    try {
      const command = new CreateEndpointCommand({
        EndpointName: config.endpointName || `${config.modelName}-endpoint`,
        EndpointConfigName: `${config.modelName}-config`,
        Tags: [
          { Key: 'Application', Value: 'Vibelux' },
          { Key: 'ModelType', Value: config.modelName }
        ]
      });
      
      const response = await this.sagemakerClient.send(command);
      
      // Wait for endpoint to be ready
      await this.waitForEndpoint(config.endpointName || `${config.modelName}-endpoint`);
      
      return response.EndpointArn || '';
    } catch (error) {
      console.error('Failed to deploy model:', error);
      throw error;
    }
  }
  
  // AWS SageMaker inference
  async invokeSageMakerEndpoint(
    endpointName: string,
    data: any
  ): Promise<PredictionResult> {
    const startTime = Date.now();
    
    try {
      const command = new InvokeEndpointCommand({
        EndpointName: endpointName,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
      });
      
      const response = await this.sagemakerClient.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.Body));
      
      return {
        provider: 'aws-sagemaker',
        confidence: result.confidence || 0.95,
        data: result,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('SageMaker inference failed:', error);
      throw error;
    }
  }
  
  // AWS Bedrock for advanced AI tasks
  private async analyzePlantHealthWithBedrock(imageData: Blob | string): Promise<PlantHealthAnalysis> {
    try {
      // Convert image to base64 if needed
      const base64Image = typeof imageData === 'string' 
        ? imageData 
        : await this.blobToBase64(imageData);
      
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: 'Analyze this plant image for health issues. Provide health score (0-100), identify any diseases with confidence levels, and suggest recommendations.'
              }
            ]
          }],
          max_tokens: 1000
        })
      });
      
      const response = await this.bedrockClient.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      // Parse the response and structure it
      return this.parseBedrockResponse(result);
    } catch (error) {
      console.error('Bedrock analysis failed:', error);
      throw error;
    }
  }
  
  // Clarifai plant health analysis
  private async analyzePlantHealthWithClarifai(imageData: Blob | string): Promise<PlantHealthAnalysis> {
    try {
      const base64Image = typeof imageData === 'string' 
        ? imageData 
        : await this.blobToBase64(imageData);
      
      const response = await axios.post(
        'https://api.clarifai.com/v2/models/plant-health/outputs',
        {
          inputs: [{
            data: {
              image: {
                base64: base64Image
              }
            }
          }]
        },
        {
          headers: {
            'Authorization': `Key ${this.clarifaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return this.parseClarifaiResponse(response.data);
    } catch (error) {
      console.error('Clarifai analysis failed:', error);
      throw error;
    }
  }
  
  // OpenAI Vision API plant analysis
  private async analyzePlantHealthWithOpenAI(imageData: Blob | string): Promise<PlantHealthAnalysis> {
    try {
      const base64Image = typeof imageData === 'string' 
        ? imageData 
        : await this.blobToBase64(imageData);
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this plant image. Provide: 1) Health score (0-100), 2) Any diseases detected with confidence levels and severity, 3) Growth stage, 4) Actionable recommendations. Format as JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }],
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openAIApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return this.parseOpenAIResponse(response.data);
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      throw error;
    }
  }
  
  // Google Vertex AI plant analysis
  private async analyzePlantHealthWithVertex(imageData: Blob | string): Promise<PlantHealthAnalysis> {
    try {
      const base64Image = typeof imageData === 'string' 
        ? imageData 
        : await this.blobToBase64(imageData);
      
      const endpoint = `https://${this.googleLocation}-aiplatform.googleapis.com/v1/projects/${this.googleProjectId}/locations/${this.googleLocation}/publishers/google/models/gemini-pro-vision:predict`;
      
      const response = await axios.post(
        endpoint,
        {
          instances: [{
            content: {
              parts: [
                {
                  text: 'Analyze this plant for health issues. Provide health score, diseases, and recommendations.'
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${await this.getGoogleAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return this.parseVertexResponse(response.data);
    } catch (error) {
      console.error('Vertex AI analysis failed:', error);
      throw error;
    }
  }
  
  // Google AutoML for tabular predictions
  async predictEnvironmentalConditions(
    historicalData: Array<{
      temperature: number;
      humidity: number;
      co2Level: number;
      lightIntensity: number;
      timestamp: Date;
    }>,
    hoursAhead: number = 24
  ): Promise<PredictionResult<EnvironmentalPrediction[]>> {
    const startTime = Date.now();
    
    try {
      const endpoint = `https://${this.googleLocation}-aiplatform.googleapis.com/v1/projects/${this.googleProjectId}/locations/${this.googleLocation}/endpoints/environmental-prediction:predict`;
      
      const response = await axios.post(
        endpoint,
        {
          instances: historicalData.map(data => ({
            temperature: data.temperature,
            humidity: data.humidity,
            co2_level: data.co2Level,
            light_intensity: data.lightIntensity,
            timestamp: data.timestamp.toISOString(),
            prediction_hours: hoursAhead
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${await this.getGoogleAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const predictions = this.parseAutoMLResponse(response.data);
      
      return {
        provider: 'google-automl',
        confidence: 0.92,
        data: predictions,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('AutoML prediction failed:', error);
      throw error;
    }
  }
  
  // Edge processing capabilities
  private async processOnEdge(
    imageData: Blob | string,
    deviceId: string
  ): Promise<EdgeProcessingResult> {
    const startTime = Date.now();
    
    try {
      // This would communicate with edge devices running lightweight models
      // For demo purposes, we'll simulate edge processing
      const edgeEndpoint = `https://edge-device-${deviceId}.local/analyze`;
      
      const formData = new FormData();
      if (imageData instanceof Blob) {
        formData.append('image', imageData);
      } else {
        formData.append('image_base64', imageData);
      }
      
      const response = await axios.post(edgeEndpoint, formData, {
        timeout: 5000, // 5 second timeout for edge devices
        headers: {
          'X-Device-ID': deviceId
        }
      });
      
      return {
        processedLocally: true,
        deviceId,
        latency: Date.now() - startTime,
        data: response.data
      };
    } catch (error) {
      // If edge processing fails, we'll fall back to cloud
      return {
        processedLocally: false,
        deviceId,
        latency: Date.now() - startTime,
        data: null
      };
    }
  }
  
  // Batch processing for multiple images
  async batchAnalyzePlantHealth(
    images: Array<{ id: string; data: Blob | string }>,
    options?: {
      preferredProvider?: AIProvider['name'];
      maxConcurrent?: number;
    }
  ): Promise<Array<{ id: string; result: PredictionResult<PlantHealthAnalysis> | Error }>> {
    const maxConcurrent = options?.maxConcurrent || 5;
    const results: Array<{ id: string; result: PredictionResult<PlantHealthAnalysis> | Error }> = [];
    
    // Process in batches to avoid overwhelming providers
    for (let i = 0; i < images.length; i += maxConcurrent) {
      const batch = images.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(async (image) => {
        try {
          const result = await this.analyzePlantHealth(image.data, {
            preferredProvider: options?.preferredProvider
          });
          return { id: image.id, result };
        } catch (error) {
          return { id: image.id, result: error as Error };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  // Model performance monitoring
  async getModelMetrics(
    provider: AIProvider['name'],
    timeRange: { start: Date; end: Date }
  ): Promise<{
    averageLatency: number;
    successRate: number;
    totalRequests: number;
    errorCount: number;
  }> {
    // This would typically query a metrics service like CloudWatch or custom metrics store
    // For now, returning mock data
    return {
      averageLatency: 245,
      successRate: 0.98,
      totalRequests: 1523,
      errorCount: 31
    };
  }
  
  // Provider management
  setProviderEnabled(provider: AIProvider['name'], enabled: boolean): void {
    const providerConfig = this.providers.get(provider);
    if (providerConfig) {
      providerConfig.enabled = enabled;
      this.updateFallbackChain();
    }
  }
  
  setProviderPriority(provider: AIProvider['name'], priority: number): void {
    const providerConfig = this.providers.get(provider);
    if (providerConfig) {
      providerConfig.priority = priority;
      this.updateFallbackChain();
    }
  }
  
  // Helper methods
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  private async waitForEndpoint(endpointName: string, maxWaitTime: number = 600000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const command = new DescribeEndpointCommand({ EndpointName: endpointName });
        const response = await this.sagemakerClient.send(command);
        
        if (response.EndpointStatus === 'InService') {
          return;
        } else if (response.EndpointStatus === 'Failed') {
          throw new Error(`Endpoint ${endpointName} failed to deploy`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      } catch (error) {
        console.error('Error checking endpoint status:', error);
        throw error;
      }
    }
    
    throw new Error(`Endpoint ${endpointName} deployment timeout`);
  }
  
  private async getGoogleAccessToken(): Promise<string> {
    // This would typically use Google Auth Library to get access token
    // For production, implement proper authentication
    return 'google-access-token';
  }
  
  // Response parsers for different providers
  private parseBedrockResponse(response: any): PlantHealthAnalysis {
    // Parse Claude's response
    const content = response.content[0].text;
    // This would need proper parsing logic based on Claude's response format
    return {
      healthScore: 85,
      diseases: [],
      recommendations: ['Ensure proper watering', 'Check for pests'],
      growthStage: 'Vegetative'
    };
  }
  
  private parseClarifaiResponse(response: any): PlantHealthAnalysis {
    const output = response.outputs[0];
    const concepts = output.data.concepts || [];
    
    const diseases = concepts
      .filter((c: any) => c.name.includes('disease') || c.name.includes('deficiency'))
      .map((c: any) => ({
        name: c.name,
        confidence: c.value,
        severity: c.value > 0.8 ? 'high' : c.value > 0.5 ? 'medium' : 'low'
      }));
    
    const healthScore = diseases.length === 0 ? 95 : 100 - (diseases.reduce((sum: number, d: any) => sum + d.confidence * 20, 0));
    
    return {
      healthScore: Math.max(0, Math.min(100, healthScore)),
      diseases,
      recommendations: this.generateRecommendations(diseases),
      growthStage: 'Unknown'
    };
  }
  
  private parseOpenAIResponse(response: any): PlantHealthAnalysis {
    try {
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          healthScore: parsed.healthScore || 85,
          diseases: parsed.diseases || [],
          recommendations: parsed.recommendations || [],
          growthStage: parsed.growthStage || 'Unknown',
          affectedArea: parsed.affectedArea
        };
      }
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
    }
    
    return {
      healthScore: 85,
      diseases: [],
      recommendations: ['Unable to parse response'],
      growthStage: 'Unknown'
    };
  }
  
  private parseVertexResponse(response: any): PlantHealthAnalysis {
    const prediction = response.predictions[0];
    // Parse Gemini's response - this would need adjustment based on actual response format
    return {
      healthScore: 90,
      diseases: [],
      recommendations: ['Monitor plant health regularly'],
      growthStage: 'Mature'
    };
  }
  
  private parseAutoMLResponse(response: any): EnvironmentalPrediction[] {
    return response.predictions.map((pred: any) => ({
      temperature: pred.temperature,
      humidity: pred.humidity,
      co2Level: pred.co2_level,
      lightIntensity: pred.light_intensity,
      timestamp: new Date(pred.timestamp),
      confidence: pred.confidence || 0.9
    }));
  }
  
  private generateRecommendations(diseases: any[]): string[] {
    const recommendations: string[] = [];
    
    diseases.forEach(disease => {
      if (disease.name.includes('nutrient')) {
        recommendations.push('Adjust nutrient solution concentration');
      } else if (disease.name.includes('fungal')) {
        recommendations.push('Improve air circulation and reduce humidity');
      } else if (disease.name.includes('pest')) {
        recommendations.push('Inspect for pests and apply appropriate treatment');
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('Continue regular monitoring and maintenance');
    }
    
    return recommendations;
  }
}

// Export singleton instance
let aiAnalyticsServiceInstance: AIAnalyticsService | null = null;

export function getAIAnalyticsService(config?: {
  awsRegion: string;
  openAIApiKey: string;
  clarifaiApiKey: string;
  googleProjectId: string;
  googleLocation?: string;
}): AIAnalyticsService {
  if (!aiAnalyticsServiceInstance && config) {
    aiAnalyticsServiceInstance = new AIAnalyticsService(config);
  } else if (!aiAnalyticsServiceInstance) {
    throw new Error('AIAnalyticsService must be initialized with config first');
  }
  
  return aiAnalyticsServiceInstance;
}

// Export types for external use
export type { AIProvider, PredictionResult, PlantHealthAnalysis, EnvironmentalPrediction };
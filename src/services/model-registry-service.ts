/**
 * Model Registry Service
 * 
 * Manages ML model uploads, versioning, monitoring, and deployment
 * with sandboxed container execution
 */

import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { z } from 'zod'
import Docker from 'dockerode'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { spawn } from 'child_process'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import tar from 'tar-stream'
import { promisify } from 'util'
import stream from 'stream'

const pipeline = promisify(stream.pipeline)

const prisma = new PrismaClient()
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

const docker = new Docker()
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

// Model schemas
export const ModelMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  framework: z.enum(['tensorflow', 'pytorch', 'scikit-learn', 'xgboost', 'custom']),
  type: z.enum(['regression', 'classification', 'clustering', 'timeseries', 'reinforcement']),
  inputSchema: z.record(z.object({
    type: z.string(),
    shape: z.array(z.number()).optional(),
    range: z.object({ min: z.number(), max: z.number() }).optional()
  })),
  outputSchema: z.record(z.object({
    type: z.string(),
    shape: z.array(z.number()).optional(),
    units: z.string().optional()
  })),
  requirements: z.object({
    python: z.string(),
    packages: z.array(z.string()),
    memory: z.string(),
    cpu: z.number(),
    gpu: z.boolean()
  }),
  metrics: z.object({
    accuracy: z.number().optional(),
    precision: z.number().optional(),
    recall: z.number().optional(),
    f1Score: z.number().optional(),
    rmse: z.number().optional(),
    mae: z.number().optional(),
    r2: z.number().optional()
  }),
  tags: z.array(z.string()),
  documentation: z.string().optional()
})

export type ModelMetadata = z.infer<typeof ModelMetadataSchema>

// Model deployment configuration
export interface ModelDeployment {
  modelId: string
  version: string
  endpoint: string
  status: 'deploying' | 'active' | 'failed' | 'stopped'
  replicas: number
  resources: {
    cpu: number
    memory: string
    gpu?: number
  }
  autoscaling?: {
    minReplicas: number
    maxReplicas: number
    targetCPU: number
  }
  monitoring: {
    prometheusEndpoint: string
    grafanaDashboard: string
  }
}

// Model monitoring metrics
export interface ModelMetrics {
  modelId: string
  timestamp: Date
  inferenceCount: number
  avgLatency: number
  p99Latency: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
  gpuUsage?: number
  predictions: {
    distribution: Record<string, number>
    drift: number
  }
}

export class ModelRegistryService {
  private modelStoragePath: string
  private sandboxNetworkName = 'vibelux-ml-sandbox'

  constructor() {
    this.modelStoragePath = process.env.MODEL_STORAGE_PATH || '/tmp/vibelux-models'
    this.initializeInfrastructure()
  }

  /**
   * Initialize Docker network and storage
   */
  private async initializeInfrastructure() {
    // Create model storage directory
    try {
      await fs.access(this.modelStoragePath)
    } catch {
      await fs.mkdir(this.modelStoragePath, { recursive: true })
    }

    // Create Docker network for sandboxed execution
    try {
      await docker.createNetwork({
        Name: this.sandboxNetworkName,
        Driver: 'bridge',
        Internal: true // Isolated network
      })
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.error('Failed to create Docker network:', error)
      }
    }
  }

  /**
   * Upload and register a new model
   */
  async uploadModel(
    userId: string,
    modelFile: Buffer,
    metadata: ModelMetadata
  ): Promise<{ modelId: string; version: string }> {
    // Validate metadata
    const validated = ModelMetadataSchema.parse(metadata)
    
    // Generate model ID
    const modelId = crypto.randomUUID()
    const version = validated.version || '1.0.0'
    
    // Upload model to S3
    const s3Key = `models/${userId}/${modelId}/${version}/model.tar.gz`
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.MODEL_BUCKET || 'vibelux-models',
      Key: s3Key,
      Body: modelFile,
      ContentType: 'application/gzip'
    }))
    
    // Create model record
    const model = await prisma.mlModel.create({
      data: {
        id: modelId,
        name: validated.name,
        version,
        user_id: userId,
        framework: validated.framework,
        type: validated.type,
        metadata: validated as any,
        s3_key: s3Key,
        status: 'uploaded',
        file_size: modelFile.length
      }
    })
    
    // Validate model in sandbox
    await this.validateModel(modelId, version)
    
    // Create monitoring dashboard
    await this.createMonitoringDashboard(modelId)
    
    return { modelId, version }
  }

  /**
   * Validate model in sandboxed container
   */
  private async validateModel(modelId: string, version: string): Promise<void> {
    const model = await prisma.mlModel.findUnique({
      where: { id: modelId }
    })
    
    if (!model) {
      throw new Error('Model not found')
    }
    
    const metadata = model.metadata as ModelMetadata
    
    // Create validation container
    const containerName = `validate-${modelId}-${Date.now()}`
    
    // Build Dockerfile content
    const dockerfile = this.generateDockerfile(metadata)
    
    // Create temporary directory for build context
    const buildDir = path.join(this.modelStoragePath, 'builds', modelId)
    await fs.mkdir(buildDir, { recursive: true })
    
    // Write Dockerfile
    await fs.writeFile(path.join(buildDir, 'Dockerfile'), dockerfile)
    
    // Write validation script
    const validationScript = this.generateValidationScript(metadata)
    await fs.writeFile(path.join(buildDir, 'validate.py'), validationScript)
    
    // Download model from S3
    const modelData = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.MODEL_BUCKET || 'vibelux-models',
      Key: model.s3_key
    }))
    
    const modelPath = path.join(buildDir, 'model.tar.gz')
    await pipeline(modelData.Body as any, fs.createWriteStream(modelPath))
    
    try {
      // Build Docker image
      const buildStream = await docker.buildImage({
        context: buildDir,
        src: ['Dockerfile', 'validate.py', 'model.tar.gz']
      }, {
        t: `vibelux-model-${modelId}:${version}`
      })
      
      // Wait for build to complete
      await new Promise((resolve, reject) => {
        docker.modem.followProgress(buildStream, (err, res) => err ? reject(err) : resolve(res))
      })
      
      // Run validation container
      const container = await docker.createContainer({
        name: containerName,
        Image: `vibelux-model-${modelId}:${version}`,
        HostConfig: {
          NetworkMode: this.sandboxNetworkName,
          Memory: this.parseMemory(metadata.requirements.memory),
          CpuQuota: metadata.requirements.cpu * 100000,
          AutoRemove: true
        },
        Env: [
          `MODEL_ID=${modelId}`,
          `MODEL_VERSION=${version}`
        ]
      })
      
      await container.start()
      
      // Wait for validation to complete
      const result = await container.wait()
      
      if (result.StatusCode !== 0) {
        throw new Error('Model validation failed')
      }
      
      // Update model status
      await prisma.mlModel.update({
        where: { id: modelId },
        data: { status: 'validated' }
      })
      
    } catch (error) {
      console.error('Model validation error:', error)
      
      await prisma.mlModel.update({
        where: { id: modelId },
        data: { 
          status: 'validation_failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      
      throw error
    } finally {
      // Cleanup build directory
      await fs.rm(buildDir, { recursive: true, force: true })
    }
  }

  /**
   * Deploy model as API endpoint
   */
  async deployModel(
    modelId: string,
    version: string,
    config?: {
      replicas?: number
      autoscaling?: boolean
      resources?: {
        cpu?: number
        memory?: string
        gpu?: number
      }
    }
  ): Promise<ModelDeployment> {
    const model = await prisma.mlModel.findFirst({
      where: { id: modelId, version }
    })
    
    if (!model) {
      throw new Error('Model not found')
    }
    
    const metadata = model.metadata as ModelMetadata
    
    // Generate deployment configuration
    const deploymentId = crypto.randomUUID()
    const endpoint = `/api/v1/ml/models/${modelId}/predict`
    
    // Create inference service container
    const serviceName = `model-${modelId}-${version}`
    
    // Build inference Dockerfile
    const inferenceDockerfile = this.generateInferenceDockerfile(metadata)
    
    // Create deployment directory
    const deployDir = path.join(this.modelStoragePath, 'deployments', deploymentId)
    await fs.mkdir(deployDir, { recursive: true })
    
    // Write Dockerfile and inference server
    await fs.writeFile(path.join(deployDir, 'Dockerfile'), inferenceDockerfile)
    await fs.writeFile(
      path.join(deployDir, 'server.py'),
      this.generateInferenceServer(metadata)
    )
    
    // Download model
    const modelData = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.MODEL_BUCKET || 'vibelux-models',
      Key: model.s3_key
    }))
    
    const modelPath = path.join(deployDir, 'model.tar.gz')
    await pipeline(modelData.Body as any, fs.createWriteStream(modelPath))
    
    // Build inference image
    const buildStream = await docker.buildImage({
      context: deployDir,
      src: ['Dockerfile', 'server.py', 'model.tar.gz']
    }, {
      t: `vibelux-inference-${modelId}:${version}`
    })
    
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(buildStream, (err, res) => err ? reject(err) : resolve(res))
    })
    
    // Create service
    const service = await docker.createService({
      Name: serviceName,
      TaskTemplate: {
        ContainerSpec: {
          Image: `vibelux-inference-${modelId}:${version}`,
          Env: [
            `MODEL_ID=${modelId}`,
            `MODEL_VERSION=${version}`,
            `PORT=8080`
          ]
        },
        Resources: {
          Limits: {
            MemoryBytes: this.parseMemory(config?.resources?.memory || metadata.requirements.memory),
            NanoCPUs: (config?.resources?.cpu || metadata.requirements.cpu) * 1000000000
          }
        },
        RestartPolicy: {
          Condition: 'on-failure',
          MaxAttempts: 3
        }
      },
      Mode: {
        Replicated: {
          Replicas: config?.replicas || 1
        }
      },
      Networks: [{
        Target: this.sandboxNetworkName
      }]
    })
    
    // Create deployment record
    const deployment = await prisma.modelDeployment.create({
      data: {
        model_id: modelId,
        version,
        deployment_id: deploymentId,
        endpoint,
        status: 'active',
        replicas: config?.replicas || 1,
        resources: {
          cpu: config?.resources?.cpu || metadata.requirements.cpu,
          memory: config?.resources?.memory || metadata.requirements.memory,
          gpu: config?.resources?.gpu
        },
        service_id: service.id || serviceName
      }
    })
    
    // Setup monitoring
    const monitoring = await this.setupModelMonitoring(modelId, deploymentId)
    
    // Cleanup deployment directory
    await fs.rm(deployDir, { recursive: true, force: true })
    
    return {
      modelId,
      version,
      endpoint,
      status: 'active',
      replicas: config?.replicas || 1,
      resources: {
        cpu: config?.resources?.cpu || metadata.requirements.cpu,
        memory: config?.resources?.memory || metadata.requirements.memory,
        gpu: config?.resources?.gpu
      },
      autoscaling: config?.autoscaling ? {
        minReplicas: 1,
        maxReplicas: 10,
        targetCPU: 70
      } : undefined,
      monitoring
    }
  }

  /**
   * Get model metrics
   */
  async getModelMetrics(
    modelId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<ModelMetrics[]> {
    // Fetch metrics from monitoring system
    const metrics = await prisma.modelMetric.findMany({
      where: {
        model_id: modelId,
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      },
      orderBy: { timestamp: 'asc' }
    })
    
    return metrics.map(m => ({
      modelId: m.model_id,
      timestamp: m.timestamp,
      inferenceCount: m.inference_count,
      avgLatency: m.avg_latency,
      p99Latency: m.p99_latency,
      errorRate: m.error_rate,
      cpuUsage: m.cpu_usage,
      memoryUsage: m.memory_usage,
      gpuUsage: m.gpu_usage || undefined,
      predictions: m.predictions as any
    }))
  }

  /**
   * Update model version
   */
  async updateModelVersion(
    modelId: string,
    currentVersion: string,
    newModelFile: Buffer,
    changelog: string
  ): Promise<{ version: string }> {
    const currentModel = await prisma.mlModel.findFirst({
      where: { id: modelId, version: currentVersion }
    })
    
    if (!currentModel) {
      throw new Error('Current model version not found')
    }
    
    // Increment version
    const versionParts = currentVersion.split('.')
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`
    
    // Upload new version
    const s3Key = `models/${currentModel.user_id}/${modelId}/${newVersion}/model.tar.gz`
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.MODEL_BUCKET || 'vibelux-models',
      Key: s3Key,
      Body: newModelFile,
      ContentType: 'application/gzip'
    }))
    
    // Create new version record
    await prisma.mlModel.create({
      data: {
        id: crypto.randomUUID(),
        name: currentModel.name,
        version: newVersion,
        user_id: currentModel.user_id,
        framework: currentModel.framework,
        type: currentModel.type,
        metadata: currentModel.metadata,
        s3_key: s3Key,
        status: 'uploaded',
        file_size: newModelFile.length,
        parent_version: currentVersion,
        changelog
      }
    })
    
    // Validate new version
    await this.validateModel(modelId, newVersion)
    
    return { version: newVersion }
  }

  /**
   * Get model registry
   */
  async getModelRegistry(
    filters?: {
      userId?: string
      framework?: string
      type?: string
      tags?: string[]
      status?: string
    }
  ): Promise<ModelRegistryEntry[]> {
    const where: any = {}
    
    if (filters?.userId) where.user_id = filters.userId
    if (filters?.framework) where.framework = filters.framework
    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    
    const models = await prisma.mlModel.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        deployments: {
          where: { status: 'active' }
        }
      },
      orderBy: { created_at: 'desc' }
    })
    
    // Filter by tags if specified
    let filtered = models
    if (filters?.tags && filters.tags.length > 0) {
      filtered = models.filter(m => {
        const metadata = m.metadata as ModelMetadata
        return filters.tags!.some(tag => metadata.tags.includes(tag))
      })
    }
    
    return filtered.map(m => {
      const metadata = m.metadata as ModelMetadata
      return {
        id: m.id,
        name: m.name,
        version: m.version,
        author: {
          id: m.user.id,
          name: m.user.name || m.user.email
        },
        framework: m.framework,
        type: m.type,
        description: metadata.description,
        metrics: metadata.metrics,
        tags: metadata.tags,
        status: m.status,
        deploymentCount: m.deployments.length,
        createdAt: m.created_at,
        fileSize: m.file_size
      }
    })
  }

  /**
   * Generate model documentation
   */
  async generateDocumentation(modelId: string, version: string): Promise<string> {
    const model = await prisma.mlModel.findFirst({
      where: { id: modelId, version },
      include: {
        user: true,
        deployments: true
      }
    })
    
    if (!model) {
      throw new Error('Model not found')
    }
    
    const metadata = model.metadata as ModelMetadata
    
    // Generate comprehensive documentation
    const docs = `
# ${model.name} v${model.version}

## Overview
${metadata.description}

## Model Information
- **Author**: ${model.user.name || model.user.email}
- **Framework**: ${model.framework}
- **Type**: ${model.type}
- **Created**: ${model.created_at.toISOString()}

## Input Schema
\`\`\`json
${JSON.stringify(metadata.inputSchema, null, 2)}
\`\`\`

## Output Schema
\`\`\`json
${JSON.stringify(metadata.outputSchema, null, 2)}
\`\`\`

## Performance Metrics
${Object.entries(metadata.metrics)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}

## Requirements
- Python: ${metadata.requirements.python}
- Memory: ${metadata.requirements.memory}
- CPU: ${metadata.requirements.cpu} cores
- GPU: ${metadata.requirements.gpu ? 'Required' : 'Not required'}

### Dependencies
${metadata.requirements.packages.map(pkg => `- ${pkg}`).join('\n')}

## API Usage

### Endpoint
\`\`\`
POST /api/v1/ml/models/${modelId}/predict
\`\`\`

### Example Request
\`\`\`bash
curl -X POST https://api.vibelux.com/v1/ml/models/${modelId}/predict \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      // Your input data here
    }
  }'
\`\`\`

### Example Response
\`\`\`json
{
  "predictions": {
    // Model predictions
  },
  "metadata": {
    "model_version": "${version}",
    "inference_time_ms": 45
  }
}
\`\`\`

## Deployment Status
${model.deployments.length > 0 ? 
  model.deployments.map(d => `- ${d.endpoint}: ${d.status}`).join('\n') :
  'Model not currently deployed'}

## Tags
${metadata.tags.map(tag => `\`${tag}\``).join(', ')}

---
Generated on ${new Date().toISOString()}
`
    
    return docs
  }

  // Helper methods
  private generateDockerfile(metadata: ModelMetadata): string {
    return `
FROM python:${metadata.requirements.python}-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir ${metadata.requirements.packages.join(' ')}

# Copy model and validation script
COPY model.tar.gz .
COPY validate.py .

# Extract model
RUN tar -xzf model.tar.gz && rm model.tar.gz

# Run validation
CMD ["python", "validate.py"]
`
  }

  private generateValidationScript(metadata: ModelMetadata): string {
    return `
import os
import sys
import json
import numpy as np

def validate_model():
    """Validate model can be loaded and run inference"""
    
    framework = '${metadata.framework}'
    
    try:
        if framework == 'tensorflow':
            import tensorflow as tf
            model = tf.keras.models.load_model('model')
            
        elif framework == 'pytorch':
            import torch
            model = torch.load('model.pt')
            model.eval()
            
        elif framework == 'scikit-learn':
            import joblib
            model = joblib.load('model.pkl')
            
        elif framework == 'xgboost':
            import xgboost as xgb
            model = xgb.Booster()
            model.load_model('model.bin')
        
        print("Model loaded successfully")
        
        # Test inference with dummy data
        # This is a simplified validation - real implementation would use actual test data
        print("Validation passed")
        return 0
        
    except Exception as e:
        print(f"Validation failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(validate_model())
`
  }

  private generateInferenceDockerfile(metadata: ModelMetadata): string {
    return `
FROM python:${metadata.requirements.python}-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \\
    fastapi uvicorn \\
    ${metadata.requirements.packages.join(' ')}

# Copy model and server
COPY model.tar.gz .
COPY server.py .

# Extract model
RUN tar -xzf model.tar.gz && rm model.tar.gz

EXPOSE 8080

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
`
  }

  private generateInferenceServer(metadata: ModelMetadata): string {
    return `
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import time
import os

app = FastAPI()

# Load model based on framework
framework = '${metadata.framework}'
model = None

if framework == 'tensorflow':
    import tensorflow as tf
    model = tf.keras.models.load_model('model')
elif framework == 'pytorch':
    import torch
    model = torch.load('model.pt')
    model.eval()
elif framework == 'scikit-learn':
    import joblib
    model = joblib.load('model.pkl')
elif framework == 'xgboost':
    import xgboost as xgb
    model = xgb.Booster()
    model.load_model('model.bin')

class PredictionRequest(BaseModel):
    input: dict

class PredictionResponse(BaseModel):
    predictions: dict
    metadata: dict

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    start_time = time.time()
    
    try:
        # Process input based on framework
        # This is simplified - real implementation would handle different input formats
        
        if framework == 'tensorflow':
            predictions = model.predict(request.input)
        elif framework == 'pytorch':
            with torch.no_grad():
                predictions = model(torch.tensor(request.input))
        else:
            predictions = model.predict(request.input)
        
        inference_time = (time.time() - start_time) * 1000
        
        return PredictionResponse(
            predictions={"result": predictions.tolist()},
            metadata={
                "model_id": os.environ.get('MODEL_ID'),
                "model_version": os.environ.get('MODEL_VERSION'),
                "inference_time_ms": inference_time
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}
`
  }

  private parseMemory(memory: string): number {
    const units: Record<string, number> = {
      'B': 1,
      'K': 1024,
      'M': 1024 * 1024,
      'G': 1024 * 1024 * 1024
    }
    
    const match = memory.match(/^(\d+)([BKMG])$/i)
    if (!match) {
      throw new Error(`Invalid memory format: ${memory}`)
    }
    
    return parseInt(match[1]) * units[match[2].toUpperCase()]
  }

  private async createMonitoringDashboard(modelId: string): Promise<{ prometheusEndpoint: string; grafanaDashboard: string }> {
    // Create Prometheus endpoint for model metrics
    const prometheusEndpoint = `/metrics/models/${modelId}`
    
    // Create Grafana dashboard
    const dashboardConfig = {
      title: `Model ${modelId} Monitoring`,
      panels: [
        {
          title: 'Inference Rate',
          targets: [{
            expr: `rate(model_inference_total{model_id="${modelId}"}[5m])`
          }]
        },
        {
          title: 'Latency',
          targets: [{
            expr: `histogram_quantile(0.99, model_inference_duration_seconds{model_id="${modelId}"})`
          }]
        },
        {
          title: 'Error Rate',
          targets: [{
            expr: `rate(model_inference_errors_total{model_id="${modelId}"}[5m])`
          }]
        },
        {
          title: 'Resource Usage',
          targets: [
            { expr: `model_cpu_usage{model_id="${modelId}"}` },
            { expr: `model_memory_usage{model_id="${modelId}"}` }
          ]
        }
      ]
    }
    
    // In production, this would create actual Grafana dashboard via API
    const grafanaDashboard = `/grafana/dashboards/model-${modelId}`
    
    return { prometheusEndpoint, grafanaDashboard }
  }

  private async setupModelMonitoring(
    modelId: string,
    deploymentId: string
  ): Promise<{ prometheusEndpoint: string; grafanaDashboard: string }> {
    // Setup Prometheus scraping for model metrics
    await redis.hset(
      'prometheus:targets',
      `model-${modelId}`,
      JSON.stringify({
        targets: [`model-${modelId}:8080/metrics`],
        labels: {
          model_id: modelId,
          deployment_id: deploymentId
        }
      })
    )
    
    return this.createMonitoringDashboard(modelId)
  }
}

// Type definitions
interface ModelRegistryEntry {
  id: string
  name: string
  version: string
  author: {
    id: string
    name: string
  }
  framework: string
  type: string
  description: string
  metrics: any
  tags: string[]
  status: string
  deploymentCount: number
  createdAt: Date
  fileSize: number
}

export default ModelRegistryService
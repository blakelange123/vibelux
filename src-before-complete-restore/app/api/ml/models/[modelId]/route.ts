import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';

// GET model files
export async function GET(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modelId = params.modelId;
    
    // Verify model exists
    const model = await prisma.yieldPredictionModel.findUnique({
      where: { id: modelId }
    });

    if (!model || model.status !== 'ready') {
      return NextResponse.json(
        { error: 'Model not found or not ready' },
        { status: 404 }
      );
    }

    // In production, models would be stored in cloud storage (S3, GCS, etc.)
    // For now, we'll return the model metadata
    const modelData = {
      modelTopology: model.architecture,
      format: 'layers-model',
      generatedBy: 'VibeLux ML Pipeline',
      convertedBy: null,
      weightSpecs: [
        {
          name: 'dense_1/kernel',
          shape: [12, 64],
          dtype: 'float32'
        },
        {
          name: 'dense_1/bias',
          shape: [64],
          dtype: 'float32'
        }
        // ... more weight specs
      ],
      modelVersion: model.version,
      modelConfig: {
        class_name: 'Sequential',
        config: {
          name: 'yield_prediction_model',
          layers: model.architecture.layers
        }
      }
    };

    return NextResponse.json(modelData);
  } catch (error) {
    console.error('Error serving model:', error);
    return NextResponse.json(
      { error: 'Failed to serve model' },
      { status: 500 }
    );
  }
}

// DELETE to deprecate a model
export async function DELETE(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modelId = params.modelId;

    const model = await prisma.yieldPredictionModel.update({
      where: { id: modelId },
      data: {
        status: 'deprecated',
        deprecatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: model.id,
        status: model.status,
        deprecatedAt: model.deprecatedAt
      }
    });
  } catch (error) {
    console.error('Error deprecating model:', error);
    return NextResponse.json(
      { error: 'Failed to deprecate model' },
      { status: 500 }
    );
  }
}
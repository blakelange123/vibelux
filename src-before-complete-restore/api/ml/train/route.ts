import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { YieldPredictionModel as MLModel } from '@/lib/ml/yield-prediction-model';

// POST to trigger model training
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      cropType, 
      modelName, 
      description,
      epochs = 100,
      validationSplit = 0.2,
      testSplit = 0.1
    } = body;

    if (!cropType || !modelName) {
      return NextResponse.json(
        { error: 'Missing required fields: cropType, modelName' },
        { status: 400 }
      );
    }

    // Fetch training data
    const trainingData = await prisma.yieldTrainingData.findMany({
      where: {
        cropType,
        verified: true
      },
      orderBy: { recordedAt: 'desc' }
    });

    if (trainingData.length < 50) {
      return NextResponse.json(
        { error: `Insufficient training data. Found ${trainingData.length} samples, need at least 50.` },
        { status: 400 }
      );
    }

    // Split data into train/validation/test sets
    const totalSamples = trainingData.length;
    const testSize = Math.floor(totalSamples * testSplit);
    const validationSize = Math.floor(totalSamples * validationSplit);
    const trainSize = totalSamples - testSize - validationSize;

    // Create model version
    const version = `v${Date.now()}`;
    const modelRecord = await prisma.yieldPredictionModel.create({
      data: {
        version,
        name: modelName,
        description,
        cropTypes: [cropType],
        architecture: {
          type: 'neural_network',
          layers: [
            { type: 'dense', units: 64, activation: 'relu' },
            { type: 'batch_normalization' },
            { type: 'dropout', rate: 0.3 },
            { type: 'dense', units: 128, activation: 'relu' },
            { type: 'batch_normalization' },
            { type: 'dropout', rate: 0.3 },
            { type: 'dense', units: 64, activation: 'relu' },
            { type: 'batch_normalization' },
            { type: 'dropout', rate: 0.2 },
            { type: 'dense', units: 32, activation: 'relu' },
            { type: 'dense', units: 2, activation: 'linear' }
          ],
          inputFeatures: 12,
          outputUnits: 2
        },
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          optimizer: 'adam',
          lossFunction: 'meanSquaredError',
          epochs,
          validationSplit,
          testSplit
        },
        trainingSamples: trainSize,
        validationSamples: validationSize,
        testSamples: testSize,
        epochs: 0, // Will be updated during training
        trainLoss: 0,
        validationLoss: 0,
        testLoss: 0,
        mae: 0,
        rmse: 0,
        r2Score: 0,
        accuracy: 0,
        featureImportance: {},
        status: 'training'
      }
    });

    // Format data for ML model
    const formattedData = trainingData.map(d => ({
      features: {
        temperature: d.temperature,
        humidity: d.humidity,
        ppfd: d.ppfd,
        co2: d.co2,
        vpd: d.vpd,
        ec: d.ec,
        ph: d.ph,
        dli: d.dli,
        growthStage: d.growthStage,
        plantDensity: d.plantDensity,
        waterUsage: d.waterUsage,
        previousYield: d.previousYield || 0
      },
      target: {
        actualYield: d.actualYield,
        qualityScore: d.qualityScore
      }
    }));

    // Start training in background (in production, use a queue)
    trainModelAsync(modelRecord.id, formattedData, epochs, validationSplit);

    return NextResponse.json({
      success: true,
      data: {
        modelId: modelRecord.id,
        version: modelRecord.version,
        status: 'training',
        message: 'Model training started. Check status endpoint for progress.'
      }
    });
  } catch (error) {
    console.error('Error starting model training:', error);
    return NextResponse.json(
      { error: 'Failed to start model training' },
      { status: 500 }
    );
  }
}

// Async training function (in production, use a job queue)
async function trainModelAsync(
  modelId: string, 
  data: any[], 
  epochs: number,
  validationSplit: number
) {
  try {
    const mlModel = new MLModel();
    mlModel.createModel();

    // Train the model
    const history = await mlModel.train(data, validationSplit, epochs, {
      onEpochEnd: async (epoch: number, logs: any) => {
        // Update progress in database
        await prisma.yieldPredictionModel.update({
          where: { id: modelId },
          data: {
            epochs: epoch + 1,
            trainLoss: logs.loss,
            validationLoss: logs.val_loss
          }
        });
      }
    });

    // Evaluate on test set
    const testData = data.slice(-Math.floor(data.length * 0.1));
    const evaluation = await mlModel.evaluate(testData);

    // Calculate feature importance
    const sampleFeatures = data[0].features;
    const prediction = await mlModel.predict(sampleFeatures);

    // Save model and update database
    await mlModel.saveModel(modelId);
    
    await prisma.yieldPredictionModel.update({
      where: { id: modelId },
      data: {
        status: 'ready',
        deployedAt: new Date(),
        trainLoss: history.history.loss[history.history.loss.length - 1],
        validationLoss: history.history.val_loss[history.history.val_loss.length - 1],
        testLoss: evaluation.mse,
        mae: evaluation.mae,
        rmse: evaluation.rmse,
        r2Score: evaluation.r2,
        accuracy: evaluation.accuracy,
        featureImportance: prediction.factors.reduce((acc: any, f: any) => {
          acc[f.name] = f.impact;
          return acc;
        }, {}),
        modelUrl: `/api/ml/models/${modelId}`,
        weightsUrl: `/api/ml/models/${modelId}/weights`
      }
    });

    // Cleanup
    mlModel.dispose();
  } catch (error) {
    console.error('Error during model training:', error);
    
    // Update model status to error
    await prisma.yieldPredictionModel.update({
      where: { id: modelId },
      data: {
        status: 'error'
      }
    });
  }
}

// GET training status
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      // Return all models
      const models = await prisma.yieldPredictionModel.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return NextResponse.json({
        success: true,
        data: models
      });
    }

    // Return specific model
    const model = await prisma.yieldPredictionModel.findUnique({
      where: { id: modelId }
    });

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Error fetching model status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model status' },
      { status: 500 }
    );
  }
}
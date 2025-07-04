'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { YieldModelTrainer, TrainingData, tf } from '@/lib/ml/yield-model-training';
import {
  Brain,
  Upload,
  Download,
  Play,
  Save,
  BarChart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { useDropzone } from 'react-dropzone';

export function MLModelTraining() {
  const [trainer] = useState(() => new YieldModelTrainer());
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<'synthetic' | 'upload'>('synthetic');

  // Generate synthetic data
  const generateData = useCallback(() => {
    const data = YieldModelTrainer.generateSyntheticData(1000);
    setTrainingData(data);
  }, []);

  // File upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const data: TrainingData[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length < headers.length) continue;
          
          data.push({
            inputs: {
              ppfd: parseFloat(values[0]),
              dli: parseFloat(values[1]),
              temperature: parseFloat(values[2]),
              humidity: parseFloat(values[3]),
              co2: parseFloat(values[4]),
              vpd: parseFloat(values[5]),
              week: parseInt(values[6]),
              strain: values[7].trim()
            },
            output: {
              yield: parseFloat(values[8])
            }
          });
        }
        
        setTrainingData(data);
        alert(`Loaded ${data.length} training samples`);
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  // Train model
  const trainModel = async () => {
    if (trainingData.length === 0) {
      alert('Please load training data first');
      return;
    }

    setIsTraining(true);
    setTrainingHistory([]);
    setTrainingProgress(0);

    try {
      const trainedModel = await trainer.train(trainingData, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setTrainingProgress((epoch + 1) / 50 * 100);
            setTrainingHistory(prev => [...prev, {
              epoch: epoch + 1,
              loss: logs?.loss || 0,
              val_loss: logs?.val_loss || 0,
              mae: logs?.meanAbsoluteError || 0,
              val_mae: logs?.val_meanAbsoluteError || 0
            }]);
          }
        }
      });

      setModelMetrics(trainedModel.metadata.metrics);
      
      // Generate predictions for visualization
      const testPredictions = [];
      const testIndices = Array.from({ length: 100 }, () => 
        Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * trainingData.length)
      );
      
      for (const idx of testIndices) {
        const sample = trainingData[idx];
        const predicted = trainer.predict(sample.inputs);
        testPredictions.push({
          actual: sample.output.yield,
          predicted,
          error: Math.abs(predicted - sample.output.yield)
        });
      }
      
      setPredictions(testPredictions);
    } catch (error) {
      console.error('Training error:', error);
      alert('Error during training. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  // Save model
  const saveModel = async () => {
    try {
      await trainer.saveModel('vibelux-yield-model');
      alert('Model saved successfully');
    } catch (error) {
      alert('Error saving model');
    }
  };

  // Load model
  const loadModel = async () => {
    try {
      await trainer.loadModel('vibelux-yield-model');
      alert('Model loaded successfully');
    } catch (error) {
      alert('Error loading model');
    }
  };

  // Download training data template
  const downloadTemplate = () => {
    const csv = 'ppfd,dli,temperature,humidity,co2,vpd,week,strain,yield\n' +
      '600,20,75,55,800,1.0,8,Blue Dream,120\n' +
      '550,18,72,60,750,0.9,7,OG Kush,95\n';
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training_data_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (selectedDataSource === 'synthetic') {
      generateData();
    }
  }, [selectedDataSource, generateData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            ML Model Training
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Train custom yield prediction models with your data
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadModel}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Load Model
          </button>
          <button
            onClick={saveModel}
            disabled={!modelMetrics}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Model
          </button>
        </div>
      </div>

      {/* Data Source Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Training Data Source
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedDataSource('synthetic')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedDataSource === 'synthetic'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <RefreshCw className="w-6 h-6 text-purple-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Synthetic Data</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Generate realistic training data
            </p>
          </button>
          
          <div
            {...getRootProps()}
            className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedDataSource === 'upload'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600'
            } ${isDragActive ? 'border-purple-400 bg-purple-100 dark:bg-purple-900/30' : ''}`}
            onClick={() => setSelectedDataSource('upload')}
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 text-purple-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Upload CSV</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isDragActive ? 'Drop file here' : 'Drag & drop or click'}
            </p>
          </div>
        </div>
        
        {selectedDataSource === 'upload' && (
          <button
            onClick={downloadTemplate}
            className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Download CSV template
          </button>
        )}
        
        {trainingData.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ Loaded {trainingData.length} training samples
            </p>
          </div>
        )}
      </div>

      {/* Training Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Model Training
        </h3>
        
        <button
          onClick={trainModel}
          disabled={isTraining || trainingData.length === 0}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isTraining ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Training... {trainingProgress.toFixed(0)}%
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Train Model
            </>
          )}
        </button>
        
        {isTraining && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Training History */}
      {trainingHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Training Progress
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#8b5cf6"
                  name="Training Loss"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="val_loss"
                  stroke="#ec4899"
                  name="Validation Loss"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Model Metrics */}
      {modelMetrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Model Performance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">R² Score</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(modelMetrics.r2Score * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">MAE</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {modelMetrics.mae.toFixed(2)}g
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Loss</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {modelMetrics.loss.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Scatter Plot */}
      {predictions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actual vs Predicted Yield
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="actual" name="Actual" unit="g" />
                <YAxis dataKey="predicted" name="Predicted" unit="g" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Predictions"
                  data={predictions}
                  fill="#8b5cf6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
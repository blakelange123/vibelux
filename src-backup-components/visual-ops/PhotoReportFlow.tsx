'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera, ArrowLeft, ArrowRight, AlertCircle, MapPin,
  Mic, MicOff, Save, Send, Clock, CheckCircle, Info,
  AlertTriangle, Star, ChevronDown, ChevronUp, Zap,
  DollarSign, Users, Calendar, FileText, Tag, Building,
  ThermometerSun, Droplets, Wind, Sun
} from 'lucide-react';
import EnhancedCameraCapture from './EnhancedCameraCapture';

interface PhotoReportFlowProps {
  reportType: string;
  reportTypeConfig: {
    title: string;
    icon: any;
    color: string;
    guidelines: string[];
    requiredFields: string[];
    aiPrompt: string;
  };
  facilityId: string;
  userId: string;
}

interface FormData {
  roomZone: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedArea: string;
  estimatedImpact: string;
  immediateAction: string;
  additionalNotes: string;
  environmentalConditions: {
    temperature?: number;
    humidity?: number;
    lightLevel?: string;
    airflow?: string;
  };
  tags: string[];
}

export default function PhotoReportFlow({
  reportType,
  reportTypeConfig,
  facilityId,
  userId
}: PhotoReportFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<'location' | 'photo' | 'details' | 'review' | 'submitting' | 'complete'>('location');
  const [photos, setPhotos] = useState<{ blob: Blob; url: string; annotations: any[] }[]>([]);
  const [formData, setFormData] = useState<FormData>({
    roomZone: '',
    severity: 'medium',
    description: '',
    affectedArea: '',
    estimatedImpact: '',
    immediateAction: '',
    additionalNotes: '',
    environmentalConditions: {},
    tags: []
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const roomZones = [
    { id: 'veg-1', name: 'Veg Room 1', building: 'Building A' },
    { id: 'veg-2', name: 'Veg Room 2', building: 'Building A' },
    { id: 'flower-1', name: 'Flower Room 1', building: 'Building B' },
    { id: 'flower-2', name: 'Flower Room 2', building: 'Building B' },
    { id: 'dry-1', name: 'Drying Room 1', building: 'Building C' },
    { id: 'processing', name: 'Processing Area', building: 'Building C' },
    { id: 'storage', name: 'Storage', building: 'Building D' },
    { id: 'mechanical', name: 'Mechanical Room', building: 'Utility' }
  ];

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'red', icon: AlertTriangle, label: 'Critical - Immediate Action' };
      case 'high':
        return { color: 'orange', icon: AlertCircle, label: 'High - Within 24 Hours' };
      case 'medium':
        return { color: 'yellow', icon: Info, label: 'Medium - Within 48 Hours' };
      case 'low':
        return { color: 'green', icon: CheckCircle, label: 'Low - Schedule Convenient' };
      default:
        return { color: 'gray', icon: Info, label: 'Unknown' };
    }
  };

  const handlePhotoCapture = (blob: Blob, annotations: any[], metadata: any) => {
    const url = URL.createObjectURL(blob);
    setPhotos([...photos, { blob, url, annotations }]);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiAnalysis({
        confidence: 0.92,
        detectedIssues: ['Spider mites on lower leaves', 'Slight discoloration'],
        severity: 'high',
        estimatedCost: reportType === 'equipment' ? 450 : undefined,
        recommendedActions: [
          'Isolate affected plants immediately',
          'Apply neem oil treatment within 4 hours',
          'Increase inspection frequency to daily'
        ],
        riskAssessment: 'High risk of spread to adjacent plants if not treated within 24 hours'
      });
    }, 2000);
    
    setStep('details');
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // In production, implement actual voice recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Handle recording
        })
        .catch(err => console.error('Microphone access denied:', err));
    } else {
      // Stop recording and transcribe
      setIsRecording(false);
      // In production, send to speech-to-text API
      setTimeout(() => {
        setFormData({
          ...formData,
          description: formData.description + ' [Voice transcription would appear here]'
        });
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    setStep('submitting');
    
    try {
      // Upload photos and create report
      const reportData = {
        type: reportType,
        facilityId,
        userId,
        ...formData,
        photos: photos.map(p => ({
          url: p.url,
          annotations: p.annotations
        })),
        aiAnalysis,
        timestamp: new Date()
      };
      
      // In production, make API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep('complete');
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const suggestedTags = [
    'urgent', 'safety-hazard', 'pest-control', 'equipment-failure',
    'quality-issue', 'compliance', 'maintenance', 'cleaning-needed'
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <reportTypeConfig.icon className={`w-5 h-5 text-${reportTypeConfig.color}-400`} />
            <h1 className="text-lg font-semibold text-white">{reportTypeConfig.title}</h1>
          </div>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {['Location', 'Photo', 'Details', 'Review'].map((stepName, index) => {
              const stepKey = stepName.toLowerCase();
              const isActive = step === stepKey;
              const isComplete = ['location', 'photo', 'details', 'review'].indexOf(step) > index;
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`flex items-center gap-2 ${index > 0 ? 'ml-2' : ''}`}>
                    {index > 0 && (
                      <div className={`w-12 h-px ${isComplete ? 'bg-green-500' : 'bg-gray-700'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                      isComplete ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-purple-500 text-white' : 
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {isComplete ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className={`text-sm ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}>{stepName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4">
        {step === 'location' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Where is the issue?</h2>
              <p className="text-gray-400">Select the room or zone where you found the issue</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {roomZones.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => {
                    setFormData({ ...formData, roomZone: zone.name });
                    setStep('photo');
                  }}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{zone.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <Building className="w-3 h-3" />
                        {zone.building}
                      </p>
                    </div>
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
            
            <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors">
              Use Current GPS Location
            </button>
          </div>
        )}

        {step === 'photo' && (
          <EnhancedCameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setStep('location')}
            issueType={reportType}
            roomZone={formData.roomZone}
            facilityId={facilityId}
            guidelines={reportTypeConfig.guidelines}
            enableAnnotations={true}
            enableMultiPhoto={true}
            maxPhotos={5}
          />
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Provide Details</h2>
              <p className="text-gray-400">Help us understand the issue better</p>
            </div>

            {/* AI Analysis Preview */}
            {aiAnalysis && (
              <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-2">AI Analysis</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-500">Confidence:</span> {Math.round(aiAnalysis.confidence * 100)}%
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">Detected:</span> {aiAnalysis.detectedIssues.join(', ')}
                      </p>
                      {aiAnalysis.estimatedCost && (
                        <p className="text-gray-300 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Estimated cost: ${aiAnalysis.estimatedCost}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Severity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Severity Level</label>
              <div className="grid grid-cols-2 gap-3">
                {(['low', 'medium', 'high', 'critical'] as const).map(level => {
                  const config = getSeverityConfig(level);
                  return (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, severity: level })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.severity === level
                          ? `border-${config.color}-500 bg-${config.color}-500/20`
                          : 'border-gray-700 bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <config.icon className={`w-4 h-4 text-${config.color}-400`} />
                        <span className="text-sm font-medium text-white">{config.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you're seeing..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                  rows={4}
                />
                <button
                  onClick={handleVoiceRecord}
                  className={`absolute bottom-3 right-3 p-2 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Affected Area */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Affected Area
              </label>
              <input
                type="text"
                value={formData.affectedArea}
                onChange={(e) => setFormData({ ...formData, affectedArea: e.target.value })}
                placeholder="e.g., 10 plants, 3 trays, entire room"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (formData.tags.includes(tag)) {
                        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
                      } else {
                        setFormData({ ...formData, tags: [...formData.tags, tag] });
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Advanced Details
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-gray-800/50 rounded-lg">
                  {/* Environmental Conditions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Environmental Conditions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Temperature</label>
                        <div className="relative">
                          <ThermometerSun className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            placeholder="°F"
                            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            onChange={(e) => setFormData({
                              ...formData,
                              environmentalConditions: { ...formData.environmentalConditions, temperature: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Humidity</label>
                        <div className="relative">
                          <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            placeholder="%"
                            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            onChange={(e) => setFormData({
                              ...formData,
                              environmentalConditions: { ...formData.environmentalConditions, humidity: Number(e.target.value) }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Additional Notes</label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      placeholder="Any other relevant information..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('photo')}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={!formData.description}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Review Report</h2>
              <p className="text-gray-400">Confirm all details before submitting</p>
            </div>

            {/* Photos Preview */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Photos ({photos.length})</h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Details Summary */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Location</span>
                <span className="text-sm text-white">{formData.roomZone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Severity</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = getSeverityConfig(formData.severity);
                    return (
                      <>
                        <config.icon className={`w-4 h-4 text-${config.color}-400`} />
                        <span className={`text-sm text-${config.color}-400 capitalize`}>{formData.severity}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Description</span>
                <p className="text-sm text-white mt-1">{formData.description}</p>
              </div>
              {formData.affectedArea && (
                <div>
                  <span className="text-sm text-gray-400">Affected Area</span>
                  <p className="text-sm text-white mt-1">{formData.affectedArea}</p>
                </div>
              )}
              {formData.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400">Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-700 text-xs text-gray-300 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            {aiAnalysis && aiAnalysis.recommendedActions && (
              <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  AI Recommendations
                </h3>
                <ul className="space-y-1">
                  {aiAnalysis.recommendedActions.map((action: string, index: number) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Edit Details
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </div>
        )}

        {step === 'submitting' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Submitting Report</h2>
            <p className="text-gray-400">Processing photos and analysis...</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Report Submitted!</h2>
            <p className="text-gray-400 mb-6">Your report has been sent to the management team</p>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-1">Report ID</p>
              <p className="font-mono text-white">#RPT-{Date.now().toString().slice(-6)}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setStep('location');
                  setPhotos([]);
                  setFormData({
                    roomZone: '',
                    severity: 'medium',
                    description: '',
                    affectedArea: '',
                    estimatedImpact: '',
                    immediateAction: '',
                    additionalNotes: '',
                    environmentalConditions: {},
                    tags: []
                  });
                  setAiAnalysis(null);
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}